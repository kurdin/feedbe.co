(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.jfluxDust = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            currentQueue[queueIndex].run();
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],3:[function(require,module,exports){
/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var inherits = require('inherits');
var EventEmitter = require('eventemitter3');
var CHANGE_EVENT = 'change';

/**
 * @class BaseStore
 * @extends EventEmitter
 * @param dispatcher The dispatcher interface
 * @constructor
 */
function BaseStore(dispatcher) {
    this.dispatcher = dispatcher;
    this._hasChanged = false;
    if (this.initialize) {
        this.initialize();
    }
}

inherits(BaseStore, EventEmitter);

/**
 * Convenience method for getting the store context object.
 * @method getContext
 * @return {Object} Returns the store context object.
 */
BaseStore.prototype.getContext = function getContext() {
    return this.dispatcher.getContext();
};

/**
 * Add a listener for the change event
 * @method addChangeListener
 * @param {Function} callback
 */
BaseStore.prototype.addChangeListener = function addChangeListener(callback) {
    this.on(CHANGE_EVENT, callback);
};

/**
 * Remove a listener for the change event
 * @method removeChangeListener
 * @param {Function} callback
 */
BaseStore.prototype.removeChangeListener = function removeChangeListener(callback) {
    this.removeListener(CHANGE_EVENT, callback);
};

/**
 * Determines whether the store should dehydrate or not. By default, only dehydrates
 * if the store has emitted an update event. If no update has been emitted, it is assumed
 * that the store is in its default state and therefore does not need to dehydrate.
 * @method shouldDehydrate
 * @returns {boolean}
 */
BaseStore.prototype.shouldDehydrate = function shouldDehydrate() {
    return this._hasChanged;
};

/**
 * Emit a change event
 * @method emitChange
 * @param {*} param=this
 */
BaseStore.prototype.emitChange = function emitChange(param) {
    this._hasChanged = true;
    this.emit(CHANGE_EVENT, param || this);
};

module.exports = BaseStore;

},{"eventemitter3":12,"inherits":13}],4:[function(require,module,exports){
/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var inherits = require('inherits');
var BaseStore = require('./BaseStore');
var IGNORE_ON_PROTOTYPE = ['statics', 'storeName', 'handlers', 'mixins'];

function createChainedFunction(one, two) {
    return function chainedFunction() {
        one.apply(this, arguments);
        two.apply(this, arguments);
    };
}

function mixInto(dest, src) {
    Object.keys(src).forEach(function (prop) {
        if (-1 !== IGNORE_ON_PROTOTYPE.indexOf(prop)) {
            return;
        }
        if ('initialize' === prop) {
            if (!dest[prop]) {
                dest[prop] = src[prop];
            } else {
                dest[prop] = createChainedFunction(dest[prop], src[prop]);
            }
        } else {
            if (dest.hasOwnProperty(prop)) {
                throw new Error('Mixin property collision for property "' + prop + '"');
            }
            dest[prop] = src[prop];
        }
    });
}

/**
 * Helper for creating a store class
 * @method createStore
 * @param {Object} spec
 * @param {String} spec.storeName The name of the store
 * @param {Object} spec.handlers Hash of action name to method name of action handlers
 * @param {Function} spec.initialize Function called during construction for setting the default state
 * @param {Function} spec.dehydrate Function that returns serializable data to send to the client
 * @param {Function} spec.rehydrate Function that takes in serializable data to rehydrate the store
 */
module.exports = function createStore(spec) {
    spec.statics = spec.statics || {};
    if (!spec.storeName && !spec.statics.storeName) {
        throw new Error('createStore called without a storeName');
    }
    var Store = function (dispatcher) {
        BaseStore.call(this, dispatcher);
    };

    inherits(Store, BaseStore);

    Object.keys(spec.statics).forEach(function (prop) {
        Store[prop] = spec.statics[prop];
    });

    Store.storeName = spec.storeName || Store.storeName;
    Store.handlers = spec.handlers || Store.handlers;
    Store.mixins = spec.mixins || Store.mixins;

    if (Store.mixins) {
        Store.mixins.forEach(function(mixin) {
            mixInto(Store.prototype, mixin);
        });
    }
    mixInto(Store.prototype, spec);

    return Store;
};

},{"./BaseStore":3,"inherits":13}],5:[function(require,module,exports){
/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
module.exports = require('./lib/Dispatcher');

},{"./lib/Dispatcher":7}],6:[function(require,module,exports){
/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';
var debug = require('debug')('Dispatchr:Action');

function Action(name, payload) {
    this.name = name;
    this.payload = payload;
    this._handlers = null;
    this._isExecuting = false;
    this._isCompleted = null;
}

/**
 * Gets a name from a store
 * @method getStoreName
 * @param {String|Object} store The store name or class from which to extract
 *      the name
 * @returns {String}
 */
Action.prototype.getStoreName = function getStoreName(store) {
    if ('string' === typeof store) {
        return store;
    }
    return store.storeName;
};

/**
 * Executes all handlers for the action
 * @method execute
 * @param {Function[]} handlers A mapping of store names to handler function
 * @throws {Error} if action has already been executed
 */
Action.prototype.execute = function execute(handlers) {
    if (this._isExecuting) {
        throw new Error('Action is already dispatched');
    }
    var self = this;
    this._handlers = handlers;
    this._isExecuting = true;
    this._isCompleted = {};
    Object.keys(handlers).forEach(function handlersEach(storeName) {
        self._callHandler(storeName);
    });
};

/**
 * Calls an individual store's handler function
 * @method _callHandler
 * @param {String} storeName
 * @private
 * @throws {Error} if handler does not exist for storeName
 */
Action.prototype._callHandler = function callHandler(storeName) {
    var self = this,
        handlerFn = self._handlers[storeName];
    if (!handlerFn) {
        throw new Error(storeName + ' does not have a handler for action ' + self.name);
    }
    if (self._isCompleted[storeName]) {
        return;
    }
    self._isCompleted[storeName] = false;
    debug('executing handler for ' + storeName);
    handlerFn(self.payload, self.name);
    self._isCompleted[storeName] = true;
};

/**
 * Waits until all stores have finished handling an action and then calls
 * the callback
 * @method waitFor
 * @param {String|String[]|Constructor|Constructor[]} stores An array of stores as strings or constructors to wait for
 * @param {Function} callback Called after all stores have completed handling their actions
 * @throws {Error} if the action is not being executed
 */
Action.prototype.waitFor = function waitFor(stores, callback) {
    var self = this;
    if (!self._isExecuting) {
        throw new Error('waitFor called even though there is no action being executed!');
    }
    if (!Array.isArray(stores)) {
        stores = [stores];
    }

    debug('waiting on ' + stores.join(', '));
    stores.forEach(function storesEach(storeName) {
        storeName = self.getStoreName(storeName);
        if (self._handlers[storeName]) {
            self._callHandler(storeName);
        }
    });

    callback();
};

module.exports = Action;

},{"debug":9}],7:[function(require,module,exports){
(function (process){
/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var Action = require('./Action');
var DEFAULT = 'default';
var DispatcherContext = require('./DispatcherContext');

/**
 * @class Dispatcher
 * @param {Object} options Dispatcher options
 * @param {Array} options.stores Array of stores to register
 * @constructor
 */
function Dispatcher (options) {
    options = options || {};
    options.stores = options.stores || [];
    this.stores = {};
    this.handlers = {};
    this.handlers[DEFAULT] = [];
    this.hasWarnedAboutNameProperty = false;
    options.stores.forEach(function (store) {
        this.registerStore(store);
    }, this);

}

Dispatcher.prototype.createContext = function createContext(context) {
    return new DispatcherContext(this, context);
};

/**
 * Registers a store so that it can handle actions.
 * @method registerStore
 * @static
 * @param {Object} store A store class to be registered. The store should have a static
 *      `name` property so that it can be loaded later.
 * @throws {Error} if store is invalid
 * @throws {Error} if store is already registered
 */
Dispatcher.prototype.registerStore = function registerStore(store) {
    if ('function' !== typeof store) {
        throw new Error('registerStore requires a constructor as first parameter');
    }
    var storeName = this.getStoreName(store);
    if (!storeName) {
        throw new Error('Store is required to have a `storeName` property.');
    }
    if (this.stores[storeName]) {
        if (this.stores[storeName] === store) {
            // Store is already registered, nothing to do
            return;
        }
        throw new Error('Store with name `' + storeName + '` has already been registered.');
    }
    this.stores[storeName] = store;
    if (store.handlers) {
        Object.keys(store.handlers).forEach(function storeHandlersEach(action) {
            var handler = store.handlers[action];
            this._registerHandler(action, storeName, handler);
        }, this);
    }
};

/**
 * Method to discover if a storeName has been registered
 * @method isRegistered
 * @static
 * @param {Object|String} store The store to check
 * @returns {boolean}
 */
Dispatcher.prototype.isRegistered = function isRegistered(store) {
    var storeName = this.getStoreName(store),
        storeInstance = this.stores[storeName];

    if (!storeInstance) {
        return false;
    }

    if ('function' === typeof store) {
        if (store !== storeInstance) {
            return false;
        }
    }
    return true;
};

/**
 * Gets a name from a store
 * @method getStoreName
 * @static
 * @param {String|Object} store The store name or class from which to extract
 *      the name
 * @returns {String}
 */
Dispatcher.prototype.getStoreName = function getStoreName(store) {
    if ('string' === typeof store) {
        return store;
    }
    if (store.storeName) {
        return store.storeName;
    }

    if (process.env.NODE_ENV !== 'production') {
        if (store.name && !this.hasWarnedAboutNameProperty) {
            console.warn('A store has been registered that relies on the ' +
                'constructor\'s name property. This name may change when you ' +
                'minify your stores during build time and could break string ' +
                'references to your store. It is advised that you add a ' +
                'static `storeName` property to your store to ensure the ' +
                'store name does not change during your build.');
            this.hasWarnedAboutNameProperty = true;
        }
    }
    return store.name;
};

/**
 * Adds a handler function to be called for the given action
 * @method registerHandler
 * @private
 * @static
 * @param {String} action Name of the action
 * @param {String} name Name of the store that handles the action
 * @param {String|Function} handler The function or name of the method that handles the action
 * @returns {number}
 */
Dispatcher.prototype._registerHandler = function registerHandler(action, name, handler) {
    this.handlers[action] = this.handlers[action] || [];
    this.handlers[action].push({
        name: this.getStoreName(name),
        handler: handler
    });
    return this.handlers.length - 1;
};

module.exports = {
    createDispatcher: function (options) {
        return new Dispatcher(options);
    }
};

}).call(this,require('_process'))
},{"./Action":6,"./DispatcherContext":8,"_process":2}],8:[function(require,module,exports){
/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var Action = require('./Action');
var DEFAULT = 'default';
var debug = require('debug')('Dispatchr:DispatcherContext');

/**
 * @class Dispatcher
 * @param {Object} context The context to be used for store instances
 * @constructor
 */
function DispatcherContext (dispatcher, context) {
    this.dispatcher = dispatcher;
    this.storeInstances = {};
    this.currentAction = null;
    this.dispatcherInterface = {
        getContext: function getContext() { return context; },
        getStore: this.getStore.bind(this),
        waitFor: this.waitFor.bind(this)
    };
}

/**
 * Returns a single store instance and creates one if it doesn't already exist
 * @method getStore
 * @param {String} name The name of the instance
 * @returns {Object} The store instance
 * @throws {Error} if store is not registered
 */
DispatcherContext.prototype.getStore = function getStore(name) {
    var storeName = this.dispatcher.getStoreName(name);
    if (!this.storeInstances[storeName]) {
        var Store = this.dispatcher.stores[storeName];
        if (!Store) {
            throw new Error('Store ' + storeName + ' was not registered.');
        }
        this.storeInstances[storeName] = new (this.dispatcher.stores[storeName])(this.dispatcherInterface);
    }
    return this.storeInstances[storeName];
};

/**
 * Dispatches a new action or queues it up if one is already in progress
 * @method dispatch
 * @param {String} actionName Name of the action to be dispatched
 * @param {Object} payload Parameters to describe the action
 * @throws {Error} if store has handler registered that does not exist
 */
DispatcherContext.prototype.dispatch = function dispatch(actionName, payload) {
    if (!actionName) {
        throw new Error('actionName parameter `' + actionName + '` is invalid.');
    }
    if (this.currentAction) {
        throw new Error('Cannot call dispatch while another dispatch is executing. Attempted to execute \'' + actionName + '\' but \'' + this.currentAction.name + '\' is already executing.');
    }
    var actionHandlers = this.dispatcher.handlers[actionName] || [],
        defaultHandlers = this.dispatcher.handlers[DEFAULT] || [];
    if (!actionHandlers.length && !defaultHandlers.length) {
        debug(actionName + ' does not have any registered handlers');
        return;
    }
    debug('dispatching ' + actionName, payload);
    this.currentAction = new Action(actionName, payload);
    var self = this,
        allHandlers = actionHandlers.concat(defaultHandlers),
        handlerFns = {};

    try {
        allHandlers.forEach(function actionHandlersEach(store) {
            if (handlerFns[store.name]) {
                // Don't call the default if the store has an explicit action handler
                return;
            }
            var storeInstance = self.getStore(store.name);
            if ('function' === typeof store.handler) {
                handlerFns[store.name] = store.handler.bind(storeInstance);
            } else {
                if (!storeInstance[store.handler]) {
                    throw new Error(store.name + ' does not have a method called ' + store.handler);
                }
                handlerFns[store.name] = storeInstance[store.handler].bind(storeInstance);
            }
        });
        this.currentAction.execute(handlerFns);
    } catch (e) {
        throw e;
    } finally {
        debug('finished ' + actionName);
        this.currentAction = null;
    }
};

/**
 * Returns a raw data object representation of the current state of the
 * dispatcher and all store instances. If the store implements a shouldDehdyrate
 * function, then it will be called and only dehydrate if the method returns `true`
 * @method dehydrate
 * @returns {Object} dehydrated dispatcher data
 */
DispatcherContext.prototype.dehydrate = function dehydrate() {
    var self = this,
        stores = {};
    Object.keys(self.storeInstances).forEach(function storeInstancesEach(storeName) {
        var store = self.storeInstances[storeName];
        if (!store.dehydrate || (store.shouldDehydrate && !store.shouldDehydrate())) {
            return;
        }
        stores[storeName] = store.dehydrate();
    });
    return {
        stores: stores
    };
};

/**
 * Takes a raw data object and rehydrates the dispatcher and store instances
 * @method rehydrate
 * @param {Object} dispatcherState raw state typically retrieved from `dehydrate`
 *      method
 */
DispatcherContext.prototype.rehydrate = function rehydrate(dispatcherState) {
    var self = this;
    if (dispatcherState.stores) {
        Object.keys(dispatcherState.stores).forEach(function storeStateEach(storeName) {
            var state = dispatcherState.stores[storeName],
                store = self.getStore(storeName);
            if (store.rehydrate) {
                store.rehydrate(state);
            }
        });
    }
};

/**
 * Waits until all stores have finished handling an action and then calls
 * the callback
 * @method waitFor
 * @param {String|String[]} stores An array of stores as strings to wait for
 * @param {Function} callback Called after all stores have completed handling their actions
 * @throws {Error} if there is no action dispatching
 */
DispatcherContext.prototype.waitFor = function waitFor(stores, callback) {
    if (!this.currentAction) {
        throw new Error('waitFor called even though there is no action dispatching');
    }
    this.currentAction.waitFor(stores, callback);
};

module.exports = DispatcherContext;

},{"./Action":6,"debug":9}],9:[function(require,module,exports){

/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = require('./debug');
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome
               && 'undefined' != typeof chrome.storage
                  ? chrome.storage.local
                  : localstorage();

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // is webkit? http://stackoverflow.com/a/16459606/376773
  return ('WebkitAppearance' in document.documentElement.style) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (window.console && (console.firebug || (console.exception && console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31);
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  return JSON.stringify(v);
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs() {
  var args = arguments;
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return args;

  var c = 'color: ' + this.color;
  args = [args[0], c, 'color: inherit'].concat(Array.prototype.slice.call(args, 1));

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
  return args;
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = exports.storage.debug;
  } catch(e) {}
  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage(){
  try {
    return window.localStorage;
  } catch (e) {}
}

},{"./debug":10}],10:[function(require,module,exports){

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = debug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = require('ms');

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lowercased letter, i.e. "n".
 */

exports.formatters = {};

/**
 * Previously assigned color.
 */

var prevColor = 0;

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 *
 * @return {Number}
 * @api private
 */

function selectColor() {
  return exports.colors[prevColor++ % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function debug(namespace) {

  // define the `disabled` version
  function disabled() {
  }
  disabled.enabled = false;

  // define the `enabled` version
  function enabled() {

    var self = enabled;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // add the `color` if not set
    if (null == self.useColors) self.useColors = exports.useColors();
    if (null == self.color && self.useColors) self.color = selectColor();

    var args = Array.prototype.slice.call(arguments);

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %o
      args = ['%o'].concat(args);
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    if ('function' === typeof exports.formatArgs) {
      args = exports.formatArgs.apply(self, args);
    }
    var logFn = enabled.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }
  enabled.enabled = true;

  var fn = exports.enabled(namespace) ? enabled : disabled;

  fn.namespace = namespace;

  return fn;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  var split = (namespaces || '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

},{"ms":11}],11:[function(require,module,exports){
/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} options
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options){
  options = options || {};
  if ('string' == typeof val) return parse(val);
  return options.long
    ? long(val)
    : short(val);
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = '' + str;
  if (str.length > 10000) return;
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str);
  if (!match) return;
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function short(ms) {
  if (ms >= d) return Math.round(ms / d) + 'd';
  if (ms >= h) return Math.round(ms / h) + 'h';
  if (ms >= m) return Math.round(ms / m) + 'm';
  if (ms >= s) return Math.round(ms / s) + 's';
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function long(ms) {
  return plural(ms, d, 'day')
    || plural(ms, h, 'hour')
    || plural(ms, m, 'minute')
    || plural(ms, s, 'second')
    || ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) return;
  if (ms < n * 1.5) return Math.floor(ms / n) + ' ' + name;
  return Math.ceil(ms / n) + ' ' + name + 's';
}

},{}],12:[function(require,module,exports){
'use strict';

//
// We store our EE objects in a plain object whose properties are event names.
// If `Object.create(null)` is not supported we prefix the event names with a
// `~` to make sure that the built-in object properties are not overridden or
// used as an attack vector.
// We also assume that `Object.create(null)` is available when the event name
// is an ES6 Symbol.
//
var prefix = typeof Object.create !== 'function' ? '~' : false;

/**
 * Representation of a single EventEmitter function.
 *
 * @param {Function} fn Event handler to be called.
 * @param {Mixed} context Context for function execution.
 * @param {Boolean} once Only emit once
 * @api private
 */
function EE(fn, context, once) {
  this.fn = fn;
  this.context = context;
  this.once = once || false;
}

/**
 * Minimal EventEmitter interface that is molded against the Node.js
 * EventEmitter interface.
 *
 * @constructor
 * @api public
 */
function EventEmitter() { /* Nothing to set */ }

/**
 * Holds the assigned EventEmitters by name.
 *
 * @type {Object}
 * @private
 */
EventEmitter.prototype._events = undefined;

/**
 * Return a list of assigned event listeners.
 *
 * @param {String} event The events that should be listed.
 * @param {Boolean} exists We only need to know if there are listeners.
 * @returns {Array|Boolean}
 * @api public
 */
EventEmitter.prototype.listeners = function listeners(event, exists) {
  var evt = prefix ? prefix + event : event
    , available = this._events && this._events[evt];

  if (exists) return !!available;
  if (!available) return [];
  if (available.fn) return [available.fn];

  for (var i = 0, l = available.length, ee = new Array(l); i < l; i++) {
    ee[i] = available[i].fn;
  }

  return ee;
};

/**
 * Emit an event to all registered event listeners.
 *
 * @param {String} event The name of the event.
 * @returns {Boolean} Indication if we've emitted an event.
 * @api public
 */
EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
  var evt = prefix ? prefix + event : event;

  if (!this._events || !this._events[evt]) return false;

  var listeners = this._events[evt]
    , len = arguments.length
    , args
    , i;

  if ('function' === typeof listeners.fn) {
    if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

    switch (len) {
      case 1: return listeners.fn.call(listeners.context), true;
      case 2: return listeners.fn.call(listeners.context, a1), true;
      case 3: return listeners.fn.call(listeners.context, a1, a2), true;
      case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
      case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
      case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
    }

    for (i = 1, args = new Array(len -1); i < len; i++) {
      args[i - 1] = arguments[i];
    }

    listeners.fn.apply(listeners.context, args);
  } else {
    var length = listeners.length
      , j;

    for (i = 0; i < length; i++) {
      if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

      switch (len) {
        case 1: listeners[i].fn.call(listeners[i].context); break;
        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
        default:
          if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
            args[j - 1] = arguments[j];
          }

          listeners[i].fn.apply(listeners[i].context, args);
      }
    }
  }

  return true;
};

/**
 * Register a new EventListener for the given event.
 *
 * @param {String} event Name of the event.
 * @param {Functon} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @api public
 */
EventEmitter.prototype.on = function on(event, fn, context) {
  var listener = new EE(fn, context || this)
    , evt = prefix ? prefix + event : event;

  if (!this._events) this._events = prefix ? {} : Object.create(null);
  if (!this._events[evt]) this._events[evt] = listener;
  else {
    if (!this._events[evt].fn) this._events[evt].push(listener);
    else this._events[evt] = [
      this._events[evt], listener
    ];
  }

  return this;
};

/**
 * Add an EventListener that's only called once.
 *
 * @param {String} event Name of the event.
 * @param {Function} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @api public
 */
EventEmitter.prototype.once = function once(event, fn, context) {
  var listener = new EE(fn, context || this, true)
    , evt = prefix ? prefix + event : event;

  if (!this._events) this._events = prefix ? {} : Object.create(null);
  if (!this._events[evt]) this._events[evt] = listener;
  else {
    if (!this._events[evt].fn) this._events[evt].push(listener);
    else this._events[evt] = [
      this._events[evt], listener
    ];
  }

  return this;
};

/**
 * Remove event listeners.
 *
 * @param {String} event The event we want to remove.
 * @param {Function} fn The listener that we need to find.
 * @param {Mixed} context Only remove listeners matching this context.
 * @param {Boolean} once Only remove once listeners.
 * @api public
 */
EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
  var evt = prefix ? prefix + event : event;

  if (!this._events || !this._events[evt]) return this;

  var listeners = this._events[evt]
    , events = [];

  if (fn) {
    if (listeners.fn) {
      if (
           listeners.fn !== fn
        || (once && !listeners.once)
        || (context && listeners.context !== context)
      ) {
        events.push(listeners);
      }
    } else {
      for (var i = 0, length = listeners.length; i < length; i++) {
        if (
             listeners[i].fn !== fn
          || (once && !listeners[i].once)
          || (context && listeners[i].context !== context)
        ) {
          events.push(listeners[i]);
        }
      }
    }
  }

  //
  // Reset the array, or remove it completely if we have no more listeners.
  //
  if (events.length) {
    this._events[evt] = events.length === 1 ? events[0] : events;
  } else {
    delete this._events[evt];
  }

  return this;
};

/**
 * Remove all listeners or only the listeners for the specified event.
 *
 * @param {String} event The event want to remove all listeners for.
 * @api public
 */
EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
  if (!this._events) return this;

  if (event) delete this._events[prefix ? prefix + event : event];
  else this._events = prefix ? {} : Object.create(null);

  return this;
};

//
// Alias methods names because people roll like that.
//
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;

//
// This function doesn't apply anymore.
//
EventEmitter.prototype.setMaxListeners = function setMaxListeners() {
  return this;
};

//
// Expose the prefix.
//
EventEmitter.prefixed = prefix;

//
// Expose the module.
//
if ('undefined' !== typeof module) {
  module.exports = EventEmitter;
}

},{}],13:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],14:[function(require,module,exports){
(function(root, factory) {
  if (typeof define === 'function' && define.amd && define.amd.dust === true) {
    define(['dust.core'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('dustjs-linkedin'));
  } else {
    factory(root.dust);
  }
}(this, function(dust) {

function log(helper, msg, level) {
  level = level || "INFO";
  helper = helper ? '{@' + helper + '}: ' : '';
  dust.log(helper + msg, level);
}

var _deprecatedCache = {};
function _deprecated(target) {
  if(_deprecatedCache[target]) { return; }
  log(target, "Deprecation warning: " + target + " is deprecated and will be removed in a future version of dustjs-helpers", "WARN");
  log(null, "For help and a deprecation timeline, see https://github.com/linkedin/dustjs-helpers/wiki/Deprecated-Features#" + target.replace(/\W+/g, ""), "WARN");
  _deprecatedCache[target] = true;
}

function isSelect(context) {
  return context.stack.tail &&
         context.stack.tail.head &&
         typeof context.stack.tail.head.__select__ !== "undefined";
}

function getSelectState(context) {
  return isSelect(context) && context.get('__select__');
}

/**
 * Adds a special __select__ key behind the head of the context stack. Used to maintain the state
 * of {@select} blocks
 * @param context {Context} add state to this Context
 * @param opts {Object} add these properties to the state (`key` and `type`)
 */
function addSelectState(context, opts) {
  var head = context.stack.head,
      newContext = context.rebase(),
      key;

  if(context.stack && context.stack.tail) {
    newContext.stack = context.stack.tail;
  }

  var state = {
    isPending: false,
    isResolved: false,
    isDeferredComplete: false,
    deferreds: []
  };

  for(key in opts) {
    state[key] = opts[key];
  }

  return newContext
  .push({ "__select__": state })
  .push(head, context.stack.index, context.stack.of);
}

/**
 * After a {@select} or {@math} block is complete, they invoke this function
 */
function resolveSelectDeferreds(state) {
  var x, len;
  state.isDeferredPending = true;
  if(state.deferreds.length) {
    state.isDeferredComplete = true;
    for(x=0, len=state.deferreds.length; x<len; x++) {
      state.deferreds[x]();
    }
  }
  state.isDeferredPending = false;
}

/**
 * Used by {@contextDump}
 */
function jsonFilter(key, value) {
  if (typeof value === "function") {
    return value.toString()
      .replace(/(^\s+|\s+$)/mg, '')
      .replace(/\n/mg, '')
      .replace(/,\s*/mg, ', ')
      .replace(/\)\{/mg, ') {');
  }
  return value;
}

/**
 * Generate a truth test helper
 */
function truthTest(name, test) {
  return function(chunk, context, bodies, params) {
    return filter(chunk, context, bodies, params, name, test);
  };
}

/**
 * This function is invoked by truth test helpers
 */
function filter(chunk, context, bodies, params, helperName, test) {
  var body = bodies.block,
      skip = bodies['else'],
      selectState = getSelectState(context) || {},
      willResolve, key, value, type;

  // Once one truth test in a select passes, short-circuit the rest of the tests
  if (selectState.isResolved && !selectState.isDeferredPending) {
    return chunk;
  }

  // First check for a key on the helper itself, then look for a key on the {@select}
  if (params.hasOwnProperty('key')) {
    key = params.key;
  } else if (selectState.hasOwnProperty('key')) {
    key = selectState.key;
  } else {
    log(helperName, "No key specified", "WARN");
    return chunk;
  }

  type = params.type || selectState.type;

  key = coerce(context.resolve(key), type);
  value = coerce(context.resolve(params.value), type);

  if (test(key, value)) {
    // Once a truth test passes, put the select into "pending" state. Now we can render the body of
    // the truth test (which may contain truth tests) without altering the state of the select.
    if (!selectState.isPending) {
      willResolve = true;
      selectState.isPending = true;
    }
    if (body) {
      chunk = chunk.render(body, context);
    }
    if (willResolve) {
      selectState.isResolved = true;
    }
  } else if (skip) {
    chunk = chunk.render(skip, context);
  }
  return chunk;
}

function coerce(value, type) {
  if (type) {
    type = type.toLowerCase();
  }
  switch (type) {
    case 'number': return +value;
    case 'string': return String(value);
    case 'boolean':
      value = (value === 'false' ? false : value);
      return Boolean(value);
    case 'date': return new Date(value);
  }

  return value;
}

var helpers = {

  // Utility helping to resolve dust references in the given chunk
  // uses native Dust Context#resolve (available since Dust 2.6.2)
  "tap": function(input, chunk, context) {
    // deprecated for removal in 1.8
    _deprecated("tap");
    return context.resolve(input);
  },

  "sep": function(chunk, context, bodies) {
    var body = bodies.block;
    if (context.stack.index === context.stack.of - 1) {
      return chunk;
    }
    if (body) {
      return body(chunk, context);
    } else {
      return chunk;
    }
  },

  "first": function(chunk, context, bodies) {
    if (context.stack.index === 0) {
      return bodies.block(chunk, context);
    }
    return chunk;
  },

  "last": function(chunk, context, bodies) {
    if (context.stack.index === context.stack.of - 1) {
      return bodies.block(chunk, context);
    }
    return chunk;
  },

  /**
   * {@contextDump}
   * @param key {String} set to "full" to the full context stack, otherwise the current context is dumped
   * @param to {String} set to "console" to log to console, otherwise outputs to the chunk
   */
  "contextDump": function(chunk, context, bodies, params) {
    var to = context.resolve(params.to),
        key = context.resolve(params.key),
        target, output;
    switch(key) {
      case 'full':
        target = context.stack;
        break;
      default:
        target = context.stack.head;
    }
    output = JSON.stringify(target, jsonFilter, 2);
    switch(to) {
      case 'console':
        log('contextDump', output);
        break;
      default:
        output = output.replace(/</g, '\\u003c');
        chunk = chunk.write(output);
    }
    return chunk;
  },

  /**
   * {@math}
   * @param key first value
   * @param method {String} operation to perform
   * @param operand second value (not required for operations like `abs`)
   * @param round if truthy, round() the result
   */
  "math": function (chunk, context, bodies, params) {
    var key = params.key,
        method = params.method,
        operand = params.operand,
        round = params.round,
        output, state, x, len;

    if(!params.hasOwnProperty('key') || !params.method) {
      log("math", "`key` or `method` was not provided", "ERROR");
      return chunk;
    }

    key = parseFloat(context.resolve(key));
    operand = parseFloat(context.resolve(operand));

    switch(method) {
      case "mod":
        if(operand === 0) {
          log("math", "Division by 0", "ERROR");
        }
        output = key % operand;
        break;
      case "add":
        output = key + operand;
        break;
      case "subtract":
        output = key - operand;
        break;
      case "multiply":
        output = key * operand;
        break;
      case "divide":
        if(operand === 0) {
          log("math", "Division by 0", "ERROR");
        }
        output = key / operand;
        break;
      case "ceil":
      case "floor":
      case "round":
      case "abs":
        output = Math[method](key);
        break;
      case "toint":
        output = parseInt(key, 10);
        break;
      default:
        log("math", "Method `" + method + "` is not supported", "ERROR");
    }

    if (typeof output !== 'undefined') {
      if (round) {
        output = Math.round(output);
      }
      if (bodies && bodies.block) {
        context = addSelectState(context, { key: output });
        chunk = chunk.render(bodies.block, context);
        resolveSelectDeferreds(getSelectState(context));
      } else {
        chunk = chunk.write(output);
      }
    }

    return chunk;
  },

  /**
   * {@select}
   * Groups a set of truth tests and outputs the first one that passes.
   * Also contains {@any} and {@none} blocks.
   * @param key a value or reference to use as the left-hand side of comparisons
   * @param type coerce all truth test keys without an explicit type to this type
   */
  "select": function(chunk, context, bodies, params) {
    var body = bodies.block,
        state = {};

    if (params.hasOwnProperty('key')) {
      state.key = context.resolve(params.key);
    }
    if (params.hasOwnProperty('type')) {
      state.type = params.type;
    }

    if (body) {
      context = addSelectState(context, state);
      chunk = chunk.render(body, context);
      resolveSelectDeferreds(getSelectState(context));
    } else {
      log("select", "Missing body block", "WARN");
    }
    return chunk;
  },

  /**
   * Truth test helpers
   * @param key a value or reference to use as the left-hand side of comparisons
   * @param value a value or reference to use as the right-hand side of comparisons
   * @param type if specified, `key` and `value` will be forcibly cast to this type
   */
  "eq": truthTest('eq', function(left, right) {
    return left === right;
  }),
  "ne": truthTest('ne', function(left, right) {
    return left !== right;
  }),
  "lt": truthTest('lt', function(left, right) {
    return left < right;
  }),
  "lte": truthTest('lte', function(left, right) {
    return left <= right;
  }),
  "gt": truthTest('gt', function(left, right) {
    return left > right;
  }),
  "gte": truthTest('gte', function(left, right) {
    return left >= right;
  }),

  /**
   * {@any}
   * Outputs as long as at least one truth test inside a {@select} has passed.
   * Must be contained inside a {@select} block.
   * The passing truth test can be before or after the {@any} block.
   */
  "any": function(chunk, context, bodies, params) {
    var selectState = getSelectState(context);

    if(!selectState) {
      log("any", "Must be used inside a {@select} block", "ERROR");
    } else {
      if(selectState.isDeferredComplete) {
        log("any", "Must not be nested inside {@any} or {@none} block", "ERROR");
      } else {
        chunk = chunk.map(function(chunk) {
          selectState.deferreds.push(function() {
            if(selectState.isResolved) {
              chunk = chunk.render(bodies.block, context);
            }
            chunk.end();
          });
        });
      }
    }
    return chunk;
  },

  /**
   * {@none}
   * Outputs if no truth tests inside a {@select} pass.
   * Must be contained inside a {@select} block.
   * The position of the helper does not matter.
   */
  "none": function(chunk, context, bodies, params) {
    var selectState = getSelectState(context);

    if(!selectState) {
      log("none", "Must be used inside a {@select} block", "ERROR");
    } else {
      if(selectState.isDeferredComplete) {
        log("none", "Must not be nested inside {@any} or {@none} block", "ERROR");
      } else {
        chunk = chunk.map(function(chunk) {
          selectState.deferreds.push(function() {
            if(!selectState.isResolved) {
              chunk = chunk.render(bodies.block, context);
            }
            chunk.end();
          });
        });
      }
    }
    return chunk;
  },

  /**
  * {@size}
  * Write the size of the target to the chunk
  * Falsy values and true have size 0
  * Numbers are returned as-is
  * Arrays and Strings have size equal to their length
  * Objects have size equal to the number of keys they contain
  * Dust bodies are evaluated and the length of the string is returned
  * Functions are evaluated and the length of their return value is evaluated
  * @param key find the size of this value or reference
  */
  "size": function(chunk, context, bodies, params) {
    var key = params.key,
        value, k;

    key = context.resolve(params.key);
    if (!key || key === true) {
      value = 0;
    } else if(dust.isArray(key)) {
      value = key.length;
    } else if (!isNaN(parseFloat(key)) && isFinite(key)) {
      value = key;
    } else if (typeof key === "object") {
      value = 0;
      for(k in key){
        if(key.hasOwnProperty(k)){
          value++;
        }
      }
    } else {
      value = (key + '').length;
    }
    return chunk.write(value);
  }

};

for(var key in helpers) {
  dust.helpers[key] = helpers[key];
}

return dust;

}));

},{"dustjs-linkedin":15}],15:[function(require,module,exports){
(function (process){
(function (root, factory) {
  if (typeof define === 'function' && define.amd && define.amd.dust === true) {
    define('dust.core', [], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.dust = factory();
  }
}(this, function() {
  var dust = {
        "version": "2.7.2"
      },
      NONE = 'NONE', ERROR = 'ERROR', WARN = 'WARN', INFO = 'INFO', DEBUG = 'DEBUG',
      EMPTY_FUNC = function() {};

  dust.config = {
    whitespace: false,
    amd: false,
    cjs: false,
    cache: true
  };

  // Directive aliases to minify code
  dust._aliases = {
    "write": "w",
    "end": "e",
    "map": "m",
    "render": "r",
    "reference": "f",
    "section": "s",
    "exists": "x",
    "notexists": "nx",
    "block": "b",
    "partial": "p",
    "helper": "h"
  };

  (function initLogging() {
    /*global process, console*/
    var loggingLevels = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3, NONE: 4 },
        consoleLog,
        log;

    if (typeof console !== 'undefined' && console.log) {
      consoleLog = console.log;
      if(typeof consoleLog === 'function') {
        log = function() {
          consoleLog.apply(console, arguments);
        };
      } else {
        log = function() {
          consoleLog(Array.prototype.slice.apply(arguments).join(' '));
        };
      }
    } else {
      log = EMPTY_FUNC;
    }

    /**
     * Filters messages based on `dust.debugLevel`.
     * This default implementation will print to the console if it exists.
     * @param {String|Error} message the message to print/throw
     * @param {String} type the severity of the message(ERROR, WARN, INFO, or DEBUG)
     * @public
     */
    dust.log = function(message, type) {
      type = type || INFO;
      if (loggingLevels[type] >= loggingLevels[dust.debugLevel]) {
        log('[DUST:' + type + ']', message);
      }
    };

    dust.debugLevel = NONE;
    if(typeof process !== 'undefined' && process.env && /\bdust\b/.test(process.env.DEBUG)) {
      dust.debugLevel = DEBUG;
    }

  }());

  dust.helpers = {};

  dust.cache = {};

  dust.register = function(name, tmpl) {
    if (!name) {
      return;
    }
    tmpl.templateName = name;
    if (dust.config.cache !== false) {
      dust.cache[name] = tmpl;
    }
  };

  dust.render = function(nameOrTemplate, context, callback) {
    var chunk = new Stub(callback).head;
    try {
      load(nameOrTemplate, chunk, context).end();
    } catch (err) {
      chunk.setError(err);
    }
  };

  dust.stream = function(nameOrTemplate, context) {
    var stream = new Stream(),
        chunk = stream.head;
    dust.nextTick(function() {
      try {
        load(nameOrTemplate, chunk, context).end();
      } catch (err) {
        chunk.setError(err);
      }
    });
    return stream;
  };

  /**
   * Extracts a template function (body_0) from whatever is passed.
   * @param nameOrTemplate {*} Could be:
   *   - the name of a template to load from cache
   *   - a CommonJS-compiled template (a function with a `template` property)
   *   - a template function
   * @param loadFromCache {Boolean} if false, don't look in the cache
   * @return {Function} a template function, if found
   */
  function getTemplate(nameOrTemplate, loadFromCache/*=true*/) {
    if(!nameOrTemplate) {
      return;
    }
    if(typeof nameOrTemplate === 'function' && nameOrTemplate.template) {
      // Sugar away CommonJS module templates
      return nameOrTemplate.template;
    }
    if(dust.isTemplateFn(nameOrTemplate)) {
      // Template functions passed directly
      return nameOrTemplate;
    }
    if(loadFromCache !== false) {
      // Try loading a template with this name from cache
      return dust.cache[nameOrTemplate];
    }
  }

  function load(nameOrTemplate, chunk, context) {
    if(!nameOrTemplate) {
      return chunk.setError(new Error('No template or template name provided to render'));
    }

    var template = getTemplate(nameOrTemplate, dust.config.cache);

    if (template) {
      return template(chunk, Context.wrap(context, template.templateName));
    } else {
      if (dust.onLoad) {
        return chunk.map(function(chunk) {
          // Alias just so it's easier to read that this would always be a name
          var name = nameOrTemplate;
          // Three possible scenarios for a successful callback:
          //   - `require(nameOrTemplate)(dust); cb()`
          //   - `src = readFile('src.dust'); cb(null, src)`
          //   - `compiledTemplate = require(nameOrTemplate)(dust); cb(null, compiledTemplate)`
          function done(err, srcOrTemplate) {
            var template;
            if (err) {
              return chunk.setError(err);
            }
            // Prefer a template that is passed via callback over the cached version.
            template = getTemplate(srcOrTemplate, false) || getTemplate(name, dust.config.cache);
            if (!template) {
              // It's a template string, compile it and register under `name`
              if(dust.compile) {
                template = dust.loadSource(dust.compile(srcOrTemplate, name));
              } else {
                return chunk.setError(new Error('Dust compiler not available'));
              }
            }
            template(chunk, Context.wrap(context, template.templateName)).end();
          }

          if(dust.onLoad.length === 3) {
            dust.onLoad(name, context.options, done);
          } else {
            dust.onLoad(name, done);
          }
        });
      }
      return chunk.setError(new Error('Template Not Found: ' + nameOrTemplate));
    }
  }

  dust.loadSource = function(source) {
    /*jshint evil:true*/
    return eval(source);
  };

  if (Array.isArray) {
    dust.isArray = Array.isArray;
  } else {
    dust.isArray = function(arr) {
      return Object.prototype.toString.call(arr) === '[object Array]';
    };
  }

  dust.nextTick = (function() {
    return function(callback) {
      setTimeout(callback, 0);
    };
  })();

  /**
   * Dust has its own rules for what is "empty"-- which is not the same as falsy.
   * Empty arrays, null, and undefined are empty
   */
  dust.isEmpty = function(value) {
    if (value === 0) {
      return false;
    }
    if (dust.isArray(value) && !value.length) {
      return true;
    }
    return !value;
  };

  dust.isEmptyObject = function(obj) {
    var key;
    if (obj === null) {
      return false;
    }
    if (obj === undefined) {
      return false;
    }
    if (obj.length > 0) {
      return false;
    }
    for (key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        return false;
      }
    }
    return true;
  };

  dust.isTemplateFn = function(elem) {
    return typeof elem === 'function' &&
           elem.__dustBody;
  };

  /**
   * Decide somewhat-naively if something is a Thenable.
   * @param elem {*} object to inspect
   * @return {Boolean} is `elem` a Thenable?
   */
  dust.isThenable = function(elem) {
    return elem &&
           typeof elem === 'object' &&
           typeof elem.then === 'function';
  };

  /**
   * Decide very naively if something is a Stream.
   * @param elem {*} object to inspect
   * @return {Boolean} is `elem` a Stream?
   */
  dust.isStreamable = function(elem) {
    return elem &&
           typeof elem.on === 'function' &&
           typeof elem.pipe === 'function';
  };

  // apply the filter chain and return the output string
  dust.filter = function(string, auto, filters, context) {
    var i, len, name, filter;
    if (filters) {
      for (i = 0, len = filters.length; i < len; i++) {
        name = filters[i];
        if (!name.length) {
          continue;
        }
        filter = dust.filters[name];
        if (name === 's') {
          auto = null;
        } else if (typeof filter === 'function') {
          string = filter(string, context);
        } else {
          dust.log('Invalid filter `' + name + '`', WARN);
        }
      }
    }
    // by default always apply the h filter, unless asked to unescape with |s
    if (auto) {
      string = dust.filters[auto](string, context);
    }
    return string;
  };

  dust.filters = {
    h: function(value) { return dust.escapeHtml(value); },
    j: function(value) { return dust.escapeJs(value); },
    u: encodeURI,
    uc: encodeURIComponent,
    js: function(value) { return dust.escapeJSON(value); },
    jp: function(value) {
      if (!JSON) {dust.log('JSON is undefined; could not parse `' + value + '`', WARN);
        return value;
      } else {
        return JSON.parse(value);
      }
    }
  };

  function Context(stack, global, options, blocks, templateName) {
    if(stack !== undefined && !(stack instanceof Stack)) {
      stack = new Stack(stack);
    }
    this.stack = stack;
    this.global = global;
    this.options = options;
    this.blocks = blocks;
    this.templateName = templateName;
  }

  dust.makeBase = dust.context = function(global, options) {
    return new Context(undefined, global, options);
  };

  /**
   * Factory function that creates a closure scope around a Thenable-callback.
   * Returns a function that can be passed to a Thenable that will resume a
   * Context lookup once the Thenable resolves with new data, adding that new
   * data to the lookup stack.
   */
  function getWithResolvedData(ctx, cur, down) {
    return function(data) {
      return ctx.push(data)._get(cur, down);
    };
  }

  Context.wrap = function(context, name) {
    if (context instanceof Context) {
      return context;
    }
    return new Context(context, {}, {}, null, name);
  };

  /**
   * Public API for getting a value from the context.
   * @method get
   * @param {string|array} path The path to the value. Supported formats are:
   * 'key'
   * 'path.to.key'
   * '.path.to.key'
   * ['path', 'to', 'key']
   * ['key']
   * @param {boolean} [cur=false] Boolean which determines if the search should be limited to the
   * current context (true), or if get should search in parent contexts as well (false).
   * @public
   * @returns {string|object}
   */
  Context.prototype.get = function(path, cur) {
    if (typeof path === 'string') {
      if (path[0] === '.') {
        cur = true;
        path = path.substr(1);
      }
      path = path.split('.');
    }
    return this._get(cur, path);
  };

  /**
   * Get a value from the context
   * @method _get
   * @param {boolean} cur Get only from the current context
   * @param {array} down An array of each step in the path
   * @private
   * @return {string | object}
   */
  Context.prototype._get = function(cur, down) {
    var ctx = this.stack || {},
        i = 1,
        value, first, len, ctxThis, fn;

    first = down[0];
    len = down.length;

    if (cur && len === 0) {
      ctxThis = ctx;
      ctx = ctx.head;
    } else {
      if (!cur) {
        // Search up the stack for the first value
        while (ctx) {
          if (ctx.isObject) {
            ctxThis = ctx.head;
            value = ctx.head[first];
            if (value !== undefined) {
              break;
            }
          }
          ctx = ctx.tail;
        }

        // Try looking in the global context if we haven't found anything yet
        if (value !== undefined) {
          ctx = value;
        } else {
          ctx = this.global && this.global[first];
        }
      } else if (ctx) {
        // if scope is limited by a leading dot, don't search up the tree
        if(ctx.head) {
          ctx = ctx.head[first];
        } else {
          // context's head is empty, value we are searching for is not defined
          ctx = undefined;
        }
      }

      while (ctx && i < len) {
        if (dust.isThenable(ctx)) {
          // Bail early by returning a Thenable for the remainder of the search tree
          return ctx.then(getWithResolvedData(this, cur, down.slice(i)));
        }
        ctxThis = ctx;
        ctx = ctx[down[i]];
        i++;
      }
    }

    if (typeof ctx === 'function') {
      fn = function() {
        try {
          return ctx.apply(ctxThis, arguments);
        } catch (err) {
          dust.log(err, ERROR);
          throw err;
        }
      };
      fn.__dustBody = !!ctx.__dustBody;
      return fn;
    } else {
      if (ctx === undefined) {
        dust.log('Cannot find reference `{' + down.join('.') + '}` in template `' + this.getTemplateName() + '`', INFO);
      }
      return ctx;
    }
  };

  Context.prototype.getPath = function(cur, down) {
    return this._get(cur, down);
  };

  Context.prototype.push = function(head, idx, len) {
    if(head === undefined) {
      dust.log("Not pushing an undefined variable onto the context", INFO);
      return this;
    }
    return this.rebase(new Stack(head, this.stack, idx, len));
  };

  Context.prototype.pop = function() {
    var head = this.current();
    this.stack = this.stack && this.stack.tail;
    return head;
  };

  Context.prototype.rebase = function(head) {
    return new Context(head, this.global, this.options, this.blocks, this.getTemplateName());
  };

  Context.prototype.clone = function() {
    var context = this.rebase();
    context.stack = this.stack;
    return context;
  };

  Context.prototype.current = function() {
    return this.stack && this.stack.head;
  };

  Context.prototype.getBlock = function(key) {
    var blocks, len, fn;

    if (typeof key === 'function') {
      key = key(new Chunk(), this).data.join('');
    }

    blocks = this.blocks;

    if (!blocks) {
      dust.log('No blocks for context `' + key + '` in template `' + this.getTemplateName() + '`', DEBUG);
      return false;
    }

    len = blocks.length;
    while (len--) {
      fn = blocks[len][key];
      if (fn) {
        return fn;
      }
    }

    dust.log('Malformed template `' + this.getTemplateName() + '` was missing one or more blocks.');
    return false;
  };

  Context.prototype.shiftBlocks = function(locals) {
    var blocks = this.blocks,
        newBlocks;

    if (locals) {
      if (!blocks) {
        newBlocks = [locals];
      } else {
        newBlocks = blocks.concat([locals]);
      }
      return new Context(this.stack, this.global, this.options, newBlocks, this.getTemplateName());
    }
    return this;
  };

  Context.prototype.resolve = function(body) {
    var chunk;

    if(typeof body !== 'function') {
      return body;
    }
    chunk = new Chunk().render(body, this);
    if(chunk instanceof Chunk) {
      return chunk.data.join(''); // ie7 perf
    }
    return chunk;
  };

  Context.prototype.getTemplateName = function() {
    return this.templateName;
  };

  function Stack(head, tail, idx, len) {
    this.tail = tail;
    this.isObject = head && typeof head === 'object';
    this.head = head;
    this.index = idx;
    this.of = len;
  }

  function Stub(callback) {
    this.head = new Chunk(this);
    this.callback = callback;
    this.out = '';
  }

  Stub.prototype.flush = function() {
    var chunk = this.head;

    while (chunk) {
      if (chunk.flushable) {
        this.out += chunk.data.join(''); //ie7 perf
      } else if (chunk.error) {
        this.callback(chunk.error);
        dust.log('Rendering failed with error `' + chunk.error + '`', ERROR);
        this.flush = EMPTY_FUNC;
        return;
      } else {
        return;
      }
      chunk = chunk.next;
      this.head = chunk;
    }
    this.callback(null, this.out);
  };

  /**
   * Creates an interface sort of like a Streams2 ReadableStream.
   */
  function Stream() {
    this.head = new Chunk(this);
  }

  Stream.prototype.flush = function() {
    var chunk = this.head;

    while(chunk) {
      if (chunk.flushable) {
        this.emit('data', chunk.data.join('')); //ie7 perf
      } else if (chunk.error) {
        this.emit('error', chunk.error);
        this.emit('end');
        dust.log('Streaming failed with error `' + chunk.error + '`', ERROR);
        this.flush = EMPTY_FUNC;
        return;
      } else {
        return;
      }
      chunk = chunk.next;
      this.head = chunk;
    }
    this.emit('end');
  };

  /**
   * Executes listeners for `type` by passing data. Note that this is different from a
   * Node stream, which can pass an arbitrary number of arguments
   * @return `true` if event had listeners, `false` otherwise
   */
  Stream.prototype.emit = function(type, data) {
    var events = this.events || {},
        handlers = events[type] || [],
        i, l;

    if (!handlers.length) {
      dust.log('Stream broadcasting, but no listeners for `' + type + '`', DEBUG);
      return false;
    }

    handlers = handlers.slice(0);
    for (i = 0, l = handlers.length; i < l; i++) {
      handlers[i](data);
    }
    return true;
  };

  Stream.prototype.on = function(type, callback) {
    var events = this.events = this.events || {},
        handlers = events[type] = events[type] || [];

    if(typeof callback !== 'function') {
      dust.log('No callback function provided for `' + type + '` event listener', WARN);
    } else {
      handlers.push(callback);
    }
    return this;
  };

  /**
   * Pipes to a WritableStream. Note that backpressure isn't implemented,
   * so we just write as fast as we can.
   * @param stream {WritableStream}
   * @return self
   */
  Stream.prototype.pipe = function(stream) {
    if(typeof stream.write !== 'function' ||
       typeof stream.end !== 'function') {
      dust.log('Incompatible stream passed to `pipe`', WARN);
      return this;
    }

    var destEnded = false;

    if(typeof stream.emit === 'function') {
      stream.emit('pipe', this);
    }

    if(typeof stream.on === 'function') {
      stream.on('error', function() {
        destEnded = true;
      });
    }

    return this
    .on('data', function(data) {
      if(destEnded) {
        return;
      }
      try {
        stream.write(data, 'utf8');
      } catch (err) {
        dust.log(err, ERROR);
      }
    })
    .on('end', function() {
      if(destEnded) {
        return;
      }
      try {
        stream.end();
        destEnded = true;
      } catch (err) {
        dust.log(err, ERROR);
      }
    });
  };

  function Chunk(root, next, taps) {
    this.root = root;
    this.next = next;
    this.data = []; //ie7 perf
    this.flushable = false;
    this.taps = taps;
  }

  Chunk.prototype.write = function(data) {
    var taps = this.taps;

    if (taps) {
      data = taps.go(data);
    }
    this.data.push(data);
    return this;
  };

  Chunk.prototype.end = function(data) {
    if (data) {
      this.write(data);
    }
    this.flushable = true;
    this.root.flush();
    return this;
  };

  Chunk.prototype.map = function(callback) {
    var cursor = new Chunk(this.root, this.next, this.taps),
        branch = new Chunk(this.root, cursor, this.taps);

    this.next = branch;
    this.flushable = true;
    try {
      callback(branch);
    } catch(err) {
      dust.log(err, ERROR);
      branch.setError(err);
    }
    return cursor;
  };

  Chunk.prototype.tap = function(tap) {
    var taps = this.taps;

    if (taps) {
      this.taps = taps.push(tap);
    } else {
      this.taps = new Tap(tap);
    }
    return this;
  };

  Chunk.prototype.untap = function() {
    this.taps = this.taps.tail;
    return this;
  };

  Chunk.prototype.render = function(body, context) {
    return body(this, context);
  };

  Chunk.prototype.reference = function(elem, context, auto, filters) {
    if (typeof elem === 'function') {
      elem = elem.apply(context.current(), [this, context, null, {auto: auto, filters: filters}]);
      if (elem instanceof Chunk) {
        return elem;
      } else {
        return this.reference(elem, context, auto, filters);
      }
    }
    if (dust.isThenable(elem)) {
      return this.await(elem, context, null, auto, filters);
    } else if (dust.isStreamable(elem)) {
      return this.stream(elem, context, null, auto, filters);
    } else if (!dust.isEmpty(elem)) {
      return this.write(dust.filter(elem, auto, filters, context));
    } else {
      return this;
    }
  };

  Chunk.prototype.section = function(elem, context, bodies, params) {
    var body = bodies.block,
        skip = bodies['else'],
        chunk = this,
        i, len, head;

    if (typeof elem === 'function' && !dust.isTemplateFn(elem)) {
      try {
        elem = elem.apply(context.current(), [this, context, bodies, params]);
      } catch(err) {
        dust.log(err, ERROR);
        return this.setError(err);
      }
      // Functions that return chunks are assumed to have handled the chunk manually.
      // Make that chunk the current one and go to the next method in the chain.
      if (elem instanceof Chunk) {
        return elem;
      }
    }

    if (dust.isEmptyObject(bodies)) {
      // No bodies to render, and we've already invoked any function that was available in
      // hopes of returning a Chunk.
      return chunk;
    }

    if (!dust.isEmptyObject(params)) {
      context = context.push(params);
    }

    /*
    Dust's default behavior is to enumerate over the array elem, passing each object in the array to the block.
    When elem resolves to a value or object instead of an array, Dust sets the current context to the value
    and renders the block one time.
    */
    if (dust.isArray(elem)) {
      if (body) {
        len = elem.length;
        if (len > 0) {
          head = context.stack && context.stack.head || {};
          head.$len = len;
          for (i = 0; i < len; i++) {
            head.$idx = i;
            chunk = body(chunk, context.push(elem[i], i, len));
          }
          head.$idx = undefined;
          head.$len = undefined;
          return chunk;
        } else if (skip) {
          return skip(this, context);
        }
      }
    } else if (dust.isThenable(elem)) {
      return this.await(elem, context, bodies);
    } else if (dust.isStreamable(elem)) {
      return this.stream(elem, context, bodies);
    } else if (elem === true) {
     // true is truthy but does not change context
      if (body) {
        return body(this, context);
      }
    } else if (elem || elem === 0) {
       // everything that evaluates to true are truthy ( e.g. Non-empty strings and Empty objects are truthy. )
       // zero is truthy
       // for anonymous functions that did not returns a chunk, truthiness is evaluated based on the return value
      if (body) {
        return body(this, context.push(elem));
      }
     // nonexistent, scalar false value, scalar empty string, null,
     // undefined are all falsy
    } else if (skip) {
      return skip(this, context);
    }
    dust.log('Section without corresponding key in template `' + context.getTemplateName() + '`', DEBUG);
    return this;
  };

  Chunk.prototype.exists = function(elem, context, bodies) {
    var body = bodies.block,
        skip = bodies['else'];

    if (!dust.isEmpty(elem)) {
      if (body) {
        return body(this, context);
      }
      dust.log('No block for exists check in template `' + context.getTemplateName() + '`', DEBUG);
    } else if (skip) {
      return skip(this, context);
    }
    return this;
  };

  Chunk.prototype.notexists = function(elem, context, bodies) {
    var body = bodies.block,
        skip = bodies['else'];

    if (dust.isEmpty(elem)) {
      if (body) {
        return body(this, context);
      }
      dust.log('No block for not-exists check in template `' + context.getTemplateName() + '`', DEBUG);
    } else if (skip) {
      return skip(this, context);
    }
    return this;
  };

  Chunk.prototype.block = function(elem, context, bodies) {
    var body = elem || bodies.block;

    if (body) {
      return body(this, context);
    }
    return this;
  };

  Chunk.prototype.partial = function(elem, context, partialContext, params) {
    var head;

    if(params === undefined) {
      // Compatibility for < 2.7.0 where `partialContext` did not exist
      params = partialContext;
      partialContext = context;
    }

    if (!dust.isEmptyObject(params)) {
      partialContext = partialContext.clone();
      head = partialContext.pop();
      partialContext = partialContext.push(params)
                                     .push(head);
    }

    if (dust.isTemplateFn(elem)) {
      // The eventual result of evaluating `elem` is a partial name
      // Load the partial after getting its name and end the async chunk
      return this.capture(elem, context, function(name, chunk) {
        partialContext.templateName = name;
        load(name, chunk, partialContext).end();
      });
    } else {
      partialContext.templateName = elem;
      return load(elem, this, partialContext);
    }
  };

  Chunk.prototype.helper = function(name, context, bodies, params, auto) {
    var chunk = this,
        filters = params.filters,
        ret;

    // Pre-2.7.1 compat: if auto is undefined, it's an old template. Automatically escape
    if (auto === undefined) {
      auto = 'h';
    }

    // handle invalid helpers, similar to invalid filters
    if(dust.helpers[name]) {
      try {
        ret = dust.helpers[name](chunk, context, bodies, params);
        if (ret instanceof Chunk) {
          return ret;
        }
        if(typeof filters === 'string') {
          filters = filters.split('|');
        }
        if (!dust.isEmptyObject(bodies)) {
          return chunk.section(ret, context, bodies, params);
        }
        // Helpers act slightly differently from functions in context in that they will act as
        // a reference if they are self-closing (due to grammar limitations)
        // In the Chunk.await function we check to make sure bodies is null before acting as a reference
        return chunk.reference(ret, context, auto, filters);
      } catch(err) {
        dust.log('Error in helper `' + name + '`: ' + err.message, ERROR);
        return chunk.setError(err);
      }
    } else {
      dust.log('Helper `' + name + '` does not exist', WARN);
      return chunk;
    }
  };

  /**
   * Reserve a chunk to be evaluated once a thenable is resolved or rejected
   * @param thenable {Thenable} the target thenable to await
   * @param context {Context} context to use to render the deferred chunk
   * @param bodies {Object} must contain a "body", may contain an "error"
   * @param auto {String} automatically apply this filter if the Thenable is a reference
   * @param filters {Array} apply these filters if the Thenable is a reference
   * @return {Chunk}
   */
  Chunk.prototype.await = function(thenable, context, bodies, auto, filters) {
    return this.map(function(chunk) {
      thenable.then(function(data) {
        if (bodies) {
          chunk = chunk.section(data, context, bodies);
        } else {
          // Actually a reference. Self-closing sections don't render
          chunk = chunk.reference(data, context, auto, filters);
        }
        chunk.end();
      }, function(err) {
        var errorBody = bodies && bodies.error;
        if(errorBody) {
          chunk.render(errorBody, context.push(err)).end();
        } else {
          dust.log('Unhandled promise rejection in `' + context.getTemplateName() + '`', INFO);
          chunk.end();
        }
      });
    });
  };

  /**
   * Reserve a chunk to be evaluated with the contents of a streamable.
   * Currently an error event will bomb out the stream. Once an error
   * is received, we push it to an {:error} block if one exists, and log otherwise,
   * then stop listening to the stream.
   * @param streamable {Streamable} the target streamable that will emit events
   * @param context {Context} context to use to render each thunk
   * @param bodies {Object} must contain a "body", may contain an "error"
   * @return {Chunk}
   */
  Chunk.prototype.stream = function(stream, context, bodies, auto, filters) {
    var body = bodies && bodies.block,
        errorBody = bodies && bodies.error;
    return this.map(function(chunk) {
      var ended = false;
      stream
        .on('data', function data(thunk) {
          if(ended) {
            return;
          }
          if(body) {
            // Fork a new chunk out of the blockstream so that we can flush it independently
            chunk = chunk.map(function(chunk) {
              chunk.render(body, context.push(thunk)).end();
            });
          } else if(!bodies) {
            // When actually a reference, don't fork, just write into the master async chunk
            chunk = chunk.reference(thunk, context, auto, filters);
          }
        })
        .on('error', function error(err) {
          if(ended) {
            return;
          }
          if(errorBody) {
            chunk.render(errorBody, context.push(err));
          } else {
            dust.log('Unhandled stream error in `' + context.getTemplateName() + '`', INFO);
          }
          if(!ended) {
            ended = true;
            chunk.end();
          }
        })
        .on('end', function end() {
          if(!ended) {
            ended = true;
            chunk.end();
          }
        });
    });
  };

  Chunk.prototype.capture = function(body, context, callback) {
    return this.map(function(chunk) {
      var stub = new Stub(function(err, out) {
        if (err) {
          chunk.setError(err);
        } else {
          callback(out, chunk);
        }
      });
      body(stub.head, context).end();
    });
  };

  Chunk.prototype.setError = function(err) {
    this.error = err;
    this.root.flush();
    return this;
  };

  // Chunk aliases
  for(var f in Chunk.prototype) {
    if(dust._aliases[f]) {
      Chunk.prototype[dust._aliases[f]] = Chunk.prototype[f];
    }
  }

  function Tap(head, tail) {
    this.head = head;
    this.tail = tail;
  }

  Tap.prototype.push = function(tap) {
    return new Tap(tap, this);
  };

  Tap.prototype.go = function(value) {
    var tap = this;

    while(tap) {
      value = tap.head(value);
      tap = tap.tail;
    }
    return value;
  };

  var HCHARS = /[&<>"']/,
      AMP    = /&/g,
      LT     = /</g,
      GT     = />/g,
      QUOT   = /\"/g,
      SQUOT  = /\'/g;

  dust.escapeHtml = function(s) {
    if (typeof s === "string" || (s && typeof s.toString === "function")) {
      if (typeof s !== "string") {
        s = s.toString();
      }
      if (!HCHARS.test(s)) {
        return s;
      }
      return s.replace(AMP,'&amp;').replace(LT,'&lt;').replace(GT,'&gt;').replace(QUOT,'&quot;').replace(SQUOT, '&#39;');
    }
    return s;
  };

  var BS = /\\/g,
      FS = /\//g,
      CR = /\r/g,
      LS = /\u2028/g,
      PS = /\u2029/g,
      NL = /\n/g,
      LF = /\f/g,
      SQ = /'/g,
      DQ = /"/g,
      TB = /\t/g;

  dust.escapeJs = function(s) {
    if (typeof s === 'string') {
      return s
        .replace(BS, '\\\\')
        .replace(FS, '\\/')
        .replace(DQ, '\\"')
        .replace(SQ, '\\\'')
        .replace(CR, '\\r')
        .replace(LS, '\\u2028')
        .replace(PS, '\\u2029')
        .replace(NL, '\\n')
        .replace(LF, '\\f')
        .replace(TB, '\\t');
    }
    return s;
  };

  dust.escapeJSON = function(o) {
    if (!JSON) {
      dust.log('JSON is undefined; could not escape `' + o + '`', WARN);
      return o;
    } else {
      return JSON.stringify(o)
        .replace(LS, '\\u2028')
        .replace(PS, '\\u2029')
        .replace(LT, '\\u003c');
    }
  };

  return dust;

}));

}).call(this,require('_process'))
},{"_process":2}],16:[function(require,module,exports){
var utils = require('./utils.js');

module.exports = function (helpers) {

  return {
    set: function (object, key, mapper, newStore) {

      object.__.currentMapping[object.__.path.slice().concat(key).join('')] = utils.copyObject(mapper);

      Object.keys(mapper.deps).forEach(function (dep) {
        var pathString = mapper.deps[dep].join('');
        helpers.depsOverview[pathString] = helpers.depsOverview[pathString] || [];
        helpers.depsOverview[pathString].push(object);
      });

      var value = mapper.value;
      var cachedGet = undefined;
      var currentDeps = null;
      var currentStore = helpers.currentStore;
      var getDeps = function () {
        return Object.keys(mapper.deps).reduce(function (deps, key) {
          deps[key] = utils.getByPath(helpers.currentStore, mapper.deps[key]);
          return deps;
        }, {});
      };
      var hasChanged = function () {
        var deps = getDeps();
        return !utils.isSame(deps, currentDeps);
      };
      // Grab dep values and create a change checker.
      // When getter runs decide if

      Object.defineProperty(object, key, {
        get: function () {

          if (newStore) {
            helpers.currentStore = newStore;
          }

          if (currentStore !== helpers.currentStore && currentDeps && hasChanged()) {
            currentDeps = getDeps();
            cachedGet = utils.makeImmutable(mapper.get(value, currentDeps));
            return cachedGet;
          }

          if (currentDeps && hasChanged()) {
            cachedGet = utils.makeImmutable(mapper.get(value, currentDeps));
            return cachedGet;
          } else if (currentDeps && cachedGet !== undefined) {
            return cachedGet;
          } else {
            currentDeps = getDeps();
            cachedGet = utils.makeImmutable(mapper.get(value, currentDeps));
            return cachedGet;
          }
        },
        set: function (newValue) {
          value = newValue;
          mapper.value = newValue;
        },
        enumerable: true,
        configurable: true
      });
    },
    get: function (object, key) {
      return helpers.currentStore.__.currentMapping[object.__.path.slice().concat(key).join('')];
    }
  }

};

},{"./utils.js":20}],17:[function(require,module,exports){
'use strict';
var StoreArray = require('./StoreArray.js');
var StoreObject = require('./StoreObject.js');
var Mapper = require('./Mapper.js');
var utils = require('./utils.js');

var unfreeze = function (value, helpers) {
  if (Array.isArray(value)) {
    return StoreArray(value, helpers);
  } else if (typeof value === 'object' && value !== null) {
    return StoreObject(value, helpers);
  } else {
    return value;
  }
};

var traverse = function (helpers, value) {

  if (Array.isArray(value) && !value.__) {
    var array = value.map(function (item, index) {
      helpers.currentPath.push(index);
      var obj = traverse(helpers, item);
      helpers.currentPath.pop();
      return obj;
    });
    var storeArray = StoreArray(array, helpers);
    Object.freeze(storeArray);
    return storeArray;
  } else if (typeof value === 'object' && value !== null && !value.__) {
    var object = Object.keys(value).reduce(function (object, key) {
      helpers.currentPath.push(key);
      object[key] = traverse(helpers, value[key]);
      helpers.currentPath.pop();
      return object;
    }, {});
    var storeObject = StoreObject(object, helpers);
    Object.freeze(storeObject);
    return storeObject;
  } else {
    return value;
  }
};

var updatePath = function (helpers, obj, cb) {

  helpers.currentPath = [];

  var path = obj.__.path;

  if (!path.length) {
    helpers.currentStore = obj;
  }

  // Unfreeze the store, ready for traversal
  var newStore = unfreeze(helpers.currentStore, helpers);
  var destination = newStore;

  // Go through path in need of update and unfreeze along the
  // way to update any props
  path.forEach(function (pathKey) {
    helpers.currentPath.push(pathKey);
    destination[pathKey] = unfreeze(destination[pathKey], helpers);
    destination = destination[pathKey];
  });

  // Run the update
  cb && cb(destination, helpers, traverse);


  // Get ready for new traversal to freeze all paths
  destination = newStore;
  path.forEach(function (pathKey) {
    destination = destination[pathKey];
    Object.freeze(destination);
    helpers.currentPath.pop();
  });

  // Make ready a new store and freeze it
  var store = StoreObject(newStore, helpers);

  Object.keys(newStore).forEach(function (key) {

    var propertyDescription = Object.getOwnPropertyDescriptor(newStore, key);
    if (propertyDescription && propertyDescription.get && propertyDescription.set) {
      Object.defineProperty(store, key, {
        get: function () {
          helpers.currentStore = this;
          return propertyDescription.get();
        }
      });

    } else {
      Object.defineProperty(store, key, {
        enumerable: true,
        get: function () {
          helpers.currentStore = this;
          return newStore[key];
        }
      });
    }

  });

  Object.defineProperty(store, 'export', {
    enumerable: false,
    value: function () {
      return utils.export(store, helpers.mapper);
    }
  });

  Object.defineProperty(store, 'import', {
    enumerable: false,
    value: function (obj) {
      return utils.import(obj, helpers, []);
    }
  });

  Object.freeze(store);
  return store;
};

var createStore = function (helpers, state) {
  var store = StoreObject({}, helpers);
  Object.keys(state).forEach(function (key) {
    helpers.currentPath.push(key);
    var branch = traverse(helpers, state[key]);
    helpers.currentPath.pop(key);

    if (typeof state[key] === 'function') {
      helpers.mapper.set(store, key, state[key](), store);
    } else {
      Object.defineProperty(store, key, {
        enumerable: true,
        get: function () {
          helpers.currentStore = this;
          return branch;
        }
      });
    }
  });

  Object.defineProperty(store, 'export', {
    enumerable: false,
    value: function () {
      return utils.export(store, helpers.mapper);
    }
  });

  Object.defineProperty(store, 'import', {
    enumerable: false,
    value: function (obj) {
      return utils.import(obj, helpers, []);
    }
  });

  Object.freeze(store);
  return store;
};

function Store(state) {

  if (!state || (typeof state !== 'object' || Array.isArray(state) || state === null)) {
    throw new Error('You have to pass an object to the store');
  }

  var helpers = {
    currentPath: [],
    currentStore: null,
    mapper: null,
    currentMapping: {},
    depsOverview: {},
    update: function (obj, cb) {
      helpers.currentMapping = utils.copyObject(helpers.currentMapping);

      // Go through each path that has a dep to this and update
      var pathString = obj.__.path.join('');
      if (helpers.depsOverview[pathString]) {
        helpers.depsOverview[pathString].forEach(function (dep) {
          helpers.currentStore = updatePath(helpers, dep);
        });
      }
      helpers.currentStore = updatePath(helpers, obj, cb);
      return helpers.currentStore;
    },
    updateMapping: function (path, key, value) {
      helpers.currentStore = updatePath(helpers, path, function (obj, helpers, traverse) {

        helpers.mapper.set(obj, key, helpers.mapper.get(obj, key));
        helpers.currentPath.push(key);
        obj[key] = value;
        helpers.currentPath.pop();

      });
      return helpers.currentStore;
    }
  };

  helpers.mapper = Mapper(helpers);
  helpers.currentStore = createStore(helpers, state);
  return helpers.currentStore;

}

module.exports = Store;

},{"./Mapper.js":16,"./StoreArray.js":18,"./StoreObject.js":19,"./utils.js":20}],18:[function(require,module,exports){
'use strict';
var utils = require('./utils.js');
var StoreArray = function () {

  function StoreArray(items) {
    var inst = Array.apply(Array);
    inst = inst.concat(items);
    inst.__proto__ = StoreArray.prototype;
    return inst;
  }
  StoreArray.prototype = Object.create(Array.prototype);
  StoreArray.prototype.push = function (item) {
    return this.__.update(this, function (obj, helpers, traverse) {
      helpers.currentPath.push(obj.length);
      Array.prototype.push.call(obj, traverse(helpers, item));
      helpers.currentPath.pop();
    });
  };
  StoreArray.prototype.splice = function () {
    var args = [].slice.call(arguments, 0);
    var startIndex = args.shift();
    var count = args.shift();
    return this.__.update(this, function (obj, helpers, traverse) {

      var additions = args.map(function (arg, index) {
        helpers.currentPath.push(startIndex + index);
        var addition = traverse(helpers, arg);
        helpers.currentPath.pop();
        return addition;
      });

      Array.prototype.splice.apply(obj, [startIndex, count].concat(additions));

      // Update paths
      for (var x = startIndex; x < obj.length; x++) {
        if (obj[x].__) {
          var path = obj[x].__.path;
          path[path.length - 1] = x;
        }
      }

    });
  };
  StoreArray.prototype.concat = function () {
    var args = [].slice.call(arguments, 0);
    return this.__.update(this, function (obj, helpers, traverse) {
      args.map(function (arg) {
        if (Array.isArray(arg)) {
          arg.map(function (deepArg) {
            helpers.currentPath.push(obj.length);
            Array.prototype.push.call(obj, traverse(helpers, deepArg));
            helpers.currentPath.pop();
          });
        } else {
          helpers.currentPath.push(obj.length);
          Array.prototype.push.call(obj, traverse(helpers, arg));
          helpers.currentPath.pop();
        }
      });
    });
  };
  StoreArray.prototype.unshift = function (item) {
    return this.__.update(this, function (obj, helpers, traverse) {
      Array.prototype.unshift.call(obj, traverse(helpers, item));

      // Update paths
      for (var x = 0; x < obj.length; x++) {
        if (obj[x].__) {
          var path = obj[x].__.path;
          path[path.length - 1] = x;
        }
      }

    });
  };
  StoreArray.prototype.shift = function () {
    return this.__.update(this, function (obj, helpers, traverse) {
      Array.prototype.shift.call(obj);

      // Update paths
      for (var x = 0; x < obj.length; x++) {
        if (obj[x].__) {
          var path = obj[x].__.path;
          path[path.length - 1] = x;
        }
      }

    });
  };
  StoreArray.prototype.pop = function () {
    return this.__.update(this, function (obj) {
      Array.prototype.pop.call(obj);
    });
  };
  StoreArray.prototype.toJS = function () {
    return utils.toJS(this);
  };

  return function (items, helpers) {
    var array = new StoreArray(items);
    Object.defineProperty(array, '__', {
      value: {
        path: helpers.currentPath.slice(0),
        update: helpers.update
      }
    });
    return array;
  };

};

module.exports = StoreArray();

},{"./utils.js":20}],19:[function(require,module,exports){
'use strict';
var utils = require('./utils.js');
var Mapper = require('./Mapper.js');

var StoreObject = function () {

  var StoreObjectProto = {
    set: function (key, value) {

      return this.__.update(this, function (obj, helpers, traverse) {

        // If an array is set there might be immutable objects in it that needs
        // a path update
        if (Array.isArray(value)) {
          value.forEach(function (item, index) {
            if (item.__) {
              item.__.path[item.__.path.length - 1] = index;
            }
          });
        }

        helpers.currentPath.push(key);
        obj[key] = traverse(helpers, value);
        helpers.currentPath.pop();
      });

    },
    toJS: function () {
      return utils.toJS(this);
    },
    merge: function (mergeObj) {
      if (Array.isArray(mergeObj) || typeof mergeObj !== 'object' || mergeObj === null) {
        throw new Error('You have to pass an object to the merge method');
      }
      return this.__.update(this, function (obj, helpers, traverse) {
        Object.keys(mergeObj).forEach(function (key) {
          helpers.currentPath.push(key);
          obj[key] = traverse(helpers, mergeObj[key]);
          helpers.currentPath.pop();
        });
      });
    },
    unset: function(key) {
      return this.__.update(this, function (obj) {
        delete obj[key];
      });
    }
  };

  return function (props, helpers) {
    var object = Object.create(StoreObjectProto);

    Object.defineProperty(object, '__', {
      value: {
        path: helpers.currentPath.slice(0),
        update: helpers.update,
        updateMapping: helpers.updateMapping,
        currentMapping: helpers.currentMapping
      }
    });

    Object.keys(props).forEach(function (key) {

      // If already is a mapping, reset it with new value
      var propertyDescription = Object.getOwnPropertyDescriptor(props, key);
      if (propertyDescription && propertyDescription.get && propertyDescription.set) {
        helpers.mapper.set(object, key, helpers.mapper.get(object, key));
      } else if (typeof props[key] === 'function') {
        helpers.mapper.set(object, key, props[key]());
      } else {
        object[key] = props[key];
      }

    });
    return object;
  };

};

module.exports = StoreObject();

},{"./Mapper.js":16,"./utils.js":20}],20:[function(require,module,exports){
"use strict";
var utils = {
  toJS: function (obj) {
    if (obj instanceof Array) {
      return obj.map(function (obj) {
        return utils.toJS(obj);
      });
    } else if (typeof obj === 'object' && obj !== null) {
      return Object.keys(obj).reduce(function (newObj, key) {
        newObj[key] = utils.toJS(obj[key]);
        return newObj;
      }, {});
    } else {
      return obj;
    }
  },
  makeImmutable: function (obj) {
    if (obj instanceof Array) {
      var val = obj.map(function (obj) {
        return utils.makeImmutable(obj);
      });
      Object.defineProperty(val, 'toJS', {
        value: utils.toJS.bind(null, val)
      });
      Object.freeze(val);
      return val;
    } else if (typeof obj === 'object' && obj !== null) {
      var val = Object.keys(obj).reduce(function (newObj, key) {
        newObj[key] = utils.makeImmutable(obj[key]);
        return newObj;
      }, {});
      Object.defineProperty(val, 'toJS', {
        value: utils.toJS.bind(null, val)
      });
      Object.freeze(val);
      return val;
    } else {
      return obj;
    }
  },
  export: function (obj, mapping) {

    if (obj instanceof Array) {
      return obj.map(function (obj) {
        return utils.export(obj, mapping);
      });
    } else if (typeof obj === 'object' && obj !== null) {
      return Object.keys(obj).reduce(function (newObj, key) {

        if (obj.__ && mapping.get(obj, key)) {
          newObj[key] = mapping.get(obj, key).value;
        } else {
          newObj[key] = utils.export(obj[key], mapping);
        }
        return newObj;
      }, {});
    } else {
      return obj;
    }
  },
  import: function (obj, helpers, path) {
    return Object.keys(obj).reduce(function (store, key) {

      if (!(obj[key] instanceof Array) && typeof obj[key] === 'object' && obj[key] !== null && utils.getByPath(store, path)) {
        path.push(key);
        var result = utils.import(obj[key], helpers, path);
        path.pop();
        return result;
      } else {
        return utils.getByPath(store, path).set(key, obj[key]);
      }

    }, helpers.currentStore);

  },
  getByPath: function (obj, path) {
    return path.reduce(function (obj, key) {
      return obj[key];
    }, obj)
  },
  isSame: function (objA, objB) {
    return Object.keys(objA).reduce(function (isSame, key) {
      return isSame ? objA[key] === objB[key] : false;
    }, true);
  },
  copyObject: function (obj) {
    return Object.keys(obj).reduce(function (newObj, key) {
      newObj[key] = obj[key];
      return newObj;
    }, {});
  }
};

module.exports = utils;

},{}],21:[function(require,module,exports){
var escape = require('escape-html');
var propConfig = require('./property-config');
var types = propConfig.attributeTypes;
var properties = propConfig.properties;
var attributeNames = propConfig.attributeNames;

var prefixAttribute = memoizeString(function (name) {
  return escape(name) + '="';
});

module.exports = createAttribute;

/**
 * Create attribute string.
 *
 * @param {String} name The name of the property or attribute
 * @param {*} value The value
 * @param {Boolean} [isAttribute] Denotes whether `name` is an attribute.
 * @return {?String} Attribute string || null if not a valid property or custom attribute.
 */

function createAttribute(name, value, isAttribute) {
  if (properties.hasOwnProperty(name)) {
    if (shouldSkip(name, value)) return '';
    name = (attributeNames[name] || name).toLowerCase();
    var attrType = properties[name];
    // for BOOLEAN `value` only has to be truthy
    // for OVERLOADED_BOOLEAN `value` has to be === true
    if ((attrType === types.BOOLEAN) ||
        (attrType === types.OVERLOADED_BOOLEAN && value === true)) {
      return escape(name);
    }
    return prefixAttribute(name) + escape(value) + '"';
  } else if (isAttribute) {
    if (value == null) return '';
    return prefixAttribute(name) + escape(value) + '"';
  }
  // return null if `name` is neither a valid property nor an attribute
  return null;
}

/**
 * Should skip false boolean attributes.
 */

function shouldSkip(name, value) {
  var attrType = properties[name];
  return value == null ||
    (attrType === types.BOOLEAN && !value) ||
    (attrType === types.OVERLOADED_BOOLEAN && value === false);
}

/**
 * Memoizes the return value of a function that accepts one string argument.
 *
 * @param {function} callback
 * @return {function}
 */

function memoizeString(callback) {
  var cache = {};
  return function(string) {
    if (cache.hasOwnProperty(string)) {
      return cache[string];
    } else {
      return cache[string] = callback.call(this, string);
    }
  };
}
},{"./property-config":31,"escape-html":23}],22:[function(require,module,exports){
var escape = require('escape-html');
var extend = require('xtend');
var isVNode = require('virtual-dom/vnode/is-vnode');
var isVText = require('virtual-dom/vnode/is-vtext');
var isThunk = require('virtual-dom/vnode/is-thunk');
var isWidget = require('virtual-dom/vnode/is-widget');
var softHook = require('virtual-dom/virtual-hyperscript/hooks/soft-set-hook');
var attrHook = require('virtual-dom/virtual-hyperscript/hooks/attribute-hook');
var paramCase = require('param-case');
var createAttribute = require('./create-attribute');
var voidElements = require('./void-elements');

module.exports = toHTML;

function toHTML(node, parent) {
  if (!node) return '';

  if (isThunk(node)) {
    node = node.render();
  }

  if (isWidget(node) && node.render) {
    node = node.render();
  }

  if (isVNode(node)) {
    return openTag(node) + tagContent(node) + closeTag(node);
  } else if (isVText(node)) {
    if (parent && parent.tagName.toLowerCase() === 'script') return String(node.text);
    return escape(String(node.text));
  }

  return '';
}

function openTag(node) {
  var props = node.properties;
  var ret = '<' + node.tagName.toLowerCase();

  for (var name in props) {
    var value = props[name];
    if (value == null) continue;

    if (name == 'attributes') {
      value = extend({}, value);
      for (var attrProp in value) {
        ret += ' ' + createAttribute(attrProp, value[attrProp], true);
      }
      continue;
    }

    if (name == 'style') {
      var css = '';
      value = extend({}, value);
      for (var styleProp in value) {
        css += paramCase(styleProp) + ': ' + value[styleProp] + '; ';
      }
      value = css.trim();
    }

    if (value instanceof softHook || value instanceof attrHook) {
      ret += ' ' + createAttribute(name, value.value, true);
      continue;
    }

    var attr = createAttribute(name, value);
    if (attr) ret += ' ' + attr;
  }

  return ret + '>';
}

function tagContent(node) {
  var innerHTML = node.properties.innerHTML;
  if (innerHTML != null) return innerHTML;
  else {
    var ret = '';
    if (node.children && node.children.length) {
      for (var i = 0, l = node.children.length; i<l; i++) {
        var child = node.children[i];
        ret += toHTML(child, node);
      }
    }
    return ret;
  }
}

function closeTag(node) {
  var tag = node.tagName.toLowerCase();
  return voidElements[tag] ? '' : '</' + tag + '>';
}
},{"./create-attribute":21,"./void-elements":32,"escape-html":23,"param-case":29,"virtual-dom/virtual-hyperscript/hooks/attribute-hook":50,"virtual-dom/virtual-hyperscript/hooks/soft-set-hook":52,"virtual-dom/vnode/is-thunk":56,"virtual-dom/vnode/is-vnode":58,"virtual-dom/vnode/is-vtext":59,"virtual-dom/vnode/is-widget":60,"xtend":30}],23:[function(require,module,exports){
/*!
 * escape-html
 * Copyright(c) 2012-2013 TJ Holowaychuk
 * MIT Licensed
 */

/**
 * Module exports.
 * @public
 */

module.exports = escapeHtml;

/**
 * Escape special characters in the given string of html.
 *
 * @param  {string} str The string to escape for inserting into HTML
 * @return {string}
 * @public
 */

function escapeHtml(html) {
  return String(html)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

},{}],24:[function(require,module,exports){
/**
 * Special language-specific overrides.
 *
 * Source: ftp://ftp.unicode.org/Public/UCD/latest/ucd/SpecialCasing.txt
 *
 * @type {Object}
 */
var LANGUAGES = {
  tr: {
    regexp: /\u0130|\u0049|\u0049\u0307/g,
    map: {
      '\u0130': '\u0069',
      '\u0049': '\u0131',
      '\u0049\u0307': '\u0069'
    }
  },
  az: {
    regexp: /[\u0130]/g,
    map: {
      '\u0130': '\u0069',
      '\u0049': '\u0131',
      '\u0049\u0307': '\u0069'
    }
  },
  lt: {
    regexp: /[\u0049\u004A\u012E\u00CC\u00CD\u0128]/g,
    map: {
      '\u0049': '\u0069\u0307',
      '\u004A': '\u006A\u0307',
      '\u012E': '\u012F\u0307',
      '\u00CC': '\u0069\u0307\u0300',
      '\u00CD': '\u0069\u0307\u0301',
      '\u0128': '\u0069\u0307\u0303'
    }
  }
}

/**
 * Lowercase a string.
 *
 * @param  {String} str
 * @return {String}
 */
module.exports = function (str, locale) {
  var lang = LANGUAGES[locale]

  str = str == null ? '' : String(str)

  if (lang) {
    str = str.replace(lang.regexp, function (m) { return lang.map[m] })
  }

  return str.toLowerCase()
}

},{}],25:[function(require,module,exports){
var lowerCase = require('lower-case')

var NON_WORD_REGEXP = require('./vendor/non-word-regexp')
var CAMEL_CASE_REGEXP = require('./vendor/camel-case-regexp')
var TRAILING_DIGIT_REGEXP = require('./vendor/trailing-digit-regexp')

/**
 * Sentence case a string.
 *
 * @param  {String} str
 * @param  {String} locale
 * @param  {String} replacement
 * @return {String}
 */
module.exports = function (str, locale, replacement) {
  if (str == null) {
    return ''
  }

  replacement = replacement || ' '

  function replace (match, index, string) {
    if (index === 0 || index === (string.length - match.length)) {
      return ''
    }

    return replacement
  }

  str = String(str)
    // Support camel case ("camelCase" -> "camel Case").
    .replace(CAMEL_CASE_REGEXP, '$1 $2')
    // Support digit groups ("test2012" -> "test 2012").
    .replace(TRAILING_DIGIT_REGEXP, '$1 $2')
    // Remove all non-word characters and replace with a single space.
    .replace(NON_WORD_REGEXP, replace)

  // Lower case the entire string.
  return lowerCase(str, locale)
}

},{"./vendor/camel-case-regexp":26,"./vendor/non-word-regexp":27,"./vendor/trailing-digit-regexp":28,"lower-case":24}],26:[function(require,module,exports){
module.exports = /([\u0061-\u007A\u00B5\u00DF-\u00F6\u00F8-\u00FF\u0101\u0103\u0105\u0107\u0109\u010B\u010D\u010F\u0111\u0113\u0115\u0117\u0119\u011B\u011D\u011F\u0121\u0123\u0125\u0127\u0129\u012B\u012D\u012F\u0131\u0133\u0135\u0137\u0138\u013A\u013C\u013E\u0140\u0142\u0144\u0146\u0148\u0149\u014B\u014D\u014F\u0151\u0153\u0155\u0157\u0159\u015B\u015D\u015F\u0161\u0163\u0165\u0167\u0169\u016B\u016D\u016F\u0171\u0173\u0175\u0177\u017A\u017C\u017E-\u0180\u0183\u0185\u0188\u018C\u018D\u0192\u0195\u0199-\u019B\u019E\u01A1\u01A3\u01A5\u01A8\u01AA\u01AB\u01AD\u01B0\u01B4\u01B6\u01B9\u01BA\u01BD-\u01BF\u01C6\u01C9\u01CC\u01CE\u01D0\u01D2\u01D4\u01D6\u01D8\u01DA\u01DC\u01DD\u01DF\u01E1\u01E3\u01E5\u01E7\u01E9\u01EB\u01ED\u01EF\u01F0\u01F3\u01F5\u01F9\u01FB\u01FD\u01FF\u0201\u0203\u0205\u0207\u0209\u020B\u020D\u020F\u0211\u0213\u0215\u0217\u0219\u021B\u021D\u021F\u0221\u0223\u0225\u0227\u0229\u022B\u022D\u022F\u0231\u0233-\u0239\u023C\u023F\u0240\u0242\u0247\u0249\u024B\u024D\u024F-\u0293\u0295-\u02AF\u0371\u0373\u0377\u037B-\u037D\u0390\u03AC-\u03CE\u03D0\u03D1\u03D5-\u03D7\u03D9\u03DB\u03DD\u03DF\u03E1\u03E3\u03E5\u03E7\u03E9\u03EB\u03ED\u03EF-\u03F3\u03F5\u03F8\u03FB\u03FC\u0430-\u045F\u0461\u0463\u0465\u0467\u0469\u046B\u046D\u046F\u0471\u0473\u0475\u0477\u0479\u047B\u047D\u047F\u0481\u048B\u048D\u048F\u0491\u0493\u0495\u0497\u0499\u049B\u049D\u049F\u04A1\u04A3\u04A5\u04A7\u04A9\u04AB\u04AD\u04AF\u04B1\u04B3\u04B5\u04B7\u04B9\u04BB\u04BD\u04BF\u04C2\u04C4\u04C6\u04C8\u04CA\u04CC\u04CE\u04CF\u04D1\u04D3\u04D5\u04D7\u04D9\u04DB\u04DD\u04DF\u04E1\u04E3\u04E5\u04E7\u04E9\u04EB\u04ED\u04EF\u04F1\u04F3\u04F5\u04F7\u04F9\u04FB\u04FD\u04FF\u0501\u0503\u0505\u0507\u0509\u050B\u050D\u050F\u0511\u0513\u0515\u0517\u0519\u051B\u051D\u051F\u0521\u0523\u0525\u0527\u0561-\u0587\u1D00-\u1D2B\u1D6B-\u1D77\u1D79-\u1D9A\u1E01\u1E03\u1E05\u1E07\u1E09\u1E0B\u1E0D\u1E0F\u1E11\u1E13\u1E15\u1E17\u1E19\u1E1B\u1E1D\u1E1F\u1E21\u1E23\u1E25\u1E27\u1E29\u1E2B\u1E2D\u1E2F\u1E31\u1E33\u1E35\u1E37\u1E39\u1E3B\u1E3D\u1E3F\u1E41\u1E43\u1E45\u1E47\u1E49\u1E4B\u1E4D\u1E4F\u1E51\u1E53\u1E55\u1E57\u1E59\u1E5B\u1E5D\u1E5F\u1E61\u1E63\u1E65\u1E67\u1E69\u1E6B\u1E6D\u1E6F\u1E71\u1E73\u1E75\u1E77\u1E79\u1E7B\u1E7D\u1E7F\u1E81\u1E83\u1E85\u1E87\u1E89\u1E8B\u1E8D\u1E8F\u1E91\u1E93\u1E95-\u1E9D\u1E9F\u1EA1\u1EA3\u1EA5\u1EA7\u1EA9\u1EAB\u1EAD\u1EAF\u1EB1\u1EB3\u1EB5\u1EB7\u1EB9\u1EBB\u1EBD\u1EBF\u1EC1\u1EC3\u1EC5\u1EC7\u1EC9\u1ECB\u1ECD\u1ECF\u1ED1\u1ED3\u1ED5\u1ED7\u1ED9\u1EDB\u1EDD\u1EDF\u1EE1\u1EE3\u1EE5\u1EE7\u1EE9\u1EEB\u1EED\u1EEF\u1EF1\u1EF3\u1EF5\u1EF7\u1EF9\u1EFB\u1EFD\u1EFF-\u1F07\u1F10-\u1F15\u1F20-\u1F27\u1F30-\u1F37\u1F40-\u1F45\u1F50-\u1F57\u1F60-\u1F67\u1F70-\u1F7D\u1F80-\u1F87\u1F90-\u1F97\u1FA0-\u1FA7\u1FB0-\u1FB4\u1FB6\u1FB7\u1FBE\u1FC2-\u1FC4\u1FC6\u1FC7\u1FD0-\u1FD3\u1FD6\u1FD7\u1FE0-\u1FE7\u1FF2-\u1FF4\u1FF6\u1FF7\u210A\u210E\u210F\u2113\u212F\u2134\u2139\u213C\u213D\u2146-\u2149\u214E\u2184\u2C30-\u2C5E\u2C61\u2C65\u2C66\u2C68\u2C6A\u2C6C\u2C71\u2C73\u2C74\u2C76-\u2C7B\u2C81\u2C83\u2C85\u2C87\u2C89\u2C8B\u2C8D\u2C8F\u2C91\u2C93\u2C95\u2C97\u2C99\u2C9B\u2C9D\u2C9F\u2CA1\u2CA3\u2CA5\u2CA7\u2CA9\u2CAB\u2CAD\u2CAF\u2CB1\u2CB3\u2CB5\u2CB7\u2CB9\u2CBB\u2CBD\u2CBF\u2CC1\u2CC3\u2CC5\u2CC7\u2CC9\u2CCB\u2CCD\u2CCF\u2CD1\u2CD3\u2CD5\u2CD7\u2CD9\u2CDB\u2CDD\u2CDF\u2CE1\u2CE3\u2CE4\u2CEC\u2CEE\u2CF3\u2D00-\u2D25\u2D27\u2D2D\uA641\uA643\uA645\uA647\uA649\uA64B\uA64D\uA64F\uA651\uA653\uA655\uA657\uA659\uA65B\uA65D\uA65F\uA661\uA663\uA665\uA667\uA669\uA66B\uA66D\uA681\uA683\uA685\uA687\uA689\uA68B\uA68D\uA68F\uA691\uA693\uA695\uA697\uA723\uA725\uA727\uA729\uA72B\uA72D\uA72F-\uA731\uA733\uA735\uA737\uA739\uA73B\uA73D\uA73F\uA741\uA743\uA745\uA747\uA749\uA74B\uA74D\uA74F\uA751\uA753\uA755\uA757\uA759\uA75B\uA75D\uA75F\uA761\uA763\uA765\uA767\uA769\uA76B\uA76D\uA76F\uA771-\uA778\uA77A\uA77C\uA77F\uA781\uA783\uA785\uA787\uA78C\uA78E\uA791\uA793\uA7A1\uA7A3\uA7A5\uA7A7\uA7A9\uA7FA\uFB00-\uFB06\uFB13-\uFB17\uFF41-\uFF5A])([\u0041-\u005A\u00C0-\u00D6\u00D8-\u00DE\u0100\u0102\u0104\u0106\u0108\u010A\u010C\u010E\u0110\u0112\u0114\u0116\u0118\u011A\u011C\u011E\u0120\u0122\u0124\u0126\u0128\u012A\u012C\u012E\u0130\u0132\u0134\u0136\u0139\u013B\u013D\u013F\u0141\u0143\u0145\u0147\u014A\u014C\u014E\u0150\u0152\u0154\u0156\u0158\u015A\u015C\u015E\u0160\u0162\u0164\u0166\u0168\u016A\u016C\u016E\u0170\u0172\u0174\u0176\u0178\u0179\u017B\u017D\u0181\u0182\u0184\u0186\u0187\u0189-\u018B\u018E-\u0191\u0193\u0194\u0196-\u0198\u019C\u019D\u019F\u01A0\u01A2\u01A4\u01A6\u01A7\u01A9\u01AC\u01AE\u01AF\u01B1-\u01B3\u01B5\u01B7\u01B8\u01BC\u01C4\u01C7\u01CA\u01CD\u01CF\u01D1\u01D3\u01D5\u01D7\u01D9\u01DB\u01DE\u01E0\u01E2\u01E4\u01E6\u01E8\u01EA\u01EC\u01EE\u01F1\u01F4\u01F6-\u01F8\u01FA\u01FC\u01FE\u0200\u0202\u0204\u0206\u0208\u020A\u020C\u020E\u0210\u0212\u0214\u0216\u0218\u021A\u021C\u021E\u0220\u0222\u0224\u0226\u0228\u022A\u022C\u022E\u0230\u0232\u023A\u023B\u023D\u023E\u0241\u0243-\u0246\u0248\u024A\u024C\u024E\u0370\u0372\u0376\u0386\u0388-\u038A\u038C\u038E\u038F\u0391-\u03A1\u03A3-\u03AB\u03CF\u03D2-\u03D4\u03D8\u03DA\u03DC\u03DE\u03E0\u03E2\u03E4\u03E6\u03E8\u03EA\u03EC\u03EE\u03F4\u03F7\u03F9\u03FA\u03FD-\u042F\u0460\u0462\u0464\u0466\u0468\u046A\u046C\u046E\u0470\u0472\u0474\u0476\u0478\u047A\u047C\u047E\u0480\u048A\u048C\u048E\u0490\u0492\u0494\u0496\u0498\u049A\u049C\u049E\u04A0\u04A2\u04A4\u04A6\u04A8\u04AA\u04AC\u04AE\u04B0\u04B2\u04B4\u04B6\u04B8\u04BA\u04BC\u04BE\u04C0\u04C1\u04C3\u04C5\u04C7\u04C9\u04CB\u04CD\u04D0\u04D2\u04D4\u04D6\u04D8\u04DA\u04DC\u04DE\u04E0\u04E2\u04E4\u04E6\u04E8\u04EA\u04EC\u04EE\u04F0\u04F2\u04F4\u04F6\u04F8\u04FA\u04FC\u04FE\u0500\u0502\u0504\u0506\u0508\u050A\u050C\u050E\u0510\u0512\u0514\u0516\u0518\u051A\u051C\u051E\u0520\u0522\u0524\u0526\u0531-\u0556\u10A0-\u10C5\u10C7\u10CD\u1E00\u1E02\u1E04\u1E06\u1E08\u1E0A\u1E0C\u1E0E\u1E10\u1E12\u1E14\u1E16\u1E18\u1E1A\u1E1C\u1E1E\u1E20\u1E22\u1E24\u1E26\u1E28\u1E2A\u1E2C\u1E2E\u1E30\u1E32\u1E34\u1E36\u1E38\u1E3A\u1E3C\u1E3E\u1E40\u1E42\u1E44\u1E46\u1E48\u1E4A\u1E4C\u1E4E\u1E50\u1E52\u1E54\u1E56\u1E58\u1E5A\u1E5C\u1E5E\u1E60\u1E62\u1E64\u1E66\u1E68\u1E6A\u1E6C\u1E6E\u1E70\u1E72\u1E74\u1E76\u1E78\u1E7A\u1E7C\u1E7E\u1E80\u1E82\u1E84\u1E86\u1E88\u1E8A\u1E8C\u1E8E\u1E90\u1E92\u1E94\u1E9E\u1EA0\u1EA2\u1EA4\u1EA6\u1EA8\u1EAA\u1EAC\u1EAE\u1EB0\u1EB2\u1EB4\u1EB6\u1EB8\u1EBA\u1EBC\u1EBE\u1EC0\u1EC2\u1EC4\u1EC6\u1EC8\u1ECA\u1ECC\u1ECE\u1ED0\u1ED2\u1ED4\u1ED6\u1ED8\u1EDA\u1EDC\u1EDE\u1EE0\u1EE2\u1EE4\u1EE6\u1EE8\u1EEA\u1EEC\u1EEE\u1EF0\u1EF2\u1EF4\u1EF6\u1EF8\u1EFA\u1EFC\u1EFE\u1F08-\u1F0F\u1F18-\u1F1D\u1F28-\u1F2F\u1F38-\u1F3F\u1F48-\u1F4D\u1F59\u1F5B\u1F5D\u1F5F\u1F68-\u1F6F\u1FB8-\u1FBB\u1FC8-\u1FCB\u1FD8-\u1FDB\u1FE8-\u1FEC\u1FF8-\u1FFB\u2102\u2107\u210B-\u210D\u2110-\u2112\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u2130-\u2133\u213E\u213F\u2145\u2183\u2C00-\u2C2E\u2C60\u2C62-\u2C64\u2C67\u2C69\u2C6B\u2C6D-\u2C70\u2C72\u2C75\u2C7E-\u2C80\u2C82\u2C84\u2C86\u2C88\u2C8A\u2C8C\u2C8E\u2C90\u2C92\u2C94\u2C96\u2C98\u2C9A\u2C9C\u2C9E\u2CA0\u2CA2\u2CA4\u2CA6\u2CA8\u2CAA\u2CAC\u2CAE\u2CB0\u2CB2\u2CB4\u2CB6\u2CB8\u2CBA\u2CBC\u2CBE\u2CC0\u2CC2\u2CC4\u2CC6\u2CC8\u2CCA\u2CCC\u2CCE\u2CD0\u2CD2\u2CD4\u2CD6\u2CD8\u2CDA\u2CDC\u2CDE\u2CE0\u2CE2\u2CEB\u2CED\u2CF2\uA640\uA642\uA644\uA646\uA648\uA64A\uA64C\uA64E\uA650\uA652\uA654\uA656\uA658\uA65A\uA65C\uA65E\uA660\uA662\uA664\uA666\uA668\uA66A\uA66C\uA680\uA682\uA684\uA686\uA688\uA68A\uA68C\uA68E\uA690\uA692\uA694\uA696\uA722\uA724\uA726\uA728\uA72A\uA72C\uA72E\uA732\uA734\uA736\uA738\uA73A\uA73C\uA73E\uA740\uA742\uA744\uA746\uA748\uA74A\uA74C\uA74E\uA750\uA752\uA754\uA756\uA758\uA75A\uA75C\uA75E\uA760\uA762\uA764\uA766\uA768\uA76A\uA76C\uA76E\uA779\uA77B\uA77D\uA77E\uA780\uA782\uA784\uA786\uA78B\uA78D\uA790\uA792\uA7A0\uA7A2\uA7A4\uA7A6\uA7A8\uA7AA\uFF21-\uFF3A\u0030-\u0039\u00B2\u00B3\u00B9\u00BC-\u00BE\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9\u0966-\u096F\u09E6-\u09EF\u09F4-\u09F9\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0B72-\u0B77\u0BE6-\u0BF2\u0C66-\u0C6F\u0C78-\u0C7E\u0CE6-\u0CEF\u0D66-\u0D75\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F33\u1040-\u1049\u1090-\u1099\u1369-\u137C\u16EE-\u16F0\u17E0-\u17E9\u17F0-\u17F9\u1810-\u1819\u1946-\u194F\u19D0-\u19DA\u1A80-\u1A89\u1A90-\u1A99\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59\u2070\u2074-\u2079\u2080-\u2089\u2150-\u2182\u2185-\u2189\u2460-\u249B\u24EA-\u24FF\u2776-\u2793\u2CFD\u3007\u3021-\u3029\u3038-\u303A\u3192-\u3195\u3220-\u3229\u3248-\u324F\u3251-\u325F\u3280-\u3289\u32B1-\u32BF\uA620-\uA629\uA6E6-\uA6EF\uA830-\uA835\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19])/g

},{}],27:[function(require,module,exports){
module.exports = /[^\u0041-\u005A\u0061-\u007A\u00AA\u00B5\u00BA\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0\u08A2-\u08AC\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097F\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191C\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA697\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA793\uA7A0-\uA7AA\uA7F8-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA80-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC\u0030-\u0039\u00B2\u00B3\u00B9\u00BC-\u00BE\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9\u0966-\u096F\u09E6-\u09EF\u09F4-\u09F9\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0B72-\u0B77\u0BE6-\u0BF2\u0C66-\u0C6F\u0C78-\u0C7E\u0CE6-\u0CEF\u0D66-\u0D75\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F33\u1040-\u1049\u1090-\u1099\u1369-\u137C\u16EE-\u16F0\u17E0-\u17E9\u17F0-\u17F9\u1810-\u1819\u1946-\u194F\u19D0-\u19DA\u1A80-\u1A89\u1A90-\u1A99\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59\u2070\u2074-\u2079\u2080-\u2089\u2150-\u2182\u2185-\u2189\u2460-\u249B\u24EA-\u24FF\u2776-\u2793\u2CFD\u3007\u3021-\u3029\u3038-\u303A\u3192-\u3195\u3220-\u3229\u3248-\u324F\u3251-\u325F\u3280-\u3289\u32B1-\u32BF\uA620-\uA629\uA6E6-\uA6EF\uA830-\uA835\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19]+/g

},{}],28:[function(require,module,exports){
module.exports = /([\u0030-\u0039\u00B2\u00B3\u00B9\u00BC-\u00BE\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9\u0966-\u096F\u09E6-\u09EF\u09F4-\u09F9\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0B72-\u0B77\u0BE6-\u0BF2\u0C66-\u0C6F\u0C78-\u0C7E\u0CE6-\u0CEF\u0D66-\u0D75\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F33\u1040-\u1049\u1090-\u1099\u1369-\u137C\u16EE-\u16F0\u17E0-\u17E9\u17F0-\u17F9\u1810-\u1819\u1946-\u194F\u19D0-\u19DA\u1A80-\u1A89\u1A90-\u1A99\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59\u2070\u2074-\u2079\u2080-\u2089\u2150-\u2182\u2185-\u2189\u2460-\u249B\u24EA-\u24FF\u2776-\u2793\u2CFD\u3007\u3021-\u3029\u3038-\u303A\u3192-\u3195\u3220-\u3229\u3248-\u324F\u3251-\u325F\u3280-\u3289\u32B1-\u32BF\uA620-\uA629\uA6E6-\uA6EF\uA830-\uA835\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19])([^\u0030-\u0039\u00B2\u00B3\u00B9\u00BC-\u00BE\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9\u0966-\u096F\u09E6-\u09EF\u09F4-\u09F9\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0B72-\u0B77\u0BE6-\u0BF2\u0C66-\u0C6F\u0C78-\u0C7E\u0CE6-\u0CEF\u0D66-\u0D75\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F33\u1040-\u1049\u1090-\u1099\u1369-\u137C\u16EE-\u16F0\u17E0-\u17E9\u17F0-\u17F9\u1810-\u1819\u1946-\u194F\u19D0-\u19DA\u1A80-\u1A89\u1A90-\u1A99\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59\u2070\u2074-\u2079\u2080-\u2089\u2150-\u2182\u2185-\u2189\u2460-\u249B\u24EA-\u24FF\u2776-\u2793\u2CFD\u3007\u3021-\u3029\u3038-\u303A\u3192-\u3195\u3220-\u3229\u3248-\u324F\u3251-\u325F\u3280-\u3289\u32B1-\u32BF\uA620-\uA629\uA6E6-\uA6EF\uA830-\uA835\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19])/g

},{}],29:[function(require,module,exports){
var sentenceCase = require('sentence-case');

/**
 * Param case a string.
 *
 * @param  {String} string
 * @param  {String} [locale]
 * @return {String}
 */
module.exports = function (string, locale) {
  return sentenceCase(string, locale, '-');
};

},{"sentence-case":25}],30:[function(require,module,exports){
module.exports = extend

function extend() {
    var target = {}

    for (var i = 0; i < arguments.length; i++) {
        var source = arguments[i]

        for (var key in source) {
            if (source.hasOwnProperty(key)) {
                target[key] = source[key]
            }
        }
    }

    return target
}

},{}],31:[function(require,module,exports){
/**
 * Attribute types.
 */

var types = {
  BOOLEAN: 1,
  OVERLOADED_BOOLEAN: 2
};

/**
 * Properties.
 *
 * Taken from https://github.com/facebook/react/blob/847357e42e5267b04dd6e297219eaa125ab2f9f4/src/browser/ui/dom/HTMLDOMPropertyConfig.js
 *
 */

var properties = {
  /**
   * Standard Properties
   */
  accept: true,
  acceptCharset: true,
  accessKey: true,
  action: true,
  allowFullScreen: types.BOOLEAN,
  allowTransparency: true,
  alt: true,
  async: types.BOOLEAN,
  autocomplete: true,
  autofocus: types.BOOLEAN,
  autoplay: types.BOOLEAN,
  cellPadding: true,
  cellSpacing: true,
  charset: true,
  checked: types.BOOLEAN,
  classID: true,
  className: true,
  cols: true,
  colSpan: true,
  content: true,
  contentEditable: true,
  contextMenu: true,
  controls: types.BOOLEAN,
  coords: true,
  crossOrigin: true,
  data: true, // For `<object />` acts as `src`.
  dateTime: true,
  defer: types.BOOLEAN,
  dir: true,
  disabled: types.BOOLEAN,
  download: types.OVERLOADED_BOOLEAN,
  draggable: true,
  enctype: true,
  form: true,
  formAction: true,
  formEncType: true,
  formMethod: true,
  formNoValidate: types.BOOLEAN,
  formTarget: true,
  frameBorder: true,
  headers: true,
  height: true,
  hidden: types.BOOLEAN,
  href: true,
  hreflang: true,
  htmlFor: true,
  httpEquiv: true,
  icon: true,
  id: true,
  label: true,
  lang: true,
  list: true,
  loop: types.BOOLEAN,
  manifest: true,
  marginHeight: true,
  marginWidth: true,
  max: true,
  maxLength: true,
  media: true,
  mediaGroup: true,
  method: true,
  min: true,
  multiple: types.BOOLEAN,
  muted: types.BOOLEAN,
  name: true,
  noValidate: types.BOOLEAN,
  open: true,
  pattern: true,
  placeholder: true,
  poster: true,
  preload: true,
  radiogroup: true,
  readOnly: types.BOOLEAN,
  rel: true,
  required: types.BOOLEAN,
  role: true,
  rows: true,
  rowSpan: true,
  sandbox: true,
  scope: true,
  scrolling: true,
  seamless: types.BOOLEAN,
  selected: types.BOOLEAN,
  shape: true,
  size: true,
  sizes: true,
  span: true,
  spellcheck: true,
  src: true,
  srcdoc: true,
  srcset: true,
  start: true,
  step: true,
  style: true,
  tabIndex: true,
  target: true,
  title: true,
  type: true,
  useMap: true,
  value: true,
  width: true,
  wmode: true,

  /**
   * Non-standard Properties
   */
  // autoCapitalize and autoCorrect are supported in Mobile Safari for
  // keyboard hints.
  autocapitalize: true,
  autocorrect: true,
  // itemProp, itemScope, itemType are for Microdata support. See
  // http://schema.org/docs/gs.html
  itemProp: true,
  itemScope: types.BOOLEAN,
  itemType: true,
  // property is supported for OpenGraph in meta tags.
  property: true
};

/**
 * Properties to attributes mapping.
 *
 * The ones not here are simply converted to lower case.
 */

var attributeNames = {
  acceptCharset: 'accept-charset',
  className: 'class',
  htmlFor: 'for',
  httpEquiv: 'http-equiv'
};

/**
 * Exports.
 */

module.exports = {
  attributeTypes: types,
  properties: properties,
  attributeNames: attributeNames
};
},{}],32:[function(require,module,exports){

/**
 * Void elements.
 *
 * https://github.com/facebook/react/blob/v0.12.0/src/browser/ui/ReactDOMComponent.js#L99
 */

module.exports = {
  'area': true,
  'base': true,
  'br': true,
  'col': true,
  'embed': true,
  'hr': true,
  'img': true,
  'input': true,
  'keygen': true,
  'link': true,
  'meta': true,
  'param': true,
  'source': true,
  'track': true,
  'wbr': true
};
},{}],33:[function(require,module,exports){
var createElement = require("./vdom/create-element.js")

module.exports = createElement

},{"./vdom/create-element.js":45}],34:[function(require,module,exports){
var diff = require("./vtree/diff.js")

module.exports = diff

},{"./vtree/diff.js":66}],35:[function(require,module,exports){
var h = require("./virtual-hyperscript/index.js")

module.exports = h

},{"./virtual-hyperscript/index.js":53}],36:[function(require,module,exports){
/*!
 * Cross-Browser Split 1.1.1
 * Copyright 2007-2012 Steven Levithan <stevenlevithan.com>
 * Available under the MIT License
 * ECMAScript compliant, uniform cross-browser split method
 */

/**
 * Splits a string into an array of strings using a regex or string separator. Matches of the
 * separator are not included in the result array. However, if `separator` is a regex that contains
 * capturing groups, backreferences are spliced into the result each time `separator` is matched.
 * Fixes browser bugs compared to the native `String.prototype.split` and can be used reliably
 * cross-browser.
 * @param {String} str String to split.
 * @param {RegExp|String} separator Regex or string to use for separating the string.
 * @param {Number} [limit] Maximum number of items to include in the result array.
 * @returns {Array} Array of substrings.
 * @example
 *
 * // Basic use
 * split('a b c d', ' ');
 * // -> ['a', 'b', 'c', 'd']
 *
 * // With limit
 * split('a b c d', ' ', 2);
 * // -> ['a', 'b']
 *
 * // Backreferences in result array
 * split('..word1 word2..', /([a-z]+)(\d+)/i);
 * // -> ['..', 'word', '1', ' ', 'word', '2', '..']
 */
module.exports = (function split(undef) {

  var nativeSplit = String.prototype.split,
    compliantExecNpcg = /()??/.exec("")[1] === undef,
    // NPCG: nonparticipating capturing group
    self;

  self = function(str, separator, limit) {
    // If `separator` is not a regex, use `nativeSplit`
    if (Object.prototype.toString.call(separator) !== "[object RegExp]") {
      return nativeSplit.call(str, separator, limit);
    }
    var output = [],
      flags = (separator.ignoreCase ? "i" : "") + (separator.multiline ? "m" : "") + (separator.extended ? "x" : "") + // Proposed for ES6
      (separator.sticky ? "y" : ""),
      // Firefox 3+
      lastLastIndex = 0,
      // Make `global` and avoid `lastIndex` issues by working with a copy
      separator = new RegExp(separator.source, flags + "g"),
      separator2, match, lastIndex, lastLength;
    str += ""; // Type-convert
    if (!compliantExecNpcg) {
      // Doesn't need flags gy, but they don't hurt
      separator2 = new RegExp("^" + separator.source + "$(?!\\s)", flags);
    }
    /* Values for `limit`, per the spec:
     * If undefined: 4294967295 // Math.pow(2, 32) - 1
     * If 0, Infinity, or NaN: 0
     * If positive number: limit = Math.floor(limit); if (limit > 4294967295) limit -= 4294967296;
     * If negative number: 4294967296 - Math.floor(Math.abs(limit))
     * If other: Type-convert, then use the above rules
     */
    limit = limit === undef ? -1 >>> 0 : // Math.pow(2, 32) - 1
    limit >>> 0; // ToUint32(limit)
    while (match = separator.exec(str)) {
      // `separator.lastIndex` is not reliable cross-browser
      lastIndex = match.index + match[0].length;
      if (lastIndex > lastLastIndex) {
        output.push(str.slice(lastLastIndex, match.index));
        // Fix browsers whose `exec` methods don't consistently return `undefined` for
        // nonparticipating capturing groups
        if (!compliantExecNpcg && match.length > 1) {
          match[0].replace(separator2, function() {
            for (var i = 1; i < arguments.length - 2; i++) {
              if (arguments[i] === undef) {
                match[i] = undef;
              }
            }
          });
        }
        if (match.length > 1 && match.index < str.length) {
          Array.prototype.push.apply(output, match.slice(1));
        }
        lastLength = match[0].length;
        lastLastIndex = lastIndex;
        if (output.length >= limit) {
          break;
        }
      }
      if (separator.lastIndex === match.index) {
        separator.lastIndex++; // Avoid an infinite loop
      }
    }
    if (lastLastIndex === str.length) {
      if (lastLength || !separator.test("")) {
        output.push("");
      }
    } else {
      output.push(str.slice(lastLastIndex));
    }
    return output.length > limit ? output.slice(0, limit) : output;
  };

  return self;
})();

},{}],37:[function(require,module,exports){
'use strict';

var OneVersionConstraint = require('individual/one-version');

var MY_VERSION = '7';
OneVersionConstraint('ev-store', MY_VERSION);

var hashKey = '__EV_STORE_KEY@' + MY_VERSION;

module.exports = EvStore;

function EvStore(elem) {
    var hash = elem[hashKey];

    if (!hash) {
        hash = elem[hashKey] = {};
    }

    return hash;
}

},{"individual/one-version":39}],38:[function(require,module,exports){
(function (global){
'use strict';

/*global window, global*/

var root = typeof window !== 'undefined' ?
    window : typeof global !== 'undefined' ?
    global : {};

module.exports = Individual;

function Individual(key, value) {
    if (key in root) {
        return root[key];
    }

    root[key] = value;

    return value;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],39:[function(require,module,exports){
'use strict';

var Individual = require('./index.js');

module.exports = OneVersion;

function OneVersion(moduleName, version, defaultValue) {
    var key = '__INDIVIDUAL_ONE_VERSION_' + moduleName;
    var enforceKey = key + '_ENFORCE_SINGLETON';

    var versionValue = Individual(enforceKey, version);

    if (versionValue !== version) {
        throw new Error('Can only have one copy of ' +
            moduleName + '.\n' +
            'You already have version ' + versionValue +
            ' installed.\n' +
            'This means you cannot install version ' + version);
    }

    return Individual(key, defaultValue);
}

},{"./index.js":38}],40:[function(require,module,exports){
(function (global){
var topLevel = typeof global !== 'undefined' ? global :
    typeof window !== 'undefined' ? window : {}
var minDoc = require('min-document');

if (typeof document !== 'undefined') {
    module.exports = document;
} else {
    var doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'];

    if (!doccy) {
        doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'] = minDoc;
    }

    module.exports = doccy;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"min-document":1}],41:[function(require,module,exports){
"use strict";

module.exports = function isObject(x) {
	return typeof x === "object" && x !== null;
};

},{}],42:[function(require,module,exports){
var nativeIsArray = Array.isArray
var toString = Object.prototype.toString

module.exports = nativeIsArray || isArray

function isArray(obj) {
    return toString.call(obj) === "[object Array]"
}

},{}],43:[function(require,module,exports){
var patch = require("./vdom/patch.js")

module.exports = patch

},{"./vdom/patch.js":48}],44:[function(require,module,exports){
var isObject = require("is-object")
var isHook = require("../vnode/is-vhook.js")

module.exports = applyProperties

function applyProperties(node, props, previous) {
    for (var propName in props) {
        var propValue = props[propName]

        if (propValue === undefined) {
            removeProperty(node, propName, propValue, previous);
        } else if (isHook(propValue)) {
            removeProperty(node, propName, propValue, previous)
            if (propValue.hook) {
                propValue.hook(node,
                    propName,
                    previous ? previous[propName] : undefined)
            }
        } else {
            if (isObject(propValue)) {
                patchObject(node, props, previous, propName, propValue);
            } else {
                node[propName] = propValue
            }
        }
    }
}

function removeProperty(node, propName, propValue, previous) {
    if (previous) {
        var previousValue = previous[propName]

        if (!isHook(previousValue)) {
            if (propName === "attributes") {
                for (var attrName in previousValue) {
                    node.removeAttribute(attrName)
                }
            } else if (propName === "style") {
                for (var i in previousValue) {
                    node.style[i] = ""
                }
            } else if (typeof previousValue === "string") {
                node[propName] = ""
            } else {
                node[propName] = null
            }
        } else if (previousValue.unhook) {
            previousValue.unhook(node, propName, propValue)
        }
    }
}

function patchObject(node, props, previous, propName, propValue) {
    var previousValue = previous ? previous[propName] : undefined

    // Set attributes
    if (propName === "attributes") {
        for (var attrName in propValue) {
            var attrValue = propValue[attrName]

            if (attrValue === undefined) {
                node.removeAttribute(attrName)
            } else {
                node.setAttribute(attrName, attrValue)
            }
        }

        return
    }

    if(previousValue && isObject(previousValue) &&
        getPrototype(previousValue) !== getPrototype(propValue)) {
        node[propName] = propValue
        return
    }

    if (!isObject(node[propName])) {
        node[propName] = {}
    }

    var replacer = propName === "style" ? "" : undefined

    for (var k in propValue) {
        var value = propValue[k]
        node[propName][k] = (value === undefined) ? replacer : value
    }
}

function getPrototype(value) {
    if (Object.getPrototypeOf) {
        return Object.getPrototypeOf(value)
    } else if (value.__proto__) {
        return value.__proto__
    } else if (value.constructor) {
        return value.constructor.prototype
    }
}

},{"../vnode/is-vhook.js":57,"is-object":41}],45:[function(require,module,exports){
var document = require("global/document")

var applyProperties = require("./apply-properties")

var isVNode = require("../vnode/is-vnode.js")
var isVText = require("../vnode/is-vtext.js")
var isWidget = require("../vnode/is-widget.js")
var handleThunk = require("../vnode/handle-thunk.js")

module.exports = createElement

function createElement(vnode, opts) {
    var doc = opts ? opts.document || document : document
    var warn = opts ? opts.warn : null

    vnode = handleThunk(vnode).a

    if (isWidget(vnode)) {
        return vnode.init()
    } else if (isVText(vnode)) {
        return doc.createTextNode(vnode.text)
    } else if (!isVNode(vnode)) {
        if (warn) {
            warn("Item is not a valid virtual dom node", vnode)
        }
        return null
    }

    var node = (vnode.namespace === null) ?
        doc.createElement(vnode.tagName) :
        doc.createElementNS(vnode.namespace, vnode.tagName)

    var props = vnode.properties
    applyProperties(node, props)

    var children = vnode.children

    for (var i = 0; i < children.length; i++) {
        var childNode = createElement(children[i], opts)
        if (childNode) {
            node.appendChild(childNode)
        }
    }

    return node
}

},{"../vnode/handle-thunk.js":55,"../vnode/is-vnode.js":58,"../vnode/is-vtext.js":59,"../vnode/is-widget.js":60,"./apply-properties":44,"global/document":40}],46:[function(require,module,exports){
// Maps a virtual DOM tree onto a real DOM tree in an efficient manner.
// We don't want to read all of the DOM nodes in the tree so we use
// the in-order tree indexing to eliminate recursion down certain branches.
// We only recurse into a DOM node if we know that it contains a child of
// interest.

var noChild = {}

module.exports = domIndex

function domIndex(rootNode, tree, indices, nodes) {
    if (!indices || indices.length === 0) {
        return {}
    } else {
        indices.sort(ascending)
        return recurse(rootNode, tree, indices, nodes, 0)
    }
}

function recurse(rootNode, tree, indices, nodes, rootIndex) {
    nodes = nodes || {}


    if (rootNode) {
        if (indexInRange(indices, rootIndex, rootIndex)) {
            nodes[rootIndex] = rootNode
        }

        var vChildren = tree.children

        if (vChildren) {

            var childNodes = rootNode.childNodes

            for (var i = 0; i < tree.children.length; i++) {
                rootIndex += 1

                var vChild = vChildren[i] || noChild
                var nextIndex = rootIndex + (vChild.count || 0)

                // skip recursion down the tree if there are no nodes down here
                if (indexInRange(indices, rootIndex, nextIndex)) {
                    recurse(childNodes[i], vChild, indices, nodes, rootIndex)
                }

                rootIndex = nextIndex
            }
        }
    }

    return nodes
}

// Binary search for an index in the interval [left, right]
function indexInRange(indices, left, right) {
    if (indices.length === 0) {
        return false
    }

    var minIndex = 0
    var maxIndex = indices.length - 1
    var currentIndex
    var currentItem

    while (minIndex <= maxIndex) {
        currentIndex = ((maxIndex + minIndex) / 2) >> 0
        currentItem = indices[currentIndex]

        if (minIndex === maxIndex) {
            return currentItem >= left && currentItem <= right
        } else if (currentItem < left) {
            minIndex = currentIndex + 1
        } else  if (currentItem > right) {
            maxIndex = currentIndex - 1
        } else {
            return true
        }
    }

    return false;
}

function ascending(a, b) {
    return a > b ? 1 : -1
}

},{}],47:[function(require,module,exports){
var applyProperties = require("./apply-properties")

var isWidget = require("../vnode/is-widget.js")
var VPatch = require("../vnode/vpatch.js")

var updateWidget = require("./update-widget")

module.exports = applyPatch

function applyPatch(vpatch, domNode, renderOptions) {
    var type = vpatch.type
    var vNode = vpatch.vNode
    var patch = vpatch.patch

    switch (type) {
        case VPatch.REMOVE:
            return removeNode(domNode, vNode)
        case VPatch.INSERT:
            return insertNode(domNode, patch, renderOptions)
        case VPatch.VTEXT:
            return stringPatch(domNode, vNode, patch, renderOptions)
        case VPatch.WIDGET:
            return widgetPatch(domNode, vNode, patch, renderOptions)
        case VPatch.VNODE:
            return vNodePatch(domNode, vNode, patch, renderOptions)
        case VPatch.ORDER:
            reorderChildren(domNode, patch)
            return domNode
        case VPatch.PROPS:
            applyProperties(domNode, patch, vNode.properties)
            return domNode
        case VPatch.THUNK:
            return replaceRoot(domNode,
                renderOptions.patch(domNode, patch, renderOptions))
        default:
            return domNode
    }
}

function removeNode(domNode, vNode) {
    var parentNode = domNode.parentNode

    if (parentNode) {
        parentNode.removeChild(domNode)
    }

    destroyWidget(domNode, vNode);

    return null
}

function insertNode(parentNode, vNode, renderOptions) {
    var newNode = renderOptions.render(vNode, renderOptions)

    if (parentNode) {
        parentNode.appendChild(newNode)
    }

    return parentNode
}

function stringPatch(domNode, leftVNode, vText, renderOptions) {
    var newNode

    if (domNode.nodeType === 3) {
        domNode.replaceData(0, domNode.length, vText.text)
        newNode = domNode
    } else {
        var parentNode = domNode.parentNode
        newNode = renderOptions.render(vText, renderOptions)

        if (parentNode && newNode !== domNode) {
            parentNode.replaceChild(newNode, domNode)
        }
    }

    return newNode
}

function widgetPatch(domNode, leftVNode, widget, renderOptions) {
    var updating = updateWidget(leftVNode, widget)
    var newNode

    if (updating) {
        newNode = widget.update(leftVNode, domNode) || domNode
    } else {
        newNode = renderOptions.render(widget, renderOptions)
    }

    var parentNode = domNode.parentNode

    if (parentNode && newNode !== domNode) {
        parentNode.replaceChild(newNode, domNode)
    }

    if (!updating) {
        destroyWidget(domNode, leftVNode)
    }

    return newNode
}

function vNodePatch(domNode, leftVNode, vNode, renderOptions) {
    var parentNode = domNode.parentNode
    var newNode = renderOptions.render(vNode, renderOptions)

    if (parentNode && newNode !== domNode) {
        parentNode.replaceChild(newNode, domNode)
    }

    return newNode
}

function destroyWidget(domNode, w) {
    if (typeof w.destroy === "function" && isWidget(w)) {
        w.destroy(domNode)
    }
}

function reorderChildren(domNode, moves) {
    var childNodes = domNode.childNodes
    var keyMap = {}
    var node
    var remove
    var insert

    for (var i = 0; i < moves.removes.length; i++) {
        remove = moves.removes[i]
        node = childNodes[remove.from]
        if (remove.key) {
            keyMap[remove.key] = node
        }
        domNode.removeChild(node)
    }

    var length = childNodes.length
    for (var j = 0; j < moves.inserts.length; j++) {
        insert = moves.inserts[j]
        node = keyMap[insert.key]
        // this is the weirdest bug i've ever seen in webkit
        domNode.insertBefore(node, insert.to >= length++ ? null : childNodes[insert.to])
    }
}

function replaceRoot(oldRoot, newRoot) {
    if (oldRoot && newRoot && oldRoot !== newRoot && oldRoot.parentNode) {
        oldRoot.parentNode.replaceChild(newRoot, oldRoot)
    }

    return newRoot;
}

},{"../vnode/is-widget.js":60,"../vnode/vpatch.js":63,"./apply-properties":44,"./update-widget":49}],48:[function(require,module,exports){
var document = require("global/document")
var isArray = require("x-is-array")

var render = require("./create-element")
var domIndex = require("./dom-index")
var patchOp = require("./patch-op")
module.exports = patch

function patch(rootNode, patches, renderOptions) {
    renderOptions = renderOptions || {}
    renderOptions.patch = renderOptions.patch && renderOptions.patch !== patch
        ? renderOptions.patch
        : patchRecursive
    renderOptions.render = renderOptions.render || render

    return renderOptions.patch(rootNode, patches, renderOptions)
}

function patchRecursive(rootNode, patches, renderOptions) {
    var indices = patchIndices(patches)

    if (indices.length === 0) {
        return rootNode
    }

    var index = domIndex(rootNode, patches.a, indices)
    var ownerDocument = rootNode.ownerDocument

    if (!renderOptions.document && ownerDocument !== document) {
        renderOptions.document = ownerDocument
    }

    for (var i = 0; i < indices.length; i++) {
        var nodeIndex = indices[i]
        rootNode = applyPatch(rootNode,
            index[nodeIndex],
            patches[nodeIndex],
            renderOptions)
    }

    return rootNode
}

function applyPatch(rootNode, domNode, patchList, renderOptions) {
    if (!domNode) {
        return rootNode
    }

    var newNode

    if (isArray(patchList)) {
        for (var i = 0; i < patchList.length; i++) {
            newNode = patchOp(patchList[i], domNode, renderOptions)

            if (domNode === rootNode) {
                rootNode = newNode
            }
        }
    } else {
        newNode = patchOp(patchList, domNode, renderOptions)

        if (domNode === rootNode) {
            rootNode = newNode
        }
    }

    return rootNode
}

function patchIndices(patches) {
    var indices = []

    for (var key in patches) {
        if (key !== "a") {
            indices.push(Number(key))
        }
    }

    return indices
}

},{"./create-element":45,"./dom-index":46,"./patch-op":47,"global/document":40,"x-is-array":42}],49:[function(require,module,exports){
var isWidget = require("../vnode/is-widget.js")

module.exports = updateWidget

function updateWidget(a, b) {
    if (isWidget(a) && isWidget(b)) {
        if ("name" in a && "name" in b) {
            return a.id === b.id
        } else {
            return a.init === b.init
        }
    }

    return false
}

},{"../vnode/is-widget.js":60}],50:[function(require,module,exports){
'use strict';

module.exports = AttributeHook;

function AttributeHook(namespace, value) {
    if (!(this instanceof AttributeHook)) {
        return new AttributeHook(namespace, value);
    }

    this.namespace = namespace;
    this.value = value;
}

AttributeHook.prototype.hook = function (node, prop, prev) {
    if (prev && prev.type === 'AttributeHook' &&
        prev.value === this.value &&
        prev.namespace === this.namespace) {
        return;
    }

    node.setAttributeNS(this.namespace, prop, this.value);
};

AttributeHook.prototype.unhook = function (node, prop, next) {
    if (next && next.type === 'AttributeHook' &&
        next.namespace === this.namespace) {
        return;
    }

    var colonPosition = prop.indexOf(':');
    var localName = colonPosition > -1 ? prop.substr(colonPosition + 1) : prop;
    node.removeAttributeNS(this.namespace, localName);
};

AttributeHook.prototype.type = 'AttributeHook';

},{}],51:[function(require,module,exports){
'use strict';

var EvStore = require('ev-store');

module.exports = EvHook;

function EvHook(value) {
    if (!(this instanceof EvHook)) {
        return new EvHook(value);
    }

    this.value = value;
}

EvHook.prototype.hook = function (node, propertyName) {
    var es = EvStore(node);
    var propName = propertyName.substr(3);

    es[propName] = this.value;
};

EvHook.prototype.unhook = function(node, propertyName) {
    var es = EvStore(node);
    var propName = propertyName.substr(3);

    es[propName] = undefined;
};

},{"ev-store":37}],52:[function(require,module,exports){
'use strict';

module.exports = SoftSetHook;

function SoftSetHook(value) {
    if (!(this instanceof SoftSetHook)) {
        return new SoftSetHook(value);
    }

    this.value = value;
}

SoftSetHook.prototype.hook = function (node, propertyName) {
    if (node[propertyName] !== this.value) {
        node[propertyName] = this.value;
    }
};

},{}],53:[function(require,module,exports){
'use strict';

var isArray = require('x-is-array');

var VNode = require('../vnode/vnode.js');
var VText = require('../vnode/vtext.js');
var isVNode = require('../vnode/is-vnode');
var isVText = require('../vnode/is-vtext');
var isWidget = require('../vnode/is-widget');
var isHook = require('../vnode/is-vhook');
var isVThunk = require('../vnode/is-thunk');

var parseTag = require('./parse-tag.js');
var softSetHook = require('./hooks/soft-set-hook.js');
var evHook = require('./hooks/ev-hook.js');

module.exports = h;

function h(tagName, properties, children) {
    var childNodes = [];
    var tag, props, key, namespace;

    if (!children && isChildren(properties)) {
        children = properties;
        props = {};
    }

    props = props || properties || {};
    tag = parseTag(tagName, props);

    // support keys
    if (props.hasOwnProperty('key')) {
        key = props.key;
        props.key = undefined;
    }

    // support namespace
    if (props.hasOwnProperty('namespace')) {
        namespace = props.namespace;
        props.namespace = undefined;
    }

    // fix cursor bug
    if (tag === 'INPUT' &&
        !namespace &&
        props.hasOwnProperty('value') &&
        props.value !== undefined &&
        !isHook(props.value)
    ) {
        props.value = softSetHook(props.value);
    }

    transformProperties(props);

    if (children !== undefined && children !== null) {
        addChild(children, childNodes, tag, props);
    }


    return new VNode(tag, props, childNodes, key, namespace);
}

function addChild(c, childNodes, tag, props) {
    if (typeof c === 'string') {
        childNodes.push(new VText(c));
    } else if (typeof c === 'number') {
        childNodes.push(new VText(String(c)));
    } else if (isChild(c)) {
        childNodes.push(c);
    } else if (isArray(c)) {
        for (var i = 0; i < c.length; i++) {
            addChild(c[i], childNodes, tag, props);
        }
    } else if (c === null || c === undefined) {
        return;
    } else {
        throw UnexpectedVirtualElement({
            foreignObject: c,
            parentVnode: {
                tagName: tag,
                properties: props
            }
        });
    }
}

function transformProperties(props) {
    for (var propName in props) {
        if (props.hasOwnProperty(propName)) {
            var value = props[propName];

            if (isHook(value)) {
                continue;
            }

            if (propName.substr(0, 3) === 'ev-') {
                // add ev-foo support
                props[propName] = evHook(value);
            }
        }
    }
}

function isChild(x) {
    return isVNode(x) || isVText(x) || isWidget(x) || isVThunk(x);
}

function isChildren(x) {
    return typeof x === 'string' || isArray(x) || isChild(x);
}

function UnexpectedVirtualElement(data) {
    var err = new Error();

    err.type = 'virtual-hyperscript.unexpected.virtual-element';
    err.message = 'Unexpected virtual child passed to h().\n' +
        'Expected a VNode / Vthunk / VWidget / string but:\n' +
        'got:\n' +
        errorString(data.foreignObject) +
        '.\n' +
        'The parent vnode is:\n' +
        errorString(data.parentVnode)
        '\n' +
        'Suggested fix: change your `h(..., [ ... ])` callsite.';
    err.foreignObject = data.foreignObject;
    err.parentVnode = data.parentVnode;

    return err;
}

function errorString(obj) {
    try {
        return JSON.stringify(obj, null, '    ');
    } catch (e) {
        return String(obj);
    }
}

},{"../vnode/is-thunk":56,"../vnode/is-vhook":57,"../vnode/is-vnode":58,"../vnode/is-vtext":59,"../vnode/is-widget":60,"../vnode/vnode.js":62,"../vnode/vtext.js":64,"./hooks/ev-hook.js":51,"./hooks/soft-set-hook.js":52,"./parse-tag.js":54,"x-is-array":42}],54:[function(require,module,exports){
'use strict';

var split = require('browser-split');

var classIdSplit = /([\.#]?[a-zA-Z0-9\u007F-\uFFFF_:-]+)/;
var notClassId = /^\.|#/;

module.exports = parseTag;

function parseTag(tag, props) {
    if (!tag) {
        return 'DIV';
    }

    var noId = !(props.hasOwnProperty('id'));

    var tagParts = split(tag, classIdSplit);
    var tagName = null;

    if (notClassId.test(tagParts[1])) {
        tagName = 'DIV';
    }

    var classes, part, type, i;

    for (i = 0; i < tagParts.length; i++) {
        part = tagParts[i];

        if (!part) {
            continue;
        }

        type = part.charAt(0);

        if (!tagName) {
            tagName = part;
        } else if (type === '.') {
            classes = classes || [];
            classes.push(part.substring(1, part.length));
        } else if (type === '#' && noId) {
            props.id = part.substring(1, part.length);
        }
    }

    if (classes) {
        if (props.className) {
            classes.push(props.className);
        }

        props.className = classes.join(' ');
    }

    return props.namespace ? tagName : tagName.toUpperCase();
}

},{"browser-split":36}],55:[function(require,module,exports){
var isVNode = require("./is-vnode")
var isVText = require("./is-vtext")
var isWidget = require("./is-widget")
var isThunk = require("./is-thunk")

module.exports = handleThunk

function handleThunk(a, b) {
    var renderedA = a
    var renderedB = b

    if (isThunk(b)) {
        renderedB = renderThunk(b, a)
    }

    if (isThunk(a)) {
        renderedA = renderThunk(a, null)
    }

    return {
        a: renderedA,
        b: renderedB
    }
}

function renderThunk(thunk, previous) {
    var renderedThunk = thunk.vnode

    if (!renderedThunk) {
        renderedThunk = thunk.vnode = thunk.render(previous)
    }

    if (!(isVNode(renderedThunk) ||
            isVText(renderedThunk) ||
            isWidget(renderedThunk))) {
        throw new Error("thunk did not return a valid node");
    }

    return renderedThunk
}

},{"./is-thunk":56,"./is-vnode":58,"./is-vtext":59,"./is-widget":60}],56:[function(require,module,exports){
module.exports = isThunk

function isThunk(t) {
    return t && t.type === "Thunk"
}

},{}],57:[function(require,module,exports){
module.exports = isHook

function isHook(hook) {
    return hook &&
      (typeof hook.hook === "function" && !hook.hasOwnProperty("hook") ||
       typeof hook.unhook === "function" && !hook.hasOwnProperty("unhook"))
}

},{}],58:[function(require,module,exports){
var version = require("./version")

module.exports = isVirtualNode

function isVirtualNode(x) {
    return x && x.type === "VirtualNode" && x.version === version
}

},{"./version":61}],59:[function(require,module,exports){
var version = require("./version")

module.exports = isVirtualText

function isVirtualText(x) {
    return x && x.type === "VirtualText" && x.version === version
}

},{"./version":61}],60:[function(require,module,exports){
module.exports = isWidget

function isWidget(w) {
    return w && w.type === "Widget"
}

},{}],61:[function(require,module,exports){
module.exports = "2"

},{}],62:[function(require,module,exports){
var version = require("./version")
var isVNode = require("./is-vnode")
var isWidget = require("./is-widget")
var isThunk = require("./is-thunk")
var isVHook = require("./is-vhook")

module.exports = VirtualNode

var noProperties = {}
var noChildren = []

function VirtualNode(tagName, properties, children, key, namespace) {
    this.tagName = tagName
    this.properties = properties || noProperties
    this.children = children || noChildren
    this.key = key != null ? String(key) : undefined
    this.namespace = (typeof namespace === "string") ? namespace : null

    var count = (children && children.length) || 0
    var descendants = 0
    var hasWidgets = false
    var hasThunks = false
    var descendantHooks = false
    var hooks

    for (var propName in properties) {
        if (properties.hasOwnProperty(propName)) {
            var property = properties[propName]
            if (isVHook(property) && property.unhook) {
                if (!hooks) {
                    hooks = {}
                }

                hooks[propName] = property
            }
        }
    }

    for (var i = 0; i < count; i++) {
        var child = children[i]
        if (isVNode(child)) {
            descendants += child.count || 0

            if (!hasWidgets && child.hasWidgets) {
                hasWidgets = true
            }

            if (!hasThunks && child.hasThunks) {
                hasThunks = true
            }

            if (!descendantHooks && (child.hooks || child.descendantHooks)) {
                descendantHooks = true
            }
        } else if (!hasWidgets && isWidget(child)) {
            if (typeof child.destroy === "function") {
                hasWidgets = true
            }
        } else if (!hasThunks && isThunk(child)) {
            hasThunks = true;
        }
    }

    this.count = count + descendants
    this.hasWidgets = hasWidgets
    this.hasThunks = hasThunks
    this.hooks = hooks
    this.descendantHooks = descendantHooks
}

VirtualNode.prototype.version = version
VirtualNode.prototype.type = "VirtualNode"

},{"./is-thunk":56,"./is-vhook":57,"./is-vnode":58,"./is-widget":60,"./version":61}],63:[function(require,module,exports){
var version = require("./version")

VirtualPatch.NONE = 0
VirtualPatch.VTEXT = 1
VirtualPatch.VNODE = 2
VirtualPatch.WIDGET = 3
VirtualPatch.PROPS = 4
VirtualPatch.ORDER = 5
VirtualPatch.INSERT = 6
VirtualPatch.REMOVE = 7
VirtualPatch.THUNK = 8

module.exports = VirtualPatch

function VirtualPatch(type, vNode, patch) {
    this.type = Number(type)
    this.vNode = vNode
    this.patch = patch
}

VirtualPatch.prototype.version = version
VirtualPatch.prototype.type = "VirtualPatch"

},{"./version":61}],64:[function(require,module,exports){
var version = require("./version")

module.exports = VirtualText

function VirtualText(text) {
    this.text = String(text)
}

VirtualText.prototype.version = version
VirtualText.prototype.type = "VirtualText"

},{"./version":61}],65:[function(require,module,exports){
var isObject = require("is-object")
var isHook = require("../vnode/is-vhook")

module.exports = diffProps

function diffProps(a, b) {
    var diff

    for (var aKey in a) {
        if (!(aKey in b)) {
            diff = diff || {}
            diff[aKey] = undefined
        }

        var aValue = a[aKey]
        var bValue = b[aKey]

        if (aValue === bValue) {
            continue
        } else if (isObject(aValue) && isObject(bValue)) {
            if (getPrototype(bValue) !== getPrototype(aValue)) {
                diff = diff || {}
                diff[aKey] = bValue
            } else if (isHook(bValue)) {
                 diff = diff || {}
                 diff[aKey] = bValue
            } else {
                var objectDiff = diffProps(aValue, bValue)
                if (objectDiff) {
                    diff = diff || {}
                    diff[aKey] = objectDiff
                }
            }
        } else {
            diff = diff || {}
            diff[aKey] = bValue
        }
    }

    for (var bKey in b) {
        if (!(bKey in a)) {
            diff = diff || {}
            diff[bKey] = b[bKey]
        }
    }

    return diff
}

function getPrototype(value) {
  if (Object.getPrototypeOf) {
    return Object.getPrototypeOf(value)
  } else if (value.__proto__) {
    return value.__proto__
  } else if (value.constructor) {
    return value.constructor.prototype
  }
}

},{"../vnode/is-vhook":57,"is-object":41}],66:[function(require,module,exports){
var isArray = require("x-is-array")

var VPatch = require("../vnode/vpatch")
var isVNode = require("../vnode/is-vnode")
var isVText = require("../vnode/is-vtext")
var isWidget = require("../vnode/is-widget")
var isThunk = require("../vnode/is-thunk")
var handleThunk = require("../vnode/handle-thunk")

var diffProps = require("./diff-props")

module.exports = diff

function diff(a, b) {
    var patch = { a: a }
    walk(a, b, patch, 0)
    return patch
}

function walk(a, b, patch, index) {
    if (a === b) {
        return
    }

    var apply = patch[index]
    var applyClear = false

    if (isThunk(a) || isThunk(b)) {
        thunks(a, b, patch, index)
    } else if (b == null) {

        // If a is a widget we will add a remove patch for it
        // Otherwise any child widgets/hooks must be destroyed.
        // This prevents adding two remove patches for a widget.
        if (!isWidget(a)) {
            clearState(a, patch, index)
            apply = patch[index]
        }

        apply = appendPatch(apply, new VPatch(VPatch.REMOVE, a, b))
    } else if (isVNode(b)) {
        if (isVNode(a)) {
            if (a.tagName === b.tagName &&
                a.namespace === b.namespace &&
                a.key === b.key) {
                var propsPatch = diffProps(a.properties, b.properties)
                if (propsPatch) {
                    apply = appendPatch(apply,
                        new VPatch(VPatch.PROPS, a, propsPatch))
                }
                apply = diffChildren(a, b, patch, apply, index)
            } else {
                apply = appendPatch(apply, new VPatch(VPatch.VNODE, a, b))
                applyClear = true
            }
        } else {
            apply = appendPatch(apply, new VPatch(VPatch.VNODE, a, b))
            applyClear = true
        }
    } else if (isVText(b)) {
        if (!isVText(a)) {
            apply = appendPatch(apply, new VPatch(VPatch.VTEXT, a, b))
            applyClear = true
        } else if (a.text !== b.text) {
            apply = appendPatch(apply, new VPatch(VPatch.VTEXT, a, b))
        }
    } else if (isWidget(b)) {
        if (!isWidget(a)) {
            applyClear = true
        }

        apply = appendPatch(apply, new VPatch(VPatch.WIDGET, a, b))
    }

    if (apply) {
        patch[index] = apply
    }

    if (applyClear) {
        clearState(a, patch, index)
    }
}

function diffChildren(a, b, patch, apply, index) {
    var aChildren = a.children
    var orderedSet = reorder(aChildren, b.children)
    var bChildren = orderedSet.children

    var aLen = aChildren.length
    var bLen = bChildren.length
    var len = aLen > bLen ? aLen : bLen

    for (var i = 0; i < len; i++) {
        var leftNode = aChildren[i]
        var rightNode = bChildren[i]
        index += 1

        if (!leftNode) {
            if (rightNode) {
                // Excess nodes in b need to be added
                apply = appendPatch(apply,
                    new VPatch(VPatch.INSERT, null, rightNode))
            }
        } else {
            walk(leftNode, rightNode, patch, index)
        }

        if (isVNode(leftNode) && leftNode.count) {
            index += leftNode.count
        }
    }

    if (orderedSet.moves) {
        // Reorder nodes last
        apply = appendPatch(apply, new VPatch(
            VPatch.ORDER,
            a,
            orderedSet.moves
        ))
    }

    return apply
}

function clearState(vNode, patch, index) {
    // TODO: Make this a single walk, not two
    unhook(vNode, patch, index)
    destroyWidgets(vNode, patch, index)
}

// Patch records for all destroyed widgets must be added because we need
// a DOM node reference for the destroy function
function destroyWidgets(vNode, patch, index) {
    if (isWidget(vNode)) {
        if (typeof vNode.destroy === "function") {
            patch[index] = appendPatch(
                patch[index],
                new VPatch(VPatch.REMOVE, vNode, null)
            )
        }
    } else if (isVNode(vNode) && (vNode.hasWidgets || vNode.hasThunks)) {
        var children = vNode.children
        var len = children.length
        for (var i = 0; i < len; i++) {
            var child = children[i]
            index += 1

            destroyWidgets(child, patch, index)

            if (isVNode(child) && child.count) {
                index += child.count
            }
        }
    } else if (isThunk(vNode)) {
        thunks(vNode, null, patch, index)
    }
}

// Create a sub-patch for thunks
function thunks(a, b, patch, index) {
    var nodes = handleThunk(a, b)
    var thunkPatch = diff(nodes.a, nodes.b)
    if (hasPatches(thunkPatch)) {
        patch[index] = new VPatch(VPatch.THUNK, null, thunkPatch)
    }
}

function hasPatches(patch) {
    for (var index in patch) {
        if (index !== "a") {
            return true
        }
    }

    return false
}

// Execute hooks when two nodes are identical
function unhook(vNode, patch, index) {
    if (isVNode(vNode)) {
        if (vNode.hooks) {
            patch[index] = appendPatch(
                patch[index],
                new VPatch(
                    VPatch.PROPS,
                    vNode,
                    undefinedKeys(vNode.hooks)
                )
            )
        }

        if (vNode.descendantHooks || vNode.hasThunks) {
            var children = vNode.children
            var len = children.length
            for (var i = 0; i < len; i++) {
                var child = children[i]
                index += 1

                unhook(child, patch, index)

                if (isVNode(child) && child.count) {
                    index += child.count
                }
            }
        }
    } else if (isThunk(vNode)) {
        thunks(vNode, null, patch, index)
    }
}

function undefinedKeys(obj) {
    var result = {}

    for (var key in obj) {
        result[key] = undefined
    }

    return result
}

// List diff, naive left to right reordering
function reorder(aChildren, bChildren) {
    // O(M) time, O(M) memory
    var bChildIndex = keyIndex(bChildren)
    var bKeys = bChildIndex.keys
    var bFree = bChildIndex.free

    if (bFree.length === bChildren.length) {
        return {
            children: bChildren,
            moves: null
        }
    }

    // O(N) time, O(N) memory
    var aChildIndex = keyIndex(aChildren)
    var aKeys = aChildIndex.keys
    var aFree = aChildIndex.free

    if (aFree.length === aChildren.length) {
        return {
            children: bChildren,
            moves: null
        }
    }

    // O(MAX(N, M)) memory
    var newChildren = []

    var freeIndex = 0
    var freeCount = bFree.length
    var deletedItems = 0

    // Iterate through a and match a node in b
    // O(N) time,
    for (var i = 0 ; i < aChildren.length; i++) {
        var aItem = aChildren[i]
        var itemIndex

        if (aItem.key) {
            if (bKeys.hasOwnProperty(aItem.key)) {
                // Match up the old keys
                itemIndex = bKeys[aItem.key]
                newChildren.push(bChildren[itemIndex])

            } else {
                // Remove old keyed items
                itemIndex = i - deletedItems++
                newChildren.push(null)
            }
        } else {
            // Match the item in a with the next free item in b
            if (freeIndex < freeCount) {
                itemIndex = bFree[freeIndex++]
                newChildren.push(bChildren[itemIndex])
            } else {
                // There are no free items in b to match with
                // the free items in a, so the extra free nodes
                // are deleted.
                itemIndex = i - deletedItems++
                newChildren.push(null)
            }
        }
    }

    var lastFreeIndex = freeIndex >= bFree.length ?
        bChildren.length :
        bFree[freeIndex]

    // Iterate through b and append any new keys
    // O(M) time
    for (var j = 0; j < bChildren.length; j++) {
        var newItem = bChildren[j]

        if (newItem.key) {
            if (!aKeys.hasOwnProperty(newItem.key)) {
                // Add any new keyed items
                // We are adding new items to the end and then sorting them
                // in place. In future we should insert new items in place.
                newChildren.push(newItem)
            }
        } else if (j >= lastFreeIndex) {
            // Add any leftover non-keyed items
            newChildren.push(newItem)
        }
    }

    var simulate = newChildren.slice()
    var simulateIndex = 0
    var removes = []
    var inserts = []
    var simulateItem

    for (var k = 0; k < bChildren.length;) {
        var wantedItem = bChildren[k]
        simulateItem = simulate[simulateIndex]

        // remove items
        while (simulateItem === null && simulate.length) {
            removes.push(remove(simulate, simulateIndex, null))
            simulateItem = simulate[simulateIndex]
        }

        if (!simulateItem || simulateItem.key !== wantedItem.key) {
            // if we need a key in this position...
            if (wantedItem.key) {
                if (simulateItem && simulateItem.key) {
                    // if an insert doesn't put this key in place, it needs to move
                    if (bKeys[simulateItem.key] !== k + 1) {
                        removes.push(remove(simulate, simulateIndex, simulateItem.key))
                        simulateItem = simulate[simulateIndex]
                        // if the remove didn't put the wanted item in place, we need to insert it
                        if (!simulateItem || simulateItem.key !== wantedItem.key) {
                            inserts.push({key: wantedItem.key, to: k})
                        }
                        // items are matching, so skip ahead
                        else {
                            simulateIndex++
                        }
                    }
                    else {
                        inserts.push({key: wantedItem.key, to: k})
                    }
                }
                else {
                    inserts.push({key: wantedItem.key, to: k})
                }
                k++
            }
            // a key in simulate has no matching wanted key, remove it
            else if (simulateItem && simulateItem.key) {
                removes.push(remove(simulate, simulateIndex, simulateItem.key))
            }
        }
        else {
            simulateIndex++
            k++
        }
    }

    // remove all the remaining nodes from simulate
    while(simulateIndex < simulate.length) {
        simulateItem = simulate[simulateIndex]
        removes.push(remove(simulate, simulateIndex, simulateItem && simulateItem.key))
    }

    // If the only moves we have are deletes then we can just
    // let the delete patch remove these items.
    if (removes.length === deletedItems && !inserts.length) {
        return {
            children: newChildren,
            moves: null
        }
    }

    return {
        children: newChildren,
        moves: {
            removes: removes,
            inserts: inserts
        }
    }
}

function remove(arr, index, key) {
    arr.splice(index, 1)

    return {
        from: index,
        key: key
    }
}

function keyIndex(children) {
    var keys = {}
    var free = []
    var length = children.length

    for (var i = 0; i < length; i++) {
        var child = children[i]

        if (child.key) {
            keys[child.key] = i
        } else {
            free.push(i)
        }
    }

    return {
        keys: keys,     // A hash of key name to index
        free: free      // An array of unkeyed item indices
    }
}

function appendPatch(apply, patch) {
    if (apply) {
        if (isArray(apply)) {
            apply.push(patch)
        } else {
            apply = [apply, patch]
        }

        return apply
    } else {
        return patch
    }
}

},{"../vnode/handle-thunk":55,"../vnode/is-thunk":56,"../vnode/is-vnode":58,"../vnode/is-vtext":59,"../vnode/is-widget":60,"../vnode/vpatch":63,"./diff-props":65,"x-is-array":42}],67:[function(require,module,exports){
/*!
 * EventEmitter v4.2.8 - git.io/ee
 * Oliver Caldwell
 * MIT license
 * @preserve
 */

module.exports = (function () {
    'use strict';

    /**
     * Class for managing events.
     * Can be extended to provide event functionality in other classes.
     *
     * @class EventEmitter Manages event registering and emitting.
     */
    function EventEmitter() {}

    // Shortcuts to improve speed and size
    var proto = EventEmitter.prototype;
    var exports = this;
    var originalGlobalValue = exports.EventEmitter;

    /**
     * Finds the index of the listener for the event in its storage array.
     *
     * @param {Function[]} listeners Array of listeners to search through.
     * @param {Function} listener Method to look for.
     * @return {Number} Index of the specified listener, -1 if not found
     * @api private
     */
    function indexOfListener(listeners, listener) {
        var i = listeners.length;
        while (i--) {
            if (listeners[i].listener === listener) {
                return i;
            }
        }

        return -1;
    }

    /**
     * Alias a method while keeping the context correct, to allow for overwriting of target method.
     *
     * @param {String} name The name of the target method.
     * @return {Function} The aliased method
     * @api private
     */
    function alias(name) {
        return function aliasClosure() {
            return this[name].apply(this, arguments);
        };
    }

    /**
     * Returns the listener array for the specified event.
     * Will initialise the event object and listener arrays if required.
     * Will return an object if you use a regex search. The object contains keys for each matched event. So /ba[rz]/ might return an object containing bar and baz. But only if you have either defined them with defineEvent or added some listeners to them.
     * Each property in the object response is an array of listener functions.
     *
     * @param {String|RegExp} evt Name of the event to return the listeners from.
     * @return {Function[]|Object} All listener functions for the event.
     */
    proto.getListeners = function getListeners(evt) {
        var events = this._getEvents();
        var response;
        var key;

        // Return a concatenated array of all matching events if
        // the selector is a regular expression.
        if (evt instanceof RegExp) {
            response = {};
            for (key in events) {
                if (events.hasOwnProperty(key) && evt.test(key)) {
                    response[key] = events[key];
                }
            }
        }
        else {
            response = events[evt] || (events[evt] = []);
        }

        return response;
    };

    /**
     * Takes a list of listener objects and flattens it into a list of listener functions.
     *
     * @param {Object[]} listeners Raw listener objects.
     * @return {Function[]} Just the listener functions.
     */
    proto.flattenListeners = function flattenListeners(listeners) {
        var flatListeners = [];
        var i;

        for (i = 0; i < listeners.length; i += 1) {
            flatListeners.push(listeners[i].listener);
        }

        return flatListeners;
    };

    /**
     * Fetches the requested listeners via getListeners but will always return the results inside an object. This is mainly for internal use but others may find it useful.
     *
     * @param {String|RegExp} evt Name of the event to return the listeners from.
     * @return {Object} All listener functions for an event in an object.
     */
    proto.getListenersAsObject = function getListenersAsObject(evt) {
        var listeners = this.getListeners(evt);
        var response;

        if (listeners instanceof Array) {
            response = {};
            response[evt] = listeners;
        }

        return response || listeners;
    };

    /**
     * Adds a listener function to the specified event.
     * The listener will not be added if it is a duplicate.
     * If the listener returns true then it will be removed after it is called.
     * If you pass a regular expression as the event name then the listener will be added to all events that match it.
     *
     * @param {String|RegExp} evt Name of the event to attach the listener to.
     * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.addListener = function addListener(evt, listener) {
        var listeners = this.getListenersAsObject(evt);
        var listenerIsWrapped = typeof listener === 'object';
        var key;

        for (key in listeners) {
            if (listeners.hasOwnProperty(key) && indexOfListener(listeners[key], listener) === -1) {
                listeners[key].push(listenerIsWrapped ? listener : {
                    listener: listener,
                    once: false
                });
            }
        }

        return this;
    };

    /**
     * Alias of addListener
     */
    proto.on = alias('addListener');

    /**
     * Semi-alias of addListener. It will add a listener that will be
     * automatically removed after its first execution.
     *
     * @param {String|RegExp} evt Name of the event to attach the listener to.
     * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.addOnceListener = function addOnceListener(evt, listener) {
        return this.addListener(evt, {
            listener: listener,
            once: true
        });
    };

    /**
     * Alias of addOnceListener.
     */
    proto.once = alias('addOnceListener');

    /**
     * Defines an event name. This is required if you want to use a regex to add a listener to multiple events at once. If you don't do this then how do you expect it to know what event to add to? Should it just add to every possible match for a regex? No. That is scary and bad.
     * You need to tell it what event names should be matched by a regex.
     *
     * @param {String} evt Name of the event to create.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.defineEvent = function defineEvent(evt) {
        this.getListeners(evt);
        return this;
    };

    /**
     * Uses defineEvent to define multiple events.
     *
     * @param {String[]} evts An array of event names to define.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.defineEvents = function defineEvents(evts) {
        for (var i = 0; i < evts.length; i += 1) {
            this.defineEvent(evts[i]);
        }
        return this;
    };

    /**
     * Removes a listener function from the specified event.
     * When passed a regular expression as the event name, it will remove the listener from all events that match it.
     *
     * @param {String|RegExp} evt Name of the event to remove the listener from.
     * @param {Function} listener Method to remove from the event.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.removeListener = function removeListener(evt, listener) {
        var listeners = this.getListenersAsObject(evt);
        var index;
        var key;

        for (key in listeners) {
            if (listeners.hasOwnProperty(key)) {
                index = indexOfListener(listeners[key], listener);

                if (index !== -1) {
                    listeners[key].splice(index, 1);
                }
            }
        }

        return this;
    };

    /**
     * Alias of removeListener
     */
    proto.off = alias('removeListener');

    /**
     * Adds listeners in bulk using the manipulateListeners method.
     * If you pass an object as the second argument you can add to multiple events at once. The object should contain key value pairs of events and listeners or listener arrays. You can also pass it an event name and an array of listeners to be added.
     * You can also pass it a regular expression to add the array of listeners to all events that match it.
     * Yeah, this function does quite a bit. That's probably a bad thing.
     *
     * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add to multiple events at once.
     * @param {Function[]} [listeners] An optional array of listener functions to add.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.addListeners = function addListeners(evt, listeners) {
        // Pass through to manipulateListeners
        return this.manipulateListeners(false, evt, listeners);
    };

    /**
     * Removes listeners in bulk using the manipulateListeners method.
     * If you pass an object as the second argument you can remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
     * You can also pass it an event name and an array of listeners to be removed.
     * You can also pass it a regular expression to remove the listeners from all events that match it.
     *
     * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to remove from multiple events at once.
     * @param {Function[]} [listeners] An optional array of listener functions to remove.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.removeListeners = function removeListeners(evt, listeners) {
        // Pass through to manipulateListeners
        return this.manipulateListeners(true, evt, listeners);
    };

    /**
     * Edits listeners in bulk. The addListeners and removeListeners methods both use this to do their job. You should really use those instead, this is a little lower level.
     * The first argument will determine if the listeners are removed (true) or added (false).
     * If you pass an object as the second argument you can add/remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
     * You can also pass it an event name and an array of listeners to be added/removed.
     * You can also pass it a regular expression to manipulate the listeners of all events that match it.
     *
     * @param {Boolean} remove True if you want to remove listeners, false if you want to add.
     * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add/remove from multiple events at once.
     * @param {Function[]} [listeners] An optional array of listener functions to add/remove.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.manipulateListeners = function manipulateListeners(remove, evt, listeners) {
        var i;
        var value;
        var single = remove ? this.removeListener : this.addListener;
        var multiple = remove ? this.removeListeners : this.addListeners;

        // If evt is an object then pass each of its properties to this method
        if (typeof evt === 'object' && !(evt instanceof RegExp)) {
            for (i in evt) {
                if (evt.hasOwnProperty(i) && (value = evt[i])) {
                    // Pass the single listener straight through to the singular method
                    if (typeof value === 'function') {
                        single.call(this, i, value);
                    }
                    else {
                        // Otherwise pass back to the multiple function
                        multiple.call(this, i, value);
                    }
                }
            }
        }
        else {
            // So evt must be a string
            // And listeners must be an array of listeners
            // Loop over it and pass each one to the multiple method
            i = listeners.length;
            while (i--) {
                single.call(this, evt, listeners[i]);
            }
        }

        return this;
    };

    /**
     * Removes all listeners from a specified event.
     * If you do not specify an event then all listeners will be removed.
     * That means every event will be emptied.
     * You can also pass a regex to remove all events that match it.
     *
     * @param {String|RegExp} [evt] Optional name of the event to remove all listeners for. Will remove from every event if not passed.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.removeEvent = function removeEvent(evt) {
        var type = typeof evt;
        var events = this._getEvents();
        var key;

        // Remove different things depending on the state of evt
        if (type === 'string') {
            // Remove all listeners for the specified event
            delete events[evt];
        }
        else if (evt instanceof RegExp) {
            // Remove all events matching the regex.
            for (key in events) {
                if (events.hasOwnProperty(key) && evt.test(key)) {
                    delete events[key];
                }
            }
        }
        else {
            // Remove all listeners in all events
            delete this._events;
        }

        return this;
    };

    /**
     * Alias of removeEvent.
     *
     * Added to mirror the node API.
     */
    proto.removeAllListeners = alias('removeEvent');

    /**
     * Emits an event of your choice.
     * When emitted, every listener attached to that event will be executed.
     * If you pass the optional argument array then those arguments will be passed to every listener upon execution.
     * Because it uses `apply`, your array of arguments will be passed as if you wrote them out separately.
     * So they will not arrive within the array on the other side, they will be separate.
     * You can also pass a regular expression to emit to all events that match it.
     *
     * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
     * @param {Array} [args] Optional array of arguments to be passed to each listener.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.emitEvent = function emitEvent(evt, args) {
        var listeners = this.getListenersAsObject(evt);
        var listener;
        var i;
        var key;
        var response;

        for (key in listeners) {
            if (listeners.hasOwnProperty(key)) {
                i = listeners[key].length;

                while (i--) {
                    // If the listener returns true then it shall be removed from the event
                    // The function is executed either with a basic call or an apply if there is an args array
                    listener = listeners[key][i];

                    if (listener.once === true) {
                        this.removeListener(evt, listener.listener);
                    }

                    response = listener.listener.apply(this, args || []);

                    if (response === this._getOnceReturnValue()) {
                        this.removeListener(evt, listener.listener);
                    }
                }
            }
        }

        return this;
    };

    /**
     * Alias of emitEvent
     */
    proto.trigger = alias('emitEvent');

    /**
     * Subtly different from emitEvent in that it will pass its arguments on to the listeners, as opposed to taking a single array of arguments to pass on.
     * As with emitEvent, you can pass a regex in place of the event name to emit to all events that match it.
     *
     * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
     * @param {...*} Optional additional arguments to be passed to each listener.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.emit = function emit(evt) {
        var args = Array.prototype.slice.call(arguments, 1);
        return this.emitEvent(evt, args);
    };

    /**
     * Sets the current value to check against when executing listeners. If a
     * listeners return value matches the one set here then it will be removed
     * after execution. This value defaults to true.
     *
     * @param {*} value The new value to check for when executing listeners.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.setOnceReturnValue = function setOnceReturnValue(value) {
        this._onceReturnValue = value;
        return this;
    };

    /**
     * Fetches the current value to check against when executing listeners. If
     * the listeners return value matches this one then it should be removed
     * automatically. It will return true by default.
     *
     * @return {*|Boolean} The current value to check for or the default, true.
     * @api private
     */
    proto._getOnceReturnValue = function _getOnceReturnValue() {
        if (this.hasOwnProperty('_onceReturnValue')) {
            return this._onceReturnValue;
        }
        else {
            return true;
        }
    };

    /**
     * Fetches the events object and creates one if required.
     *
     * @return {Object} The events storage object.
     * @api private
     */
    proto._getEvents = function _getEvents() {
        return this._events || (this._events = {});
    };

    /**
     * Reverts the global {@link EventEmitter} to its previous value and returns a reference to this version.
     *
     * @return {Function} Non conflicting EventEmitter class.
     */
    EventEmitter.noConflict = function noConflict() {
        exports.EventEmitter = originalGlobalValue;
        return EventEmitter;
    };

    return EventEmitter;

}.call({}));
},{}],68:[function(require,module,exports){
'use strict';

/*
 * ACTION
 * ====================================================================================
 * Creates a single function or a map of functions that when called with arguments will
 * emit a "trigger" event, passing the arguments
 * ====================================================================================
 */

var EventEmitter = require('./EventEmitter.js');
var error = require('./error.js');
var utils = require('./utils.js');

var createActionFunction = function (actionName) {

  // Create the action function
  var fn = function () {

    // Grab all the arguments and convert to array
    var args = utils.deepClone(Array.prototype.slice.call(arguments, 0));

    if (!fn._events) {
      return error.create({
        source: fn.handlerName,
        message: 'You are triggering an action that nobody listens to',
        support: 'Remember to add actions to your stores',
        url: 'https://github.com/christianalfoni/jflux/blob/master/DOCUMENTATION.md#jflux-store'
      });
    }
    // Merge arguments array with "trigger", which is the
    // event that will be triggered, passing the original arguments
    // as arguments to the "trigger" event
    args = ['trigger'].concat(args);
    fn.emit.apply(fn, args);
  };

  // It is possible to listen to the function and to achieve that we
  // have to manually inherit methods from EventEmitter
  for (var prop in EventEmitter.prototype) {
    if (EventEmitter.prototype.hasOwnProperty(prop)) {
      fn[prop] = EventEmitter.prototype[prop];
    }
  }

  // Add handlerName
  fn.handlerName = actionName;

  return fn;

};

var action = function () {

  if (Array.isArray(arguments[0])) {
    var actionMap = {};
    arguments[0].forEach(function (actionName) {
      actionMap[actionName] = createActionFunction(actionName);
    });
    return actionMap;
  }

  error.create({
    source: arguments[0],
    message: 'Could not create action(s)',
    support: 'Pass no arguments or an array of strings',
    url: 'https://github.com/christianalfoni/jflux/blob/master/DOCUMENTATION.md#jflux-action'
  });

};

module.exports = action;
},{"./EventEmitter.js":67,"./error.js":75,"./utils.js":83}],69:[function(require,module,exports){
'use strict';

/*
 * COMPONENT
 * ====================================================================================
 * Composable components that only updates diffs etc.
 * ====================================================================================
 */

 var dom = require('./dom.js');
 var toHTML = require('vdom-to-html');
 var utils = require('./utils.js');
 var Constructor = require('./component/Constructor.js');
 var error = require('./error.js');
 var convertAttributes = require('./component/convertAttributes.js');
 var h = require('virtual-dom/h');
 var diff = require('virtual-dom/diff');
 var patch = require('virtual-dom/patch');
 var createElement = require('virtual-dom/create-element');
 var dataStore = require('./dataStore.js');
 var config = require('./config.js');
 var exports = {};

 Constructor.prototype = {
  constructor: Constructor,

  // Runs when the component is added to the DOM by $$.render
  _init: function (target) {

    if (this.init) {
      this.init(target);
    }

    if (this.components) {
      Object.keys(this.components).forEach(function(name) {
        var comp = this.components[name];
        if (comp instanceof Constructor) this.components[name] = this._map([comp.props], function (compile) { return compile(comp) }, name);
        this.render_groups[name] = 0;
      }.bind(this));
    }

    this._VTree = this._renderByMode();

    if (!this._VTree) {
      error.create({
        source: this._renders,
        message: 'Missing compiled DOM representation',
        support: 'You have to return a compile call from the render method'
      });
    }

    // Compile the renders, add bindings and listeners
    var el = createElement(this._VTree);

    if (typeof target != 'undefined') {
      (function() {
        var $bootstrap_el, $rendr_el, rendr_VTree, exist_VTree;
        $bootstrap_el = dom.$(target);
        if (!$bootstrap_el.length) {
          error.create({
            source: this._renders,
            message: 'Bootstrap element with selector: ' + target + ' does not exist' + ((this.component && this.component.name) ? ' for component: ' + this.component.name : ''),
            support: 'You have to bootstrap component with existed element in your server rendered HTML'
          });
        }
        $rendr_el = dom.$(el);
        rendr_VTree = this._buildVTree($rendr_el, this, this, 'bootstrap');
        exist_VTree = this._buildVTree($bootstrap_el, this, this, 'bootstrap');
        this.$el = dom.$(patch($bootstrap_el[0], diff(exist_VTree, rendr_VTree)));
      }).call(this);
    } else {
      this.$el = dom.$(el);
    }

    this._addBindings();
    this._addListeners();

    this.$el.on('destroy', this._remove.bind(this));

    this._clone = function (render) {
      var clone = new Constructor({});
      clone = utils.mergeTo(clone, this._description);
      clone._description = this._description;
      if (render) {
        clone.props = this.props;
      } else {
        clone._init();
      }
      return clone;
    }.bind(this);

    if (this.afterRender) {
      this.afterRender();
    }

    dataStore.addComponent(this._componentId, this);

    this.toHTML = function() {
      return toHTML(this._VTree);
    };

    this.isServer = function () {
      return config().server;
    };

    if (this.animation && this.animation.in) {
      this._animation('in');
    } else {
        return this;
    }
  },

  _renderByMode: function () {

    var Dust = config().dust;
    var component = this;

    var args = Dust && this.template ? [] : [this._compiler.bind(this)];
    var render = this.render ? this.render.apply(this, args) : this.dust_render(this.template)(this);

    if (typeof render === 'string') {
      return this._buildVTree(render, this, this);
    } else {
      return render;
    }

  },
  
  renderToString: function() {
    return this.toHTML();
  },

  dust_render: function(template) {
    var Dust = config().dust;
    return function templatesWrapper(data) {
      var result;
      Dust.render(template, data, function(err, data) {
        if (err) {
          throw err;
        }
        result = data;
      });
      return result;
    }
  },

  destroy: function(cb) {
      var _t = this;
      if (this.isServer()) {
        _t._remove();
        dom.$(this).remove();
        cb();
        return;
      }
      if (!dom.$.contains(document.body, this.$el[0])) {
        _t._remove();
        return cb();
      }
      this._animation('out', function() {
        var i = setInterval(function(){

          if (_t._currentAnimation == null) {
            clearInterval(i);
            _t._remove();
            dom.$(this).remove();
            cb();
          }
        }, 0);
      });
  },

  _animation: function(type, cb) {
    var $isFn = dom.$.isFunction;
    var el = this.$el;
    var an = this.animation;
    if (this.isServer()) {
        this._currentAnimation = null;
        this._new = false;
        if ($isFn(cb)) cb();
        return;
    }
    if (an && $isFn(an[type])) {
        an[type](el, function(){
          if ($isFn(cb)) cb();
      });
    return;
    } else if (an && dom.$.type(an[type]) === "string" && an[type].indexOf('animated') == 0) {
      var _this = this;
      this._currentAnimation = an[type];
      el.addClass(an[type]).one('animationend webkitAnimationEnd MSAnimationEnd oAnimationEnd', function(e){
        _this._currentAnimation = null;
        _this._new = false;
        if (type !== 'out') el.removeClass(an[type]);
      });
      if ($isFn(cb)) cb();
      return;
      }
    this._currentAnimation = null;
    if ($isFn(cb)) cb();
  },

  // Cleans up the listeners and removes the component from the DOM
  _remove: function () {
    if (this.beforeRemove) {
      this.beforeRemove();
    }
    this._listeners.forEach(function (listener) {
      listener.target.removeListener(listener.type, listener.cb);
    });
    dataStore.remove(this._componentId);
    return this;
  },

  // Adds bindings to inputs, so that properties and the component itself updates instantly
  _addBindings: function () {

    var component = this;
    Object.keys(this.bindings).forEach(function (binding) {

      var $el = binding ? component.$(binding) : component.$el;

      if ($el.is(':checkbox')) {

        $el.on('change', function () {
          var grabObject = utils.createGrabObject(component, component.bindings[binding]);
          grabObject.context[grabObject.prop] = $el.is(':checked');
          $el.trigger('$$-change');
          component.update();
        });

      } else {

        $el.on('keydown', function (event) {

          // Do not update on ENTER due to form submit
          if (event.keyCode !== 13) {

            // Use setTimeout to grab the value after keydown has run.
            // Gives the best experience
            setTimeout(function () {
              var grabObject = utils.createGrabObject(component, component.bindings[binding]);
              grabObject.context[grabObject.prop] = $el.val();
              $el.trigger('$$-change');
              component.update();
            }, 0);

          }

        });

      }

    });
  },

  // Adds interaction listeners, like "click" etc.
  _addListeners: function () {
    var component = this;

    Object.keys(this.events).forEach(function (listenerDefinition) {

      var listener = utils.extractTypeAndTarget(listenerDefinition);

      if (!component[component.events[listenerDefinition]]) {
        error.create({
          source: component[component.events[listenerDefinition]],
          message: 'There is no method called ' + component.events[listenerDefinition],
          support: 'Make sure that you add methods described in events on your component'
        })
      }

      if (listener.target) {
        component.$el.on(listener.type, listener.target, function (event) {

          var $target = dom.$(event.currentTarget);
          event.data = $target.data('data');
          component[component.events[listenerDefinition]](event);

        });
      } else {

      component.$el.on(listener.type, function (event, dd) {
      event.data = component.$el.data('data');
      component[component.events[listenerDefinition]](event, dd);

         });
      }

    });
  },

  _buildVTree: function (html, context, component, bootstrap) {

  var traverse = function (node) {

  
    // If top node is a component, return a component
    if (node.nodeType === 8 && node.nodeValue.match(/Component\:.*/)) {
        var id = node.nodeValue.match(/Component\:(.*)/)[1];
        return h('component', {
          id: id,
          'data-component':  id
        }, []);
    }

    // Props map
    var props = {};

    if (node.value) props.value = node.value;
    if (node.checked) props.checked = node.checked;

    // Supplement with attributes on the node
    if (node.attributes) {
    props.attributes = {};
    for (var x = 0; x < node.attributes.length; x++) {
      var nodeName = node.attributes[x].nodeName;
      var nodeValue = node.attributes[x].nodeValue;
      props.attributes[nodeName] = nodeValue;
    }
    }

    if (typeof bootstrap == 'undefined') {
    convertAttributes(props, node, context, component);
    }

    // Create VTree node
    return h(node.tagName, props, 

    (function () {

      var ch = [];
      for (var x = 0; x < node.childNodes.length; x++) {
      var childNode = node.childNodes[x];
      if (childNode.nodeType === 3) {
        ch.push(childNode.nodeValue);
      } else {
        var el = traverse(childNode);
        ch.push(el);
      }
      }
      return ch;

    }())
    )
  };

  if (typeof bootstrap == 'undefined') {
    var $node = dom.$(html);
  } else {
    var $node = html;
  }
  return traverse($node[0]);
  },

  _compiler: function (scomp) {
    scomp._init();
    return scomp;
  },

  $: function (query) {
    return this.$el.find(query);
  },

  jquery: function() {
    return dom.$;
  },

  update: function () {

    if (this.componentWillUpdate) {
      this.componentWillUpdate();
    }
    
    var comp = this;
    this._currentNodeIndex = 0;
    this._subnameIndex = 0;
    this._componentsUpdate = {};

    // reset group components
    Object.keys(comp.render_groups).forEach(function(key) {
        comp.render_groups[key] = 0;
    });

    dataStore.clear(this._dataStoreId);

    var compontents2remove = [];

    // render component first from template with all subcomponents
    this._VTree = this._renderByMode();

    // return cb();

    var def = function(comp) {
        var deff = new dom.$.Deferred();
        if (typeof comp == 'undefined') return deff.resolve();
        comp._delete = true;
        comp.destroy(function(){
            deff.resolve();
        });
        return deff.promise();
    };

    if (dom.$.isEmptyObject(this._componentsMap)) return cb();

    Object.keys(this._componentsMap).forEach(function(group) {
        if (dom.$.isEmptyObject(comp._componentsUpdate[group])) {
            comp._componentsMap[group].forEach(function(item) {
              compontents2remove.push(def(item));
            });
        } else {
        comp._componentsMap[group].forEach(function(was_in_group, i){
          var now_in_group = comp._componentsUpdate[group][i];
          if (!now_in_group || (now_in_group && now_in_group.$el[0] !== was_in_group.$el[0])) {
            compontents2remove.push(def(was_in_group));
          }
        });
        }
    });
    if (compontents2remove.length > 0) {
        dom.$.when.apply(null, compontents2remove).done(function() {
        cb();
      });
    } else {
      cb();
    }

    function cb() {
      if (typeof comp._VTree == 'undefined') return;
      // rebuild VTree from exist component element
      var existVTree = comp._buildVTree(comp.$el, comp, comp, 'bootstrap');
      var patches = diff(existVTree, comp._VTree);
      var html = patch(comp.$el[0], patches);
      comp._update();
    };
  },

  _update: function() {
    var _this = this;

    this.$el.find('component').each(function(i, el) {
      var $component = dom.$(el);
      var id = $component.attr('id');
      var comp = dataStore.getComponent(id);
      var $el = (dataStore.getComponent(id) && dataStore.getComponent(id).$el) || [];
      if (!$el.length) { 
        $component.remove();
      } else {
        $component.replaceWith($el.removeAttr('data-component'));
        comp.render_group = {};
      }
    });
    // clean up componentsMap based on componentsUpdate
    Object.keys(this._componentsMap).forEach(function(group) {
      if (!this._componentsUpdate[group]) { 
        this._componentsMap[group] = dom.$.grep(this._componentsMap[group], function(comp){
            return comp && comp._onremove_hide;
        });
        if (this._componentsMap[group].length == 0) delete this._componentsMap[group];
      } else {
        this._componentsMap[group] = dom.$.grep(this._componentsUpdate[group], function(comp){
            if (comp && comp._onremove_hide) return comp;
            return comp && !comp._delete;
        });
      }
    }.bind(this));

    if (this.componentDidUpdate) {
      this.componentDidUpdate();
    }
    
    this._animation(this._new? null : 'update');
    this._new = false;
  },

  listenToChange: function (target, cb) {
    this.listenTo(target, 'change', cb);
  },

  listenTo: function (target, type, cb) {

    if (this._isRendering) {
      error.create({
        source: null,
        message: 'You are running listenTo in your render',
        support: 'The listenTo method is to be run in the init method'
      });
    }

    cb = cb.bind(this);
    this._listeners.push({
      target: target,
      type: type,
      cb: cb
    });
    target.on(type, cb);
  },

  _map: function (constrs, cb, subname) {
    var comp = this;
    comp._subnameIndex++;
    comp._currentNodeIndex = 0;
    if (typeof subname == 'undefined') {
      subname = 'subs' + comp._subnameIndex;
    }
    comp._currentsubname = subname;
    var subarr = constrs.map(function (item, index) {
      var context = {
        item: item,
        props: comp.props,
        index: index,
        _component: comp
      };
      return cb.call(context, comp._compiler.bind(context));
    });
    comp._currentsubname = null;
    return subarr;
  }
};

module.exports = function (description) {
  return function () {
    var args = Array.prototype.slice.call(arguments);
    var props = args[0];
    var children = args[1];
    if (typeof props === 'string') {
      children = props;
      props = {};
    }
    var base = new Constructor(props, children);
    var component = utils.mergeTo(base, description);
    component._description = description;
    return component;
  }
};
},{"./component/Constructor.js":70,"./component/convertAttributes.js":71,"./config.js":72,"./dataStore.js":73,"./dom.js":74,"./error.js":75,"./utils.js":83,"vdom-to-html":22,"virtual-dom/create-element":33,"virtual-dom/diff":34,"virtual-dom/h":35,"virtual-dom/patch":43}],70:[function(require,module,exports){
'use strict';

var dom = require('./../dom.js');
var dataStore = require('./../dataStore.js');

function Component (props, children) {

  // Used to keep track of components and data
  // this._dataStoreId = dataStore.create();
  this._componentId = dataStore.newComponentId();
  // Used by traditional compile to set an ID on nested components, but also by
  // templating to set ID using helpers
  this._currentAnimation = null;
  this._currentNodeIndex = 0;
  this._subnameIndex = 0;
  this._VTree = null;
  this._VTreeLists = [];
  this._componentsUpdate = {};
  this._componentsMap = {};
  this._isRendering = false;
  this._delete = false;
  this._onremove_hide = false;
  this._new = true;
  this._bindings = [];
  this._listeners = [];
  this._children = children;

  this.events = {};
  this.bindings = {};
  this.render_groups = {};
  this.props = props || {};
  this.props.children = children || '';

  // Used by templating version to expose components to templates
  this.components = {};
}

module.exports = Component;
},{"./../dataStore.js":73,"./../dom.js":74}],71:[function(require,module,exports){
'use strict';

/*
 * CONVERTATTRIBUTES
 * ====================================================================================
 * Converts jFlux attributes to HTML attributes, and them removes the jFlux version.
 * The jFlux attribute is a property on a context. The value fetched is then use
 * to set the correct HTML attribute
 * ====================================================================================
 */
var dom = require('./../dom.js');
var utils = require('./../utils.js');
var dataStore = require('./../dataStore.js');

var converters = {
  '$$-id': function (node, value, props, context) {
    props['id'] = utils.grabContextValue(context, value);
    delete props.attributes['$$-id'];
  },
  '$$-class': function (node, value, props, context) {
    var attrValue = utils.grabContextValue(context, value);
    var classString = utils.createClassString(attrValue);
    if (classString) props['className'] = classString;
    delete props.attributes['$$-class'];
  },
  '$$-style': function (node, value, props, context) {
    props['style'] = utils.grabContextValue(context, value);
    delete props.attributes['$$-style'];
  },
  '$$-checked': function (node, value, props, context) {
    props['checked'] = utils.grabContextValue(context, value);
    delete props.attributes['$$-checked'];
  },
  '$$-disabled': function (node, value, props, context) {
    props['disabled'] = utils.grabContextValue(context, value);
    delete props.attributes['$$-disabled'];
  },
  '$$-value': function (node, value, props, context) {
    props['value'] = utils.grabContextValue(context, value);
    delete props.attributes['$$-value'];
  },
  '$$-href': function (name, value, props, context) {
    props['href'] = utils.grabContextValue(context, value);
    delete props.attributes['$$-href'];
  },
  '$$-show': function (node, value, props, context) {
    var show = utils.grabContextValue(context, value);
    props.style = props.style || {};
    if (show) {
      props.style.display = window.getComputedStyle(node, null).display;
    } else {
      props.style.display = 'none';
    }
    delete props.attributes['$$-show'];
  },
  '$$-hide': function (node, value, props, context) {
    var hide = utils.grabContextValue(context, value);
    props.style  = props.style || {};
    if (hide) {
      props.style.display = 'none';
    } else {
      props.style.display = window.getComputedStyle(node, null).display;
    }
    delete props.attributes['$$-hide'];
  },
  '$$-key': function (node, value, props, context) {
    props['key'] = utils.grabContextValue(context, value);
    delete props.attributes['$$-key'];
  },
  '$$-data': function (node, value, props, context, component) {
    component._dataStoreId = dataStore.create(component._componentId, utils.grabContextValue(context, value));
    props.attributes['data-store'] = component._dataStoreId;
    // props.attributes['data-store'] = component._componentId + '_' + component._currentNodeIndex;
    delete props.attributes['$$-data'];
  }
};

var convertAttributes = function (props, node, context, component) {

  Object.keys(node.attributes).forEach(function (attr) {
    var name = node.attributes[attr].nodeName;
    if (name && converters[name]) {
      var value = node.attributes[attr].nodeValue;
      converters[name](node, value, props, context, component);
    }
  });

};

module.exports = convertAttributes;
},{"./../dataStore.js":73,"./../dom.js":74,"./../utils.js":83}],72:[function(require,module,exports){
(function (global){
'use strict';

/*
 * CONFIG
 * ====================================================================================
 * Holds default config
 * ====================================================================================
 */
var utils = require('./utils.js');

var _options = {

    // jFlux will add application/json to request headers and parse
    // responses to JSON
    json: true,

    // If the application lives at /somePath, jFlux needs to know about it
    baseUrl: '',

    // Runing on server ?
    server: false,

    // Expose $$
    global: true,

    // Activates HTML5 pushState instead of HASH
    pushState: false,

    // Tells jFlux to run the $$.run method automatically, which routes to
    // current path
    autoRun: true,

    jquery: null,

    // Pass instance of DustJs to use DustJs templates
    dust: (typeof window != 'undefined' && window.dust) || require('dustjs-helpers')

};

var config = function (options) {
    if (!options) {
        return _options;
    } else {
        utils.mergeTo(_options, options);
        if (options.jquery) { 
            var dom = require('./dom.js').set$(options.jquery);
        }
    }
    if (options.dust) {
      registerDustHelpers(options.dust);
    }
    if (options.global === false && global.$$) {
      delete global.$$;
    }
};

var registerDustHelpers = function(Dust) {  

  if (typeof window != 'undefined' && !window.dust) window.dust = Dust;

  if (typeof Dust.helpers.Component == 'undefined') {
    Dust.helpers.Component = function(chunk, context, bodies, params) {

      var idx = context.stack.index || 0;
      var of = context.stack.of || 0;

      params.children = '';
      chunk.tap(function (data) {
          params.children += data;
          return '';
      }).render(bodies.block, context).untap();

        var name = params.name,
            name_org = name,
            group = params.group,
            compname = context.get('component.name'),
            render_groups = context.get('render_groups'),
            componentsUpdate = context.get('_componentsUpdate'),
            componentsMap = context.get('_componentsMap'),
            out = [];

        var components = context.get('components');

        if (typeof components[name] == 'undefined' || components[name].length == 0) {
          console.info('Dust templates subcomponent with name: "' + name + '" not found or empty' + (compname ? ' for component: ' + compname : '') + '. jFlux wont render it.');
          return;
        }

        if (group) name = name + '_g' + group;
      
        var update = false;
        var clone = false;

        if (idx == 0) { 
          if (!Array.isArray(componentsMap[name])) { 
            componentsMap[name] = [];
            componentsMap[name][0] = components[name_org][0];
            clone = true;
          }
         render_groups[name]++;
        }

        var item = componentsMap[name][idx];

        if (typeof item != 'undefined' && render_groups[name] > 1 && idx == 0 && of == 0) {
          // single clone sub component group
          name = name + '_c' + (render_groups[name] - 1);
          if (typeof componentsMap[name] == 'undefined') { 
            clone = true;
          } else {
            item = componentsMap[name][idx];
          }
        } else if (typeof item != 'undefined' && render_groups[name] > 1 && of > 0) {             
          // multi clone sub component group
          item = componentsMap[name][0];
          name = name + '_c' + (render_groups[name] - 1);

          if (typeof componentsMap[name] != 'undefined' && typeof componentsMap[name][idx] != 'undefined') { 
            item = componentsMap[name][idx];
          } else {
            clone = true;
          }
        } else if (typeof item == 'undefined' && idx > 0) { 
          item = components[name_org][0];
          clone = true;
        }

        if (clone) {
         
          var item_clone = item._clone();
          
          if (!Array.isArray(componentsMap[name])) {
            componentsMap[name] = [];
          }

          componentsMap[name][idx] = item_clone;
          item = item_clone;
        } 
        
        if (typeof item == 'undefined') return chunk.write('');

        var id = item._componentId;

        if (params['onremove'] == 'keep') item._onremove_hide = true;

        Object.keys(params).forEach(function(param) {
          if ((param !== 'name' && param !== 'type') && item.props[param] !== params[param]) {
            item.props[param] = params[param];
            update = true;
          }
        });

        if (update) item.update();
        var $el = item.$el;

        if (params.type !== 'static' && !config().server) {
          out.push('<component id=' + id + ' />');
          $el.attr('data-component', id); //.attr('data-debug', item._componentId);
        } else {
          out.push(item.toHTML());
        }
        if (!Array.isArray(componentsUpdate[name])) {
          componentsUpdate[name] = [];
        } 
        componentsUpdate[name][idx] = item;
        return chunk.write(out.join(''));
    };
  }
};

if (!_options.dust) {
    console.error('DustJs not loaded, please provide dustjs instance for jflux-dust in config');
    } else {
    registerDustHelpers(_options.dust);
}

module.exports = config;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./dom.js":74,"./utils.js":83,"dustjs-helpers":14}],73:[function(require,module,exports){
'use strict';

var componentId = 0;
var stores = {};
var components = {};

module.exports = {
  create: function (compId, data) {
    stores[compId] = data;
    return compId;
  },
  clear: function(compId) {
    stores[compId] = {};
  },
  remove: function(compId) {
    delete stores[compId];
    delete components[compId];
  },
  get: function(compId) {
    return stores[compId] ? stores[compId] : null;  
  },
  newComponentId: function() {
    return ++componentId;
  },
  getComponent: function(compId) {
    return components[compId] ? components[compId] : null;  
  },
  getComponentsSize: function(compId) {
    return Object.size(components);  
  },
  addComponent: function(compId, comp) {
    components[compId] = comp;
  }
};

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};
},{}],74:[function(require,module,exports){
(function (global){
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
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./config.js":72,"jquery":"jquery"}],75:[function(require,module,exports){
'use strict';

module.exports = {
  create: function (options) {
    var errorString = 'jflux-dust error: ';
    var keys = Object.keys(options);
    if (keys.indexOf('source') >= 0) {
      errorString += (typeof options.source === 'object' && options.source !== null ? JSON.stringify(options.source) : options.source) + '. ';
    }
    if (keys.indexOf('message') >= 0) {
      errorString += options.message + '. ';
    }
    if (keys.indexOf('support') >= 0) {
      errorString += options.support + '. ';
    }
    throw new Error(errorString);
  }
};
},{}],76:[function(require,module,exports){
(function (global){
'use strict';

var config = require('./config.js');
var dom = require('./dom.js');
var render = require('./jflux/render.js');
var path = require('./jflux/path.js');
var component = require('./component.js');
var router = require('./router.js');
var run = require('./jflux/run.js');
var action = require('./action.js');
var store = require('./store.js');
var shared = require('./shared-data.js');
var utils = require('./utils.js');
var dataStore = require('./dataStore.js');
var dispatcher = require('dispatchr');
var createStore = require('dispatchr/addons/createStore');

var exports = {
    run: run,
    render: render,
    config: config,
    shared: shared,

    dispatcher: dispatcher,
    path: path,
    version: "1.3.1",
    component: component,
    createStore: createStore,
    route: router.route,
    actions: action,
    store: store,
    data: function (target) {
      
      if (!target) {
        return;
      }

      if (target.originalEvent) {
        target = target.target;
      }
      var compId = dom.$(target).attr('data-store');
      return dataStore.get(compId);
    },
    fakeStore: function (exports) {
      return this.store({
        exports: exports
      });
    }
};

// If not running in Node
if (typeof window !== 'undefined') {
  dom.$(function () {
    if (!global.define && config().autoRun) {
      exports.run();
    }
    if (config().json) {
      dom.$.ajaxSetup({
        contentType: 'application/json',
        dataType: 'json',
        processData: false,
        beforeSend: function (jXhr, options) {

          if (
            options.contentType === 'application/json' &&
          // If it is POST, PUT or DELETE.
          // GET converts data properties to a query
            options.type !== 'GET' &&

            // If you are passing data
            options.data &&

            // If it is not already a string
            typeof options.data !== 'string'
            ) {

            // Stringify the data to JSON
            options.data = JSON.stringify(options.data);
          }
        }
      });
    }
  });
}

// global mode, expose $$ 
if (config().global && !global.exports && !global.module && (!global.define || !global.define.amd)) {
  global.$$ = exports;
}

module.exports = exports;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./action.js":68,"./component.js":69,"./config.js":72,"./dataStore.js":73,"./dom.js":74,"./jflux/path.js":77,"./jflux/render.js":78,"./jflux/run.js":79,"./router.js":80,"./shared-data.js":81,"./store.js":82,"./utils.js":83,"dispatchr":5,"dispatchr/addons/createStore":4}],77:[function(require,module,exports){
'use strict';

/*
 * PATH
 * ====================================================================================
 * Returns the current route path
 * ====================================================================================
 */
var config = require('./../config.js');
var path = function () {

  return config().pushState ?

    // Return the pathname without baseUrl
    location.pathname.substr(config().baseUrl.length) :

    // Return the hash, without the #
    location.hash.substr(1);

};

module.exports = path;
},{"./../config.js":72}],78:[function(require,module,exports){
'use strict';

/*
 * RENDER
 * ====================================================================================
 * Initializes and appends a component to the DOM. It does a lookup to check if
 * there already is a component where it will either update by replacing the properties
 * or remove the old one and append the new one. If no components registered the
 * new component will be appended
 * ====================================================================================
 */

var dom = require('./../dom.js');
var utils = require('./../utils.js');

// Components rendered to the DOM will be stored in this array, as a lookup
var _renderedComponents = [];

// Add a special event that will run the handler when removed
// It is used to remove component when main element is removed from DOM
dom.$(function () {
  if (dom.$.event.special) {
    dom.$.event.special.destroy = {
      remove: function (data) {
        var component = data.handler();
        var existingRender = utils.getFromListByProp(_renderedComponents, 'component', component);
        if (existingRender) {
          _renderedComponents.splice(_renderedComponents.indexOf(existingRender), 1);
        }
      }
    };
  }
});

var render = function (component, target, type) {

  if (type === 'append') {
  _init(target, type);
  return;
  } 

  var existingRender = utils.getFromListByProp(_renderedComponents, 'target', target);

  // If there is an existing component of same type and the props has changed,
  // update existing component
  if (existingRender &&
    existingRender.component._description === component._description
      && !utils.deepCompare(existingRender.component.props, component.props)) {

    existingRender.component.props = component.props;
    existingRender.component.update();

  } else if (!existingRender || existingRender.component._description !== component._description) {
  _init(target, type || component.component && component.component.insert_type);
  }

  function _init(target, type) {

    dom.$(target).each(function(i, el){

      if (i > 0) component = component._clone('props');

      if (type === 'bootstrap') {
        component._init(el);
        component._update();
      } else {
        component._init();
        component._update();
        if (type === 'append') {
          dom.$(el).first().append(component.$el);
        } else if (type === 'replace') {
          dom.$(el).replaceWith(component.$el);
        } else {
          dom.$(el).html(component.$el);
        }
      }

      _renderedComponents.push({
        component: component,
        target: el
      });

    })
  }
};

module.exports = render;
},{"./../dom.js":74,"./../utils.js":83}],79:[function(require,module,exports){
'use strict';

/*
 * RUN
 * ====================================================================================
 * Registers hyperlink handling and triggers the router. This runs automatically
 * on page load, unless using requirejs or "autoRun" in the config is set to false
 * ====================================================================================
 */

var dom = require('./../dom.js');
var router = require('./../router.js');
var config = require('./../config.js');

var run = function () {

  // Any links triggered, intercept and use router instead, passing
  // the path
  dom.$('body').on('click', 'a', function (event) {

    // Only grab it if there is no target attribute
    if (!event.currentTarget.getAttribute('target') && !event.isDefaultPrevented()) {
      event.preventDefault();

      // We have to turn off the onhashchange trigger to avoid triggering the route
      // again, and at the same time allow for back/forward buttons
      var hashchange = window.onhashchange;
      window.onhashchange = null;

      // href is full url, so to get the path we need to remove the origin and any
      // baseUrl
      var path = event.currentTarget.href.substr(location.origin.length);
      router.goTo(path);

      // Put hash listening back into the event loop
      setTimeout(function () {
        window.onhashchange = hashchange;
      }, 0);
    }
  });

  if (config().pushState) {
    window.onpopstate = function () {
      router.goBack(location.pathname.substr(config().baseUrl.length));
    };
  } else {
    window.onhashchange = function () {
      if (location.hash) {
        router.goTo(location.hash.substr(1));
      } else {
        window.history.back(); // We are back from /# and want to continue once more
      }
    };
  }

  // Initial routing passing current pathname without baseUrl
  var path = location.pathname.substr(config().baseUrl.length);
  router.goTo(path);

};

module.exports = run;
},{"./../config.js":72,"./../dom.js":74,"./../router.js":80}],80:[function(require,module,exports){
'use strict';

/*
 * ROUTER
 * ====================================================================================
 * Registers new routes and handles route changes
 * ====================================================================================
 */

var dom = require('./dom.js');
var utils = require('./utils.js');
var config = require('./config.js');

var exports = {};

var routes = [];

var initialRouting = true;
var previousRoute = '';

exports.triggerRoute = function (route, compiledRoute, params, replaceState) {

  if (typeof route.callback === 'string') {

    exports.resolveRoute(utils.compileRoute(route.callback, params));

  } else if (config().pushState) {

    if (!initialRouting && previousRoute !== compiledRoute) {
      window.history[replaceState ? 'replaceState' : 'pushState']({}, '', config().baseUrl + compiledRoute);
    }
    initialRouting = false;
    route.callback(params);

  } else {
    location.href = config().baseUrl + '/#' + compiledRoute;
    route.callback(params);
  }
  previousRoute = compiledRoute;
};

exports.resolveRoute = function (path, replaceState) {
  for (var x = 0; x < routes.length; x++) {
    var route = routes[x];
    if (utils.matchRoute(path, route.path, utils.isParam)) {
      var params = utils.getParams(path, route.path, utils.isParam);
      return exports.triggerRoute(route, utils.compileRoute(route.path, params), params, replaceState);
    }
  }
  if (routes.length) {
    throw new Error('No routes match ' + path);
  }
};

exports.route = function (path, callback) {
  if (arguments.length === 1) {
    exports.goTo(path);
  } else {
    routes.push({
      path: path,
      callback: callback
    });
  }
};

exports.goTo = function (path) {
  dom.$(function () {
    exports.resolveRoute(path);
  });
};

exports.goBack = function (path) {
  exports.resolveRoute(path, true);
};

exports.deferTo = function (path) {
  return function () {
    exports.goTo(path);
  };
};

module.exports = exports;
},{"./config.js":72,"./dom.js":74,"./utils.js":83}],81:[function(require,module,exports){
// Middleware that injects the shared data and sharify script
module.exports = function(req, res, next) {

  var data = {};
  for(var key in module.exports.data) {
    data[key] = module.exports.data[key];
  };

 
  // Inject a shared object into locals and use in template as {AppShared.data} and {AppShared.inject|s}
  res.locals.AppShared = {
    data: data,
    inject: function(shared) {
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
               ';</script>';
    }
  };

  // Alias for easy access appdata in controllers
  res.locals.appdata = res.locals.shared = res.locals.AppShared.data;
  next();
};

// The shared hash of data
module.exports.data = {};

module.exports.set = function(obj, res){
    if (!res) {
      for(var key in obj) {
        module.exports.data[key] = obj[key];
      };
      return;
    }
    res.locals.appdata = res.locals.appdata || {};
    for(var key in obj) {
      res.locals.appdata[key] = obj[key];
    };
};

// When required on the client via browserify, run this snippet that reads the
// sharify.script data and injects it into this module.
var bootstrapOnClient = module.exports.bootstrapOnClient = function() {
  if (typeof window != 'undefined' && window.__clientAppShared) {
    module.exports.data = window.__clientAppShared;
    if (!window.AppShared) window.AppShared = module.exports;
    if (!window.appdata) window.appdata = window.__clientAppShared;
  }
};
bootstrapOnClient();

},{}],82:[function(require,module,exports){
'use strict';

var EventEmitter = require('./EventEmitter.js');
var utils = require('./utils.js');
var config = require('./config.js');
var Store = require('immutable-store');

function mergeStore (mixins, source) {

  source.actions = source.actions || [];
  source.exports = source.exports || {};

  source.isServer = function () {
      return config().server;
  };

  if (typeof source.init === 'function') {
    source.init();
  }

  if (mixins && Array.isArray(mixins)) {

    // Merge mixins and state
    mixins.forEach(function (mixin) {
      Object.keys(mixin).forEach(function (key) {

        switch(key) {
          case 'mixins':
            return mergeStore(mixin.mixins, mixin);
            break;
          case 'actions':
            source.actions = source.actions.concat(mixin.actions);
            break;
          case 'exports':
            Object.keys(mixin.exports).forEach(function (key) {
              source.exports[key] = mixin.exports[key];
            });
            break;
          default:
            if (source[key]) {
              throw new Error('The property: ' + key + ', already exists. Can not merge mixin with keys: ' + Object.keys(mixin).join(', '));
            }
            source[key] = mixin[key];
        }

      });
    });

  }

  var exports = Object.create(EventEmitter.prototype);
  var listeners = [];

  source.emitChange = function () {
    exports.emit('change');
  };

  source.emit = function () {
    exports.emit.apply(exports, arguments);
  };

  // Register actions
  source.actions.forEach(function (action) {
    if (!action || !action.handlerName) {
      throw new Error('This is not an action ' + action);
    }
    if (!source[action.handlerName]) {
      throw new Error('There is no handler for action: ' + action);
    }
    action.on('trigger', source[action.handlerName].bind(source));
  });

  // Register exports
  Object.keys(source.exports).forEach(function (key) {
    exports[key] = function () {
      return utils.deepClone(source.exports[key].apply(source, arguments));
    };
  });

  if (source.state) {
    exports.state = Store(source.state);
  }

  console.log('exports.state', exports.state);

  return exports;

};

module.exports = function (definition) {
  return mergeStore(definition.mixins, definition);
};

},{"./EventEmitter.js":67,"./config.js":72,"./utils.js":83,"immutable-store":17}],83:[function(require,module,exports){
(function (global){
'use strict';

var exports = {};
var convertAttributes = function (string, context) {
  string += '';
  var matches = string.match(/(?:\$\$-.*?="[^"]*")/g);
  if (matches) {
    matches.forEach(function (match) {
      var value = match.match(/"([^""]+)"/)[1];
      var newMatch = match.replace('"' + value + '"', '{' + JSON.stringify(context[value]) + '}');
      string = string.replace(match, '$' + newMatch)
    });
  }
  return string;
};

exports.convertArgsToString = function () {
 
  return html;
};

exports.deepClone = function (obj) {
  var copy, tmp, circularValue = '[Circular]', refs = [];

  // object is a false or empty value, or otherwise not an object
  if (!obj || "object" !== typeof obj ||
    ('ArrayBuffer' in global && obj instanceof ArrayBuffer) ||
    ('Blob' in global && obj instanceof Blob) ||
    ('File' in global && obj instanceof File))
  {
    return obj;
  }

  // Handle Date
  if (obj instanceof Date) {
    copy = new Date();
    copy.setTime(obj.getTime());
    return copy;
  }

  // Handle Array - or array-like items (Buffers)
  if (obj instanceof Array || obj.length) {
    
    refs.push(obj);
    copy = [];
    for (var i = 0, len = obj.length; i < len; i++) {
      if (refs.indexOf(obj[i]) >= 0) {
        copy[i] = circularValue;
      } else {
        copy[i] = exports.deepClone(obj[i]);
      }
    }
    refs.pop();
    return copy;
  }

  // Handle Object
  refs.push(obj);
  copy = {};

  if (obj instanceof Error) {
    //raise inherited error properties for the clone
    copy.name = obj.name;
    copy.message = obj.message;
    copy.stack = obj.stack;
  }

  for (var attr in obj) {
    if (obj.hasOwnProperty(attr)) {
      if (refs.indexOf(obj[attr]) >= 0) {
        copy[attr] = circularValue;
      } else {
        copy[attr] = exports.deepClone(obj[attr]);
      }
    }
  }
  refs.pop();
  return copy;
};

exports.isParam = function (part) {
  var match = part.match(/^\{.*\}$/);
  return match && match.length ? true : false;
};

exports.removeFromListByProp = function (list, prop, item) {
  for (var x = 0; x < list.length; x++) {
    if (list[x][prop] === item) {
      list.splice(x, 1);
      return;
    }
  }
};

exports.flatten = function (array) {
  return array.reduce(function (returnArray, value) {
    returnArray = returnArray.concat(value);
    return returnArray;
  }, []);
};

exports.getFromListByProp = function (list, prop, item) {
  for (var x = 0; x < list.length; x++) {
    if (list[x][prop] === item) {
      return list[x];
    }
  }
};

exports.removeEmptyInArray = function (array) {
  for (var x = array.length - 1; x >= 0; x--) {
    if (!array[x] && typeof array[x] !== 'number') {
      array.splice(x, 1);
    }
  }
  return array;
};

exports.matchRoute = function (path, route, identifier) {
  if (route === '*') {
    return true;
  }
  var pathArray = path.split('/');
  var routeArray = route.split('/');
  this.removeEmptyInArray(pathArray);
  this.removeEmptyInArray(routeArray);
  if (pathArray.length !== routeArray.length) {
    return false;
  }
  for (var x = 0; x < pathArray.length; x++) {
    if (pathArray[x] !== routeArray[x] && !identifier(routeArray[x])) {
      return false;
    }
  }
  return true;
};

exports.getParams = function (path, route, identifier) {
  var params = {};
  var pathArray = path.split('/');
  var routeArray = route.split('/');
  routeArray.forEach(function (routePart, index) {
    if (identifier(routePart)) {
      params[routePart.replace(/\{|\}/g, '')] = pathArray[index];
    }
  });
  return params;
};

exports.compileRoute = function (path, params) {
  for (var prop in params) {
    if (params.hasOwnProperty(prop)) {
      path = path.replace('{' + prop + '}', params[prop]);
    }
  }
  return path;
};

exports.mergeTo = function (target) {
  var sources = Array.prototype.splice.call(arguments, 1, arguments.length - 1);
  sources.forEach(function (source) {
    for (var prop in source) {
      if (source.hasOwnProperty(prop)) {
        target[prop] = source[prop];
      }
    }
  });
  return target;
};

exports.isObject = function (obj) {
  return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
};

exports.deepCompare = function (a, b, except) {

  var compare = function (valueA, valueB) {
    if (Array.isArray(valueA) || exports.isObject(valueA)) {
      var isTheSame = exports.deepCompare(valueA, valueB);
      if (!isTheSame) {
        return false;
      }
    } else if (valueA !== valueB) {
      return false;
    }
    return true;
  };

  if (Array.isArray(a) && Array.isArray(b) && a !== b && a.length === b.length) {

    for (var x = 0; x < a.length; x++) {
      var isSame = compare(a[x], b[x]);
      if (!isSame) {
        return false;
      }
    }
    return true;

  } else if (exports.isObject(a) && exports.isObject(b) && a !== b) {

    // If number of properties has changed, it has changed, making them not alike
    if (Object.keys(a).length !== Object.keys(b).length) {
      return false;
    }


    for (var prop in a) {
      if (a.hasOwnProperty(prop)) {
        var isSame = compare(a[prop], b[prop]);
        if (!isSame) {
          return false;
        }
      }
    }

    return true;

  } else {
    return false;
  }
};

exports.grabContextValue = function (context, grabber) {
  var value = context;
  var grabs = grabber.split('.');
  grabs.forEach(function (grab) {
    value = value[grab];
  });
  return value;
};

exports.createGrabObject = function (context, grabString) {
  var grabs = grabString.split('.');
  var prop = grabs.pop();
  grabs.forEach(function (grab) {
    context = context[grab];
  });
  return {
    prop: prop,
    context: context
  }
};

exports.createClassString = function (obj) {
  var classes = [];
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop) && obj[prop]) {
      classes.push(prop);
    }
  }
  return classes.join(' ');
};

exports.extractTypeAndTarget = function (event) {
  var eventArray = event.split(' ');
  return {
    type: eventArray[0],
    target: eventArray[1]
  };
};

exports.convertStyleToMap = function (styleValue) {

  var styleMap = {};
  var styles = styleValue.split(';');
  styles.forEach(function (style) {
    if (!style) {
      return;
    }
    var styleValues = style.split(':');
    styleMap[styleValues[0]] = styleValues[1].trim();
  });
  return styleMap;

}

module.exports = exports;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[76])(76)
});