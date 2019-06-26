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
var config = require('./config.js');
var utils = require('./utils.js');

var createActionFunction = function(actionName) {

  // Create the action function
  var fn = function() {

    // Grab all the arguments and convert to array
    var args = utils.deepClone(Array.prototype.slice.call(arguments, 0));

    // if (!fn._events) {
    //   return error.create({
    //     source: fn.handlerName,
    //     message: 'You are triggering an action that nobody listens to',
    //     support: 'Remember to add actions to your stores'
    //   });
    // }
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

var action = function() {

  var $ = config().jquery;

   if (Array.isArray(arguments[0])) {
    var actionMap = {};
    arguments[0].forEach(function (actionName) {
      actionMap[actionName] = createActionFunction(actionName);
    });

    actionMap.dispatch = function(action_type, data, cb) {
      if (!data && (typeof data == 'function')) { 
        cb = data;
        data = null;
      }
      actionMap[action_type](data, cb);
    };

    actionMap.dispatchToStores = function(stores, action_type, data, cb) {
      if (!data && (typeof data == 'function')) { 
        cb = data;
        data = null;
      }
      if (Array.isArray(stores) && stores.length > 0) actionMap[action_type](stores, data, cb);
      else actionMap[action_type](data, cb);
    };   

    actionMap.getStorePromise = function(stores, action_type, data, cb) {
      if (!data && (typeof data == 'function')) { 
        cb = data;
        data = null;
      }
      
      return function() {
        var d = $.Deferred();
          actionMap[action_type]([stores[0]], data, function(err, msg){
            if (err) { 
              d.reject(err, msg);
              return;
            }
            d.resolve(null, msg);
          });
        return d.promise();
      };

    };  

    actionMap.getPromise = function(action_type, data, cb) {
      if (!data && (typeof data == 'function')) { 
        cb = data;
        data = null;
      }
      
      return function(store) {
        store = store || [];
        var d = $.Deferred();
          actionMap[action_type](store, data, function(err, msg){
            if (err) { 
              d.reject(err, msg);
              return;
            }
            d.resolve(null, msg);
          });
        return d.promise();
      };
    };   

    actionMap.dispatchToStoresWhen = function(stores, action_type, data, cb) {
      if (!data && (typeof data == 'function')) { 
        cb = data;
        data = null;
      }
      
      var defstore = function(store) {
        var d = $.Deferred();
          actionMap[action_type]([store], data, function(err, msg){
            if (err) { 
              d.reject(err, msg);
              return;
            }
            d.resolve(null, msg);
          });
        return d.promise();
      };

      var defarray = [];
      stores.forEach(function(store){
        defarray.push(defstore(store));
      });

      $.when.apply($, defarray).done(function(err, msg) {
        if (checkF(cb)) cb(null, msg);
      }).fail(function(err, msg) {
        if (checkF(cb)) cb(error, msg);
      });

    };    

    actionMap.dispatchInOrderWaitFor = function(stores, action_type, data, cb) {
      if (!data && (typeof data == 'function')) { 
        cb = data;
        data = null;
      }

      function defStore(store) {
         this.store = store;
      };

      defStore.prototype.start = function() {
        var d = $.Deferred();
        var _this = this;
        actionMap[action_type]([this.store], data, function(err, msg){
            if (err) { 
              d.reject(err, msg);
              return;
            }
            d.resolve(null, msg);
        });
        return d.promise();
      } 

      // Create array of instances
      var def_array = [];
      stores.forEach(function(store){
        def_array.push(new defStore(store));
      });

      // Create array of instances to run
      var def_run_array = [];
      $.each(def_array, function(i, obj) {
        def_run_array.push(
          function() {
             return obj.start();
          }
        );
      });
      
      $.sequencesWhen = function () {
        var ags = arguments;
        if (Array.isArray(arguments[0])) {
          ags = arguments[0];
        }
        var deferred = $.Deferred();
        var promise = deferred.promise();
        
        $.each(ags, function(i, obj) {
          promise = promise.then(function() {
            return obj();
          });
        });
        
        deferred.resolve();
        return promise;
      };       
      
      $.sequencesWhen(def_run_array)
        .done(function(err, msg) {
          if (checkF(cb)) cb(null, msg);
        }).fail(function(err, msg) {
          if (checkF(cb)) cb(err, msg);
       });
    };    

    actionMap.executeAction = function(opt) {
      if (!opt) { 
        console.error('No options provided for executeAction method');
        return;
      }
      if (!opt.action) { 
        console.error('No Action provided for executeAction method');
        return;
      }

      opt.data = opt.data || null;
      opt.type = opt.type || '';
      opt.stores = opt.stores || [];

      var callback = function(err,msg){
          if (err && opt.error) {
            opt.error(err);
          } else if (opt.success) {
            opt.success(msg);
          }
      };

      var storeError = function(action, type) {
        return console.error('Error in action: `' + action + '` dispatch with type: `' + type + '`. Specify `stores` key must as an array');
      }

      switch(opt.type) {
        case 'WaitForAllDone':
          if (opt.stores.length == 0) {
            storeError(opt.action, opt.type);
            } else {
            actionMap.dispatchToStoresWhen(opt.stores, opt.action, opt.data, callback);
          }
          break;
        case 'WaitForInOrder':
          if (opt.stores.length == 0) {
            storeError(opt.action, opt.type);
          } else {
            actionMap.dispatchToStoresWhen(opt.stores, opt.action, opt.data, callback);
          }
          break;
        default:
        actionMap.dispatchToStores(opt.stores, opt.action, opt.data, callback);
      }

      // actionMap[opt.action](opt.stores, opt.data, function(err,msg){
      //   if (err && opt.error) {
      //     opt.error(err);
      //   } else if (opt.success) {
      //     opt.success(msg);
      //   }
      // });
    };

    return actionMap;
  }

  error.create({
    source: arguments[0],
    message: 'Could not create action(s)',
    support: 'Pass no arguments or an array of strings'
  });

};

function checkF(cb) {
  return typeof(cb) == "function";
}


module.exports = action;