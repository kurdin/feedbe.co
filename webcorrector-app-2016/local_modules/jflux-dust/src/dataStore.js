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