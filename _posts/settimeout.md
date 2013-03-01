I was talking with a co-worker today about the behavior of `setTimeout` and `setInterval` when given a small interval, like `0` or `1`.  The _expectation_ would be that the timer will fire in 0ms, or 1ms.  However, as with <a href="http://wtfjs.com" target="_blank">other things</a> in JavaScript, the _reality_ is a bit different.  It turns out that browsers actually have a __minimum timer interval__ which they can't work any faster than.  John Resig wrote about <a href="http://ejohn.org/blog/analyzing-timer-performance/" target="_blank">timer performance</a> a few years back, and found this behavior.  He's also covering it in more detail in his new book.

But, I wasn't happy with data a few years old, so I decided to just go and write my own simple test suite, <a href="http://www.bcherry.net/playground/settimeout" target="_blank">How Fast is setTimeout in Your Browser?</a>.  This page simply runs `setTimeout` with an interval of 0, 1000 times, and averages the _real_ timeout experienced in each.  Go ahead and check it out in your browser of choice.

## The Results

Well, it turns out that things aren't so bad.  Most browsers are in the __10-15ms__ range for their bottom limit, having improved in recent versions.  Notable exceptions are Internet Explorer, which has the same bottom of around __16ms__ in all versions since IE6, and Google Chrome, which, at least since version 4, has a bottom limit closer to __5ms__  It's important to keep this limitation in mind when using `setTimeout` or `setInterval`.  In particular, if you're looking for consistent timer intervals across browsers, you have to use something __>15ms__.  But, don't forget that JavaScript is single-threaded, and the timer won't execute while other code is executing.  This means that in the following code sample, you can guarantee that the timer __will not run__ until the loop has completed.  You cannot, however, guarantee precisely when that will happen, nor that it will be the next piece of code to run following the loop.

	
	setTimeout(function () { alert("timer"); }, 0);
	for (var i = 0; i < 1000; i += 1) {
		// something
	}

So it should be safe to use timers with an interval of 0ms when your only expectation is that the timer will fire as soon as it can, but not until after the current code path has completed.  Relying on timers to respect the interval you give them is foolish, since, as I've shown, they have a lower-bound, and since they wait even after firing, before executing, for other code to return.

## The Source Code

This test is really simple.  Here's the complete JavaScript source code:

	
	var target = document.getElementById("target"),
		results = 0,
		iterations = 1000,
		i = 0;

	function go() {
		var fn = function () {
				results += new Date().getTime() - d;
				i += 1;
				if (i < iterations) {
					go();
				} else {
					finish();
				}
			},
			d = new Date().getTime();
		setTimeout(fn, 0);
	}

	function finish() {
		target.innerHTML = "Average timer delay was <span class=\"num\">" + results/iterations + 
			"</span>ms, over <span class=\"num\">" + iterations + "</span> iterations.";
	}

	go();

And that's all there is to it.  I hope you found this useful or interesting.  Timers are very fickle, but also incredibly useful, so it's worth taking the time to understand what it is they do, and how they do it.
