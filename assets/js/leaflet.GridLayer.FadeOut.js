
// Adds a fade-out animation to grid layers when they're removed from the map


(function(){

	var gridProto = L.GridLayer.prototype;
	var onRemoveProto = gridProto.onRemove;
	var onAddProto = gridProto.onAdd;
	var fadeDuration = 200;

	L.GridLayer.include({

		onAdd: function(map) {
			if (this._fadeOutTime) {
				var now = performance.now() || (+new Date());
				L.Util.cancelAnimFrame(this._fadeOutFrame);
				this._fadeOutTime = now + fadeDuration - this._fadeOutTime + now;
				L.Util.requestAnimFrame(this._fadeIn, this)
			} else {
				onAddProto.call(this, map);
			}
		},

		onRemove: function(map) {

			if (this._fadeOutTime) {
				// We're removing this *again* quickly after removing and re-adding
				var now = performance.now() || (+new Date());

				this._fadeOutTime = now + fadeDuration - this._fadeOutTime + now;
			}
			this._fadeOutTime = (performance.now() || (+new Date())) + fadeDuration * 2;
			this._fadeOutMap = this._map;

			L.Util.requestAnimFrame(this._fadeOut, this)
		},

		_fadeOut: function(){
			if (!this._fadeOutTime || !this._container) { return; }

			var now = performance.now() || (+new Date());

			var opacity = Math.min((this._fadeOutTime - now) / fadeDuration, 1);
// console.log('fadeout:', opacity);
			if (opacity < 0) {
				this._fadeOutTime = false;

				onRemoveProto.call(this, this._fadeOutMap);

				return;
			}

			L.DomUtil.setOpacity(this._container, opacity * this.options.opacity);

			this._fadeOutFrame = L.Util.requestAnimFrame(this._fadeOut, this);
		},

		// Only runs when the gridlayer is quickly re-added while it's being faded out
		_fadeIn: function _fadeIn(){
			if (!this._fadeOutTime || !this._container) { return; }

			var now = performance.now() || (+new Date());

			var opacity = (now - this._fadeOutTime) / fadeDuration;
// console.log('fadein:', opacity);

			if (opacity > 1) {
				this._fadeOutTime = false;
				return;
			}

			L.DomUtil.setOpacity(this._container, opacity * this.options.opacity);

			L.Util.requestAnimFrame(this._fadeIn, this);
		}

	});

})();





