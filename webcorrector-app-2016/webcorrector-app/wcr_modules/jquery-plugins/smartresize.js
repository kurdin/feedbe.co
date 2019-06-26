// smart resize
(function(e,t){var n=function(e,t,n){var r;return function(){function u(){if(!n)e.apply(s,o);r=null}var s=this,o=arguments;if(r)clearTimeout(r);else if(n)e.apply(s,o);r=setTimeout(u,t||400)}};e.fn[t]=function(e){return e?this.on("resize",n(e)):this.trigger(t)}})($,"smartresize");
