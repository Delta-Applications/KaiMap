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

    toaster("saved successfully", 2000);
  };

  let load_settings = function () {
    document.getElementById("owm-key").value = "99d2594c090c1ee9a8ad525fd7a83f85";
    document.getElementById("cache-time").value = localStorage.getItem(
      "cache-time"
    );
    document.getElementById("cache-zoom").value = localStorage.getItem(
      "cache-zoom"
    );
    document.getElementById("export-path").value = localStorage.getItem(
      "export-path"
    );

    let settings_arr = [
      localStorage.getItem("export-path"),
      localStorage.getItem("owm-key"),
      localStorage.getItem("cache-time"),
      localStorage.getItem("cache-zoom"),
    ];
    return settings_arr;
  };

  return {
    load_settings,
    save_settings,
  };
})();
