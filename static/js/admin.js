/**
 The MIT License
 
 Copyright (c) 2008 William T. Katz
 
 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to 
 deal in the Software without restriction, including without limitation 
 the rights to use, copy, modify, merge, publish, distribute, sublicense, 
 and/or sell copies of the Software, and to permit persons to whom the 
 Software is furnished to do so, subject to the following conditions:
 
 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.
 
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
 DEALINGS IN THE SOFTWARE.
**/

YAHOO.bloog.initAdmin = function() {

	var showRTE = function(e) {
		var hdr = $('div#postDialog div.hd');
		YAHOO.bloog.http = {};
		switch (this.id) {
			case 'newarticle':
				hdr.setContent('Submit Article');
				YAHOO.bloog.http.action = '/';
				YAHOO.bloog.http.verb = 'POST';
				YAHOO.bloog.postDialog.render();
				CKEDITOR.replace("postBody");
				YAHOO.bloog.postDialog.show();
				break;
			case 'newblog':
				hdr.setContent('Submit Blog Entry');
				var today = new Date();
				var month = today.getMonth() + 1;
				var year = today.getFullYear();
				YAHOO.bloog.http.action = "/" + year + "/" + month;
				YAHOO.bloog.http.verb = 'POST';
				YAHOO.bloog.postDialog.render();
				CKEDITOR.replace("postBody");
				YAHOO.bloog.postDialog.show();
				break;
			case 'editbtn':
				hdr.setContent('Submit Edit');
				YAHOO.bloog.http.action = '?_method=PUT';
				YAHOO.bloog.http.verb = 'POST';
				// Get the current article content and populate the dialog
				YAHOO.util.Connect.initHeader('Accept', 'application/json');
				YAHOO.util.Connect.asyncRequest('GET', '#', {
					success: YAHOO.bloog.populateDialog,
					failure: YAHOO.bloog.handleFailure
				}, null);
				break;
		}
	}

	YAHOO.bloog.populateDialog = function(o) {
		var article = eval('(' + o.responseText + ')')
		document.getElementById("postTitle").value = article.title;
		if (article.tags) {
			document.getElementById("postTags").value = article.tags.join(', ');
		}
//		YAHOO.bloog.editor.setEditorHTML(article.body);
//		YAHOO.util.Dom.get('postBody').value = article.body;
		CKEDITOR.replace("postBody");
		CKEDITOR.instances.postBody.setData(article.body, function() {
			YAHOO.bloog.postDialog.render();
			YAHOO.bloog.postDialog.show();
		});
	}

	var handleSubmit = function() {
//		YAHOO.bloog.editor.saveHTML();
//		var html = YAHOO.bloog.editor.get('element').value;
//		var html = YAHOO.util.Dom.get('postBody').value;
		var html = CKEDITOR.instances.postBody.getData();
		var title = YAHOO.util.Dom.get('postTitle').value;
		var tags = YAHOO.util.Dom.get('postTags').value;
		var postData = 'title=' + encodeURIComponent(title) + '&' +
					   'tags=' + encodeURIComponent(tags) + '&' +
					   'body=' + encodeURIComponent(html);
		var cObj = YAHOO.util.Connect.asyncRequest(
			YAHOO.bloog.http.verb, 
			YAHOO.bloog.http.action, 
			{ success: submitSuccess, 
			  failure: YAHOO.bloog.handleFailure },
			postData);
	}

	var submitSuccess = function(response) {
		CKEDITOR.instances.postBody.destroy();
		YAHOO.bloog.handleSuccess(response);
	};

	var cancelPost = function() {
		CKEDITOR.instances.postBody.destroy();
		this.cancel();
	};

	YAHOO.bloog.postDialog = new YAHOO.widget.Dialog(
		"postDialog", {
			width: "520px",
			fixedcenter: true,
			visible: false,
			modal: true,
			constraintoviewpoint: true,
			buttons: [ { text: "Submit", handler: handleSubmit, 
						 isDefault:true },
					   { text: "Cancel", handler: cancelPost } ]
	});

	YAHOO.bloog.postDialog.hideEvent.subscribe(function() {
		CKEDITOR.instances.postBody.destroy();
	});

	YAHOO.bloog.postDialog.validate = function() {
		var data = this.getData();
		if (data.postTitle == "") {
			alert("Please enter a title for this post.");
			return false;
		}
		return true;
	}
	YAHOO.bloog.postDialog.callback = { success: submitSuccess, 
										failure: YAHOO.bloog.handleFailure };
	

	var handleDelete = function() {
		var cObj = YAHOO.util.Connect.asyncRequest(
			'DELETE',
			'#', 
			{ success: YAHOO.bloog.handleSuccess, 
			  failure: YAHOO.bloog.handleFailure }
		);
	}
	YAHOO.bloog.deleteDialog = new YAHOO.widget.SimpleDialog(
		"confirmDlg", {
			width: "20em",
			effect: { effect:YAHOO.widget.ContainerEffect.FADE, duration:0.25 },
			fixedcenter: true,
			modal: true,
			visible: false,
			draggable: false,
			buttons: [ { text: "Delete!", handler: handleDelete },
					   { text: "Cancel", 
						 handler: function () { this.hide(); },
						 isDefault: true } ]
		})
	YAHOO.bloog.deleteDialog.setHeader("Warning");
	YAHOO.bloog.deleteDialog.setBody("Are you sure you want to delete this post?");
	YAHOO.bloog.deleteDialog.render(document.body);
	
	YAHOO.util.Event.on("newarticle", "click", showRTE);
	YAHOO.util.Event.on("newblog", "click", showRTE);
	YAHOO.util.Event.on("editbtn", "click", showRTE);
	YAHOO.util.Event.on("deletebtn", "click", function (e) { YAHOO.bloog.deleteDialog.show(); });
}

YAHOO.util.Event.onDOMReady(YAHOO.bloog.initAdmin);
