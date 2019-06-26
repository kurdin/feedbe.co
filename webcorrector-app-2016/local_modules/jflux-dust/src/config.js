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