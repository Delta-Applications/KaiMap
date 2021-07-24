////////////////////
////INFORMATION HANDLER////////////
///////////////////
let ServiceRunner = false

const informationHandler = (() => {

    let UpdateInfo = function() {
        if (ServiceRunner == true) {
           // Prevent loops from being ran multiple times
           DisplayFullScreenAd();
            
        }else{
            OpenWeatherUpdater()
            BatteryUpdater()
            ConnectionUpdater()
            NetworkUpdater()
            ServiceRunner = true

        }
   


    }
    let BatteryUpdater = function() {
            navigator.getBattery().then(function(Battery) {
                var Percent = (Battery.level * 100) + "%"
                var Temperature = Battery.temperature + " C°"
                document.getElementById("batteryCharge").innerText = Percent;
                document.getElementById("batteryCharge").style.color = utility.getColorFrom0to1(1-Battery.level)
                chargtimechange();
                batteryhealthchange()

                document.getElementById("batteryTemp").innerText = Temperature;
                document.getElementById("batteryHealth").innerText = Battery.health;

                Battery.onbatteryhealthchange = batteryhealthchange();

                function batteryhealthchange() {
                    document.getElementById("batteryHealth").innerText = Battery.health;
                    document.getElementById("batteryTemp").innerText = Temperature;
                    if (Battery.temperature > 45){document.getElementById("batteryTemp").style.color = "#F38C3F"}
                    if (Battery.temperature < 27){document.getElementById("batteryTemp").style.color = "#3FB2F3"}
                    if (Battery.temperature > 27 || Battery.temperature < 45){document.getElementById("batteryTemp").style.color = "#37D63B"}

                }

                Battery.onlevelchange = function() {
                    batteryhealthchange();

                    document.getElementById("batteryCharge").innerText = Percent;
                    document.getElementById("batteryCharge").style.color = utility.getColorFrom0to1(1-Battery.level)
                }
         

                // CHARGING & DISCHARGING TIME DISPLAY
                battery.onchargingtimechange = chargtimechange();
                function chargtimechange(){
                    if(Battery.charging){
                        document.getElementById("batteryTimeType").innerText = "Charging Time";
                        document.getElementById("batteryTime").innerText = (Math.round(Battery.chargingTime / 60).toString())+"min";
                   //     if (Battery.chargingTime == Infinity) {                        document.getElementById("batteryTime").innerText = "Unavailable" }
                        
                        }
                    else {
                        document.getElementById("batteryTimeType").innerText = "Discharging Time";
                        document.getElementById("batteryTime").innerText = (Math.round(Battery.dischargingTime / 60).toString()) +"min";
                 //       if (Battery.dischargingTime == Infinity) {                        document.getElementById("batteryTime").innerText = "Unavailable" }
                    }
                }
                battery.ondischargingtimechange = dischargtimechange();
                function dischargtimechange(){
                    if(Battery.charging){
                        document.getElementById("batteryTimeType").innerText = "Charging Time";
                        document.getElementById("batteryTime").innerText = (Math.round(Battery.chargingTime / 60).toString())+"min";
                  //      if (Battery.chargingTime == Infinity) {                        document.getElementById("batteryTime").innerText = "Unavailable" }
                        }
                    else {
                        document.getElementById("batteryTimeType").innerText = "Discharging Time";
                        document.getElementById("batteryTime").innerText = (Math.round(Battery.dischargingTime / 60).toString()) +"min";
                  //      if (Battery.dischargingTime == Infinity) {                        document.getElementById("batteryTime").innerText = "Unavailable" }

                    }
                }
           
            });
     
    }

    let ConnectionUpdater = function() {
        var connectionstatus = navigator.mozWifiManager.connection.status
        connectionstatus =  connectionstatus.charAt(0).toUpperCase() + connectionstatus.slice(1);

        var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        var devicestatus = connection.type
        devicestatus =  devicestatus.charAt(0).toUpperCase() + devicestatus.slice(1);
        document.getElementById("conntype").innerText =  devicestatus;
        document.getElementById("wifiStatus").innerText =  connectionstatus;
        document.getElementById("wifiNetwork").innerText = (navigator.mozWifiManager.connection.network.ssid || "Unavailable");
        document.getElementById("wifiMac").innerText = (navigator.mozWifiManager.macAddress || "Unavailable");
        document.getElementById("wifiIP").innerText = (navigator.mozWifiManager.connectionInformation.ipAddress || "Unavailable");
        navigator.mozWifiManager.onstatuschange = connstatuschange();

        function connstatuschange() {
            var connectionstatus = navigator.mozWifiManager.connection.status
            connectionstatus =  connectionstatus.charAt(0).toUpperCase() + connectionstatus.slice(1);
    
            var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            var devicestatus = connection.type
            devicestatus =  devicestatus.charAt(0).toUpperCase() + devicestatus.slice(1);
            document.getElementById("conntype").innerText =  devicestatus;
            document.getElementById("wifiStatus").innerText =  connectionstatus;
            document.getElementById("wifiNetwork").innerText = (navigator.mozWifiManager.connection.network.ssid || "Unavailable");
            document.getElementById("wifiMac").innerText = (navigator.mozWifiManager.macAddress || "Unavailable");
            document.getElementById("wifiIP").innerText = (navigator.mozWifiManager.connectionInformation.ipAddress || "Unavailable");
        }
    }


let PreciseGeoUpdate = function(crd) {
    try {
        
  
// Initialize
let data = {}
data.raw = crd
//data.GPSif = JSON.parse(navigator.engmodeExtension.fileReadLE('GPSif'));
// Calculate Device Location from Center of Screen
let f = map.getCenter();
data.DistanceFromCenter = module.calc_distance(data.raw.latitude, data.raw.longitude, f.lat, f.lng) 
// Calculate Metrics
if (data.raw.altitude) {data.altitude = data.raw.altitude.toFixed(1)} else {data.altitude = 0}
data.lat = data.raw.latitude.toFixed(5);
data.long = data.raw.longitude.toFixed(5);
if (data.raw.heading) {data.heading = data.raw.heading.toFixed(0)} else {data.heading = 0}
if (data.raw.accuracy) {data.accuracy = Math.round(data.raw.accuracy)} else {data.accuracy = 0}
if (data.raw.speed) {data.speed = utility.roundToTwo(crd.speed * 3.6).toFixed(1)} else {data.speed = 0}


document.querySelector("#lat").innerText = data.lat;
document.querySelector("#lng").innerText = data.long;
document.querySelector("#heading").innerText =    utility.degToCompass(data.heading)+" "+data.heading;
document.querySelector("#altitude").innerText = data.altitude;
document.querySelector("#acc").innerText = data.accuracy+"± m";
document.querySelector("#distance").innerText = data.DistanceFromCenter+" km"
document.querySelector("#speed").innerText = data.speed+" km/h"

data.olc = OLC.encode(data.raw.latitude,data.raw.longitude)
document.querySelector("#olcode").innerText = data.olc
//document.querySelector("#satnum").innerText = data.GPSif.num
} catch (error) {
        console.error(error.message)
}

    

}

  /*  let GeoUpdate = function() {
        if (current_lat != "" && current_lng != "") {
            //when marker is loaded from menu

            let f = map.getCenter();

            document.querySelector("#distance").innerText =
                module.calc_distance(device_lat, device_lng, f.lat, f.lng) +
                " km";

            document.querySelector("#lat").innerText =
                current_lat.toFixed(5);
            document.querySelector("#lng").innerText =
            current_lng.toFixed(5);
            if (current_alt) {
                document.querySelector(
                    "#coordinations #altitude"
                ).style.display = "block";
                document.querySelector("#altitude").innerText =
                    current_alt;
            } else {
                document.querySelector(
                    "#altitude"
                ).style.display = "none";
            }
            if (current_heading) {
                document.querySelector(
                    "#heading"
                ).style.display = "block";
                document.querySelector("#heading").innerText =
                    utility.degToCompass(current_heading)+" "+current_heading;
            } else {
                document.querySelector(
                    "#heading"
                ).style.display = "none";
            }
        }
    }

    let GeolocationUpdater = function() {
        ServiceRunner = true

        update_view = setInterval(() => {
            GeoUpdate()
          
        }, 1000);
    }
*/


    let UpdateWeather1 = false

    let OpenWeatherUpdater = function() {
        if (UpdateWeather1 == true) {return}
        let cdata1 = map.getCenter();
        UpdateWeather1 = true
        UpdateWeather(cdata1)
           service = setInterval(() => {
            let cdata = map.getCenter();
         UpdateWeather(cdata)
        }, 35000);
           
        
    }
    let UpdateWeather = function(cdata) {
        function openweather_callback(some) {
				
            let sunset = some.city.sunset
// Create a new JavaScript Date object based on the timestamp
// multiplied by 1000 so that the argument is in milliseconds, not seconds.
var date = new Date(sunset * 1000);
// Hours part from the timestamp
var hours = date.getHours();
// Minutes part from the timestamp
var minutes = "0" + date.getMinutes();
// Seconds part from the timestamp
var seconds = "0" + date.getSeconds();

// Will display time in 10:30:23 format
var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
        let sunrise = some.city.sunrise
// Create a new JavaScript Date object based on the timestamp
// multiplied by 1000 so that the argument is in milliseconds, not seconds.
var date2 = new Date(sunrise * 1000);
// Hours part from the timestamp
var hours2 = date2.getHours();
// Minutes part from the timestamp
var minutes2 = "0" + date2.getMinutes();
// Seconds part from the timestamp
var seconds2 = "0" + date2.getSeconds();

// Will display time in 10:30:23 format
var formattedTimer = hours2 + ':' + minutes2.substr(-2) + ':' + seconds2.substr(-2);

            
            document.getElementById("locationame").innerText =
                    some.city.name;
            
            document.getElementById("sunset").innerText =
                    formattedTime;
                        document.getElementById("sunrise").innerText =
                    formattedTimer;
                document.getElementById("grabtime").innerText =
                    some.list[0].dt_txt;
                document.getElementById("temp").innerText =
                    some.list[0].main.temp + " °C";
                        document.getElementById("feelslike").innerText =
                    some.list[0].main.feels_like + " °C";
                        document.getElementById("hum").innerText =
                    some.list[0].main.humidity + "%rH";
                    document.getElementById("visibility").innerText =
                    Math.round(some.list[0].visibility / 1000) + "km";
                                                document.getElementById("wind").innerText =
                    some.list[0].wind.speed + " m/s | "+	utility.degToCompass(some.list[0].wind.deg)+" "+some.list[0].wind.deg +"°";
                        document.getElementById("pres").innerText =
                    some.list[0].main.pressure + " hPa";
                                document.getElementById("desc").innerText =
                    "("+some.list[0].weather[0].id+") "+some.list[0].weather[0].main;
                    
                    

                    var day = some.list[0].weather[0].icon.includes("d")
                    var daynight = "d"
                    if (day == true) {daynight = "d"} else {daynight = "n"}
                document.getElementById("icon").className ="list-item-indicator__indicator owf owf-"+some.list[0].weather[0].id+"-"+daynight+" owf-3x";
            }

        weather.openweather_call(
            cdata.lat,
            cdata.lng,
            setting.openweather_api,
            openweather_callback
        );
    }
    
    let NetworkUpdater = function(){
        NetworkStats()
        service = setInterval(() => {
       NetworkStats()
        }, 20000);
    }

    let NetworkStats = function() {
        var networks = navigator.mozNetworkStats.getAvailableNetworks();

        networks.onsuccess = function() {
          var network = this.result[0]; // 0 for Wifi; returns a mozNetworkInterface object
        
          var end = new Date();
          var start = new Date();
        
          var samples0 = navigator.mozNetworkStats.getSamples(network, start, end); // returns a mozNetworkStats object
          var DataType = navigator.mozNetworkStats.network

          if (DataType == null) {
            document.getElementById("dataTypeC").innerText = "Merged"
          }
          if (DataType == navigator.mozNetworkStats.WIFI) {
            document.getElementById("dataTypeC").innerText = "Wi-Fi"
          }
          if (DataType == navigator.mozNetworkStats.MOBILE) {
            document.getElementById("dataTypeC").innerText = "Mobile"
          }

          samples0.onsuccess = function () {
            document.getElementById("dataRX").innerText = utility.formatBytes(samples0.result.data[0].rxBytes)
            document.getElementById("dataTX").innerText = utility.formatBytes(samples0.result.data[0].txBytes)
       };
        
          samples0.onerror = function () {
            console.log("Something went wrong: ", samples0.error);
          };
        };
        
        networks.onerror = function () {
          console.log("Something went wrong: ", networks.error);
        };


      };
      

  
    return {
      NetworkStats, UpdateInfo, UpdateWeather,PreciseGeoUpdate
    };
  })();
  