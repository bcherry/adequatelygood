---
title: Debugging Closures and Modules
layout: post
permalink: /2010/4/Debugging-Closures-and-Modules
tags: [javascript, module pattern, debugging]
---
The most common complaint with using closures to keep private variables in JavaScript is that it makes debugging harder.  This complaint definitely holds water, and the loss of easy debugging and inspection using the [Module Pattern](http://www.adequatelygood.com/2010/3/JavaScript-Module-Pattern-In-Depth) is a serious concern.  This is where one of JavaScript's non-standard but well-supported features comes in: the __debugger statement__.  In this article, I'll introduce this statement, and show how I use it to solve this deficiency in closure-based code.

## Intro to `debugger`

The `debugger` statement is not standardized, but __is provided by all implementations__ of JavaScript.  It essentially acts like a programmatic breakpoint.  When popular JavaScript debuggers like Firebug or the IE Developer Tools execute a `debugger;` statement, execution stops and the script debugger opens up, just like any breakpoint.  Here's a simple example:

	
	function foo() {
		var a = 1;
		debugger; // execution stops until manually resumed
		a = 2;
	}
	foo();

In the above, we'll be able to inspect the local variables when our debugger pauses execution, and we'll see that `a` is still `1`.  After resuming execution, the next line will execute and `a` will be assigned the value `2`.

## Debugging Modules

The great thing is that execution stops at the `debugger` statement, complete with the local call stack from the point of execution.  This provides a really nice ability to pair with the module pattern, or any other closure-based privacy pattern.  Let's take a simple module, but add extra capabilities to it by exposing a public `.debug()` method.

	
	var foo = (function () {
		var privateVar = 10;
		return {
			publicFunc: function () {/*...*/},
			debug: function () {
				debugger;
			}
		};
	}());

Now we can call `foo.debug()` from the Firebug console, and the closure of the anonymous constructor is opened up for inspection.  By looking at the __call stack__ in our debugger, we can inspect the __scope chain__ for the private state, which will be in local variables.  Checking the value of `privateVar` will be quite easy.

Notice that it's very important for the `.debug()` property to be created and assigned during the normal construction.  Assigning it after-the-fact will not provide the same functionality, because the local call stack will not contain the anonymous constructor.  This is an unfortunate limitation, but there isn't a way around it.

## Safety and Configuration

You might not want to make it so easy to stop program execution by triggering the `.debug()` function on one of your modules, or you might want to disable this functionality.  One approach is to ship a version of your code without this property at all, but that's difficult to accomplish in some applications.  An easier method would be to do some extra checks in the `.debug()` method, before firing the `debugger` statement.

	
	return {
		debug: function () {
			if (DEBUG_MODE) {
				debugger;
			}
		}
	};

Or, perhaps check for a specific debugger first:

	
	return {
		debug: function () {
			if (DEBUG_MODE && "firebug" in console) {
				debugger;
			}
		}
	};

<span class="note">___Note___: I'm assuming you've already configured a global flag named `DEBUG_MODE` in your application.</span>

Methods like this will allow you to provide finer-grained control over when and where your `debugger` statement runs.  If you're building in a lot of logic, it makes sense to write a global helper function for this, but you'll have to be careful to preserve the right call stack:

	
	function DEBUG() {
		if (DEBUG_MODE && "firebug" in console) {
			debugger;
		}
	}
	
	var foo = (function () {
		return {
			debug: function () {
				DEBUG();
			}
		};
	}());

Here we'll keep our callstack in tact, except the one we care about will be two deep instead of one deep.

### Problems With Minifiers

I tried running code with such a `.debug()` method through the YUI Compressor, and got a disappointing result:

	[ERROR] 4:11:identifier is a reserved word

It seems that the YUI Compressor doesn't know about the `debugger` statement, which is understandable since it's non-standard.  However, I didn't want to let this defeat my attempts, so a co-worker and I came up with a workaround.  Instead of using a raw `debugger` statement, we put it behind `eval`, like this:

	
	function debug() {
		eval('debugger;');
	}

Now YUI no longer complains, and the code works just great.  However, there are a few caveats here:

 1. Using `eval` is generally considered __dangerous__ and __bad practice__.  Be sure you understand the implications, and are willing to use this workaround anyways.  I think this is a reasonable decision to make, for the intended purpose, but ensure you've at least put some thought into it.
 2. JSLint will complain at you.  This isn't such a big deal since it would be complaining about the raw `debugger` statement anyways.

## Conclusions

So that's my technique for effectively debugging inside closures, especially when using the Module Pattern.  I'm not saying this is a great technique for all uses or users, but it works well for me, and nicely solves the most common complaint developers have about the Module Pattern.  I'd love to hear alternatives or reasons why my technique is dangerous and should be avoided, so leave a comment!