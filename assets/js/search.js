"use strict";

let olc_lat_lng;

//https://www.devbridge.com/sourcery/components/jquery-autocomplete/
$(document).ready(function () {
  const ac_selected_station = $("#search").autocomplete({
    serviceUrl: "https://nominatim.openstreetmap.org/search?format=json&addressdetails=0",
    minChars: 1,
    showNoSuggestionNotice: true,
    paramName: "q",
    lookupLimit: 10,
    deferRequestBy: 2000,
    transformResult: function (response) {
      var obj = $.parseJSON(response);
     // order suggestions by closeness to device_lat and device_lng
      obj.sort(function (a, b) {
        let a_lat = a.lat;
        let a_lng = a.lon;
        let b_lat = b.lat;
        let b_lng = b.lon;

        let a_dist = Math.sqrt(Math.pow(a_lat - device_lat, 2) + Math.pow(a_lng - device_lng, 2));
        let b_dist = Math.sqrt(Math.pow(b_lat - device_lat, 2) + Math.pow(b_lng - device_lng, 2));

        return a_dist - b_dist;
      });
     
    

      return {
        suggestions: $.map(obj, function (dataItem) {
          return {
            value: dataItem.display_name,
            data_lat: dataItem.lat,
            data_lon: dataItem.lon,
            //bounding box
            data_bbox_lat_min: dataItem.boundingbox[0],
            data_bbox_lat_max: dataItem.boundingbox[2],
            data_bbox_lon_min: dataItem.boundingbox[1],
            data_bbox_lon_max: dataItem.boundingbox[3],
          };
        }),
      };
    },
    onSearchStart: function () {},
    onSearchError: function (query, jqXHR, textStatus, errorThrown) {
      toaster(JSON.stringify(jqXHR), 2000);
    },
    onSelect: function (suggestion) {
      let lat_lon = [suggestion.data_lat, suggestion.data_lon];
      localStorage.setItem("last_location", JSON.stringify(lat_lon));
      // add bounding bo to arguments array
      let bbox = [suggestion.data_bbox_lat_min, suggestion.data_bbox_lon_min, suggestion.data_bbox_lat_max, suggestion.data_bbox_lon_max];
      
      addMarker(lat_lon[0], lat_lon[1], bbox);
    },
  });

  //add marker
  function addMarker(lat, lng, bbox) {
    
    hideSearch();
    current_lat = Number(lat);
    current_lng = Number(lng);

    L.marker([current_lat, current_lng]).addTo(markers_group);
    //set map bounding box
    //map.fitBounds([[bbox[0], bbox[1]], [bbox[2], bbox[3]]]);
    
    //set map center
    map.setView([current_lat, current_lng], 14);
    
    toaster("Press 5 to save the search result as marker");
  }

  //////////////////////////
  ////SEARCH BOX////////////
  /////////////////////////

  window.showSearch = function () {
    $("#search").autocomplete().enable();

    bottom_bar("Close", "SELECT", "");
    $("div#search-box").find("input").val("");

    $("div#search-box").css("display", "block");
    $("div#search-box").find("input").focus();
    $("div#bottom-bar").css("display", "block");

    windowOpen = "search";
  };

  window.hideSearch = function () {
    $("div#bottom-bar").css("display", "none");
    $("div#search-box").css("display", "none");
    $("div#search-box").find("input").val("");
    $("div#search-box").find("input").blur();
    $("div#olc").css("display", "none");

    ShowMap();
  };

  //////////////////////////
  ////OLC////////////
  /////////////////////////

  document.getElementById("search").addEventListener("input", function () {
    let input_val = $("#search").val();
    var n = input_val.startsWith("/");
    if (n) {
      input_val = input_val.replace("/", "");
      $("#search").autocomplete().disable();

      $("div.autocomplete-suggestions").css("display", "none");
      $("div.autocomplete-suggestion").css("display", "none");
      $("div#olc").css("display", "block");
      $("#olc").text(OLC.decode(input_val));

      let ll = String(OLC.decode(input_val));

      if (ll.includes("NaN") == false) {
        olc_lat_lng = ll.split(",");
        map.setView([olc_lat_lng[0], olc_lat_lng[1]], 13);
      }
    }

    if (n == false) {
      $("div.autocomplete-suggestions").css("display", "block");
      $("div#olc").css("display", "none");
      $("#search").autocomplete().enable();
    }
  });
});