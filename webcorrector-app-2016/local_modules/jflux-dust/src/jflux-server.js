'use strict';

var dom = require('./dom.js');
var config = require('./config.js');

module.exports = function() {
	var dust;
	var $$;
	
	config().server = true;

	var args = Array.prototype.slice.call(arguments);

	args.forEach(function(arg) {
		if (arg === 'no_global') config().global = false;
	});

  if (args[1] && args[1].fn) {
  	config().jquery = args[1];
  	dom.set$(args[1]);
  } else {
  	dom.setWindow(require('../node_modules/jsdom/').jsdom().parentWindow);
  }

  if (args[0] && args[0].version) {
		dust = args[0];
		config({dust: dust});
  } else {
  	dust = config().dust;
  }

	$$ = require('./jflux.js');

	args.forEach(function(arg) {
		if (arg && arg.use && arg.locals) arg.use($$.shared);
	});

	require('./server.js')(dust);

	return $$;
}

