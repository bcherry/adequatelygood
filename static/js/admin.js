/*jslint white: true, onevar: true, browser: true, devel: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, strict: false, newcap: true, immed: true */
/*globals jQuery: false, consul: false, window: false */
(function () {
	var $ = jQuery,
		dialogConfig,
		dialog,
		domObjs,
		submitUrl = "/",
		tmplName = "_tmpl_postDialog",
		ajaxOptions,
		
		handleError,
		handleSuccess,
		openDialog,
		fillEditor,
		submitPost,
		hardReset,
		closeDialog,
		dialogOnClose,
		dialogOnOpen,
		submitDelete,
		openDeleteDialog;
	
	handleError = function (xhr, textStatus, errorThrown) {
		var errors = {
			"400" : "Uh oh!  I couldn't save your post.  Seriously, I have no idea what went wrong."
		};
		
		if (!(xhr.status in errors)) {
			errors[xhr.status] = "Ooops!  There was a mysterious error of some kind.  Sorry about that!  (" + xhr.status + " - " + xhr.statusText + ")";
		}
		
		domObjs.errorText.text(errors[xhr.status]);
		domObjs.error.show();
	};
	
	handleSuccess = function (data) {
		consul.log("submission complete, response: " + data);
		window.location.href = data;
	};
	
	openDialog = function () {
		var today = new Date(),
			month = today.getMonth() + 1,
			year = today.getFullYear();
			
		dialog = $("<div/>");
		domObjs = dialog.tmpl(tmplName, {});
		dialog.dialog(dialogConfig);
		
		function doOpen() {
			dialog.dialog("open");
		}
		
		switch ($(this).attr("id")) {
		case "newarticle":
			submitUrl = "/";
			fillEditor("", "", "");
			break;
		case "newblog":

			submitUrl = "/" + year + "/" + month;
			fillEditor("", "", "");
			break;
		case "editbtn":
			submitUrl = "?_method=PUT";
			//$.getJSON(window.location.href, {}, function(data) {
			//	fillEditor(data.body, data.title, data.tags);
				doOpen();
			//});
			return;
		}
		doOpen();
		return false;
	};

	fillEditor = function (body, title, tags) {
		if (body === undefined) {
			body = "";
		}
		//editor.setData(body);
		$(domObjs.postBody).val(body);
		if (title !== undefined) {
			$(domObjs.postTitle).val(title);
		}
		if (tags !== undefined) {
			if (tags.constructor === Array) {
				tags = tags.join(", ");
			}
			$(domObjs.postTags).val(tags);
		}
	};

	ajaxOptions = {
		cache		: false,
		dataType	: "text",
		error		: handleError,
		success		: handleSuccess,
		type		: "POST"
	};
	
	submitPost = function () {
		var body = $(domObjs.postBody).val(),
			title = $(domObjs.postTitle).val(),
			tags = $(domObjs.postTags).val(),
			options = ajaxOptions;

		domObjs.error.hide();

		consul.log("beginning submission");
		options.url = submitUrl;
		options.data = {
			body: body,
			title: title,
			tags: tags
		};
		
		$.ajax(options);
	};
	
	hardReset = function () {
		dialog.dialog("destroy");
		dialog = null;
		domObjs = null;
	};

	closeDialog = function () {
		dialog.dialog("close");
		hardReset();
	};

	dialogOnClose = function (event, ui) {
		hardReset();
		consul.log("dialog closed");
	};

	dialogOnOpen = function (event, ui) {
		consul.log("dialog opened");
	};

	dialogConfig = {
		autoOpen: false,
		modal: true,
		title: "an adequately good post editor",
		width: 800,
		close: dialogOnClose,
		open: dialogOnOpen,
		buttons: {
			post: submitPost,
			cancel: closeDialog
		}
	};

	submitDelete = function () {
		$.ajax({
			type: "DELETE",
			url: "#",
			success: function (data) {
				window.location.href = data;
			},
			dataType: "text"
		});
	};

	openDeleteDialog = function () {
		$("<div/>").text("Are you sure you want to delete this entry?").dialog({
			modal	: true,
			title	: "confirm deletion",
			buttons	: {
				"delete it"	: submitDelete,
				cancel: function () {
					$(this).dialog("destroy");
				}
			}
		});
	};

	// Bind event handlers, etc.
	$(function () {
		$("#newblog, #newarticle, #editbtn").live("click", openDialog);
		$("#deletebtn").live("click", openDeleteDialog);
		
		// TODO highlighting (for dev)
		$(":contains(TODO)").not(":has(:contains(TODO))").each(function () {
			var that = $(this),
				html = that.html();
			
			html = html.replace(/(\(TODO:.*?\))/g, "<span class=\"todo\">$1</span>");
			that.html(html);
		});
	});
}());

