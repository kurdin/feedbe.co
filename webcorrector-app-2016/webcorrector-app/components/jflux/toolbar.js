var UIStore = require('../../stores/ui.js');

var $ = require('jquery');

var template = require('../../templates/toolbar/main.dust');
var Item = require('./toolbaritem');

var ToolBarActions = require('../../actions/toolbar');

var velocity = require('velocity-animate');
require('velocity-ui-pack');

velocity.RegisterUI('transition.newBoxIn', {
  defaultDuration: 600,
  calls: [
    [
      {
        opacity: [1, 0],
        transformOriginX: ['50%', '50%'],
        transformOriginY: ['50%', '50%'],
        scaleX: [1, 0.4],
        scaleY: [1, 0.4],
        translateZ: 0,
        translateX: [0, -400]
      },
      1,
      { easing: 'easeOutCirc' }
    ]
  ]
});

// var Drag = require('./dragingbox')($);

module.exports = $$.component({
  component: {
    name: 'ToolBar component',
    insert_type: 'append'
  },

  components: {
    toolbarItem: Item()
  },

  init: function() {
    this.classMap = {
      notactive: this.toolbar.open
    };

    this.style = {
      top: this.toolbar.position + 'px'
    };

    // var Box = BoxesStore.state.box(this.id);
    // this.box = Box.get();

    // this.listenTo(ToolBarStore, 'updatetoolbar', function() {
    //  this.update();
    // }.bind(this));
  },

  toolbar: UIStore.getToolbar(),

  events: {
    'click #wcthandlelogo': 'logoclick',
    // 'dblclick': 'dblclick',
    // 'draginit': 'draginit',
    drag: 'drag',
    dragstart: 'dragstart',
    dragend: 'dragend'
  },

  logoclick: function(e) {
    e.preventDefault();
    e.stopPropagation();
    if (UIStore.getToolbar().dragging) return;
    $(e.target)
      .parent()
      .toggleClass('notactive');
    ToolBarActions.TOOLBAR_OPEN();
  },

  dragstart: function(ev, dd) {
    dd.attr = $(ev.target).prop('className');
    this.draging = true;
    ToolBarActions.TOOLBAR_DRAGGIN(true);
  },
  drag: function(ev, dd) {
    if (dd.attr.indexOf('wcthandle') == -1) return;
    dd.position = dd.offsetY - $(window).scrollTop();
    this.$el.css({
      top: dd.position,
      bottom: 'auto'
    });
  },
  dragend: function(ev, dd) {
    ToolBarActions.TOOLBAR_DRAGGIN(false);
    ToolBarActions.TOOLBAR_POSITION(dd.position);
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
      that
        .parent()
        .find('.active')
        .removeClass('active')
        .end()
        .end()
        .addClass('active');
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

      var node = range.commonAncestorContainer
        ? range.commonAncestorContainer
        : range.parentElement
        ? range.parentElement()
        : range.item(0);

      if (node) {
        var parent = node.nodeName == '#text' ? node.parentNode : node;
      }

      var editEl = node;

      if (node.nodeType === 3) {
        var pos = node.data.indexOf(rangeText);
        if (pos >= 0) {
          middlebit = node.splitText(pos);
          var endbit = middlebit.splitText(rangeText.length);
          editEl = $(middlebit)
            .wrap('<span class="wc-text-edit">')
            .parent()
            .get(0);
        }
      }

      isHover = true;
      // $(editEl).css('outline','1px solid red');
      webC.helper.onElementSelect(editEl);
    } else if (this.model.get('tbEditText') === false) {
      $.mask.close();
    }
  },

  afterRender: function() {
    var el = this.$el;
    if (this.props.is_new) velocity(el, { left: '+=140' }, { delay: 500, duration: 500 });

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
    // velocity(el, "transition.boxIn", { display: "table" });
    // velocity(el, {left: '+=50'} , { duration: 600, display: "table" });
    // velocity(el, "transition.slideLeftBigIn", { duration: 500, display: "table" });
  },

  // dblclick: function() {
  //  BoxesStore.actions.BRING_TO_FRONT_BOX({id: this.id});
  // },

  shouldComponentUpdate: function(props_new) {
    // if (!props_new) return false;
    // if (props_new.zindex) {
    //  return true;
    // }
    // if (props_new.box !== this.box) {
    //  this.box = props_new.box;
    //  return true;
    // } else {
    //  return false;
    // }
  },

  render: function() {
    // var _box = this.box;

    // if (typeof _box == 'undefined') return;

    // this.style = {
    //   position: "absolute",
    //   top: _box.top + "px",
    //   left: _box.left + "px",
    //   width: _box.width + "px",
    //   height: _box.height + "px"
    // };

    // if (this.props.zindex > 0) this.style['z-index'] = this.props.zindex;

    // this.style2 = {
    //   'background-color': _box.bgcolor || getRandomColor()
    // };

    return this.dust_render(template)(this);
  }
});
