$.browser = {};
$.browser.mozilla = /mozilla/.test(navigator.userAgent.toLowerCase()) && !/webkit/.test(navigator.userAgent.toLowerCase());
$.browser.webkit = /webkit/.test(navigator.userAgent.toLowerCase());
$.browser.opera = /opera/.test(navigator.userAgent.toLowerCase());
$.browser.msie = /msie/.test(navigator.userAgent.toLowerCase());
$.browser.safari = ($.browser.webkit && !(/chrome/.test(navigator.userAgent.toLowerCase())));
if (window.attachEvent && !window.addEventListener) { var isIE = true; } else {  var isIE = false; }

var isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);

var iOS = /(iPad|iPhone|iPod)/g.test(navigator.userAgent);

$.fn.selectText = function(){
   var doc = document;
   var element = this[0];
   if (doc.body.createTextRange) {
       var range = document.body.createTextRange();
       range.moveToElementText(element);
       range.select();
   } else if (window.getSelection) {
       var selection = window.getSelection();        
       var range = document.createRange();
       range.selectNodeContents(element);
       selection.removeAllRanges();
       selection.addRange(range);
   }
};

(function($) {
    // read message from a domain
    $.fn.onMessage = function(triggeredFunction) {
        if (window.postMessage) {
            // standard HTML5 support
            if (typeof window.addEventListener != 'undefined') {
                window.addEventListener('message', triggeredFunction, false);
            } else if (typeof window.attachEvent != 'undefined') {
                window.attachEvent('onmessage', triggeredFunction);
            }
        } 
    };
})(jQuery);



(function(e,t){if(typeof define==="function"&&define.amd){define("tappable",[],function(){t(e,window.document);return e.tappable})}else{t(e,window.document)}})(this,function(e,t){var n=Math.abs,r=function(){},i={noScroll:false,activeClass:"tappable-active",onTap:r,onStart:r,onMove:r,onMoveOut:r,onMoveIn:r,onEnd:r,onCancel:r,allowClick:false,boundMargin:50,noScrollDelay:0,activeClassDelay:0,inactiveClassDelay:0},s="ontouchend"in document,o={start:s?"touchstart":"mousedown",move:s?"touchmove":"mousemove",end:s?"touchend":"mouseup"},u=function(e,n){var r=t.elementFromPoint(e,n);if(r.nodeType==3)r=r.parentNode;return r},a=function(e){var t=e.target;if(t){if(t.nodeType==3)t=t.parentNode;return t}var n=e.targetTouches[0];return u(n.clientX,n.clientY)},f=function(e){return e.replace(/\s+/g," ").replace(/^\s+|\s+$/g,"")},l=function(e,t){if(!t)return;if(e.classList){e.classList.add(t);return}if(f(e.className).indexOf(t)>-1)return;e.className=f(e.className+" "+t)},c=function(e,t){if(!t)return;if(e.classList){e.classList.remove(t);return}e.className=e.className.replace(new RegExp("(^|\\s)"+t+"(?:\\s|$)"),"$1")},h=function(e,n){var r=t.documentElement,i=r.matchesSelector||r.mozMatchesSelector||r.webkitMatchesSelector||r.oMatchesSelector||r.msMatchesSelector;return i.call(e,n)},p=function(e,t){var n=false;do{n=h(e,t)}while(!n&&(e=e.parentNode)&&e.ownerDocument);return n?e:false};e.tappable=function(e,r){if(typeof r=="function")r={onTap:r};var s={};for(var f in i)s[f]=r[f]||i[f];var h=s.containerElement||t.body,v,m,g,y,b,w=false,E=false,S=s.activeClass,x=s.activeClassDelay,T,N=s.inactiveClassDelay,C,k=s.noScroll,L=s.noScrollDelay,A,O=s.boundMargin;var M=function(t){var n=p(a(t),e);if(!n)return;if(x){clearTimeout(T);T=setTimeout(function(){l(n,S)},x)}else{l(n,S)}if(N&&n==m)clearTimeout(C);g=t.clientX;y=t.clientY;if(!g||!y){var r=t.targetTouches[0];g=r.clientX;y=r.clientY}v=n;w=false;E=false;b=k?n.getBoundingClientRect():null;if(L){clearTimeout(A);k=false;A=setTimeout(function(){k=true},L)}s.onStart.call(h,t,n)};var _=function(e){if(!v)return;if(k){e.preventDefault()}else{clearTimeout(T)}var t=e.target,r=e.clientX,i=e.clientY;if(!t||!r||!i){var o=e.changedTouches[0];if(!r)r=o.clientX;if(!i)i=o.clientY;if(!t)t=u(r,i)}if(k){if(r>b.left-O&&r<b.right+O&&i>b.top-O&&i<b.bottom+O){E=false;l(v,S);s.onMoveIn.call(h,e,t)}else{E=true;c(v,S);s.onMoveOut.call(h,e,t)}}else if(!w&&n(i-y)>10){w=true;c(v,S);s.onCancel.call(t,e)}s.onMove.call(h,e,t)};var D=function(e){if(!v)return;clearTimeout(T);if(N){if(x&&!w)l(v,S);var t=v;C=setTimeout(function(){c(t,S)},N)}else{c(v,S)}s.onEnd.call(h,e,v);var n=e.which==3||e.button==2;if(!w&&!E&&!n){s.onTap.call(h,e,v)}m=v;v=null;setTimeout(function(){g=y=null},400)};var P=function(e){if(!v)return;c(v,S);v=g=y=null;s.onCancel.call(h,e)};var H=function(t){var r=p(t.target,e);if(r){t.preventDefault()}else if(g&&y&&n(t.clientX-g)<25&&n(t.clientY-y)<25){t.stopPropagation();t.preventDefault()}};h.addEventListener(o.start,M,false);h.addEventListener(o.move,_,false);h.addEventListener(o.end,D,false);h.addEventListener("touchcancel",P,false);if(!s.allowClick)h.addEventListener("click",H,false);return{el:h,destroy:function(){h.removeEventListener(o.start,M,false);h.removeEventListener(o.move,_,false);h.removeEventListener(o.end,D,false);h.removeEventListener("touchcancel",P,false);if(!s.allowClick)h.removeEventListener("click",H,false);return this}}}})

