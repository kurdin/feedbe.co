
(function(a) { 
    // static constructs
    a.tools = a.tools || {version: '@VERSION'};
    
    var tool;

  
    tool = a.tools.expose = {
        
        conf: { 
            maskId: 'wcexposeMask',
            loadSpeed: 'slow',
            closeSpeed: 'fast',
            closeOnClick: true,
            closeOnEsc: true,
            
            // css settings
            zIndex: 9998,
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
        if (fn) { return fn.call(a.mask); }
    }
    
    var mask, masks, maskL, maskT, maskR, maskB, outlines, outlineL, outlineT, outlineR, outlineB, outlineRS, outlineBS, outlineLS, outlineTS, exposed, loaded, config, overlayIndex, element;       
   
    a.mask = {
        
        load: function(conf, els) {
            
            // already loaded ?
            if (loaded) { return this; }            
            
            // configuration
            if (typeof conf == 'string') {
                conf = {color: conf};   
            }
            
            // use latest config
            conf = conf || config;
            
            config = conf = a.extend(a.extend({}, tool.conf), conf);

            // get the mask
            mask = $("#" + conf.maskId);
            maskL = $("#" + conf.maskId + 'L');
            maskT = $("#" + conf.maskId + 'T');
            maskR = $("#" + conf.maskId + 'R');
            maskB = $("#" + conf.maskId + 'B');

            outlineRS = $("#" + conf.maskId + 'ORS');
            outlineBS = $("#" + conf.maskId + 'OBS');
            outlineTS = $("#" + conf.maskId + 'OTS');
            outlineLS = $("#" + conf.maskId + 'OLS');

            // or create it
            if (!mask.length) {
                mask = $('<div class="wcemasks"/>').attr("id", conf.maskId);
                $("body").append(mask);
            }

            if (!maskL.length) {
                maskL = $('<div class="wcemasks"/>').attr("id", conf.maskId + 'L');
                $("body").append(maskL);
            }

            if (!maskT.length) {
                maskT = $('<div class="wcemasks"/>').attr("id", conf.maskId + 'T');
                $("body").append(maskT);
            }

            if (!maskR.length) {
                maskR = $('<div class="wcemasks"/>').attr("id", conf.maskId + 'R');
                $("body").append(maskR);
            }


            if (!maskB.length) {
                maskB = $('<div class="wcemasks"/>').attr("id", conf.maskId + 'B');
                $("body").append(maskB);
            }

            if (!outlineTS.length) {
                outlineTS = $('<div class="wceoutline"/>').attr("id", conf.maskId + 'OTS');
                $("body").append(outlineTS);
            }

            if (!outlineLS.length) {
                outlineLS = $('<div class="wceoutline"/>').attr("id", conf.maskId + 'OLS');
                $("body").append(outlineLS);
            }

            if (!outlineBS.length) {
                outlineBS = $('<div class="wceoutline"/>').attr("id", conf.maskId + 'OBS');
                $("body").append(outlineBS);
            }

            if (!outlineRS.length) {
                outlineRS = $('<div class="wceoutline"/>').attr("id", conf.maskId + 'ORS');
                $("body").append(outlineRS);
            }

// set position and dimensions          
            var size = viewport();

            $('.wcemasks, .wceoutline').css({position:'absolute', top: 0, left: 0, width: 0, height: 0, display: 'none', backgroundColor: conf.color,  opacity: conf.startOpacity, zIndex: conf.zIndex});
            
            masks = $('.wcemasks');
            outlines = $('.wceoutline').css({'backgroundColor':'#FFF','opacity':'1','width':'2','height':'2'});
            
            if (conf.color) {
                mask.css("backgroundColor", conf.color);    
            }           
            
            // onBeforeLoad
            if (call(conf.onBeforeLoad) === false) {
                return this;
            }
            
            // esc button
            if (conf.closeOnEsc) {                      
                $(document).on("keydown.mask", function(e) {                            
                    if (e.keyCode == 27) {
                        a.mask.close('esc');
                    } else if (e.keyCode == 13) {
                       a.mask.fit(); 
                    } else {
                       a.mask.fit(); 
                    }    
                });         
            }
            
            // mask click closes

            if (hasTouch) {
            tappable('.wcemasks', {
                onTap: function(e, target){
                    // e.target works too
                       a.mask.close(e); 
                    }
            });

            } else {
            $('body').on("click", ".wcemasks", function(e)  {
                    a.mask.close(e);        
            });                 
  
            }
            
            // resize mask when window is resized
            $(window).on("resize.mask", function() {
                a.mask.fit();
            });

            $(window).on("orientationchange", function() {
                        setTimeout(function(){
                        a.mask.fit();
                    }, 300);
            });
            
            // exposed elements



            if (els && els.length) {
                

                overlayIndex = els.eq(0).css("zIndex");

                // make sure element is positioned absolutely or relatively
                a.each(els, function() {
                    var el = $(this);
                    if (!/relative|absolute|fixed/i.test(el.css("position"))) {
                        el.css("position", "relative");     
                    }                   

                    var size = viewport(); 
                    var box = webC.helper.getElementBox(el[0]);

                    element = el[0];
                                   
                    var top = box.top;
                    var left = box.left;
                    var height = box.height;
                    var width = box.width;
                    var spaceTB = 5; // space around element box
                    var spaceLR = 5; // space around element box
                    var shadow = 3; // shadow size around element box

                    // dimout
                    maskL.css({           
                    opacity: conf.opacity,   
                    top: top - spaceTB,
                    width: left - spaceLR,
                    height: height + spaceLR + spaceLR
                    });
             
                    maskT.css({   
                    opacity: conf.opacity,   
                    width: size[0] - spaceLR,
                    height: top - spaceTB
                    });

                    maskR.css({   
                    opacity: conf.opacity,   
                    top: top  - spaceTB,                    
                    left: left + width + spaceLR, 
                    width: size[0] - left - width - spaceLR - spaceLR,
                    height: height + spaceLR + spaceLR
                    });

                    maskB.css({   
                    opacity: conf.opacity,   
                    top: top + height + spaceTB, 
                    width: size[0] - spaceLR,
                    height: size[1] - height - top - spaceTB
                    });

                    // outline shadow
                    outlineBS.css({
                    backgroundColor: '#000',
                    opacity: .4,   
                    height: shadow,
                    left: left - spaceLR,  
                    top: top + height + spaceTB + 2, 
                    width: width + spaceLR + spaceLR + 2
                    });

                    outlineRS.css({
                    borderTopRightRadius: 5, 
                    borderBottomRightRadius: 5,     
                    backgroundColor: '#000',
                    opacity: .4,
                    width: shadow,
                    top: top  - spaceTB - shadow,                    
                    left: left + width + spaceLR + 2, 
                    height: height + spaceTB + spaceTB + 2 + shadow + shadow
                    });

                    outlineTS.css({
                    backgroundColor: '#000',
                    opacity: .4,   
                    height: shadow,
                    left: left - spaceLR,                  
                    top: top - spaceTB - shadow,
                    width: width + spaceLR + spaceLR + 2
                    });


                    outlineLS.css({
                    borderTopLeftRadius: 5, 
                    borderBottomLeftRadius: 5,     
                    backgroundColor: '#000',
                    opacity: .4,   
                    width: shadow,
                    left: left - spaceLR - shadow,                  
                    top: top - spaceTB - shadow,
                    height: height + spaceTB + spaceTB + shadow + shadow + 2
                    });

                });

                // make elements sit on top of the mask
                //exposed = els.css({ zIndex: Math.max(conf.zIndex + 1, overlayIndex == 'auto' ? 0 : overlayIndex)});         
            }   

            // reveal mask
            //$('.wcemasks').fadeIn();
            outlines.fadeIn();
            masks.fadeIn(function() {
                //a.mask.fit(); 
                call(conf.onLoad);
                loaded = "full";
            });
            
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
                    var size = viewport();              
                    var element = $('#wcurrect012220')[0];
                    var box = webC.helper.getElementBox(element);
                    // if (d == 'inline') alert('inline');
                    var top = box.top;
                    var left = box.left;
                    var height = box.height;
                    var width = box.width;
                    var spaceTB = 5; // space around element box
                    var spaceLR = 5; // space around element box
                    var shadow = 3; // shadow size around element box

                    maskL.css({              
                    top: top - spaceTB,
                    width: left - spaceLR,
                    height: height + spaceLR + spaceLR
                    });
             
                    maskT.css({   
                    width: size[0] - spaceLR,
                    height: top - spaceTB
                    });

                    maskR.css({   
                    top: top  - spaceTB,                    
                    left: left + width + spaceLR, 
                    width: size[0] - left - width - spaceLR - spaceLR,
                    height: height + spaceLR + spaceLR
                    });

                    maskB.css({   
                    top: top + height + spaceTB, 
                    width: size[0] - spaceLR,
                    height: size[1] - height - top - spaceTB
                    });

                    // outline shadow
                    outlineBS.css({
                    backgroundColor: '#000',
                    opacity: .4,   
                    height: shadow,
                    left: left - spaceLR,  
                    top: top + height + spaceTB + 2, 
                    width: width + spaceLR + spaceLR + 2
                    });

                    outlineRS.css({
                    borderTopRightRadius: 5, 
                    borderBottomRightRadius: 5,     
                    backgroundColor: '#000',
                    opacity: .4,
                    width: shadow,
                    top: top  - spaceTB - shadow,                    
                    left: left + width + spaceLR + 2, 
                    height: height + spaceTB + spaceTB + 2 + shadow + shadow
                    });

                    outlineTS.css({
                    backgroundColor: '#000',
                    opacity: .4,   
                    height: shadow,
                    left: left - spaceLR,                  
                    top: top - spaceTB - shadow,
                    width: width + spaceLR + spaceLR + 2
                    });


                    outlineLS.css({
                    borderTopLeftRadius: 5, 
                    borderBottomLeftRadius: 5,     
                    backgroundColor: '#000',
                    opacity: .4,   
                    width: shadow,
                    left: left - spaceLR - shadow,                  
                    top: top - spaceTB - shadow,
                    height: height + spaceTB + spaceTB + shadow + shadow + 2
                    });
            }               
        },
        
        getMask: function() {
            return mask;    
        },
        
        isLoaded: function(fully) {
            return fully ? loaded == 'full' : loaded;   
        }, 
        
        getConf: function() {
            return config;  
        },
        
        getExposed: function() {
            return exposed; 
        }       
    };
    
    a.fn.mask = function(conf) {
        a.mask.load(conf);
        return this;        
    };          
    
    a.fn.expose = function(conf) {
        a.mask.load(conf, this);
        return this;            
    };

})($);