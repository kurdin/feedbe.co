var utils = require('./../utils.js');
var dom = require('./../dom.js');

module.exports = function (component) {

    var nestedComponents = component._components;

    // jflux-dust: ReRender Bootstrapped Subcomponents on first root component update
    // console.log('component.$el html', component.$el.html());
    // component.$el.find('[data-component]').each(function(i, el) {
    //   var $component = dom.$(el);
    //   var id = $component.data('component');
    //   $component.replaceWith(nestedComponents.map[id]._init().$el.removeAttr('data-component'));
    // });
    // jflux-dust


    // Remove any components that are not valid anymore
    Object.keys(nestedComponents.map).forEach(function (key) {
      
      // console.log('nestedComponents.map', nestedComponents.map);

      if (!nestedComponents.updateMap[key]) {
        nestedComponents.map[key]._remove(); // Need to remove element?
        delete nestedComponents.map[key];
      } else {

      if (nestedComponents.map[key].animation) {
          var fn = nestedComponents.map[key].animation;
          fn(nestedComponents.map[key].$el);
          // nestedComponents.map[key].animation(nestedComponents.map[key].$el);
          // component.animation(component.$el);
      }

      }

    });

    // if (this.animation && this.animation.in) {
    //   this._animation('in');
    // } else {
    //     return this;
    // }

    if (component.animation && component.animation.update) component._animation('update');

    // if (component.animation && component.animation.update) {
    //   component.animation.update(component.$el);
    // }

};

// Object.size = function(obj) {
//     var size = 0, key;
//     for (key in obj) {
//         if (obj.hasOwnProperty(key)) size++;
//     }
//     return size;
// };