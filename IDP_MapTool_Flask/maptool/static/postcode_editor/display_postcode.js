let previousSelectedPreviewLayer;
let netList = [];
let res_building_geojson;
let oth_building_geojson;
let versions;


let res_style = {
    fillColor: "#0065BD",
    color: "#0065BD",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.5
}

let oth_style = {
    fillColor: "#E37222",
    color: "#E37222",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.7
}


function selectVersionOfPostalCodeNetwork() {
    let plz = document.getElementById("PLZ").value;
    fetch("http://127.0.0.1:5000/postcode", {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'},
                body: JSON.stringify(plz)
        }).then(function (response) {
            return response.json();
        }).then(function (versionData) {
            versions = versionData;
            document.getElementById("popupForm").style.display = "block";
            //console.log(versionData);

            let versionRadioButtonsDiv = document.getElementById("versionRadioButtons");
            while (versionRadioButtonsDiv.firstChild) {
                versionRadioButtonsDiv.removeChild(versionRadioButtonsDiv.lastChild);
            }
            
            for (version in versionData) {
                let versionRadioButtonDiv = document.createElement("div");
                versionRadioButtonDiv.classList.add("form_popup__version-select__radio-button");
                let versionRadioButton = document.createElement("INPUT");
                versionRadioButton.setAttribute("type", "radio");
                versionRadioButton.name = "versionRadioButton";
                versionRadioButton.id = versionData[version][0];
                versionRadioButton.value = versionData[version][0];
                versionRadioButtonDiv.append(versionRadioButton);

                let versionLabel = document.createElement("LABEL");
                versionLabel.htmlFor = versionData[version][0];
                versionLabel.innerHTML = versionData[version][0];
                versionRadioButtonDiv.append(versionLabel);    
                versionRadioButtonDiv.append(document.createElement("br"))
                versionRadioButtonsDiv.append(versionRadioButtonDiv);
            }

            let versionRadioButtonDiv = document.createElement("div");
            versionRadioButtonDiv.classList.add("form_popup__version-select__radio-button");
            let newVersionRadioButton = document.createElement("INPUT");
            newVersionRadioButton.setAttribute("type", "radio");
            newVersionRadioButton.name = "versionRadioButton";
            newVersionRadioButton.id = "newVersionRadioButton";
            newVersionRadioButton.value = "0.0";
            versionRadioButtonDiv.append(newVersionRadioButton);

            let newVersionLabel = document.createElement("LABEL");
            newVersionLabel.htmlFor = "newVersionRadioButton";
            newVersionLabel.innerHTML = "New Version";
            versionRadioButtonDiv.append(newVersionLabel);  

            let newVersionTextInput = document.createElement("INPUT");
            newVersionTextInput.setAttribute("type", "number");
            newVersionTextInput.name = "newVersionTextInput";
            newVersionTextInput.id = "newVersionTextInput";
            newVersionTextInput.placeholder = "new Version";
            versionRadioButtonsDiv.append(versionRadioButtonDiv);
            versionRadioButtonsDiv.append(newVersionTextInput);


        }).catch((err) => console.error(err));
}

function chooseVersionOfPlzNetwork() {

    let versionElement = document.querySelector('input[name="versionRadioButton"]:checked')
    if(versionElement) {
        let version = versionElement.value;
        console.log(versions)
        if(version == "0.0") {
            let newVersionInput = document.getElementById("newVersionTextInput");
            if (newVersionInput.value) {
                console.log(newVersionInput.value)
                for (idx in versions) {
                    if (versions[idx][0] == String(newVersionInput.value)) {
                        document.getElementById("newVersionTextInput").style.outline = "red 5px solid";
                        return
                    }
                }
                version = newVersionInput.value;
            }
            else {
                document.getElementById("newVersionTextInput").style.outline = "red 5px solid";
                return
            }
        }

        //console.log(version)
        fetch("http://127.0.0.1:5000/postcode/plz/version", {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'},
            body: JSON.stringify(version)
        }).then(function (response) {
            console.log(response)
        }).then(function () {
            getPostalCodeArea('plz-number');
            closeForm();
        }).catch((err) => console.error(err));
    } 
    else {
        alert("please select a version");
    }
}

function getPostalCodeArea(plz_type) {
    if (plz_type == 'plz-number') {
        let plz = document.getElementById("PLZ").value;
        fetch("http://127.0.0.1:5000/postcode/plz", {
                    method: 'POST',
                    headers: {
                        'Content-type': 'application/json'},
                    body: JSON.stringify(plz)
            }).then(function (response) {
                return response.json();
            }).then(function (postcodeData) {
                let postcodeGeoJSON = L.geoJSON(postcodeData, {style:{ color: '#003359', dashArray: '5'}}).addTo(map);
                map.fitBounds(postcodeGeoJSON.getBounds());
                //console.log('added plz area');
                
                console.log('starting Postcode nets fetch');
                fetch('/postcode/nets')
                .then(function (response) {
                    return response.json();
                }).then(function (postcodeNets) {
                    console.log(JSON.parse(postcodeNets[0][2])["line"])
                    for(let i = 0; i < postcodeNets.length; i++) {
                        displayPreviewNet(postcodeNets[i][0], postcodeNets[i][1], JSON.parse(postcodeNets[i][2])["line"]);
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
                //console.log(group);
                group.remove();
                var layers = L.PM.Utils.findLayers(map);
                layers.forEach((layer) =>{
                        layer.remove();
                    });
                if(building_data.res_buildings.features != null) {
                    res_building_geojson = L.geoJSON(building_data.res_buildings, {
                        style : res_style,
                        onEachFeature: function(feature, layer) {
                            feature.properties.type = 'res';
                            onEachFeature (feature, layer);
                        }
                    }).addTo(map);
                }
                if(building_data.oth_buildings.features != null) {
                    oth_building_geojson = L.geoJSON(building_data.oth_buildings, {
                        style : oth_style,
                        onEachFeature: function(feature, layer) {
                            feature.properties.type = 'oth'
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
function displayPreviewNet(kcid, bcid, line_geoJSON) {
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
        linePreviewLayer.setStyle({ color: '#E37222', weight: 3})
        previousSelectedPreviewLayer = linePreviewLayer;

        map.fitBounds(linePreviewLayer.getBounds());

        let selectedNetwork = document.getElementById("networkSelect");
        let newIndex = netList.findIndex((entry) => entry[2] === linePreviewLayer);
        selectedNetwork.selectedIndex = newIndex;

        let selectNetworkButton = document.getElementById("selectNetworkButton");
        selectNetworkButton.disabled = false;
    }

    function styleWhenMouseOver(e) {
        if(linePreviewLayer != previousSelectedPreviewLayer) {
            linePreviewLayer.setStyle({ color: '#005293', fillColor: '#005293' , weight: 3})
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
    let color = '#a14d12'

    if(e.target.feature.properties.type == 'res') {
        color = '#003359'
    }

    layer.setStyle({
        weight: 5,
        color: color,
        dashArray: '',
        fillOpacity: 0.7
    });

    layer.bringToFront();
}

function resetBuildingHighlight(e) {
    if(e.target.feature.properties.type == 'res') {
        res_building_geojson.resetStyle(e.target);
    }else {
        oth_building_geojson.resetStyle(e.target);
    }
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
        //console.log(layer);
        map.removeLayer(layer);
    }

    var popup = L.popup();
    popup.setContent(
        button
    );
    layer.bindPopup(popup);
}

function closeForm() {
    document.getElementById("popupForm").style.display = 'none';
}