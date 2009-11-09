
YAHOO.namespace("bloog");

YAHOO.bloog.toggleDiv = function (e) {
    var archives = document.getElementById("archives");
    if (archives.style.display == 'none') {
        archives.style.display = 'block';
    } else {
        archives.style.display = 'none';
    }
}
YAHOO.bloog.initArchive = function () {
    YAHOO.util.Event.addListener("archiveLink", "click", YAHOO.bloog.toggleDiv);
}
YAHOO.util.Event.onDOMReady(YAHOO.bloog.initArchive);

// Some handlers that get used by multiple javascript modules

YAHOO.bloog.handleSuccess = function (o) {
    var response = o.responseText;
    response = response.split("<!")[0];
    // Redirect to this new URL -- For some reason this has problems in Safari
    window.location.href = response;
};
YAHOO.bloog.handleFailure = function (o) {
    alert("Submission failed: " + o.status);
};
YAHOO.bloog.handleCancel = function () {
    this.cancel();
}
