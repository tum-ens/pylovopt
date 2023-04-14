//-----------------------------CRUCIAL JS TODOS-----------------------------//
// TODO: define, check for correct inputs for all features
// TODO: Write back features of all markers to JSON and send back JSON-file to create functioning pandapower data
// TODO: Add trafo3w features to network

//-----------------------------TALK TODOS-----------------------------//
// TODO: Ask if written documentation outside of code is necessary for project hand-in

//-----------------------------OPTIONAL TODOS-----------------------------//
// TODO: Deselect marker when clicking elsewhere on the map?


//variable that saves last selected path and resets its style when it's deselected
let clicked;

let line_std_properties = ["r_ohm_per_km", "x_ohm_per_km", "max_i_ka", "c_nf_per_km", "q_mm2", "type", "alpha"];
let trafo_std_properties = ["sn_mva", "vn_hv_kv", "vn_lv_kv", "vk_percent", "vkr_percent", "pfe_kw", "i0_percent", "shift_degree", "tap_side", "tap_neutral", "tap_min", "tap_max", "tap_step_percent", "tap_step_degree", "tap_phase_shifter"];
let trafo3w_std_properties = ["sn_hv_mva","sn_mv_mva","sn_lv_mva","vn_hv_kv", "vn_mv_kv","vn_lv_kv","vk_hv_percent", "vk_mv_percent","vk_lv_percent","vkr_hv_percent","vkr_mv_percent","vkr_lv_percent","pfe_kw","i0_percent","shift_mv_degree","shift_lv_degree","tap_side","tap_neutral","tap_min","tap_max","tap_step_percent"];

let line_properties = ["name","from_bus", "to_bus","length_km", "r0_ohm_per_km", "x0_ohm_per_km", "c0_nf_per_km","df","g_us_per_km", "g0_us_per_km","parallel","max_loading_percent","temperature_degree_celsius", "tdpf","wind_speed_m_per_s", "wind_angle_degree", "conductor_outer_diameter_m", "air_temperature_degree_celsius","reference_temperature_degree_celsius", "solar_radiation_w_per_sq_m", "solar_absorptivity", "emissivity", "r_theta_kelvin_per_mw", "mc_joule_per_m_k", "std_type"];

let ext_grid_properties = ["name", "bus", "vm_pu", "va_degree", "s_sc_max_mva", "s_sc_min_mva", "rx_max", "rx_min", "max_p_mw", "max_p_mw", "max_q_mvar", "min_q_mvar", "r0x0_max", "x0x_max", "slack_weight", "controllable"];

let bus_properties =  ["name","vn_kv","type","in_service", "max_vm_pu","min_vm_pu",]    
let load_features = ['name', 'p_mw', 'q_mvar','max_p_mw', 'min_p_mw', 'max_q_mvar', 'min_q_mvar', 'const_z_percent', 'const_i_percent', 'sn_mva', 'scaling', 'in_service', 'type', 'controllable'];
let sgen_features = ['name', 'p_mw', 'q_mvar', 'max_p_mw', 'min_p_mw', 'max_q_mvar', 'min_q_mvar', 'sn_mva', 'scaling', 'in_service', 'type', 'current_source', 'k', 'rx', 'generator_type', 'lrc_pu', 'max_ik_ka', 'kappa', 'controllable'];
let switch_features = ['name', 'element', 'et', 'type', 'closed', 'z_ohm', 'in_ka'];  

let trafo_properties = ["name", "hv_bus", "lv_bus", "vk0_percent", "vkr0_percent", "mag0_percent", "mag0_rx", "si0_hv_partial", "tap_pos", "in_service", "max_loading_percent", "parallel", "df", "tap_dependent_impedance", "vk_percent_characteristic", "vkr_percent_characteristic", "xn_ohm", "std_type"];

