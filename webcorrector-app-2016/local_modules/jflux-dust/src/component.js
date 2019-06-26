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