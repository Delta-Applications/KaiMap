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

  window.jump_index = 0;
  //move from window. to module. asap
  window.current_marker = ""
  window.isjumpingtomarkeronmove = false
  window.marker_jumpto_onmove = function () {
    map.panTo(current_marker._latlng);
  }
  let jump_to_layer = function () {
    let group = markers_group
    if (map.hasLayer(markers_group_osmnotes)) group = markers_group_osmnotes;

    let l = group.getLayers();
    let n = map.getCenter();


    // sort markers by distance to map center
    l.sort((a, b) => {
      return map.distance(a._latlng, n) - map.distance(b._latlng, n);
    });

    // TO:DO Ignore all markers that are not in the map bounds (somehow?)
    jump_index = jump_index + 1;

    if (jump_index > l.length - 1) jump_index = 0;

    if (current_marker && isjumpingtomarkeronmove) current_marker.off('move', marker_jumpto_onmove);
    map.panTo(l[jump_index]._latlng, map.getZoom());
    if (group == markers_group_osmnotes) {
      top_bar("", l[jump_index].note_data.comments[0].text, "");
    }
    current_marker = l[jump_index]
    isjumpingtomarkeronmove = true
    if (current_marker) current_marker.on('move', marker_jumpto_onmove);

 
    return l[jump_index];
  };
  window.jump_closest_index = map.getCenter()
  let jump_to_closest_marker = function () {
    let group = markers_group
    if (map.hasLayer(markers_group_osmnotes)) group = markers_group_osmnotes;

    let l = group.getLayers();

    // sort markers by closest to jump_closest_index
    l.sort((a, b) => {
      return map.distance(a._latlng, jump_closest_index) - map.distance(b._latlng, jump_closest_index);
    });


    let closest = l[0];
    let closest_distance = jump_closest_index.distanceTo(l[0]._latlng);
    for (let i = 1; i < l.length; i++) {
      let d = jump_closest_index.distanceTo(l[i]._latlng);
      console.log(i, d < closest_distance, map.getBounds().contains(l[i]._latlng), l[i]._latlng !== jump_closest_index)
      console.log(map.getBounds().contains(l[i]._latlng) && l[i] !== closest)
      if (i, map.getBounds().contains(l[i]._latlng) && l[i] !== closest) {
        // set jump_closest_index to previous closest marker
        jump_closest_index = closest._latlng;
        closest = l[i];
        closest_distance = d;
      }
    }

    map.panTo(closest._latlng, map.getZoom());
    if (group == markers_group_osmnotes) {
      top_bar("", closest.note_data.comments[0].text, "");
    }
    current_marker = closest
    isjumpingtomarkeronmove = true
    if (current_marker) current_marker.on('move', marker_jumpto_onmove);

    return closest;
  }



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
  let tracking_session = [];

  let tracking_distance;

  let polyline = L.polyline(latlngs, path_option).addTo(measure_group_path);
  let polyline_tracking = L.polyline(tracking_latlngs, path_option).addTo(
    tracking_group
  );

  function getGpxStringFromDatabase(session, tracking_points, way_points) {
    let gpxString = '';

    gpxString += '<?xml version="1.0" encoding="UTF-8" standalone="no" ?>\n';
    gpxString += '<gpx xmlns="http://www.topografix.com/GPX/1/1" creator="MapSource 6.16.3" version="1.1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">\n';

    // Metadata
    gpxString += '<metadata>\n' +
      '    <link href="http://www.nubilion.com">\n' +
      '    <text>Nubilion</text>\n' +
      '    <name>' + session.name + '</name>\n' +
      '    </link>\n' +
      '    <time>' + session.date.toISOString() + '</time>\n' +
      '  </metadata>\n';

    // Waypoints
    for (let i = 0; i < way_points.length; i++) {
      let way_point = way_points[i];
      gpxString += '<wpt lat="' + way_point.latitude + '" lon="' + way_point.longitude + '">\n' +
        '    <name>' + way_point.name + '</name>\n' +
        '    <time>' + way_point.date.toISOString() + '</time>\n' +
        '  </wpt>\n';
    }
    // Track points
    gpxString += '<trk>\n' +
      '    <name>' + session.name + '</name>\n' +
      '    <trkseg>\n';

    for (let i = 0; i < tracking_points.length; i++) {
      let track_point = tracking_points[i];
      gpxString += '<trkpt lat="' + track_point.latitude + '" lon="' + track_point.longitude + '">\n' +
        '        <ele>' + track_point.altitude + '</ele>\n' +
        '        <time>' + track_point.date.toISOString() + '</time>\n' +
        '      </trkpt>\n';
    }
    gpxString += '    </trkseg>\n' +
      '  </trk>\n';

    gpxString += '</gpx>';
    return gpxString;
  }

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
      localStorage.removeItem("tracking_session");
      return true;
    }

    if (action == "tracking") {
      if (localStorage.getItem("tracking_session") != null) {
        if (
          window.confirm(
            "Looks like tracking has been interrupted before, would you like to continue?"
          )
        ) {
          let d = localStorage.getItem("tracking_session");

          d = JSON.parse(d);

          tracking_session = d;
          //restore path
          for (let i = 0; i < tracking_session.length; i++) {
            console.log(tracking_session[i].lat);
            polyline_tracking.addLatLng([
              tracking_session[i].lat,
              tracking_session[i].lng,
            ]);
          }
        } else {
          localStorage.removeItem("tracking_session");
          tracking_session = [];
        }
      } else {}
      if (setting.tracking_screenlock) screenWakeLock("lock", "screen");

      screenWakeLock("lock", "gps");
      let calc = 0;
      let passed_time = 0;

      tracking_interval = setInterval(function () {
        console.log(tracking_session)
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


        tracking_session.push({
          lat: device_lat, //Latitude
          lng: device_lng, //Longitude
          alt: device_alt, //Altitude
          sats: GPSif, //Satellites
          speed: device_speed, //Speed
          heading: device_heading, //Heading
          time: new Date().getTime() //passed_time //Passed intervals since the start (multiply by 2150 to get milliseconds since start)//
        });

        if (tracking_session.length > 2) {
          var fe = polyline_tracking.getLatLngs(),
            tot = 0

          for (var i = 0; i < fe.length - 1; i++) {
            tot += L.latLng([fe[i].lat, fe[i].lng]).distanceTo([fe[i + 1].lat, fe[i + 1].lng])
          }
          tracking_distance = calc_distance(
            parseFloat(tracking_session[tracking_session.length - 1].lat),
            parseFloat(tracking_session[tracking_session.length - 1].lng),
            parseFloat(tracking_session[tracking_session.length - 2].lat),
            parseFloat(tracking_session[tracking_session.length - 2].lng)
          );
          calc += tracking_distance

          calc = (tot / 1000).toFixed(3) + " km"
          document.querySelector("div#distance-main").style.display = "block"
          document.querySelector("#distance-title").innerText = "Tracking Distance"
          document.querySelector("#distance").innerText = parseFloat(calc).toFixed(2) + " km";

          //check if old tracking
          let k = JSON.stringify(tracking_session);

          localStorage.setItem("tracking_session", k);
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

  function loadGPX_data(filename, callback) {
    if (filename) {
      let finder = new Applait.Finder({
        type: "sdcard",
        debugMode: false,
      });
      finder.search(filename);

      finder.on("fileFound", function (file, fileinfo, storageName) {
        //file reader

        let reader = new FileReader();

        reader.onerror = function (event) {
          helper.toaster("can't read file", 3000);
          reader.abort();
        };

        reader.onloadend = function (event) {
          callback(filename, event.target.result);
        };

        reader.readAsText(file);
      });
    }
  }




  return {
    measure_distance,
    ruler_toggle,
    jump_to_layer,
    jump_to_closest_marker,
    calc_distance,
    loadGPX_data
  };
})();