let NetworkObject = {
    'busList' : [],
    'lineList' : [],
    'trafoList' : [],
    'trafo3wList' : [],
    'ext_gridList' : [],

    'line_stdList' : [],
    'trafo_stdList' : [],
    'trafo3w_stdList' : [],
    
    'busStyles': [{  radius: 5,
            fillColor: "#d67900",
            color: "#4e2204",
            weight: 1,
            opacity: 1,
            fillOpacity: 1
        }
        ,
        {   radius: 3,
            fillColor: "#0065BD",
            color: "#012b8c",
            weight: 1,
            opacity: 1,
            fillOpacity: 1
        }],
    'lineStyles': [{ color: "#ff0000",
            weight: 2,
            opacity: 1
        }
        ,
        {   color: "#007deb",
            weight: 2,
            opacity: 1
        }],
    'ext_gridStyles': [{  radius: 15,
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
    'trafoStyles': [{color: "#ff0000",
            weight: 7,
            opacity: 1
        }
        ,
        {   color: "#42bd4a",
            weight: 5,
            opacity: 1
        }],
    'nonEditableStyles' : [{color: "#363636",
            fillColor: "#363636",
            weight: 2,
            radius: 3,
            opacity: 1,
            fillOpacity: 1
        }]     
}

let DemandObject = {
    "demand_electricity" : {},
    "demand_electricity_reactive" : {},
    "demand_mobility" : {},
    "demand_space_heat" : {},
    "demand_water_heat" : {},
}

let demand_electricity;
let demand_electricity_reactive;
let demand_mobility;
let demand_space_heat;
let demand_water_heat;

//generates GeoJSON files to pass to the python section of our code, gets called on button press
function GetPandapowerAndWriteGeoJSONNet() {  
    var layers = L.PM.Utils.findLayers(map);
    if(layers.length != 0) {
        var group = L.featureGroup();
        layers.forEach((layer)=>{
            group.addLayer(layer);
        });
        shapes = group.toGeoJSON();
    }

    //console.log('starting Fetch');  
    let fetchString = 'editableNetwork';
    let isEditableNetwork = true;
    document.getElementById("nav-item-networks").setAttribute('href', '/networks');

    if(window.location.pathname == '/networks') {
        fetchString = '/networks/editableNetwork';
        document.getElementById("nav-item-networks").setAttribute('href', '#scroll-to-top');

    }
    if(window.location.pathname == '/demand') {
        fetchString = '/demand/editableNetwork';
        isEditableNetwork = false;
    }    
    fetch(fetchString)
    .then(function (response) {
        return response.json();
    }).then(function (ppdata) {
        var layers = L.PM.Utils.findLayers(map);
        layers.forEach((layer) =>{
                layer.remove();
        });

        //console.log('Begin displaying net:');
        displayNet(ppdata, isEditableNetwork);

        populateLists('bus');

        if(window.location.pathname == '/networks' ) {
            extractStdTypes(ppdata);
            fillStdTypeList();

            populateLists('line');
            populateLists('trafo');
            populateLists('ext_grid');
    
            populateEditableNetworkEditor('bus', bus_properties, null, null, null);
            populateEditableNetworkEditor('bus', load_features, null, null, 'load');
            populateEditableNetworkEditor('bus', sgen_features, null, null, 'sgen');
            populateEditableNetworkEditor('line', line_properties, NetworkObject.line_stdList, line_std_properties, null);
            populateEditableNetworkEditor('trafo', trafo_properties, NetworkObject.trafo_stdList, trafo_std_properties, null);
            populateEditableNetworkEditor('ext_grid', ext_grid_properties, null, null, null);
            populateEditableNetworkEditor('line_std_types', line_std_properties, null, null, null);
            populateEditableNetworkEditor('trafo_std_types', trafo_std_properties, null, null, null);
            populateEditableNetworkEditor('trafo3w_std_types', trafo3w_std_properties, null, null, null);

            tabcontent = document.getElementsByClassName("feature-editor__buttons-tab__tablinks");
            for (i = 0; i < tabcontent.length; i++) {
                tabcontent[i].style.display = "inline-flex";
            }
        }

        if(window.location.pathname == '/demand') {
            document.getElementById('bus').style.display = 'inline-block';
            
            fetch('demand/demand_profiles')
            .then(function (response) {
                return response.json();
            }).then(function (demand_data) {
                DemandObject.demand_electricity = JSON.parse(demand_data['demand_electricity']);
                DemandObject.demand_electricity_reactive = JSON.parse(demand_data['demand_electricity_reactive']);
                DemandObject.demand_mobility = JSON.parse(demand_data['demand_mobility']);
                DemandObject.demand_space_heat = JSON.parse(demand_data['demand_space_heat']);
                DemandObject.demand_water_heat = JSON.parse(demand_data['demand_water_heat']);


                populateDemandEditor(DemandObject.demand_electricity, "demand_electricity", 0);
                populateDemandEditor(DemandObject.demand_electricity_reactive, "demand_electricity_reactive", 1);
                populateDemandEditor(DemandObject.demand_mobility, "demand_mobility", 2);
                populateDemandEditor(DemandObject.demand_space_heat, "demand_space_heat", 3);
                populateDemandEditor(DemandObject.demand_water_heat, "demand_water_heat", 4);

            });

        }
    });
}

function extractStdTypes(ppdata) {
    let input = ppdata['_object']['std_types'];
    NetworkObject.line_stdList= input['line'];
    NetworkObject.trafo_stdList = input['trafo'];
    NetworkObject.trafo3w_stdList = input['trafo3w'];
}

function fillStdTypeList() {
    let lists = [NetworkObject.line_stdList, NetworkObject.trafo_stdList, NetworkObject.trafo3w_stdList];

    let st_type_selects = document.getElementsByClassName('feature-editor__featurelist-tab__stdtype-feature-select');
    for (let i = 0; i < st_type_selects.length; i++) {
        for (idx in lists[i]) {
            var option = document.createElement("option");
            option.text = idx;
            option.value = idx;
            st_type_selects[i].add(option);
        }
    }
}

function fillStdTypeEditor(sel, listName) {
    let idx = sel.options[sel.selectedIndex].value;
    
    let selectedObject = null; 
    if(sel.id == 'line_std_typesSelect') {
        //console.log(debugIdx, busList[idx].feature.properties.index);
        selectedObject = NetworkObject.line_stdList[idx];
        document.getElementById('line_std_typesForm').style.display = 'inline-block';
        document.getElementById('trafo_std_typesForm').style.display = 'none';
        document.getElementById('trafo3w_std_typesForm').style.display = 'none';
    }
    if(sel.id == 'trafo_std_typesSelect') {
        //console.log(debugIdx, lineList[idx].feature.properties.index);
        selectedObject = NetworkObject.trafo_stdList[idx];
        document.getElementById('line_std_typesForm').style.display = 'none';
        document.getElementById('trafo_std_typesForm').style.display = 'inline-block';
        document.getElementById('trafo3w_std_typesForm').style.display = 'none';
    }
    if(sel.id == 'trafo3w_std_typesSelect') {
        //console.log(debugIdx, trafoList[idx].feature.properties.index);
        selectedObject = NetworkObject.trafo3w_stdList[idx];
        document.getElementById('line_std_typesForm').style.display = 'none';
        document.getElementById('trafo_std_typesForm').style.display = 'none';
        document.getElementById('trafo3w_std_typesForm').style.display = 'inline-block';
    }
    
    let editorcontent = document.getElementsByClassName('feature-editor__selected-feature-editor');
    for (i = 0; i < editorcontent.length; i++) {
        editorcontent[i].style.display = "none";
    }

    document.getElementById('std_typesEditor').style.display = 'inline-block';
    
    let editor_form = document.getElementById(listName + '_typesForm');
    let editor_elems = editor_form.children;
    for (let i = 0; i < editor_elems.length; i++) {
        if (editor_elems[i].nodeName == 'INPUT') {
            editor_elems[i].value = (selectedObject[editor_elems[i].name]);
        }
    }
}

function addGeoJSONtoMap(isLines, input_geoJSON, featureName, isEditableFeature) {
    let newGeoJson
    if (isLines) {
        newGeoJson = L.geoJSON(input_geoJSON, {
            snapIgnore:true,
            onEachFeature: function(feature, layer) {
                if(isEditableFeature) {
                    createPopup(feature, layer);
                }
                NetworkObject[featureName + 'List'].push(layer);
                if(isEditableFeature) {
                    layer.on('click', function(e) {
                        clickOnMarker(e.target, featureName, 0);
                    })
                }
            },
            style: (isEditableFeature) ? NetworkObject[featureName + 'Styles'][1] : NetworkObject.nonEditableStyles[0]
        }).addTo(map);
    }
    else {
        newGeoJson = L.geoJSON(input_geoJSON, {
            onEachFeature: function(feature, layer) {
                if(isEditableFeature) {
                    createPopup(feature, layer);
                }
                NetworkObject[featureName + 'List'].push(layer);
            },
            pointToLayer: function (feature, latlng) {
                var marker = L.circleMarker(latlng, (isEditableFeature) ? NetworkObject[featureName + 'Styles'][1] : NetworkObject.nonEditableStyles[0]);
                if(isEditableFeature) {
                    marker.on('click', function(e) {
                        clickOnMarker(e.target, featureName, 0);
                    });
                }else if(featureName == 'bus') {
                    if (Object.keys(feature.properties.load).length) {
                        //console.log(Object.keys(feature.properties.load).length);
                        marker.setStyle(NetworkObject.busStyles[1]);
                        marker.on('click', function(e) {
                            resetStyle(e.target, 'bus');
                        });
                    }
                }

                return marker;
            }
        }).addTo(map);
    }
    map.fitBounds(newGeoJson.getBounds());
}

function displayNet(ppdata, isEditableNetwork) {
    let line_geoJSON = createFeatures(true, ppdata, 'line', (isEditableNetwork) ? line_properties : null, null, null);
    addGeoJSONtoMap(true, line_geoJSON, 'line', isEditableNetwork);
    //console.log("added all lines");

    let ext_grid_geoJSON = createFeatures(false, ppdata, 'ext_grid', (isEditableNetwork) ? ext_grid_properties : null, null, null);
    addGeoJSONtoMap(false, ext_grid_geoJSON, 'ext_grid', isEditableNetwork);
    //console.log('added all external grids');

    let bus_geoJSON = createFeatures(false, ppdata, 'bus', bus_properties, ['load', 'sgen', 'switch'], [load_features, sgen_features, switch_features]);

    addGeoJSONtoMap(false, bus_geoJSON, 'bus', isEditableNetwork);

    //console.log('added all buses');

    let trafo_geoJSON = createFeatures(true, ppdata, 'trafo', (isEditableNetwork) ? trafo_properties : null, null, null);
    addGeoJSONtoMap(true, trafo_geoJSON, 'trafo', isEditableNetwork);
    //console.log('added all trafos');
}

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
        let temp_indices = [];

        input_geodata = ppdata['_object']['bus_geodata'];
        input_geoCoords = JSON.parse(input_geodata['_object'])['data'];
        input_geoIndices = JSON.parse(input_geodata['_object'])['index'];

        if(featureName == 'ext_grid') {
            idx[0] = input_columns.indexOf('bus', 0);
            for (entry in input_data) {
                 for (geo_entry in input_geoIndices) {
                     if (input_data[entry][idx[0]] == input_geoIndices[geo_entry]) {
                         temp.push(input_geoCoords[geo_entry]);
                         temp_indices.push(entry);
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
                        temp_indices.push(entry);

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
        input_geoIndices = temp_indices;
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
        let pointNameIndex = 0;
        if (input_indices.indexOf(pointIndex, 0) != -1) {
            pointNameIndex = input_indices.indexOf(pointIndex, 0)
        } else {
            pointNameIndex = pointIndex;
        }

        if(featureProperties != null) {
            currentFeatureProperties.index = pointIndex;
            for (property in featureProperties) {
                if(input_columns.indexOf(featureProperties[property], 0) == -1) {
                    currentFeatureProperties[featureProperties[property]] = null
                }
                else {
                    currentFeatureProperties[featureProperties[property]] = input_data[pointNameIndex][input_columns.indexOf(featureProperties[property], 0)];
                }
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

window.addEventListener("load", (event) => {
    //console.log(window.location.pathname);
    if(window.location.pathname == '/networks' || window.location.pathname == '/demand') {
        GetPandapowerAndWriteGeoJSONNet();
    }
  });