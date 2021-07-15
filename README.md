# delta.map
delta.map is a local offline and online caching client for viewing maps, weather, utilities, and more coming soon.
This is still a beta, a direct fork of o.map, uploaded by me on github after viewing some suggestions.

![coolappbanner](https://user-images.githubusercontent.com/26120324/125851468-53672dea-c3ce-41df-b0ba-8a755d72f6f3.png)


### Features
- Weather (OpenWeatherMap)
- Hardware Information (Connection, Battery, GPS)
- Maps (OpenTopoMap, OpenStreetMap, Satellite)
- Layers (OpenWeatherMap Precipitation, Temperature, etc.), All Layers are cached and weather layers usually display a date pointing out the time the data was acquired

### Manual

- **Soft-keys** Zoom the map (Left = Out | Right = In)
- **Cursor** Move Map (Up, Down, Left, Right)
- **key 0** Share Position using MozActivity
- **key 1** Manual GPS Position Update
- **key 2** Search for a town or a location
- **key 3** Open Main Menu
- **key 4** Follow Position on Screen (Toggle)
- **key 5** Save position or Search result as marker on SD-Card <br>
  to delete the marker open with 3 the menu select the marker and then press long enter (+- 5sec)
- **key 6** Information Shortcut available through Menu
- **key 7** Measure Area & Distance
- **key 8** Export Markers as GEOJson
- **key #** Cache Map Tiles
- **key \*** Jump between markers

## Import & Export

you have the possibility to import gpx and geojson. Markers can also be exported as geojson so that you can e.g. share them or edit them in another program.

### Search

The search can be opened with key 2, you can search for locations or start the search with / and then enter an open location code
[open location code](https://en.wikipedia.org/wiki/Open_Location_Code)

### GeoJson

- Online tool: [geojson.io](http://geojson.io/#map=1/-55/228)
- Validation: [geojsonlint](http://geojsonlint.com/)
- GeoJson Map: [geojson Map] https://geojson-maps.ash.ms/
