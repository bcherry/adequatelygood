The module pattern is a common JavaScript coding pattern.  It's generally well understood, but there are a number of advanced uses that have not gotten a lot of attention.  In this article, I'll review the basics and cover some truly remarkable advanced topics, including one which I think is original.

## The Basics

We'll start out with a simple overview of the module pattern, which has been well-known since Eric Miraglia (of YUI) first [blogged about it](http://yuiblog.com/blog/2007/06/12/module-pattern/) three years ago.  If you're already familiar with the module pattern, feel free to skip ahead to "Advanced Patterns".

### Anonymous Closures

This is the fundamental construct that makes it all possible, and really is the single __best feature of JavaScript__.  We'll simply create an anonymous function, and execute it immediately.  All of the code that runs inside the function lives in a __closure__, which provides __privacy__ and __state__ throughout the lifetime of our application.

	@@@js
	(function () {
		// ... all vars and functions are in this scope only
		// still maintains access to all globals
	}());

Notice the `{@class=js inline}()` around the anonymous function.  This is required by the language, since statements that begin with the token `{@class=js inline}function` are always considered to be __function declarations__.  Including `{@class=js inline}()` creates a __function expression__ instead.

### Global Import

JavaScript has a feature known as __implied globals__.  Whenever a name is used, the interpreter walks the scope chain backwards looking for a `{@class=js inline}var` statement for that name.  If none is found, that variable is assumed to be global.  If it's used in an assignment, the global is created if it doesn't already exist.  This means that using or creating global variables in an anonymous closure is easy.  Unfortunately, this leads to hard-to-manage code, as it's not obvious (to humans) which variables are global in a given file.

Luckily, our anonymous function provides an easy alternative.  By passing globals as parameters to our anonymous function, we __import__ them into our code, which is both __clearer__ and __faster__ than implied globals.  Here's an example:
	
	@@@js
	(function ($, YAHOO) {
		// now have access to globals jQuery (as $) and YAHOO in this code
	}(jQuery, YAHOO));

### Module Export

Sometimes you don't just want to _use_ globals, but you want to _declare_ them.  We can easily do this by exporting them, using the anonymous function's __return value__.  Doing so will complete the basic module pattern, so here's a complete example:

	@@@js
	var MODULE = (function () {
		var my = {},
			privateVariable = 1;
	
		function privateMethod() {
			// ...
		}
	
		my.moduleProperty = 1;
		my.moduleMethod = function () {
			// ...
		};
	
		return my;
	}());

Notice that we've declared a global module named `{@class=js inline}MODULE`, with two public properties: a method named `{@class=js inline}MODULE.moduleMethod` and a variable named `{@class=js inline}MODULE.moduleProperty`.  In addition, it maintains __private internal state__ using the closure of the anonymous function.  Also, we can easily import needed globals, using the pattern we learned above.

## Advanced Patterns

While the above is enough for many uses, we can take this pattern farther and create some very powerful, extensible constructs.  Lets work through them one-by-one, continuing with our module named `{@class=js inline}MODULE`.

### Augmentation

One limitation of the module pattern so far is that the entire module must be in one file.  Anyone who has worked in a large code-base understands the value of splitting among multiple files.  Luckily, we have a nice solution to __augment modules__.  First, we import the module, then we add properties, then we export it.  Here's an example, augmenting our `{@class=js inline}MODULE` from above:

	@@@js
	var MODULE = (function (my) {
		my.anotherMethod = function () {
			// added method...
		};

		return my;
	}(MODULE));

We use the `{@class=js inline}var` keyword again for consistency, even though it's not necessary.  After this code has run, our module will have gained a new public method named `{@class=js inline}MODULE.anotherMethod`.  This augmentation file will also maintain its own private internal state and imports.

### Loose Augmentation

While our example above requires our initial module creation to be first, and the augmentation to happen second, that isn't always necessary.  One of the best things a JavaScript application can do for performance is to load scripts asynchronously.  We can create flexible multi-part modules that can load themselves in any order with __loose augmentation__.  Each file should have the following structure:
	
	@@@js
	var MODULE = (function (my) {
		// add capabilities...
	
		return my;
	}(MODULE || {}));

