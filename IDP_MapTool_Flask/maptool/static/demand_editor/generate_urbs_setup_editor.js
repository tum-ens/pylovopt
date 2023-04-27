let DemandObject = {
    "demand_electricity" : {},
    "demand_electricity_reactive" : {},
    "demand_mobility" : {},
    "demand_space_heat" : {},
    "demand_water_heat" : {},
    "bus_demands" : []
}


function SetupUrbsEditor() {  
    var layers = L.PM.Utils.findLayers(map);
    if(layers.length != 0) {
        var group = L.featureGroup();
        layers.forEach((layer)=>{
            group.addLayer(layer);
        });
        shapes = group.toGeoJSON();
    }

    //console.log('starting Fetch');  
    let fetchString = '/demand/editableNetwork';
    isEditableNetwork = false;

    fetch(fetchString)
    .then(function (response) {
        return response.json();
    }).then(function (ppdata) {
        
        var layers = L.PM.Utils.findLayers(map);
        layers.forEach((layer) =>{
                layer.remove();
        });

        displayUrbsEditorNet(ppdata);

        populateUrbsEditorLists('demand', 'bus');

        tabcontent = document.getElementsByClassName("feature-editor__buttons-tab__tablinks");
        for (i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "inline-flex";
        }

        document.getElementById('demand').style.display = 'inline-block';
        document.getElementById('demandSelect').selectedIndex = 0;
        
        fetch('demand/demand_profiles')
        .then(function (response) {
            return response.json();
        }).then(function (demand_data) {
            DemandObject.demand_electricity = JSON.parse(demand_data['demand_electricity']);
            DemandObject.demand_electricity_reactive = JSON.parse(demand_data['demand_electricity_reactive']);
            DemandObject.demand_mobility = JSON.parse(demand_data['demand_mobility']);
            DemandObject.demand_space_heat = JSON.parse(demand_data['demand_space_heat']);
            DemandObject.demand_water_heat = JSON.parse(demand_data['demand_water_heat']);
            
            let i = 0;
            for (demandTable in DemandObject) { 
                if(demandTable != 'bus_demands') {
                    delete DemandObject[demandTable]['t'];
                    populateDemandEditor(DemandObject[demandTable], demandTable, i);
                    i++;
                }
            }

            let listLength = NetworkObject['busList'].length;
            DemandObject.bus_demands = new Array(listLength);
            for (let i = 0; i < listLength; i++) {
                DemandObject.bus_demands[i] = new Array(5).fill('0'.repeat(Object.keys(DemandObject.demand_electricity).length));
            }
        })
        for (i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.padding = "30px 15px";
        }

    });
}

function displayUrbsEditorNet(ppdata) {
    addGeoJSONtoUrbsEditorMap(true, ppdata['line'], 'line');
    //console.log("added all lines");

    addGeoJSONtoUrbsEditorMap(false, ppdata['ext_grid'], 'ext_grid');
    //console.log('added all external grids');

    addGeoJSONtoUrbsEditorMap(false, ppdata['bus'], 'bus');
    //console.log('added all buses');

    addGeoJSONtoUrbsEditorMap(true, ppdata['trafo'], 'trafo');
    //console.log('added all trafos');
}

function addGeoJSONtoUrbsEditorMap(isLines, input_geoJSON, featureName) {
    let newGeoJson
    if (isLines) {
        newGeoJson = L.geoJSON(input_geoJSON, {
            snapIgnore:true,
            onEachFeature: function(feature, layer) {
                NetworkObject[featureName + 'List'].push(layer);
            },
            style: NetworkObject.nonEditableStyles[0]
        }).addTo(map);
    }
    else {
        newGeoJson = L.geoJSON(input_geoJSON, {
            onEachFeature: function(feature, layer) {
                if (featureName == 'bus') {
                    if (Object.keys(feature.properties.load).length > 0) {
                        NetworkObject[featureName + 'List'].push(layer);
                    }
                }
                else {
                    NetworkObject[featureName + 'List'].push(layer);
                }
            },
            pointToLayer: function (feature, latlng) {
                var marker = L.circleMarker(latlng, NetworkObject.nonEditableStyles[0]);
                if(featureName == 'bus') {
                    if (Object.keys(feature.properties.load).length > 0) {
                        marker.setStyle(NetworkObject.busStyles[1]);
                        marker.on('click', function(e) {
                            fillSelectedFeatureDemandEditor(e.target);
                        });
                    }
                }
                return marker;
            }
        }).addTo(map);
    }
    map.fitBounds(newGeoJson.getBounds());
}


function populateUrbsEditorLists(listName, networkListName) {
    var x = document.getElementById(listName + "Select");
    let networkList = NetworkObject[networkListName + 'List'];
    networkList = networkList.sort(function (a, b) {
        return parseInt(a.feature.properties.index) - parseInt(b.feature.properties.index);
    })
    for (idx in networkList) {
        var option = document.createElement("option");
        option.text = networkList[idx].feature.properties.index;
        x.add(option);
    }
}

//gets called when one of the tablink buttons in the GUI gets pressed and opens the relevant feature list, while hiding all other GUI elements
function openUrbsEditorList(e, listName) {
    tabcontent = document.getElementsByClassName("feature-editor__featurelist-tab");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }

    editorcontent = document.getElementsByClassName('feature-editor__selected-feature-editor');

    for (i = 0; i < editorcontent.length; i++) {
        editorcontent[i].style.display = "none";
    }

    tablinks = document.getElementsByClassName("feature-editor__buttons-tab__tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    document.getElementById(listName).style.display = "inline-block";
    e.currentTarget.className += " active";

    let editor = document.getElementById(listName + "Editor")
    //if a list element had been selected previously and the tab had been closed without another feature editor being opened elsewhere, we reopen the editor window of the 
    //currently selected feature
    if (document.getElementById(listName + 'Select').selectedIndex != -1) {
        editor.style.display = "inline-block";
    }
}

function resetLoadBusStyle(target) {
    let zoomLevel = 14;
    map.setView(target.getLatLng(), Math.max(map.getZoom(), zoomLevel));

    if(clicked) {
        let oldStyle = NetworkObject['busStyles'];
        //makes sure the list that holds the previously selected feature deselects all options
        clicked.setStyle(oldStyle[1]);
    }
    target.setStyle(NetworkObject['busStyles'][0]);
    clicked = target;

    let featureList = NetworkObject['busList'];
    let selectedList = document.getElementById("demandSelect");
    let newIndex = featureList.findIndex((entry) => entry === target);
    selectedList.selectedIndex = newIndex;
}

function fillSelectedEditor(sel, featureName) {
    document.getElementsByClassName("feature-editor__selected-feature-editor")[0].style.display='inline-block';
    if(featureName == 'demand') {
        fillSelectedFeatureDemandEditor(NetworkObject['busList'][sel.selectedIndex])
    }
}

window.addEventListener("load", (event) => {
    if(window.location.pathname == '/demand') {
        SetupUrbsEditor();
    }
  });