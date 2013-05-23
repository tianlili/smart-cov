void function( window, factory ){
    var host;
    
    host = window.document;

    if( !window.Tracker )
        window.Tracker = host;

    if( window != window.parent )
        return ;

    if( /msie/i.test( navigator.userAgent ) )
        return ;

    if( !host.TrackerGlobalEvent )
        factory( window );
    
    host.TrackerGlobalEvent.fire( "TrackerJSLoad" );

}( this, function( window ){
    var global, host, location, slice, floor, max, push, join, version, controllerOnLoad;

    version = "1.0.0";
    global = window;
    host = global.document;
    location = global.location;
    slice = [].slice;
    push = [].push;
    join = [].join;
    floor = Math.floor;
    max = Math.max;

    var util = host.util = function(){
        var excapeRegx = function(){
            var specials, regx;

            specials = [ "/", ".", "*", "+", "?", "|", "$", "^", "(", ")", "[", "]", "{", 
                "}", "\\" ];
            regx = new RegExp( "(\\" + specials.join("|\\") + ")", "g" );

            return function( text ){
                return text.replace( regx, "\\$1" );
            };  
        }();

        var RemoteProxy = function(){
            var callbacks, esc, service, timeout;
            
            callbacks = {};
            timeout = 10e3;

            host.remoteProxyCallback = function( data ){
                var c;
                if( c = callbacks[ data.url ] )
                    c( data );
            };

            esc = function(){
                var regx, rep;
                
                regx = /[\\\/ \+%&=#\?]/g;
                rep = function( s ){
                    return escape( s );
                };

                return function( url ){
                    return url.replace( regx, rep );  
                };
            }();

            service = "http://127.0.0.1/smart-cov/proxy.php";

            var getProxyUrl = function( url ){
                url = util.param( service, "url", esc( url ) );
                url = util.param( url, "callback", "remoteProxyCallback" );
                return url;
            };

            return {
                get: function( url, charset ){
                    var pm, timer, script;

                    pm = new promise;

                    script = util.makeElement( host, "script" );
                    script.src = getProxyUrl( url );
                    script.charset = charset || "utf-8";
                    host.head.appendChild( script );

                    callbacks[ url ] = function( data ){
                        clearTimeout( timer );
                        pm.resolve( {
                            response: data.content,
                            consum: data.consum
                        } );
                        script = null;
                        delete callbacks[ url ];
                    };

                    timer = setTimeout( function(){
                        script.parentNode.removeChild( script );
                        pm.reject();
                        script = null;
                    }, timeout );

                    return pm;
                }
            };
        }();

        return {
            blank: function(){  
            },

            bind: function( fn, scope ){
                return function(){
                    return fn.apply( scope, arguments );
                };
            },

            forEach: function( unknow, iterator ){
                var i, l;

                if( unknow instanceof Array || 
                    ( unknow && typeof unknow.length == "number" ) )
                    for( i = 0, l = unknow.length; i < l; i ++ )
                        iterator( unknow[ i ], i, unknow );
                else if( typeof unknow === "string" )
                    for( i = 0, l = unknow.length; i < l; i ++ )
                        iterator( unknow.charAt( i ), i, unknow );
            },

            format: function( source, data ){
                var rtn = source, blank = {}, item;

                for( var key in data ){
                    if( !data.hasOwnProperty( key ) )
                        continue;

                    if( item = data[ key ] )
                        item = item.toString().replace( /\$/g, "$$$$" );
                    
                    item = typeof item === "undefined" ? "" : item;
                    rtn = rtn.replace( RegExp( "@{" + key + "}", "g" ), item );
                }

                return rtn.toString();
            },

            id: function( id ){
                return function(){
                    return "_" + id ++;
                }
            }( 0 ),

            handle: function(){
                var cache, number;

                cache = [];
                number = -1;

                return function( unknown ){
                    var type;

                    type = typeof unknown;

                    if( type == "number" )
                        return cache[ unknown ];
                    else if( type == "object" || type == "function" ){
                        cache[ ++ number ] = unknown;
                        return number;
                    }
                } 
            }(),

            trim: function(){
                var regx = /^\s+|\s+$/g, rep = "";
                return function( string ){
                    return string.replace( regx, rep );
                } 
            }(),

//            random: function(){
//                return ( Math.random() * 1e6 ) | 0;  
//            },

//            getByteLength: function( string ){
//                return string.replace( /[^\x00-\xff]/g, "  " ).length;  
//            },

            makeElement: function( doc, tagName, cssText ){
                var el;

                if( typeof doc == "string" )
                    cssText = tagName,
                    tagName = doc,
                    doc = null;
                
                if( !doc )
                    doc = host;
                
                el = doc.createElement( tagName );

                if( cssText )
                    el.style.cssText = cssText;

                return el;
            },

            findParent: function( el, tag, endOf ){
                do{
                    if( el.tagName.toLowerCase() == tag.toLowerCase() )
                        return el;

                    if( el == endOf )
                        return null;

                    el = el.parentNode;
                }while( 1 );
            },

            tag: function( html, tagName, className ){
                var result, t;

                result = html;
                tagName = tagName.split( " " );

                while( t = tagName.pop() )
                    result = "<" + t + ">" + result + "</" + t + ">";

                if( className )
                    result = result.replace( /<(\w+)>/, 
                        "<$1 class='" + className + "'>" );

                return result;
            },

            addClass: function( el, className ){
                var name;
                
                name = " " + el.className + " ";

                if( !~name.indexOf( " " + className + " " ) )
                    el.className += " " + className;
            },

            removeClass: function( el, className ){
                var name;
                
                name = " " + el.className + " ";
                
                if( ~name.indexOf( " " + className + " " ) ){
                    name = name.replace( " " + className + " ", " " );
                    name = util.trim( name.replace( / +/g, " " ) );
                    el.className = name;
                }
            },

            html: function( string ){
                return string.replace( /&/g, "&amp;" )
                    .replace( /</g, "&lt;" )
                    .replace( />/g, "&gt;" )
                    .replace( /"/g, "&quot;" )
                    .replace( /'/g, "&#39;" );
            },

            splitToLines: function(){
                var splitLineRegx = /\r\n|[\r\n]/;
                return function( string ){
                    return string.split( splitLineRegx );
                }
            }(),

            param: function( url, name, value ){
                var spliter, suffix;

                spliter = ~url.indexOf( "?" ) ? "&" : "?";
                suffix = name + "=" + value;

                return url + spliter + suffix;
            },

            excapeRegx: excapeRegx,

            fileName: function( url ){
                var start, end;

                start = url.lastIndexOf( "/" );
                end = max( url.indexOf( "#" ), url.indexOf( "?" ) );

                if( end == -1 || end == start + 1 )
                    end = url.length;
                
                if( start > end ){
                	url = url.slice( 0, end );
                	start = url.lastIndexOf( "/" );
                }

                return url.slice( start + 1, end );
            },

            time: function(){
                return new Date().getTime();
            },

            browser: function(){
                var ua, isOpera, ret;
                
                ua = navigator.userAgent;
                isOpera = Object.prototype.toString.call(window.opera) == '[object Opera]';
                ret = {
                    IE:     !!window.attachEvent && !isOpera,
                    Opera:  isOpera,
                    WebKit: ua.indexOf('AppleWebKit/') > -1,
                    Gecko:  ua.indexOf('Gecko') > -1 && ua.indexOf('KHTML') === -1
                    // MobileSafari:   /Apple.*Mobile/.test(ua)
                };

                for( var name in ret )
                    if( ret.hasOwnProperty( name ) && ret[ name ] ){
                        ret.name = name;
                        break;
                    }

                return ret;
            }(),

            isCrossDomain: function( url ){
                return !( url.indexOf( pageBaseUrl ) == 0 );
            },

            // isntCrossDomain: function(){
            //     var locationOriginRegx, hasProtocol;

            //     locationOriginRegx = new RegExp( "^" + 
            //         excapeRegx( location.protocol + "//" + host.location.host ), "i" );
            //     hasProtocol = /^(\w+:)?\/\//i;

            //     return function( url ){
            //         return !hasProtocol.test( url ) || locationOriginRegx.test(url);
            //     }
            // }(),

            intelligentGet: function( url ){
                url = path.merge( pageBaseUrl, url );
                return util.isCrossDomain( url ) ? RemoteProxy.get( url ) : util.request( url );
            },

            request: function( url, charset ){
                var xhr, pm, timeout, timer, timeStart, timeConsum;

                pm = new promise();
                timeout = 10e3;

                if( XMLHttpRequest )
                    xhr = new XMLHttpRequest();
                else
                    xhr = new ActiveXObject( "Microsoft.XMLHTTP" );

                xhr.open( "GET", url, true );

                if( charset && xhr.overrideMimeType )
                    xhr.overrideMimeType( "text/html;charset=" + charset );

                xhr.onreadystatechange = function(){
                    if( xhr.readyState == 4 && xhr.status == 200 ){
                        clearTimeout( timer );
                        timeConsum = util.time();
                        pm.resolve( { 
                            response: xhr.responseText,
                            consum: timeConsum - timeStart
                        } );
                        xhr = null;
                    }
                };

                timer = setTimeout( function(){
                    xhr.abort();
                    pm.reject();
                    xhr = null;
                }, timeout );

                timeStart = util.time();
                xhr.send( null );

                return pm;
            },

            delay: function (){
                // single thread
                var tasks, start, timer, task;
                
                tasks = [];

                start = function(){
                    clearInterval( timer );
                    timer = setInterval( function(){
                        if( tasks.length ){
                            task = tasks.shift();
                            task.apply();
                        }else{
                            clearInterval( timer );
                        }
                    }, 1e2 );
                };

                return function( fn ){
                    tasks.push( fn );
                        start();
                }
            }(),

            onCpuFree: function( fn, process ){
                var now, start, last, count, d, timer, limit, times, space;

                start = last = util.time();
                count = 0;

                times = 30;
                space = 20;
                limit = 100;

                process = process || util.blank;

                timer = setInterval( function(){
                    now = util.time();

                    if( ( d = now - last ) < limit && ++ count == times ){
                        clearInterval( timer );
                        return fn();
                    }else if( d > limit ){
                        count = 0;
                    }

                    process( ( last = now ) - start );
                }, space );
            },
            
            round : function(digit, length) {
        	    length = length ? parseInt(length) : 0;
        	    if (length <= 0) return Math.round(digit);
        	    digit = Math.round(digit * Math.pow(10, length)) / Math.pow(10, length);
        	    return digit;
        	},
        	
        	count: function(s){
        		var scov = 0;
            	for(var i in s){
            		if(s[i] > 0)
            			scov ++;
            	}
            	return scov;
        	}
        }
    }();

    var path = function(){
        var protocolRegx, absoluteRegx, rootRegx, doubleDotRegx, singleDotRegx;

        protocolRegx = /^\w+:\/\//;
        absoluteRegx = /^\//;
        rootRegx = /^(\w*:?\/?\/?)([\w.]+:?[\w.]+)(\/)/;
        doubleDotRegx = /\/[^\/\.]+\/\.\.\//;
        singleDotRegx = /\/\.\//;

        return {
            getBase: function( document ){
                var base, url;

                base = document.querySelector( "base[href]" );

                if( base )
                    url = base.href;
                else
                    url = document.URL;

                return url.slice( 0, url.split( /[#?]/ )[0].lastIndexOf( "/" ) + 1 );
            },

            merge: function( base, url ){
                if( url.indexOf( "//" ) === 0 )
                    return pageBaseProtocol + ":" + url;

                if( protocolRegx.test( url ) )
                    return url;
                
                if( absoluteRegx.test( url ) ){
                    if( rootRegx.test( base ) )
                        url = RegExp.$1 + RegExp.$2 + url;
                    else
                        return url;
                }else{
                    url = base + url;
                }

                while( doubleDotRegx.test( url ) )
                    url = url.replace( doubleDotRegx, "/" );

                while( singleDotRegx.test( url ) )
                    url = url.replace( singleDotRegx, "/" );

                return url;
            }
        }  
    }();

    var promise = function(){
        var concat = [].concat;

        var promise = function(){
            var list;
            
            list = this.list = arguments.length ? 
                concat.apply( [], arguments[ 0 ] ) : null;
            this.resolves = [];
            this.rejects = [];
            this.resolveValues = [];
            this.rejectValues = [];
            this.parents = [];
            this.state = "pending";
            this.fired = false;

            if( list )
                for( var i = 0, l = list.length; i < l; i ++ )
                    list[ i ].parents.push( this );
        };

        promise.prototype = {
            resolve: function( arg ){
                if( this.state == "pending" )
                    this.state = "resolved",
                    this.resolveValues = concat.apply( [], arguments )
                    this.fire();
            },

            reject: function( arg ){
                if( this.state == "pending" )
                    this.state = "rejected",
                    this.rejectValues = concat.apply( [], arguments )
                    this.fire();
            },

            then: function( resolved, rejected ){
                if( resolved )
                    this.resolves.push( resolved );
                
                if( rejected )
                    this.rejects.push( rejected );

                if( this.fired )
                    switch( this.state ){
                        case "resolved":
                            resolved && 
                                resolved.apply( null, this.resolveValues );
                            break;
                        case "rejected":
                            rejected &&
                                rejected.apply( null, this.rejectValues );
                    }
                else
                    this.fire();

                return this;
            },

            fire: function(){
                var callbacks, values, list = this.list, allResolved = true,
                    allResolveValues, parents;

                if( this.fired )
                    return ;

                if( list && this.state == "pending" ){
                    allResolveValues = [];

                    for( var i = 0, l = list.length; i < l; i ++ ){
                        switch( list[ i ].state ){
                            case "pending":
                                allResolved = false;
                                break;
                            case "resolved":
                                allResolveValues[ i ] = 
                                    list[ i ].resolveValues[ 0 ];
                                break;
                            case "rejected":
                                return this.reject( list[ i ].rejectValues[ 0 ] );
                        }
                    }
                    if( allResolved )
                        return this.resolve( allResolveValues );
                }

                if( this.state == "pending" )
                    return ;

                if( this.state == "resolved" )
                    callbacks = this.resolves,
                    values = this.resolveValues;
                else if( this.state == "rejected" )
                    callbacks = this.rejects,
                    values = this.rejectValues;

                for( var i = 0, l = callbacks.length; i < l; i ++ )
                    callbacks[ i ].apply( null, values );

                this.fired = true;

                parents = this.parents;
                for( var i = 0, l = parents.length; i < l; i ++ )
                    parents[ i ].fire();
            }
        };

        promise.when = function(){
            return new promise( arguments );
        };

        promise.fuze = function(){
            var queue = [], fn, infire, args;

            fn = function( process ){
                infire ? process() : queue.push( process );
            };

            fn.fire = function(){
                while( queue.length )
                    queue.shift().apply( null, arguments );
                fn.fired = infire = true;
            };

            return fn;
        };

        return promise;
    }();

    var Event = function(){
        return {
            add: function( target, event, fn ){
                if( typeof event == "object" ){
                    for(var name in event)
                        this.add( target, name, event[ name ] );
                    return ;
                }

                var call = function(){
                    var args = slice.call( arguments ), e;

                    if( ( e = args[ 0 ] ) && typeof e == "object" ){
                        e = e || event;
                        e.target = e.target || e.srcElement;
                        args[ 0 ] = e;
                    }

                    fn.apply( target, args );
                };

                if( target.addEventListener )
                    target.addEventListener( event, call, false );
                else if( target.attachEvent )
                    target.attachEvent( "on" + event, call );
            },

            bind: function( object ){
                var events;

                object = object || {};
                events = object.events = {};

                object.on = function( name, fn ){
                    if( typeof name == "object" ){
                        for(var n in name)
                            this.on( n, name[ n ] );
                        return ;
                    }

                    if( events[ name ] )
                        events[ name ].push( fn );
                    else
                        events[ name ] = [ fn ];
                };

                object.fire = object.f = function( name ){
                    var args = slice.call( arguments, 1 ), e;

                    if( e = events[ name ] )
                        for( var i = 0, l = e.length; i < l; i ++ )
                            e[ i ].apply( this, args );
                };

                return object;
            }
        }
    }();

    var AsynStringReplacer = function(){
        var restoreRegx = /\({3}AsynStringReplacer:(\d+)\){3}/g;

        return {
            replace: function( origContent, regx, pmReplaceFn ){
                var cache, tasks = [], content = origContent, index = 0,
                    pm = new promise;

                content = content.replace( regx, function(){
                    tasks.push( pmReplaceFn.apply( null, arguments ) );
                    return "(((AsynStringReplacer:" + ( index ++ ) + ")))";
                } );

                promise.when( tasks ).then( function(){
                    cache = slice.call( arguments, 0 );
                    content = content.replace( restoreRegx, function( s, index ){
                        return cache[ index - 0 ];
                    } );
                    pm.resolve( content );
                } );

                return pm;
            }
        };
    }();

    var Code = function(){
        var klass;

        klass = function( url, content ){
            var comboCode;

            Feedback.lookup( this );
            this.id = util.id();
            this.url = url;
            this.type = "";
            this.state = "normal";
//            this.rowsCount = 0;
//            this.arriveRowsCount = 0;
//            this.size = content ? util.getByteLength( content ) : -1;
            this.fileName = url ? util.fileName( url ) : "-";
            this.fullUrl = url ? path.merge( pageBaseUrl, url ) : null;
            this.origContent = content || null;
//            this.lastModified = util.time();
//            this.beautifySize = -1;
            this.runErrors = [];
            this.syntaxErrors = [];
            // this.snippetsIdSet = {}; // 已切分成代码碎片的 id 集合

            this.executiveCode = "";
            this.linesViewHtml = [];

//            this.loadConsum =
//            this.runConsum = -1;

            this.onReady = promise.fuze();

            if( content ){
                comboCode = new ComboCode( this );
                comboCode.onReady( util.bind( function(){
                    if( comboCode.errorMessage ){
                        this.executiveCode = this.origContent;
                        this.syntaxErrors.push( comboCode );
                        this.fire( "error", "syntaxErrors" );
                    }else{
                        this.executiveCode = comboCode.getExecutiveCode();
                        //beautifyCode = comboCode.getBeautifyCode();
                        //this.beautifySize = util.getByteLength( beautifyCode );
                        //this.rowsCount = util.splitToLines( beautifyCode ).length;
                    }

                    this.linesViewHtml = comboCode.getViewHtmlByLines();
                    this.onReady.fire();
                    // util.delay( util.bind( this.onReady.fire, this.onReady ) );
                }, this ) );
            }else{
                this.executiveCode = "void function (){}";
                //this.beautifySize = this.size = 0;
                //this.rowsCount = 0;
                this.linesViewHtml = [];
                this.setState( "empty" );
                this.onReady.fire();
                // util.delay( util.bind( this.onReady.fire, this.onReady ) );
            }
        };

        klass.prototype = Event.bind( {
            setType: function( type ){
                this.type = type; // embed, link, append
            },

            setState: function( state ){ // normal, timeout, empty
                this.state = state;
            },

            addError: function( message ){
                this.runErrors.push( new Error( message ) );
                //this.lastModified = util.time();
                this.fire( "error", "runErrors" );
            }
        } );

        return klass;  
    }();

    var ComboCode = function(){
        var klass, closeTagRegx, viewHtmlRegx, executiveCodeRegx, comboCodeBoundaryRegx, topLocationToRegx;

        closeTagRegx = /<\/(\w{0,10})>/g;

//        viewHtmlRegx = /\{<\}(<!-- TRACKERINJECTHTML -->.*?)\{>\}/g;
//        executiveCodeRegx = /\{<\}\/\* TRACKERINJECTJS \*\/.*?\{>\}/g;
//        comboCodeBoundaryRegx = /\{(?:<|>)\}/g;
//        lineFirstIdRegx = /id=ckey\-(\d+)/;
        topLocationToRegx = /(\s*)(top)(\.location\s*=)(?!=)/g;

        klass = function( CodeInstance ){
            this.CodeInstance = CodeInstance;
            this.code = null;
            this.errorMessage = null;

            this.onReady = promise.fuze();
            // util.delay( util.bind( function(){
            try{
                this.code = host.combocodegen( CodeInstance );
            }catch(e){
                this.errorMessage = e.message;
            }

            this.onReady.fire();
                // util.delay( util.bind( this.onReady.fire, this.onReady ) );
            // }, this ) );
        };

        klass.prototype = Event.bind( {
//            getCode: function(){
//                return this.code;
//            },

//            getBeautifyCode: function(){
//                var code = this.code;
//                code = code.replace( viewHtmlRegx, "" );
//                code = code.replace( executiveCodeRegx, "" );
//                code = code.replace( comboCodeBoundaryRegx, "" );
//                return code;
//            },

            getExecutiveCode: function(){
                var code = this.code;

//                code = code.replace( viewHtmlRegx, "" );
//                code = code.replace( comboCodeBoundaryRegx, "" );
                code = code.replace( closeTagRegx, function( s, a ){
                    return "<\\/" + a + ">";
                } );

                code = code.replace( topLocationToRegx, function( s, a, b, c ){
                    return a + "__trackerMockTop__()" + c;
                } );

                code = "try{" + code + "}catch(__trackerErrorData__){__trackerError__('" + 
                    this.CodeInstance.id + "',__trackerErrorData__.message);throw __trackerErrorData__;}";

                return code;
            },

            getViewHtmlByLines: function(){
                var code, lines;

                code = this.CodeInstance.origContent;

//                code = code.replace( viewHtmlRegx, function( s, a ){
//                    return a.replace( /</g, "\x00" ).replace( />/g, "\x01" );
//                } );

//                code = code.replace( executiveCodeRegx, "" );
//                code = code.replace( comboCodeBoundaryRegx, "" );
                lines = util.splitToLines( code );

//                util.forEach( lines, function( line, index ){
//                    var firstId;
//
//                    firstId = line.match( lineFirstIdRegx );
//
//                    if( firstId )
//                        StatusPool.beginOfLineSnippetPut( firstId[1] );
//                } );

                return lines;
            }
        } );

        return klass;
    }();

    var CodeList = host.CodeList = function(){
        var single, codes;

        codes = [];
        single = Event.bind( {
            add: function(){
                var code;

                if( arguments.length == 1 ){
                    code = arguments[ 0 ];
                }else if( arguments.length == 2 ){
                    code = new Code( arguments[ 0 ], arguments[ 1 ] );
                }else{
                    return ;
                }

                codes[ code.id ] = code;
                codes.push( code );
            },

            get: function( idOrIndex ){
                return codes[ idOrIndex ];
            },

            list: function(){
                return codes;
            },

            sort: function(){
                for( var i = codes.length - 1, r; i >= 0; i -- ){
                    r = codes[ i ];
                    if( r.type == "embed" )
                        codes.splice( i, 1 ),
                        codes.push( r );
                }

                // util.forEach( codes, function( code, index ){
                //     code.index = index;
                // } );
            },

            count: function(){
                return codes.length;
            } } );

        return single;
    }();

    var View = host.View = function(){
        return {
            templates: {
                url: "<a href='@{url}' target='_blank'>@{url}</a>",

                frameset: [
                    "<!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.0 Frameset//EN' 'http://www.w3.org/TR/xhtml1/DTD/xhtml1-frameset.dtd'>",
                    "<html>",
                    "<head>",
                        "<meta charset='@{charset}'>",
                        "<meta name='description' content='smart-cov-frame'>",
                        "<title>@{title}</title>",
                    "</head>",
                    "<frameset rows='*,0' framespacing='0' frameborder='no'>",
                        "<frame src='@{url}' name='tracker_page' />",
                        "<frame src='about:blank' name='tracker_controller' noresize='yes' />",
                    "</frameset>",
                    "</html>"
                ].join( "" ),

                controllerPage: [
                    "<!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.0 Frameset//EN' 'http://www.w3.org/TR/xhtml1/DTD/xhtml1-frameset.dtd'>",
                    "<html>",
                    "<head>",
                        "<meta charset='@{charset}'>",
                        "<title>smart-cov</title>",
                        "<link href='@{cachePhp}./bootstrap/css/bootstrap.min.css&amp;version=2013041602' type='text/css' rel='stylesheet' />",
                        "<link href='@{cachePhp}./controller-resources/controller.css&amp;version=20130422' type='text/css' rel='stylesheet' />",
                    "</head>",
                    "<body>",
                        "@{header}",
                        "<div class='main'>",
                            "<ul id='pages' class='unstyled tab-content'>",
                                "<li class='tab-content-active'>",
                                    "@{codeList}",
                                    "@{codeDetail}",
                                "</li>",
                            "</ul>",
                        "</div>",
                        "@{dialogAbout}",
                        "@{globalLoading}",
                        "<script> window.readyState = 'done'; </script>",
                    "</body>",
                    "</html>"
                ].join( "" ),

                controllerTopbar: [
                    "<div id='top-navbar' class='navbar'>",
                        "<div class='navbar-inner'>",
                            "<button class='close pull-left' action='frame#close'>&times;</button>",
                            "<a class='brand'>smart-cov</a>",
                            "<ul id='top-nav' class='nav pull-left' data-target='pages'>",
                                "<li class='active'><a href='' onclick='return false'>&#20195;&#30721;&#21015;&#34920;</a></li>",
                            "</ul>",
                            "<ul class='nav pull-right'>",
                                "<li class='dropdown'>",
                                    "<a href='' onclick='return false;' class='dropdown-toggle' data-toggle='dropdown'>",
                                        "&#35270;&#22270;",
                                        "<b class='caret'></b>",
                                    "</a>",
                                    "<ul class='dropdown-menu'>",
                                        "<li><a id='window-mode-trigger' action='frame#toggle' href='#' onclick='return false;'>&#31383;&#21475;&#27169;&#24335;</a></li>",
                                        "<li><a action='frame#close' href='#' onclick='return false;'>&#20851;&#38381;&#25511;&#21046;&#21488;</a></li>",
                                    "</ul>",
                                "</li>",
                                "<li class='dropdown'>",
                                    "<a href='' onclick='return false;' class='dropdown-toggle' data-toggle='dropdown'>",
                                        "&#24110;&#21161;",
                                        "<b class='caret'></b>",
                                    "</a>",
                                    "<ul class='dropdown-menu'>",
                                        "<li><a href='#' action='about#open' onclick='return false;'>&#20851;&#20110;...</a></li>",
                                    "</ul>",
                                "</li>",
                            "</ul>",
                        "</div>",
                    "</div>",
                ].join( "" ),

                controllerCodeList: [
                    "<table class='table compact-width'>",
                        "<thead>",
                            "<tr>",
                                "<th width='@{widthIndex}'>#</th>",
                                "<th width='@{widthName}'>&#21517;&#31216;</th>",
                                "<th width='@{widthType}'>&#31867;&#22411;</th>",
                                "<th width='@{widthCoverStatement}'>&#35821;&#21477;&#35206;&#30422;</th>",
                                "<th width='@{widthCoverBranch}'>&#20998;&#25903;&#35206;&#30422;</th>",
                                "<th width='@{widthCoverFunction}'>&#20989;&#25968;&#35206;&#30422;</th>",
                                "<th width='@{widthCoverStatementGraph}'>&#35821;&#21477;&#35206;&#30422;&#27604;&#20363;</th>",
                                "<th width='*'>&nbsp;</th>",
                            "</tr>",
                        "</thead>",
                    "</table>",
                    "<div id='list-codes' class='scrollable'>",
                        "<table class='table table-striped table-hover table-condensed'>",
                            "<colgroup>",
                                "<col width='@{widthIndex}'>",
                                "<col width='@{widthName}'>",
                                "<col width='@{widthType}'>",
                                "<col width='@{widthCoverStatement}'>",
                                "<col width='@{widthCoverBranch}'>",
                                "<col width='@{widthCoverFunction}'>",
                                "<col width='@{widthCoverStatementGraph}'>",
                            "</colgroup>",
                            "<tbody id='list-codes-tbody'>",
                            "</tbody>",
                        "</table>",
                    "</div>"
                ].join( "" ),

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
                        "<ul class='unstyled tab-content' id='code-detail-body'>",
                            "<li class='tab-content-active'>",
                                "<div id='code-content' class='relative scrollable'></div>",
                            "</li>",
                            "<li class='scrollable'>",
                                "<div id='code-info'></div>",
                            "</li>",
                        "</ul>",
                    "</div>"
                ].join( "" ),

                controllerCodeInfo: [
                    "<dl class='group'>",
                        "<dt>&#26469;&#28304;</dt>",
                        "<dd>@{fileName}</dd>",
                    "</dl>",
                    "<dl class='group'>",
                        "<dt>&#31867;&#22411;</dt>",
                        "<dd>@{type}</dd>",
                    "</dl>",
                    "<dl class='group'>",
                        "<dt>&#35821;&#21477;&#35206;&#30422;</dt>",
                        "<dd>@{coverStatement}</dd>",
                    "</dl>",
                    "<dl class='group'>",
                        "<dt>&#20998;&#25903;&#35206;&#30422;</dt>",
                        "<dd>@{coverBranch}</dd>",
                    "</dl>", 
                    "<dl class='group'>",
                        "<dt>&#20989;&#25968;&#35206;&#30422;</dt>",
                        "<dd>@{coverFunction}</dd>",
                    "</dl>"    
                ].join( "" ),

                controllerDialogAbout: [
                    "<div id='dialog-about' class='modal hide fade in'>",
                        "<div class='modal-header'>",
                            "<button type='button' class='close' data-dismiss='modal' aria-hidden='true'>&times;</button>",
                            "<h3>smart-cov</h3>",
                        "</div>",
                        "<div class='modal-body'>",
                            "<p>&#24403;&#21069;&#29256;&#26412;&#65306;@{version}</p>",
                        "</div>",
                        "<div class='modal-footer'>",
                            "<a href='#' onclick='return false;' class='btn btn-primary'>&#30830;&#23450;</a>",
                        "</div>",
                    "</div>",
                ].join( "" ),

                controllerGlobalLoading: [
                    "<div id='loading'>",
                        "<span>&#35831;&#31245;&#31561;&#65292;&#25910;&#38598;&#20013;...</span>",
                        "<span id='waitTime'></span>",
                    "</div>"
                ].join( "" ),

                codeListTotal: [
				    "<tr class='total'>",
					    "<td><div class='ellipsisable' style='width: @{widthIndex}px;'>0</div></td>",
					    "<td><div class='ellipsisable' style='width: @{widthName}px;'>Total</div></td>",
					    "<td><div class='ellipsisable' style='width: @{widthType}px;'>-</div></td>",
					    "<td><div id='code-total-coverStatement' class='ellipsisable' style='width: @{widthCoverStatement}px;'>@{coverStatementTotal}</div></td>",
					    "<td><div id='code-total-coverBranch' class='ellipsisable' style='width: @{widthCoverBranch}px;'>@{coverBranchTotal}</div></td>",
					    "<td><div id='code-total-coverFunction' class='ellipsisable' style='width: @{widthCoverFunction}px;'>@{coverFunctionTotal}</div></td>",
					    "<td><div id='code-total-coverStatementGraph' class='ellipsisable' style='width: @{widthCoverStatementGraph}px;'><div class='pctGraph'><div class='covered' style='width: @{coverStatementGraphTotal}px;'></div></div></div></td>",
					    "<td></td>",
				    "</tr>"
				].join( "" ),
                           
                codeListLine: [
                    "<tr data-code-id='@{id}'>",
                        "<td><div class='ellipsisable' style='width: @{widthIndex}px;'>@{index}</div></td>",
                        "<td><div class='ellipsisable' style='width: @{widthName}px;'>@{fileName}</div></td>",
                        "<td><div class='ellipsisable' style='width: @{widthType}px;'>@{type}</div></td>",
                        "<td><div id='code-@{id}-coverStatement' class='ellipsisable' style='width: @{widthCoverStatement}px;'>@{coverStatement}</div></td>",
                        "<td><div id='code-@{id}-coverBranch' class='ellipsisable' style='width: @{widthCoverBranch}px;'>@{coverBranch}</div></td>",
                        "<td><div id='code-@{id}-coverFunction' class='ellipsisable' style='width: @{widthCoverFunction}px;'>@{coverFunction}</div></td>",
                        "<td><div id='code-@{id}-coverStatementGraph' class='ellipsisable' style='width: @{widthCoverStatementGraph}px;'><div class='pctGraph'><div class='covered' style='width: @{coverStatementGraph}px;'></div></div></div></td>",
                        "<td></td>",
                    "</tr>"
                ].join( "" )
            },

            Loading: function(){
                var layer, span1, span2, animateTimer, count, progress, body;

                count = progress = 0;
                body = host.body;

                var create = function(){
                    var span;

                    layer = util.makeElement( "div", "position: fixed; padding: 30px; border-radius: 10px; background: rgba(0,0,0,.75); font-size: 20px; line-height: 20px; text-align: center; color: #fff; bottom: 50px; left: 50px; box-shadow: 0 2px 5px #000; z-index: 65535; font-family: 'Courier New', 'Heiti SC', 'Microsoft Yahei';" );
                    layer.innerHTML = "&#27491;&#22312;&#20998;&#26512;&#32593;&#39029; <span>...</span> <span>(0/0)</span>";
                    body.appendChild( layer );
                    host.documentElement.scrollTop = body.scrollTop = 0;
                    span = layer.getElementsByTagName( "span" );
                    span1 = span[0];
                    span2 = span[1];
                };

                var animate = function(){
                    var count, word, n, s, e;

                    count = 0;
                    word = "......";
                    clearInterval( animateTimer );
                    animateTimer = setInterval( function(){
                        n = count % 7;
                        s = word.substr( 0, n );
                        e = word.substr( 0, 6 - n );
                        span1.innerHTML = s + "<span style='color: #000;'>" + 
                            e + "</span>";
                        count += 1;
                    }, 100 );
                };

                return {
                    show: function(){
                        if( !layer )
                            create();    
                        else
                            layer.style.display = "block";

                        animate();
                    },

                    hide: function(){
                        if( layer )
                            layer.style.display = "none";

                        clearInterval( animateTimer );
                    },

                    text: function( text ){
                        var me, pm;

                        if( layer )
                            layer.innerHTML = text;

                        me = this;
                        pm = new promise;
                        clearInterval( animateTimer );
                        setTimeout( function(){
                            me.hide();
                            pm.resolve();
                        }, 2e3 );

                        return pm;
                    },

                    addCount: function(){
                        count ++;
                        span2.innerHTML = "(" + ( progress / count * 100 ).toFixed( 2 ) + "%)";
                    },

                    addProgress: function(){
                        progress ++;
                        span2.innerHTML = "(" + ( progress / count * 100 ).toFixed( 2 ) + "%)";
                    }
                }
            }(),

            ControlFrame: function(){
                var document = window.document, controlWindow, hasCreateEmbeded = false,
                    currentMode = "embed", pageBuilder, controllerBuilder;

                var config = {
                    frameHeight: 300
                };

                var lookupForWindowReady = function( target ){
                    var pm, timer, timer2, now, timeout, clear;
                    
                    pm = new promise;
                    timeout = 5000;
                    now = util.time();

                    clear = function(){
                        clearInterval( timer );
                        clearTimeout( timer2 );
                    };

                    timer = setInterval( function(){
                        if( target.readyState == "done" ){
                            clear();
                            pm.resolve();
                        }
                    }, 10 );

                    timer2 = setTimeout( function(){
                        pm.reject();
                    }, timeout );

                    return pm;
                };

                return Event.bind( {
                    state: "preshow",

                    pageBuilder: function( fn ){
                        pageBuilder = fn;
                    },

                    controllerBuilder: function( fn ){
                        controllerBuilder = fn;
                    },

                    show: function(){
                        var frameset, frame, window;

                        if( currentMode === "embed" ){
                            frameset = document.getElementsByTagName( "frameset" )[ 0 ];
                            frame = frameset.getElementsByTagName( "frame" )[ 1 ];
                            frameset.rows = "*," + config.frameHeight;
                            frame.noResize = false;
                        }else if( currentMode === "window" ){
                            window = this.getWindow( "tracker_controller" );

                            if( window && !window.closed )
                                window.focus();
                            else
                                this.createWindow();
                        }

                        this.state = "show";
                        this.fire( "show" );
                    },

                    hide: function(){
                        var frameset, frame;

                        if( currentMode === "embed" )
                            frameset = document.getElementsByTagName( "frameset" )[ 0 ],
                            frame = frameset.getElementsByTagName( "frame" )[ 1 ],
                            frameset.rows = "*,0",
                            frame.noResize = true;
                        else if( currentMode === "window" )
                            controlWindow.close();

                        this.state = "hide";
                        this.fire( "hide" );
                    },

                    toggleMode: function(){
                        this.removeControllerFrame();

                        if( currentMode === "embed" )
                            currentMode = "window",
                            this.createWindow();
                        else if( currentMode === "window" )
                            currentMode = "embed",
                            this.createEmbed(),
                            this.show();

                        Feedback.setPanelMode( currentMode );
                    },

                    getMode: function(){
                        return currentMode; 
                    },

                    getWindow: function( name ){
                        // name: tracker_main | tracker_page | tracker_controller
                        if( !arguments.length || name === "tracker_main" )
                            return window;     
                        if( currentMode === "window" && name === "tracker_controller" )
                            return controlWindow;
                        else
                            return window.frames[ name ];
                    },

                    // privates
                    createEmbed: function(){
                        var page, controller;

                        promise.when( 
                            hasCreateEmbeded ? [ controllerBuilder( "embed" ) ] : 
                            [ pageBuilder(), controllerBuilder( "embed" ) ] 
                        ).then( util.bind( function( pageHtml, controllerHtml ){
                            if( !controllerHtml )
                                controllerHtml = pageHtml,
                                pageHtml = null;

                            if( pageHtml ){
                                window.name = "tracker_main";
                                this.write( "tracker_main", util.format( View.templates.frameset, {
                                    url: location.href,
                                    title: document.title, 
                                    charset: document.characterSet || "utf-8"
                                } ) );
                                this.write( "tracker_page", pageHtml );
                                page = this.getWindow( "tracker_page" );

                                this.fire( "pageLoad", page, page.document );
                                
//                                util.forEach(CodeList.list(), function(code, index){
//                                	code.covResult = page.__coverage__[code.covId];
//                                });
                            }

                            this.write( "tracker_controller", controllerHtml );
                            controller = this.getWindow( "tracker_controller" );

                            lookupForWindowReady( controller ).then( util.bind( function(){
                                this.fire( "controllerLoad", controller, controller.document );    
                            }, this ) );
                        }, this ) );

                        hasCreateEmbeded = true;
                    },

                    createWindow: function( conf ){
                        var width = screen.width - 200, height = screen.height - 200,
                            left = 100, top = 100, controller;

                        controlWindow = window.open( "about:blank", "", "width=" + width + 
                            ", height=" + height + ", left=" + left + ", top=" + top + 
                            ", toolbar=no, menubar=no, resizable=yes, status=no, " +
                            "location=no, scrollbars=yes" );

                        controllerBuilder( "window" ).then( util.bind( function( html ){
                            this.write( "tracker_controller", html );
                            controller = this.getWindow( "tracker_controller" );

                            lookupForWindowReady( controller ).then( util.bind( function(){
                                this.fire( "controllerLoad", controller, controller.document );    
                            }, this ) );
                        }, this ) );
                    },

                    removeControllerFrame: function(){
                        this.hide();

                        if( currentMode === "embed" )
                            this.write( "tracker_controller", "about:blank" );
                        else if( currentMode === "window" )
                            controlWindow = null;
                    },

                    write: function( name, content ){
                        var document;
                        document = this.getWindow( name ).document;
                        document.open( "text/html", "replace" );
                        document.write( content );
                        document.close();
                    }
                } );
            }(),

            ControlPanel: function(){
                var actions, window, document, currentSelectedCode;
                
                actions = {};

//                var rate = function( code ){
//                    var r, c;
//
//                    r = code.arriveRowsCount / code.rowsCount * 100 || 0;
//                    c = r == 0 ? "stress" : "";
//
//                    return "<span class='" + c + "'>" + r.toFixed( 1 ) + "%</span>";
//                };
//
//                var size = function( number ){
//                    return ( number / 1024 ).toFixed( 1 ) + "k";
//                };
//
//                var yesno = function( bool ){
//                    return ( bool && bool.length ) ? 
//                    "<span class='stress'>&#26159;<span>" : "&#21542;";
//                };
//
//                var state = function( state ){
//                    switch( state ){
//                        case "normal":
//                            return "&#27491;&#24120;";
//                        case "timeout":
//                            return "<span class='stress'>&#36229;&#26102;</span>";
//                        case "empty":
//                            return "<span class='stress'>&#26080;&#20869;&#23481;</span>";
//                    }
//                };

                var type = function( code ){
                    switch( code.type ){
                        case "embed":
                            return "&#20869;&#23884;";
                        case "link":
                            return "&#25991;&#20214;&#38142;&#25509;";
                        case "append":
                            return "&#21160;&#24577;&#25554;&#20837;";
                    };
                };

//                var time = function( time, s ){
//                    if( time == -1 )
//                        return "-1";
//                    if( !s )
//                        return time + "ms";
//                    else
//                        return ( time / 1000 ).toFixed( 2 ) + "s";
//                };

                var coverStatement = function( covResult ){
                	var scov = 0, ssum = 0;
                	if(covResult)
                		var s = covResult.s;
                	for(var i in s){
                		ssum ++;
                		if(s[i] > 0)
                			scov ++;
                	}

                	if(covResult){
	                	covResult.ssum = ssum;
	                	covResult.scov = scov;
                	}
                	
                	var srate = ssum == 0 ? 1 : scov / ssum;
                	if(covResult)
                		return util.round(srate * 100, 2) + "% (" + scov + "/" + ssum + ")";
                	else return "<font class=nan>NAN</font>";
                };
                
                var coverBranch = function( covResult ){
                	var bcov = 0, bsum = 0;
                	if(covResult)
                		var b = covResult.b;
                	for(var i in b){
                		for(var j = 0; j < b[i].length; j++){
                			bsum ++;
                    		if(b[i][j] > 0)
                    			bcov ++;
                		}
                	}
                	
                	if(covResult){
	                	covResult.bsum = bsum;
	                	covResult.bcov = bcov;
                	}
                	
                	var brate = bsum == 0 ? 1 : bcov / bsum;
                	
                	if(covResult)
                		return util.round(brate * 100, 2) + "% (" + bcov + "/" + bsum + ")";
                	else return "<font class=nan>NAN</font>";
                };
                
                var coverFunction = function( covResult ){
                	var fcov = 0, fsum = 0;
                	if(covResult)
                		var f = covResult.f;
                	for(var i in f){
                		fsum ++;
                		if(f[i] > 0)
                			fcov ++;
                	}
                	
                	if(covResult){
                		covResult.fsum = fsum;
                    	covResult.fcov = fcov;
                	}
                	
                	var frate = fsum == 0 ? 1 : fcov / fsum;
                
                	if(covResult)
                		return util.round(frate * 100, 2) + "% (" + fcov + "/" + fsum + ")";
                	else return "<font class=nan>NAN</font>";
                };
                
                var coverStatementGraph = function( covResult ){
                	if(covResult){
                    	var scov = covResult.scov, ssum = covResult.ssum;
                	}
                	
                	var srate = ssum == 0 ? 1 : scov / ssum;
                	
                    return Math.round(srate * 100);
                };
                
                var coverStatementTotal = function( codeList ){
                	var scov = 0, ssum = 0;
                	
                	util.forEach( codeList, function( code, index ){
                		if(code.covResult){
	                        ssum += code.covResult.ssum;
	                        scov += code.covResult.scov;
                		}
                    } );
                	
                	var srate = ssum == 0 ? 1 : scov / ssum;
                	
                    return util.round(srate * 100, 2) + "% (" + scov + "/" + ssum + ")";
                };
                
                var coverBranchTotal = function( codeList ){
                	var bcov = 0, bsum = 0;
                	
                	util.forEach( codeList, function( code, index ){
                		if(code.covResult){
	                        bsum += code.covResult.bsum;
	                        bcov += code.covResult.bcov;
                		}
                    } );
                	
                	var brate = bsum == 0 ? 1 : bcov / bsum;
                	
                    return util.round(brate * 100, 2) + "% (" + bcov + "/" + bsum + ")";
                };
                
                var coverFunctionTotal = function( codeList ){
                	var fcov = 0, fsum = 0;
                	
                	util.forEach( codeList, function( code, index ){
                		if(code.covResult){
	                        fsum += code.covResult.fsum;
	                        fcov += code.covResult.fcov;
                		}
                    } );
                	
                	var frate = fsum == 0 ? 1 : fcov / fsum;
                	
                    return util.round(frate * 100, 2) + "% (" + fcov + "/" + fsum + ")";
                };
                
                var coverStatementGraphTotal = function( codeList ){
                	var scov = 0, ssum = 0;
                	
                	util.forEach( codeList, function( code, index ){
                		if(code.covResult){
	                        ssum += code.covResult.ssum;
	                        scov += code.covResult.scov;
                		}
                    } );
                	
                	var srate = ssum == 0 ? 1 : scov / ssum;
                	
                    return Math.round(srate * 100);
                };
                
                var width = function(){
                    var mapping, offsets;

                    mapping = {
                        index: 30, name: 180, type: 80, "cover-statement": 160, "cover-branch": 160, "cover-function": 160, "cover-statement-graph": 160
                    };

                    offsets = {
                    };

                    return function( name, type ){
                        return mapping[ name ] + ( offsets[ type ] || 0 );
                    };
                }();

                var withWidths = function( data ){
                    var widths = {
                        widthIndex: width( "index" ),
                        widthName: width( "name" ),
                        widthType: width( "type" ),
                        widthCoverStatement: width( "cover-statement" ),
                        widthCoverBranch: width( "cover-branch" ),
                        widthCoverFunction: width( "cover-function" ),
                        widthCoverStatementGraph: width( "cover-statement-graph" )
                    };

                    if( !data )
                        return widths;

                    for( var i in widths )
                        data[ i ] = widths[ i ];

                    return data;
                };

                var codeTemplate = function( code ){
                    return util.format( View.templates.codeListLine, withWidths( {
                        id: code.id,

                        index: ++ codeIndex,
                        fileName: code.fileName,
                        type: type( code ),
                        coverStatement: coverStatement( code.covResult ),
                        coverBranch: coverBranch( code.covResult ),
                        coverFunction: coverFunction( code.covResult ),
                        coverStatementGraph: coverStatementGraph( code.covResult )
//                        rate: rate( code ),
//                        arriveRowsCount: code.arriveRowsCount,
//                        rowsCount: code.rowsCount,
//                        size: size( code.size ),
//                        bsize: size( code.beautifySize ),
//                        rerror: yesno( code.runErrors ),
//                        serror: yesno( code.syntaxErrors ),
//                        state: state( code.state ),
//                        runConsum: time( code.runConsum ),
//                        loadConsum: time( code.loadConsum )
                    } ) );
                };
                
                var codeTotalTemplate = function( codeList ){
                    return util.format( View.templates.codeListTotal, withWidths( {
                        coverStatementTotal: coverStatementTotal( codeList ),
                        coverBranchTotal: coverBranchTotal( codeList ),
                        coverFunctionTotal: coverFunctionTotal( codeList ),
                        coverStatementGraphTotal: coverStatementGraphTotal( codeList )
                    } ) );
                };

                var codeListTemplate = function( codeList ){
                    var htmls;
                    
                    htmls = [];
                    
                    if( codeList.length ){
                        util.forEach( codeList, function( code, index ){
                        	code.covResult = this.frames['tracker_page'].__coverage__[code.covId];
                            htmls[ index + 1 ] = codeTemplate( code );
                        } );
                        
                        htmls[ 0 ] = codeTotalTemplate( codeList );
                        
                        return htmls.join( "" );
                    }else{
                        return "<tr><td colspan='20'><div class='none'>&#35813;&#32593;&#39029;&#27809;&#26377;&#20219;&#20309;&#32;&#74;&#83;&#32;&#20195;&#30721;&#12290;</div></td></tr>";
                    }
                };

                var makeCodeTr = function( code ){
                    var layer, html;
                    
                    layer = document.createElement( "tbody" );
                    html = codeTemplate( code );
                    layer.innerHTML = html;

                    return layer.firstChild;
                };

                var asnyShowCode = function(){
                    var timer, timeout, interval, prepare, partCount, nowIndex, init,
                        currentDisposeLines, gutterEl, linesEl, regx1, regx2, result, 
                        linesCount, h1, h2;

                    timeout = 1;
                    partCount = 100;
                    regx1 = /\u0001/g;
                    regx2 = /\u0002/g;
//                    ckeyIdRegx = /id=ckey-(\d+)/g;
                    h1 = [];
                    h2 = [];

                    init = function(){
                        nowIndex = 0;
                        linesCount = 0;
                        window.clearInterval( timer );
                    };

                    prepare = function(){
                        var innerElId = util.id();
                        var gutterId = util.id();
                        var linesId = util.id();

                        codeEl.innerHTML = "<div id='" + innerElId + "' class='block clearfix' " +
                            "style='height: " + ( linesCount * 20 + 10 ) + "px;'>" +
                            "<div id='" + gutterId + "' class='gutter'></div>" +
                            "<div id='" + linesId + "' class='lines'></div></div>";
                        codeEl.scrollTop = 0;

                        gutterEl = document.getElementById( gutterId );
                        linesEl = document.getElementById( linesId );
                    };

                    interval = function(){
                        var t, p1, p2;

                        h1.length = h2.length = 0;

                        for( var i = 0; i < partCount; i ++ ){
                            if( nowIndex >= linesCount ){
                                init();
                                break;
                            }
                            
                            t = util.html( currentDisposeLines[ nowIndex ].text.text ).replace( regx1, "<" )
                            .replace( regx2, ">" );

//	                        t = t.replace( ckeyIdRegx, function( all, id ){
//	                            return StatusPool.arrivedSnippetGet( id ) ? 
//	                                all + " class='arrive'" : all;
//	                        } );

                            h1.push( util.tag( nowIndex + 1, "pre" ) );
                            h2.push( util.tag( t || " ", "pre" ) );

                            nowIndex ++;
                        }

                        p1 = document.createElement( "div" );
                        p2 = document.createElement( "div" );

                        p1.innerHTML = h1.join( "" );
                        p2.innerHTML = h2.join( "" );

                        gutterEl.appendChild( p1 );
                        linesEl.appendChild( p2 );
                    };

                    result = function( code ){
                        init();

                        if( code.state == "empty" ){
                            codeEl.innerHTML = "<div class='empty-code'>" +
                                    "&#20869;&#23481;&#20026;&#31354;</div>"; // 内容为空
                        }else if( code.state == "timeout" ){
                            codeEl.innerHTML = "<div class='timeout-code'>" +
                                    "&#35299;&#26512;&#36229;&#26102;</div>"; // 解析超时
                        }else{
                        	currentDisposeLines = Annotate.annotate(code.covResult, code.linesViewHtml);
                            linesCount = currentDisposeLines.length;
                            prepare();
                            timer = window.setInterval( interval, timeout );
                        }
                    };

                    result.clear = init;

                    return result;
                }();

                var setupBootstrapPatch = function(){
                    var setupDropdownMenu = function(){
                        var lastOpen;

                        var setup = function( el ){

                            var dropdownMenu = el.querySelector( ".dropdown-menu" );

                            Event.add( dropdownMenu, "click", function( e ){
                                util.removeClass( el, "open" );
                                lastOpen = null;
                                e.stopPropagation();
                            } );

                            Event.add( el, "click", function( e ){
                                util.addClass( el, "open" );
                                if( lastOpen && lastOpen != el )
                                    util.removeClass( lastOpen, "open" );
                                lastOpen = el;
                                e.stopPropagation();
                            } );
                        };

                        return function(){
                            var dropdowns = document.querySelectorAll( ".dropdown" );
                            for( var i = 0, l = dropdowns.length; i < l; i ++ )
                                setup( dropdowns[ i ] );
                            Event.add( document, "click", function(){
                                for( var i = 0, l = dropdowns.length; i < l; i ++ )
                                    util.removeClass( dropdowns[ i ], "open" );
                            } );
                        }
                    }();

                    var setupModalDialog = function(){

                        var close = function( modal ){
                            return function(){
                                modal.style.display = "none";
                            }
                        };

                        var setup = function( modal ){
                            var closeBtns = modal.querySelectorAll( ".modal-header .close, .modal-footer .btn" );
                            var fclose = close( modal );
                            for( var i = 0, l = closeBtns.length; i < l; i ++ )
                                Event.add( closeBtns[ i ], "click", fclose );
                        };

                        return function(){
                            var modals = document.querySelectorAll( ".modal" );
                            for( var i = 0, l = modals.length; i < l; i ++ )
                                setup( modals[ i ] );
                        } 
                    }();

                    var setupTab = function(){

                        var setup = function( tab ){
                            var target = tab.getAttribute( "data-target" );

                            if( !target )
                                return ;

                            target = document.getElementById( target );

                            var heads = tab.childNodes;
                            var bodys = target.childNodes;

                            tab.active = function( index ){
                                util.removeClass( heads[ tab.actived ], "active" );
                                util.removeClass( bodys[ tab.actived ], "tab-content-active" );

                                util.addClass( heads[ index ], "active" );
                                util.addClass( bodys[ index ], "tab-content-active" );

                                tab.actived = index;
                                tab.tabEvent.fire( "active", index );
                            };

                            Event.add( tab, "click", function( e ){
                                var li;

                                li = util.findParent( e.target, "li", this );
                                
                                util.forEach( this.childNodes, function( l, index ){
                                    if( li === l ){
                                        if( tab.actived == index )
                                            return ;
                                        tab.active( index );
                                    }
                                } );
                            } );

                            tab.tabEvent = Event.bind({});
                            tab.actived = 0;
                        };

                        return function(){
                            var tabs = document.querySelectorAll( ".nav" );
                            for( var i = tabs.length - 1; i >= 0; i -- )
                                setup( tabs[ i ] );
                        };
                    }();

                    return function(){
                        setupDropdownMenu();  
                        setupModalDialog();
                        setupTab();
                    };
                }();

                var codeEl, codeIndex = 0;

                return Event.bind( {
                    bindWindow: function( win ){
                        window = win;
                        document = window.document;
                        codeEl = document.getElementById( "code-content" );
                    },

                    addCode: function( code ){
                        var tbody, tr, index;

                        if( !document )
                            return ;

                        tbody = document.getElementById( "list-codes-tbody" );
                        index = CodeList.count() - 1;

                        if( code instanceof Array ){
                            tbody.innerHTML = codeListTemplate( code );
                        }else if( code instanceof Code ){
                            code.onReady( function(){
                                // code.index = index;
                            	code.covResult = this.frames['tracker_page'].__coverage__[code.covId];
                            	
                                tr = makeCodeTr( code );
                                tbody.appendChild( tr );
                            } );
                        }
                    },

                    showCodeDetail: function( id ){
                        var codeDetailHeadTab, actived;

                        codeDetailHeadTab = document.getElementById( "code-detail-head" );
                        actived = codeDetailHeadTab.actived;

                        currentSelectedCode = id || null;

                        document.getElementById( "code-detail" ).style.display = 
                            id ? "block" : "none";

                        if( id ){
                            if( actived === 0 ){
                                this.showCode( id );
                            }else if( actived == 1 ){
                                this.showCodeInfo( id );
                            }

                            var elementListCodes = document.getElementById( "list-codes" );
                            var trs = elementListCodes.querySelectorAll( "tr" );

                            util.forEach( trs, function( tr ){
                                if( tr.getAttribute( "data-code-id" ) == id )
                                    util.addClass( tr, "info" );
                                else
                                    util.removeClass( tr, "info" );
                            } );
                        }
                    },

                    showCode: function( id ){
                        if( id ){
                            code = CodeList.get( id );
                            asnyShowCode( code );
                        }
                    },

                    showCodeInfo: function( id ){
                        var elementCodeInfo, code;

                        elementCodeInfo = document.getElementById( "code-info" );
                        code = CodeList.get( id );

                        elementCodeInfo.innerHTML = util.format( View.templates.controllerCodeInfo, {
                            // id: code.id,
                            // index: ++ codeIndex,
                            fileName: code.fullUrl ? 
                                util.format( View.templates.url, { url: code.fullUrl } ) : 
                                "&#26469;&#33258;&#39029;&#38754;",
                            type: type( code ),
                            coverStatement: coverStatement( code.covResult ),
                            coverBranch: coverBranch( code.covResult ),
                            coverFunction: coverFunction( code.covResult )
//                            rate: rate( code ),
//                            arriveRowsCount: code.arriveRowsCount,
//                            rowsCount: code.rowsCount,
//                            size: size( code.size ),
//                            bsize: size( code.beautifySize ),
//                            rerror: yesno( code.runErrors ),
//                            serror: yesno( code.syntaxErrors ),
//                            state: state( code.state ),
//                            loadConsum: time( code.loadConsum ),
//                            runConsum: time( code.runConsum )
                        } );
                    },

                    updateCode: function( code ){
                        if( currentSelectedCode == code.id )
                            this.showCodeDetail( code.id );

                        var coverStatementEl, coverBranchEl, coverFunctionEl, coverStatementGraphEl;

                        coverStatementEl = document.getElementById( "code-" + code.id + "-coverStatement" );
                        coverBranchEl = document.getElementById( "code-" + code.id + "-coverBranch" );
                        coverFunctionEl = document.getElementById( "code-" + code.id + "-coverFunction" );
                        coverStatementGraphEl = document.getElementById( "code-" + code.id + "-coverStatementGraph" );
                        
                        if( !coverStatementEl )
                            return;

                        coverStatementEl.innerHTML = coverStatement( code.covResult );
                        coverBranchEl.innerHTML = coverBranch( code.covResult );
                        coverFunctionEl.innerHTML = coverFunction( code.covResult );
                        coverStatementGraphEl.getElementsByClassName("covered")[0].style.width = coverStatementGraph( code.covResult ) + 'px';
                        
                        code.lastUpdate = util.time();
                    },
                    
                    updateCodeTotal: function( codeList ){
                    	
                        var coverStatementTotalEl, coverBranchTotalEl, coverFunctionTotalEl, coverStatementGraphTotalEl;
                        
                        coverStatementTotalEl = document.getElementById( "code-total-coverStatement" );
                        coverBranchTotalEl = document.getElementById( "code-total-coverBranch" );
                        coverFunctionTotalEl = document.getElementById( "code-total-coverFunction" );
                        coverStatementGraphTotalEl = document.getElementById( "code-total-coverStatementGraph" );

                        if( !coverStatementTotalEl )
                            return;
                        
                        coverStatementTotalEl.innerHTML = coverStatementTotal( codeList );
                        coverBranchTotalEl.innerHTML = coverBranchTotal( codeList );
                        coverFunctionTotalEl.innerHTML = coverFunctionTotal( codeList );
                        coverStatementGraphTotalEl.getElementsByClassName("covered")[0].style.width = coverStatementGraphTotal( codeList ) + 'px';
                    },

                    actions: function( acts ){
                        for( var name in acts )
                            actions[ name ] = acts[ name ];
                    },

                    htmlBuilder: function(){
                        var pm = new promise;
                        codeIndex = 0;

                        util.delay( function(){
                            pm.resolve( util.format( View.templates.controllerPage, withWidths( {
                                charset: global.document.characterSet || "utf-8",
                                cachePhp: "http://127.0.0.1/smart-cov/cache.php?file=",

                                // css: View.templates.controllerCSS,
                                header: View.templates.controllerTopbar,

                                codeList: util.format( View.templates.controllerCodeList, withWidths() ),
                                codeDetail: View.templates.controllerCodeDetail,

                                dialogAbout: View.templates.controllerDialogAbout,
                                globalLoading: View.templates.controllerGlobalLoading,

                                version: version,
                                uid: host.tracker_uid
                            } ) ) );
                        } );
                        return pm;
                    },

                    eventBuilder: function(){
                        var me = this;

                        var elementListCodes = document.getElementById( "list-codes" );
                        var elementCodeDetail = document.getElementById( "code-detail" );
                        var elementCodeToolbarInner = document.querySelector( ".code-toolbar-inner" );
                        var elementCodeDetailHead = document.getElementById( "code-detail-head" );
                        var elementCodeContent = document.getElementById( "code-content" );

                        var tr, focusInList;
                        var tabDescRegx = /tab-desc-(\d+)/;

                        Event.add( elementListCodes, {
                            click: function( e ){
                                var codeId;
                                if( tr = util.findParent( e.target, "tr", elementListCodes ) )
                                    if( codeId = tr.getAttribute( "data-code-id" ) )
                                        focusInList = true,
                                        codeId == currentSelectedCode ||
                                            View.ControlPanel.showCodeDetail( codeId );
                            }
                        } );

                        Event.add( elementCodeDetail, {
                            click: function(){
                                focusInList = false;
                            }
                        } );

                        Event.add( document, {
                            mouseup: function( e ){
                                var action;
                                if( ( action = e.target.getAttribute( "action" ) ) &&
                                    actions[ action ] )
                                    actions[ action ].call( me, e.target );
                            },

                            keydown: function( e ){
                                // command + R, F5
                                var selectId;

                                if( ( e.metaKey && e.keyCode == 82 ) || e.keyCode == 116 ) 
                                    e.preventDefault && e.preventDefault();
                                if( focusInList && currentSelectedCode ){
                                    var offset = 0;
                                    if( e.keyCode == 38 ){ // up
                                        offset = -1;
                                    }else if( e.keyCode == 40 ){ // down
                                        offset = 1;
                                    }
                                    if( offset ){
                                        var trs = elementListCodes.querySelectorAll( "tr" ),
                                            nowIndex = -1, tr;
                                        
                                        for(var i = 0, l = trs.length; i < l; i ++){
                                            if( trs[i].getAttribute( "data-code-id" ) ==
                                                currentSelectedCode ){
                                                nowIndex = i;
                                                break;
                                            }
                                        }

                                        if( nowIndex > -1 ){
                                            nowIndex = ( nowIndex += offset ) < 0 ?
                                                0 : nowIndex == trs.length ? 
                                                nowIndex - 1 : nowIndex;
                                            tr = trs[ nowIndex ];

                                            selectId = tr.getAttribute( "data-code-id" );
                                            if( currentSelectedCode != selectId )
                                                View.ControlPanel.showCodeDetail( selectId );

                                            e.preventDefault && e.preventDefault();
                                        }
                                    }
                                }
                            }
                        } );

                        if( !actions[ "code#close" ] )
                            actions[ "code#close" ] = function( e ){
                                focusInList = true;
                                View.ControlPanel.showCodeDetail( false );
                            };

                        if( !actions[ "about#open" ] )
                            actions[ "about#open" ] = function(){
                                document.getElementById( "dialog-about" ).style.display = "block";  
                            };

                        if( View.ControlFrame.getMode() == "window" )
                            document.getElementById( "window-mode-trigger" ).innerHTML =
                                "&#24182;&#21015;&#27169;&#24335;";

                        var lastScrollLeft = 0;
                        Event.add( elementCodeContent, "scroll", function(){
                            if( lastScrollLeft == this.scrollLeft )
                                return ;
                            
                            var gutter = this.querySelector( ".gutter" );
                            gutter.style.left = this.scrollLeft + "px";
                            lastScrollLeft = this.scrollLeft;
                        } );

                        setupBootstrapPatch();

                        elementCodeDetailHead.tabEvent.on( "active", function( index ){
                            if( this.currentShown != currentSelectedCode ){
                                this.currentShown = currentSelectedCode;
                                index == 1 && View.ControlPanel.showCodeInfo( currentSelectedCode );
                                index == 0 && View.ControlPanel.showCode( currentSelectedCode );
                            }

                            var tabDescs = elementCodeToolbarInner.querySelectorAll( ".tab-desc" );
                            util.forEach( tabDescs, function( tabDesc ){
                                tabDescRegx.test( tabDesc.className );
                                tabDesc.style.display = RegExp.$1 == index ? "" : "none";
                            } );
                        } );

                        if( currentSelectedCode )
                            this.showCodeDetail( currentSelectedCode );
                    }
                } );
            }()
        }  
    }();

    var Feedback = function(){
        var urlBase, messageBase, url, runErrors, syntaxErrors, timer, timeout, me, tt, uid,
            autoStartTimer, autoStartTimeout, started, codeCount, sended, startTime, panelMode;

        messageBase = "Tracker: ";
        url = location.href;
        codeCount = 0;
        runErrors = 0;
        syntaxErrors = 0;
        tt = host.tracker_type == "bm" ? "bookmarks" : "temp";
        uid = host.tracker_uid || "guest";
        timeout = 2e3;
        autoStartTimeout = 1e4;
        startTime = util.time();
//        analysisTime = 0;
        panelMode = "embed";

//        getUrl = function(){
//            var errors, message;
//            
//            errors = [ runErrors, syntaxErrors ];
//            message = encodeURIComponent( [ 
//                messageBase, 
//                "[ Browser ]", util.browser.name, 
//                "[ User ]", tt, uid,
//                "[ Codes ]", codeCount,
//                "[ Errors ]", errors.join( " " ),
//                "[ Controller ]", View.ControlFrame.state, panelMode,
//                "[ AnalysisTime ]", analysisTime,
//                "[ Stay ]", ( ( util.time() - startTime ) / 1000 ).toFixed( 1 ) + "s",
//                "[ Version ]", version,
//                "[ Url ]", url ].join( " " ) );
//
//            return urlBase + message;
//        };

        return me = {
            lookup: function( code ){
                var me = this;

                codeCount ++;

                code.on( "error", function( type ){
                    switch( type ){
                        case "runErrors":
                            runErrors ++;
                            break;
                        case "syntaxErrors":
                            syntaxErrors ++;
                            break;
                    }
                } );

                // if( !started ){
                //     clearTimeout( autoStartTimer );
                //     autoStartTimer = setTimeout( function(){
                //         me.start();
                //     }, autoStartTimeout );
                // }
            },

            setPanelMode: function( mode ){
                panelMode = mode;
            },

//            setAnalysisEnd: function(){
//                analysisTime = ( ( util.time() - startTime ) / 1000 ).toFixed( 1 ) + "s";
//            }
        }
    }();

    var restorePageEnvironments = function(){
        var i, lastTimerId, tempIframe, fixList, tempArray, sourceArray, 
            tempDocument;

        lastTimerId = setTimeout( "1", 0 );

        for( i = lastTimerId, down = max( 0, lastTimerId - 200 ); 
            i >= down; i -- )
            clearTimeout( i ),
            clearInterval( i );

        // NOTE: 恢复可能被目标页面破坏掉的几个主要的 Array 方法
        tempIframe = host.createElement( "iframe" );
        tempIframe.style.cssText = "width: 1px; height: 1px; top: -1000px; " +
            "position: absolute;";
        host.body.appendChild( tempIframe );
        fixList = ( "push, pop, slice, splice, shift, unshift, concat, join, " +
            "reverse" ).split( ", " );
        tempArray = tempIframe.contentWindow.Array.prototype;
        sourceArray = Array.prototype;

        for( i = 0, l = fixList.length; i < l; i ++ )
            sourceArray[ fixList[ i ] ] = tempArray[ fixList[ i ] ];

        fixList = [ "open", "write", "close" ];
        tempDocument = tempIframe.contentDocument;

        for( i = 0, l = fixList.length; i < l; i ++ )
            host[ fixList[ i ] ] = function( fn, host ){
                return function(){
                    return fn.apply( host, arguments );
                }
            }( tempDocument[ fixList[ i ] ], host );
        
        host.body.removeChild( tempIframe );
        tempIframe = null;
        tempDocument = null;
    };

//    var StatusPool = host.StatusPool = function(){
//        var arrivedSnippetCache, snippetToCodeCache, beginOfLineSnippetCache, code, i, id, l;
//
//        arrivedSnippetCache = {}; // 已到达的代码碎片池（所有代码）
//        snippetToCodeCache = {}; // 代码碎片到代码的映射池
//        beginOfLineSnippetCache = {}; // 处于行首的代码碎片池（所有代码）
//
//        return {
//            arrivedSnippetPut: function( id ){
//                if( !arrivedSnippetCache[ id ] ){
//                    arrivedSnippetCache[ id ] = 1;
//
//                    if( beginOfLineSnippetCache[ id ] && ( code = snippetToCodeCache[ id ] ) ){
////                        code.arriveRowsCount ++;
//                        //code.lastModified = util.time();
//                    }
//                }
//            },
//
//            arrivedSnippetGet: function( id ){
//                return arrivedSnippetCache[ id ];
//            },
//
//            snippetToCodePut: function( id, codeIns ){
//                if( !snippetToCodeCache[ id ] )
//                    snippetToCodeCache[ id ] = codeIns;
//            },
//
//            snippetToCodeGet: function( id ){
//                return snippetToCodeCache[ id ];
//            },
//
//            beginOfLineSnippetPut: function( /* id, id, ... */ ){
//                for( i = 0, l = arguments.length; i < l; i ++ )
//                    if( !beginOfLineSnippetCache[ id = arguments[ i ] ] )
//                        beginOfLineSnippetCache[ id ] = 1;
//            },
//
//            beginOfLineSnippetGet: function( id ){
//                return beginOfLineSnippetCache[ id ];
//            }
//        }
//    }();
    
    //在源码上加覆盖标记 start
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
	            offsets.splice(i, 0, { pos: pos, len: len });
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
	
    var Annotate = function(){
    	var lt = '\u0001',
            gt = '\u0002';
        
    	function annotateStatements(fileCoverage, structuredText){
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
	                    for(var i = startLine; i <=  endLine; i ++){
	                    	text = structuredText[i].text;
	                    	if(!(i == endLine && endCol == text.startPos))
		                    	if(!/^[ \f\n\r\t\v\u00A0\u2028\u2029]*(\/\/[\S\s]*)*(\/\*[\S\s]*)*$/.test(text.text))
			                    	text.wrap(i == startLine ? startCol: text.startPos, 
	                    				openSpan, 
	                    				i == endLine ? endCol : text.originalLength(), 
	                    			    closeSpan);
	                    }
	                }
	                else{
	                	text = structuredText[startLine].text;
		                text.wrap(startCol, openSpan, endCol, closeSpan);
	                }
	            }
	        });
    	};
    	
    	function annotateFunctions(fileCoverage, structuredText) {

    	    var fnStats = fileCoverage.f,
    	        fnMeta = fileCoverage.fnMap;
    	    if (!fnStats) { return; }
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
    	    if (!branchStats) { return; }

    	    Object.keys(branchStats).forEach(function (branchName) {
    	        var branchArray = branchStats[branchName],
    	            sumCount = branchArray.reduce(function (p, n) { return p + n; }, 0),
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

    	        if (sumCount > 0) { //only highlight if partial branches are missing
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

    	                if (count === 0) { //skip branches taken
    	                	if (endLine !== startLine) {
    		                    for(var j = startLine; j <=  endLine; j ++){
    		                    	text = structuredText[j].text;
    		                    	if(!(j == endLine && endCol == text.startPos))
    			                    	if(!/^[ \f\n\r\t\v\u00A0\u2028\u2029]*(\/\/[\S\s]*)*(\/\*[\S\s]*)*$/.test(text.text))
    			                    		text.wrap(j == startLine ? startCol: text.startPos, 
			                    				openSpan, 
			                    				j == endLine ? endCol : text.originalLength(), 
			                    				closeSpan);
    		                    }
    		                }
    	                	else{
    	                		text = structuredText[startLine].text;
        	                    if (branchMeta[branchName].type === 'if') { 
        	                        text.insertAt(startCol, lt + 'span class=missing-if-branch' +
        	                             gt + (i === 0 ? 'I' : 'E')  + lt + '/span' + gt, true, false);
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
        	annotate: function(fileCoverage, code){
        		var count = 0, structured = code.map(function (str) { count += 1; return { line: count, covered: null, text: new InsertionText(str, true) }; });
            	structured.unshift({ line: 0, covered: null, text: new InsertionText("") });
        		
                annotateStatements(fileCoverage, structured);
                annotateFunctions(fileCoverage, structured);
        		annotateBranches(fileCoverage, structured);
                
                structured.shift();
                return structured;
        	}
        }
    }();
    //在源码上加覆盖标记 end

    var Decorate = host.Decorate = function( window, document ){
        var Element, appendChild, insertBefore, getAttribute, check, checklist, scriptElements, i, l;
            // __tracker__Cache, a;

        Element = window.Element.prototype;
        appendChild = Element.appendChild;
        insertBefore = Element.insertBefore;
        // getAttribute = Element.getAttribute;
        scriptElements = document.scripts;

        var overideInsertingNodeFunction = function( fn ){
            return function( node ){
                var me, args, url, code, content;

                me = this;
                args = slice.apply( arguments );

                if( !node || node.nodeName != "SCRIPT" )
                    return fn.apply( me, args );

                url = node.getAttribute( "src" );

                if( !url )
                    return fn.apply( me, args );

                util.intelligentGet( url ).then( function( data ){
                    content = data.response;
                    code = new Code( url, content );

                    code.setType( "append" );
//                    code.loadConsum = data.consum;
                    CodeList.add( code );

                    node.removeAttribute( "src" );
                    // node.setAttribute( "tracker-src", url );

                    code.onReady( function(){
                        var index;
                        
                        index = util.handle( node );
                        
                        node.appendChild(
                            document.createTextNode( 
                                "__trackerScriptStart__('" + code.id + "'," + index + ");" + 
                                code.executiveCode + "; __trackerScriptEnd__('" +
                                code.id + "');" ) );

                        fn.apply( me, args );
                        node.src = url;
                    } );

                    View.ControlPanel.addCode( code );
                }, function(){
                    code = new Code( url );
                    code.setType( "append" );
                    code.setState( "timeout" );
                    CodeList.add( code );

                    code.onReady( function(){
                        fn.apply( me, args );
                    } );
                    
                    View.ControlPanel.addCode( code );
                } );

                return node;
            };
        };

//         var overideAttributeFunction = function( fn ){
//             return function(){
//                 var args;
//
//                 args = slice.apply( arguments );
//
//                 if( this.nodeName != "SCRIPT" )
//                     return fn.apply( this, args );
//
//                 if( args[0].toLowerCase() == "src" && 
//                     this.hasAttribute( "tracker-src" ) &&
//                     !this.hasAttribute( "src" ) )
//                     args[0] = "tracker-src";
//
//                 return fn.apply( this, args );
//             }  
//         };

        check = function( item, name ){
            if( item && item.prototype && item.prototype[ name ] )
                if( item.prototype[ name ] != Element[ name ] )
                    item.prototype[ name ] = Element[ name ];
        };

        checklist = [ window.HTMLElement, window.HTMLHeadElement, window.HTMLBodyElement ];

        Element.appendChild = overideInsertingNodeFunction( appendChild );
        Element.insertBefore = overideInsertingNodeFunction( insertBefore );
        // Element.getAttribute = overideAttributeFunction( getAttribute );

        util.forEach( checklist, function( object ){
            check( object, "appendChild" );
            check( object, "insertBefore" );
//             check( object, "getAttribute" );
        } );

        // __tracker__Cache = {};

//        window.__tracker__ = function( id /* , id, id, ... */ ){
//            // a = join.call( arguments, "," );
//            // if( __tracker__Cache[ a ] )
//            //     return ;
//            // __tracker__Cache[ a ] = 1;
//            // for( i = 0, l = arguments.length; i < l; i ++ )
//            //     StatusPool.arrivedSnippetPut( arguments[ i ] );
//            i = 0;
//            l = arguments.length;
//            do{
//                StatusPool.arrivedSnippetPut( arguments[ i ++ ] );
//            }while( i < l );
//        };

        window.__trackerError__ = function( codeId, msg ){
            CodeList.get( codeId ).addError( msg );
        };

        window.__trackerMockTop__ = function(){
            return {
                location: {},
                document: { write: util.blank }
            };
        };

        window.__trackerScriptStart__ = function( codeId, scriptTagIndex ){
            var script, code;
            
            script = scriptTagIndex === undefined ? 
                scriptElements[ scriptElements.length - 1 ] :
                util.handle( scriptTagIndex );

            if( script && script.hasAttribute( "tracker-src" ) )
                script.src = script.getAttribute( "tracker-src" );

            setTimeout( function(){
                if( script.onreadystatechange )
                    script.onreadystatechange();
            }, 0 );

            code = CodeList.get( codeId );
            //code._startTime = new Date();
        };

        window.__trackerScriptEnd__ = function( codeId ){
            var code;

            //endTime = new Date();
            code = CodeList.get( codeId );
            //code.runConsum = endTime.getTime() - code._startTime.getTime();
            // TODO: 此值虚高，因为钩子运行本身也产生耗时，需要扣除钩子时间才准确
            //delete code._startTime;
            //code.lastModified = util.time();
        };

        window.onbeforeunload = function(){
            var now = util.time();
            while( util.time() - now < 500 );
        };
    };

//    var Tracker = function( host ){
//        var cmd = function( cmd ){
//            var n = arguments[1];
//            switch( cmd ){
//                case "code":
//                    return typeof n != "undefined" ?
//                        CodeList.get( n ) : CodeList.list();
//                default:
//                    return "no such command";
//            }
//        };
//
//        var page = function( fn ){
//            var win, doc;
//
//            win = View.ControlFrame.getWindow( "tracker_page" );
//            doc = win.document;
//
//            return fn( win, doc );
//        };
//
//        cmd.toString =
//        page.toString = function(){
//            return "undefined";
//        };
//
//        host.cmd = cmd;
//        host.page = page;
//
//        return host;
//    }( host );
//
//    var Plugins = Tracker.Plugins = function(){
//        return {
//            addOn: function( name, fn ){
//                fn.call( this, CodeList, View );
//            },
//
//            addStyle: function( text ){
//                this.onControllerLoad( function(){
//                    var document, style;
//
//                    document = View.ControlFrame.getWindow( "tracker_controller" ).document;
//                    style = document.createElement( "style" );
//                    style.type = "text/css";
//                    style.appendChild( document.createTextNode( text ) );
//
//                    document.head.appendChild( style );
//                } );
//            },
//
//            addPanel: function( title, panelDefine ){
//                this.onControllerLoad( function(){
//                    var window, document, topNav, panels, titleEl, panelEl;
//
//                    window = View.ControlFrame.getWindow( "tracker_controller" );
//                    document = window.document;
//                    topNav = document.getElementById( "top-nav" );
//                    panels = document.getElementById( topNav.getAttribute( "data-target" ) );
//
//                    titleEl = document.createElement( "li" );
//                    titleEl.className = "relative";
//                    titleEl.innerHTML = "<a href='' onclick='return false'>" + title + "</a>";
//                    topNav.appendChild( titleEl );
//
//                    panelEl = document.createElement( "li" );
//                    panels.appendChild( panelEl );
//
//                    panelDefine.call( panelEl, window, document );
//                } );
//            },
//
//            setup: function( src ){
//                var script;
//
//                script = host.createElement( "script" );
//                script.type = "text/javascript";
//                script.src = src;
//
//                host.head.appendChild( script );
//            },
//
//            // privates
//            onControllerLoad: function( fn ){
//                if( controllerOnLoad.fired )
//                    controllerOnLoad( fn );
//
//                View.ControlFrame.on( "controllerLoad", fn );
//            }
//        }
//    }();

    var pageBaseUrl = path.getBase( host );
    var pageBaseProtocol = pageBaseUrl.match( /^(\w+):/ )[ 1 ];

    // business logic
    void function(){
        var currentCodeId, updateInterval, hookDebuggingCode, codes, 
            pluginsUrlBase;

        controllerOnLoad = promise.fuze();
        host.TrackerGlobalEvent = Event.bind();
        pluginsUrlBase = "http://127.0.0.1/smart-cov/cache.php?file=./plugins/";

        hookDebuggingCode = function( content, code ){
            return "__trackerScriptStart__('" + code.id + "');" + content + 
                "; __trackerScriptEnd__('" + code.id + "');";
        };

        View.ControlFrame.pageBuilder( function( html ){
            var pm = new promise,
                charset = document.characterSet,
                allScriptTagRegx = /(<script\b[^>]*>)([\s\S]*?)(<\/script>)/gi,
                srcPropertyRegx = / src=["']([^"']+)["']/,
                typePropertyRegx = / type=["']([^"']+)["']/,
                scriptRegx = /(<script\b [^>]*src=["']([^"']+)["'][^>]*>)\s*(<\/script>)/gi,
                ieConditionalCommentsRegx = /<!--\[if .*IE.*\]>[\s\S]*?<!\[endif\]-->/gi,
                firstTagRegx = /(<[^>]+>)/,
                pageStartingOf = "<script> parent.document.Decorate( window, document ); </script>";

            util.request( location.href, charset ).then( function( html ){
                html = html.response.replace( ieConditionalCommentsRegx, "" );
                AsynStringReplacer.replace( html, allScriptTagRegx, 
                    function( raw, openTag, content, closeTag ){
                        var pm, code;
                        
                        pm = new promise;

                        if( srcPropertyRegx.test( openTag ) ){ // is outer script
                            View.Loading.addCount();
                            pm.resolve( raw );
                            return pm;
                        }

                        if( typePropertyRegx.test( openTag ) &&
                            RegExp.$1.toLowerCase() != "text/javascript" ){ // is not javascript
                            // TODO: 对于非 text/javascript，将来也放到 code list 中，以便于查询
                            pm.resolve( raw );
                            return pm;
                        }

                        // embed script
                        View.Loading.addCount();

                        code = new Code( null, content );
//                        code.loadConsum = 0;
                        code.setType( "embed" );
                        CodeList.add( code );

                        code.onReady( function(){
                            pm.resolve( openTag + hookDebuggingCode( code.executiveCode, code ) + 
                                closeTag );
                            View.Loading.addProgress();
                        } );

                        return pm;
                    }
                ).then( function( html ){
                    AsynStringReplacer.replace( html, scriptRegx, 
                        function( raw, openTag, url, closeTag ){
                            var pm, content;

                            pm = new promise;
                            openTag = openTag.replace( srcPropertyRegx, " tracker-src='$1'" );

                            util.intelligentGet( url ).then( function( data ){
                                var code;

                                content = data.response;
                                code = new Code( url, content );
//                                code.loadConsum = data.consum;
                                code.setType( "link" );
                                CodeList.add( code );

                                code.onReady( function(){
                                    View.Loading.addProgress();
                                    pm.resolve( openTag + 
                                        hookDebuggingCode( code.executiveCode, code ) + closeTag );
                                } );
                            }, function(){
                                var code;
                                
                                code = new Code( url );
                                code.setState( "timeout" );
                                CodeList.add( code );

                                code.onReady( function(){
                                    View.Loading.addProgress();
                                    pm.resolve( raw );
                                } );
                            } );

                            return pm;
                        }
                    ).then( function( html ){
                        View.Loading.hide();
                        util.delay( function(){
                            CodeList.sort();
                            pm.resolve( html.replace( firstTagRegx, "$1" + pageStartingOf ) );
                        } );
                    } );
                } );
            }, function(){
                var message, refresh;

                message = "&#22788;&#29702;&#36229;&#26102;"; // 处理超时
                refresh = function(){
                    location.assign( location.href );  
                };

                View.Loading.text( message ).then( refresh );
            } );

            return pm;
        } );

        View.ControlFrame.controllerBuilder( View.ControlPanel.htmlBuilder );

        View.ControlFrame.on( "pageLoad", function( window, document ){
            var base, head;

            // TODO: 如果页面本身已有 base 标签？
            base = document.createElement( "base" );
            head = document.head || document.getElementsByTagName( "head" )[0];
            base.setAttribute( "target", "tracker_main" );
            head.appendChild( base );

            Event.add( window, "unload", function(){
                location.assign( location.href );
            } );
        } );

        View.ControlFrame.on( "controllerLoad", function( window, document ){
            View.ControlPanel.bindWindow( window );
            View.ControlPanel.addCode( codes = CodeList.list() );
            View.ControlPanel.eventBuilder();
            controllerOnLoad.fire( window, document );

            if( currentCodeId )
                View.ControlPanel.showCodeDetail( currentCodeId );
        } );

        View.ControlFrame.on( "hide", function(){
            clearInterval( updateInterval );
        } );
        
        View.ControlFrame.on( "show", function(){
        	updateInterval = setInterval( updateIntervalFunc, 3e3 );
        } );

        View.ControlPanel.actions( {
            "frame#close": util.bind( View.ControlFrame.hide, View.ControlFrame ),
            "frame#toggle": util.bind( View.ControlFrame.toggleMode, View.ControlFrame )
        } );

        host.TrackerGlobalEvent.on( "TrackerJSLoad", function(){
            controllerOnLoad( util.bind( View.ControlFrame.show, View.ControlFrame ) );
        } );

        restorePageEnvironments();
        View.Loading.show();
        View.ControlFrame.createEmbed();

        controllerOnLoad( function( window, document ){
            var waitTime, loadingEl;

            //Feedback.setAnalysisEnd();

            waitTime = document.getElementById( "waitTime" );
            loadingEl = document.getElementById( "loading" );
            loadingEl.style.display = "block";
            
            util.onCpuFree( function(){
                loadingEl.style.display = "none";
            }, function( t ){
                waitTime.innerHTML = "(" + (t / 1000).toFixed( 3 ) + "s)";
            } );

            updateIntervalFunc = function(){
                if( !codes )
                    return ;
                util.forEach( codes, function( code ){
                	code.covResult = this.frames["tracker_page"].__coverage__[code.covId];
                	
                	if(code.covResult){
                		var scov = util.count(code.covResult.s);
                    	
                        if( !code.covResult.lastScov || code.covResult.lastScov < scov ){
                        	code.covResult.lastScov = scov;
                            View.ControlPanel.updateCode( code );
                        }
                	}
                } );
                
                View.ControlPanel.updateCodeTotal( codes );
                
            };
        } );

        // setTimeout( function(){
        //     Plugins.setup( pluginsUrlBase + "general.js&version=20130421" + Math.random() );
        // }, 100 );
    }();
} );   

void function(global) {
	   
   host = global.document;

   if( host.combocodegen )
       return ;
       
   var instrumenter = new Instrumenter({
       debug: false,
       noAutoWrap: true,
       codeGenerationOptions: {
           format: {
               compact: false,
           }
       }
   });

   host.combocodegen = function( code ){
	   var covId = String(new Date().getTime()) + '.js';
	   code.covId = covId;
	  
	   if(host.format)
		   code.origContent = escodegen.generate(esprima.parse(code.origContent, {loc: true}), {format: {compact: false }});
       
	   return instrumenter.instrumentSync(code.origContent, covId);
   };
}(this);