var maptool_urbs_setup = function() {
    let UrbsPropertiesJSON = {};
    let clicked;

    function GetUrbsSetupProperties () {
        fetch('urbs/urbs_setup_properties')
            .then(function (response) {
                return response.json();
            }).then(function (urbs_setup_properties) { 
                UrbsPropertiesJSON = urbs_setup_properties;
            });
    }
    
    function SetupUrbsEditor() {    
        let fetchString = '/urbs/editableNetwork';
    
        fetch(fetchString)
        .then(function (response) {
            return response.json();
        }).then(function (ppdata) {
            
            var layers = L.PM.Utils.findLayers(map);
            layers.forEach((layer) =>{
                    layer.remove();
            });
    
            displayUrbsEditorNet(ppdata);
    
            populateUrbsEditorLoadBusLists('demand', 'busWithLoad');
            populateUrbsEditorLoadBusLists('buildings', 'busWithLoad');
            maptool_urbs_trans.populateTransmissionEditorList(UrbsPropertiesJSON);
            maptool_urbs_buildings.prepareBuildingsObject(UrbsPropertiesJSON);
            maptool_urbs_process.populateProcessEditorList('pro_prop', ['import, import_hp', 'feed_in', 'slack', 'Q', 'rooftop PV']);
            maptool_urbs_process.populateProcessEditorList('pro_com_prop', ['import, import_hp', 'feed_in', 'slack', 'Q', 'rooftop PV']);
            populateUrbsEditor('buildings', UrbsPropertiesJSON['_buildings']['from_user_input']);
            populateUrbsEditor('transmission_cable_data', UrbsPropertiesJSON['transmission']['cable_data']);
            populateUrbsEditor('transmission_trafo_data', UrbsPropertiesJSON['transmission']['trafo_data']);
            populateUrbsEditor('transmission_voltage_limits', UrbsPropertiesJSON['transmission']['voltage_limits']);
            populateUrbsEditor('pro_prop', UrbsPropertiesJSON['process']['pro_prop'])
            populateUrbsEditor('pro_com_prop', UrbsPropertiesJSON['process']['pro_com_prop'])

            
            maptool_urbs_demand.fetchDemandProfiles();

            tabcontent = document.getElementsByClassName("feature-editor__buttons-tab__tablinks");
            for (i = 0; i < tabcontent.length; i++) {
                tabcontent[i].style.display = "inline-flex";
            }
    
            document.getElementById('demand').style.display = 'inline-block';
            document.getElementById('demandSelect').selectedIndex = 0;
            
            for (i = 0; i < tabcontent.length; i++) {
                tabcontent[i].style.padding = "30px 15px";
            }
    
        });
    }
    
    function displayUrbsEditorNet(ppdata) {
        addGeoJSONtoUrbsEditorMap(true, ppdata['line'], 'line');
        addGeoJSONtoUrbsEditorMap(false, ppdata['ext_grid'], 'ext_grid');
        addGeoJSONtoUrbsEditorMap(false, ppdata['bus'], 'bus');
        addGeoJSONtoUrbsEditorMap(true, ppdata['trafo'], 'trafo');
    }
    
    function addGeoJSONtoUrbsEditorMap(isLines, input_geoJSON, featureName) {
        let newGeoJson
        if (isLines) {
            newGeoJson = L.geoJSON(input_geoJSON, {
                snapIgnore:true,
                style: maptool_network_gen.NetworkObject.nonEditableStyles[0]
            }).addTo(map);
        }
        else {
            newGeoJson = L.geoJSON(input_geoJSON, {
                onEachFeature: function(feature, layer) {
                    if (featureName == 'bus') {
                        if (Object.keys(feature.properties.load).length > 0) {
                            maptool_urbs_buildings.BuildingsObject['busWithLoadList'].push(layer);
                        }
                    }
                },
                pointToLayer: function (feature, latlng) {
                    var marker = L.circleMarker(latlng, maptool_network_gen.NetworkObject.nonEditableStyles[0]);
                    if(featureName == 'bus') {
                        if (Object.keys(feature.properties.load).length > 0) {
                            marker.setStyle(maptool_network_gen.NetworkObject.busStyles[1]);
                            marker.on('click', function(e) {
                                maptool_urbs_demand.fillSelectedFeatureDemandEditor(e.target);
                            });
                        }
                    }
                    return marker;
                }
            }).addTo(map);
        }
        map.fitBounds(newGeoJson.getBounds());
    }
    
    function populateUrbsEditorLoadBusLists(htmlListName, networkListName) {
        var x = document.getElementById(htmlListName + "Select");
        let networkList = maptool_urbs_buildings.BuildingsObject[networkListName + 'List'];
        networkList = networkList.sort(function (a, b) {
            return parseInt(a.feature.properties.index) - parseInt(b.feature.properties.index);
        })
        for (idx in networkList) {
            var option = document.createElement("option");
            option.text = networkList[idx].feature.properties.index;
            x.add(option);
        }
    }
    
    
    function populateUrbsEditor(feature, propertiesToAdd) {
        let form = document.getElementById(feature + 'Form');
        let formDiv = document.createElement('DIV');
        formDiv.classList.add('feature-editor__selected-feature-editor__div');
        for (property in propertiesToAdd) {
            let input = document.createElement("input");
            
            if(propertiesToAdd[property] == 'boolean') {
                input.type="checkbox";
            }
            else if(propertiesToAdd[property] == 'float' || propertiesToAdd[property] == 'int') {
                input.type="number";
            }
            else {
                input.type="text";
            }
    
            input.id = property;
            input.name = property;
    
            let label = document.createElement("label");
            label.htmlFor = property;
            label.innerHTML = property;
            formDiv.appendChild(input)
            formDiv.appendChild(label)
        }
        form.appendChild(formDiv)
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
        if(listName != 'processes') {
            if (document.getElementById(listName + 'Select').selectedIndex != -1) {
            
                if(listName == 'transmission') {
                    let currentList = document.getElementById(listName+ 'Select')
                    editor = document.getElementById(listName + '_' +  currentList.value + "Editor")
                }
                editor.style.display = "inline-block";
            }
        }
    }
    
    function resetLoadBusStyle(target) {
        let zoomLevel = 14;
        map.setView(target.getLatLng(), Math.max(map.getZoom(), zoomLevel));
    
        if(clicked) {
            let oldStyle = maptool_network_gen.NetworkObject['busStyles'];
            //makes sure the list that holds the previously selected feature deselects all options
            clicked.setStyle(oldStyle[1]);
        }
        target.setStyle(maptool_network_gen.NetworkObject['busStyles'][0]);
        clicked = target;
    
        let featureList = maptool_urbs_buildings.BuildingsObject['busWithLoadList'];
        let selectedList = document.getElementById("demandSelect");
        let newIndex = featureList.findIndex((entry) => entry === target);
        selectedList.selectedIndex = newIndex;
    }
    
    function fillSelectedEditor(sel, featureName) {
        let urbsSetupEditors = document.getElementsByClassName("feature-editor__selected-feature-editor");
        for (let i = 0; i < urbsSetupEditors.length; i++) {
            urbsSetupEditors[1].style.display='none';
        }
    
        if(featureName == 'demand') {
            maptool_urbs_demand.fillSelectedFeatureDemandEditor(maptool_urbs_buildings.BuildingsObject['busWithLoadList'][sel.selectedIndex])
            document.getElementById('demandEditor').style.display='inline-block';
        }
        if(featureName == 'buildings') {
            maptool_urbs_buildings.fillSelectedFeatureBuildingEditor(maptool_urbs_buildings.BuildingsObject['busWithLoadList'][sel.selectedIndex])
            document.getElementById('buildingsEditor').style.display='inline-block';
        }
        if(featureName == 'transmission') {
            trans_editor = sel.value
            document.getElementById('transmission_cable_dataEditor').style.display='none';
            document.getElementById('transmission_trafo_dataEditor').style.display='none';
            document.getElementById('transmission_voltage_limitsEditor').style.display='none';
    
            document.getElementById('transmission_' + trans_editor + 'Editor').style.display='inline-block';
        }
        if(featureName == 'pro_prop' || featureName == 'pro_com_prop') {
            document.getElementById(featureName + 'Editor').style.display='inline-block';
        }
    }
    
    window.addEventListener("load", (event) => {
        if(window.location.pathname == '/urbs') {
            GetUrbsSetupProperties();
            SetupUrbsEditor();
        }
      });

      return {
        openUrbsEditorList: openUrbsEditorList,
        resetLoadBusStyle: resetLoadBusStyle,
        fillSelectedEditor: fillSelectedEditor
      }
}();