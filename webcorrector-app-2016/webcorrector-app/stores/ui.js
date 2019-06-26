/* UI Store */

var App = require('./appstore');

var toolbaractions = require('../actions/toolbar');

module.exports = $$.store({

		storeName: 'UI Store',

		init: function() {
				this.UI = App.state.ui();
		},

		actions: [toolbaractions],

		handlers: {
				'TOOLBAR_DRAGGIN': 'toobarDrag',
				'TOOLBAR_OPEN': 'toobarOpen',
				'TOOLBAR_POSITION': 'toobarPosition'
		},

		toobarDrag: function (state) {
			var drag = this.UI.select('toolbar').get('dragging');
			if (state === false) {
				setTimeout(function() {
						drag = state;
				}.bind(this), 300);
			} else {
				drag = state;
			}
		},

		toobarOpen: function () {
			this.setUI('toolbar', 'open', !this.getUI('toolbar', 'open'));
		},

		toobarPosition: function (pos) {
			this.setUI('toolbar', 'position', pos);
		},

		setUI: function (element, key, val) {
		 this.UI.select(element).set(key, val);
		},

		getUI: function (element, key) {
		 return this.UI.select(element).get(key);
		},

		// updateTestComponent: function() {
		//   this.emit('updateTestComponent');
		// },

		exports: {
			getToolbar: function () {
				return this.UI.get('toolbar');
			}      
		}
});
	
