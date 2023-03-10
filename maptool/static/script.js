
// TODO: Write back features of all popups to JSON and send back JSON-file to create functioning pandapower data
// TODO: Add ext_grid markers and transformators to grid
// TODO: Add all necessary properties to GeoJSON structure
// TODO: Discuss with Soner which properties need to be editable
// TODO: Display data of selected bus/line etc in sidebar 
// TODO: Avoid repetition in code by putting geojson generation in single method

//extends popup so we can save feature data for debugging purposes
// L.Popup.include({
//     features: {}
// });

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

function getStyleDict() {
    var styleDict = {BusStyles: [{  radius: 9,
                                    fillColor: "#d67900",
                                    color: "#4e2204",
                                    weight: 1,
                                    opacity: 1,
                                    fillOpacity: 0.8
                                }
                                ,
                                {   radius: 8,
                                    fillColor: "#0065BD",
                                    color: "#000",
                                    weight: 1,
                                    opacity: 1,
                                    fillOpacity: 0.8
                                }],
                     LineStyles: [{ color: "#ff0000",
                                    weight: 4,
                                    opacity: 1
                                }
                                ,
                                {   color: "#000",
                                    weight: 4,
                                    opacity: 1
                                }],
                     ExtStyles: [

                     ],
                     TrafoStyles: [

                     ]            
                    };
    return styleDict;
}

//Purely for debug, we will want to keep feature information within the markers themselves
function createPopup(feature, layer) {
    var popup = L.popup();
    popup.setContent(
        "Index: " + feature.properties.index + "<br>" 
        + "Name: " + feature.properties.name + "<br>" 
    );


    layer.bindPopup(popup);
}

function clickOnMarker(e, styleDict, feature) {
    let styles = ['BusStyles', 'LineStyles'];
    let style = styles[feature];
    if(clicked) {
        let oldStyle = styles[clicked[1]];
        clicked[0].setStyle(styleDict[oldStyle][1]);
    }
    e.target.setStyle(styleDict[style][0]);
    clicked = [e.target, feature];
}

