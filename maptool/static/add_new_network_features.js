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

map.on('pm:create', (e) => {
    console.log(e);
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

    // TODO: Add feature to GUI list
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
                console.log("Adding feature")
                createPopup(feature, layer);
                NetworkObject[featureName + 'List'].push(layer);
            },
            pointToLayer: function (feature, latlng) {
                var marker = L.circleMarker(latlng, NetworkObject[featureName + 'Styles'][1]);
                marker.on('click', function(e) {
                    clickOnMarker(e.target, featureName);
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
                    clickOnMarker(e.target, featureName);
                })
            },
            style: NetworkObject[featureName + 'Styles'][1]       
        }).addTo(map);
    }

    let featureSelect = document.getElementById(featureName + "Select");
    var option = document.createElement("option");
    option.text = featureToAdd.properties.index;
    option.value = featureSelect.options.length;
    featureSelect.add(option);

  });