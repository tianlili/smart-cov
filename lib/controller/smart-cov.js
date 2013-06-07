function init(w) {

    // check if we are in inverted mode
    if (w.opener) {
        try {
            if (w.opener.top.__coverage__) {
                if (!w.__coverage__) {
                    w.__coverage__ = w.opener.top.__coverage__;
                }
            } else {
            }
        } catch (e) {
            try {
                if (w.opener.__coverage__) {
                    if (!w.__coverage__) {
                        w.__coverage__ = w.opener.__coverage__;
                    }
                } else {
                }
            } catch (e2) {
            }
        }
    } else {
    }

    if (!w.__coverage__) {
        w.__coverage__ = {};
    }
}

function getQueryStringRegExp(name) {
    var reg = new RegExp("(^|\\?|&)"+ name +"=([^&]*)(\\s|&|$)", "i");  
    if (reg.test(location.href)) return unescape(RegExp.$2.replace(/\+/g, " ")); return "";
}

var currentFile = null;

var inLengthyOperation = false;

var isReport = getQueryStringRegExp('report');

init(window);

function createRequest() {
    if (window.ActiveXObject) {
        return new ActiveXObject("Microsoft.XMLHTTP");
    } else {
        return new XMLHttpRequest();
    }
}

function findPos(obj) {
    var result = 0;
    do {
        result += obj.offsetTop;
        obj = obj.offsetParent;
    }
    while (obj);
    return result;
}

function getViewportHeight() {
    ///MSIE/.test(navigator.userAgent)
    if (self.innerHeight) {
        // all except Explorer
        return self.innerHeight;
    } else if (document.documentElement && document.documentElement.clientHeight) {
        // Explorer 6 Strict Mode
        return document.documentElement.clientHeight;
    } else if (document.body) {
        // other Explorers
        return document.body.clientHeight;
    } else {
        throw "Couldn't calculate viewport height";
    }
}

function beginLengthyOperation() {
    inLengthyOperation = true;
    
    if (!/Opera|WebKit/.test(navigator.userAgent)) {
        /*
    Change the cursor style of each element.  Note that changing the class of the
    element (to one with a busy cursor) is buggy in IE.
    */
        var tabs = document.getElementById('tabs').getElementsByTagName('div');
        var i;
        for (i = 0; i < tabs.length; i++) {
            tabs.item(i).style.cursor = 'wait';
        }
    }
}

function endLengthyOperation() {
    setTimeout(function () {
        inLengthyOperation = false;

        var tabs = document.getElementById('tabs').getElementsByTagName('div');
        var i;
        for (i = 0; i < tabs.length; i++) {
            tabs.item(i).style.cursor = '';
        }
    }, 50);
}

function setSize() {
    // /MSIE/.test(navigator.userAgent)
    var viewportHeight = getViewportHeight();

    /*
  border-top-width:     1px
  padding-top:         10px
  padding-bottom:      10px
  border-bottom-width:  1px
  margin-bottom:       10px
                       ----
                       32px
  */
    var tabPages = document.getElementById('tabPages');
    var tabPageHeight = (viewportHeight - findPos(tabPages) - 32) + 'px';
    var nodeList = tabPages.childNodes;
    var length = nodeList.length;
    for (var i = 0; i < length; i++) {
        var node = nodeList.item(i);
        if (node.nodeType !== 1) {
            continue;
        }
        node.style.height = tabPageHeight;
    }

    var iframeDiv = document.getElementById('iframeDiv');
    // may not exist if we have removed the first tab
    if (iframeDiv) {
        iframeDiv.style.height = (viewportHeight - findPos(iframeDiv) - 21) + 'px';
    }

    var summaryDiv = document.getElementById('summaryDiv');
    summaryDiv.style.height = (viewportHeight - findPos(summaryDiv) - 21) + 'px';

    var sourceDiv = document.getElementById('sourceDiv');
    sourceDiv.style.height = (viewportHeight - findPos(sourceDiv) - 21) + 'px';

    var storeDiv = document.getElementById('storeDiv');
    if (storeDiv) {
        storeDiv.style.height = (viewportHeight - findPos(storeDiv) - 21) + 'px';
    }
}

