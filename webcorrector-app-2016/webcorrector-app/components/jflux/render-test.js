// module.exports = List;

var Comp = require('../../stores/component');
var velocity = require("../../lib/velocity-ui-transitions");

var template = require('../../templates/render-test.dust');

var Item = require('./item');

module.exports = $$.component({

    component: {
        name: 'Test Render',
        description: 'Test rendering component on server and bootsrap on client'
        ,
        insert_type: 'bootstrap'
    },

    components: {
        items: Item()
    },

    someData: {
      foo: 'bar2'
    },

	  events: {
      'click .green': 'onClick'
    },

    onClick: function(event) {
      var data = $$.data(event);
      console.log(data);
    },


    init: function () {
      var _this = this;
      // window.setTimeout(function() {
      // window.setInterval(function() {
      //   _this.update();
      // }, 2000);
      this.listenTo(Comp.store, 'updateTestComponent', this.update);

    },
    
    changeColor: function (event) {
      	Comp.actions.changeColor();
    },
	  
    compileItems: function (compile) {
      return compile(
        Item({label: this.item})
      );
    },

    animation2: {
        in: function($el, cb) {
          $el.addClass('animated fadeIn').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
            $el.removeClass('animated fadeIn');
            cb();
          });
          // console.log($el);
          // velocity($el, "transition.boxIn", {
          //   complete: function(){
          //     $el.css("transform", "");
          //     cb();
          //   }
          // });
        },
        out: function($el, cb) {
          // $el.addClass('animated fadeOut').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
          //   cb();
          // });
          velocity($el, "transition.boxOut", {
            complete: function(){
                cb();
            }
          });
        },
        update: function($el, cb) {
          $el.addClass('animated fadeIn').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
            $el.removeClass('animated fadeIn');
            cb();
          });
          // velocity($el, "transition.boxIn", {
          //   complete: function(){
          //     $el.css("transform", "");
          //   }
          // });
        },
        in: 'animated fadeInUp',
        out: 'animated flipOutX',
        update: 'animated flipInX'
    },

    // afterRender: function() {
    //   var el = this.$el;
    //       // el.animateCSS('fadeIn');
    //       velocity(el, "fadeIn", {
    //         complete: function(){
    //           el.css("transform", "");
    //         }
    //       });
    //   console.log('el', el[0]);
    // },

    // template: template,

    data: {
      x: '2',
      y: '18'
    },

    // test_array: ['foo', 'bar', 'foo1', 'bar1', 'foo2', 'bar2', 'bar1', 'bar4', 'foo2', 'foo3', 'bar2'],

    // test_array2: ['f', 'b', 'f', 'b', 'f', 'b', 'b', 'b', 'f', 'f', 'b'],

    test_array: ['bar3', 'foo1', 'foo3', 'bar3', 'foo1', 'foo3', 'bar3', 'foo1', 'foo3', 'bar3', 'foo1', 'foo3'],

    test_array2: ['f', 'f', 'c', 'd', 'e'],

    count: 1,

    render: function (compile) {

    // if (this.count == 3) {
    //   this.count++;
    //   this.destroy();
    //   return;
    // }

    this.textStyle1 = {
      color: getRandomColor(),
      border: Math.floor(Math.random() * 10) + '5px solid ' + getRandomColor()
    };

    this.textStyle2 = {
      color: getRandomColor()
    };

    this.data.y = 22;

    this.data.label = 'prefix ';

    this.textStyle3 = {
      color: getRandomColor()
    };


    // var arr = [];
    //   for (var i=0, t=test_array.length; i<t; i++) {
    //   arr.push(Math.round(Math.random() * t))
    // }

    
    this.arr = [];
    this.arr2 = [];

    if (this.count != 1) {
      for (var i=0, t=this.test_array.length; i<t; i++) {
      this.arr.push(this.test_array[Math.round(Math.random() * this.test_array.length)] || 'foo');
    }
      for (var i=Math.round(Math.random() * this.test_array2.length), t=this.test_array2.length; i<t; i++) {
      this.arr2.push(this.test_array2[Math.round(Math.random() * this.test_array2.length)] || 'foo');
    }

    } else {
      this.arr = this.test_array;
      this.arr2 = this.test_array2;
    }

    this.count++;

    console.log('arr',this.arr);
    console.log('arr2',this.arr2);

    // this.components.items = this.map(arr, this.compileItems, 'items');
    // this.components.items2 = this.map(arr2, this.compileItems, 'items2');

    // this.components.items.forEach(function(item){
    //   var el = that.createElement(item);
    //   console.log('el: ', el);        
    // });

    return this.dust_render(template)(this);

  	// dust.render(template, this, function(err, out) {
  	// 	result = out;
  	// });
   //  return compile(
   //    result
   //  );
    // return compile(
    //   '<ul>',
    //   this.components.items,
    //   this.components.items2,
    //   '</ul>'
    // );
   }
    
 });

function getRandomColor() {
    return 'rgba(' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ', 0.5' + ')';
}
