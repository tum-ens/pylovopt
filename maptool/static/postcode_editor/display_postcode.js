let previousSelectedPreviewLayer;
let netList = [];
let res_building_geojson;
let oth_building_geojson;

function getPostalCodeArea(plz_type) {
    if (plz_type == 'plz-number') {
        let plz = document.getElementById("PLZ").value;
        fetch("http://127.0.0.1:5000/postcode", {
                    method: 'POST',
                    headers: {
                        'Content-type': 'application/json'},
                    body: JSON.stringify(plz)
            }).then(function (response) {
                return response.json();
            }).then(function (postcodeData) {
                let postcodeGeoJSON = L.geoJSON(postcodeData, {style:{ color: 'green'}}).addTo(map);
                map.fitBounds(postcodeGeoJSON.getBounds());
                console.log('added plz area');
                
                console.log('starting Postcode nets fetch');
                fetch('/postcode/nets')
                .then(function (response) {
                    return response.json();
                }).then(function (postcodeNets) {
                    for(let i = 0; i < postcodeNets.length; i++) {
                        displayPreviewNet(postcodeNets[i][0], postcodeNets[i][1], JSON.parse(postcodeNets[i][2]));
                    }
                    console.log('added all nets in plz area');
                    populateNetList('network', netList)
                });
            }).catch((err) => console.error(err));
    }
    if (plz_type == 'plz-area') {
        var layers = L.PM.Utils.findLayers(map);
        if(layers.length != 0) {
            var group = L.featureGroup();
            layers.forEach((layer)=>{
                group.addLayer(layer);
            });
            shapes = group.toGeoJSON();
            fetch("http://127.0.0.1:5000/postcode/area", {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'},
                body: JSON.stringify(shapes)
            }).then(function (response) {
                return(response.json());
            }).then(function (building_data) {
                console.log(group);
                group.remove();
                var layers = L.PM.Utils.findLayers(map);
                layers.forEach((layer) =>{
                        layer.remove();
                    });
                if(building_data.res_buildings.features != null) {
                    res_building_geojson = L.geoJSON(building_data.res_buildings, {
                        onEachFeature: function(feature, layer) {
                            onEachFeature (feature, layer);
                        }
                    }).addTo(map);
                }

                if(building_data.oth_buildings.features != null) {
                    oth_building_geojson = L.geoJSON(building_data.oth_buildings, {
                        onEachFeature: function(feature, layer) {
                            onEachFeature (feature, layer);
                        }
                    }).addTo(map);
                }

            }).catch((err) => console.error(err));
        }
    }
}

//we only display the lines of all networks for performance reasons, showing buses adds too many nodes
//Possible solution for adding buses might be looking into canvas renderers for leaflet
function displayPreviewNet(kcid, bcid, ppdata) {
    let line_geoJSON = createFeatures(true, ppdata, 'line', null, null, null);
    
    let linePreviewLayer = L.geoJSON(line_geoJSON, {
        style: NetworkObject.lineStyles[1], 
    }).addTo(map);

    netList.push([kcid, bcid, linePreviewLayer]);

    linePreviewLayer.on('click', styleWhenClick)
    linePreviewLayer.on('mouseover', styleWhenMouseOver)
    linePreviewLayer.on('mouseout', styleWhenMouseOut)
    
    //makes sure selection is possible both via list and via map overlay, activates Select Network button
    function styleWhenClick() {
        if(previousSelectedPreviewLayer) {
            previousSelectedPreviewLayer.eachLayer(function (layer) {
                previousSelectedPreviewLayer.resetStyle(layer)
            })
        }
        linePreviewLayer.setStyle({ color: 'red'})
        previousSelectedPreviewLayer = linePreviewLayer;

        let selectedNetwork = document.getElementById("networkSelect");
        let newIndex = netList.findIndex((entry) => entry[2] === linePreviewLayer);
        selectedNetwork.selectedIndex = newIndex;

        let selectNetworkButton = document.getElementById("selectNetworkButton");
        selectNetworkButton.disabled = false;
    }

    function styleWhenMouseOver(e) {
        if(linePreviewLayer != previousSelectedPreviewLayer) {
            linePreviewLayer.setStyle({ color: 'green', fillColor: 'green' })
        }
    }
    function styleWhenMouseOut(e) {
      //geoJsonLayer.setStyle({color:"gray"});
        if(linePreviewLayer != previousSelectedPreviewLayer) {
            linePreviewLayer.eachLayer(function (layer) {
                linePreviewLayer.resetStyle(layer)
            })
        }
    }
}

//fills the GUI list with all our layers
function populateNetList(listName, list) {
    let networkList = document.getElementsByClassName("list-selection");
    networkList[0].style.display = "inline-block";
    let x = document.getElementById(listName + "Select");

    x.size = (list.length > 24) ? 24 : list.length;
    for (idx in list) {
        var option = document.createElement("option");
        option.text = "Network " + idx;
        option.value = idx;
        x.add(option);
    }
}

//makes sure the selected network is highlighted on the map by manually triggering a click event for it
function highlightSelectedPreviewLayer(sel) {
    let idx = parseInt(sel.options[sel.selectedIndex].value);
    let selectedObject = netList[idx][2];
    selectedObject.fireEvent('click');
}


function sendBackSelectedNetworkKcidBcid() {
    let selectedNetwork = document.getElementById("networkSelect");
    let kcid_bcid = [netList[selectedNetwork.selectedIndex][0], netList[selectedNetwork.selectedIndex][1]];
    console.log(selectedNetwork.selectedIndex, kcid_bcid);

    fetch("http://127.0.0.1:5000/postcode/nets", {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'},
                body: JSON.stringify(kcid_bcid)
        }).then(function (response) {
            return response.json();
        }).catch((err) => console.error(err));
}



function highlightBuildingFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    layer.bringToFront();
}

function resetBuildingHighlight(e) {
    res_building_geojson.resetStyle(e.target);
}

function zoomToBuildingFeature(e) {
    map.fitBounds(e.target.getBounds());
}

function displayBuildingEditOptions(e) {
    zoomToBuildingFeature(e);
}

function onEachFeature(feature, layer) {
    createBuildingPopup(feature, layer);
    layer.on({
        mouseover: highlightBuildingFeature,
        mouseout: resetBuildingHighlight,
        click: displayBuildingEditOptions
    });
}

function createBuildingPopup(feature, layer) {
    var container = L.DomUtil.create('div');
    var button = L.DomUtil.create('button', 'button cancel', container);
    button.innerText = 'delete Building';
    button.onclick = function() {
        console.log(layer);
        map.removeLayer(layer);
    }

    var popup = L.popup();
    popup.setContent(
        button
    );
    layer.bindPopup(popup);
}