"use strict";

function notify(param_title, param_text, param_silent) {
  var options = {
    body: param_text,
    silent: true,
  };
  // Let's check if the browser supports notifications
  if (!("Notification" in window)) {
    alert("This browser does not support desktop notification");
  }

  // Let's check whether notification permissions have already been granted
  else if (Notification.permission === "granted") {
    // If it's okay let's create a notification
    var notification = new Notification(param_title, options);
  }

  // Otherwise, we need to ask the user for permission
  else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(function (permission) {
      // If the user accepts, let's create a notification
      if (permission === "granted") {
        var notification = new Notification(param_title, options);
      }
    });
  }
}

  //get location by ip
  let geoip = function (callback) {
    const url =
      "https://api.freegeoip.app/json/?apikey=2a0f8c30-844a-11ec-b0fe-af6fd1eb1209";


    let xhr = new XMLHttpRequest();


    xhr.open("GET", url);
    xhr.responseType = "json";


    xhr.send();


    xhr.error = function (err) {
      //toaster(err, 2000);
    };

    xhr.onload = function () {
      let responseObj = xhr.response;
      let latlng = [
        responseObj.data.location.latitude,
        responseObj.data.location.longitude,
      ];
      console.log(JSON.stringify(latlng));
      callback(latlng);
    };
  };


let toaster = function (text, time) {
  document.querySelector("div#toast").innerText = text;
  var elem = document.querySelector("div#toast");
  var pos = -100;
  var id = setInterval(down, 5);
  var id2;

  function down() {
    if (pos == 0) {
      clearInterval(id);
      setTimeout(() => {
        id2 = setInterval(up, 5);
      }, time);
    } else {
      pos++;
      elem.style.top = pos + "px";
    }
  }

  function up() {
    if (pos == -1000) {
      clearInterval(id2);
    } else {
      pos--;
      elem.style.top = pos + "px";
    }
  }
};

function user_input(param, file_name, desc) {
  document.getElementById("user-input-description").innerText = desc;
  if (param == "open") {
    bottom_bar("Cancel","","Save")
    document.querySelector("div#user-input").style.display = "block";
    document.querySelector("div#user-input input").focus();
    document.querySelector("div#user-input input").value = file_name;
    HideMap();
    windowOpen = "user-input";
  }
  if (param == "close") {
    selecting_marker = false;
    bottom_bar("","","")
    document.querySelector("div#user-input").style.display = "none";
    document.querySelector("div#user-input input").blur();
    console.log("close")
    ShowMap();
  }

  if (param == "return") {
    selecting_marker = false;
    let input_value = document.querySelector("div#user-input input").value;
    document.querySelector("div#user-input").style.display = "none";
    document.querySelector("div#user-input input").blur();
    console.log("return")
    bottom_bar("","","")
    return input_value;
  }
}

function localStorageWriteRead(item, value) {
  if (
    item != "" &&
    value != "undefined" &&
    item != "undefined"
  ) {
    localStorage.setItem(item, value);
  }

  return localStorage.getItem(item);
}

//delete file
function deleteFile(storage, path, notification) {
  let sdcard = navigator.getDeviceStorages("sdcard");

  let requestDel = sdcard[storage].delete(path);

  requestDel.onsuccess = function () {
    if (notification == "notification") {
      kaiosToaster({
        message: "Deleted file",
        position: 'north',
        type: 'success',
        timeout: 1000
      });
    }
  };

  requestDel.onerror = function () {
    kaiosToaster({
      message: "Unable to delete file:"+ this.error+" .",
      position: 'north',
      type: 'error',
      timeout: 3000
    });
    };
}

function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}

//bottom bar
function bottom_bar(left, center, right) {
  document.querySelector("div#bottom-bar div#button-left").textContent = left;
  document.querySelector(
    "div#bottom-bar div#button-center"
  ).textContent = center;
  document.querySelector("div#bottom-bar div#button-right").textContent = right;

  if (left == "" && center == "" && right == "") {
    document.querySelector("div#bottom-bar").style.display = "none";
  } else {
    document.querySelector("div#bottom-bar").style.display = "block";
  }
}

//top bar
function top_bar(left, center, right) {
  document.querySelector("div#top-bar div.button-left").textContent = left;
  document.querySelector("div#top-bar div.button-center").textContent = center;
  document.querySelector("div#top-bar div.button-right").textContent = right;

  if (left == "" && center == "" && right == "") {
    document.querySelector("div#top-bar").style.display = "none";
  } else {
    document.querySelector("div#top-bar").style.display = "block";
  }
}

function screenWakeLock(param) {
  let lock;

  if (param == "lock") {
    try {
      lock = window.navigator.requestWakeLock("screen");
    } catch (error) {
      
    }
  }

  if (param == "unlock") {
    try {
      if (lock.topic == "screen") {
      
        lock.unlock();
      }
    } catch (error) {}}
}

let add_file = function () {
  var sdcard = navigator.getDeviceStorage("sdcard");
  var file = new Blob(['[{"markers":[]}]'], {
    type: "application/json",
  });

  var request = sdcard.addNamed(file, "delta.map.json");

  request.onsuccess = function () {
    var name = this.result;
    //toaster("Please repeat the last action again.", 2000);
  };

  // An error typically occur if a file with the same name already exist
  request.onerror = function () {
    alert("Unable to write the file: " + this.error);
  };
};

let now = function () {
  let current_datetime = new Date();
  let now =
    current_datetime.getFullYear() +
    "-" +
    (current_datetime.getMonth() + 1) +
    "-" +
    current_datetime.getDate() +
    current_datetime.getHours() +
    "-" +
    current_datetime.getMinutes() +
    "-" +
    current_datetime.getSeconds();
  return now;
};