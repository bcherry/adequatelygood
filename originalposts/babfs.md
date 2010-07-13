___This post has been migrated from my old, defunct blog at bcherry.net.  The links may not work, and the formatting may be wonky.___

Working in social entertainment, one of the lynchpins of the entire business is the friend selector.  Without it, there is virtually no way to grow your customer base.  Having a simple, effective friend selector is absolutely critical.  On Facebook, they provide you with either the <a href="http://wiki.developers.facebook.com/index.php/Fb:multi-friend-selector" target="_blank">multi-friend-selector</a> or the <a href="http://wiki.developers.facebook.com/index.php/Fb:multi-friend-selector_%28condensed%29" target="_blank">condensed multi-friend-selector</a>.  If you've ever played a Facebook game like <a href="http://apps.new.facebook.com/inthemafia/" target="_blank">Mafia Wars</a> or <a href="http://apps.facebook.com/onthefarm" target="_blank">Farmville</a> or <a href="http://apps.facebook.com/slidepets/" target="_blank">SuperPoke! Pets</a>, then you're probably already familiar with both of these controls.  However, the situation is much more sparse on other networks.  And if you're talking about implementing a network independent game, like <a href="http://www.superpokepets.com" target="_blank">SuperPokePets.com</a>, then you'll eventually need to write your own.

I've begun a project in my free time to make a truly great friend selector control, for use in our own applications and elsewhere.  You can find the result <a href="http://bcherry.net/babfs" target="_blank">here</a>, and the source code is available on <a href="http://github.com/bcherry/babfs/tree/master" target="_blank">GitHub</a>.  I'm constantly working on improving it.  What I've built is not useful just for friends lists, but could feasibly serve as a good control for any sort of list selection.  It began as a simple exercise in <a href="http://bcherry.net/archives/89" target="_blank">good Javascript</a>, seeing how quickly I could replicate every feature of the Facebook condensed multi-friend-selector (the answer was about 2 hours).  But as I worked on it more, I realized that I was capable of producing something of real value to our business.  I hope to tackle advanced problems like performance with our so-called "whale users", who have tens of thousands of friends.  My initial attempt starts to break down over 1000 friends, and crashes the browser as I reach above 10000.

You can use it by including the Javascript and CSS files (found in <a href="http://github.com/bcherry/babfs/tree/master" target="_blank">Git</a>), then making a simple call to the constructor.  The data is expected to be a list of objects, each of which has the properties 'name', 'id', and 'tabs' (optional).  If you don't want the tabs, just don't pass a 'tabs' list, and don't include it on your dataset.  In the future, the object returned from the constructor will have some useful public methods.

	@@@js
	var bfs = new BetterFriendSelector({
		action:"index.html",
		method:"GET",
		submit_text:"Send Friend Request",
		data:fs_data,
		limit:10,
		elem:$("#bfs"),
		tabs:[{key:"hasapp",name:"Friends With App"}, {key:"nonapp",name:"Friends Without App"}],
		extra_form_params:extra_form_params
	});

	Anyways, I'd like to go through the implementation of what I have so far.

<h3>Disappearing Checkboxes</h3>
<p>This is the best feature of the condensed selector on Facebook.  When a user clicks to select one of their friends, the entry moves to the "selected" area, but with an 'X' instead of a checkbox.  This makes it easy to see who's been selected, even while filtering or tabbing the results.  Here's how I did that:</p>

	@@@js
	// Friend selected event
	selector.find("input[type=checkbox]").change(function(){
		var count = selector.find("input[type=checkbox][checked=true]").length;
		if (count > limit) {
			$(this).attr("checked",false);
			return false;
		}
		$(this).parents(".friend").addClass("hidden");
		var selected_elem = $("<div id="">").addClass("selected_friend");
		selected_elem.tmpl(BFS.templates.selected_elem,{"name":$(this).siblings("label").text(), "id":$(this).attr("id")});
		selector.find(".selected").append(selected_elem);
	});
	// Friend unselected event
	selector.find(".remove").live("click",function(){
		selector.find(".unselected #" + $(this).attr("id")).attr("checked",false).parents(".friend").removeClass("hidden");
		$(this).parents(".selected_friend").remove();
	});
	
<p>I think this is fairly straightforward, so I'll just list a few points to help understand it:</p>

<ol>
<li>The correct event to bind is "change".  My first attempt had me binding to the "click" event on the checkbox, which was flawed.  You can modify the checkbox by clicking it, with your keyboard, or clicking on the label, not to mention other Javascript.  "change" catches all of these options</li>
<li>I use the friend's id to index the items.  Checkboxes have an id of 'cbXXX' and the corresponding 'selected' element has an id of 's_cbXXX'.</li>
<li>I'm using John Resig's <a href="http://bcherry.net/archives/97" target="_blank">micro-templates</a>, so that's what the <code class="js inline">.tmpl()</code> call is.  The template data is stored in a static collection of strings.</li>
<li>I allow the developer to specify a selection limit ("select up to X friends"), and enforce that in the 'change' event.  Returning false prevents the checkbox from becoming selected.</li>
<li>My first attempt used <code class="js inline">.hide()</code> and <code class="js inline">.show()</code>, which seems to be natural.  I changed it to a class with 'display:none;'.  This is because there are a number of reasons a friend element might be hidden, such as being filtered or toggled.  Using classes for these ensures they stay hidden when I want them to be.</li>
</ol>

<h3>Typeahead Name Filter</h3>
<p>There are plenty of solutions for typeahead to be found online, but I decided to implement my own.  It turned out to be really easy, so I'll just show the code and a few points.  The key feature of my implementation is that it filters on the start of the first and last name simultaneously, so entering 'be' will keep both 'Ben Franklin' and 'David Beckham'.</p>

	@@@js
	var filter = selector.find(".filter input");
	var reset_filter = function(){
	filter.addClass("empty").val(filter.siblings(".__empty_text").text());
	};
	// Filter changed event
	var do_filter = function() {
	var filter_text = filter.val();
	if (filter_text == filter.siblings(".__empty_text").text()) {
	filter_text = "";
	}
	selector.find(".unselected label").each(function(){
	with($(this)) {
	if(!text().match("^" + filter_text) && !text().match("[- \t]+" + filter_text)) {
	parents(".friend").addClass("filtered");
	} else {
	parents(".friend").removeClass("filtered");
	}
	}
	});
	};
	filter.keyup(do_filter);
	// Filter preloaded text stuff
	reset_filter();
	filter.focus(function() {
	if ($(this).val() == $(this).siblings(".__empty_text").text()) {
	$(this).removeClass("empty").val('');
	}
	});
	filter.blur(function() {
	if ($(this).val() == "") {
	reset_filter();
	}
	});
	selector.find(".filter .clear_filter").click(function(){
	reset_filter();
	do_filter();
	});

<ol>
<li>I'm using a class instead of <code class="js inline">.hide()</code> and <code class="js inline">.show()</code> for the same reason as above</li>

<li>The textbox is watermarked using the text in a hidden element next to the textbox</li>
</ol>
<h3>What's Next?</h3>
<p>I hope someone finds this control or it's code to be useful.  I'm going to keep working on it, and I hope to create something that becomes useful at Slide.  My next task is to create a mechanism for handling our "whale users", probably some sort of smart pagination.  I'll also be adding some public methods like <code class="js inline">selectRandom()</code> to make the control easily programmable.  Another hurdle will be allowing friend data to be loaded dynamically, by passing some sort of generator function to my control.  Again, I hope this was useful, and let me know if you're using or modifying this!</p>