var webC = {};
    
    webC.cookies = {

    create: function(name,value,days) {
        if (days) { var date = new Date(); date.setTime(date.getTime()+(days*24*60*60*1000)); var expires = "; expires="+date.toGMTString();} else var expires = ""; document.cookie = name+"="+value+expires+"; path=/";
    },
    read: function(name) {
        var nameEQ = name + "="; var ca = document.cookie.split(';'); for(var i=0;i < ca.length;i++) { var c = ca[i]; while (c.charAt(0)==' ') c = c.substring(1,c.length); if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length); } return null;

    },
    erase: function(name) {
        this.create(name,"",-1);   
    }

};

if (webC.cookies.read('wcfdown') == 1) {
    document.body.className += 'wcfdown';
} else {
    document.body.className += 'wcfup';
}

var editmessage = 'click to change';
var wcserver = 'demo.webcorrector.pro';
var wcserveraction = 'http://demo.webcorrector.pro/go/';
var uname, uid, followcode = '';

var counter = 1;

window.onbeforeunload = function(){ 
    // alert(counter);
    //return "Hey, looks like you are going away from this page. Are you sure you want to leave?"; 
    // counter++;
};

$(document).onMessage(function (e) {
   if (e.origin !== 'http://' + wcserver) return;
   // cnn.com overrides native JSON.stringfy function with it's own implementation and it sends incorrect string, it failed here! // todo: fix this in future
   // alert(e.data);
   if( typeof e.data === 'string' ) {
    var obj = JSON.parse(e.data);
   } else {
    var obj = e.data;
   }
   if (obj.name) {
      $('#wcuser').text(obj.name);
   } else if (obj.followcode) {
      followcode = obj.followcode;
   } else if (obj.connection) {
      if (obj.connection == 'ok') {
       // code for connected
       if (uname != 'You') { 
        //if (parseInt(obj.totalusers,10) > 1) $('.ctotal').text("+"+obj.totalusers).fadeIn();        
        $('.noti_bubble').data('title','You are connected').removeClass('error').addClass('connected');
        $('.noti_bubble').poshytip('showhide');
       }
      } else if (obj.connection == 'disconnected') {
        $('.noti_bubble').data('title','Connection Error').removeClass('connected').addClass('error');
        $('.noti_bubble').poshytip('show');
      } else if (obj.connection == 'offline') {
        $('.noti_bubble').data('title','Disconnecting').removeClass('connected error');
        $('.noti_bubble').poshytip('show');
      }

   }

});

