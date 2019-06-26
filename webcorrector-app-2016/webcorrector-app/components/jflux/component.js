var App = require('../../stores/appstore');
var Comp = require('../../stores/component');

var BoxesStore = require('../../stores/boxes');

var template = require('../../templates/jfluxtest.dust');
var Item = require('./item');

// $$.render(Item({label:'hey'}), '.green');

module.exports = $$.component({
    
	  events: {
      'click .changecolor': 'changeColor',
      'click .addbox': 'addBox',
      'click .removeboxes': 'removeAllBoxes',
      'click .updatetest': 'updateTest'
    },

    init: function () {
      var _this = this;
      // var interval = window.setInterval(function() {
      //   _this.updateTest();
      //   _this.update();
      //   // if (_this.arr_top_comp.length == 0) clearInterval(interval);
      // }, 2000);
      this.show_test = true;
      this.listenTo(Comp, 'update', this.update);
    },

    updateTest: function () {
      Comp.actions.updateTestComponent();
      // this.update();
    },

    addBox: function () {
      BoxesStore.actions.ADD_BOX();
    },

    removeAllBoxes: function () {
      BoxesStore.actions.REMOVE_ALL_BOXES();
    },

    components: {
      itemTest: Item({label: 'helloComponent'}),
      itemTestArray: Item(),
      itemTest3: Item({label: 'blockTest'})
    },

    changeColor: function (event) {
     	Comp.actions.changeColor();
    },
	  
    someData: {
    	foo: 'bar'
  	},    

    componentWillUpdate: function() {
      this.show_test = !this.show_test;
    },

    compileItems: function (compile) {
      return compile(
        Item({label:this.item})
      );
    },

    test_array: ['a', 'b', 'c', 'd', 'e', 'f', 'b', 'c', 'd', 'e', 'b', 'c', 'd', 'e'],
    arr_top_comp: ['a', 'b', 'c', 'd', 'e', 'f', 'b'],

    render: function (compile) {

    this.textStyle = {
      color: Comp.getColor()
    };

    this.model = {
      op_color: Comp.getInvertColor()
    };

    if (this.arr_top_comp.length == 0 && this.reverse) this.reverse = false;
    if (this.arr_top_comp.length < 10 && !this.reverse) {
      this.arr_top_comp.push(this.test_array[Math.round(Math.random() * this.test_array.length)] || 'u');
    } else {
      this.reverse = true;
      this.arr_top_comp.pop();
      // this.arr_top_comp.shift();
    }
   
    // }
    // console.log('test_array', this.test_array);
    // console.log('arr_top_comp', this.arr_top_comp);

    // this.components.items = this.map(this.arr_top_comp, this.compileItems, 'items');
    // this.components.items2 = this.map(this.arr_top_comp, this.compileItems, 'items2');

    return this.dust_render(template)(this);
     
    }
    
 });

