const tileProvider = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const  mapOptions = {
    center: [48.4109158419, 7.7652256726],
    zoom: 11,
    pmIgnore: false
    }
    
var map = new L.map('map', mapOptions);
L.tileLayer(tileProvider, {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

//We remove all preexisting options execpt quad, circle and polygon (might only use polygon for ease tbh)
map.pm.addControls({  
    position: 'topleft',  
    drawPolyline: false,  
    drawMarker: false,
    drawCircleMarker: false,
    drawText: false,
    cutPolygon: false
  });  

function onEachFeature(feature, layer) {
    // does this feature have a property named popupContent?
    layer.bindPopup("Hello World");
}

//generates GeoJSON files to pass to the python section of our code, gets called on button press
function WriteShapefiles() {
    var layers = L.PM.Utils.findLayers(map);
    if(layers.length != 0) {
        var group = L.featureGroup();
        layers.forEach((layer)=>{
            group.addLayer(layer);
        });
        shapes = group.toGeoJSON();
        
        shapes.features.forEach((shape)=>{
            //console.log(shape);
            //Post the selected area as geojson shapefile
            fetch("http://127.0.0.1:5000/network", {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'},
                body: JSON.stringify(shape)
            }).then(response =>{
                console.log("Success")
            }).catch((err) => console.error(err));
            });    

            fetch('/network')
            .then(function (response) {
                return response.json();
            }).then(function (text) {
                var layers = L.PM.Utils.findLayers(map);
                layers.forEach((layer) =>{
                        layer.remove();
                });
                console.log('GET response:');
                
                var geojsonMarkerOptions = {
                    radius: 8,
                    fillColor: "#0065BD",
                    color: "#000",
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.8
                };

                L.geoJSON(text, {
                    onEachFeature: onEachFeature,
                    pointToLayer: function (feature, latlng) {
                        return L.circleMarker(latlng, geojsonMarkerOptions);
                    }
                }).addTo(map);
                // for (var key in text['x']) {
                //     console.log(text['x'][key], text['y'][key]);
                //     var marker = L.marker([parseFloat(text['y'][key]), parseFloat(text['x'][key])]).addTo(map);
                //     marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
                // }
            });
    }
    //var marker = L.marker([48.1844, 11.4668]).addTo(map);
    //marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
}

//We only ever want to have one shape at the same time
map.on('pm:drawstart', ({ workingLayer }) => {
var layers = L.PM.Utils.findLayers(map);
layers.forEach((layer) =>{
        layer.remove();
});
});

map.on('popupopen', function(e) {
    var marker = e.popup._source;
    console.log(marker.getLatLng()['lat'])
    document.getElementById('latlon').innerHTML = 'Lat: ' + marker.getLatLng()['lat'] + ' Long: ' + marker.getLatLng()['lng']
  });