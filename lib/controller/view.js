// -----------------------------------------------------------------------------
// list
var templates= {
	controllerCodeList: [
            "<table class='table compact-width' width='100%'>",
            "<thead>",
            "<tr>",
            "<th width='@{widthIndex}'>#</th>",
            "<th width='@{widthName}'>&#21517;&#31216;</th>",
            "<th width='@{widthCoverStatement}'>&#35821;&#21477;&#35206;&#30422;</th>",
            "<th width='@{widthCoverBranch}'>&#20998;&#25903;&#35206;&#30422;</th>",
            "<th width='@{widthCoverFunction}'>&#20989;&#25968;&#35206;&#30422;</th>",
            "<th width='@{widthCoverStatementGraph}'>&#35821;&#21477;&#35206;&#30422;&#27604;&#20363;</th>",
            "</tr>",
            "</thead>",
            "</table>",
            "<div id='list-codes' class='scrollable'>",
            "<table class='table table-striped table-hover table-condensed' width='100%'>",
            "<colgroup>",
            "<col width='@{widthIndex}'>",
            "<col width='@{widthName}'>",
            "<col width='@{widthCoverStatement}'>",
            "<col width='@{widthCoverBranch}'>",
            "<col width='@{widthCoverFunction}'>",
            "<col width='@{widthCoverStatementGraph}'>",
            "</colgroup>",
            "<tbody id='list-codes-tbody'>",
            "@{codeList}",
            "</tbody>",
            "</table>",
            "</div>"
    ].join(""),
    
    controllerCodeDetail: [
            "<div id='code-detail' class='absolute'>",
            "<div class='code-toolbar clearfix'>",
            "<ul class='code-toolbar-inner'>",
            "<li class='close-button-like'><button class='close' action='code#close'>&times;</button></li>",

        "<li class='tab-like'>",
            "<ul id='code-detail-head' class='nav nav-tabs' data-target='code-detail-body'>",
            "<li class='active'><a href='' onclick='return false;'>&#20195;&#30721;</a></li>",
            "<li><a href='' onclick='return false;'>&#20449;&#24687;</a></li>",
            "</ul>",
            "</li>",

        "<li class='label-like right tab-desc tab-desc-0'>&#24050;&#25191;&#34892;</li>",
            "<li class='image-like right tab-desc tab-desc-0'><div class='arrive image'></div></li>",
            "<li class='label-like right tab-desc tab-desc-0'>&#26410;&#25191;&#34892;&#20998;&#25903;</li>",
            "<li class='image-like right tab-desc tab-desc-0'><div class='unarrivebran image'></div></li>",
            "<li class='label-like right tab-desc tab-desc-0'>&#26410;&#25191;&#34892;&#20989;&#25968;</li>",
            "<li class='image-like right tab-desc tab-desc-0'><div class='unarrivefunc image'></div></li>",
            "<li class='label-like right tab-desc tab-desc-0'>&#26410;&#25191;&#34892;&#35821;&#21477;</li>",
            "<li class='image-like right tab-desc tab-desc-0'><div class='unarrivestat image'></div></li>",
            "<li class='label-like right tab-desc tab-desc-0'>&#22270;&#20363;&#65306;</li>",
            "</ul>",
            "</div>",
            "<div id='code-content' class='relative scrollable'></div>",
            "</div>"
    ].join(""),

    codeListTotal: [
            "<tr class='total'>",
            "<td><div class='ellipsisable'>0</div></td>",
            "<td><div class='ellipsisable'>Total</div></td>",
            "<td><div id='code-total-coverStatement' class='ellipsisable'>@{coverStatementTotal}</div></td>",
            "<td><div id='code-total-coverBranch' class='ellipsisable'>@{coverBranchTotal}</div></td>",
            "<td><div id='code-total-coverFunction' class='ellipsisable'>@{coverFunctionTotal}</div></td>",
            "<td><div id='code-total-coverStatementGraph' class='ellipsisable'><div class='pctGraph'><div class='covered' style='width: @{coverStatementGraphTotal}px;'></div></div></div></td>",
            "</tr>"
    ].join(""),

    codeListLine: [
            "<tr data-code-id='@{id}'>",
            "<td><div class='ellipsisable'>@{index}</div></td>",
            "<td><div class='ellipsisable'><a href='javaScript:void(0)' onclick='jscoverage_createHandler(\"@{fileName}\")'>@{fileName}</a></div></td>",
            "<td><div id='code-@{id}-coverStatement' class='ellipsisable'>@{coverStatement}</div></td>",
            "<td><div id='code-@{id}-coverBranch' class='ellipsisable'>@{coverBranch}</div></td>",
            "<td><div id='code-@{id}-coverFunction' class='ellipsisable'>@{coverFunction}</div></td>",
            "<td><div id='code-@{id}-coverStatementGraph' class='ellipsisable'><div class='pctGraph'><div class='covered' style='width: @{coverStatementGraph}px;'></div></div></div></td>",
            "</tr>"
    ].join("")
}

