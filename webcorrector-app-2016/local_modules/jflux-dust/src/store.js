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
  // source.actions.forEach(function (action) {
  //   if (!action || !action.handlerName) {
  //     throw new Error('This is not an action ' + action);
  //   }
  //   if (!source[action.handlerName]) {
  //     throw new Error('There is no handler for action: ' + action);
  //   }
  //   action.on('trigger', source[action.handlerName].bind(source));
  // });

  // Register exports
  Object.keys(source.exports).forEach(function (key) {
    exports[key] = function () {
      return utils.deepClone(source.exports[key].apply(source, arguments));
    };
  });

  if (source.state) {
    exports.state = Store(source.state);
  }

  if (!source.storeName) {
    console.error('Error in store', source);
    throw new Error('There is no `storeName` provided, we need this key for action priority handlers');
  }

  // if source.actions.forEach(function (action) {
  if (source.handlers) {
        if (!source.actions) {
            console.error('Error in store', source);
            throw new Error('There is no `action` provided, we need this key for action handlers');
        }

        if (Array.isArray(source.actions)) {
          var combine_action = {};
          source.actions.forEach(function(action) {
            utils.mergeTo(combine_action, action);
          });
          // utils.mergeTo(source.actions[0], source.actions[1]);
          // source.actions = source.actions[0];
          source.actions = combine_action;
        } 

        Object.keys(source.handlers).forEach(function(action) {
            // console.log('source.handler[action]', source[source.handlers[action]]);
            // var handler = source.handlers[action];
            if (!source.actions[action]) {
              console.error('Error in store', source);
              throw new Error('There is no action name: `' + action + '` provided in action array, we need this key for action handlers');
            }
            source.actions[action].on('trigger', source[source.handlers[action]].bind(source), source.storeName);
        }, this);
  }

  return exports;

};

module.exports = function (definition) {
  return mergeStore(definition.mixins, definition);
};
