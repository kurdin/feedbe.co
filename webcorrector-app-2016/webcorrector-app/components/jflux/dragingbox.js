var BoxesActions = require('../../actions/boxactions');

module.exports = function($) {

  return DragBox = {
    init: function(){
      if ( this.$el.is('.dragbox.selected') )
        return $('.dragbox.selected');
    },
    start: function(ev, dd){
          var el = this.$el;
          el.addClass('draggin');
          dd.attr = $( ev.target ).prop('className');
          dd.width = el.width();
          dd.height = el.height();
          dd.offy = dd.offx = 0;
          if (el.css('position') === 'fixed') {
            dd.offy = $(window).scrollTop();
            dd.offx = $(window).scrollLeft();
          }
    },    
    end: function(ev, dd){
      var el = this.$el;
      // var s = webC.helper.addStikers();
      BoxesActions.UPDATE_BOX({id: this.props.box.id, props: dd.props});
      // this.update();
      setTimeout(function() { el.removeClass("draggin"); /*s.refresh(data.id);*/ }, 100);           
    },
    drag: function (ev, dd){
        var props = {};
        if (ev.shiftKey) {
          // if shiftkey pressed, scale proportionally
        if ( dd.attr.indexOf("E") > -1 ){
          props.width = Math.max( 32, dd.width + dd.deltaX + dd.deltaX );
          props.left = dd.originalX + dd.width + dd.deltaX - props.width;
        }
        if ( dd.attr.indexOf("S") > -1 ){
          props.height = Math.max( 32, dd.height + dd.deltaY + dd.deltaY);
          props.top = dd.originalY + dd.height + dd.deltaY - props.height;
        }
        if ( dd.attr.indexOf("W") > -1 ){
          props.width = Math.max( 32, dd.width - dd.deltaX -  dd.deltaX);
          props.left = dd.originalX + dd.width - dd.deltaX - props.width;
        }
        if ( dd.attr.indexOf("N") > -1 ){
          props.height = Math.max( 32, dd.height - dd.deltaY - dd.deltaY);
          props.top = dd.originalY + dd.height - dd.deltaY - props.height;
        }
        } else {
        if ( dd.attr.indexOf("E") > -1 ){
          props.width = Math.max( 32, dd.width + dd.deltaX ); 
        }
        if ( dd.attr.indexOf("S") > -1 ){
          props.height = Math.max( 32, dd.height + dd.deltaY );
        }
        if ( dd.attr.indexOf("W") > -1 ){
          props.width = Math.max( 32, dd.width - dd.deltaX );
          props.left = dd.originalX + dd.width - props.width;
        }
        if ( dd.attr.indexOf("N") > -1 ){
          props.height = Math.max( 32, dd.height - dd.deltaY );
          props.top = dd.originalY + dd.height - props.height;
        }  
       }

       if ( dd.attr.indexOf("dragbox") > -1 ){
          props.top = dd.offsetY - dd.offy;
          props.left = dd.offsetX - dd.offx;
        }
        
        if (props.height < 10) props.height = 10;
        if (props.width < 10) props.width = 10;

        dd.props = props;

        this.$el.css( props );
        //$('.dragbox-content', this).css({'width':props.width-50,'height':props.height-38});
  } 
}

};
