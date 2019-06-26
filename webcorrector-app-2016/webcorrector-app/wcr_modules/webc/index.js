'use strict';

var webC = {};

webC.util = {

 // var browser=(navigator.appName.indexOf("Microsoft")!=-1)? "IE" : (navigator.appName.indexOf("Netscape")? "NS" : "Not IE nor NS"
 isIEALL: function () {
      return 0 <= navigator.userAgent.search(/MSIE/) || 0 <= navigator.userAgent.search(/Trident/)
 }, 
 isIE : function () { 
      return 0 <= (window.attachEvent && !window.addEventListener)
 },
 isIE8: function () {
      return 0 <= navigator.userAgent.search(/MSIE 8/)
 }
}

// WebCorrector DropDown with Callback. Use: var lang = new wcDropDown(element, callback(val,id))
webC.dropDown = function(el, callback) {
    var dd = el,
    placeholder = dd.children('span'),
    opts = dd.find('ul.dropdown > li'),
    val = '',
    data = '',
    index = -1;

    function initEvents() {
      dd.on('click', function(event){
        $(this).toggleClass('active');
        $('.dropdown', this).slideToggle('fast');
        return false;
      });
      opts.on('click',function(){
        var opt = $(this);
        val = opt.text();
        data = opt.data('sel');
        index = opt.index();
        placeholder.text(val);
        if (callback && typeof(callback) === "function") {  
            callback(val, data);  
        }  
      });
    };
    function getValue() {
      return val;
    }
    function getIndex() {
      return index;
    }
    initEvents();
  };


webC.compare_full = require('./compare-full');

webC.compare = require('./compare-min');

module.exports = webC;