//实现 ECMA-262, Edition 5, 15.4.4.19
//参考: http://es5.github.com/#x15.4.4.19
if (!Array.prototype.map) {
Object.prototype.map = function(callback, thisArg) {

 var T, A, k;

 if (this == null) {
   throw new TypeError(" this is null or not defined");
 }

 // 1. 将O赋值为调用map方法的数组.
 var O = Object(this);

 // 2.将len赋值为数组O的长度.
 var len = O.length >>> 0;

 // 4.如果callback不是函数,则抛出TypeError异常.
 if ({}.toString.call(callback) != "[object Function]") {
   throw new TypeError(callback + " is not a function");
 }

 // 5. 如果参数thisArg有值,则将T赋值为thisArg;否则T为undefined.
 if (thisArg) {
   T = thisArg;
 }

 // 6. 创建新数组A,长度为原数组O长度len
 A = new Array(len);

 // 7. 将k赋值为0
 k = 0;

 // 8. 当 k < len 时,执行循环.
 while(k < len) {

   var kValue, mappedValue;

   //遍历O,k为原数组索引
   if (k in O) {

     //kValue为索引k对应的值.
     kValue = O[ k ];

     // 执行callback,this指向T,参数有三个.分别是kValue:值,k:索引,O:原数组.
     mappedValue = callback.call(T, kValue, k, O);

     // 返回值添加到新书组A中.
     A[ k ] = mappedValue;
   }
   // k自增1
   k++;
 }

 // 9. 返回新数组A
 return A;
};      
}

var format = function (source, data) {
    var rtn = source,
        blank = {}, item;

    for (var key in data) {
        if (!data.hasOwnProperty(key))
            continue;

        if (item = data[key])
            item = item.toString().replace(/\$/g, "$$$$");

        item = typeof item === "undefined" ? "" : item;
        rtn = rtn.replace(RegExp("@{" + key + "}", "g"), item);
    }

    return rtn.toString();
}

var id = function (id) {
    return function () {
        return "_" + id++;
    }
}(0)

var tag = function (html, tagName, className) {
    var result, t;

    result = html;
    tagName = tagName.split(" ");

    while (t = tagName.pop())
        result = "<" + t + ">" + result + "</" + t + ">";

    if (className)
        result = result.replace(/<(\w+)>/,
            "<$1 class='" + className + "'>");

    return result;
}

