
//MapContainer//
var map = L.map('map', {}).setView([29.728157, -95.556389], 8);
//TileLayer//
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
//fetch//
$.ajax({
    url: 'GDB.js',
    success: function (response) {
        var oilJsnmap = JSON.parse(response);
        var oilLines = L.geoJSON(oilJsnmap, {
            style: linestyle,
            onEachFeature: function (feature, layer) {
                console.log(feature.properties); 
                var popupContent = '<h4>' + feature.properties.opername + '</h4>' + '<br>' + '<p>' + feature.properties.pipename + '</p>' + '</br>' + '<p>' + 'Price: $' + (feature.properties.shape_leng * 100) + '</p>';
                layer.bindPopup(popupContent);
            }
        });

        oilLines.addTo(map);
    },
    error: function (xhr, status, error) {
        alert("ERROR: " + error);
    }
});
//
var linestyle = {
    "color": "black",
    "weight": 1
};
$.ajax({
    url: 'GDB.js',
    success: function (response) {
        // Convert the response to a JSON object
        var parsedGeoJSON = JSON.parse(response);
        // Handle the GeoJSON data
        processGeoJSON(parsedGeoJSON);
    },
    error: function (xhr, status, error) {
        console.error("Error fetching GeoJSON:", error);
    }
});

function processGeoJSON(geojson) {
    if (geojson && geojson.features) {
        var ul = document.createElement('ul');
        ul.classList.add('list');

        geojson.features.forEach(function (feature) {
            if (feature.properties.opername && feature.properties.pipename) {
                var li = document.createElement('li');
                li.classList.add('list-item');

                for (var prop in feature.properties) {
                    var propElement = document.createElement('div');
                    propElement.classList.add('property');
                    propElement.textContent = prop + ': ' + feature.properties[prop];

                    li.appendChild(propElement);
                }

                li.addEventListener('click', function () {
                    clickedFeature = feature;
                    var coordinates = feature.geometry.coordinates[0][0];
                    var swappedCoordinates = [coordinates[1], coordinates[0]];
                    map.flyTo(swappedCoordinates, 13);
                });

                ul.appendChild(li);
            }
        });

        document.getElementById('listContainer').appendChild(ul);
    } else {
        console.error("Invalid or empty GeoJSON format:", geojson);
    }
}

// Assuming you have access to oilLines
map.on('click', function () {
    if (clickedFeature) {
        var coordinates = clickedFeature.geometry.coordinates[0][0];
        var swappedCoordinates = [coordinates[1], coordinates[0]];
        oilLines.eachLayer(function (layer) {
            if (layer.feature === clickedFeature) {
                layer.openPopup();
            }
        });
    }
});