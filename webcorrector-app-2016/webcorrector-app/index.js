'use strict';

// require jquery
// This is not strictly required as we used the ProvidePlugin
// in the webpack.config.js to bind $ to "jquery"
// but it's better style to make it explicit
// var checkJQuery = require('./lib/jquerycheck.js');

// add log wrapper to window
// var log = require('./lib/log.js')('INDEX.JS');

// load animate css lib
require('./less/animate.css');

// load test page styles
require('./style.css');

var $ = require('jquery');

// require(['jquery','underscore'], function($,_){

// load jquery plugins
require('imports?$=jquery!./wcr_modules/jquery-plugins/insert-at-caret.js');
require('imports?$=jquery!./wcr_modules/jquery-plugins/hoverintent.js');
require('imports?$=jquery!./wcr_modules/jquery-plugins/jquery-cookie.js');
require('imports?$=jquery!./wcr_modules/jquery-plugins/jquery-storage.js');
require('imports?$=jquery!./wcr_modules/jquery-plugins/masks.js');
require('imports?$=jquery!./wcr_modules/jquery-plugins/multi-element-masks.js');
require('imports?$=jquery!./wcr_modules/jquery-plugins/post-message.js');
require('imports?$=jquery!./wcr_modules/jquery-plugins/jquery-spellchecker.js');
require('imports?$=jquery!./wcr_modules/jquery-plugins/jquery-findandreplacedomtext.js');
require('imports?$=jquery!./wcr_modules/jquery-plugins/smartresize.js');
require('imports?$=jquery!./wcr_modules/jquery-plugins/spinner.js');
require('imports?$=jquery!./wcr_modules/jquery-plugins/jquery-color-animation.js');
require('imports?$=jquery!./wcr_modules/jquery-plugins/jquery-transit.js');
require('imports?$=jquery!./wcr_modules/jquery-plugins/hightlightjscode.js');
require('imports?$=jquery!./wcr_modules/jquery-plugins/jglow.js');
require('imports?$=jquery!./wcr_modules/jquery-plugins/jquery-event-drag.js');
require('imports?$=jquery!./wcr_modules/jquery-plugins/togglecheckbox.js');
require('imports?$=jquery!./wcr_modules/jquery-plugins/snap-menu.js');
require('imports?$=jquery!./wcr_modules/jquery-plugins/jquery-throttle.js');
require('imports?$=jquery!./wcr_modules/jquery-plugins/jquery-popover.js');
require('imports?$=jquery!./wcr_modules/jquery-plugins/jquery-circlemenu.js');
require('imports?$=jquery!./wcr_modules/jquery-plugins/jquery-text-hightlighter.js');
require('imports?$=jquery!./wcr_modules/jquery-plugins/jquery-arrows.js');
require('imports?$=jquery!./wcr_modules/jquery-plugins/jquery-elastic.js');
require('imports?$=jquery!./wcr_modules/jquery-plugins/animatecss.js');

// add translations
require('imports?$=jquery!./wcr_modules/jquery-plugins/i18n.js');
require('imports?$=jquery!./i18n/eng-rus.js');

// load jquery helpers
require('imports?$=jquery!./wcr_modules/jquery-plugins/jquery-fn-helpers.js');

// load global wc libs
require('script!./wcr_modules/modernize.js');
require('script!./wcr_modules/events.js');
require('script!./wcr_modules/sketch.js');
require('script!./wcr_modules/text-rangy.js');

// require('legacy!./wcr_modules/tappable.js');

var Backbone = require('../local_modules/backbone');
var Marionette = require('../local_modules/backbone.marionette');

// dust loading
var dust = require('dustjs-linkedin');
require('dustjs-helpers');
require('imports?dust=dust!./lib/dust-helpers.js');

// load app templates

// console.log('dust', dust.helpers);

// var template = require('../static/templates/chat.dust');

// dust.render(template, {}, function(err, out) {
// 	console.log('err', err);
// 	console.log('dust rendered:', out);
// });

// require('dustjs-helpers');

// lets disable all inputs for now
$('input').attr('disabled', true);

// alert(ver);

// console.log('local Backbone',BBBackbone);
// console.log('global Backbone', Backbone);

// checkJQuery($);

var shadowStyles = require('shadowstyles');
shadowStyles(['.jGrowl']);

$('.test').insertAtCaret('is');
$('#draggable').spin();

require('./main.js');

// var haveParent = require("./have-parent.js");
// var haveParent = require("./have-parent.js");

// require("script!../static/js/included-libs.js");
// require("script!../static/i18n/eng-rus.js");
// require("script!../../webcorrector-extension/js/included-templates.js");
// require("script!../static/js/included-main.js");
// require("script!../static/css/included.css.js");
// require("script!../static/js/included-ends.js");

// });
