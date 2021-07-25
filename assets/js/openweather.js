const weather = (() => {
  let errorcool = false
  let openweather_call = function (lat, lng, apikey, callback) {
    console.log(lat + "/" + lng + "/" + apikey);

    let xhr = new XMLHttpRequest({
      mozSystem: true,
    });
    xhr.open(
      "GET",
      "https://api.openweathermap.org/data/2.5/forecast?units=metric&lat=" +
      lat +
      "&lon=" +
      lng +
      "&appid=" +
      "99d2594c090c1ee9a8ad525fd7a83f85"
    );
    xhr.timeout = 4000; // time in milliseconds

    xhr.ontimeout = function (e) {};

    xhr.onload = function () {
      if (xhr.status == 200) {
        console.log(JSON.stringify(JSON.parse(xhr.responseText)))
        callback(JSON.parse(xhr.responseText));
      }
      if (xhr.status == 403) {
        kaiosToaster({
          message: "OWM Error: Access Forbidden",
          position: 'north',
          type: 'warning',
          timeout: 3000
        });
      }
      // analyze HTTP status of the response
      if (xhr.status != 200) {}
    };

    xhr.onerror = function (err) {
      if (errorcool == true) {
        return
      }
      kaiosToaster({
        message: "OWM Error: Connection Unavailable",
        position: 'north',
        type: 'warning',
        timeout: 3000
      });
      errorcool = true
      console.log(err);
    };
    xhr.send();
  };

  return {
    openweather_call,
  };
})();