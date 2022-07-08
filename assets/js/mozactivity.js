const mozactivity = (() => {

  const getPath = function () {
    var a = new MozActivity({
      name: "pick",
    });
    a.onsuccess = function () {
      alert(a.result);
    };
    a.onerror = function () {
      alert("Failure when trying to pick");
    };
  };
  let share_position = function () {
    let l = setting.shareUsingShortLinks ?
      "https://osm.org/go/" + OSMShortCode.encode(current_lat, current_lng, map.getZoom()) :
      "https://www.openstreetmap.org/?mlat=" + current_lat + "&mlon=" + current_lng + "#map=13/" + current_lat + "/" + current_lng + "&layers=T";

    let a =
      "Check out my position: " + l + "\nSent using KaiMap for KaiOS"

    let activity = new MozActivity({
      name: "share",
      data: {
        type: "url",
        url: a,
      },
    });

    activity.onsuccess = function () {
      console.log("successfully shared");
    };

    activity.onerror = function () {
      console.log("The activity encounter en error: " + this.error);
    };
  };

  let share_marker_position = function (lat_lng, pluscode) {
    let l = setting.shareUsingShortLinks ?
      "https://osm.org/go/" + OSMShortCode.encode(lat_lng.lat, lat_lng.lng, map.getZoom()) :
      "https://www.openstreetmap.org/?mlat=" + lat_lng.lat + "&mlon=" + lat_lng.lng + "#map=13/" + lat_lng.lat + "/" + lat_lng.lng + "&layers=T and Plus Code (OLC): " + pluscode;;

    let a =
      "Check out this marker position: " + l + setting.messageSignature

    let activity = new MozActivity({
      name: "share",
      data: {
        type: "url",
        url: a,
      },
    });

    activity.onsuccess = function () {
      console.log("successfully shared");
    };

    activity.onerror = function () {
      console.log("The activity encounter en error: " + this.error);
    };
  };



  const photo = function () {
    let activity = new MozActivity({
      name: "record",
      data: {
        type: ["photos", "videos"],
      },
    });

    activity.onsuccess = function () {
      console.log("successfully");
    };

    activity.onerror = function () {
      console.log("The activity encounter en error: " + this.error);
    };
  };

  return {
    photo,
    share_position,
    getPath,
    share_marker_position
  };
})();