/*jslint white: true, onevar: true, browser: true, devel: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, strict: false, newcap: true, immed: true */
/*globals jQuery: false, */
(function () {
	var $ = jQuery;
	$(function () {
		
		// Search
		$("#search input[type=text]").focus(function () {
			if ($(this).val() === $(this).attr("title")) {
				$(this).removeClass("blurred").val("");
			}
		}).blur(function () {
			if (!$(this).val()) {
				$(this).addClass("blurred").val($(this).attr("title"));
			}
		});
	});
}());

