(function (f) {
    f.fn.drag = function (k, e, j) {
        var i = typeof k == "string" ? k : "",
            h = $.isFunction(k) ? k : $.isFunction(e) ? e : null;
        if (i.indexOf("drag") !== 0) {
            i = "drag" + i
        }
        j = (k == h ? e : j) || {};
        return h ? this.bind(i, j, h) : this.trigger(i)
    };
    var b = $.event,
        a = b.special,
        d = a.drag = {
            defaults: {
                which: 1,
                distance: 5,
                not: ".editNoDrag",
                handle: null,
                relative: false,
                drop: true,
                click: false
            },
            datakey: "dragdata",
            noBubble: true,
            add: function (i) {
                var h = $.data(this, d.datakey),
                    e = i.data || {};
                h.related += 1;
                $.each(d.defaults, function (j, k) {
                    if (e[j] !== undefined) {
                        h[j] = e[j]
                    }
                })
            },
            remove: function () {
                $.data(this, d.datakey).related -= 1
            },
            setup: function () {
                if ($.data(this, d.datakey)) {
                    return
                }
                var e = $.extend({
                    related: 0
                }, d.defaults);
                $.data(this, d.datakey, e);
                b.add(this, "touchstart mousedown pointerdown", d.init, e);
                if (this.attachEvent) {
                    this.attachEvent("ondragstart", d.dontstart)
                }
            },
            teardown: function () {
                var e = $.data(this, d.datakey) || {};
                if (e.related) {
                    return
                }
                $.removeData(this, d.datakey);
                b.remove(this, "touchstart mousedown pointerdown", d.init);
                d.textselect(true);
                if (this.detachEvent) {
                    this.detachEvent("ondragstart", d.dontstart)
                }
            },
            init: function (i) {
                console.log(e)
                if (d.touched) {
                    return
                }
                var e = i.data,
                    h;
                if (i.which != 0 && e.which > 0 && i.which != e.which) {
                    return
                }
                if ($(i.target).is(e.not)) {
                    return
                }
                if (e.handle && !$(i.target).closest(e.handle, i.currentTarget).length) {
                    return
                }
                d.touched = (i.type == 'touchstart' || i.type == 'pointerdown') ? this : null;
                d.touchedpointer = i.type == 'pointerdown';
                e.propagates = 1;
                e.mousedown = this;
                e.interactions = [d.interaction(this, e)];
                e.target = i.target;
                e.pageX = i.pageX;
                e.pageY = i.pageY;
                e.dragging = null;
                h = d.hijack(i, "draginit", e);
                if (!e.propagates) {
                    return
                }
                h = d.flatten(h);
                if (h && h.length) {
                    e.interactions = [];
                    $.each(h, function () {
                        e.interactions.push(d.interaction(this, e))
                    })
                }
                e.propagates = e.interactions.length;
                if (e.drop !== false && a.drop) {
                    a.drop.handler(i, e)
                }
                d.textselect(false);
               if ( d.touchedpointer ) {
                  b.add( document, "pointermove pointerup pointercancel", d.handler, e);
               } else if (d.touched) {
                  b.add(d.touched, "touchmove touchend", d.handler, e);
               } else {
                  b.add(document, "mousemove mouseup", d.handler, e)
                }  if (!d.touched || e.live) {
                              return false
                }
            },
            interaction: function (h, e) {
                var i = $(h)[e.relative ? "position" : "offset"]() || {
                    top: 0,
                    left: 0
                };
                return {
                    drag: h,
                    callback: new d.callback(),
                    droppable: [],
                    offset: i
                }
            },
            handler: function (h) {
                var e = h.data;
                switch (h.type) {
                case !e.dragging && "touchmove":
                case !e.dragging && "pointermove":
                    h.preventDefault();
                case !e.dragging && "mousemove":
                    if (Math.pow(h.pageX - e.pageX, 2) + Math.pow(h.pageY - e.pageY, 2) < Math.pow(e.distance, 2)) {
                        break
                    }
                    h.target = e.target;
                    d.hijack(h, "dragstart", e);
                    if (e.propagates) {
                        e.dragging = true
                    }
                case "touchmove":
                case "pointermove":
                    h.preventDefault();
                case "mousemove":
                    if (e.dragging) {
                        d.hijack(h, "drag", e);
                        if (e.propagates) {
                            if (e.drop !== false && a.drop) {
                                a.drop.handler(h, e)
                            }
                            break
                        }
                        h.type = "mouseup"
                    }
                case "pointercancel":
                case "pointerup":                
                case "touchend":
                case "mouseup":
                default:

        if ( d.touchedpointer ) {
            b.remove( document, "pointermove pointerup pointercancel", d.handler ); // remove touch events
          } else if ( d.touched && !d.touchedpointer ) {
            b.remove( d.touched, "touchmove touchend", d.handler ); // remove touch events
         } else {
            b.remove( document, "mousemove mouseup", d.handler ); // remove page events 
         } if (e.dragging) {
                        if (e.drop !== false && a.drop) {
                            a.drop.handler(h, e)
                        }
                        d.hijack(h, "dragend", e)
                    }
                    d.textselect(true);
                    if (e.click === false && e.dragging) {
                        $.data(e.mousedown, "suppress.click", new Date().getTime() + 5)
                    }
                    e.dragging = d.touched = d.touchedpointer = false; // deactivate element
                    break
                }
            },
            hijack: function (h, o, r, p, k) {
                if (!r) {
                    return
                }
                var q = {
                        event: h.originalEvent,
                        type: h.type
                    },
                    m = o.indexOf("drop") ? "drag" : "drop",
                    t, l = p || 0,
                    j, e, s, n = !isNaN(p) ? p : r.interactions.length;
                h.type = o;
                h.originalEvent = null;
                r.results = [];
                do {
                    if (j = r.interactions[l]) {
                        if (o !== "dragend" && j.cancelled) {
                            continue
                        }
                        s = d.properties(h, r, j);
                        j.results = [];
                        $(k || j[m] || r.droppable).each(function (u, i) {
                            s.target = i;
                            h.isPropagationStopped = function () {
                                return false
                            };
                            t = i ? b.dispatch.call(i, h, s) : null;
                            if (t === false) {
                                if (m == "drag") {
                                    j.cancelled = true;
                                    r.propagates -= 1
                                }
                                if (o == "drop") {
                                    j[m][u] = null
                                }
                            } else {
                                if (o == "dropinit") {
                                    j.droppable.push(d.element(t) || i)
                                }
                            } if (o == "dragstart") {
                                j.proxy = $(d.element(t) || j.drag)[0]
                            }
                            j.results.push(t);
                            delete h.result;
                            if (o !== "dropinit") {
                                return t
                            }
                        });
                        r.results[l] = d.flatten(j.results);
                        if (o == "dropinit") {
                            j.droppable = d.flatten(j.droppable)
                        }
                        if (o == "dragstart" && !j.cancelled) {
                            s.update()
                        }
                    }
                } while (++l < n);
                h.type = q.type;
                h.originalEvent = q.event;
                return d.flatten(r.results)
            },
            properties: function (i, e, h) {
                var j = h.callback;
                j.drag = h.drag;
                j.proxy = h.proxy || h.drag;
                j.startX = e.pageX;
                j.startY = e.pageY;
                j.deltaX = i.pageX - e.pageX;
                j.deltaY = i.pageY - e.pageY;
                j.originalX = h.offset.left;
                j.originalY = h.offset.top;
                j.offsetX = j.originalX + j.deltaX;
                j.offsetY = j.originalY + j.deltaY;
                j.drop = d.flatten((h.drop || []).slice());
                j.available = d.flatten((h.droppable || []).slice());
                return j
            },
            element: function (e) {
                if (e && (e.jquery || e.nodeType == 1)) {
                    return e
                }
            },
            flatten: function (e) {
                return $.map(e, function (h) {
                    return h && h.jquery ? $.makeArray(h) : h && h.length ? d.flatten(h) : h
                })
            },
            textselect: function (e) {
                $(document)[e ? "unbind" : "bind"]("selectstart", d.dontstart).css("MozUserSelect", e ? "" : "none");
                document.unselectable = e ? "off" : "on"
            },
            dontstart: function () {
                return false
            },
            callback: function () {}
        };
    d.callback.prototype = {
        update: function () {
            if (a.drop && this.available.length) {
                $.each(this.available, function (e) {
                    a.drop.locate(this, e)
                })
            }
        }
    };
    var g = b.dispatch;
    b.dispatch = function (e) {
        if ($.data(this, "suppress." + e.type) - new Date().getTime() > 0) {
            $.removeData(this, "suppress." + e.type);
            return
        }
        return g.apply(this, arguments)
    };
    var pointerHooks = b.fixHooks.pointermove = b.fixHooks.pointerup = b.fixHooks.pointerdown = {
      props: "clientX clientY pageX pageY screenX screenY".split( " " ),
      filter: function( event, orig ) {
        if ( orig ){
          $.each( pointerHooks.props, function( i, prop ){
            event[ prop ] = orig[ prop ];
          });
        }
        return event;
      }
    };
    var c = b.fixHooks.touchstart = b.fixHooks.touchmove = b.fixHooks.touchend = b.fixHooks.touchcancel = {
        props: "clientX clientY pageX pageY screenX screenY".split(" "),
        filter: function (h, i) {
            if (i) {
                var e = (i.touches && i.touches[0]) || (i.changedTouches && i.changedTouches[0]) || null;
                if (e) {
                    $.each(c.props, function (j, k) {
                        h[k] = e[k]
                    })
                }
            }
            return h
        }
    };
    a.draginit = a.dragstart = a.dragend = d
})($);
