var maptool_urbs_res_setup = function (){
    function SetupUrbsResultEditor() {    
        let fetchString = '/urbs_results/editableNetwork';
        fetch(fetchString)
        .then(function (response) {
            return response.json();
        }).then(function (ppdata) {
            console.log(ppdata)
            //create leaflet overlay of the network
            displayNetNew(ppdata);

            tabcontent = document.getElementsByClassName("feature-editor__buttons-tab__tablinks");
            for (i = 0; i < tabcontent.length; i++) {
                tabcontent[i].style.display = "inline-flex";
            }
            
            maptool_net_display.populateLists('bus');
            maptool_net_display.populateLists('line');
            maptool_net_display.populateLists('trafo');
            maptool_net_display.populateLists('ext_grid');
        });
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

    window.addEventListener("load", (event) => {

        if(window.location.pathname == '/urbs_results') {
            SetupUrbsResultEditor();
        }
      });

      function addGeoJSONtoMap(isLines, input_geoJSON, featureName) {
        let newGeoJson
        if (isLines) {
            newGeoJson = L.geoJSON(input_geoJSON, {
                snapIgnore:true,
                onEachFeature: function(feature, layer) {
                    maptool_net_display.createPopup(feature, layer);
                    maptool_network_gen.NetworkObject[featureName + 'List'].push(layer);
                    layer.on('click', function(e) {
                        clickOnMarker(e.target, featureName);
                    })
                },
                style: maptool_network_gen.NetworkObject[featureName + 'Styles'][1]
            }).addTo(map);
        }
        else {
            newGeoJson = L.geoJSON(input_geoJSON, {
                onEachFeature: function(feature, layer) {
                    maptool_net_display.createPopup(feature, layer);
                    maptool_network_gen.NetworkObject[featureName + 'List'].push(layer);
                },
                pointToLayer: function (feature, latlng) {
                    var marker = L.circleMarker(latlng, maptool_network_gen.NetworkObject[featureName + 'Styles'][1]);
                    marker.on('click', function(e) {
                        clickOnMarker(e.target, featureName);
                    });
                    return marker;
                }
            }).addTo(map);
        }
        map.fitBounds(newGeoJson.getBounds());
    }

        //When clicking on a map element or making a selection from a list, we highlight the relevant element, open the Editor window and fill its input fields with the relevant values
        function clickOnMarker(target, feature) {
            //resets previously selected markers
            maptool_net_display.resetStyle(target, feature);

            let selectedButton = document.getElementById(feature + "ListButton");
            selectedButton.click();

        }
    

    return {

    }
}();