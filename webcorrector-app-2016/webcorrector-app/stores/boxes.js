/* Boxes Store */

var App = require('./appstore');
var $ = require('jquery');
var Actions = require('../actions/boxactions');

module.exports = $$.store({

    storeName: 'Box Store',

    actions: [ Actions ],

    handlers: {
      'ADD_BOX': 'addBox',
      'UPDATE_BOX': 'updateBox',
      'UPDATE_ALL_BOXES': 'updateAllBox',
      'REMOVE_BOX': 'removeBox',
      'REMOVE_ALL_BOXES': 'removeAllBoxes',
      'INIT_RENDER': 'init_render',
      'BRING_TO_FRONT_BOX': 'bringToFrontBox'
    },

    state: {
      zindex_top_value: 0,
      top_zindex_box_id: 0
    },

   init_render: function(){
      this.Box = require('../components/jflux/box');
      if (typeof this.Boxes == 'undefined') {
          $('#wcappcontainer').append("<div id='wcboxes'></div>");
          this.Boxes = App.state.boxes();
      }
      if (this.Boxes.get().length > 0) {
        this.Boxes.map(function(box) {
        this.renderBox(box.get());
        }.bind(this));
      }
      
    },

    renderBox: function(box, is_new) {
      $$.render(this.Box({box: box, is_new: is_new || false}), '#wcboxes', 'append');
    },

    getZindex: function() {
      if (this.state.zindex_top_value > 0) return this.state.zindex_top_value++;
      else return 0;
    },

    bringToFrontBox: function(box) {
        (this.state.zindex_top_value > 0)? this.state.zindex_top_value++ : this.state.zindex_top_value = 2147483502 + this.state.zindex_top_value + 1;
        this.state.top_zindex_box_id = box.id;
        this.moveBoxInArray(box.id, this.Boxes.get().length - 1);
        this.emit('updateboxzindex', this.state.top_zindex_box_id, this.state.zindex_top_value);
    },

    addBox: function (box) {
      var _box = {
        id: box && box.id || +new Date(),
        top: box && box.top || getRandom.top(),
        left: box && box.left || getRandom.left(),
        width: box && box.width || getRandom.width(),
        height: box && box.height || getRandom.height(),
        bgcolor: box && box.bgcolor || getRandomColor()
      };
      this.Boxes.push(_box);
      this.renderBox(_box, true);
    },

    removeAllBoxes: function() {
      this.Boxes.set([]);
    },

    removeBox: function(box) {
      var box = this.getBox(box.id);
      if (typeof box == 'undefined') return;
      this.Boxes.splice([this.Boxes.get().indexOf(box.get()), 1]);
      box.release();
    },

    updateBox: function(box) {
      if (box.id) {
        var _box = this.getBox(box.id);
        _box.set('width', box.props.width? box.props.width : _box.get('width'));
        _box.set('height', box.props.height? box.props.height : _box.get('height'));
        _box.set('top', box.props.top? box.props.top : _box.get('top'));
        _box.set('left', box.props.left? box.props.left : _box.get('left'));
        _box.set('bgcolor', box.props.bgcolor? box.props.bgcolor : _box.get('bgcolor'));
      }
    },

    saveBoxes: function() {
      App.actions.CHANGED_BOXES();
    },

    updateAllBox: function() {
      this.emit('updateboxes');
    },
    
    getBox: function (id) {
      return this.Boxes.select({id: id});
    },

    moveBoxInArray: function (box_id, new_index) {
      var boxes = this.Boxes.get();
      var old_index = getIndexByID(boxes, box_id);
      var l = boxes.length;
      if (new_index >= l) {
          var k = new_index - l;
          while ((k--) + 1) {
              this.Boxes.push(undefined);
          }
      }
      var box = this.Boxes.get(old_index);
      this.Boxes.splice([old_index, 1]);
      this.Boxes.splice([new_index, 0, box]);
    },

    exports: {
      state: {
        box: function(id) {
          return this.getBox(id);
        }
        // getTest: function() {
        //   return this.state.test;
        // }
        // ,test: "state.test"
      },
      getBoxes: function () {
        return this.Boxes; 
      },
      getBox: function(id) {
        return this.getBox(box.id);
      }
    }
});
  
var getRandom = {
    top: function() {return Math.floor(Math.random() * 600)},
    left: function() {return Math.floor(Math.random() * 800)},
    width: function() {return Math.floor(Math.random() * 300)},
    height: function() {return Math.floor(Math.random() * 300)}
}

function getIndexByID(boxes, id) {
  for (var i = 0; i < boxes.length; i++) {
    if (boxes[i].id === id) {
      return i;
    }
  }
}

function getRandomColor() {
    return 'rgba(' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ', 0.5' + ')';
}