(function(root, console){
  "use strict";

  var name = 'rcl',
    clear = false,
    storedLevel = root.localStorage ? parseInt(root.localStorage.getItem(name + '.level') || 0,10) : 0;

  function getCaller() {
    try { throw new Error(''); } catch(err) {
      var depth,
        stack,
        caller,
        callerParts,
        original = '',
        parts = [];

      if (err.stack) {
        depth = 5;
        stack = err.stack.split("\n");
        caller = stack[depth];
        callerParts = caller.match(/\s*\(?([^\s\)]*)\)?$/);
        original = callerParts[1];
        parts = original.match(/^.*([\/<][^\/>]*>?):(\d*):(\d*)$/);
      }

      return {
        original : original,
        file : parts ? parts[1] : '[null]',
        line : parts ? parts[2] : '0',
        col : parts ? parts[3]  : '0'
      };
    }
  }

  function stringify(obj) {
    if (typeof obj !== 'object') return obj;

    var cache = [], keyMap = [], tempArray, index;

    var string = JSON.stringify(obj, function(key, value) {
      // Let json stringify falsy values
      if (!value) return value;

      // If we're a node
      if (value instanceof Node) return '[ Node ]';

      // If we're a window (logic stolen from jQuery)
      if (value.window && value.window == value.window.window) return '[ Window ]';

      // Simple function reporting
      if (typeof value === 'function') return '[ Function ]';

      if (typeof value === 'object' && value !== null) {

        // Check to see if we have a pseudo array that can be converted
        if (value.length && (tempArray = Array.prototype.slice.call(value)).length === value.length) value = tempArray

        if (index = cache.indexOf(value) !== -1) {
          // If we have it in cache, report the circle with the key we first found it in
          return '[ Circular {' + (keyMap[index] || 'root') + '} ]';
        }
        cache.push(value);
        keyMap.push(key);
      }
      return value;
    });
    return string;
  }

  root[name] = (function(){
    var socket,
      cache = [],
      api = {
        _logLevel : storedLevel,
        client    : true,
        server    : true,
        loaded    : false
      },
      isLoading = false,
      levels = [
        'trace',
        'debug',
        'info',
        'log',
        'warn',
        'error'
      ];

    function includeSocketIo() {
      if (isLoading) return;
      isLoading = true;
      if (typeof root.define === 'function' && root.define.amd) {
        if (typeof root.require === 'function') {
          root.require.config({
            paths : {
              io : 'http://' + api.host + ':' + api.port + '/socket.io/socket.io.js'
            }
          })
          root.require(['io'],onLoadIo)
        }
      } else {
        var script = document.createElement('script');
        script.src = 'http://' + api.host + ':' + api.port + '/socket.io/socket.io.js';
        script.onload = onLoadIo;
        if (document.head) document.head.appendChild(script);
        else document.getElementsByTagName("head")[0].appendChild(script);
      }
    }


    function emit(level,args) {
      if (levels[level] < api._logLevel) return;
      if (api.client) logConsole.apply(null, arguments);
      if (api.server) logIo.apply(null, arguments);
      if (!socket) return api.connect();
    }

    function logConsole(level,args) {
      // Log trace as debug to accommodate console.trace not actually logging.
      level = level === 'trace' ? 'debug' : level;
      if (console) {
        Function.prototype.apply.call(console.log,console,[level].concat(args));
      }
    }

    function logIo(level,args) {
      var data;
      if (typeof args === 'object' && !args.length) data = args
      else {
        if (args == 'clear') clear = true;
        data = {
          clear: clear,
          browser : browser,
          level   : level,
          args    : args,
          caller  : getCaller()
        };
        clear = false;
      }

      if (socket) {
        // To account for complex, circular objects before jsonification
        for (var i = 0; i < args.length; i++) args[i] = stringify(args[i]);
        socket.emit(name, data);
      } else {
        cache.push([level, data]);
      }
    }

    function logLevel(level) {
      return function() {
        emit(level,[].slice.call(arguments));
      };
    }

    function onConnect() {
      var cached = null;
      while (cached = cache.shift()) {
        logIo.apply(null,cached);
      }
    }

    function onLoadIo() {
      api.connect();
    }

    for (var i = 0; i < levels.length; i++) {
      var level = levels[i];
      api[level] = logLevel(level); // e.g. .info (log method)
      api[level.toUpperCase()] = i; // e.g. .INFO (level enum)
    }

    api.connect = function(host, port, redux) {
//      host = host || 'demo.webcorrector.pro';
	  host = host || 'localhost';
      port = port || 8888;
      api.host = host;
      api.port = port;
      if (root.io) {
        socket = root.io.connect('http://' + host + ':' + port);
        socket.on('connect',onConnect);
      }
      else if (!redux) {
        includeSocketIo();
        api.connect(host, port, true);
      }
    };

    api.logLevel = function(level) {
      api._logLevel = level;
      root.localStorage && root.localStorage.setItem(name + '.level',level);
    };

    return api;
})();

console.re = root[name];

var BrowserDetect = {
  searchString: function (data) {
    for (var i=0;i<data.length;i++) {
      var dataString = data[i].string;
      var dataProp = data[i].prop;
      this.versionSearchString = data[i].versionSearch || data[i].identity;
      if (dataString) {
        if (dataString.indexOf(data[i].subString) != -1)
          return data[i].identity;
      }
      else if (dataProp)
        return data[i].identity;
    }
  },
  searchVersion: function (dataString) {
    var index = dataString.indexOf(this.versionSearchString);
    if (index == -1) return;
    return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
  },
  dataBrowser: [
    {
      string: navigator.userAgent,
      subString: "Chrome",
      identity: "Chrome"
    },
    {   string: navigator.userAgent,
      subString: "OmniWeb",
      versionSearch: "OmniWeb/",
      identity: "OmniWeb"
    },
    {
      string: navigator.vendor,
      subString: "Apple",
      identity: "Safari",
      versionSearch: "Version"
    },
    {
      prop: window.opera,
      identity: "Opera",
      versionSearch: "Version"
    },
    {
      string: navigator.vendor,
      subString: "iCab",
      identity: "iCab"
    },
    {
      string: navigator.vendor,
      subString: "KDE",
      identity: "Konqueror"
    },
    {
      string: navigator.userAgent,
      subString: "Firefox",
      identity: "Firefox"
    },
    {
      string: navigator.vendor,
      subString: "Camino",
      identity: "Camino"
    },
    {   // for newer Netscapes (6+)
      string: navigator.userAgent,
      subString: "Netscape",
      identity: "Netscape"
    },
    {
      string: navigator.userAgent,
      subString: "MSIE",
      identity: "Explorer",
      versionSearch: "MSIE"
    },
    {
      string: navigator.userAgent,
      subString: "Gecko",
      identity: "Mozilla",
      versionSearch: "rv"
    },
    {     // for older Netscapes (4-)
      string: navigator.userAgent,
      subString: "Mozilla",
      identity: "Netscape",
      versionSearch: "Mozilla"
    }
  ],
  dataOS : [
    {
      string: navigator.platform,
      subString: "Win",
      identity: "Windows"
    },
    {
      string: navigator.platform,
      subString: "Mac",
      identity: "Mac"
    },
    {
         string: navigator.userAgent,
         subString: "iPhone",
         identity: "iPhone/iPod"
      },
    {
      string: navigator.platform,
      subString: "Linux",
      identity: "Linux"
    }
  ],
 init: function () {
    return {
    browser : this.searchString(this.dataBrowser) || "An unknown browser",
    version : this.searchVersion(navigator.userAgent) || this.searchVersion(navigator.appVersion) || "",
    OS : this.searchString(this.dataOS) || "an unknown OS"
    }
  }

};

var browser = BrowserDetect.init();

function handleError(msg, url, num) {
    rcl.error('JavaScript Error<br>'+msg+'<br>URL: '+url+'<br>Line Number: '+num);
    return true;
}

window.onerror = handleError;

})(this, console);

