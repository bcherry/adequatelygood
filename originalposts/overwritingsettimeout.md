Sometimes, you might want to overwrite built-in global methods like `{@class=js}setTimeout` and `{@class=js}setInterval`.  If you try, you might find that it's much harder than you think to accomplish this in every browser, particularly if you ever want to find the originals again.  After a lot of painful experimentation, I think I have a definitive solution that works in all browsers with minimal side-effects.

## Failed Approaches

I started out with the simple approach:

    @@@js
    setTimeout = function() {};
    // or
    window.setTimeout = function() {};

This seems to work in most browsers.  However, Internet Explorer 8 and below are not appreciative of this technique.  In the first case, IE will actually throw an exception saying `{@class=js}{@class=js}"Object doesn't support this action"`.  The second option works, but it will only affect the value of `{@class=js}window.setTimeout`, leaving plain old global `{@class=js}setTimeout` alone.  This is workable, but not ideal.  Time to look for another solution.

### Another Attempt

After speaking with @jcummins about this, we thought about using the `{@class=js}var` keyword, and seeing if that would help.  So that brings me to my next approach:

    @@@js
    var setTimeout = function() {};

The good news is that this works across the board!  Both `{@class=js}setTimeout` and `{@class=js}window.setTimeout` now reference my new function, in all browsers, and you can safely do any assignments needed, no exceptions thrown.  But now the question is, where did the original `{@class=js}setTimeout` go?  It's not an easy thing to find.

You might try something like the following:

    @@@js
    var temp = setTimeout,
        setTimeout = function() {};

Now, you might expect `{@class=js}temp` to contain the original `{@class=js}setTimeout`, but it unfortunately will come up `{@class=js}undefined`.  This is due to [JavaScript hoisting](http://www.adequatelygood.com/2010/2/JavaScript-Scoping-and-Hoisting).  I even tried `{@class=js}var temp = window.setTimeout` first, but the property on `{@class=js}window` was immediately hoisted on top of.

So, I resolved to find another way to get at the original value.  After some digging, I discovered a reference to the original `{@class=js}setTimeout` on the window's prototype, which you can access at `{@class=js}window.constructor.prototype.setTimeout`.  Alright!  Things are looking good.  Unfortunately, things quickly went downhill.

   1. In most browsers, `{@class=js}window` is constructed by a function named `{@class=js}"DOMWindow"`.  That is, `{@class=js}window.constructor.name === "DOMWindow"`.  However, in Safari this is not the case, the `{@class=js}constructor` property instead references `{@class=js}Object`.  We don't have a way to access `{@class=js}DOMWindow` directly, so we can't get to the prototype.  Luckily, we can use the ECMAScript 5 `{@class=js}__proto__` property, and find `{@class=js}setTimeout` at `{@class=js}window.__proto__.setTimeout`.  So my catch-all became `{@class=js}(window.__proto__ || window.constructor.prototype).setTimeout`.
   2. It turns out Opera has the same problem as Safari, and we can't access the correct prototype at `{@class=js}window.constructor.prototype`.  However, it also doesn't seem able to access it at `{@class=js}window.__proto__`, leaving us low on options.  More on that in a bit.
   3. IE7 and below don't have a `{@class=js}constructor` _or_ a `{@class=js}__proto__` property on `{@class=js}window`, and there doesn't seem to be any other way to get direct access to the window's prototype.

At this point, I declared searching for the original copies of `{@class=js}setTimeout` outside of the global scope a lost cause, and went back to the drawing board.  You could, in theory, instantiate a new `{@class=js}<iframe>` and copy `{@class=js}setTimeout` from it, but I didn't want to introduce that much overhead.

## A Solution

At this point, I figured the best solution would be to circumvent JavaScript's hoisting rules.  As we know, hoisting occurs immediately after entering an execution context.  So, to dodge it, we'd have to introduce a second execution context.  You could do this easily in HTML:

    @@@html
    <script>
      var temp = setTimeout;
    </script>
    <script>
      var setTimeout = function() {};
    </script>

However, I was looking for a pure JS solution.  So, after some soul-searching, I decided I'd pull out `{@class=js}eval`.

    @@@js
    var temp = setTimeout;
    eval("var setTimeout;");
    setTimeout = function() {};

Done and done.  The most flexible thing to do is just to quickly fix the inconsistency where IE doesn't allow you to overwrite `{@class=js}setTimeout` directly, and then proceed to do as you need.  Here's some quick sample code, though you could easily adapt this better into your own project:

    @@@js
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

That's it!  This snippet will smooth out that inconsistency in Internet Explorer, and allow you to proceed with whatever overrides or replacements you need on those methods.  No need to use `{@class=js}var` again in the future, so you can avoid the hoisting pains.  I've tested this in IE6, 7, 8, and 9, as well as Chrome, Safari, Firefox 3/4, and Opera, all on Mac and Windows, and it's rock-solid.


