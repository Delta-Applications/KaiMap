////////////////////
////MAPS////////////
///////////////////


const maps = (() => {
  //caching settings from settings panel
  if (settings[1] != "") {
    caching_time = Number(settings[1]) * 86400000;
  } else {
    caching_time = 86400000;
  }
  if (settings[3] != "") {
    if (settings[3] != null || settings[3] != undefined) {
      zoom_depth = localStorage.getItem("cache-zoom");

    } else {
      zoom_depth = 12;
    }
  } else {
    zoom_depth = 12;
  }

  let caching_events = function () {
    // Listen to cache hits and misses and spam the console
    tilesLayer.on("tilecachehit", function (ev) {
      //console.log("Cache hit: ", ev.url);
    });
    tilesLayer.on("tilecachemiss", function (ev) {
      //console.log("Cache miss: ", ev.url);
    });
    tilesLayer.on("tilecacheerror", function (ev) {
      //console.log("Cache error: ", ev.tile, ev.error);
    });
  };

  let caching_tiles = function () {
    let swLat = map.getBounds()._southWest.lat;
    let swLng = map.getBounds()._southWest.lng;
    let neLat = map.getBounds()._northEast.lat;
    let neLng = map.getBounds()._northEast.lng;

    var bbox = L.latLngBounds(L.latLng(swLat, swLng), L.latLng(neLat, neLng));
    tilesLayer.seed(bbox, 0, zoom_depth);
    if (windowOpen == "map") {
      top_bar("", "Downloading", "");
    }
    screenWakeLock("lock");

    // Display seed progress on console
    tilesLayer.on("seedprogress", function (seedData) {
      var percent =
        100 -
        Math.floor((seedData.remainingLength / seedData.queueLength) * 100);
      console.log("Seeding " + percent + "% done");
      if (windowOpen == "map") {
        document.querySelector("div#top-bar div.button-center").innerText =
          "Caching " + percent + "% done (" + (seedData.queueLength - seedData.remainingLength) + "/" + seedData.queueLength + ")";
      }
    });
    tilesLayer.on("seedend", function (seedData) {
      setTimeout(() => {
        if (windowOpen == "map") {
          top_bar("", "", "");
        }
        kaiosToaster({
          message: "Finished caching",
          position: 'north',
          type: 'success',
          timeout: 2000
        });
        screenWakeLock("unlock");
      }, 2000);

    });

    tilesLayer.on('tilecacheerror', function (ev) {
      kaiosToaster({
        message: "Cache Error @ " + ev.tile + ": " + ev.error,
        position: 'north',
        type: 'error',
        timeout: 2000
      });
    });

    /*tilesLayer.on('tilecachemiss',function(ev){
		  kaiosToaster({
        message: "Cache Miss: "+ev.url,
        position: 'north',
        type: 'warning',
        timeout: 2000
      });
		});*/ //Happens too frequently to be an important message

    tilesLayer.on("error", function (seedData) {
      top_bar("", "", "");
      screenWakeLock("unlock");
      kaiosToaster({
        message: "Failed caching: " + seedData,
        position: 'north',
        type: 'error',
        timeout: 2000
      });
    });
    tilesLayer.on("seedstart", function (seedData) {

    });
  };

  let delete_cache = function () {
    tilesLayer._db
      .destroy()
      .then(function (response) {
        toaster("Cache Cleared", 3000);
      })
      .catch(function (err) {
        console.log(err);
      });
  };

  function opencycle_map() {
    kaiosToaster({
      message: "OpenCycleMap",
      position: 'north',
      type: 'info',
      timeout: 2000
    });
    kaiads.DisplayFullScreenAd();
    tilesUrl = 'https://tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=c88c645ad8f64411bef71105c00710bc';
    tilesLayer = L.tileLayer(tilesUrl, {
      edgeBufferTiles: 1,
      useCache: true,
      saveToCache: false,
      crossOrigin: true,
      cacheMaxAge: caching_time,
      useOnlyCache: false,
      maxZoom: 17,
      attribution: "OpenCycleMap",
    });
    map.addLayer(tilesLayer);
    caching_events();

  }

  function moon_map() {

    tilesUrl =
      "https://cartocdn-gusc.global.ssl.fastly.net/opmbuilder/api/v1/map/named/opm-moon-basemap-v0-1/all/{z}/{x}/{y}.png";
    tilesLayer = L.tileLayer(tilesUrl, {
      edgeBufferTiles: 1,
      useCache: true,
      saveToCache: false,
      crossOrigin: true,
      cacheMaxAge: caching_time,
      useOnlyCache: false,
      maxZoom: 12,
      minZoom: 2,
      attribution: 'Moon Map',
    });

    map.addLayer(tilesLayer);
    caching_events();
  }

  function toner_map() {
    kaiosToaster({
      message: "Toner Map",
      position: 'north',
      type: 'info',
      timeout: 2000
    });

    tilesUrl = "https://stamen-tiles.a.ssl.fastly.net/toner/{z}/{x}/{y}.png";
    tilesLayer = L.tileLayer(tilesUrl, {
      edgeBufferTiles: 1,
      useCache: true,
      saveToCache: false,
      crossOrigin: true,
      cacheMaxAge: caching_time,
      useOnlyCache: false,
      maxZoom: 18,
      attribution: 'Toner Map',
    });

    map.addLayer(tilesLayer);
    caching_events();
  }

  function google_map() {
    kaiosToaster({
      message: "Google Street",
      position: 'north',
      type: 'info',
      timeout: 2000
    });
    kaiads.DisplayFullScreenAd();
    tilesUrl = 'http://mt1.google.com/vt/lyrs=m@146&hl=en&x={x}&y={y}&z={z}'
    tilesLayer = L.tileLayer(tilesUrl, {
      edgeBufferTiles: 1,
      useCache: true,
      saveToCache: false,
      crossOrigin: true,
      cacheMaxAge: caching_time,
      useOnlyCache: false,
      minZoom: 0,
      maxZoom: 18,
      format: 'image/jpeg',
      attribution: 'Google Street',
    });


    map.addLayer(tilesLayer);
    caching_events();
  }

  function satellite_map() {
    kaiosToaster({
      message: "Bing Aerial",
      position: 'north',
      type: 'info',
      timeout: 2000
    });
    kaiads.DisplayFullScreenAd();
    tilesLayer = new L.tileLayer.bing('AplJXxD16sIAeNH3ZGeiYehGslopIApKbc6BwKFD8TJrOkvdEjUQ1nUQv178Gazx');

    map.addLayer(tilesLayer);
    caching_events();
  }

  function opentopo_map() {
    kaiosToaster({
      message: "OpenTopoMap",
      position: 'north',
      type: 'info',
      timeout: 2000
    });
    kaiads.DisplayFullScreenAd();

    tilesUrl = "https://tile.opentopomap.org/{z}/{x}/{y}.png";
    tilesLayer = L.tileLayer(tilesUrl, {
      edgeBufferTiles: 1,
      useCache: true,
      saveToCache: false,
      crossOrigin: true,
      cacheMaxAge: caching_time,
      useOnlyCache: false,
      maxZoom: 17,
      attribution: "OpenTopoMap",
    });

    map.addLayer(tilesLayer);
    caching_events();
  }

  let owmLayer;

  function owm_precipit_layer() {

    if (map.hasLayer(owmLayer)) {
      map.removeLayer(owmLayer);
      kaiosToaster({
        message: "Removed Layer",
        position: 'north',
        type: 'error',
        timeout: 1000
      });
      return false;
    }

    kaiosToaster({
      message: "OWM Precipitation",
      position: 'north',
      type: 'info',
      timeout: 2000
    });



    tilesUrl =
      "https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=" +
      "99d2594c090c1ee9a8ad525fd7a83f85";
    owmLayer = L.tileLayer(tilesUrl, {
      useCache: true,
      saveToCache: false,
      crossOrigin: true,
      cacheMaxAge: caching_time,
      useOnlyCache: false,
      maxZoom: 18,
      attribution: 'OpenWeatherMap',
    });

    map.addLayer(owmLayer);
    caching_events();
  }



  let owmLayer2;

  function owm_wind_layer() {
    if (map.hasLayer(owmLayer2)) {
      map.removeLayer(owmLayer2);
      kaiosToaster({
        message: "Removed Layer",
        position: 'north',
        type: 'error',
        timeout: 1000
      });
      return false;
    }

    kaiosToaster({
      message: "OWM Wind",
      position: 'north',
      type: 'info',
      timeout: 2000
    });
    tilesUrl =
      "https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=" +
      "99d2594c090c1ee9a8ad525fd7a83f85";
    owmLayer2 = L.tileLayer(tilesUrl, {
      useCache: true,
      saveToCache: false,
      crossOrigin: true,
      cacheMaxAge: caching_time,
      useOnlyCache: false,
      maxZoom: 18,
      attribution: 'OpenWeatherMap',
    });

    map.addLayer(owmLayer2);
    caching_events();
  }


  let owmLayer3;

  function owm_temp_layer() {
    if (map.hasLayer(owmLayer3)) {
      map.removeLayer(owmLayer3);
      kaiosToaster({
        message: "Removed Layer",
        position: 'north',
        type: 'error',
        timeout: 1000
      });
      return false;
    }

    kaiosToaster({
      message: "OWM Temperature",
      position: 'north',
      type: 'info',
      timeout: 2000
    });

    tilesUrl =
      "https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=" +
      "99d2594c090c1ee9a8ad525fd7a83f85";
    owmLayer3 = L.tileLayer(tilesUrl, {
      useCache: true,
      saveToCache: false,
      crossOrigin: true,
      cacheMaxAge: caching_time,
      useOnlyCache: false,
      maxZoom: 18,
      attribution: 'OpenWeatherMap',
    });

    map.addLayer(owmLayer3);
    caching_events();
  }





  function osm_map() {

    kaiosToaster({
      message: "OpenStreetMap",
      position: 'north',
      type: 'info',
      timeout: 2000
    });


    tilesUrl = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
    tilesLayer = L.tileLayer(tilesUrl, {
      edgeBufferTiles: 1,
      useCache: true,
      saveToCache: false,
      crossOrigin: true,
      cacheMaxAge: caching_time,
      useOnlyCache: false,
      maxZoom: 18,

      attribution: 'OpenStreetMap',
    });

    map.addLayer(tilesLayer);
    caching_events();
  }

  let railwayLayer;

  function railway_layer() {
    if (map.hasLayer(railwayLayer)) {
      map.removeLayer(railwayLayer);
      kaiosToaster({
        message: "Removed Layer",
        position: 'north',
        type: 'error',
        timeout: 1000
      });
      return false;
    }

    kaiosToaster({
      message: "Railways",
      position: 'north',
      type: 'info',
      timeout: 2000
    });


    tilesUrl = "https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png";

    railwayLayer = L.tileLayer(tilesUrl, {
      edgeBufferTiles: 1,
      useCache: true,
      saveToCache: false,
      crossOrigin: true,
      cacheMaxAge: caching_time,
      useOnlyCache: false,
      maxZoom: 18,

      attribution: 'OpenRailwayMap',
    });

    map.addLayer(railwayLayer);
    tt = true;
    caching_events();
  }

  function formatDate(date, format) {
    const map = {
      mm: date.getMonth() + 1,
      dd: date.getDate(),
      yy: date.getFullYear().toString().slice(-2),
      yyyy: date.getFullYear(),
    };

    return format.replace(/mm|dd|yy|yyy/gi, (matched) => map[matched]);
  }

  let markers_group_eq = new L.FeatureGroup();
  let earthquake_layer = function () {
    if (map.hasLayer(markers_group_eq)) {
      map.removeLayer(markers_group_eq);
      kaiosToaster({
        message: "Removed Layer",
        position: 'north',
        type: 'error',
        timeout: 1000
      });
      return false;
    }
    kaiosToaster({
      message: "Earthquakes",
      position: 'north',
      type: 'info',
      timeout: 2000
    });

    const today = new Date();
    const two_days_before = new Date(Date.now() - 24 * 3600 * 1000);

    console.log(formatDate(two_days_before, "yy-mm-dd"));

    fetch(
        "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=" +
        formatDate(two_days_before, "yy-mm-dd") +
        "&endtime=" +
        formatDate(today, "yy-mm-dd")
        //"&latitude=47&longitude=7&maxradiuskm=1800"
      )
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        kaiosToaster({
          message: "Earthquakes Layer",
          position: 'north',
          type: 'info',
          timeout: 2000
        });

        L.geoJSON(data, {
          // Marker Icon



          pointToLayer: function (feature, latlng) {
            if (feature.properties.type == "earthquake") {
              let t = L.marker(latlng, {
                icon: L.divIcon({
                  html: '<i class="eq-marker" style="color: red"></i>',
                  iconSize: [10, 10],
                  className: "earthquake-marker",
                }),
              }).openTooltip();
              t.addTo(markers_group_eq);
              map.addLayer(markers_group_eq);

              windowOpen = "map";
            }
          },

          // Popup
          onEachFeature: function (feature, layer) {
            console.log(feature);
          },
        }).addTo(map);
      });
  };

  let running = false;
  let k;
  let weather_layer,
    weather_layer0,
    weather_layer1,
    weather_layer2,
    weather_layer3;

  function weather_map() {
    kaiads.DisplayFullScreenAd();

    let weather_url;
    if (running == true) {
      top_bar("", "", "");
      map.removeLayer(weather_layer);
      map.removeLayer(weather_layer0);
      map.removeLayer(weather_layer1);
      map.removeLayer(weather_layer2);
      map.removeLayer(weather_layer3);
      kaiosToaster({
        message: "Removed Layer",
        position: 'north',
        type: 'error',
        timeout: 1000
      });
      clearInterval(k);
      running = false;
      return false;
    }



    fetch("https://api.rainviewer.com/public/maps.json")
      .then(function (response) {
        running = true;

        kaiosToaster({
          message: "Rainviewer",
          position: 'north',
          type: 'info',
          timeout: 2000
        });


        return response.json();
      })
      .then(function (data) {
        weather_url =
          "https://tilecache.rainviewer.com/v2/radar/" +
          data[data.length - 5] +
          "/256/{z}/{x}/{y}/2/1_1.png";
        weather_layer = L.tileLayer(weather_url);

        weather_url0 =
          "https://tilecache.rainviewer.com/v2/radar/" +
          data[data.length - 4] +
          "/256/{z}/{x}/{y}/2/1_1.png";
        weather_layer0 = L.tileLayer(weather_url);

        weather_url1 =
          "https://tilecache.rainviewer.com/v2/radar/" +
          data[data.length - 3] +
          "/256/{z}/{x}/{y}/2/1_1.png";
        weather_layer1 = L.tileLayer(weather_url1);

        weather_url2 =
          "https://tilecache.rainviewer.com/v2/radar/" +
          data[data.length - 2] +
          "/256/{z}/{x}/{y}/2/1_1.png";
        weather_layer2 = L.tileLayer(weather_url2);

        weather_url3 =
          "https://tilecache.rainviewer.com/v2/radar/" +
          data[data.length - 1] +
          "/256/{z}/{x}/{y}/2/1_1.png";
        weather_layer3 = L.tileLayer(weather_url3);

        let tilesUrl = "https://tile.opentopomap.org/{z}/{x}/{y}.png";
        let tilesLayer = L.tileLayer(tilesUrl, {
          maxZoom: 18,
        });

        map.addLayer(weather_layer);
        map.addLayer(weather_layer0);
        map.addLayer(weather_layer1);
        map.addLayer(weather_layer2);
        map.addLayer(weather_layer3);

        let i = -1;
        k = setInterval(() => {
          i++;

          if (i == 0) {
            map.addLayer(weather_layer);
            map.removeLayer(weather_layer0);
            map.removeLayer(weather_layer1);
            map.removeLayer(weather_layer2);
            map.removeLayer(weather_layer3);
            if (windowOpen == "map") {
              top_bar(
                "",
                moment.unix(data[data.length - 4]).format("DD.MM.YYYY, HH:MM:SS") + " ("+ utility.getRelativeTime(data[data.length - 4], null)+")",
                ""
              );
            }
            //top_bar("", "a", "");
          }

          if (i == 1) {
            map.removeLayer(weather_layer);
            map.addLayer(weather_layer0);
            map.removeLayer(weather_layer1);
            map.removeLayer(weather_layer2);
            map.removeLayer(weather_layer3);
            if (windowOpen == "map") {
              top_bar(
                "",
                moment.unix(data[data.length - 4]).format("DD.MM.YYYY, HH:MM:SS") + " ("+ utility.getRelativeTime(data[data.length - 4], null)+")",
                ""
              );
            }
            //top_bar("", "a", "");
          }

          if (i == 2) {
            map.removeLayer(weather_layer);
            map.removeLayer(weather_layer0);
            map.addLayer(weather_layer1);
            map.removeLayer(weather_layer2);
            map.removeLayer(weather_layer3);
            if (windowOpen == "map") {
              top_bar(
                "",
                moment.unix(data[data.length - 4]).format("DD.MM.YYYY, HH:MM:SS") + " ("+ utility.getRelativeTime(data[data.length - 3], null)+")",
                ""
              );
            }
          }

          if (i == 3) {
            map.removeLayer(weather_layer);
            map.removeLayer(weather_layer0);
            map.removeLayer(weather_layer1);
            map.addLayer(weather_layer2);
            map.removeLayer(weather_layer3);
            if (windowOpen == "map") {
              top_bar(
                "",
                moment.unix(data[data.length - 4]).format("DD.MM.YYYY, HH:MM:SS") + " ("+ utility.getRelativeTime(data[data.length - 2], null)+")",
                ""
              );
            }
          }

          if (i == 4) {
            map.removeLayer(weather_layer);
            map.removeLayer(weather_layer0);
            map.removeLayer(weather_layer1);
            map.removeLayer(weather_layer2);
            map.addLayer(weather_layer3);
            if (windowOpen == "map") {
              top_bar(
                "",
                moment.unix(data[data.length - 4]).format("DD.MM.YYYY, HH:MM:SS") + " ("+ utility.getRelativeTime(data[data.length - 1], null)+")",
                ""
              );
            }
          }
          if (i == 5) {
            i = 0;
          }
        }, 2000);
      })
      .catch(function (err) {
        kaiosToaster({
          message: "Failed to load Rainviewer data",
          position: 'north',
          type: 'error',
          timeout: 3000
        });
        });
  }
  return {
    opencycle_map,
    moon_map,
    earthquake_layer,
    satellite_map,
    toner_map,
    google_map,
    opentopo_map,
    owm_precipit_layer,
    owm_wind_layer,
    owm_temp_layer,
    osm_map,
    weather_map,
    railway_layer,
    caching_tiles,
    delete_cache,
  };
})();