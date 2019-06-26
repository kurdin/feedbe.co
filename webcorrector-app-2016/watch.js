var dustcomp = require('hbsc');
var buildify = require('buildify');
var static = require('./local_modules/node-static');

// Report crashes to our server.
// require('crash-reporter').start();

dustcomp.compile({
  dir: __dirname + '/static/templates',
  outfile: __dirname + '/../webcorrector-extension/js/included-templates.js',
  minify: false,
  extensions: ['dust','js']
});

buildify().concat([
       './static/js/included-begins.js',
       './static/js/included-libs.js',     
       './static/i18n/eng-rus.js',
       '../webcorrector-extension/js/included-templates.js',
       './static/js/included-main.js',
       './static/css/included.css.js', 
       './static/js/included-ends.js' 
     ]).save('../webcorrector-extension/js/included.min.js');
// .uglify();

var app_browser_assets = new static.Server('../js/', { 'Access-Control-Allow-Origin' : '*', cache: 3700 });
  
require('http').createServer(function (request, response) {
    request.addListener('end', function () {
        app_browser_assets.serve(request, response);
    }).resume();
}).listen(8888);
