////////////////////
////INFORMATION HANDLER////////////
///////////////////
let ServiceRunner = false

const informationHandler = (() => {

    let UpdateInfo = function () {
        if (ServiceRunner == true) {
            // Prevent loops from being ran multiple times
            DisplayFullScreenAd();

        } else {
            OpenWeatherUpdater()
            BatteryUpdater()
            ConnectionUpdater()
            NetworkUpdater()
            ServiceRunner = true

        }



    }
    let BatteryUpdater = function () {
        navigator.getBattery().then(function (Battery) {
            var Percent = (Battery.level * 100) + "%"
            var Temperature = Battery.temperature + " C°"
            document.getElementById("batteryCharge").innerText = Percent;
            document.getElementById("batteryCharge").style.color = utility.getColorFrom0to1(1 - Battery.level)
            chargtimechange();
            batteryhealthchange()

            document.getElementById("batteryTemp").innerText = Temperature;
            document.getElementById("batteryHealth").innerText = Battery.health;

            Battery.onbatteryhealthchange = batteryhealthchange();

            function batteryhealthchange() {
                document.getElementById("batteryHealth").innerText = Battery.health;
                document.getElementById("batteryTemp").innerText = Temperature;
                if (Battery.temperature > 45) {
                    document.getElementById("batteryTemp").style.color = "#F38C3F"
                }
                if (Battery.temperature < 27) {
                    document.getElementById("batteryTemp").style.color = "#3FB2F3"
                }
                if (Battery.temperature > 27 || Battery.temperature < 45) {
                    document.getElementById("batteryTemp").style.color = "#37D63B"
                }

            }

            Battery.onlevelchange = function () {
                batteryhealthchange();

                document.getElementById("batteryCharge").innerText = Percent;
                document.getElementById("batteryCharge").style.color = utility.getColorFrom0to1(1 - Battery.level)
            }


            // CHARGING & DISCHARGING TIME DISPLAY
            battery.onchargingtimechange = chargtimechange();

            function chargtimechange() {
                if (Battery.charging) {
                    document.getElementById("batteryTimeType").innerText = "Charging Time";
                    document.getElementById("batteryTime").innerText = (Math.round(Battery.chargingTime / 60).toString()) + "min";
                    //     if (Battery.chargingTime == Infinity) {                        document.getElementById("batteryTime").innerText = "Unavailable" }

                } else {
                    document.getElementById("batteryTimeType").innerText = "Discharging Time";
                    document.getElementById("batteryTime").innerText = (Math.round(Battery.dischargingTime / 60).toString()) + "min";
                    //       if (Battery.dischargingTime == Infinity) {                        document.getElementById("batteryTime").innerText = "Unavailable" }
                }
            }
            battery.ondischargingtimechange = dischargtimechange();

            function dischargtimechange() {
                if (Battery.charging) {
                    document.getElementById("batteryTimeType").innerText = "Charging Time";
                    document.getElementById("batteryTime").innerText = (Math.round(Battery.chargingTime / 60).toString()) + "min";
                    //      if (Battery.chargingTime == Infinity) {                        document.getElementById("batteryTime").innerText = "Unavailable" }
                } else {
                    document.getElementById("batteryTimeType").innerText = "Discharging Time";
                    document.getElementById("batteryTime").innerText = (Math.round(Battery.dischargingTime / 60).toString()) + "min";
                    //      if (Battery.dischargingTime == Infinity) {                        document.getElementById("batteryTime").innerText = "Unavailable" }

                }
            }

        });

    }

    let ConnectionUpdater = function () {
        var connectionstatus = navigator.mozWifiManager.connection.status
        connectionstatus = connectionstatus.charAt(0).toUpperCase() + connectionstatus.slice(1);

        var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        var devicestatus = connection.type
        devicestatus = devicestatus.charAt(0).toUpperCase() + devicestatus.slice(1);
        document.getElementById("conntype").innerText = devicestatus;
        document.getElementById("wifiStatus").innerText = connectionstatus;
        document.getElementById("wifiNetwork").innerText = (navigator.mozWifiManager.connection.network.ssid || "Unavailable");
        document.getElementById("wifiMac").innerText = (navigator.mozWifiManager.macAddress || "Unavailable");
        document.getElementById("wifiIP").innerText = (navigator.mozWifiManager.connectionInformation.ipAddress || "Unavailable");
        navigator.mozWifiManager.onstatuschange = connstatuschange();

        function connstatuschange() {
            var connectionstatus = navigator.mozWifiManager.connection.status
            connectionstatus = connectionstatus.charAt(0).toUpperCase() + connectionstatus.slice(1);

            var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            var devicestatus = connection.type
            devicestatus = devicestatus.charAt(0).toUpperCase() + devicestatus.slice(1);
            document.getElementById("conntype").innerText = devicestatus;
            document.getElementById("wifiStatus").innerText = connectionstatus;
            document.getElementById("wifiNetwork").innerText = (navigator.mozWifiManager.connection.network.ssid || "Unavailable");
            document.getElementById("wifiMac").innerText = (navigator.mozWifiManager.macAddress || "Unavailable");
            document.getElementById("wifiIP").innerText = (navigator.mozWifiManager.connectionInformation.ipAddress || "Unavailable");
        }
    }

    function insertAfter(newNode, existingNode) {
        existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
    }

    function insertBefore(newNode, existingNode) {
        existingNode.parentNode.insertBefore(newNode, existingNode);
    }
    let PreciseGpxTrackUpdate = function (track) {
        /////////////////////////
	/// GPX TRACK INFO  /////
	/////////////////////////

	function showGraph(elementId, dataIn, title) {
		let ctx = document.getElementById(elementId).getContext('2d');
		let data = [];
		let labels = [];
		let factor = Math.floor(dataIn.length / 320);
		if (factor == 0){
			factor = 1;
		}
		console.log(factor);
		for (let i = 0; i < dataIn.length; i = i + factor) {
			data.push({x: (dataIn[i][0]).toFixed(3), y: dataIn[i][1]});
			labels.push((dataIn[i][0]).toFixed(3));
		}
	
		let myChart = new Chart(ctx, {
			type: 'line',
			data: {
				labels: labels,
				datasets: [{
					label: title,
					data: data,
					borderColor: 'rgb(31, 96, 237)',
					borderWidth: 1,
					fill: true,
				}]
			},
			options: {
				responsive: true,
				elements: {
					point: {
						radius: 0
					}
				},
				scales: {
					xAxes: [{
						display: true,
						scaleLabel: {
							display: true,
							labelString: 'km' //(allUnits[units].value == 'm') ? 'km' : 'miles'
						}
					}],
					yAxes: [{
						display: true,
						scaleLabel: {
							display: true,
							labelString: 'm'//(allUnits[units].value == 'm') ? 'm' : 'ft'
						}
					}]
				}
			}
		});
		console.log(myChart);
	}

	//((allUnits[units].value == 'm') ? target.get_elevation_data() : target.get_elevation_data_imp())
		// ((allUnits[units].value == 'm') ? 'Elevation [m]' : 'Elevation [ft]'))
		showGraph("elevation-graph", track.get_elevation_data(), 'Elevation [m]');
    
	  document.querySelector("#elev-ga-lo").innerText = track.get_elevation_gain().toFixed(2)+ " m"+", "+track.get_elevation_loss().toFixed(2)+ " m";
		document.querySelector("#elev-max-min").innerText = track.get_elevation_max().toFixed(2)+ " m"+", "+track.get_elevation_min().toFixed(2)+ " m";
		document.querySelector("#name").innerText = track.get_name() || "Unknown";
		document.querySelector("#author").innerText = track.get_author() || "Unknown";
		document.querySelector("#dist-cov").innerText = (track.get_distance() / 1000).toFixed(3)+ " km";
		document.querySelector("#moving-sp-pa").innerText = track.get_moving_speed().toFixed(2)+ " km/h"+", "+ (track.get_moving_pace() / 1000).toFixed(0)+ " sec/km";

        document.querySelector("#endtime").innerText = moment(track.get_end_time()).local().calendar()  || "Unknown";
		document.querySelector("#starttime").innerText = moment(track.get_start_time()).local().calendar() || "Unknown";

        document.querySelector("#tottime").innerText = track.get_duration_string(track.get_total_time(), false) || "Unknown";
		document.querySelector("#movtime").innerText =  track.get_duration_string(track.get_moving_time(), false) || "Unknown";


	
    }
    let PreciseMarkerUpdate = function (marker, nooverpass) {

        let marker_stats = marker

        document.querySelector("#marker-position").innerText = marker_stats._latlng.lat.toFixed(5) + ", " + marker_stats._latlng.lng.toFixed(5);
        document.querySelector("#marker-distance").innerText = module.calc_distance(current_lat, current_lng, marker_stats._latlng.lat, marker_stats._latlng.lng) + " km"
        document.querySelector("#marker-pluscode").innerText = OLC.encode(marker_stats._latlng.lat, marker_stats._latlng.lng)

        //Delete all comments and overpass data from menu

        let comments = document.querySelectorAll('.comment');

        comments.forEach(box => {
            box.remove();
        });

        if (!nooverpass) {
        const boxes = document.querySelectorAll('.overpassdata');

        boxes.forEach(box => {
            box.remove();
        });
    }

        const buttons = document.querySelectorAll('.note_action');

        buttons.forEach(box => {
            box.remove();
        });

        if (map.hasLayer(markers_group_osmnotes)) {
            document.querySelector("#marker-overpass").innerText = "Comments"

            function appendcomment(author, text) {
                let el = document.createElement('div');
                el.className = "item list-item focusable comment"
                el.setAttribute("tabindex", 0)
                el.innerHTML = '<p class="list-item__text">' + author + '</p><p class="list-item__subtext">' + text + '</p>'
                insertAfter(el, document.querySelector("#marker-overpass"))
            }

            let p = marker.note_data
            let comments = p.comments.map((x) => x);
            // Order comments from least recent to most recent
            comments.reverse()
            for (var i = 0; i < comments.length; i++) {
                let action = "";
                if (comments[i].action == "opened") {
                    action = "Opened by "
                } else if (comments[i].action == "reopened") {
                    action = "Reopened by "
                } else if (comments[i].action == "closed") {
                    action = "Closed by "
                }
                let author = action + (comments[i].user ? comments[i].user : 'Anonymous');
                // do not insert <br> if text message is empty
                let date = moment.utc(comments[i].date.slice(0, -4)).local().calendar()
                let text = comments[i].text ? 
                            date + "<br></br>" + comments[i].html
                            .replace(/(<p[^>]+?>|<p>|<\/p>)/img, "") // remove all <p> tags
                            //replace all <a> tags containing an image link with an image tag
                            .replace(/<a[^>]+?href="([^"]+?\.(jpe?g|png|gif|bmp|svg|webp))"[^>]*?>([^<]*?)<\/a>/img, '<img style="max-width:100%;overflow:hidden;" src="$1" alt="$3">')
                            // replace links with <a> tag
                            .replace(/(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim, '<a href="$1" target="_blank">$1</a>') 
                            // replace email addresses with mailto: tag
                            .replace(/(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim, '<a href="mailto:$1">$1</a>') 
                             : date;
                appendcomment(author, text)
            }

            // if note is closed, append a reopen button, if it is open, append a close button and a comment button
            if (p.status == "closed") {
                let el = document.createElement('button');
                el.className = "item button-container__button focusable note_action"
                el.setAttribute("tabindex", 0)
                el.setAttribute("note_id", p.id)
                el.setAttribute("data-action", "reopen_note")
                el.innerHTML = 'Reopen Note'
                insertAfter(el, Array.from(document.querySelectorAll('.comment')).pop())
            }
            if (p.status == "open") {
                let el = document.createElement('button');
                el.className = "item button-container__button focusable note_action"
                el.setAttribute("tabindex", 0)
                el.setAttribute("note_id", p.id)
                el.setAttribute("data-action", "comment_note")
                el.innerHTML = 'Comment Note'
                insertAfter(el, Array.from(document.querySelectorAll('.comment')).pop())

                let el2 = document.createElement('button');
                el2.className = "item button-container__button focusable note_action"
                el2.setAttribute("tabindex", 0)
                el2.setAttribute("note_id", p.id)
                el2.setAttribute("data-action", "close_note")
                el2.innerHTML = 'Close Note'
                insertAfter(el2, Array.from(document.querySelectorAll('.comment')).pop())
            }

            tabIndex = 0;
            finder_tabindex();
            nooverpass = true

        } //bypass all code below and display note info
        if (nooverpass) return;
        document.querySelector("#marker-overpass").innerText = "Overpass Data"

        kwargs = {
            lat: marker_stats._latlng.lat,
            lng: marker_stats._latlng.lng,
            radius: 100 - (5 * map.getZoom())
        };
        var query = L.Util.template('[out:json];' + 'nwr(around:{radius},{lat},{lng})[name];' + 'out body qt 1;', kwargs);
        url = 'http://overpass-api.de/api/interpreter?data=' + encodeURIComponent(query);

        function appendoverpassdata(tag, value) {
            let el = document.createElement('div');
            el.className = "item list-item focusable overpassdata"
            el.setAttribute("tabindex", 0)
            el.innerHTML = '<p class="list-item__text">' + tag + '</p><p class="list-item__subtext">' + value + '</p>'
            insertAfter(el, document.querySelector("#marker-overpass"))
        }


        if (!navigator.onLine) return appendoverpassdata("Data unavailable", "Device is offline")

        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.setRequestHeader("Cache-Control", "max-age=604800");
        xhr.onload = function (e) {
            L.DomUtil.removeClass(map._container, "loading");
            if (this.status == 200) {
                var data;
                try {
                    data = JSON.parse(this.response);
                } catch (err) {
                    console.error(err);
                }
                console.log(data)
                // do stuff with data



                if (!data || !data.elements[0]) {
                    appendoverpassdata("No data", "or empty response")
                } else {


                    if (Object.keys(data.elements).length > 1) {
                        appendoverpassdata("Other hidden elements", Object.keys(data.elements).length - 1)
                    }

                    for (var tag in data.elements[0].tags) {
                        if (tag == "name") continue;
                        let value = data.elements[0].tags[tag]
                        appendoverpassdata(tag, value)
                    }

                    appendoverpassdata("Id", data.elements[0].id)
                    appendoverpassdata(data.elements[0].type + " Name", data.elements[0].tags.name)


                }
                tabIndex = 0;
                finder_tabindex();
            } else {}
        };

        L.DomUtil.addClass(map._container, "loading");
        xhr.send();


    }

    let PreciseGeoUpdate = function (crd) {
        try {


            // Initialize
            let data = {}
            data.raw = crd

            // Store Location as Fallout
            let b = [data.raw.latitude, data.raw.longitude];
            localStorage.setItem("last_location", JSON.stringify(b));

            try {
                data.GPSif = JSON.parse(navigator.engmodeExtension.fileReadLE('GPSif')).num;
                document.querySelector("div#sat-main").style.display = "block"
            } catch (error) {
                data.GPSif = "Unavailable"
                document.querySelector("div#sat-main").style.display = "none"
            }
            // Calculate Device Location from Center of Screen
            let f = map.getCenter();
            data.DistanceFromCenter = module.calc_distance(data.raw.latitude, data.raw.longitude, f.lat, f.lng)
            // Calculate Metrics
            if (data.raw.altitude) {
                document.querySelector("div#altitude-main").style.display = "block"
                data.altitude = data.raw.altitude.toFixed(1)
            } else {
                data.altitude = 0
                document.querySelector("div#altitude-main").style.display = "none"
            }
            data.lat = data.raw.latitude.toFixed(5);
            data.long = data.raw.longitude.toFixed(5);
            if (data.raw.heading) {
                document.querySelector("div#heading-main").style.display = "block"
                data.heading = data.raw.heading.toFixed(0)
            } else {
                data.heading = 0
                document.querySelector("div#heading-main").style.display = "none"
            }
            if (data.raw.accuracy) {
                document.querySelector("div#accuracy-main").style.display = "block"
                data.accuracy = Math.round(data.raw.accuracy)
            } else {
                data.accuracy = 0
                document.querySelector("div#accuracy-main").style.display = "none"
            }
            if (data.raw.speed) {
                data.speed = utility.roundToTwo(crd.speed * 3.6).toFixed(1)
                document.querySelector("div#speed-main").style.display = "block"
            } else {
                data.speed = 0
                document.querySelector("div#speed-main").style.display = "none"
            }


            document.querySelector("#pos").innerText = data.lat + ", " + data.long;
            document.querySelector("#heading").innerText = utility.degToCompass(data.heading) + " " + data.heading;
            document.querySelector("#altitude").innerText = data.altitude + " m";
            document.querySelector("#acc").innerText = data.accuracy + "± m";
            device_alt = data.altitude
            device_heading = data.heading
            device_speed = data.speed

            if (!tracking_path) {
                if (data.DistanceFromCenter >= 0.02) {
                    document.querySelector("div#distance-main").style.display = "block"
                    document.querySelector("#distance-title").innerText = "Device Distance"
                    document.querySelector("#distance").innerText = parseFloat(data.DistanceFromCenter).toFixed(2) + " km";
                } else {
                    document.querySelector("div#distance-main").style.display = "none"
                }

            }
            document.querySelector("#speed").innerText = data.speed + " km/h"

            data.olc = OLC.encode(data.raw.latitude, data.raw.longitude)
            document.querySelector("#olcode").innerText = data.olc
            document.querySelector("#satnum").innerText = data.GPSif

            document.querySelector('[data-map="view-gpxinfo"]').style.display = (current_gpx ? "block" : "none");

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

    let OpenWeatherUpdater = function () {
        if (UpdateWeather1 == true) {
            return
        }
        let cdata1 = map.getCenter();
        UpdateWeather1 = true
        UpdateWeather(cdata1)
        service = setInterval(() => {
            let cdata = map.getCenter();
            UpdateWeather(cdata)
        }, 35000);


    }
    let UpdateWeather = function (cdata) {
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


            document.getElementById("temp").innerText =
                some.list[0].main.temp + " °C";
            document.getElementById("hum").innerText =
                some.list[0].main.humidity + "% rH";
            document.getElementById("visibility").innerText =
                (some.list[0].visibility / 1000).toFixed(2) + " km";
            document.getElementById("wind").innerText =
                some.list[0].wind.speed + " m/s | " + utility.degToCompass(some.list[0].wind.deg) + " " + some.list[0].wind.deg + "°";
            document.getElementById("pres").innerText =
                some.list[0].main.pressure + " hPa";
            document.getElementById("desc").innerText =
                some.list[0].weather[0].id + " - " + some.list[0].weather[0].main;



            var day = some.list[0].weather[0].icon.includes("d")
            var daynight = (day ? "d" : "n")
           
            document.getElementById("icon").className = "list-item-indicator__indicator owf owf-" + some.list[0].weather[0].id + "-" + daynight + " owf-3x";
            document.getElementById("sunset").innerText =
                formattedTime + " (" + utility.getRelativeTime(some.city.sunset) + ")";
            document.getElementById("sunrise").innerText =
                formattedTimer + " (" + utility.getRelativeTime(some.city.sunrise) + ")";
            // convert unix utc timestamp to local unix timestamp

            
            
            var grabtime = utility.getRelativeTime(some.list[0].dt + (new Date().getTimezoneOffset() * 60))
            grabtime = grabtime.charAt(0).toUpperCase() + grabtime.slice(1);
            document.getElementById("grabtime").innerText =
                grabtime
        }

        weather.openweather_call(
            cdata.lat,
            cdata.lng,
            setting.openweather_api,
            openweather_callback
        );
    }

    let NetworkUpdater = function () {
        NetworkStats()
        service = setInterval(() => {
            NetworkStats()
        }, 20000);
    }

    let NetworkStats = function () {
        var networks = navigator.mozNetworkStats.getAvailableNetworks();

        networks.onsuccess = function () {
            var network = this.result[0]; // 0 for Wifi; returns a mozNetworkInterface object

            var end = new Date();
            var start = new Date();

            var samples0 = navigator.mozNetworkStats.getSamples(network, start, end); // returns a mozNetworkStats object
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
        NetworkStats,
        UpdateInfo,
        UpdateWeather,
        PreciseGeoUpdate,
        PreciseMarkerUpdate,
        PreciseGpxTrackUpdate
    };
})();