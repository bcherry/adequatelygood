;(function($){
	$(function() {
	//	$(".nav span").each(function(){$(this).text("test text")}).show();
		$(".nav a").hover(function() {
			$(this).siblings("span").fadeIn("fast");
		}, function() {
			$(this).siblings("span").fadeOut("fast");
		});
	});
})(jQuery);
