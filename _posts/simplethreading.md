___This post has been migrated from my old, defunct blog at bcherry.net.  The links may not work, and the formatting may be wonky.___

I've been playing around with asynchronous Javascript for repeated large-set actions, in the hopes of generating some useful techniques for real applications.  I've narrowed down a successful technique that I call "simplethreading".  Check out a demo [here](http://bcherry.net/simplethreading_old) or the resulting source code [here](http://github.com/bcherry/simplethreading).  The demo lets you play with the size of the data set, and also the operation queue size.  I found that queuing operations in batches was quite a bit faster than queuing them individually, so that each fired event will process a few data objects instead of just 1.  I'd guess the reason for this is that Javascript only supports timeouts at the millisecond level, when most operations are shorter than that.  By grouping operations into larger chunks, we can make much better use of the time we're given.

Here's the code for both the blocking (I call it "singlethreaded") and non-blocking (I call it "simplethreaded" because it's not really multi-threaded, but it's not really single-threaded either) version.  Note that `{@class=js inline}ST.s` and `{@class=js inline}ST.n` refer to the querystring parameters 's' and 'n'.:

	
	ST.functions = [
		function (n, context) {
			$(context).append($("<div>").addClass("result").attr("id","r"+n).text(n));
		}, function (n, context) {
			$("#r" + n + ".result", context).addClass("dark");
		}, function (n, context){
			$("#r" + n + ".result", context).remove();
		}
	];
	
	/** singlethreaded approach **/
	ST.singleStage = 0;
	ST.SingleGenerator = function(n) {
		var i = 0;
		this.next = function() {
			if (i &gt; n || i &gt; ST.singlelimit) {
				return null;
			}
			return i++;
		};
	};
	ST.startsingle = function() {
		var context = $("#singlethreaded .output");
		var gen = new ST.SingleGenerator(ST.n);
		var n;
		var workFn = ST.functions[ST.singleStage];
		ST.singleStage++;
		ST.singleStage = ST.singleStage % ST.functions.length;
		while ((n = gen.next()) !== null) {
			workFn(n,context);
		}
	};

	/** simplethreaded approach **/
	ST.simpleStage = 0;
	ST.SimpleGenerator = function(n) {
		var i = 0;
		this.next = function() {
			if (i &gt; n) {
				return null;
			}
			return i++;
		};
	};
	ST.startsimple = function() {
		var context = $("#simplethreaded .output");
		var gen = new ST.SimpleGenerator(ST.n);
		var n;
		var workFn = ST.functions[ST.simpleStage];
		ST.simpleStage++;
		ST.simpleStage = ST.simpleStage % ST.functions.length;
		var fn = function() {
			var i = 0;
			while (i++ &lt; ST.s &amp;&amp; (n = gen.next()) !== null) {
				workFn(n,context);
			}
			if (n === null) {
				clearInterval(threadID);
			}
		};
		var threadID = setInterval(fn,1);
	};

The resulting code is actually pretty straightforward.  The key is to maintain the ID returned by the `{@class=js inline}setInterval()` call so it can be killed when you're done with your work.  Normally this would get stuffed into a global, but by wrapping the whole lot into a function and then sending a local function reference into `{@class=js inline}setInterval()`, I can take advantage of Javascript's closure to keep the locals I need around for every asynchronous function call, which is really awesome.

Also, using a generator is a pretty neat way to produce the data I need, and lets me work with arbitrary data pretty easily.  In a real application where the data is coming from the server asynchronously, I can have the generator returning data from a queue as it comes in, while returning flags like "all done" so the thread knows it won't see more data or "wait for it" so the thread can stick around and poll for new data when it comes in.

I think that if I were to bring this into a real application, I would have it decide between singlethreaded or simplethreaded dynamically, because it's obvious that singlethreaded is much better for smaller sets.