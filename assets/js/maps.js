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
    tilesLayer.on('tilecacheerror', function (ev) {
      kaiosToaster({
        message: "Cache Error @ " + ev.tile + ": " + ev.error,
        position: 'north',
        type: 'error',
        timeout: 2000
      });
      console.error("[CACHE CONTROL] Cache error: ", ev.tile, ev.error);
    });
  };

  let caching_tiles = function () {
    let swLat = map.getBounds()._southWest.lat;
    let swLng = map.getBounds()._southWest.lng;
    let neLat = map.getBounds()._northEast.lat;
    let neLng = map.getBounds()._northEast.lng;

    var bbox = L.latLngBounds(L.latLng(swLat, swLng), L.latLng(neLat, neLng));

    zoom_depth = localStorage.getItem("cache-zoom") || 12

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
      console.error("[CACHE CONTROL] Cache error: ", ev.tile, ev.error);
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
    if (tilesLayer) map.removeLayer(tilesLayer);
    kaiosToaster({
      message: "OpenCycleMap",
      position: 'north',
      type: 'info',
      timeout: 2000
    });
    kaiads.DisplayFullScreenAd();
    tilesUrl = 'https://tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=c88c645ad8f64411bef71105c00710bc';
    tilesLayer = L.tileLayer(tilesUrl, {
      useCache: true,
      saveToCache: false,
      crossOrigin: true,
      cacheMaxAge: caching_time,
      useOnlyCache: false,
      maxZoom: 17,
      attribution: "OpenCycleMap",
      cacheURLMask: "apikey=[^&]*",
    });
    map.addLayer(tilesLayer);
    zoom_level = map.getZoom() 
    caching_events();

  }

  function moon_map() {
    if (tilesLayer) map.removeLayer(tilesLayer);
    tilesUrl =
      "https://cartocdn-gusc.global.ssl.fastly.net/opmbuilder/api/v1/map/named/opm-moon-basemap-v0-1/all/{z}/{x}/{y}.png";
    tilesLayer = L.tileLayer(tilesUrl, {
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
    zoom_level = map.getZoom() 
    caching_events();
  }

  function toner_map() {
    if (tilesLayer) map.removeLayer(tilesLayer);
    kaiosToaster({
      message: "Toner Map",
      position: 'north',
      type: 'info',
      timeout: 2000
    });

    tilesUrl = "https://stamen-tiles.a.ssl.fastly.net/toner/{z}/{x}/{y}.png";
    tilesLayer = L.tileLayer(tilesUrl, {
      useCache: true,
      saveToCache: false,
      crossOrigin: true,
      cacheMaxAge: caching_time,
      useOnlyCache: false,
      maxZoom: 18,
      attribution: 'Toner Map',
    });

    map.addLayer(tilesLayer);
    zoom_level = map.getZoom() 
    caching_events();
  }


  //https://stackoverflow.com/questions/37229561/how-to-import-export-database-from-pouchdb
  function export_mapdata() {
    tilesLayer._db
      .info()
      .then(function (result) {
        console.log(result);
      })
      .catch(function (err) {
        console.log(err);
      });

    tilesLayer._db
      .allDocs({
        include_docs: true,
        attachments: true,
      })
      .then(function (result) {
        console.log(result);
      })
      .catch(function (err) {
        console.log(err);
      });
  }

  function import_mapdata({
    target: {
      files: [file],
    },
  }) {
    if (file) {
      const reader = new FileReader();
      reader.onload = ({
        target: {
          result
        }
      }) => {
        db.bulkDocs(
          JSON.parse(result), {
            new_edits: false
          }, // not change revision
          (...args) => console.log("DONE", args)
        );
      };
      reader.readAsText(file);
    }
  }

  function google_map() {
    if (tilesLayer) map.removeLayer(tilesLayer);
    kaiosToaster({
      message: "Google Street",
      position: 'north',
      type: 'info',
      timeout: 2000
    });
    kaiads.DisplayFullScreenAd();
    tilesUrl = 'http://mt1.google.com/vt/lyrs=m@146&hl=en&x={x}&y={y}&z={z}'
    tilesLayer = L.tileLayer(tilesUrl, {
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
    zoom_level = map.getZoom() 
    caching_events();
  }

  function satellite_map() {
    if (tilesLayer) map.removeLayer(tilesLayer);
    kaiosToaster({
      message: "Bing Aerial",
      position: 'north',
      type: 'info',
      timeout: 2000
    });
    kaiads.DisplayFullScreenAd();
    tilesLayer = new L.TileLayer.Bing('AplJXxD16sIAeNH3ZGeiYehGslopIApKbc6BwKFD8TJrOkvdEjUQ1nUQv178Gazx');
    map.addLayer(tilesLayer);
    zoom_level = map.getZoom() 
    caching_events();
  }
  //			//https://clarity.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}
  function clarity() {
    if (tilesLayer) map.removeLayer(tilesLayer);
    kaiosToaster({
      message: "Esri World Clarity",
      position: 'north',
      type: 'info',
      timeout: 2000
    });
    kaiads.DisplayFullScreenAd();

    tilesUrl = "https://clarity.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
    tilesLayer = L.tileLayer(tilesUrl, {
      useCache: true,
      saveToCache: false,
      crossOrigin: true,
      cacheMaxAge: caching_time,
      useOnlyCache: false,
      maxNativeZoom: 18,
      maxZoom: 20,
      attribution: "Esri World Clarity",
    });

    map.addLayer(tilesLayer);
    zoom_level = map.getZoom() 
    caching_events();

  }

  function opentopo_map() {
    if (tilesLayer) map.removeLayer(tilesLayer);
    kaiosToaster({
      message: "Here WeGo Hybrid",
      position: 'north',
      type: 'info',
      timeout: 2000
    });
    kaiads.DisplayFullScreenAd();

    tilesUrl = "https://{s}.aerial.maps.api.here.com/maptile/2.1/maptile/newest/hybrid.day/{z}/{x}/{y}/256/png8?app_id=xWVIueSv6JL0aJ5xqTxb&token=djPZyynKsbTjIUDOBcHZ2g&lg=ENG";
    tilesLayer = L.tileLayer(tilesUrl, {
      useCache: true,
      saveToCache: false,
      crossOrigin: true,
      cacheMaxAge: caching_time,
      useOnlyCache: false,
      maxZoom: 18,
      attribution: "Here WeGo Hybrid",
      subdomains: ['1', '2', '3']
    });

    map.addLayer(tilesLayer);
    zoom_level = map.getZoom() 
    caching_events();
  }

  let stravaLayer;

  function strava_heatmap(ame) {
    if (map.hasLayer(stravaLayer)) {
      map.removeLayer(stravaLayer);
      ame.children[2].checked = 0
      kaiosToaster({
        message: "Removed Layer",
        position: 'north',
        type: 'error',
        timeout: 1000
      });
      return false;
    }
    ame.children[2].checked = 1

    kaiosToaster({
      message: "OSM GPS Tracks",
      position: 'north',
      type: 'info',
      timeout: 2000
    });

    // STRAVA HEATMAP
    /* Unfortunately High-Res Heatmap is issued only to users with an account, here's a template if you have one
       and want to use the High-Res version: */
    // "https://heatmap-external-{s}.strava.com/tiles-auth/all/hot/{z}/{x}/{y}.png?Key-Pair-Id=MYVALUE&Policy=MYVALUE&Signature=MYVALUE" 
    // And here's the default low-res:
    // "https://heatmap-external-{s}.strava.com/tiles/all/hot/{z}/{x}/{y}.png"

    tilesUrl =
      "https://gps.tile.openstreetmap.org/lines/{z}/{x}/{y}.png"
    stravaLayer = L.tileLayer(tilesUrl, {
      /*useCache: true,
      saveToCache: false,
      crossOrigin: false,
      // Note: Something about crossOrigin makes it not work, /shrug
      // Set crossOrigin to false when using Low-Res/No Account
      // Comment out from useCache to useOnlyCache when using High-Res
      cacheMaxAge: caching_time,
      useOnlyCache: false,*/
      attribution: 'OpenStreetMap contributors',
      maxNativeZoom: 18,
      maxZoom: 18,
      //Set maxNativeZoom to 11 if using Low-Res
    });

    map.addLayer(stravaLayer);
    caching_events();
  }


  let owmLayer;

  function owm_precipit_layer(ame) {

    if (map.hasLayer(owmLayer)) {
      ame.children[2].checked = 0

      map.removeLayer(owmLayer);
      kaiosToaster({
        message: "Removed Layer",
        position: 'north',
        type: 'error',
        timeout: 1000
      });
      return false;
    }
    ame.children[2].checked = 1

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

  function owm_wind_layer(ame) {
    if (map.hasLayer(owmLayer2)) {
      ame.children[2].checked = 0

      map.removeLayer(owmLayer2);
      kaiosToaster({
        message: "Removed Layer",
        position: 'north',
        type: 'error',
        timeout: 1000
      });
      return false;
    }
    ame.children[2].checked = 1

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

  function owm_temp_layer(ame) {
    if (map.hasLayer(owmLayer3)) {
      map.removeLayer(owmLayer3);
      ame.children[2].checked = 0

      kaiosToaster({
        message: "Removed Layer",
        position: 'north',
        type: 'error',
        timeout: 1000
      });
      return false;
    }
    ame.children[2].checked = 1

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
    if (tilesLayer) map.removeLayer(tilesLayer);
    kaiosToaster({
      message: "OpenStreetMap",
      position: 'north',
      type: 'info',
      timeout: 2000
    });


    tilesUrl = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
    tilesLayer = L.tileLayer(tilesUrl, {
      useCache: true,
      saveToCache: false,
      crossOrigin: true,
      cacheMaxAge: caching_time,
      useOnlyCache: false,
      maxZoom: 18,

      attribution: 'OpenStreetMap',
    });

    map.addLayer(tilesLayer);
    zoom_level = map.getZoom() 
    caching_events();
  }

  let railwayLayer;

  function railway_layer(ame) {
    if (map.hasLayer(railwayLayer)) {
      ame.children[2].checked = 0

      map.removeLayer(railwayLayer);
      kaiosToaster({
        message: "Removed Layer",
        position: 'north',
        type: 'error',
        timeout: 1000
      });
      return false;
    }
    ame.children[2].checked = 1

    kaiosToaster({
      message: "Railways",
      position: 'north',
      type: 'info',
      timeout: 2000
    });


    tilesUrl = "https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png";

    railwayLayer = L.tileLayer(tilesUrl, {
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
  let earthquake_layer = function (ame) {
    if (map.hasLayer(markers_group_eq)) {
      ame.children[2].checked = 0

      map.removeLayer(markers_group_eq);
      kaiosToaster({
        message: "Removed Layer",
        position: 'north',
        type: 'error',
        timeout: 1000
      });
      return false;
    }

    if (navigator.onLine == false) {
      return kaiosToaster({
        message: "No Internet Connection",
        position: 'north',
        type: 'error',
        timeout: 1000
      });
    }

    ame.children[2].checked = 1

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

              ShowMap();
            }
          },

          // Popup
          onEachFeature: function (feature, layer) {
            console.log(feature);
          },
        }).addTo(map);
      });
  };

  //display osm contributors of map bounds in attribution control
  /*map.on("moveend", function () {
    if (zoom_level < 16) return;
    var bounds = map.getBounds();
    var southWest = bounds.getSouthWest();
    var northEast = bounds.getNorthEast();
    var bounds = [southWest.lng, southWest.lat, northEast.lng, northEast.lat];
    var url =
      "https://api.openstreetmap.org/api/0.6/map?bbox=" +
      bounds.join(",") 
    fetch(url)
    .then(function (data) {
      return data.text();
    })
    .then(function (data) {
      console.log(data);
      const parser = new DOMParser();
      const xml = parser.parseFromString(data, "application/xml");
      return xml
    })
      .then(function (data) {

        // list all contributors 
        var contributors = [];
        var contributors_list = data.querySelectorAll('[user]');
        for (var i = 0; i < contributors_list.length; i++) {
          contributors.push(contributors_list[i].getAttribute("user"));
        }
        // remove duplicates
        contributors = contributors.filter(function (item, pos) {
          return contributors.indexOf(item) == pos;
        });
        // display contributors
        var contributors_string = "";
        for (var i = 0; i < contributors.length; i++) {
         
          contributors_string += contributors[i] + ", ";
          if (contributors.length > 3 && i == 2) {
            contributors_string = contributors_string.slice(0, -2);
            contributors_string = contributors_string + " and " + (contributors.length - 3) + " more";
            break;
          }
        }
        console.log(contributors_string);
        var attribution =
          '<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
          contributors_string;
        map.attributionControl.setPrefix(attribution);
     

      
      });
  }
  );*/
  window.overlayers = {};

  let addMap = function (name, url, attribution, max_zoom, type, activeEl) {
    console.log(name, url, attribution, max_zoom, type, activeEl)
    //map
    if (type == "Map") {

      kaiosToaster({
        message: name || "?",
        position: 'north',
        type: 'info',
        timeout: 2000
      });
      if (tilesLayer) map.removeLayer(tilesLayer);

      tilesLayer = L.tileLayer(url, {
        useCache: true,
        saveToCache: false,
        crossOrigin: true,
        cacheMaxAge: caching_time,
        useOnlyCache: false,
        maxZoom: max_zoom,
        attribution: attribution,
      });
      map.addLayer(tilesLayer);
      zoom_level = map.getZoom() 
      caching_events();
      localStorage.setItem("last_map", url);

      if (navigator.onLine == true) {
        tilesLayer.on("tileerror", function (data) {
          url = url.replace("{z}", "1");
          url = url.replace("{y}", "1");
          url = url.replace("{x}", "1");
          console.log(data)
          let tile = data.tile
          let isLoaded = tile.complete && tile.naturalHeight !== 0
          console.log(isLoaded)
          if (!isLoaded) {
            // remove tile.crossOrigin attribute
            
            tile.crossOrigin = null;
            //tilesLayer.setUrl(url);
          }
      
          //helper.allow_unsecure(url);
        });
      }
    }
    //overlayer
    if (type == "Layer") {
      if (overlayers[url] && map.hasLayer(overlayers[url].layer)) {
        map.removeLayer(overlayers[url].layer);
        overlayers[url].element.children[2].checked = 0
        kaiosToaster({
          message: "Removed Layer",
          position: 'north',
          type: 'error',
          timeout: 1000
        });
        delete(overlayers[url])
        return false;
      }
      kaiosToaster({
        message: name + " Layer" || "?",
        position: 'north',
        type: 'info',
        timeout: 2000
      });
      console.log(name)

      overlayers[url] = {}
      overlayers[url].element = activeEl
      overlayers[url].element.children[2].checked = 1


      overlayers[url].layer = L.tileLayer(url, {
        useCache: true,
        saveToCache: false,
        crossOrigin: true,
        cacheMaxAge: caching_time,
        useOnlyCache: false,
        maxZoom: max_zoom,
        attribution: attribution,
      });

      map.addLayer(overlayers[url].layer);

      caching_events();
    }
  };


  map.on("layeradd", function (event) {

    Object.entries(overlayers).map(item => {
      if (map.hasLayer(item.layer)) {
        item.layer.bringToFront();
        return false;
      }
    })

  });


  // To-do: Add an OSM Notes layer, once clicked, it will fetch all the notes in the map bounds and create markers in a group
  // When the layer is disabled, the notes marker group is removed, when the layer is enabled, the * key will only select the notes markers,
  // and when clicked, it will show the note's data along with all of the comments, and possibly, allow the user to reply anonimously or with their osm account

  window.markers_group_osmnotes = new L.FeatureGroup();

  let osm_api_allnotes = 'https://api.openstreetmap.org/api/0.6/notes.json'
  let loaded_ids = {}

  function addOSMNote(data, selectNote) {
    L.geoJSON(data, {
      // Marker Icon


      pointToLayer: function (p, latlng) {
        if (loaded_ids[p.properties.id]) return;
        loaded_ids[p.properties.id] = true;
        let t = L.marker(latlng, {
          icon: L.divIcon({
            html: '<i class="eq-marker" style="color: red"></i>',
            iconSize: [10, 10],
            className: {
              closed: 'osmnote_closed-marker',
              open: 'osmnote_open-marker'
            } [p.properties.status],
          }),
        });


        t.note_data = p.properties
        console.log(p.properties)
        t.addTo(markers_group_osmnotes);
        map.addLayer(markers_group_osmnotes);

        if (selectNote) {
          if (selected_marker) selected_marker.off('move', selected_marker_onmove);
          selecting_marker = true;
          selected_marker = t;
          bottom_bar("Cancel", "SELECT", "");
          map.panTo(t._latlng, map.getZoom())
        };


        ShowMap();
      },

      // Popup
      onEachFeature: function (feature, layer) {
        console.log(feature);
      },
    }).addTo(map);
  }

  function boundsString(map) {
    var sw = map.getBounds().getSouthWest(),
      ne = map.getBounds().getNorthEast();
    return [sw.lng, sw.lat, ne.lng, ne.lat];
  }

  function fetchNotes() {
    if (zoom_level < 13) return kaiosToaster({
      message: "Zoom in to use this layer",
      position: 'north',
      type: 'error',
      timeout: 1000
    });

    fetch(osm_api_allnotes + '?bbox=' + boundsString(map))
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        addOSMNote(data)
      });

  }


  let osm_notes = function (ame) {
    if (map.hasLayer(markers_group_osmnotes)) {
      ame.children[2].checked = 0
      map.off("moveend", fetchNotes);

      map.removeLayer(markers_group_osmnotes);
      markers_group_osmnotes.clearLayers();
      kaiosToaster({
        message: "Removed Layer",
        position: 'north',
        type: 'error',
        timeout: 1000
      });
      return false;
    }
    if (navigator.onLine == false) {
      return kaiosToaster({
        message: "No Internet Connection",
        position: 'north',
        type: 'error',
        timeout: 1000
      });
    }

    ame.children[2].checked = 1

    kaiosToaster({
      message: "OSM Notes",
      position: 'north',
      type: 'info',
      timeout: 2000
    });






    fetchNotes()

    map.on("moveend", fetchNotes);

  };
  let osm_api_createnote = 'https://www.openstreetmap.org/api/0.6/notes.json'

  let create_osm_note = function (pos) {

    let text = prompt("Create OSM Note" + (localStorage.getItem("openstreetmap_token") ? " (You are logged in)" : ""));

    if (!text) return kaiosToaster({
      message: "Creation Cancelled",
      position: 'north',
      type: 'error',
      timeout: 2000
    });


    fetch(osm_api_createnote + "?lat=" + pos.lat + "&lon=" + pos.lng + "&text=" + encodeURIComponent(text) + encodeURIComponent(setting.messageSignature), {
        method: 'POST',
        body: JSON.stringify({}),
        headers: localStorage.getItem("openstreetmap_token") ? {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem("openstreetmap_token")
        } : {
          'Content-Type': 'application/json'
        }
      })
      .then(function (response) {
        console.log(response.json())
        //notify user of success
        kaiosToaster({
          message: "OSM Note Created",
          position: 'north',
          type: 'info',
          timeout: 2000
        });

        addOSMNote(response.json(), true)
      })

  }


  let close_osm_note = function (id) {
    let note = markers_group_osmnotes.getLayers().find(item => item.note_data.id == id)
    if (!note) return;
    if (!localStorage.getItem("openstreetmap_token")) return kaiosToaster({
      message: "You need to be logged in to comment",
      position: 'north',
      type: 'error',
      timeout: 1000
    });
    let text = encodeURIComponent(prompt("Close OSM Note (Can be left empty)" + (localStorage.getItem("openstreetmap_token") ? " (You are logged in)" : "")) || "");

    if (text) text += encodeURIComponent(setting.messageSignature);

    let close_url = text ? (note.note_data.close_url + "?text=" + text) : note.note_data.close_url;

    fetch(close_url, {
        method: 'POST',
        body: JSON.stringify({}),
        headers: localStorage.getItem("openstreetmap_token") ? {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem("openstreetmap_token")
        } : {
          'Content-Type': 'application/json'
        }
      })
      .then(response => response.json())
      .then(function (data) {
        console.log(data)
        //notify user of success
        kaiosToaster({
          message: "OSM Note Closed",
          position: 'north',
          type: 'success',
          timeout: 1000
        });
        note.note_data = data.properties;
        note.setIcon(L.divIcon({
          html: '<i class="eq-marker" style="color: red"></i>',
          iconSize: [10, 10],
          className: {
            closed: 'osmnote_closed-marker',
            open: 'osmnote_open-marker'
          } [data.properties.status],
        }));
        informationHandler.PreciseMarkerUpdate(note)
      })
  }

  let comment_osm_note = function (id) {
    let note = markers_group_osmnotes.getLayers().find(item => item.note_data.id == id)
    if (!note) return;
    let comment_url = note.note_data.comment_url
    // error if user is not logged in
    if (!localStorage.getItem("openstreetmap_token")) return kaiosToaster({
      message: "You need to be logged in to comment",
      position: 'north',
      type: 'error',
      timeout: 1000
    });

    let text = prompt("Comment on OSM Note" + (localStorage.getItem("openstreetmap_token") ? " (You are logged in)" : ""));
    if (text) text += encodeURIComponent(setting.messageSignature);

    if (!text) return;

    fetch(comment_url + "?text=" + text, {
        method: 'POST',
        body: JSON.stringify({
          text: text
        }),
        headers: localStorage.getItem("openstreetmap_token") ? {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem("openstreetmap_token")
        } : {
          'Content-Type': 'application/json'
        }
      })
      .then(response => response.json())
      .then(function (data) {
        console.log(data)
        // notify user of success
        kaiosToaster({
          message: "Comment added",
          position: 'north',
          type: 'success',
          timeout: 1000
        });

        note.note_data = data.properties;

        informationHandler.PreciseMarkerUpdate(note)
      })
  }


  let reopen_osm_note = function (id) {
    let note = markers_group_osmnotes.getLayers().find(item => item.note_data.id == id)
    if (!note) return;
    if (!localStorage.getItem("openstreetmap_token")) return kaiosToaster({
      message: "You need to be logged in to reopen",
      position: 'north',
      type: 'error',
      timeout: 1000
    });

    //let text = prompt("Reopen OSM Note (Can be left empty)" + (localStorage.getItem("openstreetmap_token") ? " (You are logged in)" : ""));
    //if (text) text += encodeURIComponent(setting.messageSignature);

    let reopen_url = note.note_data.reopen_url //text ? (note.note_data.reopen_url + "?text=" + text) : note.note_data.reopen_url;

    fetch(reopen_url, {
        method: 'POST',
        body: JSON.stringify({}),
        headers: localStorage.getItem("openstreetmap_token") ? {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem("openstreetmap_token")
        } : {
          'Content-Type': 'application/json'
        }
      })
      .then(response => response.json())
      .then(function (data) {
        console.log(data)

        // notify user of success
        kaiosToaster({
          message: "Note reopened",
          position: 'north',
          type: 'success',
          timeout: 1000
        });
        note.note_data = data.properties;
        note.setIcon(L.divIcon({
          html: '<i class="eq-marker" style="color: red"></i>',
          iconSize: [10, 10],
          className: {
            closed: 'osmnote_closed-marker',
            open: 'osmnote_open-marker'
          } [data.properties.status],
        }));
        informationHandler.PreciseMarkerUpdate(note)
      })
  }

  let running = false;
  let k;
  let weather_layer,
    weather_layer0,
    weather_layer1,
    weather_layer2,
    weather_layer3;

  function weather_map(ame) {
    kaiads.DisplayFullScreenAd();

    let weather_url;
    if (running == true) {
      top_bar("", "", "");
      map.removeLayer(weather_layer);
      map.removeLayer(weather_layer0);
      map.removeLayer(weather_layer1);
      map.removeLayer(weather_layer2);
      map.removeLayer(weather_layer3);
      ame.children[2].checked = 0

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
        ame.children[2].checked = 1

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
        weather_layer0 = L.tileLayer(weather_url0);

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
                moment.unix(data[data.length - 5]).format("DD/MM/YYYY HH:MM") + " (" + utility.getRelativeTime(data[data.length - 5], null) + ")",
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
                moment.unix(data[data.length - 4]).format("DD/MM/YYYY HH:MM") + " (" + utility.getRelativeTime(data[data.length - 4], null) + ")",
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
                moment.unix(data[data.length - 3]).format("DD/MM/YYYY HH:MM") + " (" + utility.getRelativeTime(data[data.length - 3], null) + ")",
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
                moment.unix(data[data.length - 2]).format("DD/MM/YYYY HH:MM") + " (" + utility.getRelativeTime(data[data.length - 2], null) + ")",
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
                moment.unix(data[data.length - 1]).format("DD/MM/YYYY HH:MM") + " (" + utility.getRelativeTime(data[data.length - 1], null) + ")",
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
    strava_heatmap,
    moon_map,
    addMap,
    earthquake_layer,
    satellite_map,
    clarity,
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
    osm_notes,
    create_osm_note,
    close_osm_note,
    reopen_osm_note,
    comment_osm_note,
  };
})();