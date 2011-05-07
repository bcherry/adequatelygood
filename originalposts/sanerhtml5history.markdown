Included in the laundry list of new features that are descending on the world of web development with HTML5 are two quite nice ones:  [History Management](https://developer.mozilla.org/en/DOM/Manipulating_the_browser_history) and [the `hashchange` event](https://developer.mozilla.org/en/DOM/window.onhashchange).  These two features allow for much richer and faster JavaScript applications.  Let's start with a quick overview of what these provide.

## Hashchange

This event is quite simple.  Whenever the `{@class=js}window.location.hash` property changes, by following a link, setting the property, editing the URL bar, or using back/forward to move through browser history, the "hashchange" event is fired from the window.  Using it is really easy:

	@@@js
	window.onhashchange = function() {
		alert("hash changed!");
	};
	window.location.hash = Math.random(); // alerts "hash changed!"

This feature is implemented in recent versions of all major browsers.  In older browsers like Internet Explorer 6 and 7, you can easily provide it by polling the hash property on an interval, and manually firing an event when it changes.  This is easy to build into a jQuery plugin, which [Ben Alman](http://benalman.com/) did in the robust [jquery.hashchange.js plugin](http://benalman.com/projects/jquery-hashchange-plugin/).

## History Management

This feature is a bit more complex.  Browsers that support it add a `{@class=js}window.history` object, with the following properties:

 - `{@class=js}window.history.back()` and `{@class=js}window.history.forward()`, which provide programmatic interfaces to browser back and forward functions.
 - `{@class=js}window.history.pushState(stateObj, title, url)`.  This method pushes a new entry into the browser history, which then becomes the browser's current state.
 You can provide any JSON-stringifiable object to send with it, and the browser will provide that object again when you navigate to that point (more on that in a bit).  More importantly, if you provide a URL, the browser will change the URL displayed in the address bar, without reloading the page.  The new URL must be on the same domain, but you can change the rest of it, which is the `{@class=js}window.location.pathname` and `{@class=js}window.location.hash`.  Changing the URL in this way will not trigger a "hashchange" event, though.
 - `{@class=js}window.history.replaceState(stateObj, title, url)`.  This is just like `{@class=js}window.history.pushState`, except that the current browser state is removed from the history, so you cannot hit "back" to return to it.
 - `{@class=js}window.onpopstate`.  This event is fired whenever a state object is removed from the browser history, which occurs on browser "back" or "forward".  State objects are persisted on the user's hard disk between sessions, which is a nice feature.  The object passed into a call to `pushState` or `replaceState` is provided as the `state` property on the event object in the "popstate" event.

This feature is implemented in the latest versions of WebKit, which includes Safari and Chrome.  Additionally, the Firefox 4 betas include support for this.

## What's the Use Case?

The new history management stuff is very promising, because it allows a web application to live across many physical URLs, but be run in a single instance.  This is important for certain kinds of applications, where using hashes is not universally suitable.

For instance, at Twitter, we currently update your URL hash as you navigate around the application, to make bookmarkable pages like <http://twitter.com/#replies>.  However, we force a full page load for certain pages, most notably profile pages (e.g. <http://twitter.com/bcherry>) and permalink pages (e.g. <http://twitter.com/bcherry/status/18966802499>).  This is so that those URLs can be copied from the address bar and posted on the web.

We want to make sure that users without JavaScript and search engine bots crawling links to our site will get the correct page from the server (since the browser does not send a hash along to the server).  This would not be possible if those URLs used hashes.  Unfortunately, this means the application is slower, because a full page load is needed going into and out of those locations.

This is where HTML5 History Management could be useful.

## So What's the Problem?

Unfortunately, the existing implementation of history management is not useful, and not in the spirit of the web.

Our web applications should be built to respond to a URL.  Both the client and server versions of an application should understand a shared URL structure, and know how to present the same page to the browser that reflects that URL.

Allowing developers to store extra state information in the browser history is missing the point.  The only thing stored in history should be a URL, and the browser can associate a title with it if it chooses.

This is RESTful design, mirrored on client and server.  Modern browsers can support changing the URL without reloading the page from the server, and older ones can continue to hit the server every time.

In this way, we can build applications that degrade correctly in older browsers, and when viewed by bots, while providing a faster experience for users with modern browsers.

## Enter "pathchange"

Both "hashchange" and `pushState`/"popstate" should be replaced with "pathchange", which is an event that fires when the URL changes in any way.  This event does not provide any information, the application should inspect the current URL to discover the state it should enter.  Relative links within a page should not force page reloads, they should instead just trigger the "pathchange" event.

It turns out that it's possible to implement this event in modern browsers now, based on the features they already have.  Here's how:

 1. Listen to "hashchange", and trigger "pathchange" when it occurs
 2. Poll the hash in browsers without "hashchange" support, and trigger "hashchange", which triggers "pathchange"
 3. With history support, listen to "popstate", and trigger "pathchange" when it occurs
 4. With history support, intercept all relative links when they are clicked, and prevent normal navigation.  Call `{@class=js}window.history.pushState(null, null, href)` instead, and trigger a "pathchange".
 5. Provide a helper function to make navigation to new URLs using `{@class=js}window.history.pushState`, when supported, easy.

I've implemented all of this as a [jQuery plugin][pathchange] that is quite easy to use:

	@@@js
	$(function() {
		$.pathchange.init(); // setup event listeners, etc.
		$(window).pathchange(function() {
			respondToUrl();
		}).trigger("pathchange");

		$.pathchange.changeTo("/foo");
	});

I've also created a demo page that presents [A Saner HTML5 History App](http://www.bcherry.net/playground/sanerhtml5history) that uses [jquery.pathchange.js][pathchange] under the hood.  Check it out in various browsers to see the HTML5 magic at work, and be sure to use your browser "back" and "forward" buttons, and reload the page a few times.

That's my take on the HTML5 history features.  It's unfortunate that what the browsers are implementing is not what we really need, but it's encouraging that they do provide enough to implement what we do really need.  Let me know in the comments if you agree, disagree, or have questions about my approach.

 [pathchange]: http://www.bcherry.net/static/lib/js/jquery.pathchange.js

<span class="note">___Note Number One: It's also worth pointing out that I discovered a [serious bug](https://bugs.webkit.org/show_bug.cgi?id=42940) in WebKit's implementation of history management while working on this today.  In short, the "popstate" event is often lost when the network is occupied, which makes little sense.  [Here's a demo page with a reproducible case](http://www.bcherry.net/playground/pushstate) that I threw together.  It fires off a request to download an image which takes 1s on every "popstate", which means hitting "back" more than once every second leads to lost history entries and an application that gets out of sync with the URL.  You could work around this by polling the URL in addition to listening to "popstate", but it's not a good workaround.  Until this is fixed, you'll have to be wary of this if you ship this feature to your users, and it probably is not suitable for very complex AJAX apps.  Firefox 4 does not have the same problem.___</span>

<span class="note">___Note Number 2: This article was originally published around 4am PST on July 26th.  The author published a revision around 8pm PST the following day, to make it a little less incohorent and a little more useful.  Luckily, the author uses Git to prepare Markdown-formatted articles, so you can [view the diff](http://github.com/bcherry/adequatelygood/commit/eb688c7809e8d5f61f9ed12442d3a578d46fab97) if you'd like to find out what changed.___</span>