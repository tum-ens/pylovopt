let featuresToDeleteList = [];

//switches leaflet map mode to draw and makes sure we place down the correct marker type
function addFeature(feature) {
    let style = NetworkObject[feature + 'Styles'][1];
    let type = '';
    if(feature == 'bus' || feature =='ext_grid') {
        type = 'Point'
        map.pm.enableDraw('CircleMarker', {
            snappable: true, 
            snapDistance: 20,
            requireSnapToFinish : (feature == 'ext_grid'),
            continueDrawing: false,
            pathOptions: style,
            snapIgnore: (feature == 'ext_grid'),

          })
    }
    else {
        type = 'LineString';
        map.pm.enableDraw('Line', {
            snappable: true,
            snapDistance: 20,
            requireSnapToFinish: true, 
            pathOptions: style,
            snapIgnore: true,
          })
    }
}

//closes deletion popup window and resets all highlighted features in the map view
function closeForm() {
    for (feature in featuresToDeleteList) {
        featuresToDeleteList[feature][0].setStyle(featuresToDeleteList[feature][0].defaultOptions);
    }
    featuresToDeleteList = [];
    document.getElementById("popupForm").style.display = "none";
  }

//TODO: This is awful. Change this
//if you try to delete a bus, tries to find all connected features (lines, ext_grids, trafos) and marks them as about to be deleted as well 
function prepareFeatureDelete(featureName, featureLists) {
    if(featureName == 'bus') {
        //opens the delete popup window that allows the user to back out of deleting the bus
        document.getElementById("popupForm").style.display = "block";
        let featureSelect = document.getElementById(featureName + 'Select');

        featuresToDeleteList.push([NetworkObject['busList'][featureSelect.selectedIndex], 'bus', featureSelect.selectedIndex]);
        for (featureType in featureLists) {
            for (feature in NetworkObject[featureLists[featureType] + 'List']) {
                //console.log(featureSelect.options[featureSelect.selectedIndex].text, NetworkObject[lists[featureType] + 'List'][feature].feature.properties.from_bus)
                if (featureSelect.options[featureSelect.selectedIndex].text ==  NetworkObject[featureLists[featureType] + 'List'][feature].feature.properties.from_bus) {
                    featuresToDeleteList.push( [NetworkObject[featureLists[featureType] + 'List'][feature], featureLists[featureType], feature]);
                }
                if (featureSelect.options[featureSelect.selectedIndex].text ==  NetworkObject[featureLists[featureType] + 'List'][feature].feature.properties.to_bus) {
                    featuresToDeleteList.push( [NetworkObject[featureLists[featureType] + 'List'][feature], featureLists[featureType], feature]);
                }
                if(featureSelect.options[featureSelect.selectedIndex].text ==  NetworkObject[featureLists[featureType] + 'List'][feature].feature.properties.bus) {
                    featuresToDeleteList.push( [NetworkObject[featureLists[featureType] + 'List'][feature], featureLists[featureType], feature]);
                }
                if(featureSelect.options[featureSelect.selectedIndex].text ==  NetworkObject[featureLists[featureType] + 'List'][feature].feature.properties.hv_bus) {
                    featuresToDeleteList.push( [NetworkObject[featureLists[featureType] + 'List'][feature], featureLists[featureType], feature]);
                }   
                if(featureSelect.options[featureSelect.selectedIndex].text ==  NetworkObject[featureLists[featureType] + 'List'][feature].feature.properties.lv_bus) {
                    featuresToDeleteList.push( [NetworkObject[featureLists[featureType] + 'List'][feature], featureLists[featureType], feature]);
                }
                
            }
        }
        //highlight all features that are about to be deleted
        for (feature in featuresToDeleteList) {
            featuresToDeleteList[feature][0].setStyle({fillColor: 'red', color: 'red'});
        }
    }
}

function deleteConnectedFeatures() {
    let lineCount = 0;
    let trafoCount = 0;
    let ext_gridCount = 0;
    for (feature in featuresToDeleteList) {
        let featureName = featuresToDeleteList[feature][1];
        let featureIndex = featuresToDeleteList[feature][2] - lineCount * (featureName == 'line') - trafoCount * (featureName == 'trafo') - lineCount * (ext_gridCount == 'ext_grid')
        let featureSelect = document.getElementById(featureName + 'Select');
        map.removeLayer(NetworkObject[featureName + 'List'][featureIndex]);
        NetworkObject[featureName + 'List'].splice(featureIndex, 1);
        featureSelect.remove(featureIndex);

        lineCount += (featureName == 'line');
        trafoCount += (featureName == 'trafo');
        ext_gridCount += (featureName == 'ext_grid');
    } 

    featuresToDeleteList = [];
    document.getElementById('busEditor').style.display = 'none';
    document.getElementById("popupForm").style.display = "none";
}

