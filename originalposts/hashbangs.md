
There's [Breaking the Web with hash-bangs](been) [Going Postel](a) [hashbanghell](lot) [Tim Bray](of) [JsMentors Thread](discussion) this week about the "hash-bang", that ugly little bit you find in the middle of URLs like this one: [http://twitter.com/#!/ded/status/18308450276](https://twitter.com/#!/ded/status/18308450276). I wanted to provide a rebuttal to the arguments that the hash-bang is bad for the web, based on a lot of discussions we've been having inside Twitter since the #newtwitter project began last summer, and have continued right up until today.

## It's Not About the Hash-Bang

The hash-bang is in the unfortunate position of being the messenger of a big change that's been slowly occurring on the web in the past few years, and will only continue to pick up steam: many Web domains are now serving desktop-class applications via HTTP, not traditional Web sites.  For instance, twitter.com is no longer a collection of web pages that represent a web site, but is simply an application that you happen to launch by pointing a browser at http://twitter.com.  This has many wide-reaching implications, and the hash-bang is merely a side-effect.  In this way, the hash-bang is an easy-to-hate straw-man, whereas the real debate to be had is about this shift towards applications.

## Why Applications on the Web?

Services such as Twitter, Flickr, Facebook, and others have every reason to build rich applications.  The experience is faster, more seamless, and much better for users.  However, we do not have to choose to host our apps on the Web, and could easily use other options, such as building a native OS application, or using another cross-platform platform such as Adobe AIR.  We all choose Web applications however, because the Web is ubiquitous, well-understood, and mostly superior to other application delivery options.

We get URLs in our web applications as a legacy of web sites, and this feature is unique to this class of applications.  As application developers, we get benefits like bookmarks and sharing of application states for free, based on the power of the Web and URLs.  Unfortunately, supporting a URL structure for this type of application is not possible in current browsers, without using the URL hash.  So, we use the URL hash to take advantage of this sort of thing, but not because we believe our application to be a traditional web site.  Google has thankfully provided [AJAX Crawling Spec](an implementation for crawling applications), based on the hash-bang, which makes using the URL hash to store application state even more compelling.

## The Tradeoff

We've made a tradeoff, however, in making twitter.com into an application using the hash, which is that it now cannot be both an app and a site at the same time.  This capability might not sound compelling, but it is.  For instance, browsers without JavaScript cannot access content that has been shared using the URL hash.  In a perfect world, we would have been able to use the original URL structure with the hashes for our application, and served both the site and the app simultaneously.  This would be the absolute best thing for users of all kinds, and this debate would not be happening.

There is hope on the horizon, in the form of the HTML5 History API.  This new browser feature will allow developers to change the entire URL path and query string without incurring a page refresh.  By using this, we could drop the hash, and get all the benefits of traditional web sites with all the benefits of a desktop-class application.  Support for this has been in Chrome and Safari for some time (albeit with [Webkit bug](a bug we found) (now fixed)), and will arrive in Firefox 4.  Internet Explorer currently has no plans to implement this in IE9, which is a shame.  Had it not been for the bug we found, we would have shipped #newtwitter with HTML5 History on day one (and in fact, the integration is already built).

## The Hash-Bang is a Good Thing

It's not perfect.  It's not pretty (despite what Google says).  But the hash-bang is useful.  Users benefit from the trend towards full-fledged applications, with increased speed and functionality.  URLs are not necessary in this context, but we provide them (via the hash) because they bring tangible benefits for applications.  The hash-bang also brings a tangible benefit.  Someday, we will hopefully be rid of the thing, when HTML5 History (or [Saner HTML5 History Management](something like it)) is standard in all browsers.  But, until then, it will remain in use on many sites, and continue to grow.


[WSJ on Gawker Outage]: http://blogs.wsj.com/digits/2011/02/07/gawker-outage-causing-twitter-stir
[JsMentors Thread]: http://groups.google.com/group/jsmentors/browse_thread/thread/e493573c4de5d5f9?hl=en_US
[AJAX Crawling Spec]: http://code.google.com/web/ajaxcrawling/docs/getting-started.html
[hashbanghell]: http://simonwillison.net/tags/hashbanghell/
[Going Postel]: http://adactio.com/journal/4346/
[Breaking the Web with hash-bangs]: http://isolani.co.uk/blog/javascript/BreakingTheWebWithHashBangs
[Tim Bray]: http://www.tbray.org/ongoing/When/201x/2011/02/09/Hash-Blecch
[Hashbang proposal]: http://googlewebmastercentral.blogspot.com/2009/10/proposal-for-making-ajax-crawlable.html
[SPI Manifesto]: http://itsnat.sourceforge.net/php/spim/spi_manifesto_en.php
[Webkit Bug]: https://bugs.webkit.org/show_bug.cgi?id=42940
[Bug Repro]: http://www.bcherry.net/playground/pushstate
[Saner HTML5 History Management]: http://www.adequatelygood.com/2010/7/Saner-HTML5-History-Management
[The Web is Dead]: http://www.wired.com/magazine/2010/08/ff_webrip/all/1

