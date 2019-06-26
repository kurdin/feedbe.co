/*global window: false */

// Middleware that injects the shared data and sharify script
module.exports = function (req, res, next) {
	if (res.locals && res.locals.AppShared) {
		return next();
	}

	var data = {
		NODE_ENV: process.env.NODE_ENV
	};

	for (var key in module.exports.data) {
		data[key] = module.exports.data[key];
	}

	// Inject a shared object into locals and use in template as {AppShared.data} and {AppShared.inject|s}
	res.locals.AppShared = {
		data: data,
		inject: function (shared) {
			var appdata = shared || data;
			return '<script type="text/javascript">' +
			'window.__clientAppShared = ' +

			//There are tricky rules about safely embedding JSON within HTML
			//see http://stackoverflow.com/a/4180424/266795
			JSON.stringify(appdata)
			.replace(/</g, '\\u003c')
			.replace(/-->/g, '--\\>')
			.replace(/\u2028/g, '\\u2028')
			.replace(/\u2029/g, '\\u2029') +
			';' +
			'(function() { if (typeof window != "undefined" && window.__clientAppShared) { if (!window.datashared) { window.datashared = window.__clientAppShared; } } })();</script>';
		}
	};

	// Alias for easy access appdata in controllers
	res.locals.appdata = res.locals.shared = res.locals.AppShared.data;
	next();
};

// The shared hash of data
module.exports.data = {};

module.exports.set = function (obj, res) {
	if (!res) {
		for (var key in obj) {
			module.exports.data[key] = obj[key];
		}

		return;
	}

	res.locals.appdata = res.locals.appdata || {};

	for (var key2 in obj) {
		res.locals.appdata[key2] = obj[key2];
	}
};

var bootstrapOnClient = module.exports.bootstrapOnClient = function () {
	if (typeof window !== 'undefined' && window.__clientAppShared) {
		module.exports.data = window.__clientAppShared;
		if (!window.AppShared) window.AppShared = module.exports;
		if (!window.appdata) window.appdata = window.__clientAppShared;
	}
};

bootstrapOnClient();