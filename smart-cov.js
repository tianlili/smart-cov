void function (version, scripts, analyzer, parent) {
    if (window != window.parent)
        return;

    if (/msie/i.test(navigator.userAgent))
        return window.alert("您使用的浏览器相对传统，建议换 chrome/firefox/safari 试试！");

    version = "1.3.1";
    rootUrl = "http://127.0.0.1/smart-cov/";

    scripts = [];
    scripts[0] = rootUrl + "cache.php?file=./esprima.js";
    scripts[1] = rootUrl + "cache.php?file=./escodegen.js";
    scripts[2] = rootUrl + "cache.php?file=./instrumenter.js";
    scripts[3] = rootUrl + "cache.php?file=./smart-cov-analyzer.js&version=" + version;

    function load(i) {debugger
        script = document.createElement("script");
        script.type = "text/javascript";
        script.src = scripts[i];
        parent = document.head || document.body || document.documentElement;

        if (i < 3) {
            script.onload = function () {
                load(i + 1);
            }
        }

        parent.appendChild(script);
    };

    load(0);
}();