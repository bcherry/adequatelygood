;(function($){
	var dialog;
	var domObjs;
	var href;

	var hardReset = function() {
		dialog.dialog("destroy");
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
	
	var handleError = function(xhr, textStatus, errorThrown) {
		var errors = {
			"400" : "Uh oh!  I couldn't save your comment.  Luckily, it doesn't look like you're a spam bot, you just forgot a required field or something.",
			"401" : "Hmmmm, you're a suspicious character.  If you're human, try entering the captcha again.  If you're a robot, then we've got issues."
		};
		
		if (!(xhr.status in errors)) {
			errors[xhr.status] = "Ooops!  There was a mysterious error of some kind.  Sorry about that!  (" + xhr.status + " - " + xhr.statusText + ")";
		}
		
		domObjs.errorText.text(errors[xhr.status]);
		domObjs.error.show();
	};
	
	var handleSuccess = function(data) {
		$("#num_comments").text(parseInt($("#num_comments").text(), 10) + 1);
		var parent_id = href.split('#')[1];
		if (parent_id == '') {
			$('#commentslist').prepend(data);
		} else {
    		$('#' + parent_id).after(data);
		}
		closeDialog();
	};
	
	var ajaxOptions = {
		cache		: false,
		dataType	: "html",
		error		: handleError,
		success		: handleSuccess,
		type		: "POST"
	};

	var submitComment = function() {
		consul.log("comment submission begun, submitting to %s", href);
		domObjs.error.hide();
		
		var options = ajaxOptions;
		options.url = href;
		options.data = {
			key		: href,
			captcha	: $(domObjs.captcha).val(),
			name	: $(domObjs.commentName).val(),
			email	: $(domObjs.commentEmail).val(),
			title	: $(domObjs.commentTitle).val(),
			body	: $(domObjs.commentBody).val()
		};
		
		$.ajax(options);
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