function extractPropertiesFromNet(input, pointIndex, properties) {
    if (typeof(input) == undefined) {
        return {};
    }

    let input_data = JSON.parse(input['_object'])['data'];
    let input_indices = JSON.parse(input['_object'])['index'];
    let input_columns = JSON.parse(input['_object'])['columns'];
    let idx = input_columns.indexOf('bus', 0);

    let output = {};

    for (entry in input_data) {
        if (input_data[entry][idx] == pointIndex) {
            output.index = input_indices[entry];
            for (property in properties) {
                output[properties[property]] = (input_columns.indexOf(properties[property], 0) == -1) ? null : input_data[entry][input_columns.indexOf(properties[property], 0)];
            }
            break;
        }
    }

    return output;
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
        console.log('Begin displaying net:');
        let line_geoJSON = {"type" : "FeatureCollection", "features": []};
        
        let line_geodata = ppdata['_object']['line_geodata'];
        let line_geoCoords = JSON.parse(line_geodata['_object'])['data'];
        let line_geoIndices = JSON.parse(line_geodata['_object'])['index'];

        let line = ppdata['_object']['line'];
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
                                            "name": line_data[lineNameIndex][0],
                                            "from_bus": null, 
                                            "to_bus": null,
                                            "length_km": null,
                                            "r_ohm_per_km": null, 
                                            "x_ohm_per_km": null, 
                                            "c_nf_per_km": null, 
                                            "r0_ohm_per_km": null, 
                                            "x0_ohm_per_km": null, 
                                            "c0_nf_per_km": null, 
                                            "max_i_ka": null, 
                                            "std_type": null,
                                            "df": null,
                                            "g_us_per_km": null, 
                                            "g0_us_per_km": null, 
                                            "parallel": null,
                                            "max_loading_percent" : null,
                                            "alpha" : null,
                                            "temperature_degree_celsius" : null, 
                                            "tdpf" : null,
                                            "wind_speed_m_per_s": null, 
                                            "wind_angle_degree": null, 
                                            "conductor_outer_diameter_m": null, 
                                            "air_temperature_degree_celsius": null, 
                                            "reference_temperature_degree_celsius": null, 
                                            "solar_radiation_w_per_sq_m" : null, 
                                            "solar_absorptivity": null, 
                                            "emissivity": null, 
                                            "r_theta_kelvin_per_mw": null, 
                                            "mc_joule_per_m_k": null
                                        }
                        };
            line_geoJSON.features.push(feature);
        }

        L.geoJSON(line_geoJSON, {
            onEachFeature: function(feature, layer) {
                layer.features = feature;
                createPopup(feature, layer);
                layer.on('click', function(e) {
                    clickOnMarker(e, getStyleDict(), 1);
                })
            },
            style: getStyleDict()['LineStyles'][1]        
        }).addTo(map);

        console.log("added all lines");

        //Final GeoJSON file we use to display the bus
        let bus_geoJSON = {"type" : "FeatureCollection", "features": []};                       
        
        let bus_geodata = ppdata['_object']['bus_geodata'];
        let bus_geoCoords = JSON.parse(bus_geodata['_object'])['data'];
        let bus_geoIndices = JSON.parse(bus_geodata['_object'])['index'];

        let bus = ppdata['_object']['bus'];
        let bus_data = JSON.parse(bus['_object'])['data'];
        let bus_indices = JSON.parse(bus['_object'])['index'];
        let bus_columns = JSON.parse(bus['_object'])['columns'];

        let load = ppdata['_object']['load'];
        //keys that will be included in load properties of a bus feature, if bus has a load
        let load_features = ['name', 'p_mw', 'q_mvar','max_p_mw', 'min_p_mw', 'max_q_mvar', 'min_q_mvar', 'const_z_percent', 'const_i_percent', 'sn_mva', 'scaling', 'in_service', 'type', 'controllable'];
        let load_properties = {};

        let sgen = ppdata['_object']['sgen'];
        //keys that will be included in sgen properties of a bus feature, if bus has a static Generator
        let sgen_features = ['name', 'p_mw', 'q_mvar', 'max_p_mw', 'min_p_mw', 'max_q_mvar', 'min_q_mvar', 'sn_mva', 'scaling', 'in_service', 'type', 'current_source', 'k', 'rx', 'generator_type', 'lrc_pu', 'max_ik_ka', 'kappa', 'controllable'];
        let sgen_properties = {};

        let pp_switch = ppdata['_object']['switch'];
        //keys that will be included in switch properties of a bus feature, if bus has a switch
        let switch_features = ['name', 'element', 'et', 'type', 'closed', 'z_ohm', 'in_ka'];
        let switch_properties = {}

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

            let bus_name = (bus_columns.indexOf('name', 0) == -1) ? null : bus_data[pointNameIndex][bus_columns.indexOf('name', 0)];
            let bus_type = (bus_columns.indexOf('type', 0) == -1) ? null : bus_data[pointNameIndex][bus_columns.indexOf('type', 0)];
            let bus_inService = (bus_columns.indexOf('in_service', 0) == -1) ? null : bus_data[pointNameIndex][bus_columns.indexOf('in_service', 0)];
            let bus_vn_kv = (bus_columns.indexOf('vn_kv', 0) == -1) ? null : bus_data[pointNameIndex][bus_columns.indexOf('vn_kv', 0)];

            load_properties = extractPropertiesFromNet(load, pointIndex, load_features);

            sgen_properties = extractPropertiesFromNet(sgen, pointIndex, sgen_features);

            switch_properties = extractPropertiesFromNet(pp_switch, pointIndex, switch_features);

            let feature = { "type": "Feature", 
                            "geometry": {"type": "Point", "coordinates": pointCoordinate}, 
                            "properties": { "index": pointIndex,
                                            "name": bus_name,
                                            "vn_kv": bus_vn_kv,
                                            "type" : bus_type,
                                            "in_service": bus_inService, 
                                            "max_vm_pu" : null,
                                            "min_vm_pu" : null,
                                            "load" : load_properties,
                                            "sgen" : sgen_properties,
                                            "switch" : switch_properties
                                        }
                        };
            bus_geoJSON.features.push(feature);
        }

        console.log(bus_geoJSON);

        L.geoJSON(bus_geoJSON, {
            onEachFeature: createPopup,
            pointToLayer: function (feature, latlng) {
                var marker = L.circleMarker(latlng, getStyleDict()['BusStyles'][1]);
                marker.features = feature;
                marker.on('click', function(e) {
                    clickOnMarker(e, getStyleDict(), 0);
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
//TODO: disable opening a new popup if unsaved changes are displayed in sidebar or save changes automatically 
map.on('popupopen', function(e) {
    //map.closePopup();
    var marker = e.popup._source;
    console.log(marker.features.properties);
    //document.getElementById('latlon').innerHTML = 'Lat: ' + marker.getLatLng()['lat'] + ' Long: ' + marker.getLatLng()['lng']
  });