"use strict";
"enablePrivelege";

let step = 0.001;
let current_lng;
let current_lat;
let current_alt;
let altitude;
let current_heading;
let center_to_Screen;
let north_rotation = true;
let selected_marker = "";
let selecting_marker;
let current_gpx = "";
let selecting_path;
let tracking_path = false;

//to store device loaction
let device_lat;
let device_lng;
let device_alt;
let device_sat;
let device_speed;
let device_heading;


let zoom_level = 14;
let current_zoom_level;
let new_lat = 0;
let new_lng = 0;
let curPos = 0;
let myMarker = "";
let windowOpen;
let message_body = "";
let tabIndex = 0;

let tilesLayer;
let tileLayer;
let tilesUrl;
let savesearch = false;

let search_current_lng;
let search_current_lat;

let open_url = false;
let marker_latlng = false;

let json_modified = false;

let markers_group = new L.FeatureGroup();
let unselectable_markers_group = new L.FeatureGroup();
let tracking_group = new L.FeatureGroup();
let measure_group = new L.FeatureGroup();
let measure_group_path = new L.FeatureGroup();

let save_mode; // to check save geojson or update json

let caching_time = 86400000;
let zoom_depth = 4;



if (!navigator.geolocation) {
	kaiosToaster({
		message: "Your device does not support Geolocation",
		position: 'north',
		type: 'warning',
		timeout: 2000
	});
}

let setting = {
	export_path: localStorage.getItem("export-path"),
	owm_key: localStorage.getItem("owm-key"),
	cache_time: localStorage.getItem("cache-time"),
	cache_zoom: localStorage.getItem("cache-zoom"),
	last_location: JSON.parse(localStorage.getItem("last_location")),
	openweather_api: localStorage.getItem("owm-key"),
	last_weather: localStorage.getItem("last_weather"),
	tracking_screenlock: JSON.parse(localStorage.getItem("tracking_screenlock")),
	exportTracksAsGPX: JSON.parse(localStorage.getItem("exportTracksAsGPX")),
	shareUsingShortLinks: true,
	invertmaptiles: localStorage.getItem("invertmaptiles") == "true" || false,
	fitBoundsWhileTracking: JSON.parse(localStorage.getItem("fitBoundsWhileTracking")) || true,
	mapCrosshair: JSON.parse(localStorage.getItem("mapCrosshair")) || false,
	messageSignature: "\nSent using KaiMaps for KaiOS"
};

//Hide off-screen markers to reduce lag
L.Marker.addInitHook(function () {
	// setup virtualization after marker was added
	this.on('add', function () {

		this._updateIconVisibility = function () {
			if (!localStorage.getItem("marker-virtualization") || !this._map) return;
			var map = this._map,
				isVisible = map.getBounds().contains(this.getLatLng()),
				wasVisible = this._wasVisible,
				icon = this._icon,
				iconParent = this._iconParent,
				shadow = this._shadow,
				shadowParent = this._shadowParent;

			// remember parent of icon 
			if (!iconParent) {
				iconParent = this._iconParent = icon.parentNode;
			}
			if (shadow && !shadowParent) {
				shadowParent = this._shadowParent = shadow.parentNode;
			}

			// add/remove from DOM on change
			if (isVisible != wasVisible) {
				if (isVisible) {
					iconParent.appendChild(icon);
					if (shadow) {
						shadowParent.appendChild(shadow);
					}
				} else {
					iconParent.removeChild(icon);
					if (shadow) {
						shadowParent.removeChild(shadow);
					}
				}

				this._wasVisible = isVisible;

			}
		};

		// on map size change, remove/add icon from/to DOM
		this._map.on('resize moveend zoomend', this._updateIconVisibility, this);
		this._updateIconVisibility();

	}, this);
});

//leaflet add basic map
let map = L.map("map-container", {
	zoomControl: false,
	dragging: false,
	keyboard: true,
	rotate: true,
	bearing: 0,
}).setView([48.39246714732355, -4.432210922241211], 16); // DEMO View

setting.zoomposition = localStorage.getItem("zoomposition")


window.ScaleControl = L.control
	.scale({
		position: "topright",
		metric: true,
		imperial: false,
	})
	.addTo(map);



let settings_data = settings.load_settings();

console.log(JSON.stringify(setting));


