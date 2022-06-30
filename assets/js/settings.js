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
    document.getElementById("cache-time").value = localStorage.getItem("cache-time");
    document.getElementById("cache-zoom").value = localStorage.getItem("cache-zoom");
    document.getElementById("export-path").value = localStorage.getItem("export-path");
    document.getElementById("marker-virtualization").checked = localStorage.getItem("marker-virtualization");
    document.getElementById("zoomposition").value = localStorage.getItem("zoomposition") || "tr";

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