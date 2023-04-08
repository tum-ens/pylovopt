let featuresToDeleteList = [];

function addFeature(feature) {
    let style = NetworkObject[feature + 'Styles'][1];
    let type = '';
    if(feature == 'bus' || feature =='ext_grid') {
        type = 'Point'
        map.pm.enableDraw('CircleMarker', {
            snappable: (feature == 'ext_grid'), 
            continueDrawing: false,
            pathOptions: style,
          })
    }
    else {
        type = 'LineString';
        map.pm.enableDraw('Line', {
            snappable: true,
            snapDistance: 20,
            pathOptions: style,
          })
    }
}

function closeForm() {
    for (feature in featuresToDeleteList) {
        featuresToDeleteList[feature][0].setStyle(featuresToDeleteList[feature][0].defaultOptions);
    }
    featuresToDeleteList = [];
    document.getElementById("popupForm").style.display = "none";
  }

function prepareFeatureDelete(featureName, featureLists) {
    if(featureName == 'bus') {
        document.getElementById("popupForm").style.display = "block";
        let featureSelect = document.getElementById(featureName + 'Select');
        //console.log(featureSelect.options[featureSelect.selectedIndex].text);

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
        //console.log(NetworkObject[featureName + 'List'][featureSelect.selectedIndex]);
        map.removeLayer(NetworkObject[featureName + 'List'][featureSelect.selectedIndex]);
        NetworkObject[featureName + 'List'].splice(featureSelect.selectedIndex, 1);
        //console.log(NetworkObject[featureName + 'List'][featureSelect.selectedIndex]);
        featureSelect.remove(featureSelect.selectedIndex);
        document.getElementById(featureName + 'Editor').style.display = 'none';
    }

}

map.on('pm:create', (e) => {
    e.marker.remove();
    let featureName = '';
    let featureType = '';

    if(e.shape == 'Line') {
        featureType = 'LineString'

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

    featureProperties['index'] = featureList[featureList.length - 1].feature.properties['index'] + 1;
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
                //layer.features = feature;
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
    //option.value = featureSelect.options.length;
    featureSelect.add(option);

    let selectedObject = NetworkObject[featureName + 'List'][featureSelect.options.length - 1];
    console.log(selectedObject);
    clickOnMarker(selectedObject, featureName, 1);
  });