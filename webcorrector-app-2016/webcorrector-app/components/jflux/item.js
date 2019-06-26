// var $$ = require('/Volumes/RAID1TB/Users/kris/Documents/Projects/jflux-dust');

var template_item = require('../../templates/render-test-item.dust');
// var velocity = require("../../lib/velocity-ui-transitions");

module.exports = $$.component({

  events: {
    'click input': 'onClick'
  },

  init: function () {
    // console.log(' this.props in Item',  this.props);
  },

  onClick: function(event) {
      // var data = $$.data(event);
      // console.log(data);
      this.is_alive = !this.is_alive;
      this.update();
  },

  render: function () {
    // if (!this.props.label) return;
    // console.log('this.props.label', this.props.label)
    this.is_alive ? this.value = 'I am alive component' : this.value = this.props.label || '';
    return this.dust_render(template_item)(this);
  }
});
