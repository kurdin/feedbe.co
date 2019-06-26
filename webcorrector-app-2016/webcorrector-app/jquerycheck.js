'use strict';

function checkJQuery($) {
// if (window.wcLoaded) return;
console.log('WCRApp : jquery existing: ' + (window.jQuery ? jQuery.fn.jquery : 'N/A') + ', loaded: ' + ($ ? $.fn.jquery : 'N/A'));
// if (console.re ===  undefined) console.re = console;

}

module.exports = checkJQuery;