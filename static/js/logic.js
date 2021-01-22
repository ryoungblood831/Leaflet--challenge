// json data URL
var earthURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

var plateURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json"

function circleColor(mag) {
  if (mag <= 2) {
    return "#ffcfdb";
  }
  else if (mag <= 3) {
    return "#ff8992";
  }
  else if (mag <= 4) {
    return "#ff676d";
  }
  else if (mag <= 5) {
    return "#ff4449";
  }
  else {
    return "#ff2224";
  }
};

function circleSize(mag) {
  return mag*5;
}
earthquakeData = {}

// Perform a GET request to the query URL
d3.json(earthURL, function(error, earthquakeData) {
  if (error) throw error;
  console.log(earthquakeData.features);

    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(earthquakeData.features);
  });
  
  function createFeatures(earthquakeData) {

    function onEachFeature(feature, layer) {
      layer.bindPopup("<h3>" + feature.properties.place +
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p><p>Magnitude: " + 
        feature.properties.mag + "</p>")}
  
    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    var earthquakes = L.geoJSON(earthquakeData, {
      
    //map the description for each point
    onEachFeature : onEachFeature,
    // map the marker color and size
    pointToLayer : function(feature, latlng) {
      return L.circleMarker(latlng,
        {radius: circleSize(feature.properties.mag),
        fillColor: circleColor(feature.properties.mag),
        fillOpacity: 0.75,
        stroke: false,
        bubblingMouseEvent: true}
        );
      }
    });


  // Techtonic plates
  d3.json(plateURL, function(error, plateData) {
    if (error) throw error;
    console.log(plateData.features);
  
      // Once we get a response, send the data.features object to the createFeatures function
      plateFeatures(plateData.features);
    });

    function plateFeatures(plateData) {

      function onEachFeature(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.PlateName + "</h3>")
      }

  var techPlates = L.geoJson(plateData, {
    onEachFeature: onEachFeature,
    pointToLayer : function(latlng) {
      return L.polygon(features.geometry.coordinates);
    }
  });
  createMap(earthquakes, techPlates);
}};

  
  function createMap(earthquakes, techPlates) {
  
      // Define streetmap and darkmap layers
  // Create the tile layer that will be the background of our map
  var streetMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  maxZoom: 18,
  id: "mapbox/streets-v11",
  accessToken: API_KEY
  });
  
  var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "light-v10",
    accessToken: API_KEY
  })

  // Define a baseMaps object to hold our base layers
  var baseMaps = {"Street Map": streetMap,
  "Light Map": lightmap};

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes,
    TechtonicPlates: techPlates
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [34.655424,-117.476742],
    zoom: 6,
    layers: [streetMap, earthquakes]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
}