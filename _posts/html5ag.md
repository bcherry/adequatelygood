Take a look at this web site.  Notice anything out of the ordinary.  Hopefully you don't, none of the layout or styling has changed noticeably recently.  However, try a "View Source".  Now do you see something different?  This page is now rendered with the following doctype:

	@@@html
	<!DOCTYPE html>

That's right, this web site is now HTML5!  In fact it even <a href="http://validator.w3.org/check?uri=http%3A%2F%2Fwww.adequatelygood.com">validates as HTML5</a> successfully!  If you dig past the doctype, you'll find all sorts of HTML5 semantic elements, including `{@class=html}<nav>`, `{@class=html}<article>`, and `{@class=html}<time>`, among others.  Making the transition was reasonably painless with the help of Mark Pilgrim's <a href="http://diveintohtml5.org/semantics.html">excellent article on making the switch</a>.  For the most part, I just had to change a few elements and rewrite my CSS.  There were a few headaches because <a href="http://blueprintcss.org">Blueprint CSS</a> expects your grid elements to be `{@class=html}<div>`s, but the following CSS added the right capabilities to my semantic elements to be compatible with Blueprint:

	@@@css
	header, footer, nav, article {
		float: left;
		margin-right: 10px;
	}

Of course, IE doesn't understand the new HTML5 elements.  Luckily, there's an easy solution.  I chose to write it myself, since it's so simple, but there's a <a href="http://html5shiv.googlecode.com/svn/trunk/html5.js">publicly available complete solution</a> you can use as well.  Here's mine, for reference (in the `{@class=html}<head>`):

	@@@html
	<!-- IE HTML5 Compatibility -->
	<!--[if IE]>
		<script type="text/javascript">
			(function () {
				var tags = "header hgroup nav article time footer".split(" "),
					i = 0,
					l = tags.length;
				for (; i < l; i += 1) {
					document.createElement(tags[i]);
				}
			}());
		</script>
	<![endif]-->

And that's all there was to it!  It's great that you can start using basic HTML5 _right now_ without any difficulties, and it will work in all browsers, even IE6!  Of course, you can't just start using the more advanced features like `{@class=html}<video>` or Web Workers, but basic markup is a great start.

So what do you think?  You ready to upgrade your own personal site?
