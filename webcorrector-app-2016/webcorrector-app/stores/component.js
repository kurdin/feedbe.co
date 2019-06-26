/* Component Store */
var App = require('./appstore');
var Actions = require('../actions/test-actions');

module.exports = $$.store({

    storeName: 'Component Store',

    actions: [Actions],

    handlers: {
        'UPDATE_TEST_COMPONENT': 'updateTestComponent',
        'CHANGE_COLOR': 'changeColor'
    },

    changeColor: function () {
      this.color = this.color === 'red' ? 'blue' : 'red';
      App.actions.changedColor();
      this.emit('update');
    },

    updateTestComponent: function() {
      this.emit('updateTestComponent');
    },


    // this.listenTo(actions.changeColor, this.changeColor);
    
    exports: {
      getColor: function () {
        if (typeof this.color == 'undefined') {
          this.color = App.getColor();
        }
        return this.color; 
      },
      getInvertColor: function () {
        return this.color == 'red' ? 'blue' : 'red'; 
      }
    }
    
});
  
