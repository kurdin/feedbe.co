$.fn.getParentBg = function() {
    // Is current element's background color set?
    var color = $(this).css("background-color");
    if (color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent' ) {
        // if so then return that color
         // console.info(color);
        return color;
    }

    // if not: are you at the body element?
    if ($(this).is("body")) {
        // return known 'false' value
        return false;
    } else {
        // call getBackground with parent item
        return $(this).parent().getParentBg();
    }
}

$.fn.center = function () {
//    this.css("position","absolute");
//    this.css("top", Math.max(0, (($(window).height() - $(this).outerHeight()) / 2) + $(window).scrollTop()) + "px");
//    this.css("left", Math.max(0, (($(window).width() - $(this).outerWidth()) / 2) + $(window).scrollLeft()) + "px");

  var params = {
    top : Math.max(0, (($(window).height() - $(this).outerHeight()) / 2) + $(window).scrollTop()) + "px",
    left : Math.max(0, (($(window).width() - $(this).outerWidth()) / 2) + $(window).scrollLeft()) + "px",
    opacity : 1,
    padding:'10px'
  };
  
  
  $(this).animate(params, 800, false, function () {});
                                                  
    return this;
};

/*
  jQuery-GetPath v0.2, by Francois-Guillaume Ribreau.

  http://blog.geekfg.net/2010/06/trouver-le-selecteur-jquery-dun-element.html

  Copyright (c)2010 Francois-Guillaume Ribreau. All rights reserved.
  Released under the Creative Commons BY-SA Conditions.
    http://creativecommons.org/licenses/by-sa/3.0/

  Usage:
  var path = $('#foo').getPath();
*/
(function(a) {
a.fn.getPath2 = function() {
  var el = this;
  if (!el) return false;
  if(el.jquery) el = el[0];

  if(el.nodeName && el.nodeName.toLowerCase() == '#document')
    return 'jQueryPath_document';// == window.document

  if(el.location)
    return 'jQueryPath_window';// == window

  var path = findBestSelector(el, true);

  while ( el.parentNode && el.parentNode.nodeName !== '#document'
      && (!(el.id && el.id.indexOf('.') == -1))) {
    el = el.parentNode;
    path = findBestSelector(el) + '>' + path;
  }
  return path;
}

/*
 * Helpers
 */
 
   //Helper (we use jQuery as less as possible)
var next = (function() {
   var t = $('<div><p></p><p></p></div>')[0].childNodes[1];

   if (t.previousElementSibling && typeof(t.previousElementSibling) === 'object') {
     return function(el) {
     return el.previousElementSibling;
     };
   } else {
     return function(el) {
       return $(el).prev()[0]
     };
   }
   })();

 //Retreive the index of an element
var getIndex = function(el) {
 if (el.previousElementSibling === null)
   return 0;

 var _el = el,
     i = 0,
     elT = el.nodeName;

 while (_el = next(_el)) {
   if (_el.nodeName == elT)
     i++;
 }
 return i;
};

var findBestSelector = function(el, firstEl) {
 var first = firstEl || false,
     sel = '',
     id_uniq = true,
     index = false;
 //if (el.id && $('[id="'+el.id+'"]').length>1) id_uniq = false;
 
 if (el.id && el.id.indexOf('.') == -1 && $('[id="'+el.id+'"]').length==1) {
   //because $('#my.id') didn't work width jQuery
   sel += '#' + el.id;
 } else {
   sel += el.nodeName.toLowerCase();

   var indexEl = getIndex(el);
   if (indexEl || first) {
     sel += ':eq(' + indexEl + ')';
   }
 }

 return sel;
}

})($);

$.fn.getPathOriginal = function () {
    if (this.length != 1) throw 'Requires one element.';

    var path, node = this;
    while (node.length) {
        var realNode = node[0], name = realNode.localName;
        if (!name) break;

        name = name.toLowerCase();
        if (realNode.id && $('[id="'+realNode.id+'"]').length==1) {
            // As soon as an id is found, there's no need to specify more.
            return name + '#' + realNode.id + (path ? '>' + path : '');
        } else if (realNode.className) {
            //console.info(realNode.className.replace(/\:/g, "\\\\\$&"));
            // console.info(realNode.className);
            var c = $.trim(realNode.className).split(/\s+/);
            $.each(c, function(i, val) {
                if (!val.search(/:/))
                name += '.' + val;        
            });
            //name += '.' + $.trim(realNode.className).split(/\s+/).join('.');
        }
        var parent = node.parent(), siblings = parent.children(name);
        if (siblings.length > 1) name += ':eq(' + siblings.index(node) + ')';
        path = name + (path ? '>' + path : '');

        node = parent;
    }
    return path;
};

$.fn.exists = function(){return this.length>0;}

/*
$.fn.getXpath = function(){
 if (this.length != 1) throw 'Requires one element.';
 var xpath = '',
 element = this[0];
    for ( ; element && element.nodeType == 1; element = element.parentNode )
    {
        var id = $(element.parentNode).children(element.tagName).index(element) + 1;
        id > 1 ? (id = '[' + id + ']') : (id = '');
        xpath = '/' + element.tagName.toLowerCase() + id + xpath;
    }
    return xpath;

 };
 */

$.fn.copyCSS = function(source){
    var dom = $(source).get(0);
    var style;
    var dest = {};
    if(window.getComputedStyle){
        var camelize = function(a,b){
            return b.toUpperCase();
        };
        style = window.getComputedStyle(dom, null);
        for(var i = 0, l = style.length; i < l; i++){
            var prop = style[i];
            var camel = prop.replace(/\-([a-z])/g, camelize);
            var val = style.getPropertyValue(prop);
            dest[camel] = val;
        };
        return this.css(dest);
    };
    if(style = dom.currentStyle){
        for(var prop in style){
            dest[prop] = style[prop];
        };
        return this.css(dest);
   };
   if(style = dom.style){
      for(var prop in style){
        if(typeof style[prop] != 'function'){
          dest[prop] = style[prop];
        };
      };
    };
    return this.css(dest);
};

$.fn.getAttributes = function() {
        var a = ' '; 

        if(this.length) {
            $.each( this[0].attributes, function(index, attr) {
                a = a + attr.name + '="' + attr.value + '" ';
            }); 
        }
        return a;
};

$.fn.generateUUID = function() {
    var d = new Date().getTime();
    var uuid = 'xxxx-xxxx-xxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x7|0x8)).toString(16);
    });
    return uuid;
 };

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
