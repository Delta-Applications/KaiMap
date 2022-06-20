! function (t) {
    "function" == typeof define && define.amd ? define(t) : t()
}((function () {
    "use strict";
    const t = L.extend({}, L.DomUtil);
    L.extend(L.DomUtil, {
        setTransform: function (o, e, i, n, a) {
            var s = e || new L.Point(0, 0);
            if (!n) return e = s._round(), t.setTransform.call(this, o, e, i);
            s = s.rotateFrom(n, a), o.style[L.DomUtil.TRANSFORM] = "translate3d(" + s.x + "px," + s.y + "px,0)" + (i ? " scale(" + i + ")" : "") + " rotate(" + n + "rad)"
        },
        setPosition: function (o, e, i, n) {
            if (!i) return t.setPosition.call(this, o, e);
            o._leaflet_pos = e, L.Browser.any3d ? L.DomUtil.setTransform(o, e, void 0, i, n) : (o.style.left = e.x + "px", o.style.top = e.y + "px")
        },
        DEG_TO_RAD: Math.PI / 180,
        RAD_TO_DEG: 180 / Math.PI
    }), L.Draggable.include({
        updateMapBearing: function (t) {
            this._mapBearing = t
        }
    }), L.extend(L.Point.prototype, {
        rotate: function (t) {
            if (!t) return this;
            var o = Math.sin(t),
                e = Math.cos(t);
            return new L.Point(this.x * e - this.y * o, this.x * o + this.y * e)
        },
        rotateFrom: function (t, o) {
            if (!t) return this;
            var e = Math.sin(t),
                i = Math.cos(t),
                n = o.x,
                a = o.y,
                s = this.x - n,
                r = this.y - a;
            return new L.Point(s * i - r * e + n, s * e + r * i + a)
        }
    });
    const o = L.extend({}, L.DivOverlay.prototype);
    L.DivOverlay.include({
        getEvents: function () {
            return L.extend(o.getEvents.call(this), {
                rotate: this._updatePosition
            })
        },
        _updatePosition: function () {
            if (this._map) {
                var t = this._map.latLngToLayerPoint(this._latlng),
                    o = L.point(this.options.offset),
                    e = this._getAnchor();
                this._zoomAnimated ? (this._map._rotate && (t = this._map.rotatedPointToMapPanePoint(t)), L.DomUtil.setPosition(this._container, t.add(e))) : o = o.add(t).add(e);
                var i = this._containerBottom = -o.y,
                    n = this._containerLeft = -Math.round(this._containerWidth / 2) + o.x;
                this._container.style.bottom = i + "px", this._container.style.left = n + "px"
            }
        }
    });
    const e = L.extend({}, L.Popup.prototype);
    L.Popup.include({
        _animateZoom: function (t) {
            this._map._rotate || e._animateZoom.call(this, t);
            var o = this._map._latLngToNewLayerPoint(this._latlng, t.zoom, t.center),
                i = this._getAnchor();
            o = this._map.rotatedPointToMapPanePoint(o), L.DomUtil.setPosition(this._container, o.add(i))
        },
        _adjustPan: function () {
            if (!(!this.options.autoPan || this._map._panAnim && this._map._panAnim._inProgress)) {
                var t = this._map,
                    o = parseInt(L.DomUtil.getStyle(this._container, "marginBottom"), 10) || 0,
                    e = this._container.offsetHeight + o,
                    i = this._containerWidth,
                    n = new L.Point(this._containerLeft, -e - this._containerBottom);
                n._add(L.DomUtil.getPosition(this._container));
                var a = n._add(this._map._getMapPanePos()),
                    s = L.point(this.options.autoPanPadding),
                    r = L.point(this.options.autoPanPaddingTopLeft || s),
                    h = L.point(this.options.autoPanPaddingBottomRight || s),
                    _ = t.getSize(),
                    l = 0,
                    c = 0;
                a.x + i + h.x > _.x && (l = a.x + i - _.x + h.x), a.x - l - r.x < 0 && (l = a.x - r.x), a.y + e + h.y > _.y && (c = a.y + e - _.y + h.y), a.y - c - r.y < 0 && (c = a.y - r.y), (l || c) && t.fire("autopanstart").panBy([l, c])
            }
        }
    });
    const i = L.extend({}, L.Tooltip.prototype);
    L.Tooltip.include({
        _updatePosition: function () {
            if (!this._map._rotate) return i._updatePosition.call(this);
            var t = this._map.latLngToLayerPoint(this._latlng);
            t = this._map.rotatedPointToMapPanePoint(t), this._setPosition(t)
        },
        _animateZoom: function (t) {
            if (!this._map._rotate) return i._animateZoom.call(this, t);
            var o = this._map._latLngToNewLayerPoint(this._latlng, t.zoom, t.center);
            o = this._map.rotatedPointToMapPanePoint(o), this._setPosition(o)
        }
    });
    L.extend({}, L.Icon.prototype);
    var n;
    L.Icon.include({
        _setIconStyles: function (t, o) {
            var e = this.options,
                i = e[o + "Size"];
            "number" == typeof i && (i = [i, i]);
            var n = L.point(i),
                a = L.point("shadow" === o && e.shadowAnchor || e.iconAnchor || n && n.divideBy(2, !0));
            t.className = "leaflet-marker-" + o + " " + (e.className || ""), a && (t.style.marginLeft = -a.x + "px", t.style.marginTop = -a.y + "px", t.style[L.DomUtil.TRANSFORM + "Origin"] = a.x + "px " + a.y + "px 0px"), n && (t.style.width = n.x + "px", t.style.height = n.y + "px")
        }
    });
    var a = {
        _onDragStart: function () {
            if (!this._marker._map._rotate) return n._onDragStart.call(this);
            this._draggable.updateMapBearing(this._marker._map._bearing)
        },
        _onDrag: function (t) {
            var o = this._marker,
                e = o.options.rotation || o.options.rotateWithView,
                i = o._shadow,
                n = L.DomUtil.getPosition(o._icon);
            !e && i && L.DomUtil.setPosition(i, n), o._map._rotate && (n = o._map.mapPanePointToRotatedPoint(n));
            var a = o._map.layerPointToLatLng(n);
            o._latlng = a, t.latlng = a, t.oldLatLng = this._oldLatLng, e ? o.setLatLng(a) : o.fire("move", t), o.fire("drag", t)
        },
        _onDragEnd: function (t) {
            this._marker._map._rotate && this._marker.update(), n._onDragEnd.call(this, t)
        }
    };
    const s = L.extend({}, L.Marker.prototype);
    L.Marker.mergeOptions({
        rotation: 0,
        rotateWithView: !1
    }), L.Marker.include({
        getEvents: function () {
            return L.extend(s.getEvents.call(this), {
                rotate: this.update
            })
        },
        onAdd: function (t) {
            s.onAdd.call(this, t), t.on("rotate", this.update, this)
        },
        _initInteraction: function () {
            var t = s._initInteraction.call(this);
            return this.dragging && this.dragging.enabled() && this._map && this._map._rotate && (n = n || Object.getPrototypeOf(this.dragging), this.dragging._onDragStart = a._onDragStart.bind(this.dragging), this.dragging._onDrag = a._onDrag.bind(this.dragging), this.dragging._onDragEnd = a._onDragEnd.bind(this.dragging), this.dragging.disable(), this.dragging.enable()), t
        },
        _setPos: function (t) {
            this._map._rotate && (t = this._map.rotatedPointToMapPanePoint(t));
            var o = this.options.rotation || 0;
            this.options.rotateWithView && (o += this._map._bearing), L.DomUtil.setPosition(this._icon, t, o, t), this._shadow && L.DomUtil.setPosition(this._shadow, t, o, t), this._zIndex = t.y + this.options.zIndexOffset, this._resetZIndex()
        },
        _updateZIndex: function (t) {
            if (!this._map._rotate) return s._updateZIndex.call(this, t);
            this._icon.style.zIndex = Math.round(this._zIndex + t)
        },
        setRotation: function (t) {
            this.options.rotation = t, this.update()
        }
    });
    const r = L.extend({}, L.GridLayer.prototype);
    L.GridLayer.include({
        getEvents: function () {
            var t = r.getEvents.call(this);
            return this._map._rotate && !this.options.updateWhenIdle && (this._onRotate || (this._onRotate = L.Util.throttle(this._onMoveEnd, this.options.updateInterval, this)), t.rotate = this._onRotate), t
        },
        _getTiledPixelBounds: function (t) {
            if (!this._map._rotate) return r._getTiledPixelBounds.call(this, t);
            var o = this._map,
                e = o._animatingZoom ? Math.max(o._animateToZoom, o.getZoom()) : o.getZoom(),
                i = o.getZoomScale(e, this._tileZoom),
                n = o.project(t, this._tileZoom).floor(),
                a = o.getSize(),
                s = new L.Bounds([o.containerPointToLayerPoint([0, 0]).floor(), o.containerPointToLayerPoint([a.x, 0]).floor(), o.containerPointToLayerPoint([0, a.y]).floor(), o.containerPointToLayerPoint([a.x, a.y]).floor()]).getSize().divideBy(2 * i);
            return new L.Bounds(n.subtract(s), n.add(s))
        }
    });
    const h = L.extend({}, L.Canvas.prototype);
    L.Canvas.include({
        onAdd: function () {
            h.onAdd.call(this), this._map.on("rotate", this._redraw, this)
        },
        onRemove: function () {
            h.onRemove.call(this), this._map.off("rotate", this._redraw, this)
        },
        _update: function () {
            h._update.call(this), this.fire("update")
        }
    });
    const _ = L.extend({}, L.Renderer.prototype);
    L.Renderer.include({
        onAdd: function () {
            _.onAdd.call(this)
        },
        onRemove: function () {
            _.onRemove.call(this)
        },
        _updateTransform: function (t, o) {
            if (!this._map._rotate) return _._updateTransform.call(this, t, o);
            var e = this._map.getZoomScale(o, this._zoom),
                i = this._map._latLngToNewLayerPoint(this._topLeft, o, t);
            L.Browser.any3d ? L.DomUtil.setTransform(this._container, i, e) : L.DomUtil.setPosition(this._container, i)
        },
        _update: function () {
            if (!this._map._rotate) return _._update.call(this);
            var t = this.options.padding,
                o = this._map,
                e = this._map.getSize(),
                i = e.multiplyBy(-t),
                n = e.multiplyBy(1 + t),
                a = new L.Bounds([o.containerPointToLayerPoint([i.x, i.y]).floor(), o.containerPointToLayerPoint([i.x, n.y]).floor(), o.containerPointToLayerPoint([n.x, i.y]).floor(), o.containerPointToLayerPoint([n.x, n.y]).floor()]);
            this._bounds = a, this._topLeft = this._map.layerPointToLatLng(a.min), this._center = this._map.getCenter(), this._zoom = this._map.getZoom()
        }
    });
    const l = L.extend({}, L.SVG.prototype);
    L.SVG.include({
        _update: function () {
            l._update.call(this), this._map._rotate && this.fire("update")
        }
    });
    const c = L.extend({}, L.Map.prototype);
    L.Map.mergeOptions({
        rotate: !1,
        bearing: 0
    }), L.Map.include({
        initialize: function (t, o) {
            o.rotate && (this._rotate = !0, this._bearing = 0), c.initialize.call(this, t, o), this.options.rotate && this.setBearing(this.options.bearing)
        },
        containerPointToLayerPoint: function (t) {
            return this._rotate ? L.point(t).subtract(this._getMapPanePos()).rotateFrom(-this._bearing, this._getRotatePanePos()).subtract(this._getRotatePanePos()) : c.containerPointToLayerPoint.call(this, t)
        },
        getBounds: function () {
            if (!this._rotate) return c.getBounds.call(this);
            var t = this.getSize(),
                o = this.layerPointToLatLng(this.containerPointToLayerPoint([0, 0])),
                e = this.layerPointToLatLng(this.containerPointToLayerPoint([t.x, 0])),
                i = this.layerPointToLatLng(this.containerPointToLayerPoint([t.x, t.y])),
                n = this.layerPointToLatLng(this.containerPointToLayerPoint([0, t.y]));
            return new L.LatLngBounds([o, e, i, n])
        },
        layerPointToContainerPoint: function (t) {
            return this._rotate ? L.point(t).add(this._getRotatePanePos()).rotateFrom(this._bearing, this._getRotatePanePos()).add(this._getMapPanePos()) : c.layerPointToContainerPoint.call(this, t)
        },
        setBearing: function (t) {
            if (L.Browser.any3d && this._rotate) {
                var o = this._getRotatePanePos(),
                    e = this.getSize().divideBy(2);
                this._pivot = this._getMapPanePos().clone().multiplyBy(-1).add(e), o = o.rotateFrom(-this._bearing, this._pivot), this._bearing = t * L.DomUtil.DEG_TO_RAD, this._rotatePanePos = o.rotateFrom(this._bearing, this._pivot), L.DomUtil.setPosition(this._rotatePane, o, this._bearing, this._pivot), this.fire("rotate")
            }
        },
        getBearing: function () {
            return this._bearing * L.DomUtil.RAD_TO_DEG
        },
        _initPanes: function () {
            var t = this._panes = {};
            this._paneRenderers = {}, this._mapPane = this.createPane("mapPane", this._container), L.DomUtil.setPosition(this._mapPane, new L.Point(0, 0)), this._rotate ? (this._rotatePane = this.createPane("rotatePane", this._mapPane), this._norotatePane = this.createPane("norotatePane", this._mapPane), this.createPane("tilePane", this._rotatePane), this.createPane("overlayPane", this._rotatePane), this.createPane("shadowPane", this._norotatePane), this.createPane("markerPane", this._norotatePane), this.createPane("tooltipPane", this._norotatePane), this.createPane("popupPane", this._norotatePane)) : (this.createPane("tilePane"), this.createPane("overlayPane"), this.createPane("shadowPane"), this.createPane("markerPane"), this.createPane("tooltipPane"), this.createPane("popupPane")), this.options.markerZoomAnimation || (L.DomUtil.addClass(t.markerPane, "leaflet-zoom-hide"), L.DomUtil.addClass(t.shadowPane, "leaflet-zoom-hide"))
        },
        rotatedPointToMapPanePoint: function (t) {
            return L.point(t).rotate(this._bearing)._add(this._getRotatePanePos())
        },
        mapPanePointToRotatedPoint: function (t) {
            return L.point(t)._subtract(this._getRotatePanePos()).rotate(-this._bearing)
        },
        _getCenterOffset: function (t) {
            var o = c._getCenterOffset.call(this, t);
            return this._rotate && (o = o.rotate(this._bearing)), o
        },
        _getRotatePanePos: function () {
            return this._rotatePanePos || new L.Point(0, 0)
        },
        _getNewPixelOrigin: function (t, o) {
            var e = this.getSize()._divideBy(2);
            return this._rotate || c._getNewPixelOrigin.call(this, t, o), this.project(t, o).rotate(this._bearing)._subtract(e)._add(this._getMapPanePos())._add(this._getRotatePanePos()).rotate(-this._bearing)._round()
        },
        _handleGeolocationResponse: function (t) {
            var o = t.coords.latitude,
                e = t.coords.longitude,
                i = t.coords.heading,
                n = new L.LatLng(o, e),
                a = n.toBounds(t.coords.accuracy),
                s = this._locateOptions;
            if (s.setView) {
                var r = this.getBoundsZoom(a);
                this.setView(n, s.maxZoom ? Math.min(r, s.maxZoom) : r)
            }
            var h = {
                latlng: n,
                bounds: a,
                timestamp: t.timestamp,
                heading: i
            };
            for (var _ in t.coords) "number" == typeof t.coords[_] && (h[_] = t.coords[_]);
            this.fire("locationfound", h)
        }
    }), L.Map.CompassBearing = L.Handler.extend({
        initialize: function (t) {
            window.DeviceOrientationEvent ? (this._capable = !0, this._map = t, this._throttled = L.Util.throttle(this._onDeviceOrientation, 1e3, this)) : this._capable = !1
        },
        addHooks: function () {
            this._capable && this._map._rotate && L.DomEvent.on(window, "deviceorientation", this._throttled, this)
        },
        removeHooks: function () {
            this._capable && this._map._rotate && L.DomEvent.off(window, "deviceorientation", this._throttled, this)
        },
        _onDeviceOrientation: function (t) {
            null !== t.alpha && this._map.setBearing(t.alpha - window.orientation)
        }
    }), L.Map.addInitHook("addHandler", "compassBearing", L.Map.CompassBearing), L.Map.mergeOptions({
        trackContainerMutation: !1
    }), L.Map.ContainerMutation = L.Handler.extend({
        addHooks: function () {
            L.Browser.mutation && (this._observer || (this._observer = new MutationObserver(L.Util.bind(this._onMutation, this))), this._observer.observe(this._map.getContainer(), {
                childList: !1,
                attributes: !0,
                characterData: !1,
                subtree: !1,
                attributeFilter: ["style"]
            }))
        },
        removeHooks: function () {
            L.Browser.mutation && this._observer.disconnect()
        },
        _onMutation: function () {
            this._map.invalidateSize()
        }
    }), L.Map.addInitHook("addHandler", "trackContainerMutation", L.Map.ContainerMutation), L.Map.mergeOptions({
        bounceAtZoomLimits: !0
    }), L.Map.TouchGestures = L.Handler.extend({
        initialize: function (t) {
            this._map = t, this.rotate = !!this._map.options.touchRotate, this.zoom = !!this._map.options.touchZoom
        },
        addHooks: function () {
            L.DomEvent.on(this._map._container, "touchstart", this._onTouchStart, this)
        },
        removeHooks: function () {
            L.DomEvent.off(this._map._container, "touchstart", this._onTouchStart, this)
        },
        _onTouchStart: function (t) {
            var o = this._map;
            if (t.touches && 2 === t.touches.length && !o._animatingZoom && !this._zooming && !this._rotating) {
                var e = o.mouseEventToContainerPoint(t.touches[0]),
                    i = o.mouseEventToContainerPoint(t.touches[1]),
                    n = e.subtract(i);
                this._centerPoint = o.getSize()._divideBy(2), this._startLatLng = o.containerPointToLatLng(this._centerPoint), this.zoom ? ("center" !== o.options.touchZoom && (this._pinchStartLatLng = o.containerPointToLatLng(e.add(i)._divideBy(2))), this._startDist = e.distanceTo(i), this._startZoom = o.getZoom(), this._zooming = !0) : this._zooming = !1, this.rotate ? (this._startTheta = Math.atan(n.x / n.y), this._startBearing = o.getBearing(), n.y < 0 && (this._startBearing += 180), this._rotating = !0) : this._rotating = !1, this._moved = !1, o.stop(), L.DomEvent.on(document, "touchmove", this._onTouchMove, this).on(document, "touchend", this._onTouchEnd, this), L.DomEvent.preventDefault(t)
            }
        },
        _onTouchMove: function (t) {
            if (t.touches && 2 === t.touches.length && (this._zooming || this._rotating)) {
                var o, e = this._map,
                    i = e.mouseEventToContainerPoint(t.touches[0]),
                    n = e.mouseEventToContainerPoint(t.touches[1]),
                    a = i.subtract(n),
                    s = i.distanceTo(n) / this._startDist;
                if (this._rotating) {
                    var r = (Math.atan(a.x / a.y) - this._startTheta) * L.DomUtil.RAD_TO_DEG;
                    a.y < 0 && (r += 180), r && e.setBearing(this._startBearing - r)
                }
                if (this._zooming)
                    if (this._zoom = e.getScaleZoom(s, this._startZoom), !e.options.bounceAtZoomLimits && (this._zoom < e.getMinZoom() && s < 1 || this._zoom > e.getMaxZoom() && s > 1) && (this._zoom = e._limitZoom(this._zoom)), "center" === e.options.touchZoom) {
                        if (this._center = this._startLatLng, 1 === s) return
                    } else {
                        if (o = i._add(n)._divideBy(2)._subtract(this._centerPoint), 1 === s && 0 === o.x && 0 === o.y) return;
                        var h = -e.getBearing() * L.DomUtil.DEG_TO_RAD;
                        this._center = e.unproject(e.project(this._pinchStartLatLng).subtract(o.rotate(h)))
                    } this._moved || (e._moveStart(!0), this._moved = !0), L.Util.cancelAnimFrame(this._animRequest);
                var _ = L.bind(e._move, e, this._center, this._zoom, {
                    pinch: !0,
                    round: !1
                });
                this._animRequest = L.Util.requestAnimFrame(_, this, !0), L.DomEvent.preventDefault(t)
            }
        },
        _onTouchEnd: function () {
            this._moved && this._zooming ? (this._zooming = !1, this._rotating = !1, L.Util.cancelAnimFrame(this._animRequest), L.DomEvent.off(document, "touchmove", this._onTouchMove).off(document, "touchend", this._onTouchEnd), this.zoom && (this._map.options.zoomAnimation ? this._map._animateZoom(this._center, this._map._limitZoom(this._zoom), !0, this._map.options.snapZoom) : this._map._resetView(this._center, this._map._limitZoom(this._zoom)))) : this._zooming = !1
        }
    }), L.Map.addInitHook("addHandler", "touchGestures", L.Map.TouchGestures), L.Map.mergeOptions({
        touchRotate: !1
    }), L.Map.TouchRotate = L.Handler.extend({
        addHooks: function () {
            this._map.touchGestures.enable(), this._map.touchGestures.rotate = !0
        },
        removeHooks: function () {
            this._map.touchGestures.rotate = !1
        }
    }), L.Map.addInitHook("addHandler", "touchRotate", L.Map.TouchRotate), L.Map.mergeOptions({
        shiftKeyRotate: !0
    }), L.Map.ShiftKeyRotate = L.Handler.extend({
        addHooks: function () {
            L.DomEvent.on(this._map._container, "wheel", this._handleShiftScroll, this), this._map.shiftKeyRotate.rotate = !0
        },
        removeHooks: function () {
            L.DomEvent.off(this._map._container, "wheel", this._handleShiftScroll, this), this._map.shiftKeyRotate.rotate = !1
        },
        _handleShiftScroll: function (t) {
            t.shiftKey ? (t.preventDefault(), this._map.scrollWheelZoom.disable(), this._map.setBearing(this._map._bearing * L.DomUtil.RAD_TO_DEG + 5 * Math.sign(t.deltaY))) : this._map.scrollWheelZoom.enable()
        }
    }), L.Map.addInitHook("addHandler", "shiftKeyRotate", L.Map.ShiftKeyRotate), L.Map.addInitHook((function () {
        this.scrollWheelZoom.enabled() && this.shiftKeyRotate.enabled() && (this.scrollWheelZoom.disable(), this.scrollWheelZoom.enable())
    })), L.Map.mergeOptions({
        touchZoom: L.Browser.touch && !L.Browser.android23,
        bounceAtZoomLimits: !1
    }), L.Map.TouchZoom = L.Handler.extend({
        addHooks: function () {
            L.DomUtil.addClass(this._map._container, "leaflet-touch-zoom"), this._map.touchGestures.enable(), this._map.touchGestures.zoom = !0
        },
        removeHooks: function () {
            L.DomUtil.removeClass(this._map._container, "leaflet-touch-zoom"), this._map.touchGestures.zoom = !1
        }
    }), L.Map.addInitHook("addHandler", "touchZoom", L.Map.TouchZoom), L.Control.Rotate = L.Control.extend({
        options: {
            position: "topleft",
            closeOnZeroBearing: !0
        },
        onAdd: function (t) {
            this._onDeviceOrientation = L.Util.throttle(this._unthrottledOnDeviceOrientation, 100, this);
            var o = this._container = L.DomUtil.create("div", "leaflet-control-rotate leaflet-bar"),
                e = this._arrow = L.DomUtil.create("span", "leaflet-control-rotate-arrow");
            e.style.backgroundImage = "url(\"data:image/svg+xml;charset=utf-8,%3Csvg width='29' height='29' viewBox='0 0 29 29' xmlns='http://www.w3.org/2000/svg' fill='%23333'%3E%3Cpath d='M10.5 14l4-8 4 8h-8z'/%3E%3Cpath d='M10.5 16l4 8 4-8h-8z' fill='%23ccc'/%3E%3C/svg%3E\")", e.style.cursor = "grab", e.style.display = "block", e.style.width = "100%", e.style.height = "100%", e.style.backgroundRepeat = "no-repeat", e.style.backgroundPosition = "50%";
            var i = this._link = L.DomUtil.create("a", "leaflet-control-rotate-toggle", o);
            return i.appendChild(e), i.href = "#", i.title = "Rotate map", L.DomEvent.on(i, "dblclick", L.DomEvent.stopPropagation).on(i, "mousedown", this._handleMouseDown, this).on(i, "click", L.DomEvent.stop).on(i, "click", this._cycleState, this).on(i, "click", this._refocusOnMap, this), L.Browser.any3d || L.DomUtil.addClass(i, "leaflet-disabled"), this._restyle(), t.on("rotate", this._restyle.bind(this)), this._follow = !1, this._canFollow = !1, this.options.closeOnZeroBearing && 0 === t.getBearing() && (o.style.display = "none"), o
        },
        _handleMouseDown: function (t) {
            L.DomEvent.stopPropagation(t), this.dragging = !0, this.dragstartX = t.pageX, this.dragstartY = t.pageY, L.DomEvent.on(document, "mousemove", this._handleMouseDrag, this).on(document, "mouseup", this._handleMouseUp, this)
        },
        _handleMouseUp: function (t) {
            L.DomEvent.stopPropagation(t), this.dragging = !1, L.DomEvent.off(document, "mousemove", this._handleMouseDrag, this).off(document, "mouseup", this._handleMouseUp, this)
        },
        _handleMouseDrag: function (t) {
            if (this.dragging) {
                var o = t.clientX - this.dragstartX;
                this._map.setBearing(o)
            }
        },
        _cycleState: function (t) {
            var o = this._map;
            o && (o.touchRotate.enabled() || o.compassBearing.enabled() ? o.compassBearing.enabled() ? (o.compassBearing.disable(), o.setBearing(0), this.options.closeOnZeroBearing && o.touchRotate.enable()) : (o.touchRotate.disable(), o.compassBearing.enable()) : o.touchRotate.enable(), this._restyle())
        },
        _restyle: function () {
            if (this._map.options.rotate) {
                var t = this._map,
                    o = t.getBearing();
                this.options.closeOnZeroBearing && o && (this._container.style.display = "block");
                var e = "rotate(" + o + "deg)";
                this._arrow.style.transform = e, t.compassBearing.enabled() ? this._link.style.backgroundColor = "orange" : t.touchRotate.enabled() ? this._link.style.backgroundColor = null : (this._link.style.backgroundColor = "grey", this.options.closeOnZeroBearing && 0 === t.getBearing() && (this._container.style.display = "none"))
            } else L.DomUtil.addClass(this._link, "leaflet-disabled")
        }
    }), L.control.rotate = function (t) {
        return new L.Control.Rotate(t)
    }, L.Map.mergeOptions({
        rotateControl: !0
    }), L.Map.addInitHook((function () {
        if (this.options.rotateControl) {
            var t = "object" == typeof this.options.rotateControl ? this.options.rotateControl : {};
            this.rotateControl = L.control.rotate(t), this.addControl(this.rotateControl)
        }
    }))
}));