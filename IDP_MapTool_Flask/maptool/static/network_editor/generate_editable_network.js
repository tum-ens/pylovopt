//-----------------------------CRUCIAL JS TODOS-----------------------------//
// TODO: define, check for correct inputs for all features
// TODO: Send back JSON-file to create functioning pandapower data
// TODO: Add trafo3w features to network

//-----------------------------TALK TODOS-----------------------------//
// TODO: Create documentation

//-----------------------------OPTIONAL TODOS-----------------------------//
// TODO: Deselect marker when clicking elsewhere on the map?


//variable that saves last selected path and resets its style when it's deselected
let clicked;

let line_std_properties = ["r_ohm_per_km", "x_ohm_per_km", "max_i_ka", "c_nf_per_km", "q_mm2", "type", "alpha"];
let trafo_std_properties = ["sn_mva", "vn_hv_kv", "vn_lv_kv", "vk_percent", "vkr_percent", "pfe_kw", "i0_percent", "shift_degree", "tap_side", "tap_neutral", "tap_min", "tap_max", "tap_step_percent", "tap_step_degree", "tap_phase_shifter"];
let trafo3w_std_properties = ["sn_hv_mva","sn_mv_mva","sn_lv_mva","vn_hv_kv", "vn_mv_kv","vn_lv_kv","vk_hv_percent", "vk_mv_percent","vk_lv_percent","vkr_hv_percent","vkr_mv_percent","vkr_lv_percent","pfe_kw","i0_percent","shift_mv_degree","shift_lv_degree","tap_side","tap_neutral","tap_min","tap_max","tap_step_percent"];

let line_properties = ["name","from_bus", "to_bus","length_km", "r0_ohm_per_km", "x0_ohm_per_km", "c0_nf_per_km","df","g_us_per_km", "g0_us_per_km","parallel","max_loading_percent","temperature_degree_celsius", "tdpf","wind_speed_m_per_s", "wind_angle_degree", "conductor_outer_diameter_m", "air_temperature_degree_celsius","reference_temperature_degree_celsius", "solar_radiation_w_per_sq_m", "solar_absorptivity", "emissivity", "r_theta_kelvin_per_mw", "mc_joule_per_m_k", "std_type"];

let ext_grid_properties = ["name", "bus", "vm_pu", "va_degree", "s_sc_max_mva", "s_sc_min_mva", "rx_max", "rx_min", "max_p_mw", "max_p_mw", "max_q_mvar", "min_q_mvar", "r0x0_max", "x0x_max", "slack_weight", "controllable"];

let bus_properties =  ["name","vn_kv","type", "zone", "in_service", "max_vm_pu","min_vm_pu",]    
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
    document.getElementById("nav-item-networks").setAttribute('href', '/networks');

    if(window.location.pathname == '/networks') {
        fetchString = '/networks/editableNetwork';
        document.getElementById("nav-item-networks").setAttribute('href', '#scroll-to-top');
    }
  
    fetch(fetchString)
    .then(function (response) {
        return response.json();
    }).then(function (ppdata) {
        
        var layers = L.PM.Utils.findLayers(map);
        layers.forEach((layer) =>{
                layer.remove();
        });

        displayNetNew(ppdata);

        populateLists('bus');

        tabcontent = document.getElementsByClassName("feature-editor__buttons-tab__tablinks");
        for (i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "inline-flex";
        }
        
        extractStdTypesNew(JSON.parse(ppdata["std_types"]));
        fillStdTypeList();

        populateLists('line');
        populateLists('trafo');
        populateLists('ext_grid');

        populateEditableNetworkEditor('bus', bus_properties, null, null, null);
        populateEditableNetworkEditor('bus', load_features, null, null, 'load');
        populateEditableNetworkEditor('bus', sgen_features, null, null, 'sgen');
        populateEditableNetworkEditor('bus', switch_features, null, null, 'switch');
        populateEditableNetworkEditor('line', line_properties, NetworkObject.line_stdList, line_std_properties, null);
        populateEditableNetworkEditor('trafo', trafo_properties, NetworkObject.trafo_stdList, trafo_std_properties, null);
        populateEditableNetworkEditor('ext_grid', ext_grid_properties, null, null, null);
        populateEditableNetworkEditor('line_std_types', line_std_properties, null, null, null);
        populateEditableNetworkEditor('trafo_std_types', trafo_std_properties, null, null, null);
        populateEditableNetworkEditor('trafo3w_std_types', trafo3w_std_properties, null, null, null);
        
    });
}

function extractStdTypesNew(ppdata) {
    NetworkObject.line_stdList= ppdata['line'];
    NetworkObject.trafo_stdList = ppdata['trafo'];
    NetworkObject.trafo3w_stdList = ppdata['trafo3w'];
}

function displayNetNew(ppdata) {
    addGeoJSONtoMap(true, ppdata['line'], 'line');
    //console.log("added all lines");

    addGeoJSONtoMap(false, ppdata['ext_grid'], 'ext_grid');
    //console.log('added all external grids');

    addGeoJSONtoMap(false, ppdata['bus'], 'bus');
    //console.log('added all buses');

    addGeoJSONtoMap(true, ppdata['trafo'], 'trafo');
    //console.log('added all trafos');
}

function addGeoJSONtoMap(isLines, input_geoJSON, featureName) {
    let newGeoJson
    if (isLines) {
        newGeoJson = L.geoJSON(input_geoJSON, {
            snapIgnore:true,
            onEachFeature: function(feature, layer) {
                createPopup(feature, layer);
                NetworkObject[featureName + 'List'].push(layer);
                layer.on('click', function(e) {
                    clickOnMarker(e.target, featureName, 0);
                })
            },
            style: NetworkObject[featureName + 'Styles'][1]
        }).addTo(map);
    }
    else {
        newGeoJson = L.geoJSON(input_geoJSON, {
            onEachFeature: function(feature, layer) {
                createPopup(feature, layer);
                NetworkObject[featureName + 'List'].push(layer);
            },
            pointToLayer: function (feature, latlng) {
                var marker = L.circleMarker(latlng, NetworkObject[featureName + 'Styles'][1]);
                marker.on('click', function(e) {
                    clickOnMarker(e.target, featureName, 0);
                });
                return marker;
            }
        }).addTo(map);
    }
    map.fitBounds(newGeoJson.getBounds());
}

window.addEventListener("load", (event) => {
    if(window.location.pathname == '/networks') {
        GetPandapowerAndWriteGeoJSONNet();
    }
  });