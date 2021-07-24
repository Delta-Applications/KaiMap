# delta.map
delta.map is a local offline and online caching client for viewing maps, weather, utilities, and more coming soon.
This is still a beta, a direct fork of o.map, uploaded by me on github after viewing some suggestions.

![coolappbanner](https://user-images.githubusercontent.com/26120324/125851468-53672dea-c3ce-41df-b0ba-8a755d72f6f3.png)


### Features
- Weather (OpenWeatherMap)
- Hardware Information (Connection, Battery, GPS)
- Maps (OpenTopoMap, OpenStreetMap, Satellite)
- Layers (OpenWeatherMap Precipitation, Temperature, etc.), All Layers are cached and weather layers usually display a date pointing out the time the data was acquired

### Screenshots
![screen](https://github.com/Delta-Applications/delta.map/raw/main/screenshots/screenshot%20(1).png)
![screen](https://github.com/Delta-Applications/delta.map/raw/main/screenshots/screenshot%20(2).png)
![screen](https://github.com/Delta-Applications/delta.map/raw/main/screenshots/screenshot%20(3).png)
![screen](https://github.com/Delta-Applications/delta.map/raw/main/screenshots/screenshot%20(4).png)
![screen](https://github.com/Delta-Applications/delta.map/raw/main/screenshots/screenshot%20(5).png)

### Manual

- **Soft-keys** Zoom the map (Left = Out | Right = In)
- **Cursor** Move Map (Up, Down, Left, Right)
- **Key 0** Share Position using MozActivity
- **Key 1** Manual GPS Position Update
- **Key 2** Search for a town or a location
- **Key 3** Open Main Menu
- **Key 4** Follow Position on Screen (Toggle)
- **Key 5** Save position or Search result as marker on SD-Card <br>
  to delete the marker open with 3 the menu select the marker and then press long enter (+- 5sec)
- **Key 6** Information Shortcut available through Menu
- **Key 7** Measure Area & Distance
- **Key 8** Export Markers as GEOJson
- **Key #** Cache Map Tiles
- **Key \*** Jump between markers

### Special Thanks to
© OpenStreetMap contributors
© OpenTopoMap
© OpenCycleMap
© Google Street (Map)
© Microsoft Corporation > Bing Aerial 
Unlicense - Luxferre's TinyOLC
Polyfill > Promises
Ajax Autocomplete for jQuery
Google's Open Source Plus Codes
## Import & Export

Support for GPX, GeoJson, and more is being reviewed. In the meantime you can save all the markers you create using 9 or using 5.

## Search

The search can be opened with key 2, you can search for locations or start the search with / and then enter a Plus Code
Example --> /8FMWVC47+6C
Suggestions or Autocomplete are provided by OpenStreetMap and do not work when offline, you always have Plus Codes!
[Open Location Code / Plus Codes](https://en.wikipedia.org/wiki/Open_Location_Code)
![hola](https://storage.googleapis.com/madebygoog.appspot.com/grow-ext-cloud-images-uploads/lockup_ic_PlusCodes_H_rgb_614x128px_clr_D812D83D.svg)

### GeoJson

- Online tool: [geojson.io](http://geojson.io/#map=1/-55/228)
- Validation: [geojsonlint](http://geojsonlint.com/)
- GeoJson Map: [geojson Map] https://geojson-maps.ash.ms/

## How to install

The app is not available through the https://www.kaiostech.com/store/ as they are currently only accepting apps using the KaiAds SDK (Annoying giant pimple and dating advertisements)
The app is configured to use KaiAds, but they are currently disabled.
For this reason, you have to side-load (upload) the app to your phone if you want to use it.
Martin Kaptein wrote a comprehensive, <a href="https://www.martinkaptein.com/blog/sideloading-and-deploying-apps-to-kai-os/">step-by-step article</a> that you can use to side-load the app. If you prefer a video, this one on YouTube walks you through the process.
The Developer Portal also contains a guide, and if nothing seems to work, you can <a href="https://discord.com/invite/rQ93zEu">ask for help on Discord</a>.
You can download the latest version from the Releases page. (WIP)
The app is not auto-updating. To update it, you have to follow the same steps you took when installing it.
We are considering making an auto-upater straight from GitHub. 

![deltaice white](https://user-images.githubusercontent.com/26120324/125853046-7f21d205-e5b7-461e-af8c-f3548ec6c5cb.png)

## Upcoming Features and Known Bugs
@ GeolocationWatch fails when the first init fails and can be fixed by re-opening the app
