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
