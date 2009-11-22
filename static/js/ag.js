;(function($){
	$(function() {
		
		// Nav bar links
		$(".nav a").hover(function() {
			$(this).siblings("span").fadeIn("fast");
		}, function() {
			$(this).siblings("span").fadeOut("fast");
		});
		
		// Search
		$("#search input[type=text]").focus(function() {
			if ($(this).val() == $(this).attr("title")) {
				$(this).removeClass("blurred").val("");
			}
		}).blur(function() {
			if (!$(this).val()) {
				$(this).addClass("blurred").val($(this).attr("title"));
			}
		});
	});
})(jQuery);
