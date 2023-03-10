
// TODO: Write back features of all popups to JSON and send back JSON-file to create functioning pandapower data
// TODO: Add ext_grid markers and transformators to grid
// TODO: Add all necessary properties to GeoJSON structure
// TODO: Discuss with Soner which properties need to be editable
// TODO: Display data of selected bus/line etc in sidebar 
// TODO: Adjust geojson creation method for lines 

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

function createFeatures(isLines, ppdata, featureName, featureProperties, propertyGroupNames, propertyGroupFeatures) {
    let input_geoJSON = {"type" : "FeatureCollection", "features": []};                       
        
    let input_geodata = ppdata['_object'][featureName + '_geodata'];
    let input_geoCoords = JSON.parse(input_geodata['_object'])['data'];
    let input_geoIndices = JSON.parse(input_geodata['_object'])['index'];

    let input = ppdata['_object'][featureName];
    let input_data = JSON.parse(input['_object'])['data'];
    let input_indices = JSON.parse(input['_object'])['index'];
    let input_columns = JSON.parse(input['_object'])['columns'];

    let currentFeatureProperties = {};

    for (point in input_geoCoords) {
        currentFeatureProperties = {};

        let inputCoordinates = [];
        if(isLines) {
            for (i in input_geoCoords[point]) {
                inputCoordinates.push(input_geoCoords[point][i]);
            }
        }
        else {
            inputCoordinates = [input_geoCoords[point][0], input_geoCoords[point][1]];
        }

        //corresponding index value associated with the bus
        let pointIndex = input_geoIndices[point];
        let pointNameIndex = input_indices.indexOf(pointIndex, 0);

        if(featureProperties != null) {
            currentFeatureProperties.index = pointIndex;
            for (property in featureProperties) {
                currentFeatureProperties[featureProperties[property]] = (input_columns.indexOf(featureProperties[property], 0) == -1) ? null : input_data[pointNameIndex][input_columns.indexOf(featureProperties[property], 0)];
            }
        }

        if(propertyGroupNames != null && propertyGroupFeatures != null) {
            for (let property = 0; property < propertyGroupNames.length; property++) {
                let propertyGroup = ppdata['_object'][propertyGroupNames[property]];
                let extractedProperties = extractPropertiesFromNet(propertyGroup, pointIndex, propertyGroupFeatures[property])
                currentFeatureProperties[propertyGroupNames[property]] = extractedProperties;
            }
        }

        let feature = { "type": "Feature", 
                        "geometry": {"type": (isLines) ? "LineString" : "Point", "coordinates": (isLines) ? inputCoordinates[0] : inputCoordinates}, 
                        "properties": currentFeatureProperties
                    };
        input_geoJSON.features.push(feature);
    }
    return input_geoJSON;
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

        let line_properties = ["name","from_bus", "to_bus","length_km","r_ohm_per_km", "x_ohm_per_km", "c_nf_per_km", "r0_ohm_per_km", "x0_ohm_per_km", "c0_nf_per_km", "max_i_ka", "std_type","df","g_us_per_km", "g0_us_per_km","parallel","max_loading_percent","alpha","temperature_degree_celsius", "tdpf","wind_speed_m_per_s", "wind_angle_degree", "conductor_outer_diameter_m", "air_temperature_degree_celsius","reference_temperature_degree_celsius", "solar_radiation_w_per_sq_m", "solar_absorptivity", "emissivity", "r_theta_kelvin_per_mw", "mc_joule_per_m_k"];
        let line_geoJSON = createFeatures(true, ppdata, 'line', line_properties, null, null);
        
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

        let bus_properties =  ["name","vn_kv","type","in_service", "max_vm_pu","min_vm_pu",]    
        let load_features = ['name', 'p_mw', 'q_mvar','max_p_mw', 'min_p_mw', 'max_q_mvar', 'min_q_mvar', 'const_z_percent', 'const_i_percent', 'sn_mva', 'scaling', 'in_service', 'type', 'controllable'];
        let sgen_features = ['name', 'p_mw', 'q_mvar', 'max_p_mw', 'min_p_mw', 'max_q_mvar', 'min_q_mvar', 'sn_mva', 'scaling', 'in_service', 'type', 'current_source', 'k', 'rx', 'generator_type', 'lrc_pu', 'max_ik_ka', 'kappa', 'controllable'];
        let switch_features = ['name', 'element', 'et', 'type', 'closed', 'z_ohm', 'in_ka'];  

        let bus_geoJSON = createFeatures(false, ppdata, 'bus', bus_properties, ['load', 'sgen', 'switch'], [load_features, sgen_features, switch_features]);

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