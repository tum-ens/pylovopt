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

    //gets called when one of the tablink buttons in the GUI gets pressed and opens the relevant feature list, while hiding all other GUI elements
    function openEditableNetworkList(e, listName) {
        tabcontent = document.getElementsByClassName("feature-editor__featurelist-tab");
        for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
        }

        editorcontent = document.getElementsByClassName('feature-editor__selected-feature-results');

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
        if(listName != 'std_types') {
            if (document.getElementById(listName + 'Select').selectedIndex != -1) {
                editor.style.display = "inline-block";
            }
        }
    }

    //When clicking on a map element or making a selection from a list, we highlight the relevant element, open the Editor window and fill its input fields with the relevant values
    function clickOnMarker(target, feature) {
        //resets previously selected markers
        if(target != null) {
            maptool_net_display.resetStyle(target, feature);
        }

        let selectedButton = document.getElementById(feature + "ListButton");
        selectedButton.click();

        let editorcontent = document.getElementsByClassName('feature-editor__selected-feature-results');
        for (i = 0; i < editorcontent.length; i++) {
            editorcontent[i].style.display = "none";
        }

        let targetIndex = document.getElementById(feature + 'Select').value;
        let targetName = "";
        if (feature == 'bus') {
            targetName = maptool_network_gen.NetworkObject[feature + 'List'][targetIndex].feature.properties.name;
        }
        if(feature == 'line') {
            target_idx = maptool_network_gen.NetworkObject[feature + 'List'][targetIndex].feature.properties.from_bus;
            targetName = maptool_network_gen.NetworkObject['busList'][target_idx].feature.properties.name;
        }
        console.log(targetName)
        getPlotOfFeature(feature, targetName);
        document.getElementById(feature + 'Editor').style.display = 'inline-block';
    }

    function getPlotOfFeature(feature, featureName) {

        data_json = {"type": feature,"name": featureName}

        fetch("http://127.0.0.1:5000/urbs_results/plots", {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'},
            body: JSON.stringify(data_json)
    }).then(function (response) {
        return response.json();
    }).then(function (plot_data) {
        for(entry in plot_data) {
            console.log(entry);
        }
    }).catch((err) => console.error(err));
    }
    
    return {
        openEditableNetworkList: openEditableNetworkList,
        clickOnMarker: clickOnMarker
    }
}();