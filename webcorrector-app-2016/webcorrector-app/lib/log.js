'use strict';

function Logs(component, config) {
  // set component name
	if (component) {
		this.component = component;
	}

	// default values
	this.DEBUG = true;
	this.TIME = false;
	var init = false;

	// config
	if (config) {
		if (config.hasOwnProperty('debug')) {
			this.setDebug(config.debug);
		}

		if (config.hasOwnProperty('time')) {
			this.setTime(config.time);
		}

		if (config.hasOwnProperty('init')) {
			init = !!config.init;
		}
	}

	// show init message
	if (init) {
		this.debug('init');
	}
}

// configuration functions
Logs.prototype.setDebug = function setDebug(value) {
	this.DEBUG = !!value;
};

Logs.prototype.setTime = function setTime(value) {
	this.TIME = !!value;
};

// internal functions
Logs.prototype._component = function _component(args) {
	if (this.component) {
		var appendSpace = '';
		for (var i = 0; i < (10 - this.component.length); i++) {
			appendSpace += ' ';
		}

		args.unshift('[' + this.component + ']');
	}

	return args;
};

Logs.prototype._time = function _time(args) {
	if (this.TIME) {
		args.unshift('[' + new Date().toISOString() + ']');
	}

	return args;
};

// log functions
Logs.prototype.info = function info() {
	if (!isDev()) return;
	var args = Array.prototype.slice.call(arguments);
	args = this._component(args);
	args.unshift('%cINFO', 'background: #429FF0; color: white; padding: 0 2px');
	args = this._time(args);

	// jscs:disable disallowIdentifierNames
	console.info.apply(console, args);
};

Logs.prototype.raw = function raw() {
	var args = Array.prototype.slice.call(arguments);

	// jscs:disable disallowIdentifierNames
	console.log.apply(console, args);
};

Logs.prototype.r = Logs.prototype.raw; // alias

Logs.prototype.json = function json(json) {
	// jscs:disable disallowIdentifierNames
	console.log(JSON.stringify(json, undefined, 4));
};

Logs.prototype.j = Logs.prototype.json; // alias

Logs.prototype.log = function log() {
	if (!isDev()) return;
	var args = Array.prototype.slice.call(arguments);
	args = this._component(args);
	args.unshift('%cLOG', 'background: #00AD00; color: white; padding: 0 2px');
	args = this._time(args);

	// jscs:disable disallowIdentifierNames
	console.log.apply(console, args);
};

Logs.prototype.l = Logs.prototype.log; // alias

Logs.prototype.warn = function warn() {
	var args = Array.prototype.slice.call(arguments);
	args = this._component(args);
	args.unshift('%cWARN', 'background: #D7AA32; color: white; padding: 0 2px');
	args = this._time(args);

	// jscs:disable disallowIdentifierNames
	console.warn.apply(console, args);
};

Logs.prototype.warning = Logs.prototype.warn; // alias

Logs.prototype.error = function error() {
	var args = Array.prototype.slice.call(arguments);
	args = this._component(args);
	args.unshift('%cERROR', 'background: red; color: #FFF; padding: 0 2px');
	args = this._time(args);

	// jscs:disable disallowIdentifierNames
	console.error.apply(console, args);
};

Logs.prototype.err = Logs.prototype.error; // alias

Logs.prototype.debug = function debug() {
	if (this.DEBUG) {
		var args = Array.prototype.slice.call(arguments);
		args = this._component(args);
		args.unshift('%cDEBUG', 'background: #000; color: #FFF; padding: 0 2px');
		args = this._time(args);

		// jscs:disable disallowIdentifierNames
		console.log.apply(console, args);
	}
};

// minimalistic log function aliases
Logs.prototype.i = Logs.prototype.info;
Logs.prototype.w = Logs.prototype.warn;
Logs.prototype.e = Logs.prototype.error;
Logs.prototype.d = Logs.prototype.debug;

// export Logs object constructor
module.exports = function initLogs(component, config) {
	if (typeof component === 'string') {
		return new Logs(component, config);
	} else {
		return new Logs(undefined, component);
	}
};

function isDev() {
	return (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'testing' && process.env.NODE_ENV !== 'staging' && process.env.NODE_ENV !== 'tabeguache') ? true : false;
}