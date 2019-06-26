'use strict';

var $ = require('jquery');

// global.__app_jquery$ = $;

var log = require('./lib/log.js')('MAIN.JS');
var _ = require('underscore');
var Backbone = require('../local_modules/backbone');
var Marionette = require('../local_modules/backbone.marionette');
var webC = require('./wcr_modules/webc/');

// require('dustjs-helpers');
// require('imports?dust=dust!./lib/dust-helpers.js');

$$.config({
	jquery: $
});

$(document.body).append("<div id='wcappcontainer'></div>");

var App = require('./stores/appstore');

// var BoxContainer = require('./components/jflux/boxcontainer');
var BoxesStore = require('./stores/boxes');
BoxesStore.actions.INIT_RENDER();

// window.setTimeout(function() {
//   $$.render(require('./components/jflux/render-test')(), '.therendertest');
// }, 1000);

var MyComponent = require('./components/jflux/component');
$$.render(MyComponent(), '#draggable');

var ToolBar = require('./components/jflux/toolbar');
$$.render(ToolBar({is_new: true}), '#wcappcontainer');

// console.log('jq', $$.config().jquery.fn);

// $$.render(BoxContainer(), '#wcappcontainer');

// var Item = require('./components/jflux/item');
// $$.render(Item({label: 'helloComponent1'}), '#draggable');

// console.log(Note());

// dust loading

// load dust app templates
var templates = require('imports?dust=dust!./templates/');

// load webcorrector styles
require('./less/wcr-styles.less');

// main code starts here

var ver = '0.3.8';

// console.re.clear();

log.i('WebCorrector App Version: %s', ver);

// console.re.info("WebCorrector App Version: %s", ver);

// alert(Channel.build);

// console.re.log(nodewin);

// ipc.on('screenshot-done', function(arg) {
//     console.re.log(arg);
//     var BrowserWindow = remote.require('browser-window');
//     var win = new BrowserWindow({ width: 800, height: 600, frame: true });
//     win.loadUrl('http://localhost:8991/screenshot.html');
// });

var storage = $.localStorage;

// lets disable all inputs for now
$('input').attr('disabled', false);

// alert(ver);

// settings model
var wcSettings = App.state.settings().get();
var wcSession = App.state.session().get();
var wcUI = App.state.ui().get();
var globalUserName;

log.d('wcSettings', wcSettings, 'wcSession', wcSession, 'wcUI', wcUI);

if (storage.isSet('wcSettings')) {
	wcSettings = storage.get('wcSettings');
}

var wcApp = new Marionette.Application();

wcApp.session = new Backbone.Model(wcSession);

var settingsModel = Backbone.Model.extend({
	initialize: function(settings) {
		// if (settings.autoscroll) this.autoscroll();
		// this is not good, we need to move it to ItemView
		this.on('change:lang', function(model, lang) {
			 wcApp.restart();
		}),
		this.on('change', function(model) {
		// save all setting to localstorage
			storage.set('wcSettings', model.toJSON());
		});
	}
});

var toolbarModel = Backbone.View.extend({
		// read the template from the DOM and compile to a JS function when initializing the view
	initialize: function() {
			this.render();
			this.highlight;

			// this.model.on('change',function(){
				// if (_self.model.get('locid') !== '00000'){
					// _self.render();
				// }
			// },this.model);
			// this.model.fetch();
		},
	activetool: function(tool) {
			var that = $('.' + tool);
			this.model.set({
				tbSelect: false,
				tbEditText: false,
				tbMarkText: false
			});
			if (!that.is('.active')) {
				this.model.set(tool, true);
				that.parent().find('.active').removeClass('active').end().end().addClass('active');
			} else {
				that.removeClass('active');
			}

			if (this.model.get('tbMarkText') === true) {
				$('body').textHighlighter();
				this.highlight = $('body').getHighlighter();
				this.highlight.doHighlight();

				// var highlighter = $('body').getHighlighter();
			} else if (this.model.get('tbEditText') === true) {
				$('body').textHighlighter();
				this.highlight = $('body').getHighlighter();

				var range = this.highlight.getCurrentRange();
				if (!range || range.collapsed) return;
				var rangeText = range.toString();

				var node = range.commonAncestorContainer ? range.commonAncestorContainer : range.parentElement ? range.parentElement() : range.item(0);

				if (node) {
					var parent = (node.nodeName == '#text' ? node.parentNode : node);
				}

				var editEl = node;

				if (node.nodeType === 3) {
					var pos = node.data.indexOf(rangeText);
					if (pos >= 0) {
						middlebit = node.splitText(pos);
						var endbit = middlebit.splitText(rangeText.length);
						editEl = $(middlebit).wrap('<span class="wc-text-edit">').parent().get(0);
					}
				}

				isHover = true;

				// $(editEl).css('outline','1px solid red');
				webC.helper.onElementSelect(editEl);
			} else if (this.model.get('tbEditText') === false) {
				$.mask.close();
			}
		},
	rerender: function() {
		 $('#wcorchat, #wctoolbar').remove();
		 this.render();
	},
	render: function() {
		// convert the Model data to JSON for templating
		// var data = this.model.toJSON();
		// pass Dust the cache key for the compiled template,
		// combine with JSON,
		// and add a callback that gets passed the rendered HTML fragment as 'out'.
		var self = this;
		dust.render(templates.toolbar.main, {}, function(err, out) {
		// if (err) console.log('err', err);
			var objectWithEvents = $('#old').detach();

			// $('#new').append(objectWithEvents);
			$(out).appendTo(document.body);
			if (self.model.get('tbSelect')) self.activetool('tbSelect');
			if (self.model.get('tbEditText')) self.activetool('tbEditText');
			if (self.model.get('tbMarkText')) self.activetool('tbMarkText');
			if (self.model.get('tbPosition') !== 0) $('#wctoolbar').css('top', self.model.get('tbPosition'));
			if (self.model.get('tbOpen') === false) { $('#wctoolbar').addClass('notactive'); }

			self.addHandlers();
			$('#wctoolbar').transition({delay: 500}).animate({ x: 140 });
		});
		return this;
	},
	addHandlers:  function() {
		var self = this;
		$('#wctoolbar').drag('start', function() {
			$(this).addClass('wchatdrag');
		}).drag(function(ev, dd) {
			$(this).css({
				top: dd.offsetY - $(window).scrollTop(),
				bottom: 'auto'
			});
		}, {click:true}).drag('end', function() {
			var that = this;
			setTimeout(function() {
						$(that).removeClass('wchatdrag');
						self.model.set('tbPosition', $(that).css('top'));
					}, 300);
		});

		$('.runSpeedTest').popover({
				 classes: 'wider',
				 horizontalOffset: 15,
				 position: 'right',
				 title: $.i18n.t('tbar.psd.defText'),
				 trigger: 'hover',
				 content: ''
			});

		$('.runSpellCheck').popover({
				 classes: 'wider',
				 horizontalOffset: 15,
				 position: 'right',
				 title: $.i18n.t('tbar.spl.defText'),
				 trigger: 'hover',
				 content: ''
			});

		$('.runHTMLValid').popover({
				 classes: 'wider',
				 horizontalOffset: 15,
				 position: 'right',
				 title: $.i18n.t('tbar.vld.defText'),
				 trigger: 'hover',
				 content: ''
			});

		$('#wcthandlelogo').on('click', function(e) {
				e.preventDefault();
				e.stopPropagation();
				var ct = $(this).parent();
				if (ct.is('.wchatdrag')) return;
				ct.toggleClass('notactive');
				self.model.set('tbOpen', !self.model.get('tbOpen'));
			});

		$('.wctwrap > li').on('click', function(e) {
					e.stopPropagation();
					var that = $(this);
					$('.oOptions').hide();
					if (that.parent().parent().is('.wchatdrag')) return;
					if (that.is('.tbSelect, .tbEditText, .tbMarkText')) {
						wcApp.toolbarView.activetool(that.attr('class').split(' ')[0]);
						return;
					} else if ($(this).is('.addSticky')) {
						var open = webC.helper.addNOTE();
					} else if ($(this).is('.addBox')) {
						var className = $(e.target).parent().attr('class');
						var color = 'rgba(207, 142, 142, 0.5)';
						$.each(webC.colors.overlay, function(c, v) {
							if (className.indexOf(c) > -1) {
								color = v;
								$('.addBox', '#wctoolbar').attr('class', function(i, d) { return d.replace(/\bo\S+/g, c); });
							}
						});
						var open = webC.helper.addBox(color);
					} else if ($(this).is('.addStiker')) {
						var className = $(e.target).parent().attr('class');
						var color = 'rgba(207, 142, 142, 1)';
						$.each(webC.colors.sticker, function(c, v) {
							if (className.indexOf(c) > -1) {
								color = v;
								$('.addStiker', '#wctoolbar').attr('class', function(i, d) { return d.replace(/\bo\S+/g, c); });
							}
						});
						var open = webC.helper.addStikers(color);
					} else if ($(this).is('.addDraw')) {
						var className = $(e.target).parent().attr('class');
						var color = '';
						$.each(webC.colors.drawing, function(c, v) {
							if (className.indexOf(c) > -1) {
								if (c == 'ogrey') { color = '#fff'; } else { color = v; }

								$('.addDraw', '#wctoolbar').attr('class', function(i, d) { return d.replace(/\bo\S+/g, c); });
							}
						});
						var open = webC.helper.addDraw(color);
					} else if ($(this).is('.runHTMLValid')) {
						theParentWindow.postMessage(JSON.stringify({ cmd: 'do', msg: 'screenshot' }), 'file://');
						return;
						var pagescore = that.data('pagescore');
						if (!that.is('.active')) {
							that.addClass('active');

							// test canvas render
							$('.wcemasks').show(); // temp code
							$('.wcselected').addClass('novisual'); // temp code
							$('canvas.wcelements, .dragdraw-content > canvas:eq(1)').each(function(i, val) {
						 var el = $(val);
						 var dataUrl = el[0].toDataURL();
						 console.log(dataUrl);
						 var img = $('<img/>').attr('src', dataUrl).copyCSS(el);
						 img.insertAfter(el);
						 el.remove();
					 });
							webC.helper.preScreenShot();
							var screenshot_data = webC.helper.getScreenShotData();
							setTimeout(function() {
								// window.opener.screenShot('dasdasdasdasd.png');
								// alert('sdsd');
								// ipc.send('screenshot', {
								//   url: $orgUrl
								// });
								/*
								$.ajax({
								url: 'http://' + wcserver + '/render',
								type: 'POST',
								data:screenshot_data,
								success: function(data){
								screenshot_data = {};
								$('.wcscreeshot').spin(false);
								$('<img />', {class:'captured'}).css({'width':0,'height':0}).attr("src", "http://" + wcserver  + data.img_src).appendTo('.wcscreeshot').fadeIn('slow').transition({'width':$('.wcscreeshot').width(),'height':$('.wcscreeshot').height()});
								webC.helper.postScreenShot();
								}
							});
							*/
							}, 500);

						// $('#report_popup').popup({
						//     transition: 'all 0.3s',
						//     onopen: function() { $('.wcscreeshot').spin(); },
						//     onclose: function() { $('.wcscreeshot > img').remove(); },
						//     autoopen: true
						// });
							if (pagescore > 0)  {
								$('.wcscore', that).fadeIn(); that.popover('title', that.data('ptitle')).popover('content', that.data('pcontent')).popover('fadeIn');
								$('li', '.wcerrlist').on('click', function(e) {
									$('.wchide', this).slideToggle();
								});
								$('pre.html').each(function(i, e) {hljs.highlightBlock(e, null);});
								return;
							}

							that.popover('hide');
							that.spin({lines:8, length:10, width:6, radius:14, color:'red'});
							webC.apis.get('validate', {
							url: 'http://' + $orgUrl
						}, function(data) {
								if (data.messages.length > 0) {
										// var $HTMLValidation = data;
									var errors = _.where(data.messages, {type: 'error'}),

									// info = _.where(data.messages, {type: "info"}),
										td = {
											score: errors.length,
											color: 'cred',
											bgcolor: 'bred',
											msg: '',
											errors: errors
										};

									if (td.score == 0) {  _.extend(td, {color:'cgreen', bgcolor:'bgreen', msg:'excellent'}); }									else if (td.score > 0 && td.score <= 30) { _.extend(td, {color:'cred', bgcolor:'bred', msg:''}); }

									if (td.score > 30) { _.extend(td, { msg:'toomany'}); }

									// toolbar/htmlvalidate.dust template
									dust.render(templates.toolbar.htmlvalidate, td, function(err, out) {
											$('.wcscore', that).text(td.score).addClass(td.bgcolor).fadeIn();
											that.data({pagescore:td.score, ptitle:td.ptitle, pcontent:out}).popover('title', td.ptitle).popover('content', out).popover('fadeIn').spin(false);
											$('li', '.wcerrlist').on('click', function(e) {
												$('.wchide', this).slideToggle();
											});
											$('pre.html').each(function(i, e) {hljs.highlightBlock(e, null);});
										});
								}
							});
						} else {
						// is active
							$('.wcemasks').fadeOut(); // temp code
							$('.novisual').removeClass('novisual'); // temp code
							$('.wcscore', that).hide();
							that.popover('title', $.i18n.t('tbar.vld.defText')).popover('content', '').popover('hide').removeClass('active');
						}

						return;
					} else if ($(this).is('.runSpeedTest')) {
						var score = that.data('pagescore');
						if (!that.is('.active')) {
							that.addClass('active');
							if (score > 0)  {
								$('.wcscore', that).fadeIn(); that.popover('title', that.data('ptitle')).popover('content', that.data('pcontent')).popover('fadeIn'); return;
							}

							that.popover('hide');
							that.spin({lines:8, length:10, width:6, radius:14, color:'green'});
							webC.apis.get('pagespeed', {
							url: 'http://' + $orgUrl
						}, function(data) {
								if (data.score > 0) {
										// var $gPageSpeed = data;
									var td = {
											score: data.score,
											color: 'cred',
											bgcolor: 'bred',
											speed: 'slow'
										};
									var s = td.score;
									if (s >= 75 && s <= 88) { _.extend(td, {color:'cyellow', bgcolor:'byellow', color:'yellow', speed:'ok'}); }									else if (s > 88 && s <= 93) { _.extend(td, {color:'cgreen', bgcolor:'bgreen', speed:'good'}); }

									if (s > 93) _.extend(td, {speed:'excellent'});

									// toolbar/pagespeed.dust template
									dust.render(templates.toolbar.pagespeed, _.extend(td, data.pageStats), function(err, out) {
											$('.wcscore', that).text(td.score).addClass(td.bgcolor).fadeIn();
											that.data({pagescore:td.score, ptitle:td.ptitle, pcontent:out}).popover('title', td.ptitle).popover('content', out).popover('fadeIn').spin(false);
										});
								}
							});
						} else {
						// is active
							$('.wcscore', that).hide();
							that.popover('title', $.i18n.t('tbar.psd.defText')).popover('content', '').popover('hide').removeClass('active');
						}

						return;
					} else if ($(this).is('.runSpellCheck')) {
						if ($(this).data('spellckecked')) {
							$spellchecker.destroy();

							// $spellchecker = {};
							$('.wcscore', that).hide();
							that.data('spellckecked', false).removeClass('active').popover('title', $.i18n.t('tbar.spl.defText')).popover('content', '').popover('hide');
						} else {
							that.addClass('active');
							$('.runSpellCheck').popover('hide');
							that.spin({lines:8, length:10, width:6, radius:14, color:'red'});
							if ($spellchecker !== undefined) $spellchecker.destroy();
							$spellchecker = new $.SpellChecker($body, {
								parser: 'html',
								webservice: {
							path: 'http://' + wcserver + '/spellchecker/',
							driver: 'aspell'
						},
								suggestBox: {
							position: 'below'
						}
							});

							// Bind spellchecker handler functions
							$spellchecker.on('check.complete', function(words) {
							that.data('spellckecked', true).spin(false);
							setTimeout(function() {
								var l = $('.spellchecker-word-highlight').length;
								if (words[0].length > 0 && l > 0) { } else {l = 0;} // fixme please
								// toolbar/spellchecker.dust template
								dust.render(templates.toolbar.spellchecker, {errors: l}, function(err, m) {
									$('.wcscore', that).text(l).fadeIn();
									$('.runSpellCheck').popover('title', $.i18n.t('tbar.spl.textDone')).popover('content', m).popover('fadeIn');
								});
							}, 1000);
						});
							$spellchecker.check();
						}

						return;
					}

					open.new();
				}).hoverIntent(function(e) {
					$('.oOptions', this).stop().fadeIn();
				}, function(e) {
					$('.oOptions', this).stop().fadeOut();
				});
	 }
});

