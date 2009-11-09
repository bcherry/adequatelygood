;(function($){
	var agd = AGD.extend("Admin");
	var dialogConfig;
	var dialog;
	var editor;
	var titleInput;
	var tagsInput;
	var submitUrl = "/";

	var initDialog = function() {
		dialog = $("#postDialog").dialog(dialogConfig);
		editor = CKEDITOR.replace("postBody");
		titleInput = dialog.find("#postTitle");
		tagsInput = dialog.find("#postTags");
		agd.log("dialog initialized");
	};

	var openDialog = function() {
		var doOpen = function() {
			dialog.dialog("open");
		}
		switch ($(this).attr("id")) {
			case "newarticle":
				submitUrl = "/";
				fillEditor("","","");
				break;
			case "newblog":
				var today = new Date();
				var month = today.getMonth() + 1;
				var year = today.getFullYear();
				submitUrl = "/" + year + "/" + month;
				fillEditor("","","");
				break;
			case "editbtn":
				submitUrl = "?_method=PUT";
				$.getJSON("?", {}, function(data) {
					fillEditor(data.body, data.title, data.tags);
					doOpen();
				});
				return;
		}
		doOpen();
	};

	var fillEditor = function(body, title, tags) {
		if (body === undefined) {
			body = "<p>Enter your text here</p>";
		}
		editor.setData(body);
		if (title !== undefined) {
			titleInput.val(title);
		}
		if (tags !== undefined) {
			if (tags.constructor == Array) {
				tags = tags.join(", ");
			}
			tagsInput.val(tags);
		}
	};

	var submitPost = function() {
		var body = editor.getData();
		var title = titleInput.val();
		var tags = tagsInput.val();

		agd.log("beginning submission");
		$.post(submitUrl, {body:body, title:title, tags:tags}, function(data) {
			agd.log("submission complete, response: " + data);
			window.location.href = data;
		});
	};

	var closeDialog = function() {
		dialog.dialog("close");
	};

	var dialogOnClose = function(event, ui) {
		agd.log("dialog closed");
	};

	var dialogOnOpen = function(event, ui) {
		agd.log("dialog opened");
	};

	dialogConfig = {
		autoOpen	: false,
		modal		: true,
		title		: "An Adequately Good Post Editor",
		width		: 800,
		close		: dialogOnClose,
		open		: dialogOnOpen,
		buttons		: {
			"Submit"	: submitPost,
			"Cancel"	: closeDialog
		}
	};

	var submitDelete = function() {
		$.ajax({
			type 		: "DELETE",
			url 		: "#",
			success 	: function(data) { window.location.href = data; },
			dataType 	: "text"
		});
	};

	var openDeleteDialog = function() {
		$("<div/>").text("Are you sure you want to delete this entry?").dialog({
			modal	: true,
			title	: "Confirm Deletion",
			buttons	: {
				"Delete it!"	: submitDelete,
				"Cancel!"		: function() {
					$(this).dialog("destroy");
				}
			}
		});
	};

	// Bind event handlers, etc.
	$(function() {
		initDialog();
		$("#newblog, #newarticle, #editbtn").live("click", openDialog);
		$("#deletebtn").live("click", openDeleteDialog);
	});
})(jQuery);

