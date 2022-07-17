const geojson = ((_) => {
  ///////////
  //save geoJson file
  /////////////////
  const save_geojson = function (file_path_name, type) {
    let extData;

    if (type == "single") {
      // Create a marker
      let n = markers_group.getLayers();
      var marker = n[n.length - 1];
      // Get the GeoJSON object
      var single = marker.toGeoJSON();
      // Log to console

      extData = JSON.stringify(single);
    }

    if (type == "path") {
      let single = tracking_group.toGeoJSON();
      extData = JSON.stringify(single);
    }

    if (type == "tracking") {
      let e = tracking_group.toGeoJSON();
      e.features[0].properties.software = "KaiMap";
      extData = JSON.stringify(e);
    }
    
   
   
    if (type == "tracking_gpx") {
      extData = module.getGpxStringFromDatabase(file_path_name, new Date(tracking_session[0].timestamp), tracking_session, tracking_waypoints)
    }

    if (type == "collection") {
      let collection = markers_group.toGeoJSON();
      let bounds = map.getBounds();

      collection.bbox = [
        [
          bounds.getSouthWest().lng,
          bounds.getSouthWest().lat,
          bounds.getNorthEast().lng,
          bounds.getNorthEast().lat,
        ],
      ];

      extData = JSON.stringify(collection);
    }

    let geojson_file = new Blob([extData], {
      type: "application/json",
    });
    let sdcard = navigator.getDeviceStorage("sdcard");
    if (sdcard.lowDiskSpace) {
      kaiosToaster({
        message: "SD-Card Space is low",
        position: 'north',
        type: 'warning',
        timeout: 3000
      });
    }
    let requestAdd = sdcard.addNamed(geojson_file, file_path_name);

    requestAdd.onsuccess = function () {
      kaiosToaster({
        message: "Successfully exported file",
        position: 'north',
        type: 'success',
        timeout: 3000
      });
      windowOpen = "map";
    };

    requestAdd.onerror = function () {
      console.error(this.error)
      kaiosToaster({
        message: "Unable to write to file:" + this.error + " .",
        position: 'north',
        type: 'error',
        timeout: 3000
      });
      windowOpen = "map";
    };
  };

  return {
    save_geojson,
  };
})();