$(document).ready(function(){

$('.noti_bubble').poshytip({
    className: 'tip-twitter-new',
    content: function(){return $(this).data('title')},
    showTimeout: 10,
    showOn: 'hover',
    keepInViewport: true,
    alignTo: 'target',
    alignX: 'top',
    alignY: 'center',
    offsetX: 10, 
    allowTipHover: false,
    fade: true,
    slide: true
 });


$('#wcuser').poshytip({
    className: 'tip-twitter-new',
    content: 'Enter your name',
    showTimeout: 10,
    showOn: 'none',
    keepInViewport: true,
    alignTo: 'target',
    alignX: 'top',
    alignY: 'center',
    offsetX: 10, 
    allowTipHover: false,
    fade: true,
    slide: true
 });

$postMessage = function(m) {
   if (window.postMessage) {
       // standard HTML5 support
        parent.postMessage(JSON.stringify(m), window.top.location.href);
   }
};

id = webC.cookies.read('wcuid');
uname = webC.cookies.read('wcuname');

if (!uname) uname = window.parent.globalUserName || 'You';

$('#wcuser').text(uname).fadeIn();

if (uname == 'You') { 
  $('#wcuser').poshytip('show');
} else {
  $('.noti_bubble').data('title','You are NOT connected').fadeIn();
}

$('#wcoverlay').on('mouseover mouseout', function(e) {
    if (e.type == 'mouseover') {
    //window.parent.$('#wcfControl').height('120px'); 
    window.top.document.getElementById("wcfControl").style.height = '120px';
    } else {
    window.top.document.getElementById("wcfControl").style.height = '60px';
    //window.parent.$('#wcfControl').height('65px');        
    }
});

var cloc = window.top.document.location + '';

var cururl = cloc.split("/go\/http://",2);
if(typeof cururl[1] == 'undefined') {
    cururl = cloc.split("/go\/https://",2);    
}

if(typeof cururl[1] != 'undefined') {
  if(window.top.document.location.hash) {
    var urlnohash = cururl[1].split('#',2);
    var urlval = urlnohash[0].replace(/\/+$/, "");
  } else {
    var urlval = cururl[1].replace(/\/+$/, "");
  }
}

if(typeof urlval == 'undefined') {
  var urlval = cloc;
}

$('#wcurlinput').val(urlval);
$('#wcurltext').text(urlval).attr('title',urlval +' - '+ editmessage);

$('#wcurlinput').on('keydown', function(e){
if(e.keyCode == 13) {
  var r=confirm("Hey, looks like you going away from this page. Are you sure?");
  if (r==true) {
  var v = $.trim($(this).val().replace(/\/+$/, ""));
  var hash, url, hashm = '';
  var hashash = v.split('#',2);
  if (hashash[1]===undefined) {
    hash = "#public";
    url = v;
  } else {
    hash = '#'+hashash[1];
    url = hashash[0];
    hashm = 'hash code:'+hash;
  }
  webC.cookies.create('wclasthash', hash);
  $postMessage({followcode: 'ask'});
  $.ajax({
        url: 'http://' + wcserver + '/checkurl/' + url,
        success: function(data){
            if (data.code > 403 || /website-unavailable/.test(data.url) || data.code === null) {
              url = prompt("URL: "+data.url +" is not loading. Please enter valid url:",data.url);
              if (url === null) return; 
              data.url = url;
            } 
              $('#wcaction').show();
              $('#wcurlinput').hide();
              $('#wcurltext').text('going to: '+url+' '+hashm).show();
              $('#wcgobutton').text('').append('<img src="/static/img/329.gif" style="position:absolute;top:6px;left:13px"/>');   
              $('.noti_bubble').data('title','Disconnecting').removeClass('connected error');
              var d  = window.top.globalState;
              var n = window.top.globalUserName;
              d.submitOp({"p":["wcdata","actions"], od:{ from:n,element:data.url,code:followcode,hash:hash,action:"goingto"}, oi:{ from:n,element:data.url,code:followcode,hash:hash,action:"goingto"}});              
              setTimeout(function() { window.top.location.href = wcserveraction + data.url + hash; }, 1000);     
        }
  });
  } else {
  $(this).blur();      
  } 
 } else if(e.keyCode == 27) {
  $(this).hide();
  $('#wcurltext').removeClass('mhover').show();
  $('#wcaction').hide();
  $('#wcinfo').show();
 }
}).focus(function(e) {
    $(this)[0].setSelectionRange(0,9999);
}).blur(function(event) {
  $(this).hide();
  $('#wcurltext').removeClass('mhover').show();
  $('#wcaction').hide();
  $('#wcinfo').show();   
});
//wcgobutton

$('#wcurltext').on('click', function(e){
    $('#wcinfo').hide();
    $(this).removeClass('mhover').hide();
    $('#wcaction').show();
    $('#wcurlinput').val($(this).text()).show().focus();
}).hover(function() {
    $(this).addClass('mhover');
  }, function() {
    $(this).removeClass('mhover');
  }
);

$('#wccancel').on('click', function(e){
    e.stopPropagation();e.preventDefault();
    $('#wcurlinput').hide();
    $('#wcurltext').removeClass('mhover').fadeIn();
    $('#wcaction').hide();
    $('#wcinfo').show();
});

$('#wcuser').on('click mouseenter', function(e){
    e.preventDefault();
    e.stopPropagation();
    if (e.type == 'click') {
     $('#wcuser').poshytip('hide');
     $(this).addClass('edit').data('prev', $(this).text()).selectText();
    }
}).on('keydown', function(e){
  if(e.keyCode == 13) {
    e.preventDefault();
    if ($(this).text().trim() == '') return false;
    if ($(this).text() != $(this).data('prev')) {
        uname = $(this).text();
        $postMessage({name:uname});
    }
    if ($(this).data('prev') == 'You') {
        $postMessage({isconnected: 'ask'});
        $('.noti_bubble').data('title','You are NOT connected').fadeIn();
    }
  $(this).blur();
  } else if(e.keyCode == 27) {
    $(this).text($(this).data('prev')).blur();
  }   
}).blur(function(event) {
  if (iOS) {
    if ($(this).text() != $(this).data('prev')) {
        uname = $(this).text();
        $postMessage({name:uname});
    }
    if ($(this).data('prev') == 'You') {
        $postMessage({isconnected: 'ask'});
        $('.noti_bubble').data('title','You are NOT connected').fadeIn();
    }
  } 
  $(this).removeClass('edit').next().focus();
  });  

if (!isIE) {
tappable('#wcgobutton', {
  onTap: function(e, target){
  var r=confirm("Hey, looks like you going away from this page. Are you sure?");
  if (r==true) {
  var v = $.trim($('#wcurlinput').val().replace(/\/+$/, ""));
  var hash, url, hashm = '';
  var hashash = v.split('#',2);
  if (hashash[1]===undefined) {
    hash = window.top.document.location.hash;
    url = v;
  } else {
    hash = '#'+hashash[1];
    url = hashash[0];
    hashm = 'hash code:'+hash;
  }
  webC.cookies.create('wclasthash', hash);  
  $.ajax({
        url: 'http://' + wcserver + '/checkurl/' + url,
        success: function(data){
            //response.getResponseHeader('Content-Length');
            if (data.code > 403 || /website-unavailable/.test(data.url) || data.code === null) {
              url = prompt("URL: "+data.url +" is not loading. Please enter valid url:",data.url);
              if (url === null) return; 
              data.url = url;
              } 
              $('#wcaction').show();
              $('#wcurlinput').hide();
              $('#wcurltext').text('going to: '+url+' '+hashm).show();
              $('#wcgobutton').text('').append('<img src="/static/img/329.gif" style="position:absolute;top:6px;left:13px"/>');   
              var d  = window.top.globalState;
              var n = window.top.globalUserName;
              d.submitOp({"p":["wcdata","actions"], od:{ from:n,element:data.url,hash:hash,action:"goingto"}, oi:{ from:n,element:data.url,hash:hash,action:"goingto"}});              
              setTimeout(function() { window.top.location.href = wcserveraction + data.url + hash; }, 1000);     
        }
  });
  }else{
  $('#wcurlinput').blur();
  }
 }
});

// tappable('.noti_bubble', { 
//     onTap: function(e, target){
//       e.preventDefault();      
//       $('.noti_bubble').poshytip('show');
//       setTimeout(function() { $('.noti_bubble').poshytip('hide'); }, 1500);     
//     }
//  });    

tappable('.iframemove-wrap', {
      onTap: function(e, target){
      var e = window.top.document.getElementById("wcfControl");
      var c = e.className;
      if (c != 'wcfdown') {
        $('body').removeClass('wcfup').addClass("wcfdown");
        e.className = "wcfdown";
        e.style.top = null; 
        e.style.bottom = 0; 
        webC.cookies.create('wcfdown', 1);
      } else {
        webC.cookies.erase('wcfdown');
        $('body').removeClass('wcfdown').addClass("wcfup");
        e.className = "wcfup";
        e.style.bottom = null;
        e.style.top = 0; 
      }
     }
  });     
}

function askOnLoad() {
  if (!$('.noti_bubble').is('.connected')) { 
  $postMessage({isconnected: 'ask'});
 }
}
// lets ask for connection status after we loaded
setTimeout(function() {askOnLoad()}, 2000);

});

