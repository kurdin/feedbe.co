var $ = require('jquery');

var $$ = require('jflux-dust');

dust.config.whitespace = true;

var partial_src = document.getElementById('partial').textContent;
var partial = dust.compile(partial_src, 'partial');
dust.loadSource(partial);

var tmpl_src = document.getElementById('template').textContent;
var template = dust.loadSource(dust.compile(tmpl_src));

  // $$.config().dust.loadSource(partial);

  var comp = $$.component({
    
    component: {
          name: 'Render Test',
          insert_type: 'bootstrap'
      },  
      
      data: {
           list: [
              "foo2",
              "bar",
              "baz"
              ]
      },

      init: function () {
        // console.log('template', template);
      },

    render: function() {
        return this.dust_render(template)(this.data);
    }
  });


window.setTimeout(function() {
      $$.render(comp(), 'main', 'bootstrap');
}, 2000);


