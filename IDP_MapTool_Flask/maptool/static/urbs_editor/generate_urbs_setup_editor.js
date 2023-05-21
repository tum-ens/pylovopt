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

            maptool_urbs_demand.fetchDemandProfiles();
            maptool_urbs_commodity.fetchProfiles();
            maptool_urbs_process.fetchProcessProfiles();
            maptool_urbs_storage.fetchProfiles();
            maptool_urbs_supim.fetchSupimProfiles();
            maptool_urbs_timevareff.fetchFeatureProfiles();

    
            populateUrbsEditorLoadBusLists('demand', 'busWithLoad');
            populateUrbsEditorLoadBusLists('buildings', 'busWithLoad');
            populateUrbsEditorLoadBusLists('supim', 'busWithLoad');
            populateUrbsEditorLoadBusLists('timevareff', 'busWithLoad');

            maptool_urbs_trans.populateTransmissionEditorList(UrbsPropertiesJSON);
            maptool_urbs_buildings.prepareBuildingsObject(UrbsPropertiesJSON);
            //maptool_urbs_commodity.prepareCommodityObject(UrbsPropertiesJSON, ['electricity_import', 'electricity_hp_import', 'electricity_feed_in', 'space heat']);

            populateUrbsEditor('buildings', UrbsPropertiesJSON['_buildings']['from_user_input'], 'maptool_urbs_buildings.writeBackEditedBuildingFeatures(this)');
            populateUrbsEditor('transmission_cable_data', UrbsPropertiesJSON['transmission']['cable_data'], '');
            populateUrbsEditor('transmission_trafo_data', UrbsPropertiesJSON['transmission']['trafo_data'],'');
            populateUrbsEditor('transmission_voltage_limits', UrbsPropertiesJSON['transmission']['voltage_limits'],'');
            populateUrbsEditor('commodity', UrbsPropertiesJSON['commodity'],'maptool_urbs_commodity.writeBackCommodityFeatures(this)');
            populateUrbsEditor('global', UrbsPropertiesJSON['global'],'');
            populateUrbsEditor('pro_prop', UrbsPropertiesJSON['process']['pro_prop'],'maptool_urbs_process.writeBackProcessFeatures(this)');
            populateUrbsEditor('pro_com_prop', UrbsPropertiesJSON['process']['pro_com_prop'],'maptool_urbs_process.writeBackProcessFeatures(this)');
            populateEditableNetworkEditorSecondaryFeature('pro_prop', 'pro_com_prop')
            populateUrbsEditor('storage', UrbsPropertiesJSON['storage']['sto_prop'],'');

            tabcontent = document.getElementsByClassName("feature-editor__buttons-tab__tablinks");
            for (i = 0; i < tabcontent.length; i++) {
                tabcontent[i].style.display = "inline-flex";
            }
    
            for (i = 0; i < tabcontent.length; i++) {
                tabcontent[i].style.padding = "30px 15px";
            }

            document.getElementById('demand').style.display = 'inline-block';
            document.getElementById('demandSelect').selectedIndex = 0;
            document.getElementById('demandEditor').style.display = 'none';
            document.getElementById('supimEditor').style.display = 'none';
            document.getElementById('timevareffEditor').style.display = 'none';
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
                                maptool_urbs_buildings.fillSelectedFeatureBuildingEditor(e.target);
                                maptool_urbs_supim.fillSelectedFeatureSupimEditor(e.target);
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

    
    function populateUrbsEditor(feature, propertiesToAdd, writebackFunction) {
        let form = document.getElementById(feature + 'Form');
        let formDiv = document.createElement('DIV');
        formDiv.id = feature + 'FormDiv';
        formDiv.classList.add('feature-editor__selected-feature-editor__div');
        for (property in propertiesToAdd) {
            let input = document.createElement("input");
            input.setAttribute('onchange', writebackFunction);


            if(propertiesToAdd[property]['type'] == 'boolean') {
                input.type="checkbox";
            }
            else if(propertiesToAdd[property]['type'] == 'float' || propertiesToAdd[property]['type'] == 'int') {
                input.type="number";
            }
            else if(propertiesToAdd[property]['type'] == 'list') {
                input = document.createElement("select");
                input.classList.add('feature-editor__selected-feature-editor__stdtype-feature-select')
                input.setAttribute('onchange', writebackFunction);
                for (option in propertiesToAdd[property]['list_options']) {
                    let listOption = document.createElement("option");
                    listOption.text = propertiesToAdd[property]['list_options'][option];
                    listOption.value = propertiesToAdd[property]['list_options'][option];
                    input.add(listOption);
                }
            }
            else {
                input.type="text";
            }
    
            input.id = property;
            input.name = property;

            let label = document.createElement("label");
            label.htmlFor = property;
            label.innerHTML = property;
            if(propertiesToAdd[property]['type'] == 'boolean') {
                label.appendChild(input)
                label.classList.add('urbs-checkbox')
            }
            else {
                formDiv.appendChild(input)
            }
            formDiv.appendChild(label)
        }
        form.appendChild(formDiv)
    }

    function populateEditableNetworkEditorSecondaryFeature(primaryFeatureName, secondaryFeatureName) {
        let editor_form = document.getElementById(primaryFeatureName + 'Form');

        let formDiv = document.createElement('DIV');
        formDiv.id = secondaryFeatureName + 'FormDiv';
        formDiv.classList.add('feature-editor__selected-feature-editor__div');

        formDiv.style.display = 'block'
        let label = document.createElement("label");
        label.innerHTML = secondaryFeatureName.toUpperCase();
        label.classList.add('secondary-feature-label');

        formDiv.append(label);
        let featureSelect = document.createElement('SELECT');
        featureSelect.id = secondaryFeatureName + 'Select';
        featureSelect.setAttribute('onchange', 'maptool_urbs_setup.openSecondaryEditor(this, "' + secondaryFeatureName + '")')
        featureSelect.classList.add('feature-editor__featurelist-tab__feature-select');
        featureSelect.multiple = true;


        let featureList = maptool_network_gen.NetworkObject[ primaryFeatureName + 'List'];
        let maxNumberOfSecondaryFeatures = 0;

        for (idx in featureList) {
            let currentFeature = featureList[idx].feature.properties[secondaryFeatureName];
            if(Object.keys(currentFeature).length != 0) {
                if (maxNumberOfSecondaryFeatures < Object.keys(currentFeature).length) {
                    maxNumberOfSecondaryFeatures = Object.keys(currentFeature).length;
                }
            }
        }

        for (let i = 0; i < maxNumberOfSecondaryFeatures; i++) {
            let featureOption = document.createElement('OPTION');
            featureOption.text = i;
            featureOption.value = i;
            featureSelect.append(featureOption);
        }

        formDiv.append(featureSelect)
        editor_form.appendChild(formDiv);

        let featureCreateButton = document.createElement('BUTTON');
        featureCreateButton.type = 'button';
        featureCreateButton.classList.add('button');
        featureCreateButton.classList.add('feature-editor__selected-feature-editor__delete-button');
        featureCreateButton.innerHTML = 'Add ' + secondaryFeatureName.toUpperCase();
        featureCreateButton.setAttribute('onclick', 'maptool_urbs_process.openNewProcessForm(true)') 
        //'maptool_urbs_process.addSecondaryFeature("' + primaryFeatureName + '", "' + secondaryFeatureName + '")'
        editor_form.appendChild(featureCreateButton);
    }

    function openSecondaryEditor(sel, secondaryFeatureName) {
        document.getElementById(secondaryFeatureName + 'Editor').style.display='block';
        
        let key = document.getElementById('pro_propSelect').value;
        console.log(key, maptool_urbs_process.ProcessObject.pro_com_propList);
        let target_properties = maptool_urbs_process.ProcessObject.pro_com_propList[key][sel.value];
        let editor_form = document.getElementById(secondaryFeatureName + 'Form');
        let editor_elems = editor_form.children[0].children;

        for (let i = 0; i < editor_elems.length; i++) {
            if (editor_elems[i].nodeName == 'INPUT') {
                if(target_properties[editor_elems[i].name] != null) {
                    editor_elems[i].value = target_properties[editor_elems[i].name];
                }
                else {
                    editor_elems[i].value = '';
                }
            }
        }
    }
    
    //gets called when one of the tablink buttons in the GUI gets pressed and opens the relevant feature list, while hiding all other GUI elements
    function openUrbsEditorList(e, listName, hasEditor) {
        tabcontent = document.getElementsByClassName("feature-editor__featurelist-tab");
        for (i = 0; i < tabcontent.length; i++) {
          tabcontent[i].style.display = "none";
        }
    
        editorcontent = document.getElementsByClassName('feature-editor__selected-feature-editor');
    
        for (i = 0; i < editorcontent.length; i++) {
            editorcontent[i].style.display = "none";
        }

        let secondaryUrbsSetupEditors = document.getElementsByClassName("feature-editor__selected-feature-editor__secondary-editor");
        for (let i = 0; i < secondaryUrbsSetupEditors.length; i++) {
            secondaryUrbsSetupEditors[i].style.display='none';
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
        if(listName != 'processes' && listName != 'storage_conf' && hasEditor) {
            if (document.getElementById(listName + 'Select').selectedIndex != -1) {
            
                if(listName == 'transmission') {
                    let currentList = document.getElementById(listName+ 'Select')
                    editor = document.getElementById(listName + '_' +  currentList.value + "Editor")
                }
                editor.style.display = "inline-block";
            }
        }

        if(listName == 'process_conf') {
            maptool_urbs_process.hot.render();
        }
        if(listName == 'storage_conf') {
            maptool_urbs_storage.hot.render();
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
    
        highlightSelectedElementInList(target, "demandSelect");
        highlightSelectedElementInList(target, "buildingsSelect");
        highlightSelectedElementInList(target, "supimSelect");

    }

    function highlightSelectedElementInList(target, selectId) {
        let featureList = maptool_urbs_buildings.BuildingsObject['busWithLoadList'];
        let selectedList = document.getElementById(selectId);
        let newIndex = featureList.findIndex((entry) => entry === target);
        selectedList.selectedIndex = newIndex;
    }
    
    function fillSelectedEditor(sel, featureName) {
        let urbsSetupEditors = document.getElementsByClassName("feature-editor__selected-feature-editor");
        for (let i = 0; i < urbsSetupEditors.length; i++) {
            urbsSetupEditors[i].style.display='none';
        }

        let secondaryUrbsSetupEditors = document.getElementsByClassName("feature-editor__selected-feature-editor__secondary-editor");
        for (let i = 0; i < secondaryUrbsSetupEditors.length; i++) {
            secondaryUrbsSetupEditors[i].style.display='none';
        }

        if(featureName == 'demand') {
            maptool_urbs_demand.fillSelectedFeatureDemandEditor(maptool_urbs_buildings.BuildingsObject['busWithLoadList'][sel.selectedIndex]);
            document.getElementById('demandEditor').style.display='inline-block';
        }
        if(featureName == 'buildings') {
            maptool_urbs_buildings.fillSelectedFeatureBuildingEditor(maptool_urbs_buildings.BuildingsObject['busWithLoadList'][sel.selectedIndex]);
            document.getElementById('buildingsEditor').style.display='inline-block';
        }
        if(featureName == 'transmission') {
            trans_editor = sel.value
            document.getElementById('transmission_cable_dataEditor').style.display='none';
            document.getElementById('transmission_trafo_dataEditor').style.display='none';
            document.getElementById('transmission_voltage_limitsEditor').style.display='none';
    
            document.getElementById('transmission_' + trans_editor + 'Editor').style.display='inline-block';
        }
        if(featureName == 'global') {
            document.getElementById(featureName + 'Editor').style.display='inline-block';
        }
        if(featureName == 'pro_prop') {
            document.getElementById(featureName + 'Editor').style.display='inline-block';
            fillSelectedFeatureEditorFields(maptool_urbs_process.ProcessObject.pro_propList[sel.value], featureName);
            console.log(sel.value);
            maptool_urbs_process.fillSecondaryEditorList(maptool_urbs_process.ProcessObject.pro_com_propList[sel.value]);
        }
        if(featureName == 'commodity') {
            document.getElementById(featureName + 'Editor').style.display='inline-block';
            fillSelectedFeatureEditorFields(maptool_urbs_commodity.CommodityObject['commodityPropertiesList'][sel.value], featureName);
        }
        if(featureName == 'storage') {
            document.getElementById(featureName + 'Editor').style.display='inline-block';
            fillSelectedFeatureEditorFields(maptool_urbs_storage.StorageObject['storagePropertiesList'][sel.value], featureName);
        }
        if(featureName == 'supim') {
            maptool_urbs_supim.fillSelectedFeatureSupimEditor(maptool_urbs_buildings.BuildingsObject['busWithLoadList'][sel.selectedIndex]);
            document.getElementById('supimEditor').style.display='inline-block';
        }
        if(featureName == 'timevareff') {
            maptool_urbs_timevareff.fillSelectedFeatureTimevareffEditor(maptool_urbs_buildings.BuildingsObject['busWithLoadList'][sel.selectedIndex]);
            document.getElementById('timevareffEditor').style.display='inline-block';
            console.log("he")
        }
    }

    function fillSelectedFeatureEditorFields(target, featureName) {
        let editor_form = document.getElementById(featureName + 'Form');
        let editor_divs = editor_form.children;

        for (let i = 0; i < editor_divs.length; i++) {
            let editor_elems = editor_form.children[i].children;
            for (let i = 0; i < editor_elems.length; i++) {
                if (editor_elems[i].nodeName == 'INPUT' || editor_elems[i].nodeName == 'SELECT') {
                    if(target[editor_elems[i].name] != null) {
                        editor_elems[i].value = target[editor_elems[i].name];
                    }
                    else {
                        editor_elems[i].value = '';
                    }
                }
            }
        }
    }

    function writeBackEditedFeature() {

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
        fillSelectedEditor: fillSelectedEditor,
        openSecondaryEditor: openSecondaryEditor
      }
}();