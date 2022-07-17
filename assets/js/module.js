const module = (() => {
  ////////////////////
  ////RULER///////////
  ///////////////////
  var ruler_activ = false;
  let ruler = null;
  let ruler_toggle = function () {
    if (ruler_activ) {
      //$(".leaflet-interactive").remove();
      //$("div.leaflet-ruler").addClass("leaflet-ruler-clicked");
      // $(
      //  "div.leaflet-tooltip.result-tooltip.leaflet-zoom-animated.leaflet-tooltip-left"
      //).remove();
      //$("div.leaflet-ruler").remove();
      //$(".result-tooltip").remove();
      // $(".moving-tooltip").remove();
      top_bar("", "", "")

      L.control.ruler().remove();

      ruler_activ = false;
      navigator.spatialNavigationEnabled = false;

      return false;
    }
    if (!ruler_activ) {
      L.control.ruler().addTo(map);
      //$("div.leaflet-ruler").addClass("leaflet-ruler-clicked");

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
  let select_marker = function (marker) {
    let group = markers_group
    if (map.hasLayer(markers_group_osmnotes)) group = markers_group_osmnotes;

    if (current_marker && isjumpingtomarkeronmove) current_marker.off('move', marker_jumpto_onmove);
    map.panTo(marker._latlng, map.getZoom());
    if (group == markers_group_osmnotes) {
      top_bar("", marker.note_data.comments[0].text, "");
    }
    current_marker = marker
    isjumpingtomarkeronmove = true
    if (current_marker) current_marker.on('move', marker_jumpto_onmove);
  }

  let jmpt_0 = false

  let jump_to_layer = function () {
    let group = markers_group
    if (map.hasLayer(markers_group_osmnotes)) group = markers_group_osmnotes;

    let l = group.getLayers();
    let n = map.getCenter();
    let only_inbounds = !localStorage.getItem("select-offscreen-markers")
    let select_closest = localStorage.getItem("select-closest-markers")


    // Ignore all markers that are not in the map bounds
    l = only_inbounds ? l.filter((m) => {
      return map.getBounds().contains(m._latlng);
    }) : l;

    if (select_closest) {
    // Find the closest marker
    let closest = l.reduce((prev, curr) => {
      let d = n.distanceTo(curr._latlng);
      if (d < prev.d) return { d, m: curr };
      return prev;
    }, { d: Infinity, m: null });

    // If the jump_index is 0, set it to the closest marker's index
    if (closest.m && window.jump_index == 0) {
      // if already jumped to 0, jump to closest marker index + 1
      if (window.jump_index == l.indexOf(closest.m) && jmpt_0) {
        window.jump_index = (l.indexOf(closest.m) + 1) % l.length;
        jmpt_0 = false
      } else {
        window.jump_index = l.indexOf(closest.m);
        jmpt_0 = window.jump_index == l.indexOf(closest.m)
      }
    }
    else
      window.jump_index = (window.jump_index + 1) % l.length;
  } else {
    window.jump_index = (window.jump_index + 1) % l.length;
  }
   // jump_index = jump_index + 1;

    //if (jump_index > l.length - 1) jump_index = 0;
    select_marker(l[jump_index]);

    return l[jump_index];
  };



  window.jump_closest_index = map.getCenter()
  // Intended behavior: User clicks *, closest marker is selected, and marker navigation continues on from that marker's index 
  let jump_closest = function () {
    let group = markers_group
    if (map.hasLayer(markers_group_osmnotes)) group = markers_group_osmnotes;

    let l = group.getLayers();
    let n = map.getCenter();
    let only_inbounds = !localStorage.getItem("select-offscreen-markers")


    // Ignore all markers that are not in the map bounds
    l = only_inbounds ? l.filter((m) => {

      return map.getBounds().contains(m._latlng);
    }) : l;

    let closest = l.reduce((prev, curr) => {
      let d = L.latLng(n).distanceTo(curr._latlng);
      if (d < prev.distance) {
        return {
          distance: d,
          marker: curr
        };
      }
      return prev;
    }, {
      distance: Infinity,
      marker: null
    });

    jump_index = l.indexOf(closest.marker);
    select_marker(closest.marker);

    return closest.marker;
  }
  let jump_to_closest_marker = function () {
    let group = markers_group
    if (map.hasLayer(markers_group_osmnotes)) group = markers_group_osmnotes;

    let l = group.getLayers();
    let n = map.getCenter();

    // Ignore all markers that are not in the map bounds
    let l_in_bounds = only_inbounds ? l.filter((m) => {
      return map.getBounds().contains(m._latlng);
    }) : l;

    // Find the closest marker
    let closest = l_in_bounds[0];
    let closest_distance = map.distance(closest._latlng, n);

    // Sort by the closest markers to the map center that are not the current marker
    let closest_markers = l_in_bounds.sort((a, b) => {
      let a_distance = map.distance(a._latlng, n);
      let b_distance = map.distance(b._latlng, n);
      if (a_distance < b_distance) return -1;
      if (a_distance > b_distance) return 1;
      return 0;
    }).filter((m) => {
      return m._leaflet_id != closest._leaflet_id;
    });


    // If there are no other markers, jump to the closest marker
    if (closest_markers.length == 0) {
      select_marker(closest);
      return closest;
    }

    // If there is only one closest marker, use it
    if (closest_markers.length === 1) {
      console.log(1)
      closest = closest_markers[0];
    }
    // If there are no closest markers, use the first marker
    else if (closest_markers.length === 0 || l_in_bounds.length === 0) {
      console.log(2)
      closest = l[0];
    }
    // If there are multiple closest markers, use the first one first and jump through each of them individually
    else {
      console.log(3)

      closest = closest_markers[jump_index];

      // Jump to the next closest marker next time
      jump_index = l.indexOf(closest);
      if (jump_index > l.length - 1) jump_index = 0;
      if (jump_index < 0) jump_index = l.length - 1;

    }

    select_marker(closest);

    /*let closest_not_current = l_in_bounds.filter((m) => {
      return m._leaflet_id != current_marker._leaflet_id;
    }
    ).sort((a, b) => {
      return map.distance(a._latlng, n) - map.distance(b._latlng, n);
    }
    )[0];
    
    let closest_not_current_distance = map.distance(closest_not_current._latlng, n);

    if (current_marker != closest) {
      select_marker(closest);

    }
    else {
      current_marker = closest_not_current;
      select_marker(closest_not_current);

    }*/
    return current_marker;
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
  window.tracking_session = [];
  window.tracking_waypoints = [];

  let tracking_distance;

  let polyline = L.polyline(latlngs, path_option).addTo(measure_group_path);
  window.polyline_tracking = L.polyline(tracking_latlngs, path_option).addTo(
    tracking_group
  );

  function getGpxStringFromDatabase(name, date, tracking_points, way_points) {
    let gpxString = '';

    gpxString += '<?xml version="1.0" encoding="UTF-8" standalone="no" ?>\n';
    gpxString += '<gpx xmlns="http://www.topografix.com/GPX/1/1" creator="MapSource 6.16.3" version="1.1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">\n';

    // Metadata
    gpxString += '<metadata>\n' +
      '    <link href="https://github.com/Delta-Applications/KaiMap">\n' +
      '    <text>KaiMap for KaiOS</text>\n' +
      '    <name>' + name + '</name>\n' +
      '    </link>\n' +
      '    <time>' + date.toISOString() + '</time>\n' +
       (window.isLoggedIn ? '    <author>' + window.osm_username  +'</author>\n' : '')+ 
      
      '  </metadata>\n';
      //if window.isLoggedIn add author
  

    // Track points
    gpxString += '<trk>\n' +
      '    <name>' + name + '</name>\n' +
      '    <trkseg>\n';

    for (let i = 0; i < tracking_points.length; i++) {
      let track_point = tracking_points[i];
      gpxString += '<trkpt lat="' + track_point.lat + '" lon="' + track_point.lng + '">\n' +
        '        <ele>' + track_point.alt + '</ele>\n' +
        '        <time>' + new Date(track_point.timestamp).toISOString() + '</time>\n' +
        //sat
        '        <sat>' + track_point.sats + '</sat>\n' +
        '      </trkpt>\n';
    }
    gpxString += '    </trkseg>\n' +
      '  </trk>\n';

      // way_points
      if (way_points) {
        gpxString += '<wpts>\n';
        for (let i = 0; i < way_points.length; i++) {
          let way_point = way_points[i];
          gpxString += '<wpt lat="' + way_point.lat + '" lon="' + way_point.lng + '">\n' +
            '        <name>' + way_point.name + '</name>\n' +
            '        <ele>' + way_point.alt + '</ele>\n' +
            '        <time>' + new Date(way_point.timestamp).toISOString() + '</time>\n' +
            
            '      </wpt>\n';
        }
        gpxString += '</wpts>\n';
      }
  

    gpxString += '</gpx>';
    return gpxString;
  }

  const measure_distance = function (action, arg) {
    if (action == "destroy") {
      path_selection = false;
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
      current_gpx = "";
      localStorage.removeItem("tracking_session");
      localStorage.removeItem("tracking_waypoints")

      return true;
    }
    if (action == "tracking_waypoint") {
      let way_point = {
        lat: device_lat,
        lng: device_lng,
        alt: device_alt,
        name: arg||"Not set",
        timestamp: new Date().getTime(),
      };
      window.tracking_waypoints.push(way_point);
      localStorage.setItem("tracking_waypoints", tracking_waypoints)

      return true;
    }
    if (action == "tracking") {
      if (localStorage.getItem("tracking_session") != null) {
        if (
          window.confirm(
            "Looks like tracking has been interrupted before, would you like to restore the previous track?"
          )
        ) {
          let d = localStorage.getItem("tracking_session");
          window.tracking_waypoints = JSON.parse(localStorage.getItem("tracking_waypoints")) || tracking_waypoints;
          d = JSON.parse(d);

          tracking_session = d;
          //restore path
          for (let i = 0; i < tracking_session.length; i++) {
            polyline_tracking.addLatLng([
              tracking_session[i].lat,
              tracking_session[i].lng,
            ]);
          }
        } else {
          localStorage.removeItem("tracking_session");
          localStorage.removeItem("tracking_waypoints")
          tracking_session = [];
          tracking_waypoints = [];
        }
      } else {}
      if (setting.tracking_screenlock) screenWakeLock("lock", "screen");

      screenWakeLock("lock", "gps");
      let calc = 0;
      let passed_time = 0;

      // save point or not
      var previousForDistance = null;
      var previousPosition = null;
      /*  allTimeIntervals = [
        {value: 0, text: getTranslation('text_all_time')},
        {value: 1000, text: "1 s"},
        {value: 2000, text: "2 s"},
        {value: 5000, text: "5 s"},
        {value: 10000, text: "10 s"},
        {value: 15000, text: "15 s"},
        {value: 20000, text: "20 s"},
        {value: 30000, text: "30 s"},
        {value: 45000, text: "45 s"},
        {value: 60000, text: "60 s"},
        {value: 90000, text: "90 s"},
        {value: 120000, text: "2 min"},
        {value: 300000, text: "5 min"}
    ];

    allDistances = [
        {value: 0, text: getTranslation('text_all_points')},
        {value: 1, text: "1 m (3.28 ft)"},
        {value: 2, text: "2 m (6.56 ft)"},
        {value: 5, text: "5 m (16.40 ft)"},
        {value: 10, text: "10 m (32.8 ft)"},
        {value: 20, text: "20 m (65.62 ft)"},
        {value: 50, text: "50 m (164.04 ft)"},
        {value: 50, text: "100 m (328.08 ft)"}
    ]; */

      function decideTime(pos1, pos2) {
        let timeThreshold = 3000 //allTimeIntervals[newTrackPointTimeInterval].value;
        if (timeThreshold == 0) {
          return true;
        } else {
          let timePassed = pos2.timestamp - pos1.timestamp;
          if (timePassed > timeThreshold) {
            return true;
          } else {
            return false;
          }
        }
      }

      function decideDistance(pos1, pos2) {
        let distanceThreshold = 0 //allDistances[newTrackPointDistance].value;
        if (distanceThreshold == 0) {
          return true;
        } else {
          let distance = Math.abs(calc_distance(pos1.lat, pos1.lng, pos2.lat, pos2.lng));
          if (distance > distanceThreshold) {
            return true;
          } else {
            return false;
          }
        }
      }


      function decideSaveOrNot(pos) {
        if (previousPosition == null) {
          previousForDistance = previousPosition;
          previousPosition = pos;
          return true;
        } else {
          if (decideDistance(previousPosition, pos) && decideTime(previousPosition, pos)) {
            previousForDistance = previousPosition;
            previousPosition = pos;
            return true;
          } else {
            return false;
          }
        }
      }
      //
      window.tracking_ispaused = false
      window.tracking_interval = setInterval(function () {
        if (window.tracking_ispaused) {
          return;
        }
        GPSif = 0;
        try {
          GPSif = JSON.parse(navigator.engmodeExtension.fileReadLE('GPSif')).num;
        } catch (error) {
          data.GPSif = "Unavailable"
        }

        let point_data = {
          lat: device_lat, //Latitude
          lng: device_lng, //Longitude
          alt: device_alt, //Altitude
          sats: GPSif, //Satellites
          speed: device_speed, //Speed
          heading: device_heading, //Heading
          timestamp: new Date().getTime() //passed_time //Passed intervals since the start (multiply by 2150 to get milliseconds since start)//
        }
        if (!decideSaveOrNot(point_data)) {
          return;
        }
        passed_time += 1
        polyline_tracking.addLatLng([
          point_data.lat,
          point_data.lng,
        ]);



        tracking_session.push(point_data);

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

          if(JSON.parse(localStorage.getItem("fitBoundsWhileTracking")) && !center_to_Screen) map.fitBounds(tracking_group.getBounds());
          // set path as current gpx track
          current_gpx = new L.GPX(getGpxStringFromDatabase("Current Tracking Session", new Date(), tracking_session), {
            async: true,
          })

        }
        if (tracking_path == false) {
          clearInterval(tracking_interval);
          if (setting.tracking_screenlock) screenWakeLock("unlock", "screen");
          screenWakeLock("unlock", "gps");
        }
      }, 2150);
    }

    if (action == "addMarker") {
      path_selection = true;
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
    loadGPX_data,
    getGpxStringFromDatabase,
  };
})();