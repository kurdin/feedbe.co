/* App Store */

var Baobab = require('baobab');

var $ = require('jquery');
var Storage=$.localStorage;

var Actions = require('../actions/appactions');

module.exports = $$.store({

    actions: [Actions],

    handlers: {
      'CHANGED_COLOR': 'changedColor'
    },

    init: function() {
      this.state = new Baobab(this.state, {immutable: false});
      var boxes = this.state.select('boxes');
      var ui = this.state.select('ui');

      boxes.on('update', function(e) {
        Storage.set('WcAppState.boxes', this.state.select('boxes').get())
      }.bind(this));

      ui.on('update', function(e) {
        Storage.set('WcAppState.ui', this.state.select('ui').get());
      }.bind(this));

    },

    state: {
      ui: Storage.get('WcAppState.ui') || {
        toolbar: {
          position: 0,
          open: true,
          selected: 'select',
          dragging: false
        }
      },
      session: {
        uid: $.fn.generateUUID(),
        autoScrolling: false,
        oldResize: window.onresize,
        reloadby: ''
      },
      settings: {
        lang : 'English',
        langid : 'en_US',
        spellchecker: 'auto',
        chatposition: 0,
        chatOpen: true,
        autoscroll: false,
        tbPosition: 0,
        tbOpen: true,
        tbSelect: true,
        tbEditText: false,
        tbMarkText: false,
        autoscrollsel: false
      },
      color: Storage.get('WcAppState.color') || 'red',
      boxes: Storage.get('WcAppState.boxes') || [    
        {id: 1437507218061, top: 33, left: 155, width: 300, height: 300},
        {id: 1437507218062, top: 33, left: 355, width: 10, height: 400}
      ]
    },

    storeName: 'App Store',


    changedColor: function () { 
      Storage.set('WcAppState.color', this.state.color)
      console.log('this.color in App Store: ', this.state.color);
    },

    exports: {
      state: {
        ui: function() {
          return this.state.select('ui');
        },
        boxes: function() {
          return this.state.select('boxes');
        },
        session: function() {
          return this.state.select('session');
        },
        settings: function() {
          return this.state.select('settings');
        }
      },
      getColor: function () {
        return this.state.color; 
      },
      getBoxes: function () {
        return this.state.boxes; 
      }
    }
}); 
