/* UNUSED */

var BoxesStore = require('../../stores/boxes');

var Box = require('./box');
var Item = require('./item');

var template = require('../../templates/boxcontainer.dust');

module.exports = $$.component({
    
  init: function(){
  	this.listenTo(BoxesStore.store, 'updateboxes', this.update);
  },

  components: {
    Box: Box()
    // itemTest: Item(),
  },
  
  render: function () {
    
  this.boxes = BoxesStore.store.getBoxes();

  return this.dust_render(template)(this);

  }
	
 });