/**
Returns the boolean value of a string.  Values 'false', 'f', 'no', 'n', 'off',
and '0' (upper or lower case) are false.
@param  s  the string
@return  a boolean value
*/

function getBooleanValue(s) {
    s = s.toLowerCase();
    if (s === 'false' || s === 'f' || s === 'no' || s === 'n' || s === 'off' || s === '0') {
        return false;
    }
    return true;
}

function removeTab(id) {
    var tab = document.getElementById(id + 'Tab');
    tab.parentNode.removeChild(tab);
    var tabPage = document.getElementById(id + 'TabPage');
    tabPage.parentNode.removeChild(tabPage);
}

function isValidURL(url) {
    // RFC 3986
    var matches = /^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/.exec(url);
    if (matches === null) {
        return false;
    }
    var scheme = matches[1];
    if (typeof scheme === 'string') {
        scheme = scheme.toLowerCase();
        return scheme === '' || scheme === 'file:' || scheme === 'http:' || scheme === 'https:';
    }
    return true;
}

/**
Initializes the contents of the tabs.  This sets the initial values of the
input field and iframe in the "Browser" tab and the checkbox in the "Summary"
tab.
@param  queryString  this should always be location.search
*/

function initTabContents(queryString) {
    var url = null;
    var windowURL = null;
    var parameters, parameter, i, index, name, value;
    if (queryString.length > 0) {
        // chop off the question mark
        queryString = queryString.substring(1);
        parameters = queryString.split(/&|;/);
        for (i = 0; i < parameters.length; i++) {
            parameter = parameters[i];
            index = parameter.indexOf('=');
            if (index === -1) {
                // still works with old syntax
                url = decodeURIComponent(parameter);
            } else {
                name = parameter.substr(0, index);
                value = decodeURIComponent(parameter.substr(index + 1));
                if (name === 'missing' || name === 'm') {
                    showMissingColumn = getBooleanValue(value);
                } else if (name === 'url' || name === 'u' || name === 'frame' || name === 'f') {
                    url = value;
                } else if (name === 'window' || name === 'w') {
                    windowURL = value;
                }
            }
        }
    }

    var isValidURL = function (url) {
        var result = isValidURL(url);
        if (!result) {
            alert('Invalid URL: ' + url);
        }
        return result;
    };

    if (url !== null && isValidURL(url)) {
        // this will automatically propagate to the input field
        frames[0].location = url;
    } else if (windowURL !== null && isValidURL(windowURL)) {
        window.open(windowURL);
    }

    // if the browser tab is absent, we have to initialize the summary tab
    if (!document.getElementById('browserTab')) {
        recalculateSummaryTab();
    }
}

function body_load() {
    // check if this is a file: URL
    if (window.location && window.location.href && /^file:/i.test(window.location.href)) {
        var warningDiv = document.getElementById('warningDiv');
        warningDiv.style.display = 'block';
    }

    function reportError(e) {
        endLengthyOperation();
        var div = document.getElementById('summaryErrorDiv');
        div.innerHTML = 'Error: ' + e;
    }

    if (isReport) {
        beginLengthyOperation();
        var request = createRequest(),
        	json_file = isReport == 'true' ? 'coverage.json' : isReport;
        try {
            request.open('GET', 'data/' + json_file, true);
            request.onreadystatechange = function (event) {
                if (request.readyState === 4 && request.status == 200) {
                    try {
                        var response = request.responseText, json;
                        if (window.JSON && window.JSON.parse) {
                            json = window.JSON.parse(response);
                        } else {
                            json = eval('(' + response + ')');
                        }

                        var file;
                        for (file in json) {
                            if (!json.hasOwnProperty(file)) {
                                continue;
                            }

                            __coverage__[file] = json[file];
                        }
                        recalculateSummaryTab();
                    } catch (e) {
                        reportError(e);
                    }
                }
            };
            request.send(null);
        } catch (e) {
            reportError(e);
        }

        removeTab('browser');
        removeTab('store');
    }

    initTabControl();

    initTabContents(location.search);
    
    body_style_init();
}

