Like most object-oriented programming languages, JavaScript provides built-in ways to convert between objects and primitive values, by way of the special `toString` and `valueOf` methods.  This article will cover the basics of these methods, but then dive into the details of how this stuff really works, bad stuff, performance, and browser support.

### Types and Primitives

To understand this article, you'll need to understand the difference between __primitive and non-primitive values__ in JavaScript.  There are 5 primitive types, which are associated with the various primitive values.

 * __Null__: The value `null`.
 * __Undefined__: The value `undefined`.
 * __Number__: All numbers, such as `0` and `3.14`.  Also `NaN`, and `Infinity`.
 * __Boolean__: The values `true` and `false`.
 * __String__: All strings, such as `"foo"` and `""`.

All other values are non-primitive, including arrays, functions, and plain old objects.  For completeness, here are the results of the `typeof` operator, applied to these values:

	
	typeof null; // "object"
	typeof undefined; // "undefined"
	typeof 0; // "number" (`typeof NaN` is also "number")
	typeof true; // "boolean"
	typeof "foo"; // "string"
	typeof {}; // "object"
	typeof function () {}; // "function"
	typeof []; // "object"

<span class="note">__Note__: `typeof null` should _not_ be `"object"`.  This is a mistake from the first versions of JavaScript, but it's really too late to fix.  A more sensible type would have been `"null"`, but this is what we're stuck with.</span>

If you've got that down, then we're ready to move on to the basics of `toString` and `valueOf`.  If you're already familiar with the basics, feel free to skip ahead to "How it Works".

## Basic Usage

We'll be using a simple example `population` object that holds a country name and a population.  Lets code that up.

	
	function population(country, pop) {
		return {
			country: country,
			pop: pop
		};
	}
	
	var america_pop = population("USA", 350e6);
	var mexico_pop = population("Mexico", 200e6);
	var canada_pop = population("Canada", 200e6);
	
	alert(america_pop); // [object Object]
	
	var north_america_pop = america_pop + mexico_pop + canada_pop;
	
	alert(north_america_pop); // [object Object][object Object][object Object]
	
This works, but the calls to `alert` are not very useful.  What we'd really like is for the first `alert` to show `'[Population "USA" 350000000]'` and the second to show `"750000000"`.  So, let's code that up next.

### toString

All objects inherit the method `toString` from `Object.prototype`, which returns `"[object Object]"`.  However, we can easily override this by providing `toString` as a method of our object, or its prototype.  In this example, we'll attach it directly to each instance, but feel free to use the prototype instead.

	
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

<span class="note">__Note__: I'm using __closure__ on the `country` parameter, rather than using `this.country`.  This only works due to how the constructor is set up.  If you placed `toString` on the prototype, you would need to use `this.country`.</span>

### valueOf

All JavaScript objects also inherit the method `valueOf` from `Object.prototype`.  By default, this method simply returns the object itself, but is generally overridden to convert an object to a `Number`, or another primitive value, so it can be used by operators like `+`.  We can do the same thing as above to complete our basic example.

	
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