if(typeof JSON!=="object"){JSON={}}(function(){function f(n){return n<10?"0"+n:n}if(typeof Date.prototype.toJSON!=="function"){Date.prototype.toJSON=function(key){return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+f(this.getUTCMonth()+1)+"-"+f(this.getUTCDate())+"T"+f(this.getUTCHours())+":"+f(this.getUTCMinutes())+":"+f(this.getUTCSeconds())+"Z":null};String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(key){return this.valueOf()}}var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},rep;function quote(string){escapable.lastIndex=0;return escapable.test(string)?'"'+string.replace(escapable,function(a){var c=meta[a];return typeof c==="string"?c:"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+string+'"'}function str(key,holder){var i,k,v,length,mind=gap,partial,value=holder[key];if(value&&typeof value==="object"&&typeof value.toJSON==="function"){value=value.toJSON(key)}if(typeof rep==="function"){value=rep.call(holder,key,value)}switch(typeof value){case"string":return quote(value);case"number":return isFinite(value)?String(value):"null";case"boolean":case"null":return String(value);case"object":if(!value){return"null"}gap+=indent;partial=[];if(Object.prototype.toString.apply(value)==="[object Array]"){length=value.length;for(i=0;i<length;i+=1){partial[i]=str(i,value)||"null"}v=partial.length===0?"[]":gap?"[\n"+gap+partial.join(",\n"+gap)+"\n"+mind+"]":"["+partial.join(",")+"]";gap=mind;return v}if(rep&&typeof rep==="object"){length=rep.length;for(i=0;i<length;i+=1){if(typeof rep[i]==="string"){k=rep[i];v=str(k,value);if(v){partial.push(quote(k)+(gap?": ":":")+v)}}}}else{for(k in value){if(Object.prototype.hasOwnProperty.call(value,k)){v=str(k,value);if(v){partial.push(quote(k)+(gap?": ":":")+v)}}}}v=partial.length===0?"{}":gap?"{\n"+gap+partial.join(",\n"+gap)+"\n"+mind+"}":"{"+partial.join(",")+"}";gap=mind;return v}}if(typeof JSON.stringify!=="function"){JSON.stringify=function(value,replacer,space){var i;gap="";indent="";if(typeof space==="number"){for(i=0;i<space;i+=1){indent+=" "}}else{if(typeof space==="string"){indent=space}}rep=replacer;if(replacer&&typeof replacer!=="function"&&(typeof replacer!=="object"||typeof replacer.length!=="number")){throw new Error("JSON.stringify")}return str("",{"":value})}}if(typeof JSON.parse!=="function"){JSON.parse=function(text,reviver){var j;function walk(holder,key){var k,v,value=holder[key];if(value&&typeof value==="object"){for(k in value){if(Object.prototype.hasOwnProperty.call(value,k)){v=walk(value,k);if(v!==undefined){value[k]=v}else{delete value[k]}}}}return reviver.call(holder,key,value)}text=String(text);cx.lastIndex=0;if(cx.test(text)){text=text.replace(cx,function(a){return"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)})}if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,""))){j=eval("("+text+")");return typeof reviver==="function"?walk({"":j},""):j}throw new SyntaxError("JSON.parse")}}}());

/*
 * Poshy Tip jQuery plugin v1.1
 * http://vadikom.com/tools/poshy-tip-jquery-plugin-for-stylish-tooltips/
 * Copyright 2010-2011, Vasil Dinkov, http://vadikom.com/
 */

(function($) {

  var tips = [],
    reBgImage = /^url\(["']?([^"'\)]*)["']?\);?$/i,
    rePNG = /\.png$/i;

  // make sure the tips' position is updated on resize
  function handleWindowResize() {
    $.each(tips, function() {
      this.refresh(true);
    });
  }
  $(window).resize(handleWindowResize);

  $.Poshytip = function(elm, options) {
    this.$elm = $(elm);
    if (this.$elm.attr('data-tip') !== undefined) {
      options = $.extend({}, options, eval('(' + this.$elm.attr('data-tip') + ')'));  
    }
    this.opts = $.extend({}, $.fn.poshytip.defaults, options);

    if (this.opts.content === null) return;
    this.$tip = $(['<div class="',this.opts.className,'">',
        '<div class="tip-inner"></div>',
        '<div class="tip-arrow"></div><div class="tip-arrow"></div>',
      '</div>'].join('')).appendTo(document.body);
    this.$arrow = this.$tip.find('div.tip-arrow');
    this.$inner = this.$tip.find('div.tip-inner');
    this.disabled = false;
    this.content = null;
    this.init();
  };

  $.Poshytip.prototype = {
    init: function() {
      tips.push(this);

      // save the original title and a reference to the Poshytip object
      var title = this.$elm.attr('title');
      this.$elm.data('title.poshytip', title !== undefined ? title : null)
        .data('poshytip', this);

      // hook element events
      if (this.opts.showOn != 'none') {
        this.$elm.bind({
          'mouseenter.poshytip': $.proxy(this.mouseenter, this),
          'mouseleave.poshytip': $.proxy(this.mouseleave, this)
        });
        switch (this.opts.showOn) {
          case 'hover':
            if (this.opts.alignTo == 'cursor')
              this.$elm.bind('mousemove.poshytip', $.proxy(this.mousemove, this));
            if (this.opts.allowTipHover)
              this.$tip.hover($.proxy(this.clearTimeouts, this), $.proxy(this.mouseleave, this));
            break;
          case 'focus':
            this.$elm.bind({
              'focus.poshytip': $.proxy(this.show, this),
              'blur.poshytip': $.proxy(this.hide, this)
            });
            break;
        }
      }
    },
    mouseenter: function(e) {
      if (this.disabled)
        return true;

      this.$elm.attr('title', '');
      if (this.opts.showOn == 'focus')
        return true;

      this.clearTimeouts();
      this.showTimeout = setTimeout($.proxy(this.show, this), this.opts.showTimeout);
    },
    mouseleave: function(e) {
      if (this.disabled || this.asyncAnimating && (this.$tip[0] === e.relatedTarget || jQuery.contains(this.$tip[0], e.relatedTarget)))
        return true;

      var title = this.$elm.data('title.poshytip');
      if (title !== null)
        this.$elm.attr('title', title);
      if (this.opts.showOn == 'focus')
        return true;

      this.clearTimeouts();
      this.hideTimeout = setTimeout($.proxy(this.hide, this), this.opts.hideTimeout);
    },
    mousemove: function(e) {
      if (this.disabled)
        return true;

      this.eventX = e.pageX;
      this.eventY = e.pageY;
      if (this.opts.followCursor && this.$tip.data('active')) {
        this.calcPos();
        this.$tip.css({left: this.pos.l, top: this.pos.t});
        if (this.pos.arrow)
          this.$arrow[0].className = 'tip-arrow tip-arrow-' + this.pos.arrow;
          this.$arrow[1].className = 'tip-arrow tip-arrow-' + this.pos.arrow + '2';
      }
    },
    showhide: function() {
      this.reset();
      this.update();
      if (this.content == '' || this.content === null) return;
      this.display();
      if (this.opts.timeOnScreen) setTimeout($.proxy(this.hide, this), this.opts.timeOnScreen);
      setTimeout($.proxy(this.hide, this), 3000);
    },
    show: function() {
      if (this.disabled || this.$tip.data('active'))
        return;
      this.reset();
      this.update();
      if (this.content == '' || this.content === null) return;
      this.display();
      if (this.opts.timeOnScreen)
        setTimeout($.proxy(this.hide, this), this.opts.timeOnScreen);
    },
    hide: function() {
      if (this.disabled || !this.$tip.data('active'))
        return;

      this.display(true);
    },
    reset: function() {
      this.$tip.queue([]).detach().css('visibility', 'hidden').data('active', false);
      this.$inner.find('*').poshytip('hide');
      if (this.opts.fade)
        this.$tip.css('opacity', this.opacity);
      this.$arrow[0].className = this.$arrow[1].className = 'tip-arrow';
      this.asyncAnimating = false;
    },
    updatePosition: function(posX) {
      this.opts.alignX = posX;
    },
    updateTip: function(posX) {
      this.refresh(true);
    },
    update: function(content, dontOverwriteOption) {
      if (this.disabled)
        return;

      var async = content !== undefined;
      if (async) {
        if (!dontOverwriteOption)
          this.opts.content = content;
        if (!this.$tip.data('active'))
          return;
      } else {
        content = this.opts.content;
      }

      // update content only if it has been changed since last time
      var self = this,
        newContent = typeof content == 'function' ?
          content.call(this.$elm[0], function(newContent) {
            self.update(newContent);
          }) :
          content == '[title]' ? this.$elm.data('title.poshytip') : content;
      if (this.content !== newContent) {
        this.$inner.empty().append(newContent);
        this.content = newContent;
      }
      this.refresh(async);
    },
    refresh: function(async) {
      if (this.disabled)
        return;

      if (async) {
        if (!this.$tip.data('active'))
          return;
        // save current position as we will need to animate
        var currPos = {left: this.$tip.css('left'), top: this.$tip.css('top')};
      }

      // reset position to avoid text wrapping, etc.
      this.$tip.css({left: 0, top: 0}).appendTo(document.body);

      // save default opacity
      if (this.opacity === undefined)
        this.opacity = this.$tip.css('opacity');

      this.tipOuterW = this.$tip.outerWidth();
      this.tipOuterH = this.$tip.outerHeight();

      this.calcPos();

      // position and show the arrow image
      if (this.pos.arrow) {
        // this.$tip[0].className = this.opts.className + '-' + this.pos.arrow;
        // console.info(this.$tip[0].className);
        this.$arrow[0].className = 'tip-arrow tip-arrow-' + this.pos.arrow;
        this.$arrow[1].className = 'tip-arrow tip-arrow-' + this.pos.arrow + '2';
        this.$arrow.css('visibility', 'inherit');
      }

      if (async) {
        this.asyncAnimating = true;
        var self = this;
        this.$tip.css(currPos).animate({left: this.pos.l, top: this.pos.t},10, function() { self.asyncAnimating = false; });
      } else {
        this.$tip.css({left: this.pos.l, top: this.pos.t});
      }
    },
    display: function(hide) {
      var active = this.$tip.data('active');
      if (active && !hide || !active && hide)
        return;

      this.$tip.stop();
      if ((this.opts.slide && this.pos.arrow || this.opts.fade) && (hide && this.opts.hideAniDuration || !hide && this.opts.showAniDuration)) {
        var from = {}, to = {};
        // this.pos.arrow is only undefined when alignX == alignY == 'center' and we don't need to slide in that rare case
        if (this.opts.slide && this.pos.arrow) {
          var prop, arr;
          if (this.pos.arrow == 'bottom' || this.pos.arrow == 'top') {
            prop = 'top';
            arr = 'bottom';
          } else {
            prop = 'left';
            arr = 'right';
          }
          var val = parseInt(this.$tip.css(prop));
          from[prop] = val + (hide ? 0 : (this.pos.arrow == arr ? +this.opts.slideOffset : this.opts.slideOffset));
          to[prop] = val + (hide ? (this.pos.arrow == arr ? this.opts.slideOffset : +this.opts.slideOffset) : 0) + 'px';
        }
        if (this.opts.fade) {
          from.opacity = hide ? this.$tip.css('opacity') : 0;
          to.opacity = hide ? 0 : this.opacity;
        }
        this.$tip.css(from).animate(to, this.opts[hide ? 'hideAniDuration' : 'showAniDuration']);
      }
      hide ? this.$tip.queue($.proxy(this.reset, this)) : this.$tip.css('visibility', 'inherit');
      this.$tip.data('active', !active);
    },
    disable: function() {
      this.reset();
      this.disabled = true;
    },
    enable: function() {
      this.disabled = false;
    },
    destroy: function() {
      this.reset();
      this.$tip.remove();
      delete this.$tip;
      this.content = null;
      this.$elm.unbind('.poshytip').removeData('title.poshytip').removeData('poshytip');
      tips.splice($.inArray(this, tips), 1);
    },
    clearTimeouts: function() {
      if (this.showTimeout) {
        clearTimeout(this.showTimeout);
        this.showTimeout = 0;
      }
      if (this.hideTimeout) {
        clearTimeout(this.hideTimeout);
        this.hideTimeout = 0;
      }
    },
    calcPos: function() {
      var pos = {l: 0, t: 0, arrow: ''},
        $win = $(window),
        win = {
          l: $win.scrollLeft(),
          t: $win.scrollTop(),
          w: $win.width(),
          h: $win.height()
        }, xL, xC, xR, yT, yC, yB;
      if (this.opts.alignTo == 'cursor') {
        xL = xC = xR = this.eventX;
        yT = yC = yB = this.eventY;
      } else { // this.opts.alignTo == 'target'
        var elmOffset = this.$elm.offset(),
          elm = {
            l: elmOffset.left,
            t: elmOffset.top,
            w: this.$elm.outerWidth(),
            h: this.$elm.outerHeight()
          };
        xL = elm.l + (this.opts.alignX != 'inner-right' ? 0 : elm.w); // left edge
        xC = xL + Math.floor(elm.w / 2);        // h center
        xR = xL + (this.opts.alignX != 'inner-left' ? elm.w : 0); // right edge
        yT = elm.t + (this.opts.alignY != 'inner-bottom' ? 0 : elm.h);  // top edge
        yC = yT + Math.floor(elm.h / 2);        // v center
        yB = yT + (this.opts.alignY != 'inner-top' ? elm.h : 0);  // bottom edge
      }

      // keep in viewport and calc arrow position
      switch (this.opts.alignX) {
        case 'right':
        case 'inner-left':
          pos.l = xR + this.opts.offsetX;
          if (pos.l + this.tipOuterW > win.l + win.w)
            pos.l = win.l + win.w - this.tipOuterW;
          if (this.opts.alignX == 'right' || this.opts.alignY == 'center')
            pos.arrow = 'left';
          break;
        case 'center':
          pos.l = xC - Math.floor(this.tipOuterW / 2);
          if (pos.l + this.tipOuterW > win.l + win.w)
            pos.l = win.l + win.w - this.tipOuterW;
          else if (pos.l < win.l)
            pos.l = win.l;
          break;
        default: // 'left' || 'inner-right'
          pos.l = xL - this.tipOuterW - this.opts.offsetX;
          if (pos.l < win.l)
            pos.l = win.l;
          if (this.opts.alignX == 'left' || this.opts.alignY == 'center')
            pos.arrow = 'right';
      }
      switch (this.opts.alignY) {
        case 'bottom':
        case 'inner-top':
          pos.t = yB + this.opts.offsetY;
          // 'left' and 'right' need priority for 'target'
          if (!pos.arrow || this.opts.alignTo == 'cursor')
            pos.arrow = 'top';
          if (pos.t + this.tipOuterH > win.t + win.h) {
            pos.t = yT - this.tipOuterH - this.opts.offsetY;
            if (pos.arrow == 'top')
              pos.arrow = 'bottom';
          }
          break;
        case 'center':
          pos.t = yC - Math.floor(this.tipOuterH / 2);
          if (pos.t + this.tipOuterH > win.t + win.h)
            pos.t = win.t + win.h - this.tipOuterH;
          else if (pos.t < win.t)
            pos.t = win.t;
          break;
        default: // 'top' || 'inner-bottom'
          pos.t = yT - this.tipOuterH - this.opts.offsetY;
          // 'left' and 'right' need priority for 'target'
          if (!pos.arrow || this.opts.alignTo == 'cursor')
            pos.arrow = 'bottom';
          if (pos.t < win.t) {
            pos.t = yB + this.opts.offsetY;
            if (pos.arrow == 'bottom')
              pos.arrow = 'top';
          }
      }
      this.pos = pos;
    }
  };

  $.fn.poshytip = function(options) {
    if (typeof options == 'string') {
      var args = arguments,
        method = options;
      Array.prototype.shift.call(args);
      // unhook live events if 'destroy' is called
      if (method == 'destroy')
        this.die('mouseenter.poshytip').die('focus.poshytip');
      return this.each(function() {
        var poshytip = $(this).data('poshytip');
        if (poshytip && poshytip[method])
          poshytip[method].apply(poshytip, args);
      });
    }

    var opts = $.extend({}, $.fn.poshytip.defaults, options);

    // generate CSS for this tip class if not already generated
    if (!$('#poshytip-css-' + opts.className)[0])
      $(['<style id="poshytip-css-',opts.className,'" type="text/css">',
        'div.',opts.className,'{visibility:hidden;position:absolute;top:0;left:0;}',
        'div.',opts.className,' table, div.',opts.className,' td{margin:0;font-family:inherit;font-size:inherit;font-weight:inherit;font-style:inherit;font-variant:inherit;}',
        'div.',opts.className,' td.tip-bg-image span{display:block;font:1px/1px sans-serif;height:',opts.bgImageFrameSize,'px;width:',opts.bgImageFrameSize,'px;overflow:hidden;}',
        'div.',opts.className,' td.tip-right{background-position:100% 0;}',
        'div.',opts.className,' td.tip-bottom{background-position:100% 100%;}',
        'div.',opts.className,' td.tip-left{background-position:0 100%;}',
        'div.',opts.className,' div.tip-inner{background-position:-',opts.bgImageFrameSize,'px -',opts.bgImageFrameSize,'px;}',
        'div.',opts.className,' div.tip-arrow{visibility:hidden;position:absolute;overflow:hidden;font:1px/1px sans-serif;}',
      '</style>'].join('')).appendTo('head');

    // check if we need to hook live events
    if (opts.liveEvents && opts.showOn != 'none') {
      var deadOpts = $.extend({}, opts, { liveEvents: false });
      switch (opts.showOn) {
        case 'hover':
          this.live('mouseenter.poshytip', function() {
            var $this = $(this);
            if (!$this.data('poshytip'))
              $this.poshytip(deadOpts).poshytip('mouseenter');
          });
          break;
        case 'focus':
          this.live('focus.poshytip', function() {
            var $this = $(this);
            if (!$this.data('poshytip'))
              $this.poshytip(deadOpts).poshytip('show');
          });
          break;
      }
      return this;
    }

    return this.each(function() {
      new $.Poshytip(this, opts);
    });
  }

  // default settings
  $.fn.poshytip.defaults = {
    content:    '[title]',  // content to display ('[title]', 'string', element, function(updateCallback){...}, jQuery)
    className:    'tip-yellow', // class for the tips
    bgImageFrameSize: 10,   // size in pixels for the background-image (if set in CSS) frame around the inner content of the tip
    showTimeout:    500,    // timeout before showing the tip (in milliseconds 1000 == 1 second)
    hideTimeout:    100,    // timeout before hiding the tip
    timeOnScreen:   0,    // timeout before automatically hiding the tip after showing it (set to > 0 in order to activate)
    showOn:     'hover',  // handler for showing the tip ('hover', 'focus', 'none') - use 'none' to trigger it manually
    liveEvents:   false,    // use live events
    alignTo:    'cursor', // align/position the tip relative to ('cursor', 'target')
    alignX:     'right',  // horizontal alignment for the tip relative to the mouse cursor or the target element
              // ('right', 'center', 'left', 'inner-left', 'inner-right') - 'inner-*' matter if alignTo:'target'
    alignY:     'top',    // vertical alignment for the tip relative to the mouse cursor or the target element
              // ('bottom', 'center', 'top', 'inner-bottom', 'inner-top') - 'inner-*' matter if alignTo:'target'
    offsetX:    -22,    // offset X pixels from the default position - doesn't matter if alignX:'center'
    offsetY:    18,   // offset Y pixels from the default position - doesn't matter if alignY:'center'
    allowTipHover:    true,   // allow hovering the tip without hiding it onmouseout of the target - matters only if showOn:'hover'
    followCursor:   false,    // if the tip should follow the cursor - matters only if showOn:'hover' and alignTo:'cursor'
    fade:       true,   // use fade animation
    slide:      true,   // use slide animation
    slideOffset:    8,    // slide animation offset
    showAniDuration:  300,    // show animation duration - set to 0 if you don't want show animation
    hideAniDuration:  300   // hide animation duration - set to 0 if you don't want hide animation
  };

})(jQuery);