var html = function (string) {
    return string.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

var width = function () {
    var mapping;

    mapping = {
        index: "3%",
        name: "37%",
        "cover-statement": "15%",
        "cover-branch": "15%",
        "cover-function": "15%",
        "cover-statement-graph": "15%"
    };

    return function (name, type) {
        return mapping[name];
    };
}()

var withWidths = function (data) {
    var widths = {
        widthIndex: width("index"),
        widthName: width("name"),
        widthType: width("type"),
        widthCoverStatement: width("cover-statement"),
        widthCoverBranch: width("cover-branch"),
        widthCoverFunction: width("cover-function"),
        widthCoverStatementGraph: width("cover-statement-graph")
    };

    if (!data)
        return widths;

    for (var i in widths)
        data[i] = widths[i];

    return data;
}

var round = function (digit, length) {
    length = length ? parseInt(length) : 0;
    if (length <= 0) return Math.round(digit);
    digit = Math.round(digit * Math.pow(10, length)) / Math.pow(10, length);
    return digit;
}

var coverStatement = function (cc) {
    var scov = 0,
        ssum = 0;
    if (cc)
        var s = cc.s;
    for (var i in s) {
        ssum++;
        if (s[i] > 0)
            scov++;
    }

    if (cc) {
        cc.ssum = ssum;
        cc.scov = scov;
    }

    var srate = ssum == 0 ? 1 : scov / ssum;
    if (cc)
        return round(srate * 100, 2) + "% (" + scov + "/" + ssum + ")";
    else return "<font class=nan>NAN</font>";
};

var coverBranch = function (cc) {
    var bcov = 0,
        bsum = 0;
    if (cc)
        var b = cc.b;
    for (var i in b) {
        for (var j = 0; j < b[i].length; j++) {
            bsum++;
            if (b[i][j] > 0)
                bcov++;
        }
    }

    if (cc) {
        cc.bsum = bsum;
        cc.bcov = bcov;
    }

    var brate = bsum == 0 ? 1 : bcov / bsum;

    if (cc)
        return round(brate * 100, 2) + "% (" + bcov + "/" + bsum + ")";
    else return "<font class=nan>NAN</font>";
};

var coverFunction = function (cc) {
    var fcov = 0,
        fsum = 0;
    if (cc)
        var f = cc.f;
    for (var i in f) {
        fsum++;
        if (f[i] > 0)
            fcov++;
    }

    if (cc) {
        cc.fsum = fsum;
        cc.fcov = fcov;
    }

    var frate = fsum == 0 ? 1 : fcov / fsum;

    if (cc)
        return round(frate * 100, 2) + "% (" + fcov + "/" + fsum + ")";
    else return "<font class=nan>NAN</font>";
};

var coverStatementGraph = function (cc) {
    if (cc) {
        var scov = cc.scov,
            ssum = cc.ssum;
    }

    var srate = ssum == 0 ? 1 : scov / ssum;

    return Math.round(srate * 100);
};

var coverStatementTotal = function (ccList) {
    var scov = 0,
        ssum = 0;

    for(var i in ccList){
    	ssum += ccList[i].ssum;
        scov += ccList[i].scov;
    }

    var srate = ssum == 0 ? 0 : scov / ssum;

    return round(srate * 100, 2) + "% (" + scov + "/" + ssum + ")";
};

var coverBranchTotal = function (ccList) {
    var bcov = 0,
        bsum = 0;

    for(var i in ccList){
    	bsum += ccList[i].bsum;
        bcov += ccList[i].bcov;
    }

    var brate = bsum == 0 ? 0 : bcov / bsum;

    return round(brate * 100, 2) + "% (" + bcov + "/" + bsum + ")";
};

var coverFunctionTotal = function (ccList) {
    var fcov = 0,
        fsum = 0;

    for(var i in ccList){
    	fsum += ccList[i].fsum;
        fcov += ccList[i].fcov;
    }

    var frate = fsum == 0 ? 0 : fcov / fsum;

    return round(frate * 100, 2) + "% (" + fcov + "/" + fsum + ")";
};

var coverStatementGraphTotal = function (ccList) {
    var scov = 0,
        ssum = 0;

    for(var i in ccList){
    	ssum += ccList[i].ssum;
        scov += ccList[i].scov;
    }

    var srate = ssum == 0 ? 0 : scov / ssum;

    return Math.round(srate * 100);
};

var codeTemplate = function (cc) {
    return format(templates.codeListLine, withWidths({
    	id: cc.path,
        index: ++codeIndex,
        fileName: cc.path,
        coverStatement: coverStatement(cc),
        coverBranch: coverBranch(cc),
        coverFunction: coverFunction(cc),
        coverStatementGraph: coverStatementGraph(cc)
    }));
};

var codeTotalTemplate = function (ccList) {
    return format(templates.codeListTotal, withWidths({
        coverStatementTotal: coverStatementTotal(ccList),
        coverBranchTotal: coverBranchTotal(ccList),
        coverFunctionTotal: coverFunctionTotal(ccList),
        coverStatementGraphTotal: coverStatementGraphTotal(ccList)
    }));
};

var codeListTemplate = function (ccList) {
    var htmls;

    htmls = [];

    codeIndex = 0; 
    
    for(var i in ccList){
        htmls[codeIndex + 1] = codeTemplate(ccList[i]);
    };

    htmls[0] = codeTotalTemplate(ccList);

    return htmls.join("");
}


//-----------------------------------------------------------------------------
//details
function InsertionText(text, consumeBlanks) {
    this.text = text;
    this.origLength = text.length;
    this.offsets = [];
    this.consumeBlanks = consumeBlanks;
    this.startPos = this.findFirstNonBlank();
    this.endPos = this.findLastNonBlank();
}

var WHITE_RE = /[ \f\n\r\t\v\u00A0\u2028\u2029]/;

InsertionText.prototype = {

    findFirstNonBlank: function () {
        var pos = -1,
            text = this.text,
            len = text.length,
            i;
        for (i = 0; i < len; i += 1) {
            if (!text.charAt(i).match(WHITE_RE)) {
                pos = i;
                break;
            }
        }
        return pos;
    },
    findLastNonBlank: function () {
        var text = this.text,
            len = text.length,
            pos = text.length + 1,
            i;
        for (i = len - 1; i >= 0; i -= 1) {
            if (!text.charAt(i).match(WHITE_RE)) {
                pos = i;
                break;
            }
        }
        return pos;
    },
    originalLength: function () {
        return this.origLength;
    },

    insertAt: function (col, str, insertBefore, consumeBlanks) {
        consumeBlanks = typeof consumeBlanks === 'undefined' ? this.consumeBlanks : consumeBlanks;
        col = col > this.originalLength() ? this.originalLength() : col;
        col = col < 0 ? 0 : col;

        if (consumeBlanks) {
            if (col < this.startPos) {
                col = 0;
            }
            if (col > this.endPos) {
                col = this.origLength;
            }
        }

        var len = str.length,
            offset = this.findOffset(col, len, insertBefore),
            realPos = col + offset,
            text = this.text;
        this.text = text.substring(0, realPos) + str + text.substring(realPos);
        return this;
    },

    findOffset: function (pos, len, insertBefore) {
        var offsets = this.offsets,
            offsetObj,
            cumulativeOffset = 0,
            i;

        for (i = 0; i < offsets.length; i += 1) {
            offsetObj = offsets[i];
            if (offsetObj.pos < pos || (offsetObj.pos === pos && !insertBefore)) {
                cumulativeOffset += offsetObj.len;
            }
            if (offsetObj.pos >= pos) {
                break;
            }
        }
        if (offsetObj && offsetObj.pos === pos) {
            offsetObj.len += len;
        } else {
            offsets.splice(i, 0, {
                pos: pos,
                len: len
            });
        }
        return cumulativeOffset;
    },

    wrap: function (startPos, startText, endPos, endText, insertBefore, consumeBlanks) {
        this.insertAt(startPos, startText, insertBefore || true, consumeBlanks);
        this.insertAt(endPos, endText, insertBefore || false, consumeBlanks);
        return this;
    },

    wrapLine: function (startText, endText) {
        this.wrap(0, startText, this.originalLength(), endText);
    },

    toString: function () {
        return this.text;
    }
};

var Annotate = function () {
    var lt = '\u0001',
        gt = '\u0002';

    function annotateStatements(fileCoverage, structuredText) {
        var statementStats = fileCoverage.s,
            statementMeta = fileCoverage.statementMap;
        Object.keys(statementStats).forEach(function (stName) {
            var count = statementStats[stName],
                meta = statementMeta[stName],
                type = count > 0 ? 'yes' : 'no',
                startCol = meta.start.column,
                endCol = meta.end.column,
                startLine = meta.start.line,
                endLine = meta.end.line,
                openSpan = lt + 'span class=cstat-no' + gt,
                closeSpan = lt + '/span' + gt,
                text;

            if (type === 'no') {
                if (endLine !== startLine) {
                    for (var i = startLine; i <= endLine; i++) {
                        text = structuredText[i].text;
                        if (!(i == endLine && endCol == text.startPos))
                            if (!/^[ \f\n\r\t\v\u00A0\u2028\u2029]*(\/\/[\S\s]*)*(\/\*[\S\s]*)*$/.test(text.text))
                                text.wrap(i == startLine ? startCol : text.startPos,
                                    openSpan,
                                    i == endLine ? endCol : text.originalLength(),
                                    closeSpan);
                    }
                } else {
                    text = structuredText[startLine].text;
                    text.wrap(startCol, openSpan, endCol, closeSpan);
                }
            }
        });
    };

    function annotateFunctions(fileCoverage, structuredText) {

        var fnStats = fileCoverage.f,
            fnMeta = fileCoverage.fnMap;
        if (!fnStats) {
            return;
        }
        Object.keys(fnStats).forEach(function (fName) {
            var count = fnStats[fName],
                meta = fnMeta[fName],
                type = count > 0 ? 'yes' : 'no',
                startCol = meta.loc.start.column,
                endCol = meta.loc.end.column + 1,
                startLine = meta.loc.start.line,
                endLine = meta.loc.end.line,
                openSpan = lt + 'span class=fstat-no' + gt,
                closeSpan = lt + '/span' + gt,
                text;

            if (type === 'no') {
                if (endLine !== startLine) {
                    endLine = startLine;
                    endCol = structuredText[startLine].text.originalLength();
                }
                text = structuredText[startLine].text;
                text.wrap(startCol, openSpan, endCol, closeSpan, true);
            }
        });
    }

    function annotateBranches(fileCoverage, structuredText) {
        var branchStats = fileCoverage.b,
            branchMeta = fileCoverage.branchMap;
        if (!branchStats) {
            return;
        }

        Object.keys(branchStats).forEach(function (branchName) {
            var branchArray = branchStats[branchName],
                sumCount = branchArray.reduce(function (p, n) {
                    return p + n;
                }, 0),
                metaArray = branchMeta[branchName].locations,
                i,
                count,
                meta,
                type,
                startCol,
                endCol,
                startLine,
                endLine,
                openSpan,
                closeSpan,
                text;

            if (sumCount > 0) { // only highlight if partial branches are
                // missing
                for (i = 0; i < branchArray.length; i += 1) {
                    count = branchArray[i];
                    meta = metaArray[i];
                    type = count > 0 ? 'yes' : 'no';
                    startCol = meta.start.column;
                    endCol = meta.end.column;
                    startLine = meta.start.line;
                    endLine = meta.end.line;
                    openSpan = lt + 'span class=cbranch-no' + gt;
                    closeSpan = lt + '/span' + gt;

                    if (count === 0) { // skip branches taken
                        if (endLine !== startLine) {
                            for (var j = startLine; j <= endLine; j++) {
                                text = structuredText[j].text;
                                if (!(j == endLine && endCol == text.startPos))
                                    if (!/^[ \f\n\r\t\v\u00A0\u2028\u2029]*(\/\/[\S\s]*)*(\/\*[\S\s]*)*$/.test(text.text))
                                        text.wrap(j == startLine ? startCol : text.startPos,
                                            openSpan,
                                            j == endLine ? endCol : text.originalLength(),
                                            closeSpan);
                            }
                        } else {
                            text = structuredText[startLine].text;
                            if (branchMeta[branchName].type === 'if') {
                                text.insertAt(startCol, lt + 'span class=missing-if-branch' +
                                    gt + (i === 0 ? 'I' : 'E') + lt + '/span' + gt, true, false);
                            } else {
                                text.wrap(startCol, openSpan, endCol, closeSpan);
                            }
                        }
                    }
                }
            }
        });
    }

    return {
        annotate: function (fileCoverage, code) {
            var count = 0,
                structured = code.map(function (str) {
                    count += 1;
                    return {
                        line: count,
                        covered: null,
                        text: new InsertionText(str, true)
                    };
                });
            structured.unshift({
                line: 0,
                covered: null,
                text: new InsertionText("")
            });

            annotateStatements(fileCoverage, structured);
            annotateFunctions(fileCoverage, structured);
            annotateBranches(fileCoverage, structured);

            structured.shift();
            return structured;
        }
    }
}();

var asnyShowCode = function () {
    var timer, timeout, interval, prepare, partCount, nowIndex, init,
        currentDisposeLines, codeEl, gutterEl, linesEl, regx1, regx2, result,
        linesCount, h1, h2;

    timeout = 1;
    partCount = 100;
    regx1 = /\u0001/g;
    regx2 = /\u0002/g;
    // ckeyIdRegx = /id=ckey-(\d+)/g;
    h1 = [];
    h2 = [];

    init = function () {
        nowIndex = 0;
        linesCount = 0;
        window.clearInterval(timer);
    };

    prepare = function () {
        var innerElId = id();
        var gutterId = id();
        var linesId = id();

        codeEl.innerHTML = "<div id='" + innerElId + "' class='block clearfix' " +
            "style='height: " + (linesCount * 20 + 10) + "px;'>" +
            "<div id='" + gutterId + "' class='gutter'></div>" +
            "<div id='" + linesId + "' class='lines'></div></div>";
        codeEl.scrollTop = 0;

        gutterEl = document.getElementById(gutterId);
        linesEl = document.getElementById(linesId);
    };

    interval = function () {
        var t, p1, p2;

        h1.length = h2.length = 0;

        for (var i = 0; i < partCount; i++) {
            if (nowIndex >= linesCount) {
                init();
                break;
            }

            t = html(currentDisposeLines[nowIndex].text.text).replace(regx1, "<")
                .replace(regx2, ">");

            // t = t.replace( ckeyIdRegx, function( all, id ){
            // return StatusPool.arrivedSnippetGet( id ) ?
            // all + " class='arrive'" : all;
            // } );

            h1.push(tag(nowIndex + 1, "pre"));
            h2.push(tag(/^\s$/.test(t) ? " " : t, "pre"));

            nowIndex++;
        }

        p1 = document.createElement("div");
        p2 = document.createElement("div");

        p1.innerHTML = h1.join("");
        p2.innerHTML = h2.join("");

        gutterEl.appendChild(p1);
        linesEl.appendChild(p2);
    };

    result = function (coverage) {
        init();
        
        codeEl = document.getElementById("code-content");
        
        try {
        	currentDisposeLines = Annotate.annotate(coverage, coverage.code);
        } catch(e) {
        	codeEl.innerHTML = "<div class='error-code'>" +
            "&#26631;&#35760;&#20986;&#38169;</div>"; // 标记出错
        }
        linesCount = currentDisposeLines.length;
        prepare();
        timer = window.setInterval(interval, timeout);
    };

    result.clear = init;

    return result;
}();