As with most things in JavaScript, the process by which `toString` gets called is not as simple as you'd think.  Let's explore what happens when `alert(america_pop)` is called. 

 1. `alert` calls `GetValue` on the reference.  This returns the object it points at.
 2. `alert` calls `ToString` on the value (this is _not_ the same as the object's `toString`)
 3. `ToString` calls `ToPrimitive` on the value, passing the _hint_ `String`.
 4. `ToPrimitive` calls the object's internal `[[DefaultValue]]` method with the _hint_ `String`.
 5. `[[DefaultValue]]` calls the `toString` property of the object, with the object as `this`.
 6. The result of `toString` is a primitive value, so it is returned, all the way up the chain to the `ToString` method.
 7. Since the result is of type `String`, `ToString` returns all the way to `alert`.
 8. `alert` displays the value.

While this is a lot, it's pretty straightforward.  However, he key mechanism that needs more explaining is the `ToPrimitive` function.  This function is used to take an arbitrary value and get a corresponding primitive value instead.  If the input is already a primitive value then the value will be returned without conversion.  However, if the value is non-primitive, then it will call the internal `[[DefaultValue]]` method to find a __default value__ for the object.

`[[DefaultValue]]` is an internal property of every object.  It's a method that takes an optional _hint_, which should be either `Number` or `String`.  If a _hint_ is not provided, it will default to `Number` unless the object is a `Date`, in which case it defaults to `String` (this is silly).  After this has been figured out, it will call `toString` and `valueOf`, in order, to find a primitive value.  This is where the _hint_ comes into play.  If the _hint_ is `Number`, then `valueOf` will be tried first, but if it's `String` then `toString` will be tried first.  Here's the ensuing process:

 1. If the first method exists, and is callable, call it and get the result, otherwise skip to 3.
 2. If the result of 1 is a primitive, return it.
 3. If the second method exists, and is callable, call it and get the result, otherwise skip to 5.
 4. If the result of 3 is a primitive, return it.
 5. Throw a `TypeError` exception.

The value that is returned by `[[DefaultValue]]` is guaranteed to be primitive.  If it was not, a `TypeError` would have been thrown.  This also implies that `toString` and `valueOf` should return primitives on order to be useful in this context.

### Confusion About the + Operator

Here's an example with a (possibly) unexpected result:

	
	var foo = {
		toString: function () {
			return "foo";
		},
		valueOf: function () {
			return 5;
		}
	};
	
	alert(foo + "bar"); // 5bar
	alert([foo, "bar"].join("")); // foobar

In this context, we're using the `+` operator to do string concatenation.  But, `foo` was _not_ converted to a string using `toString`, it was turned into a number using `valueOf`, then used for string concatenation.  This probably isn't what we want, but it is how it works.  It's a side-effect of the overloading of the `+` operator for arithmetic and string concatenation.  The `+`operator has a well-defined process:

 1. Evaluate the left-hand side, and get the value.
 2. Evaluate the right-hand side, and get the value.
 3. Call `ToPrimitive` on both the left-hand and right-hand sides (without a _hint_)
 4. If either primitive value is a `String`, then skip to 7.
 5. Call `ToNumber` on both values.
 6. Return the sum of the values.
 7. Call `ToString` on both values.
 8. Return the concatenation of both values.

Since no _hint_ is passed to the `ToPrimitive` calls, the _hint_ will be defaulted to `Number` (unless it's a `Date`, which defaults to `String`).  This means that our `valueOf` function will be called, instead of `toString`.  It's not until _after_ the primitive values are retrieved that the interpreter decides whether it is going to do string concatenation or arithmetic.  That's why our example above returns `"5bar"` instead of `"foobar"`.

### Bad Stuff

There is one really bad feature of all this, which is that `ToPrimitive` does not enforce any type-checking on the return values, other than that they are primitive.  This means you can write code like this:

	
	var foo = {
		toString: function () {
			return 5;
		},
		valueOf: function () {
			return "foo";
		}
	};
	alert(foo.toString() + 1); // 6 (bad!)
	alert(foo + 1); // "foo1" (no good!)
	alert(+foo); // NaN (the worst!)

The `valueOf` method can be forgiven for not type-checking, because it is more generic.  You'd expect it to be able to return any suitable primitive value.  However, the `toString` method has _no such excuse_.  This is simply a bad feature.  You can, of course, mitigate by using `String(foo)` instead of `foo.toString()`, which will call `toString` and then convert that result to a string.  But you should not have to do this, or worry about this.  Please do not make objects with `toString` methods that do not return strings.

## How About Performance?

After understanding the complexity that goes into these implicit conversion, I got curious about how that affects performance.  So I decided to test the time it takes to perform an `[].join(obj)` over 1,000,000 iterations in the major browsers.  I did one test with the object being implicitly cast to a string, and one where I called the `toString` method manually (i.e. `[].join(obj.toString())`).  As expected, the explicit call was faster in most cases.

 * __Firefox 3.6.2__: 874ms vs. 320ms - __almost 3x faster__.
 * __Chrome 5__: 94ms vs. 47ms - __2x faster__.
 * __Opera 10.50__: 155ms vs 182ms - __a little slower__.
 * __Safari 4__: 409ms vs 280ms - __almost 2x faster__.
 * __Internet Explorer 8__: 2856ms vs 2786ms - __about the same__.
 * __Internet Explorer 9__ (preview): 645ms vs 633ms - __about the same__.

<span class="note">___Note 1___: The Firefox, Chrome, Opera, and Safari tests were all run on a Macbook Pro running OS X 10.5.  The IE tests were run on a desktop running Windows 7.  [Run the tests yourself here.](http://www.bcherry.net/playground/defaultvalues)</span>

<span class="note">___Note 2___: I chose to use the `[].join` method because doing so was most likely to avoid any dead-code elimination optimizations in modern browsers.  I've had trouble with this before, in Firefox.  I _did_ try testing with the `String()` constructor, with similar results in most browsers.  Opera was an exception where using the explicit `toString` was close to __5x faster__.  In Firefox, the explicit cast was a bit faster, but both cases were about 100x faster than the `[].join` method (and other browsers), which means the code-path was probably being removed by the dead code eliminator.</span>

The takeaway from this performance test is that it's always best to call your object's type-conversion methods directly, rather than relying on the interpreter to do the complex series of method calls and comparisons needed to do it automatically.  The Opera 10.50 result is very strange, but it's not particularly slower, so I wouldn't worry about it.  The gains made in other browsers more than make up for the outlier Opera result.

## How About Browser Support?

Like many things in the ECMAScript specification, these processes are complex, and I doubted that all browsers would implement them exactly as specified.  So, in that [test suite from earlier](http://www.bcherry.net/playground/defaultvalues), I added compliance checks.  I was quite surprised to see that all major browsers, including versions of Internet Explorer going back to at least IE 5.5, implement these mechanisms correctly.  This is even the case with the awkward handling when developers do things like make `toString` return a number instead of a string.  All browsers handle the code according to the specification.  This is great news.

But the specification unhelpfully introduced ambiguity in one particular area: the absence of a _hint_ for the `ToPrimitive` function.  Here's the exact wording:

> All native ECMAScript objects except Date objects handle the absence of a hint as if the hint Number were given; Date objects handle the absence of a hint as if the hint String were given. Host objects may handle the absence of a hint in some other manner.

That the standard explicitly allows browsers to deviate here worried me.  Included in that test suite was a check that, in the absence of a _hint_, `Date` objects will default to `String` and `Boolean` objects will default to `Number`.  All browsers passed this check as well, which means that browser support for all of this functionality seems to be __consistent__ and __correct__.

## Conclusions

I hope this was useful in understanding how these mechanisms work in JavaScript.  There are three important things to take away from this article:

 1. Implement `toString` and `valueOf` on your commonly-reused objects.  They can help you write clearer, more concise code, and make debugging easier too.
 2. All browsers implement object-to-primitive conversion according to the specification, so you can safely consult it for more detail.
 3. When performance is important, always try to call your type-conversion methods directly, instead of relying on JavaScript's implicit calls.

You can find the [test suite used for this article here](http://www.bcherry.net/playground/defaultvalues) if you're interested in trying to replicate my results.  Please let me know if you find contradictory results to what I posted here.

Thanks for reading! If you have questions or feedback then leave a comment below or contact me directly.