document.addEventListener("DOMContentLoaded", function () {
	//document.querySelector("div#intro-footer2").innerText = "Fetching location..";



	/*
	getKaiAd({
		publisher: '43accaf9-7798-4925-804b-ec0fa006b010',
		app: 'delta.map',
		slot: 'ad-container',
		
		h: 90,
		w: 728,

		// Max supported size is 240x264
		// container is required for responsive ads
		container: document.getElementById('ad-container'),
		onerror: err => console.error('Custom catch:', err),
		onready: ad => {

			// Ad is ready to be displayed
			// calling 'display' will display the ad
			ad.call('display', {

				// In KaiOS the app developer is responsible
				// for user navigation, and can provide
				// navigational className and/or a tabindex

				// if the application is using
				// a classname to navigate
				// this classname will be applied
				// to the container
				navClass: 'items',

				// display style will be applied
				// to the container block or inline-block
				display: 'block',
			})
		}
	})
		*/




	/////////////////////
	////ZOOM MAP/////////
	////////////////////

	function ZoomMap(in_out) {
		let current_zoom_level = map.getZoom();
		let zoomstep = 1 * (localStorage.getItem("zoom-speed") || 1)
		if (windowOpen == "map" && $('div#search-box').css('display') == 'none') {
			if (in_out == "in") {
				current_zoom_level = current_zoom_level + zoomstep;
				map.setZoom(current_zoom_level);
			}
			if (in_out == "out") {
				current_zoom_level = current_zoom_level - zoomstep;
				map.setZoom(current_zoom_level);
			}
			zoom_level = current_zoom_level;
			zoom_speed();
		}
	}

	function zoom_speed() {
		/*
    zoom levels:
    <2 -> 2000/3000/5000km
    >2 -> 1000km
    >3 -> 500km
    >4 -> 300km
    >5 -> 100km
    >6 -> 50km
    >7 -> 30km
    >8 -> 10km
    >9 -> 5km
    >10 -> 3km
    >11 -> 2km
    >12 -> 1km
    >13 -> 500m
    >14 -> 300m
    >15 -> 100m
    >16 -> 50m

    */
		if (zoom_level < 2) {
			step = 20;
		}
		if (zoom_level > 2) {
			step = 8;
		}
		if (zoom_level > 3) {
			step = 4.5;
		}
		if (zoom_level > 4) {
			step = 2.75;
		}
		if (zoom_level > 5) {
			step = 1, 2;
		}
		if (zoom_level > 6) {
			step = 0.5;
		}
		if (zoom_level > 7) {
			step = 0.3;
		}
		if (zoom_level > 8) {
			step = 0.15;
		}
		if (zoom_level > 9) {
			step = 0.075;
		}
		if (zoom_level > 10) {
			step = 0.04;
		}
		if (zoom_level > 11) {
			step = 0.02;
		}
		if (zoom_level > 12) {
			step = 0.01;
		}
		if (zoom_level > 13) {
			step = 0.005;
		}
		if (zoom_level > 14) {
			step = 0.0025;
		}
		if (zoom_level > 15) {
			step = 0.001;
		}
		if (zoom_level > 16) {
			step = 0.0005;
		}
		if (zoom_level > 18) {
			step = 0.0001;
		}
		step = step * (localStorage.getItem("pan-speed") || 1);
		return step
	}

	/////////////////////
	//MAP NAVIGATION//
	/////////////////////

	function MovemMap(direction) {
		//if (!marker_latlng) {
		if (windowOpen == "map" || windowOpen == "coordinations") {
			if (center_to_Screen == true) return;
			let n = map.getCenter();

			if (isjumpingtomarkeronmove) current_marker.off('move', marker_jumpto_onmove);
			if (selecting_marker) {
				selecting_marker = false;
				jump_index = 0;
				jump_closest_index = map.getCenter()
				if (map.hasLayer(markers_group_osmnotes)) top_bar("", "", "");
				bottom_bar("", "", "");
			}

			current_lat = n.lat;
			current_lng = n.lng;
			zoom_speed();

			if (direction == "left") {

				current_lng = n.lng - step;
				map.panTo(new L.LatLng(current_lat, current_lng));
			}

			if (direction == "right") {

				current_lng = n.lng + step;
				map.panTo(new L.LatLng(current_lat, current_lng));
			}

			if (direction == "up") {

				current_lat = n.lat + step;
				map.panTo(new L.LatLng(current_lat, current_lng));
			}

			if (direction == "down") {

				current_lat = n.lat - step;
				map.panTo(new L.LatLng(current_lat, current_lng));
			}

		}
	}

	//////////////////////////////
	////KEYPAD HANDLER////////////
	//////////////////////////////

	let longpress = false;
	const longpress_timespan = 1000;
	let timeout;

	function repeat_action(param) {
		switch (param.key) {
			case 'ArrowUp':
				if (screen.orientation.type == 'portrait-primary') nav("-1") & MovemMap("up");
				if (screen.orientation.type == 'portrait-secondary') nav("+1") & MovemMap("down");
				if (screen.orientation.type == 'landscape-primary') MovemMap("left");
				if (screen.orientation.type == 'landscape-secondary') MovemMap("right");

				if (windowOpen == "finder") {
					if (screen.orientation.type == 'landscape-primary') finder_navigation("-1");
					if (screen.orientation.type == 'landscape-secondary') finder_navigation("+1");
				}

				break;
			case 'ArrowDown':
				if (screen.orientation.type == 'portrait-primary') nav("+1") & MovemMap("down");
				if (screen.orientation.type == 'portrait-secondary') nav("-1") & MovemMap("up");
				if (screen.orientation.type == 'landscape-primary') MovemMap("right");
				if (screen.orientation.type == 'landscape-secondary') MovemMap("left");

				if (windowOpen == "finder") {
					if (screen.orientation.type == 'landscape-primary') finder_navigation("+1");
					if (screen.orientation.type == 'landscape-secondary') finder_navigation("-1");
				}
				break;

			case "ArrowRight":

				if (screen.orientation.type == 'portrait-primary') MovemMap("right");
				if (screen.orientation.type == 'portrait-secondary') MovemMap("left");
				if (screen.orientation.type == 'landscape-primary') MovemMap("up") & nav("-1");
				if (screen.orientation.type == 'landscape-secondary') MovemMap("down") & nav("+1");

				if (windowOpen == "finder") {
					if (screen.orientation.type == 'portrait-primary') finder_navigation("+1");
					if (screen.orientation.type == 'portrait-secondary') finder_navigation("-1");

				}
				break;

			case "ArrowLeft":
				if (screen.orientation.type == 'portrait-primary') MovemMap("left");
				if (screen.orientation.type == 'portrait-secondary') MovemMap("right");
				if (screen.orientation.type == 'landscape-primary') MovemMap("down") & nav("+1");
				if (screen.orientation.type == 'landscape-secondary') MovemMap("up") & nav("-1");
				if (windowOpen == "finder") {
					if (screen.orientation.type == 'portrait-primary') finder_navigation("-1");
					if (screen.orientation.type == 'portrait-secondary') finder_navigation("+1");
				}

				break;
			case "SoftRight":
				if (windowOpen == "map") {
					ZoomMap("in");
				}
				break;
			case "SoftLeft":
				if (windowOpen == "map") {
					ZoomMap("out");
				}
				break;
			case "*":
				if (windowOpen == "map") {
					selected_marker = module.jump_to_layer();
					selecting_marker = true;
					bottom_bar("Cancel", "SELECT", "");
					if (selected_marker) selected_marker.on('move', selected_marker_onmove);
				}
				break;

		}

	}



	let build_menu = function () {
		document.querySelector("div#tracksmarkers").innerHTML = "";
		document.querySelector("div#maps").innerHTML = "";
		document.querySelector("div#layers").innerHTML = "";

		let el = document.querySelector("div#maps");
		/**   <div class="item list-item focusable" data-map="toner"><p class="list-item__text">Toner</p></div> */
		el.insertAdjacentHTML(
			"afterend",
			'<div class="item list-item focusable" data-map="toner"><p class="list-item__text">Toner</p><p class="list-item__subtext">Map</p></div>'
		);


		el.insertAdjacentHTML(
			"afterend",
			'<div class="item list-item focusable" data-map="otm"><p class="list-item__text">Here WeGo Hybrid</p><p class="list-item__subtext">Map</p></div>'
		);
		el.insertAdjacentHTML(
			"afterend",
			'<div class="item list-item focusable" data-map="gstreet"><p class="list-item__text">Google Street</p><p class="list-item__subtext">Map</p></div>'
		);

		/*el.insertAdjacentHTML(
			"afterend",
			'<div class="item list-item focusable" data-map="satellite"><p class="list-item__text">Bing Aerial</p><p class="list-item__subtext">Satellite</p></div>'
		);*/

		el.insertAdjacentHTML(
			"afterend",
			'<div class="item list-item focusable" data-map="clarity"><p class="list-item__text">Esri World Clarity (Beta)</p><p class="list-item__subtext">Satellite</p></div>'
		);

		el.insertAdjacentHTML(
			"afterend",
			'<div class="item list-item focusable" data-map="osm"><p class="list-item__text">OpenStreetMap</p><p class="list-item__subtext">Map</p></div>'
		);
		el.insertAdjacentHTML(
			"afterend",
			'<div class="item list-item focusable" data-map="ocm"><p class="list-item__text">OpenCycleMap</p><p class="list-item__subtext">Map</p></div>'
		);

		document
			.querySelector("div#layers")
			.insertAdjacentHTML(
				"afterend",
				'<div class="item checkbox-container" data-map="strava-heatmap"><p class="checkbox-container__text">OSM GPS Tracks</p><p class="checkbox-container__subtext">Layer</p><input type="checkbox" tabindex="0" class="checkbox-container__input"/><div class="checkbox-container__checkbox"></div></div>'
			);

		document
			.querySelector("div#layers")
			.insertAdjacentHTML(
				"afterend",
				'<div class="item checkbox-container" data-map="earthquake"><p class="checkbox-container__text">Earthquakes</p><p class="checkbox-container__subtext">Marker Group</p><input type="checkbox" tabindex="0" class="checkbox-container__input"/><div class="checkbox-container__checkbox"></div></div>'
			);

		document
			.querySelector("div#layers")
			.insertAdjacentHTML(
				"afterend",
				'<div class="item checkbox-container" data-map="railway"><p class="checkbox-container__text">Railways</p><p class="checkbox-container__subtext">Layer</p><input type="checkbox" tabindex="0" class="checkbox-container__input"/><div class="checkbox-container__checkbox"></div></div>'
			);

		document
			.querySelector("div#layers")
			.insertAdjacentHTML(
				"afterend",
				'<div class="item checkbox-container" data-map="owm"><p class="checkbox-container__text">Precipitation</p><p class="checkbox-container__subtext">Layer</p><input type="checkbox" tabindex="0" class="checkbox-container__input"/><div class="checkbox-container__checkbox"></div></div>'
			);
		document

			.querySelector("div#layers")
			.insertAdjacentHTML(
				"afterend",
				'<div class="item checkbox-container" data-map="owm-wind"><p class="checkbox-container__text">Wind</p><p class="checkbox-container__subtext">Layer</p><input type="checkbox" tabindex="0" class="checkbox-container__input"/><div class="checkbox-container__checkbox"></div></div>'
			);

		document

			.querySelector("div#layers")
			.insertAdjacentHTML(
				"afterend",
				'<div class="item checkbox-container" data-map="owm-temp"><p class="checkbox-container__text">Temperature</p><p class="checkbox-container__subtext">Layer</p><input type="checkbox" tabindex="0" class="checkbox-container__input"/><div class="checkbox-container__checkbox"></div></div>'
			);

		document
			.querySelector("div#layers")
			.insertAdjacentHTML(
				"afterend",
				'<div class="item checkbox-container" data-map="weather"><p class="checkbox-container__text">Rainviewer</p><p class="checkbox-container__subtext">Layer</p><input type="checkbox" tabindex="0" class="checkbox-container__input"/><div class="checkbox-container__checkbox"></div></div>'
			);
		document
			.querySelector("div#layers")
			.insertAdjacentHTML(
				"afterend",
				'<div class="item checkbox-container" data-map="osmnotes"><p class="checkbox-container__text">OSM Notes</p><p class="checkbox-container__subtext">Layer</p><input type="checkbox" tabindex="0" class="checkbox-container__input"/><div class="checkbox-container__checkbox"></div></div>'
			);
		load_maps();
		find_gpx(true);
		osm_server_list_gpx(true);
		find_geojson(true);
		find_kml(true);
		finder_tabindex()

	};

	//////////////////////////////////
	//READ KML////////////////////////
	/////////////////////////////////
	let find_kml = function (onlycount) {
		//search kml
		let finder_kml = new Applait.Finder({
			type: "sdcard",
			debugMode: false,
		});

		finder_kml.search(".kml");
		finder_kml.on("searchComplete", function (needle, filematchcount) {
			document.querySelector('[data-map="kml-tracks"]').childNodes[3].innerText = (filematchcount == 1 ? filematchcount + ' file' : filematchcount + ' files')
				if (!onlycount){
				tabIndex = 0;
				finder_tabindex();
			}
		});
		if (onlycount) return;

		finder_kml.on("fileFound", function (file, fileinfo, storageName) {
			let filename_ = fileinfo.name.split('.').slice(0, -1).join('.');

			document
				.querySelector("div#tracksmarkers")
				.insertAdjacentHTML(
					"afterend",
					'<div class="item list-item focusable" data-map="kml" readfile="' + fileinfo.name + '"><p class="list-item__text">' + filename_ + '</p><p class="list-item__subtext">Keyhole Markup Language</p></div>');
		});
	};

	//////////////////////////////////
	//READ GPX////////////////////////
	/////////////////////////////////
	let find_gpx = function (onlycount) {
		//search gpx
		let finder_gpx = new Applait.Finder({
			type: "sdcard",
			debugMode: false,
		});

		finder_gpx.search(".gpx");
		finder_gpx.on("searchComplete", function (needle, filematchcount) {
			document.querySelector('[data-map="gpx-tracks"]').childNodes[3].innerText = (filematchcount == 1 ? filematchcount + ' file' : filematchcount + ' files')
			if (!onlycount){
				tabIndex = 0;
				finder_tabindex();
			}
		});
		if (onlycount) return;

		finder_gpx.on("fileFound", function (file, fileinfo, storageName) {
			let filename_ = fileinfo.name.split('.').slice(0, -1).join('.');

			document
				.querySelector("div#tracksmarkers")
				.insertAdjacentHTML(
					"afterend",
					'<div class="item list-item focusable" data-map="gpx" readfile="' + fileinfo.name + '"><p class="list-item__text">' + filename_ + '</p><p class="list-item__subtext">GPS Exchange Format</p></div>');
		});
	};

	//////////////////////////////////
	//READ GEOJSON////////////////////////
	/////////////////////////////////

	let find_geojson = function (onlycount) {
		//search geojson
		let finder = new Applait.Finder({
			type: "sdcard",
			debugMode: false,
		});
		finder.search(".geojson");

		finder.on("searchComplete", function (needle, filematchcount) {
			document.querySelector('[data-map="gj-tracks"]').childNodes[3].innerText = (filematchcount == 1 ? filematchcount + ' file' : filematchcount + ' files')
			if (!onlycount){
				tabIndex = 0;
				finder_tabindex();
			}
		});
		if (onlycount) return;
		finder.on("fileFound", function (file, fileinfo, storageName) {
			let filename_ = fileinfo.name.split('.').slice(0, -1).join('.');
			document
				.querySelector("div#tracksmarkers")
				.insertAdjacentHTML(
					"afterend",
					'<div class="item list-item focusable" data-map="geojson" readfile="' + fileinfo.name + '"><p class="list-item__text">' + filename_ + '</p><p class="list-item__subtext">GeoJSON</p></div>'
				);
		});
	};

	window.isLoggedIn = false
	let osm_server_list_gpx = function (onlycount) {
		console.log("load osm");
		let n = "Bearer " + localStorage.getItem("openstreetmap_token");

		// get osm account username
		fetch("https://www.openstreetmap.org/api/0.6/user/details", {
				headers: {
					Authorization: n,
				},
			})
			.then((response) => response.text())
			.then(function (data) {
				const parser = new DOMParser();
				const xml = parser.parseFromString(data, "application/xml");
				let s = xml.getElementsByTagName("user");

				window.osm_username = s[0].getAttribute("display_name");
				document
					.querySelector("#osm-oauth").innerText = osm_username
				window.isLoggedIn = true
			});

		const myHeaders = new Headers({
			Authorization: n,
		});

		return fetch("https://api.openstreetmap.org/api/0.6/user/gpx_files", {
				method: "GET",
				headers: myHeaders,
			})
			.then((response) => response.text())
			.then((data) => {
				const parser = new DOMParser();
				const xml = parser.parseFromString(data, "application/xml");
				let s = xml.getElementsByTagName("gpx_file");

				document.querySelector('[data-map="osm-tracks"]').childNodes[3].innerText = (s.length == 1 ? s.length + ' file' : s.length + ' files')
				if (onlycount) return;

				//filter by tag
				for (let i = 0; i < s.length; i++) {
					if (setting.osm_tag == null || setting.osm_tag == "") {
						let m = {
							name: s[i].getAttribute("name"),
							id: s[i].getAttribute("id"),
						};

						document
							.querySelector("div#tracksmarkers")
							.insertAdjacentHTML(
								"afterend",
								'<div class="item list-item focusable" data-id=' + m.id + ' data-map="gpx-osm"><p class="list-item__text">' + m.name + '</p><p class="list-item__subtext">OSM Server GPX</p></div>'
							);


					} else {
						for (let n = 0; n < s[i].children.length; n++) {
							if (s[i].children[n].tagName == "tag") {
								if (s[i].children[n].textContent == setting.osm_tag) {
									let m = {
										name: s[i].getAttribute("name"),
										id: s[i].getAttribute("id"),
									};

									document
										.querySelector("div#tracksmarkers")
										.insertAdjacentHTML(
											"afterend",
											'<div class="item list-item focusable" data-id=' + m.id + ' data-map="gpx-osm"><p class="list-item__text">' + m.name + '</p><p class="list-item__subtext">OSM Server GPX</p></div>'
										);
								}
							}
						}
					}
				}
				tabIndex = 0;
				finder_tabindex();
			})

			.catch((error) => {
				console.log(error);
			});
	};

	let osm_server_load_gpx = function (id) {
		let n = "Bearer " + localStorage.getItem("openstreetmap_token");
		console.log("load gpx osm")

		const myHeaders = new Headers({
			Authorization: n,
			Accept: "application/gpx+xml",
		});

		return fetch("https://api.openstreetmap.org/api/0.6/gpx/" + id + "/data", {
				method: "GET",
				headers: myHeaders,
			})
			.then((response) => response.text())
			.then((data) => {
				var gpx = data;
				current_gpx = new L.GPX(gpx, {
						async: true,
					})
					.on("loaded", function (e) {
						map.fitBounds(e.target.getBounds());
						zoom_speed();
					})
					.addTo(map);
				top_bar("", "", "");
				document.querySelector("div#finder").style.display = "none";
				document.querySelector("div#tracks").style.display = "none";
				windowOpen = "map";
			})
			.catch((error) => {
				kaiosToaster({
					message: "Failed to fetch GPX: " + error,
					position: 'north',
					type: 'error',
					timeout: 4000
				});
				console.log(error);

			});
	};

	let osm_server_upload_gpx = function (filename, gpx_data) {
		let n = "Bearer " + localStorage.getItem("openstreetmap_token");
		const myHeaders = new Headers({
			Authorization: n,
		});

		var blob = new Blob([gpx_data], {
			type: "application/gpx",
		});

		let formData = new FormData();
		formData.append("description", "Uploaded using KaiMap for KaiOS");
		formData.append("visibility", "private");
		formData.append("file", blob, filename);

		return fetch("https://api.openstreetmap.org/api/0.6/gpx/create", {
				method: "POST",
				body: formData,
				headers: myHeaders,
			})
			.then((response) => response.text())
			.then((data) => {
				kaiosToaster({
					message: "Successfully uploaded GPX",
					position: 'north',
					type: 'success',
					timeout: 3000
				});
			})

			.catch((error) => {
				kaiosToaster({
					message: "Failed to upload GPX: " + error,
					position: 'north',
					type: 'error',
					timeout: 4000
				});
				y
			});
	};

	let OAuth_osm = function () {
		if (window.isLoggedIn) {
			if (confirm("Are you sure you want to logout from OpenStreetMap?")) {
				localStorage.setItem("openstreetmap_token", '');
				window.isLoggedIn = false;
			}
			return
		}
		let n = window.location.href;
		const url = new URL("https://www.openstreetmap.org/oauth2/authorize");
		url.searchParams.append("response_type", "code");
		url.searchParams.append(
			"client_id",
			"D5agvdYlQRR7Ej7w7W8tX1-jR-wN0WuLORcY6Oj5X58"
		);
		url.searchParams.append(
			"redirect_uri",
			"https://delta-applications.github.io/KaiMap/oauth.html"
		);
		url.searchParams.append("scope", "read_prefs write_notes read_gpx write_gpx");

		const windowRef = window.open(url.toString());

		windowRef.addEventListener("tokens", (ev) => osm_server_list_gpx());
	};

	//////////////////////////////////
	///MENU//////////////////////////
	/////////////////////////////////




	window.finder_tabindex = function () {
		//set tabindex
		let t = -1;
		let items = document.querySelectorAll(".item");
		let items_list = [];
		for (let i = 0; i < items.length; i++) {
			if (items[i].parentNode.style.display == "block") {
				items_list.push(items[i]);
				t++;
				items_list[items_list.length - 1].setAttribute("tabIndex", t);
				items_list[0].focus();
			}
		}
	};

	let show_finder = function () {
		finder_tabindex();
		document.querySelector("div#finder").style.display = "block";
		finder_navigation("start");
		windowOpen = "finder";
	};

	let selected_marker_onmove = function (oldLatLng, newLatLng) {
		informationHandler.PreciseMarkerUpdate(selected_marker, true)
	}

	let show_markers_options = function () {
		if (map.hasLayer(markers_group_osmnotes)) top_bar("", "", "");

		document.querySelector("div#markers-option").style.display = "block";
		document.querySelector("#remove_marker").style.display = "block"


		tabIndex = 0;
		finder_tabindex();

		
		windowOpen = "markers_option";
		bottom_bar("", "", "")

		if (selected_marker) selected_marker.on('move', selected_marker_onmove);

		informationHandler.PreciseMarkerUpdate(selected_marker)
	};


	let load_maps = function () {
		let finder = new Applait.Finder({
			type: "sdcard",
			debugMode: false,
		});
		finder.search("KaiMaps.json");

		finder.on("searchComplete", function (needle, filematchcount) {});
		finder.on("fileFound", function (file, fileinfo, storageName) {
			let data = "";
			let reader = new FileReader();

			reader.onerror = function (event) {
				reader.abort();
			};

			reader.onloadend = function (event) {
				//check if json valid
				try {
					data = JSON.parse(event.target.result);
				} catch (e) {
					kaiosToaster({
						message: "Maps JSON File is invalid",
						position: 'north',
						type: 'error',
						timeout: 4000
					});
					return false;
				}

				data.forEach(function (key) {
					if (key.Type == "Map") {
						document
							.querySelector("div#maps")
							.insertAdjacentHTML(
								"afterend", //'<div class="item list-item focusable" data-map="toner"><p class="list-item__text">Toner</p><p class="list-item__subtext">Map</p></div>'
								'<div class="item list-item focusable" data-map="' +
								key.Type +
								'"  data-maxzoom="' +
								key.MaxZoom +
								'"  data-url="' +
								key.Url +
								'"  data-name="' +
								key.Name +
								'" data-attribution="' +
								key.Attribution +
								'"><p class="list-item__text">' +
								key.Name +
								"</p>" + '<p class="list-item__subtext">' + key.Type + "</p></div>"
							);
					}

					if (key.Type == "Layer") {
						document
							.querySelector("div#layers")
							.insertAdjacentHTML(
								"afterend",
								'<div class="item checkbox-container" data-map="' + //'<div class="item checkbox-container" 
								//data-map="railway">
								//<p class="checkbox-container__subtext">Layer</p>
								//<input type="checkbox" tabindex="0" class="checkbox-container__input"/>
								//<div class="checkbox-container__checkbox"></div></div>'
								key.Type +
								'"  data-maxzoom="' +
								key.MaxZoom +
								'"  data-url="' +
								key.Url +
								'"  data-name="' +
								key.Name +
								'" data-attribution="' +
								key.Attribution +
								'"><p class="checkbox-container__text">' +
								key.Name +
								"</p>" + '<p class="list-item__subtext">' + key.Type + "</p>" + '<input type="checkbox" tabindex="0" class="checkbox-container__input"/>' +
								'<div class="checkbox-container__checkbox"></div>' +
								"</div>"
							);
					}
				});
				finder_tabindex()

			};

			reader.readAsText(file);
		});
	};

	/////////////////////////
	/////Load GeoJSON///////////
	///////////////////////
	function loadGeoJSON(filename) {
		let finder = new Applait.Finder({
			type: "sdcard",
			debugMode: false,
		});
		finder.search(filename);
		finder.on("fileFound", function (file, fileinfo, storageName) {
			//file reader

			let geojson_data = "";
			let reader = new FileReader();

			reader.onerror = function (event) {
				reader.abort();
			};

			reader.onloadend = function (event) {
				//check if json valid
				try {
					geojson_data = JSON.parse(event.target.result);
				} catch (e) {
					kaiosToaster({
						message: "GeoJSON File is invalid",
						position: 'north',
						type: 'error',
						timeout: 4000
					});
					return false;
				}

				//if valid add layer
				//to do if geojson is marker add to  marker_array[]
				//https://blog.codecentric.de/2018/06/leaflet-geojson-daten/
				L.geoJSON(geojson_data, {
					// Marker Icon
					pointToLayer: function (feature, latlng) {
						let t = L.marker(latlng);
						t.addTo(markers_group);
						map.flyTo(latlng);
						windowOpen = "map";
						json_modified = true;
					},

					// Popup
					onEachFeature: function (feature, layer) {
						if (feature.geometry != "") {
							let p = feature.geometry.coordinates[0];
							if (p == undefined) return;
							p.reverse();
							map.flyTo(p);
						}
					},
				}).addTo(map);
				document.querySelector("div#finder").style.display = "none";
				document.querySelector("div#tracks").style.display = "none";
				top_bar("", "", "")
				windowOpen = "map";
			};

			reader.readAsText(file);
		});
	}
	/////////////////////////
	/////Load KML///////////
	///////////////////////

	function loadKML(filename) {
		let finder = new Applait.Finder({
			type: "sdcard",
			debugMode: false,
		});
		finder.search(filename);

		finder.on("fileFound", function (file, fileinfo, storageName) {
			//file reader

			let reader = new FileReader();

			reader.onerror = function (event) {
				kaiosToaster({
					message: "Failed to read " + filename + " KML File",
					position: 'north',
					type: 'warning',
					timeout: 3000
				});
				reader.abort();
			};

			reader.onloadend = function (event) {
				const parser = new DOMParser();
				var kmltext = event.target.result;
				var kml;
				try {
					kml = parser.parseFromString(kmltext, 'text/xml');
				} catch (error) {
					kaiosToaster({
						message: "KML File is invalid",
						position: 'north',
						type: 'error',
						timeout: 4000
					});
					return false;
				}
				const track = new L.KML(kml);
				map.addLayer(track);

				// Adjust map to show the kml
				const bounds = track.getBounds();
				map.fitBounds(bounds);
				zoom_speed();
				document.querySelector("div#finder").style.display = "none";
				document.querySelector("div#tracks").style.display = "none";
				windowOpen = "map";
				top_bar("", "", "")
			};

			reader.readAsText(file);
		});
	}





	/////////////////////////
	/////Load GPX///////////
	///////////////////////
	function loadGPX(filename) {
		let finder = new Applait.Finder({
			type: "sdcard",
			debugMode: false,
		});
		finder.search(filename);

		finder.on("fileFound", function (file, fileinfo, storageName) {
			//file reader

			let reader = new FileReader();

			reader.onerror = function (event) {
				kaiosToaster({
					message: "Failed to read " + filename + " GPX File",
					position: 'north',
					type: 'warning',
					timeout: 3000
				});
				reader.abort();
			};

			reader.onloadend = function (event) {
				var gpx = event.target.result; // URL to your GPX file or the GPX itself

				current_gpx = new L.GPX(gpx, {
						async: true,
					})
					.on("loaded", function (e) {
						map.fitBounds(e.target.getBounds());
						zoom_speed();
					})
					.addTo(map);

				document.querySelector("div#finder").style.display = "none";
				document.querySelector("div#tracks").style.display = "none";
				windowOpen = "map";
				top_bar("", "", "")
			};

			reader.readAsText(file);
		});
	}




	////////////////////
	////GEOLOCATION/////
	///////////////////
	//////////////////////////
	////MARKER SET AND UPDATE/////////
	/////////////////////////

	let LastPosMarker;
	var follow_icon = L.divIcon({
		iconSize: [0, 0],
		iconAnchor: [30, 30],
		html: '<svg class="circle" xmlns="http://www.w3.org/2000/svg" width="24" height="24" version="1.1" viewBox="-12 -12 24 24"><circle r="9" style="stroke:#fff;stroke-width:3;fill:#2A93EE;fill-opacity:1;opacity:1;animation: leaflet-control-locate-throb 4s ease infinite;"></circle></svg>',
	});

	var default_icon = L.divIcon({
		iconSize: [0, 0],
		iconAnchor: [30, 30],
		//	  iconUrl: "assets/css/images/marker-icon.png",
		html: '<svg class="circle" xmlns="http://www.w3.org/2000/svg" width="24" height="24" version="1.1" viewBox="-12 -12 24 24"><circle r="9" style="stroke:#fff;stroke-width:2;fill:#2A93EE;fill-opacity:1;opacity:1;"></circle></svg>',
	});


	var compass_icon = L.divIcon({
		iconSize: [9, 30],
		//	  iconUrl: "assets/css/images/marker-icon.png",
		html: '<svg xmlns="http://www.w3.org/2000/svg" width="9" height="30" version="1.1" viewBox="-4.5 0 9 30" style="transform: rotate(deg);"><path d="M0,0 l4.5,8 l-9,0 z" style="stroke:#fff;stroke-width:0;fill:#2A93EE;fill-opacity:1;opacity:1;"></path></svg>',
	});

	let compassMarker;

	let myAccuracy;


	function getLocation(option) {
		marker_latlng = false;

		if (option == "init" || option == "update_marker" || option == "share") {

		}

		let options = {
			enableHighAccuracy: true,
			timeout: 20000,
			maximumAge: 0,
		};

		document.querySelector("div#message").style.display = "none";

		function success(pos) {
			document.querySelector("div#get-position").style.display = "none";


			kaiosToaster({
				message: "Fetched position",
				position: 'north',
				type: 'success',
				timeout: 2000
			});
			let crd = pos.coords;
			current_lat = crd.latitude;
			current_lng = crd.longitude;
			current_alt = crd.altitude;
			current_heading = crd.heading;
			//to store device loaction
			informationHandler.PreciseGeoUpdate(crd)

			if (option == "share") {
				mozactivity.share_position();
			}

			//store location as fallout


			if (option == "init") {
				// Subtract 1 since if Accuracy is low, how can we be accurate about the accuracy? Haha, also looks better
				myAccuracy = L.circle([crd.latitude, crd.longitude], crd.accuracy - 1).addTo(map);
				myMarker = L.marker([current_lat, current_lng], {
					rotationAngle: 0,
				}).addTo(markers_group);
				myMarker._icon.classList.add("marker-1");
				// vv   
				myMarker.setIcon(default_icon);
				// ^^ 
				geolocationWatch();



				map.setView([current_lat, current_lng], 12);
				zoom_speed();
				document.querySelector("div#intro-footer2").innerText = "";
				return true;
			}

			if (option == "update_marker" && current_lat != "") {
				myMarker.setLatLng([current_lat, current_lng]).update();
				map.flyTo(new L.LatLng(current_lat, current_lng));
				zoom_speed();
			}
		}

		function error(err) {
			console.log(err.message + " " + err.code)

			if (setting.last_location != null) {
				kaiosToaster({
					message: err.message + ": Loading last position",
					position: 'north',
					type: 'error',
					timeout: 3000
				});

				current_lat = setting.last_location[0];
				current_lng = setting.last_location[1];
				current_alt = 0;
				LastPosMarker = L.marker([current_lat, current_lng]).addTo(markers_group);

				map.setView([current_lat, current_lng], 12);
				zoom_speed();
				document.querySelector("div#get-position").style.display = "none";
				document.querySelector("div#message").style.display = "none";
			} else {
				kaiosToaster({
					message: err.message + ": No position saved",
					position: 'north',
					type: 'error',
					timeout: 3000
				});
				current_lat = 0;
				current_lng = 0;
				current_alt = 0;
				map.setView([48.39246714732355, -4.432210922241211], 16); // DEMO View
				zoom_speed();
				document.querySelector("div#get-position").style.display = "none";
				document.querySelector("div#message").style.display = "none";
			}

			retrying = true
			geolocationWatch();


			return false;
		}

		navigator.geolocation.getCurrentPosition(success, error, options);
	}

	// always watch position











	///////////
	//watch position
	//////////
	let watchID;
	let state_geoloc = false;
	let retrying = false;
	let confirmed = false;
	let mym1 = false
	let prompted = false;


	window.geolocationWatch = function () {
		marker_latlng = false;

		let geoLoc = navigator.geolocation;

		if (state_geoloc == false) {
			document.querySelector("div#message").style.display = "none";


			state_geoloc = true;

			function showLocation(position) {

				if (retrying == true) {
					if (!confirmed && !prompted) {
						prompted = true;
						confirmed = true//confirm("The geolocation service is working again, update location?")
					}
					if (!confirmed) {
						return;
					}
				}
				let crd = position.coords;
				current_lat = crd.latitude;
				current_lng = crd.longitude;
				current_alt = crd.altitude;
				current_heading = crd.heading;

				//implement heading thing here
				// I had to put back the newer leaflet.js version that does not support rotation, because of some bugs and the markers not working

				if (north_rotation == false) {
					map.setBearing(current_heading);
				}

				if (myMarker) myMarker.setIcon(follow_icon);



				if (mym1 == false && retrying == true && !myMarker) {
					myAccuracy = L.circle([crd.latitude, crd.longitude], crd.accuracy - 1).addTo(map);
					myMarker = L.marker([current_lat, current_lng], {
						rotationAngle: 0,
					}).addTo(markers_group);
					myMarker._icon.classList.add("marker-1");
					// vv   
					myMarker.setIcon(follow_icon);
					mym1 = true
				}



				//store device location
				device_lat = crd.latitude;
				device_lng = crd.longitude;


				if (crd.heading != 0) {
					if (!compassMarker) {
						compassMarker = L.marker([current_lat, current_lng], {
							rotationAngle: 0,
						}).addTo(unselectable_markers_group);
						// vv   
						compassMarker.setIcon(compass_icon);
					}
					compassMarker._icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="9" height="30" version="1.1" viewBox="-4.5 0 9 30" style="transform: rotate(' + crd.heading + 'deg)"><path d="M0,0 l4.5,6 l-9,0 z" style="stroke:#fff;stroke-width:0;fill:#2A93EE;fill-opacity:1;opacity:1;" /></svg>'
				} else {
					if (compassMarker) map.removeLayer(compassMarker);
					if (compassMarker) compassMarker = null;

				}
				//store location as fallout
				let b = [crd.latitude, crd.longitude];
				localStorage.setItem("last_location", JSON.stringify(b));
				if (center_to_Screen == true) {
					if (selecting_marker & selected_marker != myMarker) {} else {
						map.flyTo(
							new L.LatLng(crd.latitude, crd.longitude)
						);
						myAccuracy.remove()
					}
				} else {
					myAccuracy.remove()
					myAccuracy = L.circle([crd.latitude, crd.longitude], crd.accuracy).addTo(map);
				}
				if (compassMarker) compassMarker.setLatLng([crd.latitude, crd.longitude]).update();
				myMarker.setLatLng([crd.latitude, crd.longitude]).update();
				informationHandler.PreciseGeoUpdate(crd)
				if (LastPosMarker) LastPosMarker.remove();
			}

			function errorHandler(err) {
				document.querySelector("div#message").style.display = "none";
				document.querySelector("div#get-position").style.display = "none";
				console.log(retrying, err)
				if (retrying == true) return;

				if (myMarker) myMarker.setIcon(default_icon);

				console.error(err.message + " " + err.code)
				if (err.code == 1) {
					kaiosToaster({
						message: "Access to Geolocation is denied",
						position: 'north',
						type: 'error',
						timeout: 2000
					});
				} else if (err.code == 2) {
					kaiosToaster({
						message: "Position is unavailable",
						position: 'north',
						type: 'error',
						timeout: 2000
					});


				}
			}

			let options = {
				timeout: retrying ? 10000 : 60000,
			};
			watchID = geoLoc.watchPosition(showLocation, errorHandler, options);
			return true;
		}

		if (state_geoloc == true) {
			geoLoc.clearWatch(watchID);
			state_geoloc = false;
			myMarker.setIcon(default_icon);
			return true;
		}
	}

	/////////////////////////
	/////MENU///////////////
	////////////////////////
	function markers_action() {
		if (document.activeElement.className == "item list-item focusable" ||
		 document.activeElement.className == "item button-container__button focusable" ||
		 document.activeElement.className == "item button-container__button focusable note_action" ||
		 document.activeElement.className == "item list-item-indicator focusable" 
		   && windowOpen == "markers_option") {
			let item_value = document.activeElement.getAttribute("data-action");

			if (item_value == "save_marker") {
				bottom_bar("", "", "")
				windowOpen = "map";
				selecting_marker = false;
				jump_index = 0;
				jump_closest_index = map.getCenter()
				document.querySelector("div#markers-option").style.display = "none";
				if (selected_marker) selected_marker.off('move', selected_marker_onmove);
				save_mode = "geojson-single";
				user_input("open", moment(new Date()).format("[KaiMaps_Marker]_YYYY-MM-DD_HH.mm.ss"), "Export marker in GeoJSON format");
				bottom_bar("Cancel", "", "Save");
			}

			if (item_value == "share_marker") {
				windowOpen = "map";
				selecting_marker = false;
				jump_closest_index = map.getCenter()
				jump_index = 0;
				document.querySelector("div#markers-option").style.display = "none";
				if (selected_marker) selected_marker.off('move', selected_marker_onmove);
				mozactivity.share_marker_position(selected_marker._latlng, document.querySelector("#marker-pluscode").innerText)
				bottom_bar("", "", "")
			}

			if (item_value == "reopen_note") {
				let note_id = document.activeElement.getAttribute("note_id");
				if (note_id) {
					maps.reopen_osm_note(note_id);
				}
			}
			if (item_value == "close_note") {
				let note_id = document.activeElement.getAttribute("note_id");
				if (note_id) {
					maps.close_osm_note(note_id);
				}
			}
			if (item_value == "comment_note") {
				let note_id = document.activeElement.getAttribute("note_id");
				if (note_id) {
					maps.comment_osm_note(note_id);
				}
			}

			if (item_value == "remove_marker") {
				if (confirm("Are you sure you want to remove this marker?") == true) {
					if (selected_marker) selected_marker.off('move', selected_marker_onmove);
					if (!map.hasLayer(markers_group_osmnotes)) {
						markers_group.removeLayer(selected_marker)
					} else {
						markers_group_osmnotes.removeLayer(selected_marker)
					};

					selecting_marker = false;

					kaiosToaster({
						message: "Marker removed",
						position: 'north',
						type: 'error',
						timeout: 3000
					});
					document.querySelector("div#markers-option").style.display = "none";
					windowOpen = "map";
					bottom_bar("", "", "")
				}

			}
		}
	};



	function addMapLayers() {
		if (document.activeElement.className == "item list-item focusable" ||
		 document.activeElement.className == "item checkbox-container" ||
		 document.activeElement.className == "item list-item-indicator focusable" ||
		  document.activeElement.className == "item button-container__button focusable" 
		  && (windowOpen == "finder" || windowOpen == "tracks")) {
			//switch online maps

			//custom maps and layers from json file
			if (document.activeElement.hasAttribute("data-url")) {
				top_bar("", "", "");

				let item_name = document.activeElement.getAttribute("data-name");
				let item_url = document.activeElement.getAttribute("data-url");
				let item_type = document.activeElement.getAttribute("data-map");
				let item_attribution = document.activeElement.getAttribute(
					"data-attribution"
				);
				let item_maxzoom = document.activeElement.getAttribute("data-maxzoom");

				maps.addMap(item_name, item_url, item_attribution, item_maxzoom, item_type, document.activeElement);

				document.querySelector("div#finder").style.display = "none";
				windowOpen = "map";
			}

			let item_value = document.activeElement.getAttribute("data-map");

			//add gpx data from osm
			if (item_value == "gpx-osm") {
				osm_server_load_gpx(document.activeElement.getAttribute("data-id"));
			}
			//<div><img class="Loading__image___1-YIY" src="/assets/images/loading.png"></div>
			if (item_value == "gpx-tracks") {
				windowOpen = "tracks"
				document.querySelector("div#tracks").innerHTML = '<div class="separator" id="tracks-name">GPX Tracks</div><div id="tracksmarkers"></div>';
				find_gpx()
				document.querySelector("div#tracks").style.display = "block";
				document.querySelector("div#finder").style.display = "none";

			}
			if (item_value == "kml-tracks") {
				windowOpen = "tracks"
				document.querySelector("div#tracks").innerHTML = '<div class="separator" id="tracks-name">KML Files</div><div id="tracksmarkers"></div>';
				find_kml()
				document.querySelector("div#tracks").style.display = "block";
				document.querySelector("div#finder").style.display = "none";

			}
			if (item_value == "gj-tracks") {
				windowOpen = "tracks"
				document.querySelector("div#tracks").innerHTML = '<div class="separator" id="tracks-name">GeoJson Files</div><div id="tracksmarkers"></div>';
				find_geojson()
				document.querySelector("div#tracks").style.display = "block";
				document.querySelector("div#finder").style.display = "none";

			}
			if (item_value == "osm-tracks") {
				windowOpen = "tracks"
				document.querySelector("div#tracks").innerHTML = '<div class="separator" id="tracks-name">OSM Tracks</div><div id="tracksmarkers"></div>';
				osm_server_list_gpx()
				document.querySelector("div#tracks").style.display = "block";
				document.querySelector("div#finder").style.display = "none";

			}

			if (item_value == "download-map") {
				PrintControl._print(Number(prompt("Image Scale:", "1")) || 1);
			}

			if (item_value == "marker-virtualization") {
				document.activeElement.children[2].checked = !document.activeElement.children[2].checked
			}
			if (item_value == "select-offscreen-markers") {
				document.activeElement.children[2].checked = !document.activeElement.children[2].checked
			}
			//     //invertmaptiles
			if (item_value == "invertmaptiles") {
				document.activeElement.children[2].checked = !document.activeElement.children[2].checked
			}

			if (item_value == "fitBoundsWhileTracking") {
				document.activeElement.children[2].checked = !document.activeElement.children[2].checked
			}

			// exportTracksAsGPX
			if (item_value == "exportTracksAsGPX") {
				document.activeElement.children[2].checked = !document.activeElement.children[2].checked
			}

			//mapCrosshair
			if (item_value == "mapCrosshair") {
				document.activeElement.children[2].checked = !document.activeElement.children[2].checked
			}

			if (item_value == "strava-heatmap") {
				top_bar("", "", "");
				maps.strava_heatmap(document.activeElement);

				document.querySelector("div#finder").style.display = "none";
				windowOpen = "map";

			}
			if (item_value == "update-weather") {
				let cdata = map.getCenter();
				informationHandler.UpdateWeather(cdata)
				kaiads.DisplayFullScreenAd();

			}
			if (item_value == "gstreet") {

				maps.google_map();
				top_bar("", "", "");
				document.querySelector("div#finder").style.display = "none";

				windowOpen = "map";
			}
			if (item_value == "ocm") {
				maps.opencycle_map();
				top_bar("", "", "");
				document.querySelector("div#finder").style.display = "none";

				windowOpen = "map";

			}
			if (item_value == "weather") {
				maps.weather_map(document.activeElement);
				document.querySelector("div#finder").style.display = "none";
				top_bar("", "", "");
				windowOpen = "map";

			}
			if (item_value == "osmnotes") {
				maps.osm_notes(document.activeElement);
				document.querySelector("div#finder").style.display = "none";
				top_bar("", "", "");
				windowOpen = "map";

			}
			if (item_value == "clarity") {
				maps.clarity();

				document.querySelector("div#finder").style.display = "none";
				top_bar("", "", "");
				windowOpen = "map";
			}
			/*if (item_value == "satellite") {
				maps.satellite_map();

				document.querySelector("div#finder").style.display = "none";
				top_bar("", "", "");
				windowOpen = "map";
			}*/
			if (item_value == "toner") {
				maps.toner_map();
				document.querySelector("div#finder").style.display = "none";
				top_bar("", "", "");

				windowOpen = "map";
			}

			if (item_value == "osm") {
				maps.osm_map();
				document.querySelector("div#finder").style.display = "none";
				top_bar("", "", "");

				windowOpen = "map";
			}

			if (item_value == "moon") {
				maps.moon_map();
				document.querySelector("div#finder").style.display = "none";
				top_bar("", "", "");

				map.setZoom(4);
				windowOpen = "map";
			}

			if (item_value == "otm") {
				top_bar("", "", "");

				maps.opentopo_map();
				document.querySelector("div#finder").style.display = "none";
				windowOpen = "map";
			}

			if (item_value == "owm") {
				top_bar("", "", "");
				maps.owm_precipit_layer(document.activeElement);

				document.querySelector("div#finder").style.display = "none";
				windowOpen = "map";
			}

			if (item_value == "owm-wind") {
				top_bar("", "", "");
				maps.owm_wind_layer(document.activeElement);

				document.querySelector("div#finder").style.display = "none";
				windowOpen = "map";
			}

			if (item_value == "owm-temp") {
				top_bar("", "", "");
				maps.owm_temp_layer(document.activeElement);

				document.querySelector("div#finder").style.display = "none";
				windowOpen = "map";
			}

			if (item_value == "railway") {
				maps.railway_layer(document.activeElement);
				top_bar("", "", "");

				document.querySelector("div#finder").style.display = "none";
				windowOpen = "map";
			}

			if (item_value == "earthquake") {
				top_bar("", "", "");
				maps.earthquake_layer(document.activeElement);

				document.querySelector("div#finder").style.display = "none";
				windowOpen = "map";
			}

			if (item_value == "share") {

				kaiosToaster({
					message: "Mozactivity Share",
					position: 'north',
					type: 'info',
					timeout: 1000
				});
				mozactivity.share_position();
				return true;
			}

			if (item_value == "autoupdate-geolocation") {
				windowOpen = "map";
				document.querySelector("div#finder").style.display = "none";
				if (center_to_Screen == true) {
					center_to_Screen = false
					kaiosToaster({
						message: "Stopped centering position",
						position: 'north',
						type: 'info',
						timeout: 2000
					});
				} else {
					kaiosToaster({
						message: "Started centering position",
						position: 'north',
						type: 'info',
						timeout: 2000
					});
					center_to_Screen = true
				}
			}

			if (item_value == "update-position") {
				getLocation("update_marker");
			}

			if (item_value == "search") {
				windowOpen = "map";
				document.querySelector("div#finder").style.display = "none";
				top_bar("", "", "")
				showSearch();
			}

			if (item_value == "coordinations") {
				coordinations("show");

			}

			if (item_value == "savelocation") {
				document.querySelector("div#finder").style.display = "none";
				save_mode = "geojson-single";
				user_input("open");
			}

			if (item_value == "export") {
				document.querySelector("div#finder").style.display = "none";
				save_mode = "geojson-collection";
				user_input("open");
			}

			if (item_value == "add-marker-icon") {
				kaiosToaster({
					message: "Return and press 9 to add a Marker",
					position: 'north',
					type: 'info',
					timeout: 5000
				});
			}

			if (item_value == "photo") {

				mozactivity.photo();
			}

			//add geoJson data
			if (item_value == "geojson") {
				loadGeoJSON(document.activeElement.getAttribute("readfile"));
			}

			//add gpx data
			if (item_value == "gpx") {
				loadGPX(document.activeElement.getAttribute("readfile"));
			}
			if (item_value == "kml") {
				loadKML(document.activeElement.getAttribute("readfile"));
			}
			if (!item_value == "update-weather") {
				top_bar("", "", "");
			}
		}

	}

	//qr scan listener

	let qrscan = false;


	////////////////////////////////////////
	////COORDINATIONS PANEL/////////////////
	///////////////////////////////////////
	let corr_toogle = false;

	function coordinations() {
		flashlight.trigger()
		kaiosToaster({
			message: "Toggled Camera Flash",
			position: 'north',
			type: 'info',
			timeout: 1000
		});

	}

	/////////////////////////
	/// GPX TRACK INFO  /////
	/////////////////////////

	function showGraph(elementId, dataIn, title) {
		let ctx = document.getElementById(elementId).getContext('2d');
		let data = [];
		let labels = [];
		let factor = Math.floor(dataIn.length / 320);
		if (factor == 0) {
			factor = 1;
		}
		console.log(factor);
		for (let i = 0; i < dataIn.length; i = i + factor) {
			data.push({
				x: (dataIn[i][0]).toFixed(3),
				y: dataIn[i][1]
			});
			labels.push((dataIn[i][0]).toFixed(3));
		}

		let myChart = new Chart(ctx, {
			type: 'line',
			data: {
				labels: labels,
				datasets: [{
					label: title,
					data: data,
					borderColor: 'rgb(31, 96, 237)',
					borderWidth: 1,
					fill: true,
				}]
			},
			options: {
				responsive: true,
				elements: {
					point: {
						radius: 0
					}
				},
				scales: {
					xAxes: [{
						display: true,
						scaleLabel: {
							display: true,
							labelString: 'km' //(allUnits[units].value == 'm') ? 'km' : 'miles'
						}
					}],
					yAxes: [{
						display: true,
						scaleLabel: {
							display: true,
							labelString: 'm' //(allUnits[units].value == 'm') ? 'm' : 'ft'
						}
					}]
				}
			}
		});
	}


	function view_gpxinfo() {
		document.querySelector("div#finder").style.display = "none";
		document.querySelector("div#gpxtrack-info").style.display = "block";
		bottom_bar("", "", "")
		top_bar("", "", "")
		document.querySelector("div#gpxtrack-info").children[0].focus();
		windowOpen = "gpxtrack-info";
		tabIndex = 0;
		finder_tabindex(); //((allUnits[units].value == 'm') ? target.get_elevation_data() : target.get_elevation_data_imp())
		informationHandler.PreciseGpxTrackUpdate(current_gpx)
	}



	//////////////////////////
	////SEARCH BOX////////////
	/////////////////////////

	function showSearch() {
		bottom_bar("Close", "SELECT", "");
		document.querySelector("div#search-box").style.display = "block";
		document.querySelector("div#search-box input").focus();
		document.querySelector("div#bottom-bar").style.display = "block";
		windowOpen = "search";
	}

	function hideSearch() {
		document.querySelector("div#bottom-bar").style.display = "none";
		document.querySelector("div#search-box").style.display = "none";
		document.querySelector("div#search-box input").value = "";
		document.querySelector("div#search-box input").blur();
		document.querySelector("div#olc").style.display = "none";
		windowOpen = "map";
	}

	//////////////////////
	//FINDER NAVIGATION//
	/////////////////////


	function showInfoUpdate() {
		bottom_bar("Close", "SELECT", "");
		document.querySelector("div#search-box").style.display = "block";
		document.querySelector("div#search-box input").focus();
		document.querySelector("div#bottom-bar").style.display = "block";
		windowOpen = "search";
	}

	let finder_panels = ["Imagery", "Information", "Settings", "Shortcuts", "Impressum"];
	let count = 0;

	

	let finder_navigation = function (dir) {
		if (!$("input").is(":focus")) {

			tabIndex = 0;
			bottom_bar("", "", "");

			let d = document.querySelectorAll("div.panel");
			for (let b = 0; b < d.length; b++) {
				d[b].style.display = "none";
			}


			if (dir == "start") {
				document.getElementById(finder_panels[count]).style.display = "block";
				finder_tabindex();
			}

			if (dir == "+1") {
				count++;
				if (count > finder_panels.length - 1) count = finder_panels.length - 1;
				document.getElementById(finder_panels[count]).style.display = "block";
				finder_tabindex();
			}
			if (dir == "-1") {
				count--;
				if (count < 0) count = 0;
				document.getElementById(finder_panels[count]).style.display = "block";
				finder_tabindex();
			}
			

			[...document.querySelector("#kai-tabs-finder").children].forEach((a) => {
				/*a.onclick = function({target}) {
				  if (target.matches("[class^='kai-tab-inactive']")) {
					let tabEl = target;
					if (target.className.includes("-label")) {
					  tabEl = target.parentNode;
					}
					this.querySelectorAll("[class^='kai-tab-active']").forEach(
					  (a) => (a.className = a.className.replace("active", "inactive"))
					);
					[tabEl, tabEl.firstElementChild].forEach((a) => (a.className = a.className.replace("inactive", "active")));
					tabEl.scrollIntoView({
					  behavior: 'smooth',
					  block: 'start',
					  //inline: 'center',
					});
				  }
				};*/
				// if tab text matches finder_panels[count], make it active
				if (a.innerText == finder_panels[count]) {
					let tabEl = a;
					if (a.className.includes("-label")) {
						tabEl = a.parentNode;
					}
					//make all other active tabs inactive
					document.querySelectorAll("[class^='kai-tab-active']").forEach(
						(a) => (a.className = a.className.replace("active", "inactive"))
					);
					//make this tab active
					[tabEl, tabEl.firstElementChild].forEach((a) => (a.className = a.className.replace("inactive", "active")));
					//view selected tab
					//_updateIndicator(count)


					tabEl.scrollIntoView({
						behavior: 'smooth',
						block: 'start',
						//inline: 'center',
					});


				}

			});

			//top_bar("◀", finder_panels[count], "▶");


			if (finder_panels[count] == "Information") {
				windowOpen = "finder";

				informationHandler.UpdateInfo()

			}
		}

	};

	function nav(move) {
		if ((windowOpen == "finder" || windowOpen == "markers_option" || windowOpen == "gpxtrack-info" || windowOpen == "tracks")) { //&& !$("input").is(":focus")
			//get items from current pannel
			let b = document.activeElement.parentNode;
			let items = b.querySelectorAll(".item");
			let items_list = [];
			for (let i = 0; i < items.length; i++) {
				if (items[i].style.display == "none") continue;
				if (items[i].parentNode.style.display == "block") {
					items_list.push(items[i]);
				}
			}

			if (document.activeElement.tagName == "INPUT" || document.activeElement.tagName == "TEXTAREA") {
				document.activeElement.parentNode.focus()
			}

			if (move == "+1") {
				if (tabIndex < items_list.length - 1) {
					tabIndex++;
					items_list[tabIndex].focus();
				}
			}

			if (move == "-1") {
				if (tabIndex > 0) {
					tabIndex--;
					items_list[tabIndex].focus();
				}
			}
			// smooth center scrolling
			const rect = document.activeElement.getBoundingClientRect();
			const elY =
				rect.top - document.body.getBoundingClientRect().top + rect.height / 2;

			document.activeElement.parentNode.scrollBy({
				left: 0,
				top: elY - window.innerHeight / 2,
				behavior: "smooth",
			});
		}
	}

	//////////////////////////////
	////MOZ ACTIVITY////////////
	//////////////////////////////

	if (navigator.mozSetMessageHandler) {
		navigator.mozSetMessageHandler("activity", function (activityRequest) {
			var option = activityRequest.source;
			//gpx
			if (option.name == "open") {
				loadGPX(option.data.url);
			}
			//link
			if (option.name == "view") {
				open_url = true;
				build_menu();
				document.querySelector("div#message").style.display = "none";
				document.querySelector("div#get-position").style.display = "none";
				maps.opencycle_map();
				//if url matches /^https?:\/\/(www\.)?osm\.org\/go\/([a-zA-Z0-9_\-~]+/
				if (option.data.url.match(/^https?:\/\/(www\.)?osm\.org\/go\/([a-zA-Z0-9_\-~]+)/)) {
					//ignore all url params
					let url = option.data.url.split("?")[0];
					const shortcode = url.split("/")[4];
					let addMarkerToMap = option.data.url.includes("&m") || option.data.url.includes("?m")
					let yxz = OSMShortCode.decode(shortcode);
					current_lat = yxz[0];
					current_lng = yxz[1];
					zoom_level = yxz[2];

					if (addMarkerToMap) myMarker = L.marker([current_lat, current_lng]).addTo(markers_group);
					map.setView([current_lat, current_lng], zoom_level);

				} else {
					const url_split = option.data.url.split("/");
					current_lat = url_split[url_split.length - 2];
					current_lng = url_split[url_split.length - 1];

					//remove !numbers
					current_lat = current_lat.replace(/[A-Za-z?=&]+/gi, "");
					current_lng = current_lng.replace(/[A-Za-z?=&]+/gi, "");
					current_lat = Number(current_lat);
					current_lng = Number(current_lng);

					myMarker = L.marker([current_lat, current_lng]).addTo(markers_group);
					map.setView([current_lat, current_lng], 13);
				}




				zoom_speed();
				kaiosToaster({
					message: "Updating location. Use * to go back to this marker",
					position: 'north',
					type: 'info',
				});
				setTimeout(function () {
					getLocation("init");
				}, 5000)

			}
		});
	}




	//////////////
	////LONGPRESS
	/////////////

	function longpress_action(param) {
		switch (param.key) {

			case "#":
				if (windowOpen == "map") maps.caching_tiles();
				break;
			case "6":
				if (navigator.hasFeature("device.capability.torch")) {
					let FlashLightManager = navigator.getFlashlightManager().then(function (Flashlight) {
						console.log(Flashlight)
						Flashlight.flashlightEnabled = !Flashlight.flashlightEnabled
						kaiosToaster({
							message: "Toggled Flashlight",
							position: 'north',
							type: 'info',
							timeout: 1000
						});
					})
				} else {
					kaiosToaster({
						message: "Your device does not have a front torch",
						position: 'north',
						type: 'warning',
						timeout: 2000
					});
				}


				break;
			case "3":
				switch (screen.orientation.type) {
					case 'portrait-primary':
						screen.orientation.lock('landscape-primary');
						break;
					case 'landscape-primary':
						screen.orientation.lock('portrait-secondary');
						break;
					case 'portrait-secondary':
						screen.orientation.lock('landscape-secondary');
						break;
					case 'landscape-secondary':
						screen.orientation.lock('portrait-primary');
						break;
				}
				break;
			case "0":

				if (windowOpen == "map") {
					maps.weather_map();
					return false;
				}
				break;

			case "4":
				if (windowOpen == "map") {
					// toggle north orientation (rotate map with heading)
					if (north_rotation == true) {
						north_rotation = false;
						kaiosToaster({
							message: "Device orientation",
							position: 'north',
							type: 'info',
							timeout: 2000
						});
					} else {
						north_rotation = true;
						map.setBearing(0)
						kaiosToaster({
							message: "North orientation",
							position: 'north',
							type: 'info',
							timeout: 2000
						});
					}
				}
				break;
			case "Backspace":
				if (windowOpen == "map") {
					if (confirm("Are you sure you want to reload?")) {
						windowOpen = "";
						window.location.reload()
					}
				}
				break;
			case "SoftLeft":
				if (windowOpen == "finder" && qrscan == true) {
					console.log("triggered")
					windowOpen = "scan";
					qrscan = false;
					bottom_bar("", "", "");
					qr.start_scan(function (callback) {
						document.getElementById("owm-key").value = callback;
						windowOpen == "finder"
					});

					break;
				}
				break;

		}
	}

	///////////////
	////SHORTPRESS
	//////////////

	function shortpress_action(param) {
		switch (param.key) {

			case "EndCall":
				if (windowOpen == "map" || windowOpen == "finder" || windowOpen == "markers_option" || windowOpen == "gpxtrack-info" || windowOpen == "tracks") {
					if (confirm("Are you sure you want to exit?")) {
						window.goodbye();
						windowOpen = "";
					}
				}
				break;

			case "Backspace":
				if (windowOpen == "gpxtrack-info" && !$("input").is(":focus")) {
					document.querySelector("div#gpxtrack-info").style.display = "none";
					document.querySelector('[data-map="view-gpxinfo"]').style.display = (current_gpx ? "block" : "none");
					finder_tabindex();
					document.querySelector("div#finder").style.display = "block";
					finder_navigation("start");
					windowOpen = "finder";
					break;
				}
				if (windowOpen == "tracks" && !$("input").is(":focus")) {
					document.querySelector("div#tracks").style.display = "none";
					finder_tabindex();
					document.querySelector("div#finder").style.display = "block";
					finder_navigation("start");
					windowOpen = "finder";
					break;
				}
				if ((windowOpen == "finder" || windowOpen == "markers_option") && !$("input").is(":focus")) {
					top_bar("", "", "");
					bottom_bar("", "", "");

					document.querySelector("div#finder").style.display = "none";
					if (selected_marker) selected_marker.off('move', selected_marker_onmove);
					selecting_marker = false;
					document.querySelector("div#markers-option").style.display = "none";
					document.querySelector("div#gpxtrack-info").style.display = "none";
					windowOpen = "map";

					break;
				}

				if (windowOpen == "coordinations") {
					coordinations("hide");
					break;
				}

				if (windowOpen == "scan") {
					qr.stop_scan();
					windowOpen = "finder";
					break;
				}

				if (document.activeElement.tagName == "INPUT" || document.activeElement.tagName == "TEXTAREA") {
					document.activeElement.parentNode.focus()
				}

				break;

			case "SoftLeft":
				if (windowOpen == "user-input" && save_mode == "geojson-tracking") {
					save_mode = "";
					user_input("close")
					tracking_ispaused = false;
					kaiosToaster({
						message: "Tracking resumed",
						position: 'north',
						type: 'info',
						timeout: 5000
					});
					break;
				}

				if (windowOpen == "user-input") {
					user_input("close");
					save_mode = "";
					break;
				}


				if (selecting_marker == true) {
					if (map.hasLayer(markers_group_osmnotes)) top_bar("", "", "");
					bottom_bar("", "", "");
					selected_marker.off('move', selected_marker_onmove)
					if (isjumpingtomarkeronmove) current_marker.off('move', marker_jumpto_onmove);
					selected_marker = "";
					selecting_marker = false;
					jump_index = 0;
					jump_closest_index = map.getCenter()
					break;
				}


				if (windowOpen == "search") {
					hideSearch();
					break;
				}

				if (windowOpen == "map") {
					ZoomMap("out");
					break;
				}




				break;

			case "SoftRight":
				if (windowOpen == "map") {
					ZoomMap("in");
					break;
				}

				if (windowOpen == "user-input" && save_mode == "geojson-single") {
					console.log(user_input("return") + ".geojson");
					geojson.save_geojson(
						user_input("return") + ".geojson",
						"single"
					);
					save_mode = "";
					user_input("close")
					break;
				}


				if (windowOpen == "user-input" && save_mode == "geojson-tracking") {
					if ((JSON.parse(localStorage.getItem("exportTracksAsGPX")) || true)) {
						geojson.save_geojson(user_input("return") + ".gpx", "tracking_gpx");

					} else {
						geojson.save_geojson(user_input("return") + ".geojson", "tracking");
					}

					save_mode = "";
					user_input("close")
					break;
				}


				if (windowOpen == "user-input" && save_mode == "geojson-collection") {
					geojson.save_geojson(user_input("return") + ".geojson", "collection");
					user_input("close")
					save_mode = "";
					break;
				}

				if (windowOpen == "user-input" && save_mode != "geojson") {
					filename = user_input("return");
					//save_delete_marker("save_marker");
					break;
				}




				break;

			case "Enter":
				if (windowOpen == "search") {
					L.marker([olc_lat_lng[0], olc_lat_lng[1]]).addTo(markers_group);
					map.setView([olc_lat_lng[0], olc_lat_lng[1]], 13);

					hideSearch();

					current_lat = Number(olc_lat_lng[0]);
					current_lng = Number(olc_lat_lng[1]);

					kaiosToaster({
						message: "Press 5 to save Marker",
						position: 'north',
						type: 'info',
						timeout: 5000
					});
					break;
				}

				if (windowOpen == "user-input" && save_mode == "geojson-tracking") {
					user_input("close");
					save_mode = "";
					module.measure_distance("destroy_tracking");
					kaiosToaster({
						message: "Tracking stopped",
						position: 'north',
						type: 'info',
						timeout: 5000
					});
					break;
				}


				if (document.activeElement == document.getElementById("clear-cache")) {
					if (confirm("Are you sure you want to delete all cached maps?")) {
						maps.delete_cache();
						break;
					}

					break;
				}

				if (document.activeElement.tagName == "INPUT" || document.activeElement.tagName == "TEXTAREA") {
					document.activeElement.parentNode.focus()
				}

				if (document.activeElement == document.getElementById("osm-oauth")) {
					OAuth_osm();

					break;
				}

				if (document.activeElement.classList.contains("input-container") || document.activeElement.classList.contains("textarea-container")) {
					document.activeElement.children[1].focus()
					//evventually add check for checkboxes
					if (document.activeElement == document.querySelector("input#owm-key")) {
						bottom_bar("SCAN QR", "", "");
						qrscan = true;

						document.querySelector("input#owm-key").addEventListener("blur", (event) => {
							qrscan = false;
							bottom_bar("", "", "");
						});
					}
				}
				if (document.activeElement == document.querySelector('[data-map="view-gpxinfo"]')) {
					document.querySelector('[data-map="view-gpxinfo"]').style.display = (current_gpx ? "block" : "none");

					view_gpxinfo()


					break;
				}

				if (windowOpen == "finder" || windowOpen == "tracks") {
					addMapLayers();
				}


				if (windowOpen == "finder") {
					if (document.activeElement == document.getElementById("save-settings")) {
						if (confirm("Are you sure you want to save settings?")) {
							settings.save_settings();
							document.querySelector("div#finder").style.display = "none";
							windowOpen = "map";
							top_bar("", "", "")
							break;
						}


						break;
					}
					

					break;
				}

				if (windowOpen == "map" && selecting_marker == true) {
					show_markers_options()
					break;
				}

				// check if document.activeElement has .comment class
				if (document.activeElement.className == "item list-item focusable comment") {
					if (map.hasLayer(markers_group_osmnotes)) {
						// open first <a> or <img> link if it exists
						if (document.activeElement.children[1].getElementsByTagName('a')[0]) {
							window.open(document.activeElement.children[1].getElementsByTagName('a')[0].href)
						} else if (document.activeElement.children[1].getElementsByTagName('img')[0]) {
							window.open(document.activeElement.children[1].getElementsByTagName('img')[0].src)
						}
					};
				}

				if (windowOpen == "markers_option" && selected_marker != "") {
					markers_action();
					break;
				}


				break;

			case "1":
				if (windowOpen == "map") {
					if (tracking_path) {
						kaiosToaster({
							message: "Tracking paused",
							position: 'north',
							type: 'info',
							timeout: 5000
						});
						save_mode = "geojson-tracking";
						//map fitbounds of tracking group
						map.fitBounds(tracking_group.getBounds());
						tracking_ispaused = true;
						user_input("open", moment(new Date()).format("[KaiMaps_Track]_YYYY-MM-DD_HH.mm.ss"), ((JSON.parse(localStorage.getItem("exportTracksAsGPX")) || true) ? "Export track as GPX" : "Export track as GeoJSON"));
						bottom_bar("Resume", "Discard", "Save")

						return true;
					} else {
						tracking_path = true;
						kaiosToaster({
							message: "Tracking started",
							position: 'north',
							type: 'info',
							timeout: 5000
						});
						module.measure_distance("tracking");
					}
				}
				break;

			case "2":
				if (windowOpen == "map") showSearch();
				break;

			case "3":

				if (windowOpen == "map") {
					show_finder();
				}

				break;

			case "4":
				if (windowOpen == "map") {
					if (center_to_Screen == true) {
						center_to_Screen = false
						kaiosToaster({
							message: "Stopped centering position",
							position: 'north',
							type: 'info',
							timeout: 2000
						});
						map.attributionControl.removeAttribution('(🔒)');
						screenWakeLock("unlock");
					} else {
						kaiosToaster({
							message: "Started centering position",
							position: 'north',
							type: 'info',
							timeout: 2000
						});
						center_to_Screen = true
						map.attributionControl.addAttribution('(🔒)');
						screenWakeLock("lock");
					}

				}

				break;

			case "5":
				if (windowOpen == "map") {
					save_mode = "geojson-single";
					user_input("open", moment(new Date()).format("[KaiMaps_Marker]_YYYY-MM-DD_HH.mm.ss"), "Save this Marker as GeoJson");
					bottom_bar("Cancel", "", "Save");
					break;
				}
				break;

			case "6":
				if (windowOpen == "map") coordinations("show");
				break;

			case "7": //&& confirm("Toggle ruler? (You will need to restart the app after using it)")
				if (windowOpen == "map") module.ruler_toggle();
				break;

			case "8":
				if (windowOpen == "map") {
					save_mode = "geojson-collection";
					user_input("open", moment(new Date()).format("[KaiMaps_Markers]_YYYY-MM-DD_HH.mm.ss"), "Export all Markers as GeoJSON");
					bottom_bar("Cancel", "", "Save");

				}

				break;

			case "9":
				if (windowOpen == "map") {
					// If OSM Notes are open, create a note
					if (map.hasLayer(markers_group_osmnotes)) return maps.create_osm_note(map.getCenter());
					// If isTracking, create a track waypoint
					if (tracking_path) {
						let name = prompt("Track Waypoint Name")
						if (name == null) return kaiosToaster({
							message: "Creation Cancelled",
							position: 'north',
							type: 'error',
							timeout: 2000
						});
						name = name || tracking_waypoints.length + 1
						module.measure_distance("tracking_waypoint", name);
					}
					// Otherwise create a marker to the map
					L.marker(map.getCenter()).addTo(markers_group);
				}

				break;

			case "0":
				if (windowOpen == "map") mozactivity.share_position();
				break;

			case "*":
				if (windowOpen == "map") {
					selected_marker = module.jump_to_layer();
					selecting_marker = true;
					bottom_bar("Cancel", "SELECT", "");
					if (selected_marker) selected_marker.on('move', selected_marker_onmove);
				}

				break;


				// The following lines of code adjust navigation to "rotate" based on the current screen orientation, and do not support devices with default landscape mode
			case "ArrowRight":

				/*
				switch (screen.orientation.type) {
					case 'portrait-primary':
						screen.orientation.lock('landscape-primary');
						break;
					case 'landscape-primary':
						screen.orientation.lock('portrait-secondary');
						break;
					case 'portrait-secondary':
						screen.orientation.lock('landscape-secondary');
						break;
					case 'landscape-secondary':
						screen.orientation.lock('portrait-primary');
						break;
				}
				*/
				if (screen.orientation.type == 'portrait-primary') MovemMap("right");
				if (screen.orientation.type == 'portrait-secondary') MovemMap("left");
				if (screen.orientation.type == 'landscape-primary') MovemMap("up") & nav("-1");
				if (screen.orientation.type == 'landscape-secondary') MovemMap("down") & nav("+1");

				if (windowOpen == "finder") {
					if (screen.orientation.type == 'portrait-primary') finder_navigation("+1");
					if (screen.orientation.type == 'portrait-secondary') finder_navigation("-1");

				}
				break;

			case "ArrowLeft":
				if (screen.orientation.type == 'portrait-primary') MovemMap("left");
				if (screen.orientation.type == 'portrait-secondary') MovemMap("right");
				if (screen.orientation.type == 'landscape-primary') MovemMap("down") & nav("+1");
				if (screen.orientation.type == 'landscape-secondary') MovemMap("up") & nav("-1");
				if (windowOpen == "finder") {
					if (screen.orientation.type == 'portrait-primary') finder_navigation("-1");
					if (screen.orientation.type == 'portrait-secondary') finder_navigation("+1");
				}
				break;

			case "ArrowUp":
				if (screen.orientation.type == 'portrait-primary') nav("-1") & MovemMap("up");
				if (screen.orientation.type == 'portrait-secondary') nav("+1") & MovemMap("down");
				if (screen.orientation.type == 'landscape-primary') MovemMap("left");
				if (screen.orientation.type == 'landscape-secondary') MovemMap("right");

				if (windowOpen == "finder") {
					if (screen.orientation.type == 'landscape-primary') finder_navigation("-1");
					if (screen.orientation.type == 'landscape-secondary') finder_navigation("+1");
				}
				break;

			case "ArrowDown":
				if (screen.orientation.type == 'portrait-primary') nav("+1") & MovemMap("down");
				if (screen.orientation.type == 'portrait-secondary') nav("-1") & MovemMap("up");
				if (screen.orientation.type == 'landscape-primary') MovemMap("right");
				if (screen.orientation.type == 'landscape-secondary') MovemMap("left");

				if (windowOpen == "finder") {
					if (screen.orientation.type == 'landscape-primary') finder_navigation("+1");
					if (screen.orientation.type == 'landscape-secondary') finder_navigation("-1");
				}
				break;
		}
	}

	/////////////////////////////////
	////shortpress / longpress logic
	////////////////////////////////

	function handleKeyDown(evt) {

		if (evt.key == "EndCall") evt.preventDefault();
		if (evt.key === 'MicrophoneToggle') evt.preventDefault();
		if (evt.key == "Backspace" && (!$("input").is(":focus") && windowOpen != "map")) evt.preventDefault();
		// For some reasons empty inputs don't focus so it allows the app to be minimized also in empty inputs
		if (!evt.repeat) {
			longpress = false;
			timeout = setTimeout(() => {
				longpress = true;
				longpress_action(evt);
			}, longpress_timespan);
		}

		if (evt.repeat) {
			longpress = false;
			repeat_action(evt);
		}
	}

	function handleKeyUp(evt) {
		if (evt.key == "Backspace") evt.preventDefault(); // Disable close app by holding backspace
		if (evt.key == "EndCall") evt.preventDefault();
		clearTimeout(timeout);
		if (!longpress) {
			shortpress_action(evt);
		}
	}

	document.addEventListener("keydown", handleKeyDown);
	document.addEventListener("keyup", handleKeyUp);

	setTimeout(function () {
		document.querySelector("div#intro-footer2").innerText = "Your page should be ready by now..";

		//get location if not an activity open url
		if (open_url === false) {
			build_menu();

			kaiosToaster({
				message: "Use 3 to access the main menu",
				position: 'north',
				type: 'info',
			});
			maps.opencycle_map();
			getLocation("init");
			//detect osm short link regex

			// /^https?:\/\/(www\.)?osm\.org\/go\/\w+/
			// \t^https:\\/\\/[a-z.]{0,4}openstreetmap.org\\/#map=(\\d){2}(\\/)[+-]?([0-9]*[.])?[0-9]+(\\/)[+-]?([0-9]*[.])?[0-9]+




			//   setTimeout(function () {
			//    document.querySelector(".leaflet-control-attribution").style.display =
			//     "none";
			//  }, 8000);
		}
		///set default map

		windowOpen = "map";
	}, 4000);

	map.addLayer(markers_group);
	map.addLayer(measure_group);
	map.addLayer(measure_group_path);
	map.addLayer(tracking_group);
	map.addLayer(unselectable_markers_group);

	window.PrintControl = new L.Control.BigImage().addTo(map)

});