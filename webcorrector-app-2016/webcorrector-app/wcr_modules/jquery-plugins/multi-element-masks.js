// multi elements overlay
(function(a) {  

    var tool;

      tool = a.tools.expose_m = {
        
        conf: { 
            maskId: 'wcexpose_mask_m',
            loadSpeed: 'slow',
            closeSpeed: 'fast',
            closeOnClick: true,
            closeOnEsc: true,
            
            // css settings
            zIndex: 9999998,
            opacity: .3,
            startOpacity: 0,
            color: '#000',
            
            // callbacks
            onLoad: null,
            onClose: null
        }
    };

    /* one of the greatest headaches in the tool. finally made it */
    function viewport() {
                
        // the horror case
        if (/msie/.test(navigator.userAgent.toLowerCase())) {
            
            // if there are no scrollbars then use window.height
            var d = $(document).height(), w = $(window).height();
            
            return [
                window.innerWidth ||                            // ie7+
                document.documentElement.clientWidth ||     // ie6  
                document.body.clientWidth,                  // ie6 quirks mode
                d - w < 20 ? w : d
            ];
        } 
        
        // other well behaving browsers
        return [$(document).width(), $(document).height()]; 
    } 
    
    function call(fn) {
        if (fn) { return fn.call(a.mask_m); }
    }

    var els_size = [];
    var viewport_size;
    var mask, masks, maskL, maskT, maskR, maskB, outlines, outlineL, outlineT, outlineR, outlineB, outlineRS, outlineBS, outlineLS, outlineTS, exposed, loaded, config, overlayIndex, element;    

    var sel_elements = [];
    var mask_elements = [];
    var spacing_top = 3;
    var spacing_side = 3;
    var outline_size = 5;    

    function removeMask(a) {
        "undefined" !== typeof sel_elements[a] && (sel_elements[a] = void 0, updateMasksLayer())
    }

    function addSelectedElement(x, y, h, w, i) {
        x = x - spacing_top;
        y = y - spacing_side;
        h = h + y + (spacing_top * 2);
        w = w + x + (spacing_side * 2);
        var q = -1;
        if (void 0 !== i) {
            if (void 0 === sel_elements[i]) {
                return -1
            }
            q = i;
            sel_elements[f] = [
                [x, y],
                [w, h]
            ]
        } else {
            f = sel_elements.length, sel_elements.push([
                [x, y],
                [w, h]
            ])
        }
        return q;
    }
    
    function createOutLine(top, left, width, height, spaceLR, spaceTB, color, outline_size, opacity, group_class) {

    var outlines = [];

    function createDiv() {
          var odiv = $('<div/>', {class: group_class, style: "position:absolute;display:none;z-index: 9999999"});
          outlines.push(odiv);
          return odiv;
    };

      // outline shadow
      var oBS = createDiv();
      oBS.css({
      backgroundColor: color,
      opacity: opacity,   
      height: outline_size,
      left: left - spaceLR,  
      top: top + height + spaceTB, 
      width: width + spaceLR + spaceLR
      });

      var oRS = createDiv();
      oRS.css({
      borderTopRightRadius: 5, 
      borderBottomRightRadius: 5,     
      backgroundColor: color,
      opacity: opacity,
      width: outline_size,
      top: top  - spaceTB - outline_size,                    
      left: left + width + spaceLR, 
      height: height + spaceTB + spaceTB + outline_size + outline_size
      });

      var oTS = createDiv();
      oTS.css({
      backgroundColor: color,
      opacity: opacity,   
      height: outline_size,
      left: left - spaceLR,                  
      top: top - spaceTB - outline_size,
      width: width + spaceLR + spaceLR
      });

      var oLS = createDiv();
      oLS.css({
      borderTopLeftRadius: 5, 
      borderBottomLeftRadius: 5,     
      backgroundColor: color,
      opacity: opacity,   
      width: outline_size,
      left: left - spaceLR - outline_size,                  
      top: top - spaceTB - outline_size,
      height: height + spaceTB + spaceTB + outline_size + outline_size
      });
      // console.re.log(outlines);
      $("body").append(outlines);

      outlines.forEach(function(el) {
        el.fadeIn();
      });
      // return [top, left, width, height];
    }


    function createMask(top, left, height, width) {
      var mask = $('<div/>', {class: "wcemasks"}).css({
        position:'absolute', 
        top: top, 
        left: left, 
        width: width, 
        height: height, 
        display: 'none', 
        backgroundColor: '#000', 
        opacity: .5, 
        zIndex: 9999998
      });
      $("body").append(mask);
      return [top, left, width, height];
    }

    function updateMasksLayer() {
            mask_elements = [];
            for (var a = [], b = 0; b < sel_elements.length; b++) {
                if (sel_elements[b] !== undefined){
                    a.push([[sel_elements[b][0][0], sel_elements[b][0][1]],[sel_elements[b][1][0], sel_elements[b][1][1]]]);
                }
            }
            if (a.length === 0) {
              a.push([
                [10, 10],
                [10, 10]
              ]);
            }
            var b = [],
                c = [],
                d, e, f;
            d = function (a, b) {
                0 > b ? a.push(0) : a.push(b)
            };
            for (e = 0; e < a.length; e++) {
                void 0 !== a[e] && (0 > a[e][0][0] && b.push(0), d(b, a[e][0][0]), d(b, a[e][1][0]), d(c, a[e][0][1]), d(c, a[e][1][1]))
            }
            for (e = 0; e < b.length; e++) {
                for (d = 0; d < b.length - 1; d++) {
                    b[d] > b[d + 1] && (f = b[d + 1], b[d + 1] = b[d], b[d] = f)
                }
            }
            for (e = 0; e < c.length; e++) {
                for (d = 0; d < c.length - 1; d++) {
                    c[d] > c[d + 1] && (f = c[d + 1], c[d + 1] = c[d], c[d] = f)
                }
            }
            b.splice(0, 0, 0);
            c.splice(0, 0, 0);
            var v = viewport();
            b.push(v[1]);
            c.push(v[0]);
            if (1 < b.length) {
                for (e = 1; e < b.length; e++) {
                    b[e] === b[e - 1] && (b.splice(e, 1), e--)
                }
            }
            if (1 < c.length) {
                for (e = 1; e < c.length; e++) {
                    c[e] === c[e - 1] && (c.splice(e, 1), e--)
                }
            }
            var g = !1,
                h;
            for (e = 1; e < c.length; e++) {
                for (d = 1; d < b.length; d++) {
                    g = !1;
                    for (f = 0; f < a.length; f++) {
                        if (h = a[f], void 0 !== h && h[0][0] <= b[d - 1] && h[1][0] >= b[d] && h[0][1] <= c[e - 1] && h[1][1] >= c[e]) {
                            g = !0;
                            break
                        }
                    }
                    g || (f = b[d] - b[d - 1], g = c[e] - c[e - 1], 0 > f || 0 > g ? f = null : (f = createMask(b[d - 1], c[e - 1], f, g)), null !== f && mask_elements.push(f))
                }
            }
        // return mask_elements;
    }
    
    a.mask_m = {
        
        load: function(conf, els) {
            
            // already loaded ?
            // if (loaded) { return this; }            
            
            // configuration
            if (typeof conf == 'string') {
                conf = {color: conf};   
            }
            
            // use latest config
            conf = conf || config;
            
            config = conf = a.extend(a.extend({}, tool.conf), conf);

          
            // resize mask when window is resized
            // $(window).on("resize.mask", function() {
            //     a.mask_m.fit();
            // });

            // $(window).on("orientationchange", function() {
            //             setTimeout(function(){
            //             a.mask_m.fit();
            //         }, 300);
            // });
            
            // exposed elements
            sel_elements = [];
            $('.wcemasks, .wcexpose_outline').remove();

            if (els && els.length) {

                a.each(els, function() {
                    var el = $(this);
                    // if (!/relative|absolute|fixed/i.test(el.css("position"))) {
                    //     el.css("position", "relative");     
                    // }                   
                    var el_size = webC.helper.getElementBox(el[0]);
                    // els_size.push(el_size);
                    createOutLine(el_size.top, el_size.left, el_size.width, el_size.height, spacing_side, spacing_top, '#000', 5, 0.5, 'wcexpose_outline');
                    addSelectedElement(el_size.top, el_size.left, el_size.width, el_size.height);
                });

                // make elements sit on top of the mask
                //exposed = els.css({ zIndex: Math.max(conf.zIndex + 1, overlayIndex == 'auto' ? 0 : overlayIndex)});         
            } 

            updateMasksLayer();
            // console.re.log(mask_elements);

            // var mask = $('<div class="wcemasks"/>',{id:conf.maskId}).css({position:'absolute', top: 0, left: 0, width: viewport_size[0], height: viewport_size[1], display: 'none', backgroundColor: conf.color,  opacity: .5, zIndex: conf.zIndex});
            // $("body").append(mask);

            // reveal mask
            // $('.wcemasks').fadeIn();

            // outlines.fadeIn();
            // masks.fadeIn(function() {
            //     //a.mask_m.fit(); 
            //     call(conf.onLoad);
            //     loaded = "full";
            // });
            
            loaded = true;  
            return this;                
        },
        
        close: function(e) {
            if (loaded) {
                loaded = false;
                // onBeforeClose
                if (call(config.onBeforeClose(e)) === false) { return this; }
                    
                mask.fadeOut(config.closeSpeed, function()  {                                       
                    // if (exposed) {
                    //     exposed.css({zIndex: overlayIndex});                        
                    // }               
                    loaded = false;
                    call(config.onClose);
                });             
                
                masks.fadeOut();
                outlines.fadeOut();

                // unbind various event listeners
                $(document).off("keydown.mask");
                masks.off("click");
                $(window).off("resize.mask");  
            }
            
            return this; 
        },
        
        fit: function() {
            if (loaded) {

            }               
        },
        
        getMask: function() {
            return mask_m;    
        },
        
        isLoaded: function(fully) {
            return fully ? loaded == 'full' : loaded;   
        }, 
        
        getConf: function() {
            return config_m;  
        },
        
        getExposed: function() {
            return exposed_m; 
        }       
    };
    
    a.fn.mask_m = function(conf) {
        a.mask_m.load(conf);
        return this;        
    };          
    
    a.fn.expose_m = function(conf) {
        a.mask_m.load(conf, this);
        return this;            
    };

})($);