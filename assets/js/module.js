const module = (() => {
  ////////////////////
  ////RULER///////////
  ///////////////////
  var ruler_activ = false;
  let ruler_toggle = function () {
    if (ruler_activ) {
      $(".leaflet-interactive").remove();
      $("div.leaflet-ruler").addClass("leaflet-ruler-clicked");
      $(
        "div.leaflet-tooltip.result-tooltip.leaflet-zoom-animated.leaflet-tooltip-left"
      ).remove();
      $("div.leaflet-ruler").remove();
      $(".result-tooltip").remove();
      $(".moving-tooltip").remove();

      L.control.ruler().remove();

      ruler_activ = false;
      navigator.spatialNavigationEnabled = false;

      return false;
    }
    if (!ruler_activ) {
      L.control.ruler().addTo(map);
      $("div.leaflet-ruler").addClass("leaflet-ruler-clicked");

      navigator.spatialNavigationEnabled = true;
      ruler_activ = true;

      return false;
    }
  };

  let index = 0;
  let jump_to_layer = function () {
    let l = markers_group.getLayers();
    index = index + 1;

    console.log(l.length);

    if (index > l.length - 1) index = 0;

    map.setView(l[index]._latlng, map.getZoom());
    //console.log(l[index]._leaflet_id);
    let p = l[index]._leaflet_id;
    return l[index];
  };

  let calc_distance = function (from_lat, from_lng, to_lat, to_lng) {
    distance = map.distance([from_lat, from_lng], [to_lat, to_lng]) / 1000;

    distance = distance.toFixed(2);

    return distance;
  };


  /////////////////////
  ////PATH & TRACKING
  ///////////////////

  let popup_option = {
    closeButton: false,
    maxWidth: 200,
    maxHeight: 200,
  };

  let path_option = {
    color: "#3388ff",
    step: 0,
  };

  let distances = [];
  let latlngs = [];
  let tracking_latlngs = [];
  let tracking_interval;
  let tracking_cache = [];

  let tracking_distance;

  let polyline = L.polyline(latlngs, path_option).addTo(measure_group_path);
  let polyline_tracking = L.polyline(tracking_latlngs, path_option).addTo(
    tracking_group
  );

  const measure_distance = function (action) {
    if (action == "destroy") {
      status.path_selection = false;
      measure_group_path.clearLayers();
      measure_group.clearLayers();
      polyline = L.polyline(latlngs, path_option).addTo(measure_group_path);
      return true;
    }

    if (action == "destroy_tracking") {
      tracking_group.clearLayers();
      polyline_tracking = L.polyline(tracking_latlngs, path_option).addTo(
        tracking_group
      );
      tracking_path = false;
      localStorage.removeItem("tracking_cache");
      return true;
    }

    if (action == "tracking") {
      if (localStorage.getItem("tracking_cache") != null) {
        if (
          window.confirm(
            "Looks like tracking has been interrupted before, would you like to continue?"
          )
        ) {
          let d = localStorage.getItem("tracking_cache");

          d = JSON.parse(d);

          tracking_cache = d;
          //restore path
          for (let i = 0; i < tracking_cache.length; i++) {
            console.log(tracking_cache[i].lat);
            polyline_tracking.addLatLng([
              tracking_cache[i].lat,
              tracking_cache[i].lng,
            ]);
          }
        } else {
          localStorage.removeItem("tracking_cache");
          tracking_cache = [];
        }
      } else {}
      if (setting.tracking_screenlock) screenWakeLock("lock", "screen");

      screenWakeLock("lock", "gps");
      let calc = 0;
      let passed_time = 0;

      tracking_interval = setInterval(function () {
        console.log(tracking_cache)
        passed_time += 1
        polyline_tracking.addLatLng([
          device_lat,
          device_lng,
        ]);

        GPSif = 0;
        try {
          GPSif = JSON.parse(navigator.engmodeExtension.fileReadLE('GPSif')).num;
        } catch (error) {
          data.GPSif = "Unavailable"
        }


        tracking_cache.push({
          lat: device_lat, //Latitude
          lng: device_lng, //Longitude
          alt: device_alt, //Altitude
          sats: GPSif, //Satellites
          speed: device_speed,//Speed
          heading: device_heading,//Heading
          time: new Date().getTime()//passed_time //Passed intervals since the start (multiply by 2150 to get milliseconds since start)//
        });

        if (tracking_cache.length > 2) {
          var fe = polyline_tracking.getLatLngs(), tot = 0

          for (var i = 0; i < fe.length - 1; i++) {
            tot += L.latLng([fe[i].lat, fe[i].lng]).distanceTo([fe[i + 1].lat, fe[i + 1].lng])
          }
          tracking_distance = calc_distance(
            parseFloat(tracking_cache[tracking_cache.length - 1].lat),
            parseFloat(tracking_cache[tracking_cache.length - 1].lng),
            parseFloat(tracking_cache[tracking_cache.length - 2].lat),
            parseFloat(tracking_cache[tracking_cache.length - 2].lng)
          );
          calc += tracking_distance

          calc = (tot / 1000).toFixed(3) + " km"
          document.querySelector("div#distance-main").style.display = "block"
          document.querySelector("#distance-title").innerText = "Tracking Distance"
          document.querySelector("#distance").innerText = parseFloat(calc).toFixed(2) + " km";

          //check if old tracking
          let k = JSON.stringify(tracking_cache);

          localStorage.setItem("tracking_cache", k);
        }
        if (tracking_path == false) {
          clearInterval(tracking_interval);
          if (setting.tracking_screenlock) screenWakeLock("unlock", "screen");
          screenWakeLock("unlock", "gps");
        }
      }, 2150);
    }

    if (action == "addMarker") {
      status.path_selection = true;
      L.marker([current_lat, current_lng])
        .addTo(measure_group)
        .setIcon(maps.select_icon);

      let l = measure_group.getLayers();

      polyline.addLatLng([current_lat, current_lng]);

      if (l.length < 2) return false;
      let dis = calc_distance(
        l[l.length - 1]._latlng.lat,
        l[l.length - 1]._latlng.lng,
        l[l.length - 2]._latlng.lat,
        l[l.length - 2]._latlng.lng
      );

      distances.push(dis);
      let calc = 0;

      for (let i = 0; i < distances.length; i++) {
        calc += distances[i];
      }
      calc = calc / 1000;
      calc.toFixed(2);
      parseFloat(calc);

      l[l.length - 1]
        .bindPopup(calc.toString() + "km", popup_option)
        .openPopup();
    }
  };




  return {
    measure_distance,
    ruler_toggle,
    jump_to_layer,
    calc_distance,
  };
})();