Sometimes, you might want to overwrite built-in global methods like `setTimeout` and `setInterval`.  If you try, you might find that it's much harder than you think to accomplish this in every browser, particularly if you ever want to find the originals again.  After a lot of painful experimentation, I think I have a definitive solution that works in all browsers with minimal side-effects.

## Failed Approaches

I started out with the simple approach:

    
    setTimeout = function() {};
    // or
    window.setTimeout = function() {};

This seems to work in most browsers.  However, Internet Explorer 8 and below are not appreciative of this technique.  In the first case, IE will actually throw an exception saying `"Object doesn't support this action"`.  The second option works, but it will only affect the value of `window.setTimeout`, leaving plain old global `setTimeout` alone.  This is workable, but not ideal.  Time to look for another solution.

### Another Attempt

After speaking with @jcummins about this, we thought about using the `var` keyword, and seeing if that would help.  So that brings me to my next approach:

    
    var setTimeout = function() {};

The good news is that this works across the board!  Both `setTimeout` and `window.setTimeout` now reference my new function, in all browsers, and you can safely do any assignments needed, no exceptions thrown.  But now the question is, where did the original `setTimeout` go?  It's not an easy thing to find.

You might try something like the following:

    
    var temp = setTimeout,
        setTimeout = function() {};

Now, you might expect `temp` to contain the original `setTimeout`, but it unfortunately will come up `undefined`.  This is due to [JavaScript hoisting](http://www.adequatelygood.com/2010/2/JavaScript-Scoping-and-Hoisting).  I even tried `var temp = window.setTimeout` first, but the property on `window` was immediately hoisted on top.

So, I resolved to find another way to get at the original value.  After some digging, I discovered a reference to the original `setTimeout` on the window's prototype, which you can access at `window.constructor.prototype.setTimeout`.  Alright!  Things are looking good.  Unfortunately, things quickly went downhill.

   1. In most browsers, `window` is constructed by a function named `"DOMWindow"`.  That is, `window.constructor.name === "DOMWindow"`.  However, in Safari this is not the case, the `constructor` property instead references `Object`.  We don't have a way to access `DOMWindow` directly, so we can't get to the prototype.  Luckily, we can use the ECMAScript 5 `__proto__` property, and find `setTimeout` at `window.__proto__.setTimeout`.  So my catch-all became `(window.__proto__ || window.constructor.prototype).setTimeout`.
   2. It turns out Opera has the same problem as Safari, and we can't access the correct prototype at `window.constructor.prototype`.  However, it also doesn't seem able to access it at `window.__proto__`, leaving us low on options.  More on that in a bit.
   3. IE7 and below don't have a `constructor` _or_ a `__proto__` property on `window`, and there doesn't seem to be any other way to get direct access to the window's prototype.

At this point, I declared searching for the original copies of `setTimeout` outside of the global scope a lost cause, and went back to the drawing board.  You could, in theory, instantiate a new `<iframe>` and copy `setTimeout` from it, but I didn't want to introduce that much overhead.

## A Solution

At this point, I figured the best solution would be to circumvent JavaScript's hoisting rules.  As we know, hoisting occurs immediately after entering an execution context.  So, to dodge it, we'd have to introduce a second execution context.  You could do this easily in HTML:

    @@@html
    <script>
      var temp = setTimeout;
    </script>
    <script>
      var setTimeout = function() {};
    </script>

However, I was looking for a pure JS solution.  So, after some soul-searching, I decided I'd pull out `eval`.

    
    var temp = setTimeout;
    eval("var setTimeout;");
    setTimeout = function() {};

Done and done.  The most flexible thing to do is just to quickly fix the inconsistency where IE doesn't allow you to overwrite `setTimeout` directly, and then proceed to do as you need.  Here's some quick sample code, though you could easily adapt this better into your own project:

    
    var __originals = {
      st: setTimeout,
      si: setInterval,
      ct: clearTimeout,
      ci: clearInterval
    };

    eval("var setTimeout, setInterval, clearTimeout, clearInterval;");

    setTimeout = __originals.st;
    setInterval = __originals.si;
    clearTimeout = __originals.ct;
    clearInterval = __originals.ci;

    __originals = undefined;

This snippet will smooth out that inconsistency in Internet Explorer, and allow you to proceed with whatever overrides or replacements you need on those methods.  No need to use `var` again in the future, so you can avoid the hoisting pains.  I've tested this in IE6, 7, 8, and 9, as well as Chrome, Safari, Firefox 3/4, and Opera, all on Mac and Windows, and it's rock-solid.

## Update! A Better Solution

After further investigation, helped by many including @angusTweets and @kangax, I have fully uncovered the problem in IE, with an extremely simple and safe solution.

It turns out that the problem is not always present.  For instance, open up a brand new, blank window in IE7 or IE8, and try the following in the JS console:

    
    window.setTimeout = 1;
    setTimeout; // 1
    setTimeout = 2; // 2

But then, try this instead (again, in a fresh window):

    
    setTimeout;
    window.setTimeout = 1;
    setTimeout; // {...}
    window.setTimeout; // 1
    setTimeout = 1; // Error

So what's going on here?  Well, I've come up with a solid theory.

Initially, the property `setTimeout` exists on the `prototype` of `window`, not on `window` itself.  So, when you ask for `window.setTimeout`, it actually traverses one step on the prototype chain to resolve the reference.  Similarly, when you ask for `setTimeout`, it traverses down the scope chain, then to `window`, then down the prototype chain to resolve the reference.

I suspect that IE has a built-in optimization where it automatically caches the resolution of implied globals that are discovered all the way down on the prototype of the global object.  It would have good reason to do so, as these are commonly requested references, and traversing that chain is costly.  However, it must be setting this reference as read-only, since it's just a caching optimization.  This has the unfortunate side-effect of causing an exception to be thrown when attempting to assign to the reference by using it as an lvalue.  The only way to kill this new reference is by using `var` in the global scope, but this puts us in the hoisting problem.  What to do?

Assuming this theory is correct, there's actually a simple solution.  To prevent this "optimization", we simply need to move the reference one step up the chain, directly onto `window`.  Luckily, this is quite easy:

    
    window.setTimeout = window.setTimeout;

That's it!  Assuming you've done this __before__ any reference to `setTimeout` on its own, this will move the reference and completely avoid this problem.  You may now safely assign to `setTimeout` without using `var`.  This works because `window.setTimeout`, when used as an lvalue (on the left side of the assignment), does not walk the prototype chain, but on the right side, it does.  So this will always pull a property out of the prototype chain and put it right on the object.  Incidentally, IE exhibits the same problem with every other property on the window prototype, and the same solution will fix them.  You can easily find the other properties, but a few of them are `alert`, `attachEvent`, `scrollTo`, `blur`, and many others.

This solution has been tested in all browsers, has no side effects, and is wonderfully simple.  It's always nice when things work out that way.
