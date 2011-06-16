The engineering culture at Twitter requires tests.	Lots of tests.	I haven't had formal experience with JavaScript testing before Twitter, so I've been learning a lot as I go.	In particular, a number of patterns I used to use, write about, and encourage have turned out to be bad for writing testable code.	So I thought it would be worthwhile to share a few of the most important principles I've developed for writing testable JavaScript.	 The examples I provide are based on [QUnit](http://docs.jquery.com/QUnit), but should be just as applicable to any JavaScript testing framework.

## Avoid Singletons

One of my most popular posts was about using [JavaScript Module Pattern](http://www.adequatelygood.com/2010/3/JavaScript-Module-Pattern-In-Depth) to create powerful __singletons__ in your application.	This approach can be simple and useful, but it creates problems for testing, for one simple reason: ___singletons suffer state pollution between tests___.	Rather than creating your singletons as modules, you should compose them as constructable objects, and assign a single, default instance at the global level in your application init.

For example, consider the following singleton module (contrived example, of course):

	@@@js
	var dataStore = (function() {
		var data = [];
		return {
			push: function (item) {
				data.push(item);
			},
			pop: function() {
				return data.pop();
			},
			length: function() {
				return data.length;
			}
		};
	}());

With this module, we may wish to test the `{@class=js}foo.bar` method.	 Here's a simple QUnit test suite:

	@@@js
	module("dataStore");
	test("pop", function() {
		dataStore.push("foo");
		dataStore.push("bar")
		equal(dataStore.pop(), "bar", "popping returns the most-recently pushed item");
	});

	test("length", function() {
		dataStore.push("foo");
		equal(dataStore.length(), 1, "adding 1 item makes the length 1");
	});

When running this test suite, the assertion in the `{@class=js}length` test will fail, but it's not clear from looking at it why it should.	The problem is that state has been left in `{@class=js}dataStore` from the previous test.	Merely re-ordering these tests will cause the `{@class=js}length` test to pass, which is a clear red flag that something is wrong.	 We could fix this with setup or teardown that reverts the state of `{@class=js}dataStore`, but that means that we need to constantly maintain our test boilerplate as we make implementation changes in the `{@class=js}dataStore` module.	 A better approach is the following:

	@@@js
	function newDataStore() {
		var data = [];
		return {
			push: function (item) {
				data.push(item);
			},
			pop: function() {
				return data.pop();
			},
			length: function() {
				return data.length;
			}
		};
	}

	var dataStore = newDataStore();

Now, your test suite will look like this:

	@@@js
	module("dataStore");
	test("pop", function() {
		var dataStore = newDataStore();
		dataStore.push("foo");
		dataStore.push("bar")
		equal(dataStore.pop(), "bar", "popping returns the most-recently pushed item");
	});

	test("length", function() {
		var dataStore = newDataStore();
		dataStore.push("foo");
		equal(dataStore.length(), 1, "adding 1 item makes the length 1");
	});

This allows our global `{@class=js}dataStore` to behave exactly as it did before, while allowing our tests to avoid polluting each other.	Each test owns its own instance of a `{@class=js}DataStore` object, which will be garbage collected when the test completes.

## Avoid Closure-based Privacy

Another pattern I used to promote is [real private members in JavaScript](http://www.crockford.com/javascript/private.html).	The advantage is that you can keep globally-accessible namespaces free of unnecessary references to private implementation details.	 However, overuse of this pattern can lead to untestable code.	This is because ___your test suite cannot access, and thus cannot test, private functions hidden in closures___.	Consider the following:

	@@@js
	function Templater() {
		function supplant(str, params) {
			for (var prop in params) {
				str.split("{" + prop +"}").join(params[prop]);
			}
			return str;
		}

		var templates = {};

		this.defineTemplate = function(name, template) {
			templates[name] = template;
		};

		this.render = function(name, params) {
			if (typeof templates[name] !== "string") {
				throw "Template " + name + " not found!";
			}

			return supplant(templates[name], params);
		};
	}

The crucial method for our `{@class=js}Templater` object is `{@class=js}supplant`, but we cannot access it from outside the closure of the constructor.	 Thus, a testing suite like QUnit cannot hope to verify that it works as intended.	In addition, we cannot verify that our `{@class=js}defineTemplate` method does anything without trying a `{@class=js}.render()`{@class=js} call on the template and watching for an exception.	 We could simply add a `{@class=js}getTemplate()`{@class=js} method, but then we'd be adding methods to the public interface solely to allow testing, which is not a good approach.	 While the issues here are probably just fine in this simple example, building complex objects with important private methods will lead to relying on untestable code, which is a red flag.	 Here's a testable version of the above:

	@@@js
	function Templater() {
		this._templates = {};
	}

	Templater.prototype = {
		_supplant: function(str, params) {
			for (var prop in params) {
				str.split("{" + prop +"}").join(params[prop]);
			}
			return str;
		},
		render: function(name, params) {
			if (typeof this._templates[name] !== "string") {
				throw "Template " + name + " not found!";
			}

			return this._supplant(this._templates[name], params);
		},
		defineTemplate: function(name, template) {
			this._templates[name] = template;
		}
	};

And here's a QUnit test suite for it:

	@@@js
	module("Templater");
	test("_supplant", function() {
		var templater = new Templater();
		equal(templater._supplant("{foo}", {foo: "bar"}), "bar"))
		equal(templater._supplant("foo {bar}", {bar: "baz"}), "foo baz"));
	});

	test("defineTemplate", function() {
		var templater = new Templater();
		templater.defineTemplate("foo", "{foo}");
		equal(template._templates.foo, "{foo}");
	});

	test("render", function() {
		var templater = new Templater();
		templater.defineTemplate("hello", "hello {world}!");
		equal(templater.render("hello", {world: "internet"}), "hello internet!");
	});

