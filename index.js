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


//leaflet add basic map
let map = L.map("map-container", {
	zoomControl: false,
	dragging: false,
	keyboard: true,
	rotate: true,
	bearing: 0,
}).setView([48.39246714732355, -4.432210922241211], 16); // DEMO View

window.ScaleControl = L.control
	.scale({
		position: localStorage.getItem("zoomposition") || "topright",
		metric: true,
		imperial: false,
	})
	.addTo(map);

let settings_data = settings.load_settings();

let setting = {
	export_path: localStorage.getItem("export-path"),
	owm_key: localStorage.getItem("owm-key"),
	cache_time: localStorage.getItem("cache-time"),
	cache_zoom: localStorage.getItem("cache-zoom"),
	last_location: JSON.parse(localStorage.getItem("last_location")),
	openweather_api: localStorage.getItem("owm-key"),
	last_weather: localStorage.getItem("last_weather"),
	tracking_screenlock: JSON.parse(localStorage.getItem("tracking_screenlock")),

};

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
		if (windowOpen == "map" && $('div#search-box').css('display') == 'none') {
			if (in_out == "in") {
				current_zoom_level = current_zoom_level + 1;
				map.setZoom(current_zoom_level);
			}
			if (in_out == "out") {
				current_zoom_level = current_zoom_level - 1;
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
		return step;
	}

	/////////////////////
	//MAP NAVIGATION//
	/////////////////////

	function MovemMap(direction) {
		//if (!marker_latlng) {
		if (windowOpen == "map" || windowOpen == "coordinations") {
			if (center_to_Screen == true) return;
			let n = map.getCenter();

			if (selecting_marker) {
				selecting_marker = false;
				bottom_bar("", "", "");
			}

			current_lat = n.lat;
			current_lng = n.lng;

			if (direction == "left") {
				zoom_speed();

				current_lng = n.lng - step;
				map.panTo(new L.LatLng(current_lat, current_lng));
			}

			if (direction == "right") {
				zoom_speed();

				current_lng = n.lng + step;
				map.panTo(new L.LatLng(current_lat, current_lng));
			}

			if (direction == "up") {
				zoom_speed();

				current_lat = n.lat + step;
				map.panTo(new L.LatLng(current_lat, current_lng));
			}

			if (direction == "down") {
				zoom_speed();

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
		console.log("repeat", param)
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
					if (selected_marker) selected_marker.off('move', selected_marker_onmove);
					selected_marker = module.jump_to_layer();
					selecting_marker = true;
					bottom_bar("Cancel", "SELECT", "");
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

		el.insertAdjacentHTML(
			"afterend",
			'<div class="item list-item focusable" data-map="satellite"><p class="list-item__text">Bing Aerial</p><p class="list-item__subtext">Satellite</p></div>'
		);

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
				'<div class="item checkbox-container" data-map="osmnotes"><p class="checkbox-container__text">OSM Notes</p><p class="checkbox-container__subtext">Layer</p><input type="checkbox" tabindex="0" class="checkbox-container__input"/><div class="checkbox-container__checkbox"></div></div>'
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
				'<div class="item checkbox-container" data-map="strava-heatmap"><p class="checkbox-container__text">Strava Heatmap</p><p class="checkbox-container__subtext">Layer</p><input type="checkbox" tabindex="0" class="checkbox-container__input"/><div class="checkbox-container__checkbox"></div></div>'
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
		find_gpx();
		find_geojson();
		find_kml();
		load_maps();
		osm_server_list_gpx();
		finder_tabindex()

	};

	//////////////////////////////////
	//READ KML////////////////////////
	/////////////////////////////////
	let find_kml = function () {
		//search kml
		let finder_kml = new Applait.Finder({
			type: "sdcard",
			debugMode: false,
		});

		finder_kml.search(".kml");
		finder_kml.on("searchComplete", function (needle, filematchcount) {});

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
	let find_gpx = function () {
		//search gpx
		let finder_gpx = new Applait.Finder({
			type: "sdcard",
			debugMode: false,
		});

		finder_gpx.search(".gpx");
		finder_gpx.on("searchComplete", function (needle, filematchcount) {});

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

	let find_geojson = function () {
		//search geojson
		let finder = new Applait.Finder({
			type: "sdcard",
			debugMode: false,
		});
		finder.search(".geojson");

		finder.on("searchComplete", function (needle, filematchcount) {});
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
	let osm_server_list_gpx = function () {
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
				console.log(data);
				const parser = new DOMParser();
				const xml = parser.parseFromString(data, "application/xml");
				let s = xml.getElementsByTagName("user");

				let username = s[0].getAttribute("display_name");
				document
					.querySelector("#osm-oauth").innerText = username
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
				console.log(data);
				const parser = new DOMParser();
				const xml = parser.parseFromString(data, "application/xml");
				let s = xml.getElementsByTagName("gpx_file");
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
						for (let n = 0; n < s[i].childNodes.length; n++) {
							if (s[i].childNodes[n].tagName == "tag") {
								if (s[i].childNodes[n].textContent == setting.osm_tag) {
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
				finder_tabindex()
			})

			.catch((error) => {
				console.log(error);
			});
	};

	let osm_server_load_gpx = function (id) {
		console.log("token: " + localStorage.getItem("openstreetmap_token"));
		let n = "Bearer " + localStorage.getItem("openstreetmap_token");

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
				new L.GPX(gpx, {
						async: true,
					})
					.on("loaded", function (e) {
						map.fitBounds(e.target.getBounds());
					})
					.addTo(map);

				windowOpen = "map";
			})

			.catch((error) => {
				helper.side_toaster(error, 2000);
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
		formData.append("description", "uploaded from o.map");
		formData.append("visibility", "private");
		formData.append("file", blob, filename);

		return fetch("https://api.openstreetmap.org/api/0.6/gpx/create", {
				method: "POST",
				body: formData,
				headers: myHeaders,
			})
			.then((response) => response.text())
			.then((data) => {
				helper.side_toaster("file uploaded", 4000);
			})

			.catch((error) => {
				helper.side_toaster(error, 4000);
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

		if (selected_marker == myMarker) {
			document.querySelector("#remove_marker").style.display = "none"
		} // Delete remove marker option if marker is myMarker
		document.querySelector("div#markers-option").children[0].focus();
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

				document.querySelector("div#finder").style.display = "none";
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

				new L.GPX(gpx, {
						async: true,
					})
					.on("loaded", function (e) {
						map.fitBounds(e.target.getBounds());
					})
					.addTo(map);

				document.querySelector("div#finder").style.display = "none";
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

	let myMarker;
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
			document.getElementById("cross").style.opacity = 0;

			function showLocation(position) {

				if (retrying == true) {
					if (!confirmed && !prompted) {
						prompted = true;
						confirmed = confirm("The geolocation service is working again, update location?")
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

					myMarker.setRotationAngle(0);
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
			myMarker.setRotationAngle(0);
			myMarker.setIcon(default_icon);
			return true;
		}
	}

	/////////////////////////
	/////MENU///////////////
	////////////////////////
	function markers_action() {
		if (document.activeElement.className == "item list-item focusable" || document.activeElement.className == "item button-container__button focusable" && windowOpen == "markers_option") {
			let item_value = document.activeElement.getAttribute("data-action");

			if (item_value == "save_marker") {
				bottom_bar("", "", "")
				windowOpen = "map";
				selecting_marker = false;
				document.querySelector("div#markers-option").style.display = "none";
				if (selected_marker) selected_marker.on('move', selected_marker_onmove);
				save_mode = "geojson-single";
				user_input("open", document.querySelector("#marker-pluscode").innerText + "_" + now(), "Export marker in GeoJSON format");
				bottom_bar("Cancel", "", "Save");


			}

			if (item_value == "share_marker") {
				windowOpen = "map";
				selecting_marker = false;
				document.querySelector("div#markers-option").style.display = "none";
				if (selected_marker) selected_marker.on('move', selected_marker_onmove);
				mozactivity.share_marker_position(selected_marker._latlng, document.querySelector("#marker-pluscode").innerText)
				bottom_bar("", "", "")
			}






			if (item_value == "remove_marker") {
				if (confirm("Are you sure you want to remove this marker?") == true) {
					if (selected_marker) selected_marker.on('move', selected_marker_onmove);

					map.removeLayer(selected_marker);

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



	function addMapLayers(param) {
		if (document.activeElement.className == "item list-item focusable" || document.activeElement.className == "item checkbox-container" || document.activeElement.className == "item button-container__button focusable" && windowOpen == "finder") {
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
				console.assert(item_Value)
				osm_server_load_gpx(document.activeElement.getAttribute("data-id"));
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
			if (item_value == "satellite") {
				maps.satellite_map();

				document.querySelector("div#finder").style.display = "none";
				top_bar("", "", "");
				windowOpen = "map";
			}
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




			top_bar("◀", finder_panels[count], "▶");


			if (finder_panels[count] == "Information") {
				windowOpen = "finder";

				informationHandler.UpdateInfo()

			}
		}

	};

	function nav(move) {
		if ((windowOpen == "finder" || windowOpen == "markers_option")) { //&& !$("input").is(":focus")
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

			if (document.activeElement.tagName == "INPUT") {
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
				if (windowOpen == "finder") {
					addMapLayers("delete-marker");
					return false;
				}

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
				if (windowOpen == "map" || windowOpen == "finder" || windowOpen == "markers_option") {
					if (confirm("Are you sure you want to exit?")) {
						window.goodbye();
						windowOpen = "";
					}
				}
				break;

			case "Backspace":
				if ((windowOpen == "finder" || windowOpen == "markers_option") && !$("input").is(":focus")) {
					top_bar("", "", "");
					bottom_bar("", "", "");

					document.querySelector("div#finder").style.display = "none";
					if (selected_marker) selected_marker.on('move', selected_marker_onmove);
					document.querySelector("div#markers-option").style.display = "none";
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

				if (document.activeElement.tagName == "INPUT") {
					document.activeElement.parentNode.focus()
				}

				break;

			case "SoftLeft":
				if (windowOpen == "user-input" && save_mode == "geojson-tracking") {
					save_mode = "";
					user_input("close")
					kaiosToaster({
						message: "Tracking continued",
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
					geojson.save_geojson(user_input("return") + ".geojson", "tracking");
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
				if (document.activeElement == document.getElementById("osm-oauth")) {
					OAuth_osm();

					break;
				}

				if (document.activeElement.classList.contains("input-container")) {
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

				if (
					document.activeElement == document.getElementById("save-settings")
				) {
					if (confirm("Are you sure you want to save settings?")) {
						settings.save_settings();
						break;
					}


					break;
				}


				if (windowOpen == "finder") {
					addMapLayers("add-marker");

					break;
				}

				if (windowOpen == "map" && selecting_marker == true) {
					show_markers_options()
					break;
				}
				
				// check if document.activeElement has .comment class
				if (document.activeElement.className == "item list-item focusable comment") {
					if (map.hasLayer(markers_group_osmnotes)) window.open(document.activeElement.childNodes[1].getElementsByTagName('a')[0].href);
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
						user_input("open", now(), "Export tracked path as GeoJSON");
						bottom_bar("Continue", "Delete", "Save")

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
					user_input("open", now(), "Save this Marker as a GeoJson file");
					bottom_bar("Cancel", "", "Save");
					break;
				}
				break;

			case "6":
				if (windowOpen == "map") coordinations("show");
				break;

			case "7":
				if (windowOpen == "map" && confirm("Toggle ruler? (You will need to restart the app after using it)")) module.ruler_toggle();
				break;

			case "8":
				if (windowOpen == "map") {
					save_mode = "geojson-collection";
					user_input("open", now(), "Export all Markers as a GeoJSON file");
					bottom_bar("Cancel", "", "Save");

				}

				break;

			case "9":
				if (windowOpen == "map")
					if (map.hasLayer(markers_group_osmnotes)) return maps.create_osm_note(map.getCenter());
				L.marker(map.getCenter()).addTo(markers_group);
				break;

			case "0":
				if (windowOpen == "map") mozactivity.share_position();
				break;

			case "*":
				if (windowOpen == "map") {
					if (selected_marker) selected_marker.off('move', selected_marker_onmove);
					selected_marker = module.jump_to_layer();
					selecting_marker = true;
					bottom_bar("Cancel", "SELECT", "");
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
});