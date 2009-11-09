;(function($){
	var agd = AGD.extend("Comments");
	var dialog;
	var editor;
	var href;
	var inputs = {};

	var dialogOnClose = function() {
		agd.log("dialog closed");
	};

	var dialogOnOpen = function() {
		agd.log("dialog opened");
	};

	var submitComment = function() {
		agd.log("comment submission begun, submitting to %s", href);
		$.post(href, {
			key		: href,
			captcha	: inputs.captcha.val(),
			name	: inputs.name.val(),
			email	: inputs.email.val(),
			homepage: inputs.homepage.val(),
			title	: inputs.title.val(),
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
		href = null;
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

	var resetDialog = function() {
		inputs.captcha.val("");
		inputs.name.val("");
		inputs.email.val("");
		inputs.homepage.val("");
		inputs.title.val("");
		inputs.body.val("");
		editor.setData("");
	};

	var openDialog = function() {
		resetDialog();
		href = $(this).get(0).href;
		dialog.dialog('open');
	};

	var initComments = function() {
		dialog = $("#commentDialog").dialog(dialogConfig);
		editor = CKEDITOR.replace(dialog.find("#commentBody").get(0), editorConfig);

		inputs.captcha = dialog.find("#captcha");
		inputs.name = dialog.find("#commentName");
		inputs.email = dialog.find("#commentEmail");
		inputs.homepage = dialog.find("#commentHomepage");
		inputs.title = dialog.find("#commentTitle");
		inputs.body = dialog.find("#commentBody");
	};

	$(function(){
		initComments();
		$(".replybtn").live("click", openDialog);
	});
})(jQuery);

