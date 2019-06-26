var BoxesStore = require('../../stores/boxes.js');

var $ = require('jquery');
var velocity = require("velocity-animate");
require("velocity-ui-pack");

velocity.RegisterUI("transition.newBoxIn", {
defaultDuration: 600,
	calls: [
	    [{ opacity: [ 1, 0 ], transformOriginX: [ "50%", "50%" ], transformOriginY: [ "50%", "50%" ], scaleX: [ 1, 0.4 ], scaleY: [ 1, 0.4 ], translateZ: 0, translateX: [ 0, -400 ]
		}, 1 , { easing: "easeOutCirc" }]
	]
});

velocity.RegisterUI("transition.boxIn", {
defaultDuration: 600,
	calls: [
	    [{ opacity: [ 1, 0 ], transformOriginX: [ "50%", "50%" ], transformOriginY: [ "50%", "50%" ], scaleX: [ 1, 0.4 ], scaleY: [ 1, 0.4 ]
		}, 1 , { easing: "easeOutCirc" }]
	]
});


velocity.RegisterUI("transition.boxOut", {
defaultDuration: 600,
	calls: [
	    [{ opacity: [ 0, 1 ], transformOriginX: [ "50%", "50%" ], transformOriginY: [ "50%", "50%" ], scaleX: [ 0.4, 1 ], scaleY: [ 0.4, 1]
		}, 1 , { easing: "easeOutCirc" }]
	]
});

var template = require('../../templates/elements/box.dust');

var Drag = require('./dragingbox')($);

module.exports = $$.component({
    
	component: {
        name: 'Box component',
        insert_type: 'append'
    },	

  init: function () {

  		this.id = this.props.box.id;
  		var Box = BoxesStore.state.box(this.id);
  		this.box = Box.get();

  		Box.on('update', function(e) {
  			if (!e.data.currentData) {
  				Box.release();
  				this.remove();
  			} else {
	        this.update({box: Box.get()});
  			}
      }.bind(this));

  	  this.listenTo(BoxesStore, 'updateboxzindex', function(id, zindex) {
      		if (id === this.id) { 
      			this.update({zindex: zindex});
      		}
  	  }.bind(this));
  },

	events: {
      'click .close-sticky': 'remove',
      'dblclick': 'dblclick',
      'draginit': 'draginit',
      'drag': 'drag',
      'dragstart': 'dragstart',
      'dragend': 'dragend'
    },
    
    afterRender: function () {
    	var el = this.$el;
    	var _this = this;
    	var animation = this.props.is_new === true? "transition.newBoxIn" : "transition.boxIn"

    	velocity(el, animation, { display: "table",
    		complete: function(){
    				// if (_this.props.is_new) _this.props.is_new = false;
    		}
    	});
    	
     	// velocity(el, "transition.boxIn", { display: "table" });
     	// velocity(el, {left: '+=50'} , { duration: 600, display: "table" });
     	// velocity(el, "transition.slideLeftBigIn", { duration: 500, display: "table" });
    },

    dblclick: function() {
    	BoxesStore.actions.BRING_TO_FRONT_BOX({id: this.id});
    },

	draginit: Drag.init,
  dragstart: Drag.start,
  drag: Drag.drag,
  dragend: Drag.end,
    
  remove: function(e) {
  	var el = this.$el;
  	var _this = this;
  	if (e) BoxesStore.actions.REMOVE_BOX({id: this.id});
		velocity(el, 'transition.boxOut', { display: "table", 
  		complete: function(){
	 		el.remove();
	 		_this.destroy();
  		}
  	});
  },

  shouldComponentUpdate: function(props_new) {
  	if (!props_new) return false;

  	if (props_new.zindex) { 
  		return true;
  	}

  	if (props_new.box !== this.box) {
  		this.box = props_new.box;
  		return true;
  	} else { 
  		return false;
  	}
 		
  },

	render: function() {

		var _box = this.box;

		if (typeof _box == 'undefined') return;

		this.style = {
			 position: "absolute",
			 top: _box.top + "px",
			 left: _box.left + "px",
			 width: _box.width + "px",
			 height: _box.height + "px"
		};

		if (this.props.zindex > 0) this.style['z-index'] = this.props.zindex;

		this.style2 = {
			 'background-color': _box.bgcolor || getRandomColor()
		};

	 	return this.dust_render(template)(this);
	}
});

function getRandomColor() {
    return 'rgba(' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ', 0.5' + ')';
} 