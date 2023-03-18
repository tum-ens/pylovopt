//-----------------------------CRUCIAL JS TODOS-----------------------------//
// TODO: Save changed data of selected bus/line etc in sidebar, check for correct inputs
// TODO: Write back features of all markers to JSON and send back JSON-file to create functioning pandapower data
// TODO: Add legend for each marker type

//-----------------------------TALK TODOS-----------------------------//
// TODO: Discuss if actual map location search option is needed 
// TODO: Discuss which feature properties need to be editable
// TODO: Ask about trafo locations, change back to circle marker if necessary for better visualization
// TODO: Ask if written documentation outside of code is necessary for project hand-in

//-----------------------------OPTIONAL TODOS-----------------------------//
// TODO: put geojson.to_map() ops into their own functions for line and circlemarker respectively to further clean up code and avoid repetition
// TODO: Deselect marker when clicking elsewhere on the map?
// TODO: Decide whether area selection needs different shape options or if we want to stick only with Polygon
// TODO: put functions into their own separate js file to clean up main script.js
// TODO: put marker styles into css

  //define styles for selected and unselected states of our map features
  function getStyleDict() {
    var styleDict = {BusStyles: [{  radius: 9,
                                    fillColor: "#d67900",
                                    color: "#4e2204",
                                    weight: 1,
                                    opacity: 1,
                                    fillOpacity: 1
                                }
                                ,
                                {   radius: 8,
                                    fillColor: "#0065BD",
                                    color: "#012b8c",
                                    weight: 1,
                                    opacity: 1,
                                    fillOpacity: 1
                                }],
                     LineStyles: [{ color: "#ff0000",
                                    weight: 4,
                                    opacity: 1
                                }
                                ,
                                {   color: "#007deb",
                                    weight: 4,
                                    opacity: 1
                                }],
                     ExtStyles: [{  radius: 15,
                                    fillColor: "#f55353",
                                    color: "#cf2d3b",
                                    weight: 1,
                                    opacity: 1,
                                    fillOpacity: 1
                                }
                                ,
                                {   radius: 14,
                                    fillColor: "#f5da53",
                                    color: "#e6b029",
                                    weight: 1,
                                    opacity: 1,
                                    fillOpacity: 1
                                }],
                     TrafoStyles: [{color: "#ff0000",
                                    weight: 10,
                                    opacity: 1
                                }
                                ,
                                {   color: "#42bd4a",
                                    weight: 5,
                                    opacity: 1
                                }]            
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

//function switches between Selected and Unselected stle for all map features
function clickOnMarker(target, styleDict, feature) {
    let styles = ['BusStyles', 'LineStyles', 'ExtStyles', 'TrafoStyles'];
    let style = styles[feature];
    let zoomLevel = 14;

    if(style == 'BusStyles' || style == 'ExtStyles') {
        map.setView(target.getLatLng(), Math.max(map.getZoom(), zoomLevel));
    }
    else {
        map.setView(target.getLatLngs()[0], Math.max(map.getZoom(), zoomLevel));
    }

    if(clicked) {
        let oldStyle = styles[clicked[1]];
        clicked[0].setStyle(styleDict[oldStyle][1]);
    }
    target.setStyle(styleDict[style][0]);
    clicked = [target, feature];

    let featureLists = [busList, lineList, ext_gridList, trafoList];
    let selectLists = ['bus', 'line', 'trafo', 'ext_grid'];
    let featureList = featureLists[feature];
    let selectList = selectLists[feature];

    let selectedButton = document.getElementById(selectList + "ListButton");
    selectedButton.click();

    let selectedList = document.getElementById(selectList + "Select");
    let newIndex = featureList.findIndex((entry) => entry === target);
    selectedList.selectedIndex = newIndex;
}

//variable that saves last selected path and resets its style when it's deselected
let clicked;
let busList = [];
let lineList = [];
let trafoList = [];
let ext_gridList = [];
let std_typesList = [];

//function generates GeoJSON for a given feature (i.e. bus, line, trafo, ext_grid)
function createFeatures(isLines, ppdata, featureName, featureProperties, propertyGroupNames, propertyGroupFeatures) {
    let input_geoJSON = {"type" : "FeatureCollection", "features": []};     
    
    let input = ppdata['_object'][featureName];
    let input_data = JSON.parse(input['_object'])['data'];
    let input_indices = JSON.parse(input['_object'])['index'];
    let input_columns = JSON.parse(input['_object'])['columns'];
    
    let input_geodata = {};
    let input_geoCoords = {};
    let input_geoIndices = {};

    if(featureName == 'bus' || featureName == 'line') {
        input_geodata = ppdata['_object'][featureName + '_geodata'];
        input_geoCoords = JSON.parse(input_geodata['_object'])['data'];
        input_geoIndices = JSON.parse(input_geodata['_object'])['index'];
    }
    //(ext_grid and trafo geolocation depend on geolocation of buses)
    else {
        let input_columns = JSON.parse(input['_object'])['columns'];
        let idx = [0, 0];
        let temp = [];

        input_geodata = ppdata['_object']['bus_geodata'];
        input_geoCoords = JSON.parse(input_geodata['_object'])['data'];
        input_geoIndices = JSON.parse(input_geodata['_object'])['index'];

        if(featureName == 'ext_grid') {
            idx[0] = input_columns.indexOf('bus', 0);
            for (entry in input_data) {
                 for (geo_entry in input_geoIndices) {
                     if (input_data[entry][idx[0]] == input_geoIndices[geo_entry]) {
                         temp.push(input_geoCoords[geo_entry]);
                         break;
                     }
     
                 }
             }
        }
        else if (featureName == 'trafo') {
            idx[0] = input_columns.indexOf('hv_bus', 0);
            idx[1] = input_columns.indexOf('lv_bus', 0);
            tempLine = [];
           
            for (entry in input_data) {
                tempLine = [];
                 for (let geo_entry = 0; geo_entry < input_geoIndices.length; geo_entry++) {
                     if (input_data[entry][idx[0]] == input_geoIndices[geo_entry]) {
                        let x1 = [input_geoCoords[geo_entry][0], input_geoCoords[geo_entry][1]];
                        tempLine.push(x1);

                        for (let second_entry = 0; second_entry < input_geoIndices.length; second_entry++) {
                            if (input_data[entry][idx[1]] == input_geoIndices[second_entry]) {
                                let x2 = [input_geoCoords[second_entry][0], input_geoCoords[second_entry][1]]
                                tempLine.push(x2);
                                break;
                            }
                        }
                        temp.push([tempLine]);
                        break;
                     }
                 }
             }
        }
        input_geoCoords = temp;
    }
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
        let pointNameIndex = (input_indices.indexOf(pointIndex, 0) != -1) ? input_indices.indexOf(pointIndex, 0) : pointIndex;

        if(featureProperties != null) {
            currentFeatureProperties.index = pointIndex;
            for (property in featureProperties) {
                currentFeatureProperties[featureProperties[property]] = (input_columns.indexOf(featureProperties[property], 0) == -1) ? null : input_data[pointNameIndex][input_columns.indexOf(featureProperties[property], 0)];
            }
        }

        //we add load, switch etc as subproperties on one of our main features
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

function displayNet(ppdata) {
        let line_properties = ["name","from_bus", "to_bus","length_km","r_ohm_per_km", "x_ohm_per_km", "c_nf_per_km", "r0_ohm_per_km", "x0_ohm_per_km", "c0_nf_per_km", "max_i_ka", "std_type","df","g_us_per_km", "g0_us_per_km","parallel","max_loading_percent","alpha","temperature_degree_celsius", "tdpf","wind_speed_m_per_s", "wind_angle_degree", "conductor_outer_diameter_m", "air_temperature_degree_celsius","reference_temperature_degree_celsius", "solar_radiation_w_per_sq_m", "solar_absorptivity", "emissivity", "r_theta_kelvin_per_mw", "mc_joule_per_m_k"];
        let line_geoJSON = createFeatures(true, ppdata, 'line', line_properties, null, null);
        
        L.geoJSON(line_geoJSON, {
            onEachFeature: function(feature, layer) {
                //layer.features = feature;
                createPopup(feature, layer);
                lineList.push(layer);
                layer.on('click', function(e) {
                    clickOnMarker(e.target, getStyleDict(), 1);
                })
            },
            style: getStyleDict()['LineStyles'][1]        
        }).addTo(map);

        console.log("added all lines");

        let ext_grid_properties = ["name", "bus", "vm_pu", "va_degree", "s_sc_max_mva", "s_sc_min_mva", "rx_max", "rx_min", "max_p_mw", "max_p_mw", "max_q_mvar", "min_q_mvar", "r0x0_max", "x0x_max", "slack_weight", "controllable"];
        let ext_grid_geoJSON = createFeatures(false, ppdata, 'ext_grid', ext_grid_properties, null, null);
        L.geoJSON(ext_grid_geoJSON, {
            onEachFeature: function(feature, layer) {
                //layer.features = feature;
                createPopup(feature, layer);
                ext_gridList.push(layer);
            },
            pointToLayer: function (feature, latlng) {
                var marker = L.circleMarker(latlng, getStyleDict()['ExtStyles'][1]);
                //marker.features = feature;

                marker.on('click', function(e) {
                    clickOnMarker(e.target, getStyleDict(), 2);
                });
                return marker;
            }
        }).addTo(map);
        console.log('added all external grids');

        let bus_properties =  ["name","vn_kv","type","in_service", "max_vm_pu","min_vm_pu",]    
        let load_features = ['name', 'p_mw', 'q_mvar','max_p_mw', 'min_p_mw', 'max_q_mvar', 'min_q_mvar', 'const_z_percent', 'const_i_percent', 'sn_mva', 'scaling', 'in_service', 'type', 'controllable'];
        let sgen_features = ['name', 'p_mw', 'q_mvar', 'max_p_mw', 'min_p_mw', 'max_q_mvar', 'min_q_mvar', 'sn_mva', 'scaling', 'in_service', 'type', 'current_source', 'k', 'rx', 'generator_type', 'lrc_pu', 'max_ik_ka', 'kappa', 'controllable'];
        let switch_features = ['name', 'element', 'et', 'type', 'closed', 'z_ohm', 'in_ka'];  

        let bus_geoJSON = createFeatures(false, ppdata, 'bus', bus_properties, ['load', 'sgen', 'switch'], [load_features, sgen_features, switch_features]);

        L.geoJSON(bus_geoJSON, {
            onEachFeature: function(feature, layer) {
                createPopup(feature, layer);
                busList.push(layer);
            },
            pointToLayer: function (feature, latlng) {
                var marker = L.circleMarker(latlng, getStyleDict()['BusStyles'][1]);
                marker.on('click', function(e) {
                    clickOnMarker(e.target, getStyleDict(), 0);
                });
                return marker;
            }
        }).addTo(map);

        console.log('added all buses');

        let trafo_properties = ["name", "hv_bus", "lv_bus", "std_type", "vk0_percent", "vkr0_percent", "mag0_percent", "mag0_rx", "si0_hv_partial", "tap_pos", "in_service", "max_loading_percent", "parallel", "df", "tap_dependent_impedance", "vk_percent_characteristic", "vkr_percent_characteristic", "xn_ohm"];
        let trafo_geoJSON = createFeatures(true, ppdata, 'trafo', trafo_properties, null, null);
        let moveTo = L.geoJSON(trafo_geoJSON, {
            onEachFeature: function(feature, layer) {
                createPopup(feature, layer);
                trafoList.push(layer);
                layer.on('click', function(e) {
                    clickOnMarker(e.target, getStyleDict(), 3);
                })
            },
            style: getStyleDict()['TrafoStyles'][1]
        }).addTo(map);
        console.log('added all trafos');

        map.fitBounds(moveTo.getBounds());

        populateLists('bus', busList);
        populateLists('line', lineList);
        populateLists('trafo', trafoList);
        populateLists('ext_grid', ext_gridList);

        populateEditor('bus', bus_properties);
        populateEditor('line', line_properties);
        populateEditor('trafo', trafo_properties);
        populateEditor('ext_grid', ext_grid_properties);
        //populateLists('std_types');

        tabcontent = document.getElementsByClassName("tablinks");
        for (i = 0; i < tabcontent.length; i++) {
          tabcontent[i].style.display = "inline-flex";
        }
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
        
    //     shapes.features.forEach((shape)=>{
    //         //console.log(shape);
    //         //Post the selected area as geojson shapefile
    //         fetch("http://127.0.0.1:5000//networks/editableNetwork", {
    //             method: 'POST',
    //             headers: {
    //                 'Content-type': 'application/json'},
    //             body: JSON.stringify(shape)
    //         }).then(response =>{
    //             console.log("Success")
    //         }).catch((err) => console.error(err));
    //         });    
    }

    console.log('starting Fetch');  
    fetch('/networks/editableNetwork')
    .then(function (response) {
        return response.json();
    }).then(function (ppdata) {
        var layers = L.PM.Utils.findLayers(map);
        layers.forEach((layer) =>{
                layer.remove();
        });
        console.log(ppdata);
        console.log('Begin displaying net:');
        displayNet(ppdata);
    });
}

  window.addEventListener("load", (event) => {
    if(window.location.pathname == '/networks') {
        WriteShapefiles();
    }
  });