function deleteFeature(featureName) {
    let featureSelect = document.getElementById(featureName + 'Select');
    if (featureSelect.selectedIndex != -1) {
        map.removeLayer(NetworkObject[featureName + 'List'][featureSelect.selectedIndex]);
        NetworkObject[featureName + 'List'].splice(featureSelect.selectedIndex, 1);
        featureSelect.remove(featureSelect.selectedIndex);
        document.getElementById(featureName + 'Editor').style.display = 'none';
    }

}

let snapped = false;   
let snappedFeature;
let snappedFeatures = [];


map.on('pm:drawstart', ({ workingLayer }) => {
    workingLayer.on('pm:snap', (e) => {
        if (e.shape == 'Line' && e.layerInteractedWith.feature != undefined) {
            //console.log(e);
            snappedFeature = e.layerInteractedWith.feature.properties.name;
            snapped = true;
        }
        else {
            snappedFeature = e.layerInteractedWith._parentCopy.feature.properties.name
        }
    });
    
    workingLayer.on('pm:unsnap', (e) => {
        snapped = false;    
    });

    workingLayer.on('pm:vertexadded', (e) => {
        if(map.pm.Draw.Line.enabled() && e.layer.getLatLngs().length == 1) {
            if(!snapped) {
                map.pm.Draw.Line._removeLastVertex(); 
            }
            else {
                snappedFeatures.push(snappedFeature);
            }
        }
    });
  });

map.on('pm:create', (e) => {
    let featureName = '';
    let featureType = '';

    if(e.shape == 'Line') {
        featureType = 'LineString'
        snappedFeatures.push(snappedFeature);

        if ( e.marker.options.color == NetworkObject.lineStyles[1].color) {
            featureName = 'line';
        }
        else if ( e.marker.options.color == NetworkObject.trafoStyles[1].color) {
            featureName = 'trafo';
        }
    }
    else if (e.shape == 'CircleMarker') {
        featureType = 'Point'
        if ( e.marker.options.color == NetworkObject.busStyles[1].color) {
            featureName = 'bus';
        }
        else if ( e.marker.options.color == NetworkObject.ext_gridStyles[1].color) {
            featureName = 'ext_grid';
        }
    }

    let featureList = NetworkObject[featureName + 'List'];
    let featureProperties = {}
    for (property in featureList[featureList.length - 1].feature.properties) {
        featureProperties[property] = null;
    }  

    if (featureName == 'line') {
        featureProperties['from_bus'] = snappedFeatures[0];
        featureProperties['to_bus'] = snappedFeatures[1];

        let coords = e.marker.getLatLngs();
        let length = 0;
        for (let i = 0; i < coords.length - 1; i++) {
            length += coords[i].distanceTo(coords[i + 1]);
        }
        
        featureProperties['length_km'] = length/1000;
    }
    if (featureName == 'trafo') {
        featureProperties['hv_bus'] = snappedFeatures[0];
        featureProperties['lv_bus'] = snappedFeatures[1];

    }
    if(featureName == 'ext_grid') {
        featureProperties['bus'] = snappedFeature;
    }

    snappedFeatures = [];

    let featureCoords = [];

    if (featureType == 'Point') {
        featureCoords = [e.marker._latlng.lng, e.marker._latlng.lat];
    }
    else {
        for (point in e.marker._latlngs) {
            temp =  [e.marker._latlngs[point].lng, e.marker._latlngs[point].lat];
            featureCoords.push(temp);
        }
    }

    featureProperties['index'] = parseInt(featureList[featureList.length - 1].feature.properties['index']) + 1;
    let featureGeoJSON = {"type" : "FeatureCollection", "features": []};    
    let featureToAdd = {"type": "Feature", 
                        "geometry": {"coordinates": featureCoords, "type": featureType}, 
                        "properties": featureProperties
                        }; 
    featureGeoJSON.features.push(featureToAdd);

    if (featureType == 'Point') {
        L.geoJSON(featureGeoJSON, {
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

    else {
        L.geoJSON(featureGeoJSON, {
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

    let featureSelect = document.getElementById(featureName + "Select");
    var option = document.createElement("option");
    option.text = featureToAdd.properties.index;
    featureSelect.add(option);

    let selectedObject = NetworkObject[featureName + 'List'][featureSelect.options.length - 1];
    //console.log(selectedObject);
    clickOnMarker(selectedObject, featureName, 1);

    e.marker.remove();
  });