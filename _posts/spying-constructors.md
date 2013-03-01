When writing unit-tests for code, a common technique is __spying__, where you set expectations on a method's invocation, run some code, and verify that the method was invoked as expected.  This is pretty straightforward.  Here's a simple example using [JsMockito](http://jsmockito.org/):

	
	function foo(a) { return a; }
	foo = spy(foo);
	foo(1);
	verify(foo)(1); // verified!
	verify(foo)(2); // never run

Here, we're spying on the `foo` method, and checking that it was invoked at least once with the parameter `1`, and once with the parameter `2`.  As it turns out, this `spy` method does not work well with JavaScript constructors, in [JsMockito](http://jsmockito.org/), [Jasmine](http://github.com/pivotal/jasmine), or many other testing frameworks.  The basic problem is that the prototype is not transferred appropriately, so code like this will fail:

	
	function Foo(a) {
		this.a = a;
	}
	Foo.prototype = {
		bar: function () {
			console.log(this.a);
		}
	};
	
	var f = new Foo(1);
	f.bar(); // 1
	
	Foo = spy(Foo);
	var g = new Foo(1);
	g.bar(); // error
	
	verify(Foo)(1); // not reached

It turns out it's really easy to write a constructor-safe spying function, and it doesn't even take very many lines of code.

	
	function spy(F) {
		function G() {
			var args = Array.prototype.slice.call(arguments);
			G.calls.push(args);
			F.apply(this, args);
		}

		G.prototype = F.prototype;
		G.calls = [];

		return G;
	}

This `spy` function works just like the one in JsMockito, but it doesn't fail with constructors.  For completeness, here's an implementation of a simple `verify` function:

	
	function verify(F) {
		return function () {
			var args = Array.prototype.slice.call(arguments),
				i,
				j,
				call,
				count = 0,
				matched;

			for (i = 0; i < F.calls.length; i += 1) {
				call = F.calls[i];
				matched = true;
				for (j = 0; j < args.length; j += 1) {
					if (args[j] !== call[j]) {
						matched = false;
						break;
					}
				}
				if (matched) {
					count += 1;
				}
			}

			return count > 0;
		};
	}

It would be easy to extend this `verify` implementation to allow more types of verify like `.once()` or `.never()`, working off the `count` variable.

And that's it!  Here's an example of code that will work with this `spy` implementation:

	
	function Foo(name, id) {
		this.name = name;
		this.id = id;
	}

	Foo.prototype = {
		log: function () {
			console.log("Foo %o:%o", this.id, this.name);
		}
	};

	var f = new Foo("test", 1);
	f.log();

	Foo = spy(Foo);

	var f2 = new Foo("spied", 2);
	f2.log();

	console.log("verify Foo(\"spied\", 2): %o", verify(Foo)("spied", 2));
	console.log("verify Foo(\"something\", 2): %o", verify(Foo)("something", 2));
	
	var baz = {
		spam: function (a) {
			console.log("calling baz.spam(%o), this.other=%o", a, this.other);
		},
		other: 10
	};

	baz.spam = spy(baz.spam);

	baz.spam(1);
	console.log("verify baz.spam(1)", verify(baz.spam)(1));
	console.log("verify baz.spam(2)", verify(baz.spam)(2));

The other neat thing is that, so long as you're not trapping stale references to the original constructor function before it got spied, JavaScript's `instanceof` operator should work just fine:

	
	function F() {}
	F = spy(F)
	new F() instanceof F; // true

You can find the complete code (and a bit more) for this excercise at [www.bcherry.net/playground/spying-constructors](http://www.bcherry.net/playground/spying-constructors).  I hope this was informative.  I think I'll probably end up either contributing a patch to JsMockito with this, or building my own bare-bones set of mocking/spying functions for use with [QUnit](http://docs.jquery.com/QUnit).

<span class="note">___P.S. It's been some time since I've updated, but I'm hoping this will be the first of many new, interesting JavaScript posts inspired by the work I'm doing at Twitter with @bs, @hoverbird, @ded, and @dsa.___</span>