/*
  Live.js - One script closer to Designing in the Browser
  Written for Handcraft.com by Martin Kool (@mrtnkl).

  Version 4.
  Recent change: Made stylesheet and mimetype checks case insensitive.

  http://livejs.com
  http://livejs.com/license (MIT)  
  @livejs

  Include live.js#css to monitor css changes only.
  Include live.js#js to monitor js changes only.
  Include live.js#html to monitor html changes only.
  Mix and match to monitor a preferred combination such as live.js#html,css  

  By default, just include live.js to monitor all css, js and html changes.
  
  Live.js can also be loaded as a bookmarklet. It is best to only use it for CSS then,
  as a page reload due to a change in html or css would not re-include the bookmarklet.
  To monitor CSS and be notified that it has loaded, include it as: live.js#css,notify
*/
(function () {

  var headers = { "Etag": 1, "Last-Modified": 1, "Content-Length": 1, "Content-Type": 1 },
      resources = {},
      pendingRequests = {},
      currentLinkElements = {},
      oldLinkElements = {},
      interval = 1000,
      loaded = false,
      active = { "html": 1, "css": 1, "js": 1 };

  var Live = {

    // performs a cycle per interval
    heartbeat: function () {
      if (document.body) {        
        // make sure all resources are loaded on first activation
        if (!loaded) Live.loadresources();
        Live.checkForChanges();
      }
      setTimeout(Live.heartbeat, interval);
    },

    // loads all local css and js resources upon first activation
    loadresources: function () {

      // helper method to assert if a given url is local
      function isLocal(url) {
        var loc = document.location,
            reg = new RegExp("^\\.|^\/(?!\/)|^[\\w]((?!://).)*$|" + loc.protocol + "//" + loc.host);
        return url.match(reg);
      }

      // gather all resources
      var scripts = document.getElementsByTagName("script"),
          links = document.getElementsByTagName("link"),
          uris = [];

      // track local js urls
      for (var i = 0; i < scripts.length; i++) {
        var script = scripts[i], src = script.getAttribute("src");
        if (src && isLocal(src))
          uris.push(src);
        if (src && src.match(/\blive.js#/)) {
          for (var type in active)
            active[type] = src.match("[#,|]" + type) != null
          if (src.match("notify")) 
            alert("Live.js is loaded.");
        }
      }
      if (!active.js) uris = [];
      if (active.html) uris.push(document.location.href);

      // track local css urls
      for (var i = 0; i < links.length && active.css; i++) {
        var link = links[i], rel = link.getAttribute("rel"), href = link.getAttribute("href", 2);
        if (href && rel && rel.match(new RegExp("stylesheet", "i")) && isLocal(href)) {
          uris.push(href);
          currentLinkElements[href] = link;
        }
      }

      // initialize the resources info
      for (var i = 0; i < uris.length; i++) {
        var url = uris[i];
        Live.getHead(url, function (url, info) {
          resources[url] = info;
        });
      }

      // add rule for morphing between old and new css files
      var head = document.getElementsByTagName("head")[0],
          style = document.createElement("style"),
          rule = "transition: all .3s ease-out;"
      css = [".livejs-loading * { ", rule, " -webkit-", rule, "-moz-", rule, "-o-", rule, "}"].join('');
      style.setAttribute("type", "text/css");
      head.appendChild(style);
      style.styleSheet ? style.styleSheet.cssText = css : style.appendChild(document.createTextNode(css));

      // yep
      loaded = true;
    },

    // check all tracking resources for changes
    checkForChanges: function () {

      for (var url in resources) {
        if (pendingRequests[url])
          continue;

        Live.getHead(url, function (url, newInfo) {
          var oldInfo = resources[url],
          hasChanged = false;
          resources[url] = newInfo;
          for (var header in oldInfo) {
            // do verification based on the header type
            var oldValue = oldInfo[header],
                newValue = newInfo[header],
                contentType = newInfo["Content-Type"];
            switch (header.toLowerCase()) {
              case "etag":
                if (!newValue) break;
                // fall through to default
              default:
                hasChanged = oldValue != newValue;
                break;
            }
            // if changed, act
            if (hasChanged) {
              console.re.log('hasChanged');
              // alert('hasChanged');
              Live.refreshResource(url, contentType);
              break;
            }
          }
        });
      }
    },

    // act upon a changed url of certain content type
    refreshResource: function (url, type) {
      if (type === null) return;
      switch (type.toLowerCase()) {
        // css files can be reloaded dynamically by replacing the link element                               
        case "text/css":
          var link = currentLinkElements[url],
              html = document.body.parentNode,
              head = link.parentNode,
              next = link.nextSibling,
              newLink = document.createElement("link");

          html.className = html.className.replace(/\s*livejs\-loading/gi, '') + ' livejs-loading';
          newLink.setAttribute("type", "text/css");
          newLink.setAttribute("rel", "stylesheet");
          newLink.setAttribute("href", url + "?now=" + new Date() * 1);
          next ? head.insertBefore(newLink, next) : head.appendChild(newLink);
          currentLinkElements[url] = newLink;
          oldLinkElements[url] = link;

          // schedule removal of the old link
          Live.removeoldLinkElements();
          break;

        // check if an html resource is our current url, then reload                               
        case "text/html":
          if (url != document.location.href)
            return;

          // local javascript changes cause a reload as well
        case "text/javascript":
        case "application/javascript":
        case "application/x-javascript":
        document.location.reload();
      }
    },

    // removes the old stylesheet rules only once the new one has finished loading
    removeoldLinkElements: function () {
      var pending = 0;
      for (var url in oldLinkElements) {
      $(currentLinkElements[url]).on('load', function () {
            $(oldLinkElements[url]).remove();
            delete oldLinkElements[url];
            setTimeout(function () {
              $('html').removeClass('livejs-loading');
            }, 100);
      });

      }

    },

    // performs a HEAD request and passes the header info to the given callback
    getHead: function (url, callback) {
    pendingRequests[url] = true;
    $.ajax({
        type: "HEAD",
        cache: false,
        async: true,
        url: url,
        error: function() {
          delete pendingRequests[url];
          // var info = {'Etag': null, 'Last-Modified': null, 'Content-Length': null, 'Content-Type': null};
          // callback(url,info);
        },
        success: function(message,text,xhr){
          delete pendingRequests[url];
          if (xhr.readyState == 4 && xhr.status != 304) {
          xhr.getAllResponseHeaders();
          var info = {};
          for (var h in headers) {
            var value = xhr.getResponseHeader(h);
            // adjust the simple Etag variant to match on its significant part
            if (h.toLowerCase() == "etag" && value) value = value.replace(/^W\//, '');
            if (h.toLowerCase() == "content-type" && value) value = value.replace(/^(.*?);.*?$/i, "$1");
            info[h] = value;
          }
          callback(url, info);
        }
       }
        
    });
    }
  };

  // start listening
  if (document.location.protocol != "file:") {
    if (!window.liveJsLoaded)
      Live.heartbeat();

    window.liveJsLoaded = true;
  }
  else if (window.console)
    console.log("Live Reload doesn't support the file protocol. It needs http.");    
})();