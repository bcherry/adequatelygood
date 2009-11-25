;(function($){
	var dialogConfig;
	var dialog;
	//var editor;
	var domObjs;
	var submitUrl = "/";
	var tmplName = "_tmpl_postDialog";
	
	var openDialog = function() {
		
		dialog = $("<div/>");
		domObjs = dialog.tmpl(tmplName,{});
		dialog.dialog(dialogConfig);
		
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
				$.getJSON("#", {}, function(data) {
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
		//editor.setData(body);
		$(domObjs.postBody).val(body);
		if (title !== undefined) {
			$(domObjs.postTitle).val(title);
		}
		if (tags !== undefined) {
			if (tags.constructor == Array) {
				tags = tags.join(", ");
			}
			$(domObjs.postTags).val(tags);
		}
	};

	var submitPost = function() {
		var body = $(domObjs.postBody).val();
		var title = $(domObjs.postTitle).val();
		var tags = $(domObjs.postTags).val();

		consul.log("beginning submission");
		$.post(submitUrl, {body:body, title:title, tags:tags}, function(data) {
			consul.log("submission complete, response: " + data);
			window.location.href = data;
		}, function(data){alert(data);});
	};
	
	var hardReset = function() {
		dialog.dialog("destroy");
		delete dialog;
		delete domObjs;
	};

	var closeDialog = function() {
		dialog.dialog("close");
		hardReset();
	};

	var dialogOnClose = function(event, ui) {
		hardReset();
		consul.log("dialog closed");
	};

	var dialogOnOpen = function(event, ui) {
		consul.log("dialog opened");
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
		$("#newblog, #newarticle, #editbtn").live("click", openDialog);
		$("#deletebtn").live("click", openDeleteDialog);
	});
})(jQuery);

