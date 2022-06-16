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
      "theme",
      document.getElementById("theme").value
    );
    toaster("Settings Saved", 2000);
  };

  let load_settings = function () {
    document.getElementById("owm-key").value = "218d9d905d231fb8afc17678b43c2c14";
    document.getElementById("cache-time").value = localStorage.getItem(
      "cache-time"
    );
    document.getElementById("cache-zoom").value = localStorage.getItem(
      "cache-zoom"
    );
    document.getElementById("export-path").value = localStorage.getItem(
      "export-path"
    );

    document.getElementById("zoomposition").value = localStorage.getItem(
      "zoomposition"
    );
    document.getElementById("theme").value = localStorage.getItem(
      "theme"
    );
    document.getElementById("current_theme").setAttribute('href',"assets/css/themes/"+(localStorage.getItem("theme") || "light.css") );
    let settings_arr = [
      localStorage.getItem("export-path"),
      localStorage.getItem("owm-key"),
      localStorage.getItem("cache-time"),
      localStorage.getItem("cache-zoom"),
      localStorage.getItem("zoomposition"),
      localStorage.getItem("theme"),

    ];
    return settings_arr;
  };

  return {
    load_settings,
    save_settings,
  };
})();