Notice that our test for `{@class=js}render` is really just a test that `{@class=js}defineTemplate` and `{@class=js}supplant` integrate correctly with each other.	 We've already tested those methods in isolation, which will allow us to easily discover which components are really breaking when tests of the `{@class=js}render` method fail.

## Write Tight Functions

Tight functions are important in any language, but JavaScript presents its own reasons to do so.	Much of what you do with JavaScript is done against global singletons provided by the environment, and which your test suite relies on.	 For instance, testing a URL re-writer will be difficult if all of your methods try to assign `{@class=js}window.location`.	Instead, you should ___break your system into its logical components that decide what to do, then write short functions that actually do it___.	 You can test the logical functions with various inputs and outputs, and leave the final function that modifies `{@class=js}window.location` untested.	 Provided you've composed your system correctly, this should be safe.

Here's an example URL rewriter that is not testable:

	@@@js
	function redirectTo(url) {
		if (url.charAt(0) === "#") {
			window.location.hash = url;
		} else if (url.charAt(0) === "/") {
			window.location.pathname = url;
		} else {
			window.location.href = url;
		}
	}

The logic in this example is relatively simple, but we can imagine a more complex redirecter.	 As complexity grows, we will not be able to test this method without causing the window to redirect, thus leaving our test suite entirely.

Here's a testable version:

	@@@js
	function _getRedirectPart(url) {
		if (url.charAt(0) === "#") {
			return "hash";
		} else if (url.charAt(0) === "/") {
			return "pathname";
		} else {
			return "href";
		}
	}

	function redirectTo(url) {
		window.location[_getRedirectPart(url)] = url;
	}

And now we can write a simple test suite for `{@class=js}_getRedirectPart`:

	@@@js
	test("_getRedirectPart", function() {
		equal(_getRedirectPart("#foo"), "hash");
		equal(_getRedirectPart("/foo"), "pathname");
		equal(_getRedirectPart("http://foo.com"), "href");
	});

Now the meat of `{@class=js}redirectTo` has been tested, and we don't have to worry about accidentally redirecting out of our test suite.

<span class="note">__Note__: There is an alternative solution, which is to create a `{@class=js}performRedirect` function that does the location change, but stub that out in your test suite.	 This is a common practice for many, but I've been trying to avoid method stubbing.	 I find basic QUnit to work well in all situations I've found so far, and would prefer to not have to remember to stub out a method like that for my tests, but your case may differ.</span>

## Write Lots of Tests

This is a no-brainer, but it's important to remember.	 Many programmers write too few tests because writing tests is hard, or lots of work.	 I suffer from this problem all the time, so I threw together a little helper for QUnit that makes writing lots of tests a lot easier.	It's a function called `{@class=js}testCases` which you call within a `{@class=js}test` block, passing a function, calling context, and array of inputs/outputs to try and compare.	 You can quickly build up a robust suite for your input/output functions for rigorous testing.

	@@@js
	function testCases(fn, context, tests) {
		for (var i = 0; i < tests.length; i++) {
			same(fn.apply(context, tests[i][0]), tests[i][1],
				tests[i][2] || JSON.stringify(tests[i]));
		}
	}

And here's a simple example use:

	@@@js
	test("foo", function() {
		testCases(foo, null, [
			[["bar", "baz"], "barbaz"],
			[["bar", "bar"], "barbar", "a passing test"]
		]);
	});


## Conclusions

There is plenty more to write about testable JavaScript, and I'm sure there are many good books, but I hope this was a good overview of practical cases I encounter on a daily basis.	 I'm by no means a testing expert, so please let me know if I've made mistakes or given bad advice.
