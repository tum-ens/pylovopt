
// TODO: Write back features of all popups to JSON and send back JSON-file to create functioning pandapower data
// TODO: Add ext_grid markers and transformators to grid
// TODO: Add all necessary properties to GeoJSON structure
// TODO: Display data of selected bus/line etc in sidebar 

//extends popup so we can save feature data for debugging purposes
L.Popup.include({
    features: {}
});

//extends path so we can save feature data in circlemarkers, lines for further use
L.Path.include({
    features: {}
});

//saves last selected path and resets its color when it's deselected
let clicked;

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

  //Purely for debug, we will want to keep feature information within the markers themselves
function createPopup(feature, layer) {
    var popup = L.popup();
    popup.features = feature
    popup.setContent(
        "Index: " + popup.features.properties.index + "<br>" 
        + "Name: " + popup.features.properties.name + "<br>" 
    );

    layer.bindPopup(popup);
}

function clickOnMarker(e, clickStyle, unclickStyle) {
    if(clicked) {
        clicked.setStyle(unclickStyle);
    }
    e.target.setStyle(clickStyle);
    clicked = e.target;
}

function displayNet() {
    console.log('starting Fetch');
    fetch('/network')
    .then(function (response) {
        return response.json();
    }).then(function (ppdata) {
        var layers = L.PM.Utils.findLayers(map);
        layers.forEach((layer) =>{
                layer.remove();
        });
        console.log('GET response:');
        let line_geoJSON = {"type" : "FeatureCollection", "features": []};
        let line_geodata = ppdata['_object']['line_geodata'];
        let line = ppdata['_object']['line'];
    
        let line_geoCoords = JSON.parse(line_geodata['_object'])['data'];
        let line_geoIndices = JSON.parse(line_geodata['_object'])['index'];

        let line_data = JSON.parse(line['_object'])['data'];
        let line_indices = JSON.parse(line['_object'])['index'];

        for (point in line_geoCoords) {
            //lat/long coordinate of our line string
            let lineCoordinates = [];
            for (i in line_geoCoords[point]) {
                lineCoordinates.push(line_geoCoords[point][i]);
            }

            //corresponding index value associated with the line
            let lineIndex = line_geoIndices[point];

            let lineNameIndex = line_indices.indexOf(lineIndex, 0);
            let feature = { "type": "Feature", 
                            "geometry": {"type": "LineString", "coordinates": lineCoordinates[0]}, 
                            "properties": { "index": lineIndex,
                                            "name": line_data[lineNameIndex][0]
                                        }
                        };
            line_geoJSON.features.push(feature);
        }

        var lineClickStyle = {
            color: "#ff0000",
            weight: 4,
            opacity: 1
        };

        var lineUnclickStyle = {
            color: "#000",
            weight: 4,
            opacity: 1
        };

        L.geoJSON(line_geoJSON, {
            onEachFeature: function(feature, layer) {
                createPopup(feature, layer);
                layer.on('click', function(e) {
                    clickOnMarker(e, lineClickStyle, lineUnclickStyle);
                })
            },
            style: lineUnclickStyle        
        }).addTo(map);

        console.log("added all lines");

        //Final GeoJSON file we use to display the bus
        let bus_geoJSON = {"type" : "FeatureCollection", "features": []};                       
        let bus_geodata = ppdata['_object']['bus_geodata'];
        let bus = ppdata['_object']['bus'];

        let bus_geoCoords = JSON.parse(bus_geodata['_object'])['data'];
        let bus_geoIndices = JSON.parse(bus_geodata['_object'])['index'];
        //contains name, vn_kv, in_service information
        let bus_data = JSON.parse(bus['_object'])['data'];
        let bus_indices = JSON.parse(bus['_object'])['index'];

        for (point in bus_geoCoords) {
            //lat/long coordinate of our bus marker
            let pointCoordinate = [bus_geoCoords[point][0], bus_geoCoords[point][1]];
            //corresponding index value associated with the bus
            let pointIndex = bus_geoIndices[point];
            /*The element in the bus datastructure lies at the same index as the corresponding index value pointIndex of the geodata 
            * i.e. geopoint x has index value 159: The index value in the bus index array lies at index 99.
            * The array containing name, etc. of our bus with index 159 thus lies at index 99 in the bus data array.
            */
            //index at which the bus data for correspondidng pointIndex is located in the bus_data array
            let pointNameIndex = bus_indices.indexOf(pointIndex, 0);
            let feature = { "type": "Feature", 
                            "geometry": {"type": "Point", "coordinates": pointCoordinate}, 
                            "properties": { "index": pointIndex,
                                            "name": bus_data[pointNameIndex][0],
                                            "V_n": bus_data[pointNameIndex][1],
                                            "static_generation": 0.0
                                        }
                        };
            bus_geoJSON.features.push(feature);
        }

        var markerClickStyle = {
            radius: 9,
            fillColor: "#d67900",
            color: "#4e2204",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        };

        var markerUnclickStyle = {
            radius: 8,
            fillColor: "#0065BD",
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        };

        L.geoJSON(bus_geoJSON, {
            onEachFeature: createPopup,
            pointToLayer: function (feature, latlng) {
                var marker = L.circleMarker(latlng, markerUnclickStyle);
                marker.on('click', function(e) {
                    clickOnMarker(e, markerClickStyle, markerUnclickStyle);
                });
                return marker;
            }
        }).addTo(map);
        console.log('added all buses');

    });
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
    }
    displayNet();
}

//We only ever want to have one shape at the same time
map.on('pm:drawstart', ({ workingLayer }) => {
var layers = L.PM.Utils.findLayers(map);
layers.forEach((layer) =>{
        layer.remove();
});
});

//on clicking on an element, we display information of the selected node in our sidebar for editing
//TODO: disable opening a new popup if unsaved changes are displayed in sidebar
map.on('popupopen', function(e) {
    //map.closePopup();
    //var marker = e.popup._source;
    //document.getElementById('latlon').innerHTML = 'Lat: ' + marker.getLatLng()['lat'] + ' Long: ' + marker.getLatLng()['lng']
  });