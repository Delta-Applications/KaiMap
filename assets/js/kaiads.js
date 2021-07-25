const kaiads = (() => {
  ////////////////////////////////////
  // ** KaiAds Management Module ** //

  var DisplayAds = false // Change this if you are viewing source-code and prefer to not use Ads

  var Publisher = "43accaf9-7798-4925-804b-ec0fa006b010" // Publisher ID
  var Application = "delta.map" // Application Name
  ////////////////////////////////////
  // This module is not official. 
  // Its purpose is to facilitate
  // access to KaiAds by Delta Apps.
  ////////////////////////////////////

  // Generate a random number between 2 and 10, including both 2 and 10
  function generateRandomIntegerInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  //$.loadScript('https://static.kaiads.com/ads-sdk/ads-sdk.v5.min.js',function(){})

  function ConnectivityCheck() {
    if (navigator.mozWifiManager.connection.status == "disconnected") {
      DisplayAds = false
    }
    DisplayAds = navigator.onLine
  }


  let DisplayFullScreenAd = function () {
    try {
      if (!DisplayAds == false) {
        ConnectivityCheck();

        getKaiAd({
          publisher: Publisher,
          app: Application,
          slot: 'ad-container',

          // Max supported size is 240x264
          // container is required for responsive ads
          onerror: err => console.error('**KaiAds** [ERROR] ', err.message),
          onready: ad => {

            // Ad is ready to be displayed
            // calling 'display' will display the ad
            if (generateRandomIntegerInRange(1, 2) == 1) {
              ad.call('display')
            }
            // Introduce chance to reduce annoyances by full-screen Advertisements
          }
        })

      }

    } catch (err) {
      console.error('**KaiAds** [ERROR] ', err.message)
    }


  }


  return {
    DisplayFullScreenAd
  };
})();