function body_style_init() {
    if (parseInt(navigator.userAgent.match(/MSIE ([\d.]+)/)[1]) <= 7) {
    	
    	var link = document.createElement("link");
    	link.rel = "stylesheet";
    	link.type = "text/css";
    	link.href = "smart-cov-ie.css";
    	var head = document.getElementsByTagName("head")[0];
    	head.appendChild(link);
    	
        setSize();
    }
}

// -----------------------------------------------------------------------------
// tab 1

function updateBrowser() {
    var input = document.getElementById("location");
    frames[0].location = input.value;
}

function openWindow() {
    var input = document.getElementById("location");
    var url = input.value;
    window.open(url);
}

function input_keypress(e) {
    if (e.keyCode === 13) {
        if (e.shiftKey) {
            openWindow();
        } else {
            updateBrowser();
        }
    }
}

function openInFrameButton_click() {
    updateBrowser();
}

function openInWindowButton_click() {
    openWindow();
}

function browser_load() {
    /* update the input box */
    var input = document.getElementById("location");

    /* sometimes IE seems to fire this after the tab has been removed */
    if (input) {
        input.value = frames[0].location;
    }
}

// -----------------------------------------------------------------------------
// tab 2

function createHandler(file, line) {
    get(file, line);
    return false;
}

function recalculateSummaryTab() {
	var table, tbody, ccList;

    ccList = window.__coverage__;
    
    if (!ccList) {
        throw "No coverage information found.";
    }
    
    var summaryDiv = document.getElementById("summaryDiv");
    summaryDiv.innerHTML = format(templates.controllerCodeList,withWidths({
    	codeList: codeListTemplate(ccList)
    }));
    
    endLengthyOperation();
}

// -----------------------------------------------------------------------------
// tab 3

/**
Loads the given file (and optional line) in the source tab.
*/

function get(file) {
    if (inLengthyOperation) {
        return;
    }
    beginLengthyOperation();
    setTimeout(function () {
        var sourceDiv = document.getElementById('sourceDiv');
        sourceDiv.innerHTML = '';
        selectTab('sourceTab');
        if (file === currentFile) {
            recalculateSourceTab();
        } else {
            if (currentFile === null) {
                var tab = document.getElementById('sourceTab');
                tab.onclick = tab_click;
            }
            currentFile = file;
            var fileDiv = document.getElementById('fileDiv');
            fileDiv.innerHTML = currentFile;
            recalculateSourceTab();
            return;
        }
    }, 50);
}

/**
Calculates coverage statistics for the current source file.
*/

function recalculateSourceTab() {
    if (!currentFile) {
        endLengthyOperation();
        return;
    }
    var coverage = __coverage__[currentFile], lines = coverage.code;

    // this can happen if there is an error in the original JavaScript file
    if (!lines) {
        lines = [];
    }
    
    var sourceDiv = document.getElementById('sourceDiv');
    sourceDiv.innerHTML = templates.controllerCodeDetail;
    
    var detailDiv = document.getElementById('code-detail');
    detailDiv.style.display = "block";
    
    asnyShowCode(coverage);
    
    endLengthyOperation();
}

// -----------------------------------------------------------------------------
// tabs

/**
Initializes the tab control.  This function must be called when the document is
loaded.
*/

function initTabControl() {
    var tabs = document.getElementById('tabs');
    var i;
    var child;
    var tabNum = 0;
    for (i = 0; i < tabs.childNodes.length; i++) {
        child = tabs.childNodes.item(i);
        if (child.nodeType === 1) {
            if (child.className !== 'disabled') {
                child.onclick = tab_click;
            }
            tabNum++;
        }
    }
    selectTab(0);
}

