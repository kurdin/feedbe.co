'use strict';

var renderedComponents = {};

var utils = require('./utils.js');

module.exports = function(dust) {

if (typeof dust.helpers.AppSharedData == 'undefined') {
  dust.helpers.AppSharedData = function (chunk, context, bodies, params) {

    var data = context.get('shared'),
        appshared = context.get('AppShared'),
        out;

    var appdata = appshared.data? utils.mergeTo(data, appshared.data) : data;

    return chunk.write(appshared.inject(appdata));
  }
}

if (typeof dust.helpers.ComponentRender == 'undefined') {
  dust.helpers.ComponentRender = function (chunk, context, bodies, params) {

    var children = '';
    var component;
    chunk.tap(function (data) {
              children += data;
              return '';
    }).render(bodies.block, context).untap();

    var name = params.name,
        appshared = context.get('AppShared'),
        shared = context.get('shared'),
        components = shared.components,
        appstate = shared.appstate,
        out,
        props = {};

    Object.keys(params).forEach(function(param) {
      if (param !== 'name' && param !== 'children') {
        props[param] = context.resolve(params[param]);
      }
    });

    if (typeof components[name] == 'undefined') {
      console.info('Component with name: "' + name + '" not found or empty. jFlux wont render it.');
      return;
    }
    if (typeof renderedComponents[name] == 'undefined') {
      component = new components[name](props, children);
      component._init();
      renderedComponents[name] = component;
    } else {
      component = renderedComponents[name];
      component.props = props;
      component.update();
    }
    // console.log('component._componentId', component._componentId);

    out = component.renderToString();
    appshared.data.appstate = appstate.store.toJS();

    return chunk.write(out);
   }
  }

if (!require.extensions) return;

// Publish a Node.js require() handler for .dust files
require.extensions[".dust"] = function(module, filename) {
    var fs = require("fs");
    var text = fs.readFileSync(filename, 'utf8');
    var source = dust.compile(text, filename);
    var tmpl = dust.loadSource(source, filename);

    module.exports = tmpl;
    module.exports.render = function (context, callback) {
      dust.render(filename, context, callback)
    }
    module.exports.stream = function (context) {
      dust.stream(filename, context, callback)
    }
};
}
