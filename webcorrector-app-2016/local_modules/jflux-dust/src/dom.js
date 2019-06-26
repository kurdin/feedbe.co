'use strict';

var config = require('./config.js');

var dom = {
  $: function () {
    if (this.$) {
      return this.$.apply(this.$, arguments);
    } else {
      this.$ = require('jquery');
      console.info('jFlux dust uses embedded jquery ver: ' + this.$.fn.jquery + ' is loaded not found, you can use $$.config() to provide jQuery as dependency');
      dom.set$(this.$);
    }
  },
  document: global.document,
  set$: function (jquery) {
      this.$ = jquery;
      config().jquery = jquery;
  },
  setWindow: function (window) {
    this.$ = require('jquery')(window);
    this.document = window.document;
  }
};

if (typeof window != 'undefined' && window.jQuery) {
  dom.set$(window.jQuery);
} else if (global.__app_jquery$) {
  dom.set$(global.__app_jquery$);
} 

module.exports = dom;