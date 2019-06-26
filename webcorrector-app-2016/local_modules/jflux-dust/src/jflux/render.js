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