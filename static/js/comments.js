;(function($){
	var dialog;
	var domObjs;
	var href;

	var hardReset = function() {
		dialog.dialog("destroy");
		editor.destroy();
		delete dialog;
		delete domObjs;
		href = null;
	};

	var dialogOnClose = function() {
		hardReset();
		consul.log("dialog closed");
	};

	var dialogOnOpen = function() {
		consul.log("dialog opened");
	};

	var submitComment = function() {
		consul.log("comment submission begun, submitting to %s", href);
		$.post(href, {
			key		: href,
			captcha	: $(domObjs.captcha).val(),
			name	: $(domObjs.commentName).val(),
			email	: $(domObjs.commentEmail).val(),
			title	: $(domObjs.commentTitle).val(),
			body	: $(domObjs.commentBody).val()
		}, function(data) {
			$("#num_comments").text(parseInt($("#num_comments").text(), 10) + 1);
			var parent_id = href.split('#')[1];
			if (parent_id == '') {
				$('#commentslist').prepend(data);
			} else {
            	$('#' + parent_id).after(data);
			}
			closeDialog();
		}, "html");
	};

	var closeDialog = function() {
		dialog.dialog('close');
		hardReset();
	};

	var dialogConfig = {
		autoOpen	: false,
		modal		: true,
		title		: "leave a comment!",
		width		: 500,
		close		: dialogOnClose,
		open		: dialogOnOpen,
		buttons		: {
			"leave comment"	: submitComment,
			"cancel"		: closeDialog
		}
	};

	var openDialog = function() {
		dialog = $("<div/>");
		domObjs = dialog.tmpl("_tmpl_commentDialog", {});	
		dialog.dialog(dialogConfig);
		href = $(this).get(0).href; // This needs to be a click handler to work right
		dialog.dialog('open');
		return false;
	};
	
	$(function(){
		$(".replybtn").live("click", openDialog);
	});
})(jQuery);

