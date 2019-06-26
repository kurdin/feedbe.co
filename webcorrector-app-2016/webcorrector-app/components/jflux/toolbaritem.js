var template = require('../../templates/toolbar/toolbaritem.dust');
var UIStore = require('../../stores/ui.js');
// var velocity = require("../../lib/velocity-ui-transitions");

module.exports = $$.component({

  component: {
      name: 'ToolBar Item',
      do_not_render_without_props: ['translationKey']
  },

  events: {
    'click': 'onClick'
  },

  init: function () {
    console.log(' this.props in Item',  this.props);
  },

  onClick: function(e) {
      // e.preventDefault();
      // e.stopPropagation();
      alert('xxx');
  },

  render: function () {
    return this.dust_render(template)(this);
  }
});
