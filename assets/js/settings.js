const settings = ((_) => {
  let save_settings = function () {
    localStorageWriteRead("owm-key", document.getElementById("owm-key").value);
    localStorageWriteRead(
      "cache-time",
      document.getElementById("cache-time").value
    );
    localStorageWriteRead(
      "cache-zoom",
      document.getElementById("cache-zoom").value
    );
    localStorageWriteRead(
      "export-path",
      document.getElementById("export-path").value
    );
    localStorageWriteRead(
      "zoomposition",
      document.getElementById("zoomposition").value
    );
    localStorageWriteRead(
      "marker-virtualization",
      document.getElementById("marker-virtualization").checked)
    // pan-speed
    localStorageWriteRead(
      "pan-speed",
      document.getElementById("pan-speed").value);
    // zoom-speed
    localStorageWriteRead(
      "zoom-speed",
      document.getElementById("zoom-speed").value);
      // select-offscreen-markers
    localStorageWriteRead(
      "select-offscreen-markers",
      document.getElementById("select-offscreen-markers").checked);
      //invertmaptiles

    localStorageWriteRead(
      "invertmaptiles",
      document.getElementById("invertmaptiles").checked);

      //fitBoundsWhileTracking
    localStorageWriteRead(
      "fitBoundsWhileTracking",
      document.getElementById("fitBoundsWhileTracking").checked);

      //exportTracksAsGPX
    localStorageWriteRead(
      "exportTracksAsGPX",
      document.getElementById("exportTracksAsGPX").checked);
      
    localStorageWriteRead("theme", document.getElementById("theme").value);
    kaiosToaster({
      message: "Saved settings",
      position: 'north',
      type: 'info',
      timeout: 2000
    });
    load_settings()
  };

  let load_settings = function () {
    document.getElementById("owm-key").value = document.getElementById("owm-key").value || "218d9d905d231fb8afc17678b43c2c14";
    document.getElementById("cache-time").value = localStorage.getItem("cache-time") || 7;
    document.getElementById("cache-zoom").value = localStorage.getItem("cache-zoom") || 12;
    document.getElementById("export-path").value = localStorage.getItem("export-path");
    document.getElementById("marker-virtualization").checked = JSON.parse(localStorage.getItem("marker-virtualization"));
    document.getElementById("zoomposition").value = localStorage.getItem("zoomposition") || "tr";
    
    // select-offscreen-markers
    document.getElementById("select-offscreen-markers").checked =  JSON.parse(localStorage.getItem("select-offscreen-markers"));
    //invertmaptiles

    document.getElementById("invertmaptiles").checked = JSON.parse(localStorage.getItem("invertmaptiles"));
    function invertMapTiles(bool) {
      document.querySelector("#map-container").style.filter = bool ? 'invert(100%)' : 'invert(0%)';
    }
    invertMapTiles(document.getElementById("invertmaptiles").checked);

    // fitBoundsWhileTracking
    document.getElementById("fitBoundsWhileTracking").checked = JSON.parse(localStorage.getItem("fitBoundsWhileTracking"));

    // export-gpx
    document.getElementById("exportTracksAsGPX").checked = JSON.parse(localStorage.getItem("exportTracksAsGPX"));

    // pan-speed
    document.getElementById("pan-speed").value = localStorage.getItem("pan-speed") || "1";
    // zoom-speed
    document.getElementById("zoom-speed").value = localStorage.getItem("zoom-speed") || "1";

    if (localStorage.getItem("zoomposition")) {
      switch (localStorage.getItem("zoomposition")) {
        case "tl":
          window.ScaleControl.setPosition("topleft");
          break;
        case "tr":
          window.ScaleControl.setPosition("topright");
          break;
        case "bl":
          window.ScaleControl.setPosition("bottomleft");
          break;
        case "br":
          window.ScaleControl.setPosition("bottomright");
          break;
        default:
          window.ScaleControl.setPosition("topright");
          break;
      }
    }


    document.getElementById("theme").value = localStorage.getItem("theme");
    document
      .getElementById("current_theme")
      .setAttribute(
        "href",
        "assets/css/themes/" + (localStorage.getItem("theme") || "light.css")
      );
    let settings_arr = [
      localStorage.getItem("export-path"),
      localStorage.getItem("owm-key"),
      localStorage.getItem("cache-time"),
      localStorage.getItem("cache-zoom"),
      localStorage.getItem("zoomposition"),
      localStorage.getItem("theme"),
      localStorage.getItem("marker-virtualization"),
    ];
    return settings_arr;
  };

  return {
    load_settings,
    save_settings,
  };
})();