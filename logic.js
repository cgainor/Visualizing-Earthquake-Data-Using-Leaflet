// Store our API endpoint as queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, function (data) {
    console.log(data.features);
    // Using the features array sent back in the API data, create a GeoJSON layer and add it to the map
    createFeatures(data.features);
});

// Define a function to assign color scale colors to each magnitude level
function colors(mag) {
    return mag >= 5 ? '#DD342B' :
        mag >= 4 ? '#FA9261' :
            mag >= 3 ? '#FFE395' :
                mag >= 2 ? '#D6EC86' :
                    mag >= 1 ? '#8BCB58' :
                        '#188D4A';
}

function createFeatures(earthquakeData) {
    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    function onEachFeature(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place +
            "</h3><hr><p>" + new Date(feature.properties.time) +
            "</p><p><strong>Magnitude: </strong>" + feature.properties.mag
        );
    }

    // Define a function we want to run once for each feature in the features array
    // Give each feature a marker with size and color dependent on magnitude
    function pointToLayer(feature, latlng) {
        return L.circleMarker(latlng, {
            radius: feature.properties.mag * 5,
            fillColor: colors(feature.properties.mag),
            fillOpacity: .9,
            stroke: false,
        })
    }

    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: pointToLayer

    });

    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes);
}

function createMap(earthquakes) {
    // Define streetmap and darkmap layers
    var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.streets",
        accessToken: API_KEY
    });
    var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.dark",
        accessToken: API_KEY
    });

    // Define a baseMaps object to hold our base layers
    var baseMaps = {
        "Street Map": streetmap,
        "Dark Map": darkmap
    };

    // Create overlay object to hold our overlay layer
    var overlayMaps = {
        Earthquakes: earthquakes
    };

    // Create a new map
    var myMap = L.map("map", {
        center: [
            37.09, -98.71
        ],
        zoom: 5,
        layers: [streetmap, earthquakes]
    });

    // Create a layer control containing our baseMaps
    // Be sure to add an overlay Layer containing the earthquake GeoJSON
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    // Create a legend for color scale
    var legend = L.control({ position: 'bottomright' });
    legend.onAdd = function (myMap) {
        var div = L.DomUtil.create('div', 'info legend'),
        mags = [0, 1, 2, 3, 4, 5],
        labels = ["0-1", "1-2", "2-3", "3-4", "4-5", "5+"]
        div.innerHTML += '<h3>Magnitude</h3>'
        for (var i = 0; i < mags.length; i++) {
            div.innerHTML += '<i style="background:' + colors(mags[i]) + '"></i> ' +
            labels[i] + '<br>';
        }
        return div;
    }
    legend.addTo(myMap);
}