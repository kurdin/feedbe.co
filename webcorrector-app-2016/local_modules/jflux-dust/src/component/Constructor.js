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