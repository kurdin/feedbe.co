/*
$("#el").spin(); // Produces default Spinner using the text color of #el.
$("#el").spin("small"); // Produces a 'small' Spinner using the text color of #el.
$("#el").spin("large", "white"); // Produces a 'large' Spinner in white (or any valid CSS color).
$("#el").spin({ ... }); // Produces a Spinner using your custom settings.
$("#el").spin(false); // Kills the spinner.
*/

var Spinner = require('./spin.js');

(function(e){e.fn.spin=function(e,t){if(e!==false){e=$.extend({lines:11,length:20,width:10,radius:30,corners:1,rotate:0,direction:1,color:"#000",speed:1,trail:60,shadow:true,hwaccel:true,className:"spinner",zIndex:2e9,top:"auto",left:"auto",rtl:$("html").attr("dir")==="rtl"},e)}if(arguments.length==1&&e==false){return this.each(function(){var e=$(this),t=e.data();if(t.spinner){t.spinner.stop();delete t.spinner}})}var n={tiny:{lines:8,length:2,width:2,radius:3},small:{lines:8,length:4,width:3,radius:5},large:{lines:10,length:8,width:4,radius:8}};if(Spinner){return this.each(function(){var r=$(this),i=r.data();if(i.spinner){i.spinner.stop();delete i.spinner}if(e!==false){if(typeof e==="string"){if(e in n){e=n[e]}else{e={}}if(t){e.color=t}}i.spinner=(new Spinner($.extend({color:r.css("color")},e))).spin(this)}})}else{throw"Spinner class not available."}}})($);