In this pattern, the `{@class=js inline}var` statement is always necessary.  Note that the import will create the module if it does not already exist.  This means you can use a tool like [LABjs](http://labjs.com/) and load all of your module files in parallel, without needing to block.</a>

### Tight Augmentation

While loose augmentation is great, it does place some limitations on your module.  Most importantly, you cannot override module properties safely.  You also cannot use module properties from other files during initialization (but you can at run-time after intialization).  __Tight augmentation__ implies a set loading order, but allows __overrides__.  Here is a simple example (augmenting our original `{@class=js inline}MODULE`):

	@@@js
	var MODULE = (function (my) {
		var old_moduleMethod = my.moduleMethod;
	
		my.moduleMethod = function () {
			// method override, has access to old through old_moduleMethod...
		};
	
		return my;
	}(MODULE));

Here we've overridden `{@class=js inline}MODULE.moduleMethod`, but maintain a reference to the original method, if needed.

### Cloning and Inheritance

	@@@js
	var MODULE_TWO = (function (old) {
		var my = {},
			key;
	
		for (key in old) {
			if (old.hasOwnProperty(key)) {
				my[key] = old[key];
			}
		}
	
		var super_moduleMethod = old.moduleMethod;
		my.moduleMethod = function () {
			// override method on the clone, access to super through super_moduleMethod
		};
	
		return my;
	}(MODULE));

This pattern is perhaps the __least flexible__ option.  It does allow some neat compositions, but that comes at the expense of flexibility.  As I've written it, properties which are objects or functions will _not_ be duplicated, they will exist as one object with two references.  Changing one will change the other.  This could be fixed for objects with a recursive cloning process, but probably cannot be fixed for functions, except perhaps with `{@class=js inline}eval`.  Nevertheless, I've included it for completeness.

### Cross-File Private State

One severe limitation of splitting a module across multiple files is that each file maintains its own private state, and does not get access to the private state of the other files.  This can be fixed.  Here is an example of a loosely augmented module that will __maintain private state__ across all augmentations:

	@@@js
	var MODULE = (function (my) {
		var _private = my._private = my._private || {},
			_seal = my._seal = my._seal || function () {
				delete my._private;
				delete my._seal;
				delete my._unseal;
			},
			_unseal = my._unseal = my._unseal || function () {
				my._private = _private;
				my._seal = _seal;
				my._unseal = _unseal;
			};
	
		// permanent access to _private, _seal, and _unseal
	
		return my;
	}(MODULE || {}));

Any file can set properties on their local variable `{@class=js inline}_private`, and it will be immediately available to the others.  Once this module has loaded completely, the application should call `{@class=js inline}MODULE._seal()`, which will prevent external access to the internal `{@class=js inline}_private`.  If this module were to be augmented again, further in the application's lifetime, one of the internal methods, in any file, can call `{@class=js inline}_unseal()` before loading the new file, and call `{@class=js inline}_seal()` again after it has been executed.
This pattern occurred to me today while I was at work, I have not seen this elsewhere.  I think this is a very useful pattern, and would have been worth writing about all on its own.
	
### Sub-modules

Our final advanced pattern is actually the simplest.  There are many good cases for creating sub-modules.  It is just like creating regular modules:

	@@@js
	MODULE.sub = (function () {
		var my = {};
		// ...
	
		return my;
	}());

While this may have been obvious, I thought it worth including.  Sub-modules have all the advanced capabilities of normal modules, including augmentation and private state.

## Conclusions

Most of the advanced patterns can be combined with each other to create more useful patterns.  If I had to advocate a route to take in designing a complex application, I'd combine __loose augmentation__, __private state__, and __sub-modules__.

I haven't touched on performance here at all, but I'd like to put in one quick note:  The module pattern is __good for performance__.  It minifies really well, which makes downloading the code faster.  Using __loose augmentation__ allows easy non-blocking parallel downloads, which also speeds up download speeds.  Initialization time is probably a bit slower than other methods, but worth the trade-off.  Run-time performance should suffer no penalties so long as globals are imported correctly, and will probably gain speed in sub-modules by shortening the reference chain with local variables.

To close, here's an example of a sub-module that loads itself dynamically to its parent (creating it if it does not exist).  I've left out private state for brevity, but including it would be simple.  This code pattern allows an entire complex heirarchical code-base to be loaded completely in parallel with itself, sub-modules and all.

	@@@js
	var UTIL = (function (parent, $) {
		var my = parent.ajax = parent.ajax || {};

		my.get = function (url, params, callback) {
			// ok, so I'm cheating a bit :)
			return $.getJSON(url, params, callback);
		};

		// etc...

		return parent;
	}(UTIL || {}, jQuery));

I hope this has been useful, and please leave a comment to share your thoughts.  Now, go forth and write better, more modular JavaScript!

___This post was [featured on Ajaxian.com](http://ajaxian.com/archives/a-deep-dive-and-analysis-of-the-javascript-module-pattern), and there is a little bit more discussion going on there as well, which is worth reading in addition to the comments below.___
