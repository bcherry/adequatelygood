Most object-oriented programming languages provide ways to make your objects play nice with built-in functions and operators.  This usually is accomplished by providing ways to turn your object into a string representation, for example.  JavaScript doesn't provide the most capabilities in this department, but it does let you do the majority of what you'd like to do.  This article will walk you through the basic usage of JavaScript's `toString` and `valueOf` functions, and round it off with some advanced cases, some edge cases, and browser support.

## Basic Usage

We'll be using a simple example of `population` object that holds a country name, and an integer population.  Here's how our example starts out (notice that it doesn't do what we want, yet):

	@@@js
	function population(country, pop) {
		return {
			country: country,
			pop: pop
		};
	}
	
	var america_pop = population("USA", 350e6);
	var mexico_pop = population("Mexico", 200e6);
	var canada_pop = population("Canada", 200e6);
	
	alert(america_pop); // [Object object]
	
	var north_america_pop = america_pop + mexico_pop + canada_pop;
	
	alert(north_america_pop); // [Object object][Object object][Object object]
	
What we really want here is the first `{@class=js}alert` to show `[Population "USA" 350000000]` and the second to show `750000000`.  Luckily, JavaScript _does_ provide a handy way of accomplishing this.  

### `toString`

All objects inherit the property `toString` from `Object.prototype`, which returns `[Object object]`.  However, we can easily override this by providing it as a method of our object, or its prototype.

	@@@js
	function population(country, pop) {
		return {
			country: country,
			pop: pop,
			
			toString: function () {
				return "[Population " + 
					"\"" + country + "\" " +
					pop +
				"]";
			}
		}
	}
	
	var america_pop = population("USA", 350e6);
	alert(america_pop); // [Population "USA" 350000000]

<span class="note">Note that I'm using __closure__ on the `country` parameter, rather than using `{@class=js}this.country`.  This only works due to how the constructor is set up.  If you placed `toString` on the prototype, you would need to use `{@class=js}this.country`.</span>

### `valueOf`

So that gets us through the first `alert`, but we still need to make the second one work.  All JavaScript objects also inherit the method `valueOf` from `Object.prototype`.  This method is generally used to convert an object to a `Number`, which the `+` operator will do (more on that later).  We can do the same thing as above to complete our basic example.

	@@@js
	function population(country, pop) {
		return {
			country: country,
			pop: pop,
			
			toString: function () {
				return "[Population " + 
					"\"" + country + "\" " +
					pop +
				"]";
			},
			
			valueOf: function () {
				return pop;
			}
		};
	}

	var america_pop = population("USA", 350e6);
	var mexico_pop = population("Mexico", 200e6);
	var canada_pop = population("Canada", 200e6);

	alert(america_pop); // [Population "USA" 350000000

	var north_america_pop = america_pop + mexico_pop + canada_pop;

	alert(north_america_pop); // 750000000

Here we've defined the `valueOf` function of our `population` object to return the population, which should be a `Number`.

## How It Works

The JavaScript interpreter does not start by calling the `toString` and `valueOf` functions directly.  There is actually a complex process that goes on.  Let's explore how the `alert` function turns our objects into strings:

 1. `{@class=js}alert` calls `{@class=js}GetValue` on the reference.  This returns the object it points at.
 2. `{@class=js}alert` calls `{@class=js}ToString` on the value (this is _not_ the same as the object's `{@class=js}toString`)
 3. `{@class=js}ToString` calls `{@class=js}ToPrimitive` on the value, passing the _hint_ `{@class=js}String`.
 4. `{@class=js}ToPrimitive` calls the object's internal `{@class=js}[[DefaultValue]]` method with the _hint_ `{@class=js}String`.
 5. `{@class=js}[[DefaultValue]]` calls the `{@class=js}toString` property of the object, with the object as `{@class=js}this`.
 6. The result of `{@class=js}toString` is a primitive value, so it is returned, all the way up the chain to the `{@class=js}ToString` method.
 7. Since the result is of type `{@class=js}String`, `{@class=js}ToString` returns all the way to `{@class=js}alert`.
 8. `{@class=js}alert` displays the value.

Wow, that's a lot of work just to get the string representation of this object!  The key mechanism that needs explaining is the `ToPrimitive` function.  This function is used to take a value and get a primitive value instead.  If the input is already a primitive value, that is `{@class=js}String`, `{@class=js}Undefined`, `{@class=js}Null`, `{@class=js}Boolean`, or `{@class=js}Number`, then the value will be returned without conversion.  However, if the value is an `{@class=js}Object`, then it will dive into the `[[DefaultValue]]` method to find a _default value_ for the object.

`[[DefaultValue]]` is not all that complex.  It takes an optional _hint_, which should be either `{@class=js}Number` or `{@class=js}String`.  If a _hint_ is not provided, it will default to `{@class=js}Number` unless the object is a `{@class=js}Date`, in which case it defaults to `{@class=js}String` (this is silly).  After this has been figured out, it will call `toString` and `valueOf`, in order, to find a primitive value.  This is where the _hint_ comes into play.  If the _hint_ is `{@class=js}Number`, then `valueOf` will be tried first, if it's `{@class=js}String` then `toString` will be.  Here's the process:

 1. If the first method exists, and is callable, call it and get the result, otherwise skip to 3.
 2. If the result of 1 is a primitive, return it.
 3. If the second method exists, and is callable, call it and get the result, otherwise skip to 5.
 4. If the result of 3 is a primitive, return it.
 5. Throw a `TypeError` exception.

That might seem complex, and it is, but it should only take a few read-throughs to get it down.  I think I've presented it in a much clearer way then the specification.

### Implications



### How About Performance?

I tested the time it takes to perform an `{@class=js}[].join(obj)` over 1,000,000 iterations in the major browsers.  I did one test with the object being implicitly cast to a string, and one where I called the `toString` method manually (i.e. `{@class=js}[].join(obj.toString())`).  As expected, the explicit call was faster in most cases.

 * __Firefox 3.6.2__: 874ms vs. 320ms - __almost 3x faster__.
 * __Chrome 5__: 94ms vs. 47ms - __2x faster__.
 * __Opera 10.50__: 155ms vs 182ms - __a little slower__.
 * __Safari 4__: 409ms vs 280ms - __almost 2x faster__.

<span class="note">Except Internet Explorer, these tests were all run on a Macbook Pro running OS X 10.5.  The IE tests were run on a desktop running Windows 7.</span>

The takeaway from this performance test is that it's always best to call your object's type-conversion methods directly, rather than relying on the interpreter to do the complex series of method calls and comparisons needed to do it automatically.  The Opera 10.50 result is very strange, but it's not particularly slower, so I wouldn't worry about it.  The gains made in other browsers more than make up for the outlier Opera result.

### How About Browser Support?

After reading the ECMAScript specification, and seeing all of the levels of complexity that go into generating these values, I doubted that all browsers would implement them correctly.  So I whipped up a test suite, and was quite surprised to see that all major browsers, including versions of Internet Explorer going back to at least IE 5.5 implement these mechanisms correctly.  This is even the case with the awkward handling when developers do things like make `toString` return a primitive other than a string.  All browsers handle the code correctly.  This is great news.

## Conclusions

I hope this was useful in understanding how these mechanisms work in JavaScript.  If I had to list the main things you should take away from this article, here they are:

 1. Implement these methods on your commonly-reused objects.  They can help you write clearer, more concise code, and make debugging easier too.
 2. All browsers implement this behavior according to the specification, so always consult it for questions.
 3. Always try to call type-conversion methods directly, instead of relying on the complex process.

You can find the [test suite used for this article here](http://www.bcherry.net/playground/defaultvalues) if you're interested in trying to replicate my results.  Please let me know if you find contradictory results to what I posted here!