var chatModel = Backbone.View.extend({
	initialize: function() {
			this.render();
		},
	rerender: function() {
		 $('#wcorchat').remove();
		 this.render();
	},
	render: function() {
			var self = this;
			dust.render(templates.chat, {}, function(err, out) {
				$(out).appendTo(document.body);

					// if (self.model.get('chatOpen')) self.activetool('tbSelect');
				if (self.model.get('chatposition') !== 0) $('#wcorchat').css('top', self.model.get('chatposition'));
				if (self.model.get('chatOpen') === false) {
					$('#chatwrap').hide(); $('#wcorchat > .chathandle').addClass('notactive');
				}

				self.addHandlers();
			});
			return this;
		}, addHandlers:  function() {
			var self = this;
			if (!isSafari || !iOS) {
				$('#chatmessage').placeholder();
			}

			$('.chathandle').on('click', function(event) {
				event.preventDefault();
				event.stopPropagation();
				if ($(this).parent().is('.wchatdrag')) return;
				$(this).toggleClass('notactive');
				var cw = $('#chatwrap');
				if (cw.is(':hidden')) {
					cw.parent('#wcorchat').css('width', '308px');
					cw.fadeIn();
				} else {
					cw.fadeOut(function() { cw.parent('#wcorchat').css('width', 'auto'); });
				}

				self.model.set('chatOpen', !self.model.get('chatOpen'));
			 });

			$('#wcorchat').drag('start', function() {
				$(this).addClass('wchatdrag');
			}).drag(function(ev, dd) {
			$(this).css({
				top: dd.offsetY - $(window).scrollTop(),
				bottom: 'auto'
			});
		}, {click:true}).drag('end', function() {
			var that = this;
			setTimeout(function() {
						$(that).removeClass('wchatdrag');
						self.model.set('chatposition', $(that).css('top'));
					}, 300);
		});

			$('#chatmessage').keydown(function(e) {
			//console.info(getCaretPosition(this));
				if (e.keyCode == 13) {
					e.preventDefault();

					//if (isOpera) $(this).blur();
					var m = $.trim($(this).text());

					// ipc.send('changeURL', {
					//     url: m
					// });
					// $('#chatmessage').empty().text(' ');
					// var from = wcApp.User.get('name');
					// // enter was pressed
					// if (from == 'You') {
					//     var d = $state.at('wcdata');
					//     var users  = d.at('users').get();
					//     users.forEach(function(u,i) {
					//       if (u.id == wcApp.User.get('id')) {
					//         from = u.name;
					//       }
					//   });
					// }
					// var d  = $state.at('wcdata');
					// d.at('chat').push({
					//    from: from,
					//    id:wcApp.User.get('id'),
					//    message: m
					// });
				}
			}).on('click', function(event) {
			event.preventDefault();
			if ($(this).text() == $.i18n.t('chat.chathere')) {
				$(this).empty().text(''); // opera bug cant use this
				$(this).parent().removeClass('ui-placeholder-hasome').find('.ui-placeholder').show().fadeIn(300, function() {$(this).addClass('active');});
			}

			$(this).addClass('active').focus();
		}).on('focusout', function(event) {
			$(this).removeClass('active');
			if ($(this).text() == ' ') {
				$(this).empty().text('');
			}
		}).on('focusin', function(event) {
			$(this).addClass('active');
		});
		}
});

var SideMenusModel = Backbone.View.extend({

		// Left and Right Menus
	initialize: function() {
			this.snapper = {};
			this.render();
		},
	rerender: function() {
	// if(this.snapper.oleft) {
		 this.snapper.close();
		 $('#wcsettings, #wchistory').remove();
		 this.render();
	},
	render: function() {
		var self = this;
		dust.render(templates.sidemenu.leftright, this.model.toJSON(), function(err, out) {
				// if (self.model.get('chatOpen')) self.activetool('tbSelect');
				// if (self.model.get('chatposition') !== 0) $('#wcorchat').css('top', self.model.get('chatposition'));
				// if (self.model.get('chatOpen') === false) { $('#chatwrap').hide(); $('#wcorchat > .chathandle').addClass('notactive'); }
			$(out).insertAfter(document.body);

			//  new Miniscroll(".wchistorywrap", {
			//     axis: "y",
			//     size: 10,
			//     sizethumb: "auto",
			//     thumbColor: "#666",
			//     trackerColor: "#303030"
			// });
			//  new Miniscroll(".wcsettingwrap", {
			//     axis: "y",
			//     size: 10,
			//     sizethumb: "auto",
			//     thumbColor: "#666",
			//     trackerColor: "#303030"
			// });
			new webC.dropDown($('.wcdd-wrap'), function(val, data) {
				wcApp.settings.set({lang:val, langid:data});
			});

			self.snapper = new $.SnapMenu({
				element: document.body,
				dragger: document.getElementById('wcsettings-close')
			});

			console.log('self.snapper', self.snapper);
			$('#wcsettings-close, #wchistory-close').addClass('wcvisible');
			self.addHandlers();
		});
		return this;
	}, addHandlers:  function() {
		var self = this;
		$('.wccode').on('click mouseenter', function(e) {
			e.preventDefault();
			e.stopPropagation();
			if (e.type == 'click') {
				$(this).addClass('edit').data('prev', $(this).val());
			}
		}).on('keydown', function(e) {
				if (e.keyCode == 13) {
					e.preventDefault();
					$(this).blur();
				} else if (e.keyCode == 27) {
					$(this).val($(this).data('prev')).blur();
				}
			}).blur(function() {
				 var v = $(this).val().trim().toLowerCase(),
				 p = $(this).data('prev');
				 if (v == '') {
					$(this).val('').parent().removeClass('selected').next().find(':checked').prop('checked', false);

					// wcApp.settings.set('followcode', false);
				} else if (v !== p) {
						// wcApp.settings.set('followcode', v);
						// $(this).parent().data('followcode', v).addClass('selected').next().find(':checkbox').prop('checked', true);
				}

				$(this).removeClass('edit').next().focus();
			});

		$('.wcswitch').on('click', function(e) {
			e.preventDefault();
			e.stopPropagation();
			var el = $(this);
			var p = el.prev('.wcoptitle');
			var k = p.data('skey');
			if (_.isUndefined(k)) alert('Settings key not specified, please report this!');
			var c = el.find(':checkbox');
			var i = p.find('.wcinput').data('val');
			var s = !c[0].checked;
			c.prop('checked', s);
			if (!_.isUndefined(i) && i !== '' && c[0].checked) s = i;
			p.data(k, s);
			wcApp.settings.set(k, s);
			if (c[0].checked) {
				p.addClass('selected');
			} else {
				p.removeClass('selected');
			}
		});

		self.snapper.side = '', self.snapper.oleft = self.snapper.oright = false;

		self.snapper.on('open', function() {
			if (self.snapper.side == 'left') {
				$('#wcsettings').transition({left:0}, 300, 'ease').addClass('sideopen');
				$('#wcsettings-close').attr('data-hint', $.i18n.t('sets.titleCl'));
				self.snapper.oleft = true;
			} else {
				$('#wchistory').transition({right:0}, 300, 'ease').addClass('sideopen');
				$('#wchistory-close').attr('data-hint', $.i18n.t('hist.titleCl'));
				self.snapper.oright = true;
			}

			$(document.body).css({overflow:'hidden', opacity:'0.2'});
		});

		self.snapper.on('close', function() {
			if (self.snapper.side == 'left') {
				$('#wcsettings').transition({left:'-300px'}, function() { $(this).removeClass('sideopen');});
				$('#wcsettings-close').attr('data-hint', $.i18n.t('sets.titleOp'));
				self.snapper.oleft = false;
			} else {
				$('#wchistory').transition({right:'-300px'}, function() { $(this).removeClass('sideopen');});
				$('#wchistory-close').attr('data-hint', $.i18n.t('hist.titleOp'));
				self.snapper.oright = false;
			}

			$(document.body).css({overflow:'auto', opacity:'1'});
		});

		$('#wcsettings-close, #wchistory-close, .wcsclose').click(function() {
			if (!$(this).is('.wcsclose')) $(this).css({width:'60px'});
			var side =  $(this).data('side');
			var state = self.snapper.state().state;
			self.snapper.side = side;

			if (isOpera && $('body').is('.snapjs-' + side)) {
				self.snapper.close(side);
				return false;
			}

			if (state == side || (side == 'left' && self.snapper.oleft) || (side == 'right' && self.snapper.oright)) {
				self.snapper.close();
			} else {
				self.snapper.open(side);
			 }
		});
		$('#wcsettings-close, #wchistory-close').hoverIntent(function(e) {
				if ($(this).parent().parent().is('.sideopen')) return;
				var side =  $(this).hasClass('left');
				var bgpos = 'left';
				if (side) bgpos = 'right';
				$(this).transition({width:88, 'background-position':bgpos});
			}, function(e) {
				$(this).transition({width:60, 'background-position':'center'});
			});
	}
});

wcApp.settings = new settingsModel(wcSettings);

wcApp.session.on('change:reloadby', function(model, by) {
		// alert('Follow Code is: '+ code);
		// $.jGrowl("Page reloading by <b>"+by+"</b><br>Following code: <b>"+wcApp.settings.get('followcode')+"</b>", {sticky:true});
	setTimeout(function() { location.reload();}, 1000);
});

$.extend(wcApp, {
	restart: function() {
			// restart wcApp here
		_.each(wcApp.submodules, function(module) { module.stop(); });
		wcApp._initCallbacks.reset();
		wcApp.start(wcApp.settings.toJSON());
		wcApp.sideMenusView.rerender();
		wcApp.toolbarView.rerender();
		wcApp.chatView.rerender();
	}
});

wcApp.on('initialize:before', function(options) {
	$.i18n.setLocale(wcApp.settings.get('langid'));
});

wcApp.on('start', function(options) {
	// app start here
});

// wcApp.addRegions({
//   toolbar: "#wctoolbar",
//   chat: "#wcorchat"
// });

wcApp.start(wcApp.settings.toJSON());

// wcApp.toolbarView = new toolbarModel({
//     // el: '#weatherObservationModule',
//     model: wcApp.settings,
//     // tmpl: '#weatherObservationModuleTemplate'
// });

wcApp.chatView = new chatModel({
		// el: '#weatherObservationModule',
	model: wcApp.settings,

	// tmpl: '#weatherObservationModuleTemplate'
});

wcApp.sideMenusView = new SideMenusModel({
		// el: '#weatherObservationModule',
	model: wcApp.settings,

	// tmpl: '#weatherObservationModuleTemplate'
});

// wcApp.lang = new wcApp.model.lang.set({name:'val',id:'data'});
// wcApp.lang.set({name:'Test'})

// alert(wcApp.lang.get('name'));

// restart example
// _.extend(Marionette.Application.prototype, {

// wcApp.extend = function(wcApp.settings) {
	// restart: function() {
	// _.each(wcApp.submodules, function(module) { module.stop(); });
	// wcApp.initCallbacks.reset();
	// wcApp.start();
	// }
// };

// Module examples
// wcApp.module("myModule", function(myModule, wcApp, Backbone, Marionette, $, _, customArg1, customArg2){
		// Create Your Module
// }, customArg1, customArg2);

// console.log(wcApp.settings);

// wcApp.set('lang', 'en_US');

// alert(wcApp.get('lang'));

// alert(webC.i18n.t("toolbar.hello", {name: "Sergey"}));

// WebCorrectorApp.noUsersView = Backbone.Marionette.ItemView.extend({
//      template: '#noUserView'
// });

// var UsersView = Backbone.Marionette.CollectionView.extend({
//     itemView: UsersView,
//     emptyView: noUsersView
// });

if (window.location != window.parent.location) {
	$('#wcfControl').remove();

	// return;
}

$(window).on('orientationchange', function() {
	webC.helper.onOrientationChange();
});

var hashnow = document.location.hash;

var wcserver = 'demo.webcorrector.pro',
$body = $('body'),
globalCount = 0,
actionMessage = 'click',
wcfControlReady = false,
isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor),
iOS = /(iPad|iPhone|iPod)/g.test(navigator.userAgent),
isOpera = /opera/.test(navigator.userAgent.toLowerCase()),
windowWidth = $(window).width(),
hasTouch = (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0)) ? true : false;

if (hasTouch) {
	actionMessage = 'tap';
}

$(function() {
		// this function called on dom ready
		/*
		if ($('#wcfControl').length == 0) {
				if (webC.cookies.read('wcfdown') == 1) {
				 $body.addClass('wcfdown').prepend('<iframe id="wcfControl" src="http://192.168.1.8:8888/wcframe.html" scrolling="no" class="wcfdown" style="width:100%;height:60px;border:none;position:fixed;bottom:0;left:0;z-index:2147483501" />');
				} else {
				 $body.addClass('wcfup').prepend('<iframe id="wcfControl" src="http://192.168.1.8:8888/wcframe.html" scrolling="no" class="wcfup" style="width:100%;height:60px;border:none;position:fixed;top:0;left:0;z-index:2147483501" />');
				}
		}
		$('iframe:not(#wcfControl)').each(function() {
		var p = $(this).parent();
		$(this).remove();
		if (!$.trim(p.text()).length && !p.children().length) {
				p.remove();
		}
	});
*/
});

// $body.prepend('<div id="wc-hidden" style="display:none"></div>');

window.onbeforeunload = function(e) {
		// if (wcApp.settings.get('followcode') && !wcApp.session.get('reload')) {
		// followSelf();
		// $.ajax({
		//     dataType: 'json',
		//     cache: false,
		//     url: 'http://' + wcserver + '/checkurl/' + url,
		//     success: function(data){
		//       $state.submitOp({"p":["wcdata","actions"], od:{ from:n,element:url,hash:hash,action:"goingto"}, oi:{ from:n,element:url,hash:hash,action:"goingto"}});
		//     },
		//     async : false
		// });
		// return "test";
	// }
};

// Fix this, echo.msk.ru does not work correctly, can't locate elements on page, if html margin-top set
// var wcFrameOffset = 53; // top and bottom offsets of wcFrame

// var igbodyregx = /ashtonconsultinggroup/i;
// if (igbodyregx.test(document.location))  {
//     $('html').css({'margin-bottom':wcFrameOffset+'px','margin-top':wcFrameOffset+'px'});
// } else {
//     $body.css({'padding-bottom':wcFrameOffset+'px','padding-top':wcFrameOffset+'px'});
// }

if (($body.css('max-width') != 'none') && ($body.css('position') == 'relative')) $body.css('position', 'static');

var offlineFragment = document.createDocumentFragment();

var inspectStyle = 'margin:0; padding:0; border:0; position:absolute; overflow:hidden; display:block;z-index: 2147483500;';

var outlineStyle = {
	fbHorizontalLine: 'height: 2px;',
	fbVerticalLine: 'width: 2px;',
	fbInfoPanel: 'height: 18px;display:none;position:absolute;padding-top:6px;padding-left:5px;padding-right:5px;color:#FFF;font-size:11px;text-transform:uppercase;font-weight:bold;font-family:arial,sans-serif;line-height: 12px;'
};

var outlineElements = {};
var outline = {
	fbOutlineT: 'fbHorizontalLine',
	fbOutlineL: 'fbVerticalLine',
	fbOutlineB: 'fbHorizontalLine',
	fbOutlineR: 'fbVerticalLine',
	fbOutlineR: 'fbVerticalLine'
};

var isInspecting;
var isSelected = false;
var isEdit = false;
var isHover = false;

for (var name in outline)  {
	var el = outlineElements[name] = document.createElement('div');
	el.id = name;
	el.firebugIgnore = true;
	el.style.cssText = inspectStyle + outlineStyle[outline[name]];
	offlineFragment.appendChild(el);
}

var infobox = document.createElement('div');
infobox.id = 'fbOutlineInfo';
infobox.firebugIgnore = true;
infobox.style.cssText = inspectStyle + outlineStyle['fbInfoPanel'];
document.getElementsByTagName('body')[0].appendChild(infobox);

var outlineVisible = false;
var timer, timerOut, timerOutSuggest, timerAutoScroll;

var excludeSelectors = ':not(#wcfControl,#jGrowl):not([wcelement]):not([wcelement] *):not(.wc-edited-content):not(.wc-edited-content *):not(#jGrowl *):not(.wcemasks)';

if (hasTouch) {
	var $target;

	tappable('#fbOutlineInfo', {
		onTap: function(e, target) {
			webC.helper.onElementSelect($target);
		 }
	});

	tappable('body *', {
		onTap: function(e, target) {
		if (hasTouch && ($target != target)) {
			webC.helper.onElementOut();
			webC.helper.onElementOver(target, e);
		} else {
			webC.helper.onElementSelect(target);
		}

		$target = target;
	 }
	});
} else {
	$body.on('mouseover.wcevents mouseout.wcevents', excludeSelectors, function(event) {
		event.preventDefault();
		event.stopPropagation();
		if (isSelected) return;
		if (event.type == 'mouseover') {
			webC.helper.onElementOver(this, event);
		} else {
			webC.helper.onElementOut();
		}

		return false;
	}).on('click.wcevents', excludeSelectors, function(event) {
		if ($('.spellchecker-suggestbox').is(':visible')) return;
		event.preventDefault();
		event.stopPropagation();
		webC.helper.onElementSelect(this);
	});
}

