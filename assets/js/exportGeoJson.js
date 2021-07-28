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
    let requestAdd = sdcard.addNamed(geojson_file, file_path_name);

    requestAdd.onsuccess = function () {
      kaiosToaster({
        message: "Successfully exported GeoJSON",
        position: 'north',
        type: 'success',
        timeout: 3000
      });
        windowOpen = "map";
    };

    requestAdd.onerror = function () {
      kaiosToaster({
        message: "Unable to write to file:"+ this.error+" .",
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
