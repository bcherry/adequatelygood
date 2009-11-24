;(function($){
	var dialog;
	var editor;
	var domObjs;
	var href;

	var hardReset = function() {
		dialog.dialog("destroy");
		editor.destroy();
		delete dialog;
		delete domObjs;
		delete editor;
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
			body	: editor.getData()
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
		title		: "Leave a Comment!",
		width		: 500,
		close		: dialogOnClose,
		open		: dialogOnOpen,
		buttons		: {
			"Leave Comment"	: submitComment,
			"Cancel"		: closeDialog
		}
	};

	var editorConfig = {
		toolbar		: "Basic"
	};

	var openDialog = function() {
		dialog = $("<div/>");
		domObjs = dialog.tmpl("_tmpl_commentDialog", {});	
		dialog.dialog(dialogConfig);
		href = $(this).get(0).href; // This needs to be a click handler to work right
		editor = CKEDITOR.replace($(domObjs.commentBody).get(0), editorConfig);
		dialog.dialog('open');
		return false;
	};
	
	$(function(){
		$(".replybtn").live("click", openDialog);
	});
})(jQuery);