webC.htmlToText = function(html) {
	if (!html) return;

	var text = html
			.replace(/(?:\n|\r\n|\r)/ig, ' ')

			// Remove content in script tags.
			.replace(/<\s*script[^>]*>[\s\S]*?<\/script>/mig, '')

			// Remove content in style tags.
			.replace(/<\s*style[^>]*>[\s\S]*?<\/style>/mig, '')

			// Remove content in comments.
			.replace(/<!--.*?-->/mig, '')

			// Remove !DOCTYPE
			.replace(/<!DOCTYPE.*?>/ig, '')
			.replace(/<\s*br[^>]*\/?\s*>/ig, '\n')
			.replace(/(<([^>]+)>)/ig, ' ')

			// Trim rightmost whitespaces for all lines
			.replace(/([^\n\S]+)\n/g, ' ')
			.replace(/([^\n\S]+)$/, '')
			.replace(/^\n+/, '')

			// Remove newlines at the end of the text.
			.replace(/\n+$/, '')

			// remove inline  links
			.replace(/(\b(https?|ftp|file):\/\/)([-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig, ' ')
			.replace(/[^a-zA-Z\u0410-\u042F\u0430-\u044F\u0401\u0451]/g, ' ').replace(/(?:(?:^|\n)\s+|\'|\"\s+(?:$|\n))/g, '').replace(/\s+/g, ' ');

	html = '';
	return text;
};

webC.helper = {

	initUser: function() {
		var id = webC.cookies.read('wcuid'),
		name = webC.cookies.read('wcuname');

		// alert('name: ' +  name );

		if (!id) {
			id = $.fn.generateUUID();
		}

		if (!name) {
			name = 'You';
			$.jGrowl("<span>Hello there! <br> Please enter your name in upper right corner, so we know, who you are. <br> <a href='#' class='clicktest'>insert text</a>", {sticky:true});
		}

		wcApp.User = new Backbone.Model({
			id: id,
			name: name
		});

		wcApp.User.on('change:name', function(model, name) {
				// alert("Changed name from " + wcApp.User.previous('name') + " to " + name);
			var oldVal = wcApp.User.previous('name');
			if (oldVal != name) {
				var id = wcApp.User.get('id');

				// var d  = $state.at('wcdata');
				var users  = d.at('users');
				var us = users.get();
				var ucount = 0;
				us.forEach(function(u, i) {
					if (u.id == id) {
						ucount++;
						users.at(i).remove();
						if (ucount == 1) {
							users.push({
									 id: id,
									 name: name
								});
						}
					}
				});
				if (oldVal != 'You') {
					$.jGrowl('You just changed your name<br> from <b>' + oldVal + '</b> to <b>' + name + '</b>');
					var notes = $('.sticky, .dragdraw').filter(function() {
						return $(this).data('uid') == id;
					}).find('.sticky-status, .drawdrag-status');
					notes.text(name);
				} else {
					$('.jGrowl-close').trigger('click');
					setTimeout(function() { $.jGrowl('<b>' + wcApp.User.get('name') + '</b>, welcome to WebCorrector<br>On this page you can select any blocks content and change its text. All changes saved automatically.', {life:5000}); }, 1000);
				}

				webC.cookies.erasewithpath('wcuname');
				webC.cookies.create('wcuname', name);
				globalUserName = name;

			 // $("#wcfControl").postMessage({name: name});
			 }
		});

			// send user name to wcframe after init (need fix)
		globalUserName = name;
	},

	textElement: function(color) {
		sendText = function(type, el, elnewHtml) {
			if (type == 'highlights') {
				var op = {
					suid: wcSession.uid,
					type: 'actions',
					element: 'body',
					serdata: serialization(),
					action: type
				};
			}

			if (type == 'textedit') {
				var op = {
					suid: wcSession.uid,
					type: 'actions',
					element: 'body',
					serdata: serializationEdit(el, elnewHtml),
					action: type
				};
			}

			webC.report.broadcast(op, 'actions');
		},

		deserializationTextEdit = function(json) {
			try {
				var txtDescriptor = JSON.parse(json);
			} catch (e) {
				throw "Can't parse serialized text: " + e;
			}

			var el = txtDescriptor.path;
			var elNew = txtDescriptor.elNewHtml;
			var $elf;

			if (txtDescriptor.startext != '_empty_') {
				var t = $(el).text().trim();
				if (t.indexOf(txtDescriptor.startext) == 0) {
					$elf = $(el);
				} else {
					$elf = $(el).first();
				}
			}

			var $elfCopy = $elf.clone(true, true);
			var diff = webC.compare_full.diff($elf.html(), elNew);
			$elfCopy.html(diff);
			$elfCopy.insertBefore($elf).addClass('wc-edited');
			$elf.remove();
		},

		deserialization = function(json) {
			try {
				var hlDescriptors = JSON.parse(json);
			} catch (e) {
				throw "Can't parse serialized highlights: " + e;
			}

			$('body').getHighlighter().removeHighlights();
			$.each(hlDescriptors, function(i, hlDescriptor) {
					deserializationFn(hlDescriptor);
				});
		},

		deserializationFn = function(hlDescriptor) {
			var wrapper = hlDescriptor[0];
			var hlText = hlDescriptor[1];
			var hlPath = hlDescriptor[2].split(':');
			var elOffset = hlDescriptor[3];
			var hlLength = hlDescriptor[4];
			var parentEl = hlDescriptor[5];
			var elIndex = hlPath.pop();
			var idx = null;
			var node;
			wrapper = $(wrapper).on('click.wcevents', function(e) {
				if (e.altKey) {
					$('body').getHighlighter().removeHighlights(this);
					var sfn = webC.helper.textElement();
					sfn.send('highlights');
				}
			});

			var el = parentEl.path;
			var $elf;
			if (parentEl.startext != '_empty_') {
				var t = $(el).text().trim();
				if (t.indexOf(parentEl.startext) == 0) {
					$elf = $(el);
				} else {
					$elf = $(el).first();
				}
			}

			if ($elf.is('.wc-original')) {
				node = $elf.next()[0];
			} else {
				node = $elf[0];
			}

			_.each(node.childNodes, function(n) {
					// console.re.log('Found text: (%s)', hlText, 'Pos', pos);
				if (n.nodeType === 3) {
					var pos = n.data.indexOf(hlText);
					if (pos >= 0) {
					// var spannode = document.createElement('span');
					// spannode.className = self.options.highlightedClass;
						var middlebit = n.splitText(pos);
						var endbit = middlebit.splitText(hlText.length);

						// var middleclone = middlebit.cloneNode(true);
						// spannode.appendChild(middleclone);
						// middlebit.parentNode.replaceChild(spannode, middlebit);
						if (middlebit.nextSibling && middlebit.nextSibling.nodeValue == '') {
							middlebit.parentNode.removeChild(middlebit.nextSibling);
						}

						if (middlebit.previousSibling && middlebit.previousSibling.nodeValue == '') {
							middlebit.parentNode.removeChild(middlebit.previousSibling);
						}

						var highlight = $(middlebit).wrap(wrapper).parent().get(0);

						// highlights.push(middlebit);
					}
				}
			});

			// return highlight;
		},

				serializationEdit = function(el, elNewHtml) {
						// console.re.log(elNewHtml);
						/*
						var ins = $(el).find('ins');
						var del = $(el).find('del');
						var first5, last5, prevNode, nextNode;

						$(el).find('.wc-edited-content').each(function() {
							// var texts = $(this).map(function(){
							//     return this.previousSibling.nodeValue
							// });
							// texts[0]; // "Some text followed by "
							// texts[1]; // " and another text followed by "
							$(this).css('outline','1px solid red');
							prevNode = this.previousSibling;
							nextNode = this.nextSibling;

							if (prevNode) {
								if (prevNode.nodeValue !== null) {
								first5 = prevNode.nodeValue.slice(-10);
								} else {
								first5 = '_empty_';
								}
							}
							if (nextNode) {
								if (nextNode.nodeValue !== null) {
								last5 = nextNode.nodeValue.slice(0,10);
								} else {
								last5 = '_empty_';
								}
							}
								console.re.log(first5);
								console.re.log(last5);
							 // console.re.log('del text: %s',$('del',this).text());
							 // console.re.log('ins text: %s',$('ins',this).text());
						});

						return;

						$highlights.each(function(i, highlight) {
								var offset = 0; // Hl offset from previous sibling within parent node.
								var length = highlight.firstChild.length;
								var hlPath = getElementPath(highlight, refEl);
								var wrapper = $(highlight).clone().empty().get(0).outerHTML;
								var $highlight = $(highlight);

								var $parent = $highlight.parent();

							// $parent.css('border','1px solid red');

							// lets send highlights
							});
							*/

							// var node = $parent.contents().filter(function () { return this.nodeName=="#text" }),
					var elpath = $(el).getPathOriginal(),
					text = $(el).text().trim(),
					first = text.split(' ', 2).join(' ');
					if (first == '') first = '_empty_';

					var hlDescriptor = {
						path: elpath,
						startext: first,
						elNewHtml: elNewHtml
					};

					// console.re.info(hlDescriptor);
					return JSON.stringify(hlDescriptor);
				},
			 /**
			 * Serializes all highlights to stringified JSON object.
			 */
				serialization = function() {
					var hl = $('body').getHighlighter();
					var $highlights = hl.getAllHighlights(document.body);

					var refEl = document.body;
					var hlDescriptors = [];
					var self = this;

					var getElementPath = function(el, refElement) {
						var path = [];

						do {
							var elIndex = $.inArray(el, el.parentNode.childNodes);
							path.unshift(elIndex);
							el = el.parentNode;
						} while (el !== refElement);

						return path;
					};

					$highlights.each(function(i, highlight) {
						var offset = 0; // Hl offset from previous sibling within parent node.
						var length = highlight.firstChild.length;
						var hlPath = getElementPath(highlight, refEl);
						var wrapper = $(highlight).clone().empty().get(0).outerHTML;
						var $highlight = $(highlight);

						var $parent = $highlight.parent();

							// $parent.css('border','1px solid red');

						// lets send highlights
						var elpath = $parent.getPathOriginal();

						// var node = $parent.contents().filter(function () { return this.nodeName=="#text" }),
						text = $parent.text().trim(),
						first = text.split(' ', 2).join(' ');
						if (first == '') first = '_empty_';

						if (highlight.previousSibling && highlight.previousSibling.nodeType === 3) {
							offset = highlight.previousSibling.length;
						}

						// rcl.log("highlight.innerText N %s :", i, $(highlight).text());

						hlDescriptors.push([
								wrapper,
								$(highlight).text(),
								hlPath.join(':'),
								offset,
								length,
										{
											path: elpath,
											startext: first
										}
								]);
					});
					return JSON.stringify(hlDescriptors);
				};

		return {
		deserializeTextEdit: deserializationTextEdit,
		deserialize: deserialization,
		serialize: serialization,
		send: sendText
	};
	},

	getViewport: function(a) {
		var b = 0,
				c = 0,
				b = document.documentElement.clientWidth;
		'undefined' !== typeof window.innerHeight ? c = window.innerHeight : 'undefined' !== typeof document.documentElement && ('undefined' !== typeof document.documentElement.clientWidth && 0 !== document.documentElement.clientWidth) && (c = document.documentElement.clientHeight);
		!0 === a && document.body.scrollHeight > c && ('undefined' !== typeof window.innerWidth ? b = window.innerWidth : util.isIE8() && (b += 17));
		return {
			width: b,
			height: c
		};
	},

	getViewPortInfo: function() {
		var a = null,
										b = {
											zoomLevel: 0,
											contentWidth: 0,
											contentHeight: 0,
											orientation: 'L',
											deviceWidth: 0,
											deviceHeight: 0,
											retina: !1,
											mult: 0
										};
		b.zoomLevel = detectZoom.zoom();
		0 === b.zoomLevel && (b.zoomLevel = 1);
		if (util.checkMobile()) {
			a = document.defaultView.getComputedStyle(document.documentElement, null), b.contentWidth = parseInt(a.width.replace(/px/, ''), 10), b.contentHeight = parseInt(a.height.replace(/px/, ''), 10), b.orientation = 90 === window.orientation || -90 === window.orientation ? 'L' : 'P', util.checkMobileChrome() ? (b.zoomLevel *= 2, b.deviceWidth = window.screen.width * window.devicePixelRatio, b.deviceHeight = window.screen.height * window.devicePixelRatio) : (b.deviceWidth = window.screen.width, b.deviceHeight =
					window.screen.height), b.retina = util.isRetina();
		} else {
			var a = webC.helper.getViewport(),
					c = 1;
			0.0010 < Math.abs(b.zoomLevel - 1) && (c = b.zoomLevel);
			b.contentWidth = a.width;
			b.contentHeight = a.height;
			b.deviceWidth = Math.round(a.width * c);
			b.deviceHeight = Math.round(a.height * c);
		}

		b.mult = 1;
		0.0010 < Math.abs(b.zoomLevel - 1) && (b.mult = b.zoomLevel);
		return b;
	},
	getDocumentHeight: function() {
		var a = document;
		return Math.max(Math.max(a.body.scrollHeight, a.documentElement.scrollHeight), Math.max(a.body.offsetHeight, a.documentElement.offsetHeight), Math.max(a.body.clientHeight, a.documentElement.clientHeight));
	},
	getDocumentWidth: function() {
		var a = document;
		return Math.max(Math.max(a.body.scrollWidth, a.documentElement.scrollWidth), Math.max(a.body.offsetWidth, a.documentElement.offsetWidth), Math.max(a.body.clientWidth, a.documentElement.clientWidth));
	},
	getHTML: function() {
		return webC.helper.getDocType(document) + '<html' + $('html').getAttributes() + '>' + $('html').html() + '</html>';
	},
	setBase: function() {
		if ($('base').length > 0) return $('base').attr('href');
		return '';
	},
	getScreenShotData: function(rect) {
	var rbox = rect || '';

	return {
		html: webC.helper.getHTML(),

		// zoom: detectZoom.zoom() || 1,
		base: webC.helper.setBase(),
		width: $(window).width(),
		height: $(window).height(),
		userAgent: navigator.userAgent,
		delay: 100,
		scrollbar_width: webC.helper.scrollbarWidth(),
		offtop: $(window).scrollTop(),
		offleft: $(window).scrollLeft(),
		url: 'http://' + $orgUrl,
		rect: rbox
	};
},
	preScreenShot: function() {
	$('#wctoolbar, #wcorchat, #wcsettings, #wchistory').hide();
},
	postScreenShot: function() {
		// $('body').css({'overflow-x':'auto','overflow-y':'auto'});
		$('#wctoolbar, #wcorchat, #wcsettings, #wchistory').show();
	},
	scrollbarWidth: function() {
		var $inner = $('<div style="width: 100%; height:200px;">test</div>'),
				$outer = $('<div style="width:200px;height:150px; position: absolute; top: 0; left: 0; visibility: hidden; overflow:hidden;"></div>').append($inner),
				inner = $inner[0],
				outer = $outer[0];

		$('body').append(outer);
		var width1 = inner.offsetWidth;
		$outer.css('overflow', 'scroll');
		var width2 = outer.clientWidth;
		$outer.remove();
		 return (width1 - width2);
	},

	isRetinaDisplay: function() {
		return 1 < window.devicePixelRatio;
	},

	onElementOver: function(element, event) {
		clearTimeout(timerOut);
		if (isSelected) return;

// laert()
		if (!wcApp.settings.get('tbSelect') && !wcApp.settings.get('tbEditText') && $('.dragdraw.selected').length < 1 && $('.sticky.selected').length < 1 && $('.dragbox.selected').length < 1 && $('.dragdraw.grab').length < 1 && $('.stickeround.selected').length < 1) return;

		if ($(element).width() >= $(window).width()) return;
		if ($('.dragdraw.grab').length > 0 && !$(element).is('img')) return;
		if (event) event.preventDefault();

		this.setOutlineBox(element);
		isHover = true;

		if ($(element).attr('href') && !$(element).data('ldisabled')) {
			element.href = 'javascript:void(0)';
		}

		if ($(element).attr('onclick') && !$(element).data('ldisabled')) {
			element.onclick = function(e) {return false;};
		}

		var that = element;
		timer = setTimeout(function() {
			if ($('#fbOutlineT').length == 0) return;
			var t = $('#fbOutlineT').offset();
			var n = that.nodeName;
			var tl = $(that).justtext().trim().length;
			var emessage = '- ' + actionMessage + ' to edit';
			var smessage = '- ' + actionMessage + ' to select';
			var m = '';
			if (/div|ul|section|td|tr|table|input/i.test(n)) {
				m = 'block' + smessage;
			} else if (/img/i.test(n)) {
				m = 'image - click to select';
			} else if (/li|p/i.test(n)) {
				tl = $(that).text().trim().length;
			} else {
				m = 'block' + smessage;
			}

		//console.info($(that).justtext().trim().length);
			if (tl > 0) {
				m = 'text' + emessage;
				$(that).data('wccanedit', '1');
			} else if (wcApp.settings.get('tbEditText')) {
				var tw = $('#fbOutlineT').width();
				var th = $('#fbOutlineL').height();
				m = 'not a text';
				webC.helper.setColorOutline('red');
				$('#wcnoedit').css({top:(t.top + th / 2 - ((th / 3) / 2)) + 'px', left:(t.left + tw / 2 - ((tw / 3) / 2)) + 'px', width: (tw / 3) + 'px', height: (th / 3) + 'px'}).fadeIn();
				$('#fbOutlineInfo').css({'background-color':'red', top:(t.top - 24) + 'px', left:(t.left - 2) + 'px'}).text(m).fadeIn();
				return;
			}

			if (m != '')  {
				$('#fbOutlineInfo').css({'background-color':'#3875D7', top:(t.top - 24) + 'px', left:(t.left - 2) + 'px'}).text(m).fadeIn();
			}

			var u = wcApp.User.get('name');
			var elpath = $(that).getPathOriginal();

			var node = $(that).contents().filter(function() { return this.nodeType == 3; }).first(),
			text = node.text().trim(),
			first2 = text.split(' ', 2).join(' ');
			if (first2 == '') first2 = '_empty_';

			// $state.submitOp({"p":["wcdata","actions"], od:{ from:u,element:elpath,startext:first2,action:"hover"}, oi:{ from:u,element:elpath,startext:first2,action:"hover"}});
		}, 500);
		return false;
	},

	onElementOut: function(e)  {
		$('#fbOutlineInfo').hide();
		this.hideOutline();
		clearTimeout(timer);
		isHover = false;
		timerOut = setTimeout(function() {
		// delete and insert so no trace in Document for hover action
		// $state.submitOp({"p":["wcdata","actions"], od:{ from:'',element:'',startext:'',action:"out"}, oi:{ from:'',element:'',startext:'',action:"out"}});
		}, 1000);
	},

	onElementSelect: function(element) {
		if (isSelected) return;
		if (!isHover) return;

		if ($(element).width() >= $(window).width()) return;
		$('#fbOutlineInfo').hide();
		webC.helper.hideOutline();
		var elpath = $(element).getPathOriginal();

		//  console.info('jquery: '+elpath);
		// console.info('xpath: '+elxpath);
		if (elpath !== undefined) {
			var el = $(elpath);
		} else {
			var el = $(element);
		}

		if (wcApp.settings.get('tbSelect')) {
			if ($('.dragdraw.grab').length > 0) {
				if (!el.is('img')) return;
				var sel = $('.dragdraw.grab');
				var fsel = sel.first();
				var fselb = webC.helper.getElementBox(sel[0]);
				var elb = webC.helper.getElementBox(el[0]);
				var movex = fselb.left + fselb.width / 2 - elb.width / 2;
				var movey = fselb.top +  fselb.height / 2 - elb.height / 2;
				fsel.find('.captured').remove();
				$('<img />', {class:'captured'}).css({position:'absolute', display:'block', opacity:1, top:elb.top, left:elb.left, width:elb.width, height:elb.height}).attr('src', el.attr('src')).appendTo(document.body).transition({top:movey, left:movex}, 400, 'easeInOutQuad', function() { $(this).css({top:'50%', left:'50%', transform:''}).appendTo(fsel.find('.dragdraw-content')); });
				fsel.removeClass('grab').find('.dragdraw-brush').click();
				if ($('.dragdraw.grab').length == 0) $('img').removeClass('wccanselect');
			}

			if ($('.dragbox.selected').length > 0 || $('.dragdraw.selected').length > 0) {
				var sel = $('.dragbox.selected, .dragdraw.selected');
				var fsel = sel.first();
				var ebox = webC.helper.getElementBox(el[0]);
				var position = 'absolute';

				// var etop = ebox.top, eleft = ebox.left, eheight = ebox.height, ewidth = ebox.width;
				el.parents().each(function() {
					if ($(this).css('position') === 'fixed' || el.css('position') === 'fixed') {
						position = 'fixed';
						ebox.top -= $(window).scrollTop(); ebox.left -= $(window).scrollLeft();
						return;
					}
				});
				fsel.css('position', position).transition({height:ebox.height, width:ebox.width, top:ebox.top, left:ebox.left}, function() {
					$(this).removeClass('selected').data('linked', el[0]).find('.wcmagnet').show();
					$('.dragdraw-content', this).trigger('refreshdraw');
				});
			}

			if ($('.sticky.selected').length > 0) {
				$('.sticky.selected').first().arrowMark($(el), {
					fillColor: 'rgba(252, 209, 0, 0.9)',
					clipMargin: 10,
					zIndex: 2147483590,
					strokeColor: 'rgba(0,0,0,1)',
					lineWidth: 2,
					barWidth: 10,
					arrowWidth: 30,
					arrowLength: 40,
					monitor: true
				}).removeClass('selected');
			}

			if ($('.stickeround.selected').length > 0) {
				var sel = $('.stickeround.selected');
				var c = $('.sticker-content', sel).css('background-color');
				var fsel = sel.first();
				var fselb = webC.helper.getElementBox(fsel);
				var sbtop = fselb.top, sbleft = fselb.left, sbheight = fselb.height, sbwidth = fselb.width;
				var ebox = webC.helper.getElementBox(el[0]);
				var etop = ebox.top, eleft = ebox.left, eheight = ebox.height, ewidth = ebox.width;
				/*
				var dx = eleft  - sbleft;
				var dy = etop - sbtop;
				if(eleft > sbleft + sbwidth){
						var dx1 = (sbwidth) / dx;
						var y = position.y + dy * dx1;
						if(y >= position.y0  && y <= position.y1){
								position.x = position.x1;
								position.y = y;
						}
				}else if(targetPosition.x < position.x0){
						var dx1 = (position.x0 - position.x) / dx;
						var y = position.y + dy * dx1;
						if(y >= position.y0 && y <= position.y1){
								position.x = position.x0;
								position.y = y;
						}
				}
				if(targetPosition.y > position.y1){
						var dy1 = (position.y1 - position.y) / dy;
						var x = position.x + dx * dy1;
						if(x >= position.x0 && x <= position.x1){
								position.y = position.y1;
								position.x = x;
						}
				}else if(targetPosition.y < position.y0){
						var dy1 = (position.y0 - position.y) / dy;
						var x = position.x + dx * dy1;
						if(x >= position.x0 && x <= position.x1){
								position.y = position.y0;
								position.x = x;
						}
				}

				fsel.transition({'top':etop,'left':eleft}, function() {
					$(this).removeClass('selected').data('linked',el[0]).find('.wcmagnet').show();
					$(this).arrowMark($(el),{
								fillColor: c,
								clipMargin: 5,
								zIndex: 30,
								strokeColor: "rgba(0,0,0,1)",
								lineWidth: 1,
								barWidth: 30,
								arrowWidth: 50,
								arrowLength: 30,
								clip: false,
								sticker: true,
								monitor: true
						}).removeClass('selected');
				});
				*/
				 fsel.arrowMark($(el), {
					fillColor: c,
					clipMargin: 5,
					zIndex: 2147483590,
					strokeColor: 'rgba(0, 0, 0, 0.6)',
					lineWidth: 3,
					barWidth: 30,
					arrowWidth: 40,
					arrowLength: 30,
					clip: false,
					sticker: true,
					monitor: true
				}).removeClass('selected');
			}
		 } else if (wcApp.settings.get('tbEditText')) {
			if (el.data('wccanedit') != '1' && !el.justtext().trim().length > 0) {
				// var $el2 = $(el).contents().filter(function () { return this.nodeType === 3 });
				// el = el2;
				return;
			}

			var el3 = el.clone();

			// alert(el3.justtext());
			// clone with all events ! very important
			var elsaved = el.clone(true, true);
			el3.attr('id', 'wcurrect012220').on('keypress', function(e) {
					//console.info(getCaretPosition(this));
				if (e.keyCode == 13) {
					e.preventDefault();
					$.mask.close();
				}
			});

			if (el.attr('id')) el3.copyCSS(el);

			el3.css({outline:'0px solid transparent', '-moz-user-modify':'read-write', '-webkit-user-modify':'read-write', 'user-modify':'read-write', width:'auto', height:'auto'}).attr('spellcheck', 'false');
			el3[0].contentEditable = true;

			el3.expose({
			// before masking begins ...
			onBeforeLoad: function(event) {
					if (!iOS) {
						el3.insertAfter(el).focus();
					} else {
						el3.insertAfter(el);
					}

					el.hide();
					isSelected = true;
				},

				// before masking begins ...
			onBeforeClose: function(e) {
					if (typeof e === 'undefined') e = '';

					// el = elsaved;
					if (el3.html() != elsaved.html() && e !== 'esc') {
							// el.addClass('wc-original');
						el.remove();
						var diff = webC.compare_full.diff(elsaved.html(), el3.html());
						elsaved.html(diff);
						elsaved.insertBefore(el3).addClass('wc-edited');
						var elspath = elsaved.getPathOriginal();
						var elhtml = el3.html();
						if (elsaved.is('.wc-text-edit')) {
							elspath = elsaved.parent();
							elsaved.contents().unwrap();

							// console.re.log(el3.parent().html());
							// elhtml = el3.parent().html();
						}

				// let send element's text changes to everyone
						var sfn = webC.helper.textElement();

						// console.re.log(el3.parent().html());
						sfn.send('textedit', elspath, elhtml);
					} else {
						el.show();
					}

					// elsaved.insertBefore(el3);
					el3.remove();
					isSelected = false;
				}

		});
		} // edit ends
		// nothing selected, select underneath element
		if ($(el).is('.wcselected')) {
			$(el).removeClass('wcselected');
		} else {
			$(el).addClass('wcselected');

			// $('.wcselected').expose_m();
		}

		// console.re.log('else');
	},
	onOrientationChange: function() {
		if ($('#fbOutlineT').length != 0) {
			this.onElementOut();
			setTimeout(function() {
				webC.helper.onElementOver($target);
			}, 500);
		}
	},

	startInspecting: function() {
		isInspecting = true;

		var size = Firebug.browser.getWindowScrollSize();

		fbInspectFrame.style.width = size.width + 'px';
		fbInspectFrame.style.height = size.height + 'px';

				//addEvent(Firebug.browser.document.documentElement, "mousemove", Firebug.Inspector.onInspectingBody);

		addEvent(fbInspectFrame, 'mousemove', Firebug.Inspector.onInspecting);
		addEvent(fbInspectFrame, 'mousedown', Firebug.Inspector.onInspectingClick);
	},

	stopInspecting: function() {
		isInspecting = false;

		if (outlineVisible) this.hideOutline();
		removeEvent(fbInspectFrame, 'mousemove', Firebug.Inspector.onInspecting);
		removeEvent(fbInspectFrame, 'mousedown', Firebug.Inspector.onInspectingClick);

		destroyInspectorFrame();

		Firebug.chrome.inspectButton.restore();

		if (Firebug.chrome.type == 'popup')
		Firebug.chrome.node.focus();
	},

	onInspectingClick: function(e) {
		fbInspectFrame.style.display = 'none';
		var targ = Firebug.browser.getElementFromPoint(e.clientX, e.clientY);
		fbInspectFrame.style.display = 'block';

		// console.info(targ);

		// Avoid inspecting the outline, and the FirebugUI
		var id = targ.id;
		if (id && /^fbOutline\w$/.test(id)) return;
		if (id == 'FirebugUI') return;

		// Avoid looking at text nodes in Opera
		while (targ.nodeType != 1) targ = targ.parentNode;

		Firebug.Console.log(targ);
		Firebug.Inspector.stopInspecting();
	},

	onInspecting: function(e) {
		if (new Date().getTime() - lastInspecting > 30) {
			fbInspectFrame.style.display = 'none';
			var targ = Firebug.browser.getElementFromPoint(e.clientX, e.clientY);
			fbInspectFrame.style.display = 'block';

						// Avoid inspecting the outline, and the FirebugUI
			var id = targ.id;
			if (id && /^fbOutline\w$/.test(id)) return;
			if (id == 'FirebugUI') return;

						// Avoid looking at text nodes in Opera
			while (targ.nodeType != 1) targ = targ.parentNode;

			if (targ.nodeName.toLowerCase() == 'body') return;

			//Firebug.Console.log(e.clientX, e.clientY, targ);
			Firebug.Inspector.drawOutline(targ);

			if (ElementCache(targ)) {
				var target = '' + ElementCache.key(targ);
				var lazySelect = function() {
					inspectorTS = new Date().getTime();

					if (Firebug.HTML)
		Firebug.HTML.selectTreeNode('' + ElementCache.key(targ));
				};

				if (inspectorTimer) {
					clearTimeout(inspectorTimer);
					inspectorTimer = null;
				}

				if (new Date().getTime() - inspectorTS > 200)
		setTimeout(lazySelect, 0);
				else
						inspectorTimer = setTimeout(lazySelect, 300);
			}

			lastInspecting = new Date().getTime();
		}
	},

	getWindowSize: function() {
		var width = 0, height = 0, el;

		if (typeof window.innerWidth == 'number') {
			width = window.innerWidth;
			height = window.innerHeight;
		}		else if ((el = document.documentElement) && (el.clientHeight || el.clientWidth)) {
			width = el.clientWidth;
			height = el.clientHeight;
		}		else if ((el = document.body) && (el.clientHeight || el.clientWidth)) {
			width = el.clientWidth;
			height = el.clientHeight;
		}

		return {width: width, height: height};
	},

	getWindowScrollSize: function() {
		return {width: $(window).scrollTop(), height: $(window).height()};
	},

	getWindowScrollPosition: function() {
		var top = 0, left = 0, el;

		if (typeof window.pageYOffset == 'number') {
			top = window.pageYOffset;
			left = window.pageXOffset;
		}		else if ((el = document.body) && (el.scrollTop || el.scrollLeft)) {
			top = el.scrollTop;
			left = el.scrollLeft;
		}		else if ((el = document.documentElement) && (el.scrollTop || el.scrollLeft)) {
			top = el.scrollTop;
			left = el.scrollLeft;
		}

		return {top:top, left:left};
	},

		// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	// Element Methods

	getElementFromPoint: function(x, y) {
		if (shouldFixElementFromPoint) {
			var scroll = this.getWindowScrollPosition();
			return document.elementFromPoint(x + scroll.left, y + scroll.top);
		}		else
				return document.elementFromPoint(x, y);
	},

	getElementPosition: function(el) {
		var left = 0;
		var top = 0;

		do {
			left += el.offsetLeft;
			top += el.offsetTop;
		}
		while (el = el.offsetParent);

		return {left:left, top:top};
	},

	getElementBox: function(el) {
		var result = {};

		if (el.getBoundingClientRect) {
			var rect = el.getBoundingClientRect();

						// fix IE problem with offset when not in fullscreen mode
			var offset = webC.util.isIE() ? document.body.clientTop || document.documentElement.clientTop : 0;

			var scroll = this.getWindowScrollPosition();

			result.top = Math.round(rect.top - offset + scroll.top);
			result.left = Math.round(rect.left - offset + scroll.left);
			result.height = Math.round(rect.bottom - rect.top);
			result.width = Math.round(rect.right - rect.left);
		}		else {
			var position = this.getElementPosition(el);

			result.top = position.top;
			result.left = position.left;
			result.height = el.offsetHeight;
			result.width = el.offsetWidth;
		}

		return result;
	},

	setOutlineBox: function(el) {
		var border = 2;
		var scrollbarSize = 17;

		var windowSize = this.getWindowSize();
		var scrollSize = this.getWindowScrollSize();
		var scrollPosition = this.getWindowScrollPosition();

		var box = this.getElementBox(el);

		var top = box.top;
		var left = box.left;
		var height = box.height;
		var width = box.width;

		var freeHorizontalSpace = scrollPosition.left + windowSize.width - left - width -
								(!webC.util.isIE() && scrollSize.height > windowSize.height ? // is *vertical* scrollbar visible
						scrollbarSize : 0);

		var freeVerticalSpace = scrollPosition.top + windowSize.height - top - height -
				(!webC.util.isIE() && scrollSize.width > windowSize.width ? // is *horizontal* scrollbar visible
				scrollbarSize : 0);

		var numVerticalBorders = freeVerticalSpace > 0 ? 2 : 1;

		var o = outlineElements;
		var style;

		style = o.fbOutlineT.style;
		style.top = top - border + 'px';
		style.left = left + 'px';
		style.height = border + 'px';
		style.width = width + 'px';
		style.width = width + 'px';
		style.backgroundColor = '#3875D7';

		style = o.fbOutlineL.style;
		style.top = top - border + 'px';
		style.left = left - border + 'px';
		style.height = height + numVerticalBorders * border + 'px';
		style.width = border + 'px';
		style.backgroundColor = '#3875D7';

		style = o.fbOutlineB.style;
		style.backgroundColor = '#3875D7';

		if (freeVerticalSpace > 0) {
			style.top = top + height + 'px';
			style.left = left + 'px';
			style.width = width + 'px';

			//style.height = border + "px";
		}		else {
			style.top = -2 * border + 'px';
			style.left = -2 * border + 'px';
			style.width = border + 'px';

			//style.height = border + "px";
		}

		style = o.fbOutlineR.style;
		style.backgroundColor = '#3875D7';

		if (freeHorizontalSpace > 0) {
			style.top = top - border + 'px';
			style.left = left + width + 'px';
			style.height = height + numVerticalBorders * border + 'px';
			style.width = (freeHorizontalSpace < border ? freeHorizontalSpace : border) + 'px';
		}		else {
			style.top = -2 * border + 'px';
			style.left = -2 * border + 'px';
			style.height = border + 'px';
			style.width = border + 'px';
		}

		if (!outlineVisible) this.showOutline();
	},

	setColorOutline: function(color) {
		if (!outlineVisible) return;

		var o = outlineElements;
		var style;

		style = o.fbOutlineT.style;
		style.backgroundColor = color;

		style = o.fbOutlineL.style;
		style.backgroundColor = color;

		style = o.fbOutlineB.style;
		style.backgroundColor = color;

		style = o.fbOutlineR.style;
		style.backgroundColor = color;
	},

	hideOutline: function() {
		if (!outlineVisible) return;

		$('#wcnoedit').hide();

		for (var name in outline) {
		//$(outlineElements[name]).remove();
			offlineFragment.appendChild(outlineElements[name]);
		}

		outlineVisible = false;
	},

	showOutline: function() {
		if (outlineVisible) return;

		for (var name in outline) {
			document.getElementsByTagName('body')[0].appendChild(outlineElements[name]);

			// $('body').append(outlineElements[name]);
		}

		outlineVisible = true;
	},
	getDocType: function(a) {
		var b = '';
		webC.util.isIE8() ? (b = a.all[0].text, void 0 === b && (b = '')) : (a = a.doctype, null !== a && void 0 !== a && (b = null === a.systemId ? '<!DOCTYPE HTML PUBLIC "' + a.publicId + '">' : '<!DOCTYPE HTML PUBLIC "' + a.publicId + '" "' + a.systemId + '">'));
		return b;
	},
	preProcessing: function(a, b) {
		for (var c = a.getElementsByTagName('canvas'), d = '', e, f = 0; f < c.length; f++) {
			if (!webC.util.isIE8()) {
				try {
					e = c[f].toDataURL(), 'data:image' === e.substr(0, 10) && (d += '<wccanvas data-id="' + f + '">' + e + '</wccanvas>');
				} catch (g) {}
			}
		}

		return b + d;
	},
	getDynamicStyleSheet: function(a) {
		a = a.styleSheets;
		for (var b = '', c = '', c = '', d = 0; d < a.length; d++) {
			if (null === a[d].href || '' === a[d].href) {
				if (c = webC.util.isIE8() ? a[d].media : a[d].media.mediaText, 'print' !== c) {
					if (webC.util.isIEALL()) {
						b += a[d].cssText;
					} else {
						if (null !== a[d].cssRules) {
							for (var c = [], e = 0; e < a[d].cssRules.length; e++) {
								c.push(a[d].cssRules[e].cssText);
							}

							b += c.join('\n');
						}
					}
				}
			}
		}

		return b;
	},
	getFrameRefList: function(a, b) {
		if (void 0 === a) {
			return null;
		}

		var c = a.match(/<iframe.+?>.*?<\/iframe>/ig);
		if (null === c) {
			return null;
		}

		for (var d = [], e = [], f = '', f = '', g = 0; g < c.length; g++) {
			f = c[g], f = f.match(/data-usid=["|'](.+?)["|']/i), null === f ? (d.push(c[g]), e.push('wcblank')) : (f = parseInt(f[1], 10), d.push(c[g]), e.push(b.frames[f]));
		}

		return {
			strList: d,
			refList: e
		};
	},
	getDOMString: function(a) {
		if (null === a) {
			return '';
		}

		for (var b = this.getDocType(a), c = a.getElementsByTagName('*'), d, e, f = 1, g = Math.round, f = this._mult, h = 0, j = c.length; h < j; h++) {
			c[h].removeAttribute('data-usscrolly'), c[h].removeAttribute('data-usscrollx'), 0 < c[h].scrollTop && c[h].setAttribute('data-usscrolly', g(c[h].scrollTop * f)), 0 < c[h].scrollLeft && c[h].setAttribute('data-usscrollx', g(c[h].scrollLeft * f)), d = c[h], e = d.nodeName.toLowerCase(), 'input' === e ? 'text' === d.getAttribute('type') || null === d.getAttribute('type') || 'password' === d.getAttribute('type') || 'date' === d.getAttribute('type') || 'color' === d.getAttribute('type') || 'email' ===
					d.getAttribute('type') || 'search' === d.getAttribute('type') || 'tel' === d.getAttribute('type') || 'url' === d.getAttribute('type') || 'number' === d.getAttribute('type') || 'range' === d.getAttribute('type') || 'week' === d.getAttribute('type') || 'month' === d.getAttribute('type') || 'time' === d.getAttribute('type') || 'datetime-local' === d.getAttribute('type') || 'datetime' === d.getAttribute('type') ? d.setAttribute('data-usval', escape(d.value)) : ('checkbox' === d.getAttribute('type') ||
							'radio' === d.getAttribute('type')) && !0 === d.checked && d.setAttribute('data-uscheck', 'true') : 'select' === e ? d.setAttribute('data-usval', d.value) : 'textarea' === e && d.setAttribute('data-usval', escape(d.value));
		}

		d = null;
		d = 'undefined' === typeof a.defaultView ? a.parentWindow : a.defaultView;
		for (c = 0; c < d.frames.length; c++) {
			try {
				d.frames[c].frameElement.setAttribute('data-usid', c);
			} catch (l) {}
		}

		c = a.documentElement.outerHTML || (new XMLSerializer).serializeToString(a.documentElement);
		h = h = null;
		g = h = '';
		e = this.getFrameRefList(c, d);
		if (null !== e) {
			d = e.strList;
			e = e.refList;
			for (f = 0; f < e.length; f++) {
				'undefined' !== typeof d[f] && (g = d[f], 'usblank' === e[f] ? (g = null !== g.match(/(src=").+?(")/) ? g.replace(/(.+?src=").+?(".+?)/i, '$1about:usblank$2') : null !== g.match(/(src=').+?(')/) ? g.replace(/(.+?src=').+?('.+?)/i, '$1about:usblank$2') : g.replace(/(.+?src=).+?(\s.+?)/i, '$1about:usblank$2'), c = c.replace(d[f], g)) : (h = e[f].document, h = encodeURIComponent(this.getDOMString(h)), h = '<wcframe type="text/javascript" id="usiftag_' + this._iframeCnt + '">{"data":"' + h + '", "id": "usiftag_' +
						this._iframeCnt + '", "url": "' + e[f].location.href + '"}</wcframe>', g = null !== g.match(/(src=").+?(")/) ? g.replace(/(.+?src=").+?(".+?)/i, '$1about:blank$2') : null !== g.match(/(src=').+?(')/) ? g.replace(/(.+?src=').+?('.+?)/i, '$1about:blank$2') : g.replace(/(.+?src=).+?(\s.+?)/i, '$1about:blank$2'), c = c.replace(d[f], g + h), this._iframeCnt++));
			}
		}

		c = this.preProcessing(a, c);
		c += '<wcstyle>' + this.getDynamicStyleSheet(a) + '</wcstyle>';
		if (webC.util.isIE8()) {
			c = this._getHtml5TagSupport(a) ? c + '<wchtml5>true</wchtml5>' : c + '<wchtml5>false</wchtml5>';
		}

		return b + c;
	},

	_getHtml5TagSupport: function(a) {
		if (webC.util.isIE8()) {
			a = a.styleSheets;
			for (var b = !1, c = 0; c < a.length; c++) {
				for (var d = 0; d < a[c].rules.length; d++) {
					if ('article' === a[c].rules[d].selectorText && 'block' === a[c].rules[d].style.display) {
						b = !0;
						break;
					}
				}

				if (b) {
					break;
				}
			}

			return b;
		}

		return !0;
	},

	addNOTE: function() {
		var openStickies = function openStickies() {
			//initStickies && initStickies();
			for (var i = 0; i < localStorage.length; i++) {
				createSticky(JSON.parse(localStorage.getItem(localStorage.key(i))));
			}
		},

	createSticky = function createSticky(data) {
		data = data || { id: +new Date(), from: wcApp.User.get('name'), uid:  wcApp.User.get('id'), top: '140px', left: '140px', text: 'Type note here' };
		$(window).smartresize(function() {
			var s = webC.helper.addStikers();
			s.refresh(data.id);
		});
		var el = $('<div />', {
			class: 'sticky wcandrag wcelement',
			wcelement:'',
			'data-uid': data.uid,
			id: data.id
		})
	.append($('<div/>', {class: 'handle SE' }))
		 .append($('<span />', {
					class: 'wcicon selected hint--left',
					'data-hint': $.i18n.t('sel')
				}).click(function(e) {
				 $(this).parent().toggleClass('selected');
			}))
			.prepend($('<div />', { class: 'sticky-header'}).click(function(e) {
				if ($(this).parent().is('.stickydrag')) return;
				$(this).parent().toggleClass('selected');
				var sel = $('.dragdraw.selected, .dragbox.selected');
				if ($(this).parent().is('.selected') && sel.length > 0) {
					$(this).parent().removeClass('selected');
					$(sel).removeClass('selected');

					$(this).parent().arrowMark(sel, {
						fillColor: 'rgba(0, 150, 97, 0.6)',
						clipMargin: 10,
						zIndex: 2147483590,
						strokeColor: 'rgba(0,0,0,0.9)',
						lineWidth: 2,
						barWidth: 10,
						arrowWidth: 30,
						arrowLength: 40,
						monitor: true
					});
				}
			})
			.append($('<span />', {
					class: 'sticky-status',
					text: data.from

					//click : saveSticky
				}))
				.append($('<span />', {
					class: 'close-sticky hint--right',
					'data-hint': $.i18n.t('del'),
					text: 'x',
					click: function() { deleteSticky($(this).parents('.sticky').attr('id')); }
				}))
			)
			.append($('<textarea />', {
				spellcheck: true,

				// contentEditable : true,
				class: 'sticky-content editNoDrag',
				keypress: markUnsaved,
				click: function(e) {
					e.preventDefault();e.stopPropagation();
				}
			}).attr('placeholder', data.text).wrap("<div class='sticky-scroller'></div>").parent()).drag('start', function(ev, dd) {
					dd.attr = $(ev.target).prop('className');
					if (!dd.attr) return;
					$(this).addClass('stickydrag');
					dd.width = $(this).width();
					dd.height = $(this).height();
				}).drag('start', function(ev, dd) {
					if (dd.attr.indexOf('SE') > -1) {
						$('.sticky-content', this).elastic('fix');
					}
				}).drag(function(ev, dd) {
				var props = {};
				if (dd.attr.indexOf('E') > -1) {
					props.width = Math.max(32, dd.width + dd.deltaX);
				}

				if (dd.attr.indexOf('S') > -1) {
					props.height = Math.max(32, dd.height + dd.deltaY);
				}

				if (dd.attr.indexOf('sticky') > -1) {
					props.top = dd.offsetY;
					props.left = dd.offsetX;
				}

				if (props.height < 90) props.height = 90;
				if (props.width < 170) props.width = 170;

				if (dd.attr.indexOf('SE') > -1) {
					$('.sticky-scroller', this).css({height:props.height - 35});
					$(this).css({width:props.width});
				} else {
					$(this).css(props);
				}
			}).drag('end', function(ev, dd) {
				if (dd.attr.indexOf('SE') > -1) {
					$('.sticky-content', this).elastic('destroy');
				}

				var that = this;
				setTimeout(function() { $(that).removeClass('stickydrag'); }, 300);
			}).css({
			position: 'absolute',
			top: data.top,
			left: data.left
		}).focusout(saveSticky).appendTo(document.body);

		$('.sticky-content', el).elastic();

		// var editor = new MediumEditor($('.sticky-content', el)[0])
		// var pen = new Pen($('.sticky-content', el)[0]);
	},

	deleteSticky = function deleteSticky(id) {
		localStorage.removeItem('sticky-' + id);
		$('#' + id).fadeOut(200, function() { $(this).remove(); });
	},

	saveSticky = function saveSticky() {
		var that = $(this),  sticky = (that.hasClass('sticky-status') || that.hasClass('sticky-content')) ? that.parents('div.sticky') : that,
				obj = {
					from: sticky.find('.sticky-status').text(),
					uid:  sticky.attr('data-uid'),
					id: sticky.attr('id'),
					top: sticky.css('top'),
					left: sticky.css('left'),
					text: sticky.children('.sticky-content').html()       };
		localStorage.setItem('sticky-' + obj.id, JSON.stringify(obj));

		//sticky.find(".sticky-status").text("saved");
	},

	markUnsaved = function markUnsaved() {
		// var that = $(this), sticky = that.hasClass("sticky-content") ? that.parents("div.sticky") : that;
		//sticky.find(".sticky-status").text("unsaved");
	};

		return {
		open: openStickies,
		new: createSticky,
		remove: deleteSticky
	};
	},

	addStikers: function(color, text, icon, el, width, height) {
	var data,
	openStikers = function openStikers() {
		for (var i = 0; i < localStorage.length; i++) {
			//createBox(JSON.parse(localStorage.getItem(localStorage.key(i))));
		}
	},

	 createStikers = function createStikers(data) {
		data = data || { id: +new Date(), from: wcApp.User.get('name'), uid:  wcApp.User.get('id'), top: '140px', left: '140px', text: 'Sticker', color: color, icon:'', width:'130px', height:'90px', linked:''};
		$(window).smartresize(function() {refresh(data.id);});
		return $('<div />', {
			class: 'stickeround wcandrag',
			wcelement:'',
			'data-uid': data.uid,
			id: data.id
		})
		.append($('<div/>', {class: 'handle NN' }))
		.append($('<div/>', {class: 'handle WW' }))
		.append($('<div/>', {class: 'handle EE' }))
		.append($('<div/>', {class: 'handle SS' }))

		// .append($("<span/>", {
		//   "class" : "wcmagnet hint--right",
		//   "data-hint" : $.i18n.t("rgravity"),
		//   click : function (e) { e.stopPropagation(); $(this).parent().removeData("linked"); $(this).hide();}
		// }))
			.append($('<span />', {
					class: 'wcicon selected hint--left',
					'data-hint': $.i18n.t('sel'),
					'data-placement': 'left'
				}))
			.append($('<span />', {
					class: 'close-sticky hint--right',
					'data-hint': $.i18n.t('del'),
					text: 'x',
					click: function() { deleteBox($(this).parents('.stickeround').attr('id')); }
				}))
			.append($('<div />', {
				class: 'sticker-content',
				style: 'background-color:' + color
			}).append($('<div />', {
				contentEditable: true,
				'data-placeholder': data.text,
				class: 'sticker-contentwrap editNoDrag',
				keyup: markUnsaved,
				click: function(e) {
					e.preventDefault();e.stopPropagation();
				}
			 }))).drag('start', function(ev, dd) {
					$(this).addClass('draggin');
					dd.attr = $(ev.target).prop('className');
					dd.width = $(this).width();
					dd.height = $(this).height();
				}).drag('init', function() {
					if ($(this).is('.stickeround.selected'))
						return $('.stickeround.selected');
				}).drag(function(ev, dd) {
					var props = {};
					if (ev.shiftKey) {
						// if shiftkey pressed, scale proportionally
						if (dd.attr.indexOf('E') > -1) {
							props.width = Math.max(32, dd.width + dd.deltaX + dd.deltaX);
							props.left = dd.originalX + dd.width + dd.deltaX - props.width;
						}

						if (dd.attr.indexOf('S') > -1) {
							props.height = Math.max(32, dd.height + dd.deltaY + dd.deltaY);
							props.top = dd.originalY + dd.height + dd.deltaY - props.height;
						}

						if (dd.attr.indexOf('W') > -1) {
							props.width = Math.max(32, dd.width - dd.deltaX -  dd.deltaX);
							props.left = dd.originalX + dd.width - dd.deltaX - props.width;
						}

						if (dd.attr.indexOf('N') > -1) {
							props.height = Math.max(32, dd.height - dd.deltaY - dd.deltaY);
							props.top = dd.originalY + dd.height - dd.deltaY - props.height;
						}
					} else {
						if (dd.attr.indexOf('E') > -1) {
							props.width = Math.max(32, dd.width + dd.deltaX);
						}

						if (dd.attr.indexOf('S') > -1) {
							props.height = Math.max(32, dd.height + dd.deltaY);
						}

						if (dd.attr.indexOf('W') > -1) {
							props.width = Math.max(32, dd.width - dd.deltaX);
							props.left = dd.originalX + dd.width - props.width;
						}

						if (dd.attr.indexOf('N') > -1) {
							props.height = Math.max(32, dd.height - dd.deltaY);
							props.top = dd.originalY + dd.height - props.height;
						}
					}

					if (dd.attr.indexOf('sticker') > -1) {
						props.top = dd.offsetY;
						props.left = dd.offsetX;
					}

					if (props.height < 10) props.height = 10;
					if (props.width < 10) props.width = 10;

					$(this).css(props);
				}).drag('end', function() {
					var that = this;
					setTimeout(function() {
						$(that).removeClass('draggin'); refresh(data.id);
					}, 100);
				}).css({
			position: 'absolute',
			top: data.top,
			left: data.left,
			width: data.width,
			height: data.height
		}).click(function(e) {
			e.stopPropagation();
			$(this).toggleClass('selected').focus();
		}).focusout(saveBox)
		.appendTo(document.body).fadeIn();
	},

	deleteBox = function deleteBox(id) {
		localStorage.removeItem('stickeround-' + id);
		$('#' + id).fadeOut(200, function() { $(this).remove(); });
	},

	saveBox = function saveBox() {
		var that = $(this),  sticky = (that.hasClass('sticker-status') || that.hasClass('sticker-content')) ? that.parents('div.stickeround') : that,
				obj = {
					from: sticky.find('.sticker-status').text(),
					uid:  sticky.attr('data-uid'),
					id: sticky.attr('id'),
					top: sticky.css('top'),
					left: sticky.css('left'),
					width: sticky.css('width'),
					height: sticky.css('height'),
					text: sticky.children('.stickeround-content').html()       };
		localStorage.setItem('stickeround-' + obj.id, JSON.stringify(obj));
	},

	markUnsaved = function markUnsaved() {
		var isSel = $(this).parent().parent().is('.selected');
		if ($(this).text().trim() == '') {
			if (isSel) {
				$('.sticker-contentwrap', '.selected').css('opacity', 0);
			} else {
				$(this).css('opacity', 0);
			}
		} else {
			if (isSel) {
				$('.sticker-contentwrap', '.selected').css('opacity', 1).not($(this)).text($(this).text());
			} else {
				$(this).css('opacity', 1);
			}
		}

//var that = $(this), sticky = that.hasClass("sticky-content") ? that.parents("div.sticky") : that;
	},

	refresh = function refresh(id) {
		var el = $('#' + id);
		if (el.length === 0) return;
		var eloff = el.offset();
		if (el.data('linked') && !el.is('.draggin')) {
			var linked = $('#' + id).data('linked');
			var lbox = webC.helper.getElementBox(linked);
			if (el.css('position') === 'fixed') {
				lbox.top -= $(window).scrollTop(); lbox.left -= $(window).scrollLeft();
			}

			el.transition({width:lbox.width, height:lbox.height, top:lbox.top, left:lbox.left});
			return;
		}

		if ($(window).width() < el.width() + eloff.left + 5) {
			el.transition({left:$(window).width() - el.width()});
		}

		if (eloff.left < 0) {
			el.transition({left: 5});
		}
	};

	return {
		refresh: refresh,
		open: openStikers,
		new: createStikers,
		remove: deleteBox
	};
 },

	addMarker: function(color, icon, elm, width, height) {
	var data,
	openMarker = function openMarker() {
		for (var i = 0; i < localStorage.length; i++) {
			//createMarker(JSON.parse(localStorage.getItem(localStorage.key(i))));
		}
	},

	 createMarker = function createMarker(data) {
		var ebox = webC.helper.getElementBox($(elm)[0]);
		data = data || { id: +new Date(), from: wcApp.User.get('name'), uid:  wcApp.User.get('id'), top: ebox.top - (height + height / 2 + 5) + 'px', left: ebox.left + ebox.width / 2 - (width / 2) + 'px', color: color,
		icon:icon, width:width + 'px', height:height + 'px', linked:elm};
		$(window).smartresize(function() {refresh(data.id);});
		return $('<div />', {
			class: 'markeround wcandrag',
			wcelement:'',
			style: 'display:none',
			'data-uid': data.uid,
			id: data.id
		})

		// .append($("<span/>", {
		//   "class" : "wcmagnet",
		//   "title" : "Remove gravity",
		//   click : function (e) { e.stopPropagation(); $(this).parent().removeData("linked"); $(this).hide();}
		// }))
		// .append($("<span />", {
		//     "class" : "wcicon selected",
		//     "title" : "Selected"
		//   }))
			.append($('<div />', {
				class: 'marker-content',
				style: 'background-color:' + color,
				click: function(e) {
					if ($(this).parent().is('.draggin')) { return; }; e.stopPropagation(); $(elm).trigger('click');
				}
			}).append($('<span />', {
					class: 'close-sticky hint--right',
					'data-hint': $.i18n.t('del'),
					text: 'x',
					click: function(e) {
						e.stopPropagation(); deleteBox($(this).parents('.markeround').attr('id'));
					}
				}))
				.append($('<div />', {
				class: data.icon
			 }))).drag('start', function(ev, dd) {
					$(this).addClass('draggin');
					dd.attr = $(ev.target).prop('className');
				}).drag('init', function() {
						// if ( $( this ).is('.stickeround.selected') )
						//   return $('.stickeround.selected');
				}).drag(function(ev, dd) {
					var props = {};
					props.top = dd.offsetY;
					props.left = dd.offsetX;

					if (props.height < 10) props.height = 10;
					if (props.width < 10) props.width = 10;

					$(this).css(props);
				}).drag('end', function() {
					var that = this;
					setTimeout(function() {
						$(that).removeClass('draggin'); refresh(data.id);
					}, 100);
				}).css({
			position: 'absolute',
			top: data.top,
			left: data.left,
			width: data.width,
			height: data.height
		}).focusout(saveBox)
		.appendTo(document.body).fadeIn(300, function() { $(this).arrowMark($(elm), {
			fillColor: color,
			clipMargin: 0,
			zIndex: 2147483590,
			strokeColor: 'rgba(0, 0, 0, 0.6)',
			lineWidth: 2,
			barWidth: 30,
			arrowWidth: 45,
			arrowLength: 30,
			clip: false,

			// nocliptarget: true,
			sticker: true,
			monitor: true
		});
	});
	},

	deleteBox = function deleteBox(id) {
		localStorage.removeItem('markeround-' + id);
		$('#' + id).fadeOut(200, function() { $(this).remove(); });
	},

	saveBox = function saveBox() {
		var that = $(this),  sticky = (that.hasClass('marker-status') || that.hasClass('marker-content')) ? that.parents('div.markeround') : that,
				obj = {
					from: sticky.find('.marker-status').text(),
					uid:  sticky.attr('data-uid'),
					id: sticky.attr('id'),
					top: sticky.css('top'),
					left: sticky.css('left'),
					width: sticky.css('width'),
					height: sticky.css('height'),
					text: sticky.children('.marker-content').html()       };
		localStorage.setItem('markeround-' + obj.id, JSON.stringify(obj));
	},

	markUnsaved = function markUnsaved() {
			// var isSel = $(this).parent().parent().is(".selected");
		//var that = $(this), sticky = that.hasClass("sticky-content") ? that.parents("div.sticky") : that;
	},

	refresh = function refresh(id) {
		var el = $('#' + id);
		if (el.length === 0) return;
		var eloff = el.offset();
		if (el.data('linked') && !el.is('.draggin')) {
			var linked = $('#' + id).data('linked');
			var lbox = webC.helper.getElementBox(linked);
			el.transition({width:lbox.width, height:lbox.height, top:lbox.top, left:lbox.left});
			return;
		}

		if ($(window).width() < el.width() + eloff.left + 5) {
			el.transition({left:$(window).width() - el.width()});
		}

		if (eloff.left < 0) {
			el.transition({left: 5});
		}
	};

	return {
		refresh: refresh,
		open: openMarker,
		new: createMarker,
		remove: deleteBox
	};
 },

	addBox: function(color) {
	var data,
	openBox = function openBox() {
		//initStickies && initStickies();
		for (var i = 0; i < localStorage.length; i++) {
			//createBox(JSON.parse(localStorage.getItem(localStorage.key(i))));
		}
	},

	 createBox = function createBox(data) {
		data = data || { id: +new Date(), from: wcApp.User.get('name'), uid:  wcApp.User.get('id'), top: '140px', left: '140px', text: 'Overlay Text', color: color};
		$(window).smartresize(function() {
			var s = webC.helper.addStikers();
			s.refresh(data.id);
		});
		return $('<div />', {
			class: 'dragbox wcandrag',
			wcelement:'',
			'data-uid': data.uid,
			id: data.id
		})
		.append($('<div/>', {class: 'handle NE' }))
		.append($('<div/>', {class: 'handle NN' }))
		.append($('<div/>', {class: 'handle NW' }))
		.append($('<div/>', {class: 'handle WW' }))
		.append($('<div/>', {class: 'handle EE' }))
		.append($('<div/>', {class: 'handle SW' }))
		.append($('<div/>', {class: 'handle SS' }))
		.append($('<div/>', {class: 'handle SE' }))
			.append($('<span/>', {
				class: 'wcmagnet hint--bottom',
				'data-hint': $.i18n.t('rgravity'),
				click: function(e) {
					e.stopPropagation(); $(this).parent().removeData('linked').css({position:'absolute'}); $(this).hide();
				}
			}))
			.append($('<span />', {
					class: 'wcicon selected hint--left',
					'data-hint': $.i18n.t('sel'),
					'data-placement': 'left'
				}))
			.append($('<span />', {
					class: 'close-sticky hint--right',
					'data-hint': $.i18n.t('del'),
					text: 'x',
					click: function() { deleteBox($(this).parents('.dragbox').attr('id')); }
				}))
			.append($('<div />', {
				class: 'dragbox-content',
				style: 'background-color:' + color
			}).append($('<div />', {
				contentEditable: true,
				html: data.text,
				class: 'dragbox-contentwrap editNoDrag',
				keyup: markUnsaved,
				click: function(e) {
					e.preventDefault();e.stopPropagation();
				}
			 }))).drag('start', function(ev, dd) {
					$(this).addClass('draggin');
					dd.attr = $(ev.target).prop('className');
					dd.width = $(this).width();
					dd.height = $(this).height();
					dd.offy = dd.offx = 0;
					if ($(this).css('position') === 'fixed') {
						dd.offy = $(window).scrollTop();
						dd.offx = $(window).scrollLeft();
					}
				}).drag('init', function() {
					if ($(this).is('.dragbox.selected'))
						return $('.dragbox.selected');
				}).drag(function(ev, dd) {
					var props = {};
					if (ev.shiftKey) {
						// if shiftkey pressed, scale proportionally
						if (dd.attr.indexOf('E') > -1) {
							props.width = Math.max(32, dd.width + dd.deltaX + dd.deltaX);
							props.left = dd.originalX + dd.width + dd.deltaX - props.width;
						}

						if (dd.attr.indexOf('S') > -1) {
							props.height = Math.max(32, dd.height + dd.deltaY + dd.deltaY);
							props.top = dd.originalY + dd.height + dd.deltaY - props.height;
						}

						if (dd.attr.indexOf('W') > -1) {
							props.width = Math.max(32, dd.width - dd.deltaX -  dd.deltaX);
							props.left = dd.originalX + dd.width - dd.deltaX - props.width;
						}

						if (dd.attr.indexOf('N') > -1) {
							props.height = Math.max(32, dd.height - dd.deltaY - dd.deltaY);
							props.top = dd.originalY + dd.height - dd.deltaY - props.height;
						}
					} else {
						if (dd.attr.indexOf('E') > -1) {
							props.width = Math.max(32, dd.width + dd.deltaX);
						}

						if (dd.attr.indexOf('S') > -1) {
							props.height = Math.max(32, dd.height + dd.deltaY);
						}

						if (dd.attr.indexOf('W') > -1) {
							props.width = Math.max(32, dd.width - dd.deltaX);
							props.left = dd.originalX + dd.width - props.width;
						}

						if (dd.attr.indexOf('N') > -1) {
							props.height = Math.max(32, dd.height - dd.deltaY);
							props.top = dd.originalY + dd.height - props.height;
						}
					}

					if (dd.attr.indexOf('dragbox') > -1) {
						props.top = dd.offsetY - dd.offy;
						props.left = dd.offsetX - dd.offx;
					}

					if (props.height < 10) props.height = 10;
					if (props.width < 10) props.width = 10;

					$(this).css(props);

					//$('.dragbox-content', this).css({'width':props.width-50,'height':props.height-38});
				}).drag('end', function() {
					var that = this;
					var s = webC.helper.addStikers();
					setTimeout(function() {
						$(that).removeClass('draggin'); s.refresh(data.id);
					}, 100);
				}).css({
			position: 'absolute',
			top: data.top,
			left: data.left
		}).click(function(e) {
			e.stopPropagation();
			$(this).toggleClass('selected').focus();
		}).focusout(saveBox)
		.appendTo(document.body);
	},

	deleteBox = function deleteBox(id) {
		localStorage.removeItem('dragbox-' + id);
		$('#' + id).fadeOut(200, function() { $(this).remove(); });
	},

	saveBox = function saveBox() {
		var that = $(this),  sticky = (that.hasClass('dragbox-status') || that.hasClass('dragbox-content')) ? that.parents('div.dragbox') : that,
				obj = {
					from: sticky.find('.dragbox-status').text(),
					uid:  sticky.attr('data-uid'),
					id: sticky.attr('id'),
					top: sticky.css('top'),
					left: sticky.css('left'),
					text: sticky.children('.dragbox-content').html()       };
		localStorage.setItem('dragbox-' + obj.id, JSON.stringify(obj));
	},

	markUnsaved = function markUnsaved() {
		var isSel = $(this).parent().parent().is('.selected');
		if ($(this).text().trim() == '') {
			if (isSel) {
				$('.dragbox-contentwrap', '.selected').css('opacity', 0);
			} else {
				$(this).css('opacity', 0);
			}
		} else {
			if (isSel) {
				$('.dragbox-contentwrap', '.selected').css('opacity', 1).not($(this)).text($(this).text());
			} else {
				$(this).css('opacity', 1);
			}
		}

//var that = $(this), sticky = that.hasClass("sticky-content") ? that.parents("div.sticky") : that;
	};

	return {
		open: openBox,
		new: createBox,
		remove: deleteBox
	};
 },

	addDraw: function(color) {
		var sketch, data,
	openDraw = function openDraw() {
		//initStickies && initStickies();
		for (var i = 0; i < localStorage.length; i++) {
			//createBox(JSON.parse(localStorage.getItem(localStorage.key(i))));
		}
	},

	createDraw = function createDraw() {
		var eid = createDrawElement();
		sketch = new Sketch({
			element: document.getElementById(eid),

			//path: drawing,
			strokeStyle: color,
			zoom: 1
		});
	},

	createDrawElement = function createDrawElement(data) {
		data = data || { id: +new Date(), daid: +new Date(), from: wcApp.User.get('name'), uid:  wcApp.User.get('id'), top: '240px', left: '240px', text: 'Draw Label ...', color: color };
		$(window).smartresize(function() {refresh(data.id);});
		$('<div />', {
			class: 'dragdraw wcandrag',
			wcelement:'',
			'data-uid': data.uid,
			id: data.id
		}).hoverIntent(function(e) {
			$('.dragdraw-header, dragdraw-tools').filter(function() { return $(this).parent().is(':not(.selected)'); }).css({opacity:0});

			//$('.dragdraw-header, .dragdraw-tools').css({'opacity':0});
			if ($(this).is('.drawdrag')) {
				$(this).find('.dragdraw-header, .dragdraw-tools, .wcmagnet').css({opacity:1});
			} else {
				$(this).find('.dragdraw-header, .dragdraw-tools, .wcmagnet').transition({opacity:1});
			}
		}, function(e) {
			if ($(this).is('.drawdrag')) return;
			$(this).not('.selected').find('.dragdraw-header, .dragdraw-tools, .wcmagnet').transition({opacity:0});
		}).on('refreshdraw', function() { sketch.resize(); })
		.append($('<div/>', {class: 'handle WW' }))
		.append($('<div/>', {class: 'handle NE' }))
		.append($('<div/>', {class: 'handle NN' }))
		.append($('<div/>', {class: 'handle NW' }))
		.append($('<div/>', {class: 'handle EE' }))
		.append($('<div/>', {class: 'handle SW' }))
		.append($('<div/>', {class: 'handle SS' }))
		.append($('<div/>', {class: 'handle SE' }))
			.append($('<span/>', {
				class: 'wcmagnet hint--right',
				'data-hint': $.i18n.t('rgravity'),
				click: function(e) {
					e.stopPropagation(); $(this).parent().removeData('linked'); $(this).hide();
				}
			}))
			.append($('<div/>', {class: 'dragdraw-tools'})
			.append($('<div/>', {class: 'dragdraw-brush activetool hint--right', 'data-hint': $.i18n.t('brush'), click:  function(e) {toolSelect('brush', this);} }))
			.append($('<div/>', {class: 'dragdraw-erase hint--right', 'data-hint': $.i18n.t('eraser'), click: function(e) {toolSelect('eraser', this);} }))
			.append($('<div/>', {class: 'dragdraw-animate hint--right', 'data-hint': $.i18n.t('anidraw'), click: function(e) {toolSelect('animate', this);} }))
			.append($('<div/>', {class: 'dragdraw-clear hint--right', 'data-hint': $.i18n.t('clear'), click: function(e) {toolSelect('clear', this);} }))
			.append($('<div/>', {class: 'dragdraw-grab hint--right', 'data-hint': $.i18n.t('grabimg'), click: function(e) {toolSelect('grab', this);} }))
			.append($('<div/>', {class: 'dragdraw-shot hint--right', 'data-hint': $.i18n.t('scrshot'), click: function(e) {toolSelect('shot', this);} }))
			.append($('<div/>', {class: 'dragdraw-clearall hint--right', 'data-hint': $.i18n.t('clearall'), click: function(e) {toolSelect('clearall', this);} }))
			)
			.append($('<span />', {
					class: 'wcicon selected hint--left',
					'data-hint': $.i18n.t('sel'),
					'data-placement': 'left'
				}).click(function(e) {
				$(this).parent().find('.dragdraw-header').click();
			}))
			.prepend($('<div />', {
				class: 'dragdraw-header',
				click: function(e) {
					var parent = $(this).parent();
					if (parent.is('.drawdrag')) return;
					parent.toggleClass('selected');
				 }
			}).drag('start', function(ev, dd) {
					$(this).parent().addClass('drawdrag');
					dd.offy = dd.offx = 0;
					if ($(this).parent().css('position') === 'fixed') {
						dd.offy = $(window).scrollTop();
						dd.offx = $(window).scrollLeft();
					}
				}).drag('init', function() {
					if ($(this).parent().is('.dragdraw.selected'))
						return $('.dragdraw.selected');
				}).drag(function(ev, dd) {
					var props = {};
					props.top = dd.offsetY - dd.offy;
					props.left = dd.offsetX - dd.offx;
					sketch.resize();
					$(this).parent().css(props);
				}).drag('end', function() {
					var that = this;
					setTimeout(function() {
						$(that).parent().removeClass('drawdrag'); refresh(data.id);
					}, 300);
				}).append($('<span />', {
					class: 'drawdrag-label editNoDrag',
					text: data.text,
					contentEditable: true,
					keyup: markUnsaved,
					keypress: function(e) {
						if (e.keyCode == 13) {
							e.preventDefault();
							$(this).blur();
						}
					},
					click: function(e) {
						e.preventDefault();e.stopPropagation();
					}
				}))
			.append($('<span />', {
					class: 'drawdrag-status',
					text: data.from

					//click : saveSticky
				}))
			.append($('<span />', {
					class: 'close-sticky hint--right',
					'data-hint': $.i18n.t('del'),
					text: 'x',
					click: function() {
						deleteDraw($(this).parents('.dragdraw').removeClass('selected').addClass('drawdrag').attr('id'));
						if ($('.dragdraw.selected').length == 0) $('img').removeClass('wccanselect');
					}
				})))
			.append($('<div />', {
				id: 'draw' + data.daid,
				class: 'dragdraw-content',
				click: function(e) {
					e.preventDefault();e.stopPropagation();
				},
				dblclick: function(e) {
					e.preventDefault();e.stopPropagation();
					sketch.clearRecording();
					sketch.resize();
					$(this).find('.captured').fadeOut('slow');
					captureScreen($(this).parent(), true);
				}
			 })).drag('start', function(ev, dd) {
					$(this).addClass('drawdrag');
					dd.attr = $(ev.target).prop('className');
					dd.width = $(this).width();
					dd.height = $(this).height();
					dd.offy = dd.offx = 0;
					if ($(this).css('position') === 'fixed') {
						dd.offy = $(window).scrollTop();
						dd.offx = $(window).scrollLeft();
					}
				}).drag('init', function() {
					if ($(this).is('.dragdraw.selected'))
						return $('.dragdraw.selected');
					$('.captured', this).css({width:'auto', height:'auto'});
				}).drag(function(ev, dd) {
					var props = {};
					if (ev.shiftKey) {
						// if shiftkey pressed, scale proportionally
						if (dd.attr.indexOf('E') > -1) {
							props.width = Math.max(32, dd.width + dd.deltaX + dd.deltaX);
							props.left = dd.originalX + dd.width + dd.deltaX - props.width;
						}

						if (dd.attr.indexOf('S') > -1) {
							props.height = Math.max(32, dd.height + dd.deltaY + dd.deltaY);
							props.top = dd.originalY + dd.height + dd.deltaY - props.height;
						}

						if (dd.attr.indexOf('W') > -1) {
							props.width = Math.max(32, dd.width - dd.deltaX -  dd.deltaX);
							props.left = dd.originalX + dd.width - dd.deltaX - props.width;
						}

						if (dd.attr.indexOf('N') > -1) {
							props.height = Math.max(32, dd.height - dd.deltaY - dd.deltaY);
							props.top = dd.originalY + dd.height - dd.deltaY - props.height;
						}
					} else {
						if (dd.attr.indexOf('E') > -1) {
							props.width = Math.max(32, dd.width + dd.deltaX);
						}

						if (dd.attr.indexOf('S') > -1) {
							props.height = Math.max(32, dd.height + dd.deltaY);
						}

						if (dd.attr.indexOf('W') > -1) {
							props.width = Math.max(32, dd.width - dd.deltaX);
							props.left = dd.originalX + dd.width - props.width;
						}

						if (dd.attr.indexOf('N') > -1) {
							props.height = Math.max(32, dd.height - dd.deltaY);
							props.top = dd.originalY + dd.height - props.height;
						}
					}

					if (dd.attr.indexOf('dragdraw') > -1) {
						props.top = dd.offsetY - dd.offy;
						props.left = dd.offsetX - dd.offx;
					}

					if (props.height < 10) props.height = 10;
					if (props.width < 10) props.width = 10;

					//sketch.zoom = props.width / 100;
					sketch.resize();
					$(this).css(props);
				}).drag('end', function() {
					var that = this;
					setTimeout(function() {
						$(that).removeClass('drawdrag'); refresh(data.id);
					}, 300);
				}).css({
			position: 'absolute',
			top: data.top,
			left: data.left
		}).focusout(saveDraw)
		.appendTo(document.body);
		return 'draw' + data.daid;
	},

	toolSelect = function toolSelect(tool, el) {
		if (tool == 'shot') {
			captureScreen($(el).parent().parent(), true);
			return false;
		} else if (tool == 'grab') {
			 $(el).parent().parent().toggleClass('grab');
			 if ($('.dragdraw.grab').length > 0) {
				$('img').filter(function() { return $(this).parent().is(':not(.dragdraw-content)'); }).addClass('wccanselect');
			} else {
				$('img').removeClass('wccanselect');
			}

			if (!$(el).parent().parent().hasClass('grab')) {
				$(el).parent().find('.dragdraw-brush').click(); return false;
			}
		} else if (tool == 'brush') {
			sketch.setTool(tool);
		} else if (tool == 'eraser') {
			sketch.setTool(tool);
		} else if (tool == 'animate') {
			sketch.redrawAnimate();
			return false;
		} else if (tool == 'clear') {
			sketch.clearRecording();
			sketch.resize();
			return false;
		} else if (tool == 'clearall') {
			sketch.clearRecording();
			sketch.resize();
			$(el).parent().parent().find('.captured').remove();
			return false;
		}

		$(el).parent().find('.activetool').removeClass('activetool');
		$(el).addClass('activetool');
	},

	deleteDraw = function deleteDraw(id) {
		localStorage.removeItem('dragdraw-' + id);
		sketch.destroy();
		$('#' + id).fadeOut(200, function() { $(this).remove(); });
	},

	saveDraw = function saveDraw() {
		var that = $(this),  box = (that.hasClass('dragdraw-status') || that.hasClass('dragdraw-content')) ? that.parents('div.dragdraw') : that,
				obj = {
					from: box.find('.dragdraw-status').text(),

					// daid: data.daid || 'noid',
					uid:  box.attr('data-uid'),
					id: box.attr('id'),
					top: box.css('top'),
					left: box.css('left'),
					text: box.children('.dragdraw-content').html()       };
		localStorage.setItem('dragdraw-' + obj.id, JSON.stringify(obj));
	},

	captureScreen = function captureScreen(sel, captureUnder) {
		var container = sel.find('.dragdraw-content');
		var dl = sel.length;
		if (dl > 1) return;
		sel.spin();

		if (captureUnder) {
			var ebox = webC.helper.getElementBox(container.parent()[0]);
		} else {
			var ebox = webC.helper.getElementBox(el[0]);
		}

		var rect = JSON.stringify({top:ebox.top - $(window).scrollTop(), left:ebox.left - $(window).scrollLeft(), width:ebox.width, height:ebox.height});
		webC.helper.preScreenShot();
		container.addClass('wcscreenshoting');
		var screenshot_data = webC.helper.getScreenShotData(rect);
		$.ajax({
			url: 'http://' + wcserver + '/render',
			type: 'POST',
			data:screenshot_data,
			success: function(data) {
				screenshot_data = {};
				webC.helper.postScreenShot();
				var centoffsetX = (sel.width() - ebox.width) / 2;
				var centoffsetY = (sel.height() - ebox.height) / 2;
				if (centoffsetX < 0) centoffsetX = 0;
				if (centoffsetY < 0) centoffsetY = 0;
				container.removeClass('wcscreenshoting').find('.captured').remove();
				$('<img />', {class:'captured'}).css({width:0, height:0}).attr('src', 'http://' + wcserver  + data.img_src).appendTo(container).fadeIn('slow').transition({width:ebox.width, height:ebox.height});
				sel.removeClass('selected').spin(false);
			}
		});
	},

	markUnsaved = function markUnsaved() {
		if (!$(this).parent().parent().is('.selected')) return;
		$('.drawdrag-label', '.selected').not($(this)).text($(this).text());
		if ($(this).text().trim() == '') { $('.drawdrag-label', '.selected').css('opacity', 0); } else {$('.drawdrag-label', '.selected').css('opacity', 1);}
	},

	refresh = function refresh(id) {
		var el = $('#' + id);
		if (el.length === 0) return;
		var eloff = el.offset();

		// if (el.data('linked') && !el.is('.draggin')) {
			// var eoffset = el.offset();
			// var nleft = eoffset.left + (($(window).width() - windowWidth) / 2);
			// if (nleft < 5 ) nleft = 5;
			// el.transition({'left': nleft});
			// windowWidth = $(window).width();
		// }
		if (el.data('linked') && !el.is('.draggin')) {
			var linked = $('#' + id).data('linked');
			var lbox = webC.helper.getElementBox(linked);
			if (el.css('position') === 'fixed') {
				lbox.top -= $(window).scrollTop(); lbox.left -= $(window).scrollLeft();
			}

			el.transition({width:lbox.width, height:lbox.height, top:lbox.top, left:lbox.left});
			return;
		}

		if ($(window).width() < el.width() + eloff.left + 5) {
			el.transition({left:$(window).width() - el.width()});
		}

		if (eloff.left < 0) {
			el.transition({left: 5});
		}
	};

		return {
		open: openDraw,
		new: createDraw,
		remove: deleteDraw
	};
	}

};

webC.report = {

	errors:[], ignoreWords:[], pageElements:'', edits:'', corrections:'',

	init: function() {
		if (storage.isSet('wcIgnoreWords')) this.ignoreWords = storage.get('wcIgnoreWords');

		// errors = $.observable({
		//     id: 1,
		//     type: 'name',
		//     element: 'element path',
		//     oldval: '',
		//     newval: '',
		//     uid : 'userid',
		//     uname: 'username'
		// });
	},
	addError: function(options) {
			var o = options;
			var id = _.size(this.errors) + 1;
			if (o.element.is('body')) o.element = 'body';
			this.errors.push({
				id: id,
				type: o.type,
				element: o.element,
				oldval: o.oldval,
				newval: o.newval,
				uid: wcApp.User.get('id'),
				uname: wcApp.User.get('name')
			});

			$('.wcreporterror').filter(function() {
				var e = $(this);
				if (e.data('errorID') === id) {
					var el = $('.wc-words-arrow', this)[0];
					var o = webC.helper.addMarker('red', 'spelling-label', el, 50, 50);
					$(el).popover({
						 // position:
						 position: 'bottom',
						 title: 'Run Spellchecker',
						 trigger: 'manual',
						 content: 'click to run'
					});
					e.on('click', function() {
						var pd = $(el, this).data('popover');
						if (!$(pd.popover).is(':visible')) {
							$(el, this).popover('show');
						} else {
							$(el, this).popover('hide');
						}
					});
					o.new();
				}
			});

			//function(color, icon, el, width, height)

		// $(o.element).highlight(o.newval);
	//   $('.spell-word-error').grumble({
	//   text: $user().name(),
	//   angle: 45,
	//   distance: 20,
	//   type:'alt-',
	//   showAfter: 100,
	//   hideAfter: false,
	//   hasHideButton: false,
	//   buttonHideText: 'x'
	// });
		// _.each(this.errors, function(el, index, list) { console.info(el) });
		},
	addIgnoreWord: function(word) {
		this.ignoreWords.push(word);
		storage.set('wcIgnoreWords', this.ignoreWords);
	},
	next: function() {
		return this.errors++;
	},
	send: function() {
	},
	broadcast: function(op, type) {
		var o = _.extend(op, {from:wcApp.User.get('name')});
		try {
		// $state.submitOp({"p":["wcdata",type], od:o,oi:o});
		} catch (e) {
			return;
		}
	}
};

webC.report.init();

webC.apis = {

	type: 'GET',

	post: function(service, options, callback, post) { return this.get(service, options, callback, post); },

	get: function(service, options, callback, post) {
		if (post === 'post') this.type = 'POST';
		$.ajax({
			type: this.type,
			dataType: 'json',
			cache: true,
			url: 'http://' + wcserver + '/' + service + '/',
			data:options,
			success: function(data) {
					callback(data);
				}
		});
	}

};

webC.colors = {
	sticker: { ocyan:'rgba(25, 162, 162, 1)', ored:'rgba(255, 0, 0,1)', ogreen:'rgba(7, 228, 34, 1)', oblue:'rgba(0, 204, 255, 1)', oyellow:'rgba(233, 173, 46, 1)' },
	overlay: { ogrey:'rgba(255, 255, 255, 0.5)', ored:'rgba(207, 142, 142, 0.5)', ogreen:'rgba(114, 250, 120, 0.5)', oblue:'rgba(102, 204, 255, 0.5)', oyellow:'rgba(255, 212, 120, 0.5)' },
	drawing: { oblack:'rgba(0, 0, 0, 1)', owhite:'rgba(255, 255, 255, 1)', ored:'rgba(255, 0, 0, 1)', ogreen:'rgba(0, 230, 10, 1)', oblue:'rgba(102, 204, 255, 1)', oyellow:'rgba(255, 238, 0, 1)' }
};

webC.cookies = {

	create: function(name, value, days) {
		if (days) {
			var date = new Date(); date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000)); var expires = '; expires=' + date.toUTCString();
		} else var expires = ''; document.cookie = name + '=' + value + expires + '; path=/';
	},
	read: function(name) {
		var nameEQ = name + '='; var ca = document.cookie.split(';'); for (var i = 0; i < ca.length; i++) {
			var c = ca[i]; while (c.charAt(0) == ' ') c = c.substring(1, c.length); if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
		} return null;
	},
	erase: function(name, path) {
		if (!path) path = '/';
		document.cookie = name + '=; path=' + path + '; expires=' + new Date(0).toUTCString();
/* erase all cookie with path
var pathname = location.pathname.replace(/\/$/, ''),
		segments = pathname.split('/'),
		paths = [];
for (var i = 0, l = segments.length, path; i < l; i++) {
		path = segments.slice(0, i + 1).join('/');

		paths.push(path);       // as file
		paths.push(path + '/'); // as directory
}
*/
	},
	erasewithpath: function(name) {
			// erase all cookie with path
		var pathname = location.pathname.replace(/\/$/, ''),
				segments = pathname.split('/');
		for (var i = 0, l = segments.length, path; i < l; i++) {
			path = segments.slice(0, i + 1).join('/');
			this.erase(name, path);
		}
	}
};

$.fn.getUrlParam = function(name) {
	var name = name.replace(/[\[]/, '\\\[').replace(/[\]]/, '\\\]');
	var regexS = '[\\?&]' + name + '=([^&#]*)';
	var regex = new RegExp(regexS);
	var results = regex.exec(window.location.href);
	if (results === null)
		return '';
	else
		return results[1];
};

$.fn.justtext = function() {
	return $(this).clone()
					.children()
					.remove()
					.end()
					.text();
};

/*
$('div').on('activate', function() {
		$(this).empty();
		var range, sel;
		if ( (sel = document.selection) && document.body.createTextRange) {
				range = document.body.createTextRange();
				range.moveToElementText(this);
				range.select();
		}
});

$('div').focus(function() {
		if (this.hasChildNodes() && document.createRange && window.getSelection) {
				$(this).empty();
				var range, sel;
				range = document.createRange();
				range.selectNodeContents(this);
				sel = window.getSelection();
				sel.removeAllRanges();
				sel.addRange(range);
		}
});

function ParseDIVText()
{
		//NOTE: TYPE MORE TEXT WITH ENTER KEY IN THE EDITABLE DIV TO BETTER UNDERSTAND THIS PROBLEM.


		//QUESTION: my solution is working in firefox and chrome but not in IE.
		var domString = $("#div-editable").html();

		domString = domString.replace(/<div style="cursor: text">/g, "<br>").replace(/<\/div>/g,"");

		alert(domString);
		//


		//answer that was given by Laoujin at stackoverflow is not working....
		var innerDOM = $("#div-editable").clone();

		innerDOM.find("div[style='cursor: text']").unwrap().append("<br>");

		alert(innerDOM.html());
		//

		//FINAL ANSWER
		var domString = "", temp = "";

		$("#div-editable div").each(function()
								{
										temp = $(this).html();
										domString += "<br>" + ((temp == "<br>") ? "" : temp);
								});

		alert(domString);
}

$(".edit").click(function(e) {
		e.preventDefault();

		var div = $(this).parent().children("div")[0];
		div.focus();

		if (window.getSelection && document.createRange) {
				// IE 9 and non-IE
				var sel = window.getSelection();
				var range = document.createRange();
				range.setStart(div, 0);
				range.collapse(true);
				sel.removeAllRanges();
				sel.addRange(range);
		} else if (document.body.createTextRange) {
				// IE < 9
				var textRange = document.body.createTextRange();
				textRange.moveToElementText(div);
				textRange.collapse(true);
				textRange.select();
		}
});


// Set cursor position on contentEditable
var editable = document.getElementById('editable'),
		selection, range;

// Populates selection and range variables
var captureSelection = function(e) {
		// Don't capture selection outside editable region
		var isOrContainsAnchor = false,
				isOrContainsFocus = false,
				sel = window.getSelection(),
				parentAnchor = sel.anchorNode,
				parentFocus = sel.focusNode;

		while(parentAnchor && parentAnchor != document.documentElement) {
				if(parentAnchor == editable) {
						isOrContainsAnchor = true;
				}
				parentAnchor = parentAnchor.parentNode;
		}

		while(parentFocus && parentFocus != document.documentElement) {
				if(parentFocus == editable) {
						isOrContainsFocus = true;
				}
				parentFocus = parentFocus.parentNode;
		}

		if(!isOrContainsAnchor || !isOrContainsFocus) {
				return;
		}

		selection = window.getSelection();

		// Get range (standards)
		if(selection.getRangeAt !== undefined) {
				range = selection.getRangeAt(0);

		// Get range (Safari 2)
		} else if(
				document.createRange &&
				selection.anchorNode &&
				selection.anchorOffset &&
				selection.focusNode &&
				selection.focusOffset
		) {
				range = document.createRange();
				range.setStart(selection.anchorNode, selection.anchorOffset);
				range.setEnd(selection.focusNode, selection.focusOffset);
		} else {
				// Failure here, not handled by the rest of the script.
				// Probably IE or some older browser
		}
};

// Recalculate selection while typing
editable.onkeyup = captureSelection;

// Recalculate selection after clicking/drag-selecting
editable.onmousedown = function(e) {
		editable.className = editable.className + ' selecting';
};
document.onmouseup = function(e) {
		if(editable.className.match(/\sselecting(\s|$)/)) {
				editable.className = editable.className.replace(/ selecting(\s|$)/, '');
				captureSelection();
		}
};

editable.onblur = function(e) {
		var cursorStart = document.createElement('span'),
				collapsed = !!range.collapsed;

		cursorStart.id = 'cursorStart';
		cursorStart.appendChild(document.createTextNode('—'));

		// Insert beginning cursor marker
		range.insertNode(cursorStart);

		// Insert end cursor marker if any text is selected
		if(!collapsed) {
				var cursorEnd = document.createElement('span');
				cursorEnd.id = 'cursorEnd';
				range.collapse();
				range.insertNode(cursorEnd);
		}
};

// Add callbacks to afterFocus to be called after cursor is replaced
// if you like, this would be useful for styling buttons and so on
var afterFocus = [];
editable.onfocus = function(e) {
		// Slight delay will avoid the initial selection
		// (at start or of contents depending on browser) being mistaken
		setTimeout(function() {
				var cursorStart = document.getElementById('cursorStart'),
						cursorEnd = document.getElementById('cursorEnd');

				// Don't do anything if user is creating a new selection
				if(editable.className.match(/\sselecting(\s|$)/)) {
						if(cursorStart) {
								cursorStart.parentNode.removeChild(cursorStart);
						}
						if(cursorEnd) {
								cursorEnd.parentNode.removeChild(cursorEnd);
						}
				} else if(cursorStart) {
						captureSelection();
						var range = document.createRange();

						if(cursorEnd) {
								range.setStartAfter(cursorStart);
								range.setEndBefore(cursorEnd);

								// Delete cursor markers
								cursorStart.parentNode.removeChild(cursorStart);
								cursorEnd.parentNode.removeChild(cursorEnd);

								// Select range
								selection.removeAllRanges();
								selection.addRange(range);
						} else {
								range.selectNode(cursorStart);

								// Select range
								selection.removeAllRanges();
								selection.addRange(range);

								// Delete cursor marker
								document.execCommand('delete', false, null);
						}
				}

				// Call callbacks here
				for(var i = 0; i < afterFocus.length; i++) {
						afterFocus[i]();
				}
				afterFocus = [];

				// Register selection again
				captureSelection();
		}, 10);
};


if(typeof(Storage)!=="undefined")
	{
	// Yes! localStorage and sessionStorage support!
	// Some code.....
	}
else
	{
	// Sorry! No web storage support..
	}

 if (localStorage.clickcount)
	{
	localStorage.clickcount=Number(localStorage.clickcount)+1;
	}
else
	{
	localStorage.clickcount=1;
	}
document.getElementById("result").innerHTML="You have clicked the button " + localStorage.clickcount + " time(s).";

	if (sessionStorage.clickcount)
	{
	sessionStorage.clickcount=Number(sessionStorage.clickcount)+1;
	}
else
	{
	sessionStorage.clickcount=1;
	}
document.getElementById("result").innerHTML="You have clicked the button " + sessionStorage.clickcount + " time(s) in this session.";

*/

var $state, $user, $draws = [], $users = [], $docName, $orgUrl, $debug, $pagelang = '', $spellchecker;//for now lets make them semi global varibles for our scope.

$debug = false;

// $('<ul id="wc-circut-menu" style="position:absolute;top:50%;left:50%;display:none"> \
//   <li><a href="#">+</a></li> \
//   <li><a href="#">1</a></li> \
//   <li><a href="#">2</a></li> \
//   <li><a href="#">3</a></li> \
//   <li><a href="#">4</a></li> \
//   <li><a href="#">5</a></li> \
// </ul> \
// ').appendTo('body');

// $('#wc-circut-menu').circleMenu({});

if ($debug) {
	$("<div style='display:block;z-index:999999;background-color:#FFF' class='wcelements' id='wcdebug'><div id='ot'><h3>Document</h3><div id='doc'></div><h3>Operations</h3><div id='ops'></div></div><div id='chat'><h3>Peep Peep!</h3><div id='messages'></div><textarea id='message2' rows=4 cols=35></textarea><br> DocName: <input id='docnameid' size=75 value=''/></div><button id='clearchat'>clear document</button><br><br></div>").appendTo('body');
}

webC.helper.initUser();

var randomDocName = function(length) {
	var chars, x;
	if (length == null) {
		length = 10;
	}

	chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	var name = [];
	for (x = 0; x < length; x++) {
		name.push(chars[Math.floor(Math.random() * chars.length)]);
	}

	return name.join('');
};

function getCaretPosition(editableDiv) {
	var caretPos = 0, containerEl = null, sel, range;
	if (window.getSelection) {
		sel = window.getSelection();
		if (sel.rangeCount) {
			range = sel.getRangeAt(0);
			if (range.commonAncestorContainer.parentNode == editableDiv) {
				caretPos = range.endOffset;
			}
		}
	} else if (document.selection && document.selection.createRange) {
		range = document.selection.createRange();
		if (range.parentElement() == editableDiv) {
			var tempEl = document.createElement('span');
			editableDiv.insertBefore(tempEl, editableDiv.firstChild);
			var tempRange = range.duplicate();
			tempRange.moveToElementText(tempEl);
			tempRange.setEndPoint('EndToEnd', range);
			caretPos = tempRange.text.length;
		}
	}

	return caretPos;
}

function addAction(m) {
	var msg = $('<div class="message"><div class="user"></div><div class="text"></div></div>');
	$('.text', msg).text(m.message);
	$('.user', msg).text(m.from);

	$('#messages').prepend(msg);
}

function newPosts(op) {
	var opel = $('<div class="op">');
	opel.text(JSON.stringify(op));
	$('#ops').prepend(opel);
	op.forEach(function(c) {
		if (c.li) {
			addAction(c.li);
		}
	});

	// $('#doc').text(JSON.stringify($state.snapshot))
}

function InitDocument() {
	 var d = $state.get('wcdata');
	 if (d === 'undefined' || d === null) {
		$state.at([]).set({ wcdata: []});
		$state.at('wcdata').set({ chat: [], users: [], actions: [], changes: [], errors: [], notes: []});
		d = $state.at('wcdata');
	 } else {
		d = $state.at('wcdata');
	 }

	 var users  = d.at('users');
	 var c = d.get();
	 if (c) {
		$users = c.users;

			// we already have users
		var exist = false;
		$users.forEach(function(u, i) {
					// you not in the list, let add
			if (u.id == wcApp.User.get('id')) {
				if (wcApp.User.get('name') != u.name) {
					users.at(i).remove();
				} else {
					exist = true;
					if (wcApp.User.get('name') == 'You') {
						wcApp.User.set('name', 'User ' + parseInt($users.length));
					}
				}
			}
		});
		if (!exist) {
			if (wcApp.User.get('name') == 'You') {
				var name = 'User ' + parseInt($users.length);
			} else {
				var name = wcApp.User.get('name');
			}

			d.at('users').push({
				id: wcApp.User.get('id'),
				name: name
			});
		}

		console.info('Total users here:' + $users.length + ' My user name:' + wcApp.User.get('name'));
	 } else {
		console.info('no data in: wcdata, strange');
	 }
}

/*
wcdata structure
	wcdata = {
				users : [ { uid: 'string', name:'string', current:'element' } ],
				actions : [ { user:'name', uid:'string', action:'string', element: 'jquery element path' } ],
				changes : [ { user:'name', uid:'string', element:'jquery element path', current:'HTML' } ],
				errors : [ { user:'name', uid:'string', element:'jquery element path', type 'string', correction:'HTML', comment: 'text' } ],
				notes : [ { user:'name', uid:'string', element:'jquery element path', type 'string', correction:'HTML', comment: 'text' } ]
	}
*/

function setDocumentName(docName) {
	var hash = '';

	if (!docName) {
		if (!document.location.hash) {
			if (isSafari) {
				 hash = webC.cookies.read('wclasthash');
				 if (hash == '' || hash == '#' || hash == null || typeof hash == 'undefined') {
					hash = '#public';
				 }
			} else {
				 hash = '#public';
			}

			document.location.hash = hash;
		 }

		webC.cookies.erase('wclasthash', hash);

		var cloc = document.location + '';

		var cururl = cloc.split('/go\/http://', 2);
		if (typeof cururl[1] == 'undefined') {
			cururl = cloc.split('/go\/https://', 2);
		}

		if (typeof cururl[1] != 'undefined') {
			 var urlval = cururl[1].replace(/\/+$/, '');
		} else {
			 var urlval = cloc.replace(/\/+$/, '');
		}

		$orgUrl = urlval.split('#', 2)[0];

		$docName = encodeURIComponent(urlval.toLowerCase());
	} else {
		$docName =  docName;
	}
}

function locationHashChanged() {
	var newhash = document.location.hash;

	// disconnect need to remove user from list.
	if ((hashnow == '' || hashnow == '#') || newhash == hashnow) return;

	window.wcLoaded = false;
	setTimeout(function() { location.reload();}, 1000);
}

$().onMessageRecived(function(e) {
	 if (e.origin !== 'http://' + wcserver) return;

	 //console.info(e.origin);
	 if (typeof e.data === 'string') {
		//console.info(e.data);
		var obj = JSON.parse(e.data);
	 } else {
		var obj = e.data;
	 }

	 if (obj.name) {
		wcApp.User.set('name', obj.name);
	 }
});

// $('#testParagraph').css({'outline':'0px solid transparent','-moz-user-modify':'read-write','-webkit-user-modify':'read-write','user-modify':'read-write','width':'auto','height':'auto'}).attr('spellcheck','false');
// $('#testParagraph')[0].contentEditable = true;

$('#jGrowl').on('mousedown.wcevents', 'a', function(event) {
	event.preventDefault();
	var el = $(':focus');
	if (el.is('input') || el.is('textarea')) {
		var text = $(this).parent().text();
		el.insertAtCaret(text);
	} else {
		var html = $(this).parent().html();

		// el.focus();
		pasteHtmlAtCaret(html);
	}

		 /*
	 alert('jgrow click link');
	 var r=confirm("Hey, looks like you're going away from this page. Are you sure?");
		if (r==true) {
		var e = $(this);
		var v = decodeURIComponent(e.data('url'));
		var h = decodeURIComponent(e.data('hash'));
		if (!h) h = '';
		var op = {
			element: v,
			hash: h,
			action: 'goingto'
		};
		webC.report.broadcast(op, 'actions');
		setTimeout(function() { window.top.location.href = "http://" +wcserver+"/go/" + v + h; }, 2000);
		} else {
			$('.jGrowl-close').click();
		}
		*/

	function pasteHtmlAtCaret(html, selectPastedContent) {
		var sel, range;
		if (window.getSelection) {
				// IE9 and non-IE
			sel = window.getSelection();
			if (sel.getRangeAt && sel.rangeCount) {
				range = sel.getRangeAt(0);
				range.deleteContents();

				// Range.createContextualFragment() would be useful here but is
				// only relatively recently standardized and is not supported in
				// some browsers (IE9, for one)
				var el = document.createElement('div');
				el.innerHTML = html;
				var frag = document.createDocumentFragment(), node, lastNode;
				while ((node = el.firstChild)) {
					lastNode = frag.appendChild(node);
				}

				var firstNode = frag.firstChild;
				range.insertNode(frag);

						// Preserve the selection
				if (lastNode) {
					range = range.cloneRange();
					range.setStartAfter(lastNode);
					if (selectPastedContent) {
						range.setStartBefore(firstNode);
					} else {
						range.collapse(true);
					}

					sel.removeAllRanges();
					sel.addRange(range);
				}
			}
		} else if ((sel = document.selection) && sel.type != 'Control') {
				// IE < 9
			var originalRange = sel.createRange();
			originalRange.collapse(true);
			sel.createRange().pasteHTML(html);
			if (selectPastedContent) {
				range = sel.createRange();
				range.setEndPoint('StartToStart', originalRange);
				range.select();
			}
		}
	}
});

if ('onhashchange' in window) {
	window.onhashchange = locationHashChanged;
}

$('<div/>', { wcelement:'', id: 'wcnoedit'}).appendTo($body);

dust.render(templates['report-popup'], {data: 'l'}, function(err, out) {
	$(out).appendTo(document.body);
});

window.addEventListener('message', receiveMessage, false);

function receiveMessage(event) {
	if (event.origin !== 'file://')
	return;

	var res = JSON.parse(event.data);

	// consolere.ready(function() {
	//   console.re.log("new cmd recived", res);
	// });

	switch (res.cmd) {
	case 'done':
		if (res.msg == 'screenshot') {
			// consolere.ready(function() {
			//     console.re.log('screenshot is done');
			// });
		}

	break;
	case 'window_closing':
		console.re.log('Do Window Closing');
	break;
	case 'another':
	case 'another':
	case 'another':
	default:
	}

	// alert(event.data);
	// consolere.ready(function() {
	//   console.re.log(event.origin);
	// });
	// alert(event.data);
}

// wcApp.settings

// Handler for .ready() called.

setDocumentName();

window.wcLoaded = true;