/**
Selects a tab.
@param  tab  the integer index of the tab (0, 1, 2, or 3)
             OR
             the ID of the tab element
             OR
             the tab element itself
*/

function selectTab(tab) {
    if (typeof tab !== 'number') {
        tab = tabIndexOf(tab);
    }
    var tabs = document.getElementById('tabs');
    var tabPages = document.getElementById('tabPages');
    var nodeList;
    var tabNum;
    var i;
    var node;

    nodeList = tabs.childNodes;
    tabNum = 0;
    for (i = 0; i < nodeList.length; i++) {
        node = nodeList.item(i);
        if (node.nodeType !== 1) {
            continue;
        }

        if (tabNum === tab) {
            node.className = 'selected';
        } else {
        	if (node.className !== 'disabled')
        		node.className = '';
        }
        tabNum++;
    }

    nodeList = tabPages.childNodes;
    tabNum = 0;
    for (i = 0; i < nodeList.length; i++) {
        node = nodeList.item(i);
        if (node.nodeType !== 1) {
            continue;
        }

        if (tabNum === tab) {
            node.className = 'selected TabPage';
        } else {
            node.className = 'TabPage';
        }
        tabNum++;
    }
}

/**
Returns an integer (0, 1, 2, or 3) representing the index of a given tab.
@param  tab  the ID of the tab element
             OR
             the tab element itself
*/

function tabIndexOf(tab) {
    if (typeof tab === 'string') {
        tab = document.getElementById(tab);
    }
    var tabs = document.getElementById('tabs');
    var i;
    var child;
    var tabNum = 0;
    for (i = 0; i < tabs.childNodes.length; i++) {
        child = tabs.childNodes.item(i);
        if (child.nodeType === 1) {
            if (child === tab) {
                return tabNum;
            }
            tabNum++;
        }
    }
    throw "Tab not found";
}

function tab_click(e) {
    if (inLengthyOperation) {
        return;
    }
    var target;
    if (e) {
        target = e.target;
    } else if (window.event) {
        // IE
        target = window.event.srcElement;
    }
    if (target.className === 'selected') {
        return;
    }
    beginLengthyOperation();
    setTimeout(function () {
        if (target.id === 'summaryTab') {
            var tbody = document.getElementById("summaryDiv");
            while (tbody.hasChildNodes()) {
                tbody.removeChild(tbody.firstChild);
            }
        } else if (target.id === 'sourceTab') {
            var sourceDiv = document.getElementById('sourceDiv');
            sourceDiv.innerHTML = '';
        }
        selectTab(target);
        if (target.id === 'summaryTab') {
            recalculateSummaryTab();
        } else if (target.id === 'sourceTab') {
            recalculateSourceTab();
        } else {
            endLengthyOperation();
        }
    }, 50);
}

// -----------------------------------------------------------------------------
// reports

function storeButton_click() {
    if (inLengthyOperation) {
        return;
    }

    beginLengthyOperation();

    var request = createRequest();
    request.open('POST', 'coverage-store.php', true);
    request.onreadystatechange = function (event) {
        if (request.readyState === 4) {
            var message;
            try {
                if (request.status !== 200 && request.status !== 201 && request.status !== 204) {
                    throw request.status;
                }
                message = request.responseText;
            } catch (e) {
                if (e.toString().search(/^\d{3}$/) === 0) {
                    message = e + ': ' + request.responseText;
                } else {
                    message = 'Could not connect to server: ' + e;
                }
            }

            endLengthyOperation();

            var div = document.getElementById('storeDiv');
            div.appendChild(document.createTextNode(new Date() + ': ' + message));
            div.appendChild(document.createElement('br'));
        }
    };
    request.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
    if(window.JSON && window.JSON.stringify)
    	request.send('content=' + encodeURIComponent(JSON.stringify(__coverage__)));
}