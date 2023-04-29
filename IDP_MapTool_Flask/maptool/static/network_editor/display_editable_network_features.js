/*
This file contains everything related to the network editor windows.
This includes filling the feature lists and generating the editor input fields, as well as making sure changed inputs are saved
*/

var maptool_net_display = function() {
    //variable that saves last selected path and resets its style when it's deselected
    let clicked;

    function fillStdTypeList() {
        let lists = [maptool_network_gen.NetworkObject.line_stdList, maptool_network_gen.NetworkObject.trafo_stdList, maptool_network_gen.NetworkObject.trafo3w_stdList];

        let st_type_selects = document.getElementsByClassName('feature-editor__featurelist-tab__stdtype-feature-select');
        for (let i = 0; i < st_type_selects.length; i++) {
            for (idx in lists[i]) {
                var option = document.createElement("option");
                option.text = idx;
                option.value = idx;
                st_type_selects[i].add(option);
            }
        }
    }

    function fillStdTypeEditor(sel, listName) {
        let idx = sel.options[sel.selectedIndex].value;
        
        let selectedObject = null; 
        document.getElementById('line_std_typesForm').style.display = (sel.id == 'line_std_typesSelect') ? 'inline-block' : 'none';
        document.getElementById('trafo_std_typesForm').style.display = (sel.id == 'trafo_std_typesSelect') ? 'inline-block' : 'none';
        document.getElementById('trafo3w_std_typesForm').style.display = (sel.id == 'trafo3w_std_typesSelect') ? 'inline-block' : 'none';

        selectedObject = maptool_network_gen.NetworkObject[listName + 'List'][idx];
    
        let editorcontent = document.getElementsByClassName('feature-editor__selected-feature-editor');
        for (i = 0; i < editorcontent.length; i++) {
            editorcontent[i].style.display = "none";
        }

        document.getElementById('std_typesEditor').style.display = 'inline-block';
        
        let editor_form = document.getElementById(listName + '_typesFormDiv');
        let editor_elems = editor_form.children;
        for (let i = 0; i < editor_elems.length; i++) {
            if (editor_elems[i].nodeName == 'INPUT') {
                editor_elems[i].value = (selectedObject[editor_elems[i].name]);
            }
        }
    }

    //only called once on network generation
    //fills html element for a given list of network features at intial editable network generation
    //the index property of a feature and the option index do not have to match
    function populateLists(listName) {
        var x = document.getElementById(listName + "Select");
        let list = maptool_network_gen.NetworkObject[listName + 'List'];
        list = list.sort(function (a, b) {
            return parseInt(a.feature.properties.index) - parseInt(b.feature.properties.index);
        })
        for (idx in list) {
            var option = document.createElement("option");
            option.text = list[idx].feature.properties.index;
            x.add(option);
        }
    }

    function insertAfter(referenceNode, newNode) {
        referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    }

    //only called once on network generation
    //The feature editor window template for all feature types gets filled at runtime
    //input fields and labels depend entirely on the properties defined in the displayNetwork function
    function populateEditableNetworkEditor(listName, selectedProperties, std_typeList, std_type_properties, secondaryFeatureName) {
        let editor_form = document.getElementById(listName + 'Form');
        let formDiv = document.createElement('DIV');
        let formDivId = listName + 'FormDiv';
        formDiv.classList.add('feature-editor__selected-feature-editor__div');

        for (idx in selectedProperties) {
            let label = document.createElement("label");
            label.htmlFor = selectedProperties[idx];
            label.innerHTML = selectedProperties[idx];
            
            if(selectedProperties[idx] == 'std_type') {
                let form = document.createElement("select");
                form.id = 'std_type'
                form.classList.add('feature-editor__selected-feature-editor__stdtype-feature-select')
                form.setAttribute('onchange', 'maptool_net_display.writeBackEditedNetworkFeature(this, "' + listName + '_std_typesFormDiv")');
                let ctr = 0;
                for(type_idx in std_typeList) {
                    let option = document.createElement("option");
                    option.text = type_idx;
                    option.value = ctr;
                    form.add(option);
                    ctr++;
                }
                formDiv.appendChild(form);
                formDiv.appendChild(label);
                for(prop_idx in std_type_properties) {
                    let input = document.createElement("input");
                    input.type="text";
                    input.readOnly = true;
                    input.id = std_type_properties[prop_idx];
                    input.name = std_type_properties[prop_idx];
                    formDiv.appendChild(input);

                    let Prop_label = document.createElement("label");

                    Prop_label.htmlFor = std_type_properties[prop_idx];
                    Prop_label.innerHTML = std_type_properties[prop_idx];
                    formDiv.appendChild(Prop_label);
                }
            }  
            else {
                let input = document.createElement("input");
                input.type="text";
                input.setAttribute('onchange', 'maptool_net_display.writeBackEditedNetworkFeature(this, "' + formDivId + '")');
                input.id = selectedProperties[idx];
                input.name = selectedProperties[idx];
                formDiv.appendChild(input);
                formDiv.appendChild(label);
            }
        }
        
        editor_form.appendChild(formDiv);

        if (secondaryFeatureName != null) {
            formDivId = secondaryFeatureName + 'FormDiv';
            formDiv.style.display = 'block'    
            let label = document.createElement("label");
            label.innerHTML = secondaryFeatureName.toUpperCase();
            label.classList.add('secondary-feature-label');
            formDiv.insertBefore(label, formDiv.firstChild);

            let addFeatureButton = document.createElement('BUTTON');
            addFeatureButton.innerHTML = 'Create ' + secondaryFeatureName;
            addFeatureButton.type = 'button';
            addFeatureButton.id = secondaryFeatureName + 'AddButton';
            addFeatureButton.classList.add('button', 'feature-editor__selected-feature-editor__delete-button');
            addFeatureButton.setAttribute('onclick', "maptool_net_display.addSecondaryFeature('" + listName + "', '" + secondaryFeatureName + "')");
            insertAfter(formDiv, addFeatureButton)
        }

        formDiv.id = formDivId;
    }

    function addSecondaryFeature(primaryFeatureName, secondaryFeatureName) {
        let idxInFeatureList = document.getElementById(primaryFeatureName + "Select").selectedIndex;
        let primaryFeatureIndex = maptool_network_gen.NetworkObject[primaryFeatureName + "List"][idxInFeatureList].feature.properties.index;
        console.log(maptool_network_gen.NetworkObject[primaryFeatureName + "List"][idxInFeatureList].feature.properties);
        maptool_network_gen.NetworkObject[primaryFeatureName + "List"][idxInFeatureList].feature.properties[secondaryFeatureName].name = '' + secondaryFeatureName + ' ' + primaryFeatureIndex;
        document.getElementById(secondaryFeatureName + 'FormDiv').style.display = 'block';
        document.getElementById(secondaryFeatureName + 'AddButton').style.display = 'none';
    }

    //gets called when one of the tablink buttons in the GUI gets pressed and opens the relevant feature list, while hiding all other GUI elements
    function openEditableNetworkList(e, listName) {
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
        if(listName != 'std_types') {
            if (document.getElementById(listName + 'Select').selectedIndex != -1) {
                editor.style.display = "inline-block";
            }
        }
    }

    //writes values of the currently selected feature into the input fields of the editor window
    function fillSelectedEditableNetworkFeatureEditor(sel, listName) {
        let idx = parseInt(sel.selectedIndex);    
        let selectedObject = maptool_network_gen.NetworkObject[listName + 'List'][idx];
        
        clickOnMarker(selectedObject, listName, 0);
    }

    //resets the styling of the previously selected feature and sets the new styling of the now selected feature
    function resetStyle(target, feature) {
        let zoomLevel = 14;
        if(feature == 'bus' || feature == 'ext_grid') {
            map.setView(target.getLatLng(), Math.max(map.getZoom(), zoomLevel));
        }
        else {
            map.setView(target.getLatLngs()[0], Math.max(map.getZoom(), zoomLevel));
        }

        if(clicked) {
            let oldStyle = maptool_network_gen.NetworkObject[clicked[1] + 'Styles'];
            //makes sure the list that holds the previously selected feature deselects all options
            if(clicked[1] != feature) {
                document.getElementById(clicked[1] + 'Select').value = "";
            }
            clicked[0].setStyle(oldStyle[1]);
        }
        target.setStyle(maptool_network_gen.NetworkObject[feature + 'Styles'][0]);
        clicked = [target, feature];

        let featureList = maptool_network_gen.NetworkObject[feature + 'List'];
        let selectedList = document.getElementById(feature + "Select");
        let newIndex = featureList.findIndex((entry) => entry === target);
        selectedList.selectedIndex = newIndex;
    }

    //When clicking on a map element or making a selection from a list, we highlight the relevant element, open the Editor window and fill its input fields with the relevant values
    function clickOnMarker(target, feature, drawModeOverride) {
        if((!map.pm.globalDrawModeEnabled()) || drawModeOverride) {
            //resets previously selected markers
            resetStyle(target, feature);

            let selectedButton = document.getElementById(feature + "ListButton");
            selectedButton.click();

            let editorcontent = document.getElementsByClassName('feature-editor__selected-feature-editor');
            for (i = 0; i < editorcontent.length; i++) {
                editorcontent[i].style.display = "none";
            }

            document.getElementById(feature + 'Editor').style.display = 'inline-block';

            let editor_form = document.getElementById(feature + 'Form');
            let editor_divs = editor_form.children;

            for (let i = 0; i < editor_divs.length; i++) {
                let target_properties = target.feature.properties
                
                //At the moment we know that only busses have more than one div and we know that load is the second, sgen the third div 
                if(feature == 'bus') {
                    if (i == 1) {
                        target_properties = target.feature.properties.load;
                        if(Object.keys(target_properties).length === 0) {
                            document.getElementById('loadFormDiv').style.display = 'none';
                            document.getElementById('loadAddButton').style.display = 'inline-block';
                        }
                        else {
                            document.getElementById('loadFormDiv').style.display = 'block';
                            document.getElementById('loadAddButton').style.display = 'none';
                        }
                    }
                    if (i == 3) {
                        target_properties = target.feature.properties.sgen;
                        if(Object.keys(target_properties).length === 0) {
                            document.getElementById('sgenFormDiv').style.display = 'none';
                            document.getElementById('sgenAddButton').style.display = 'inline-block';
                        }
                        else {
                            document.getElementById('sgenFormDiv').style.display = 'block';
                            document.getElementById('sgenAddButton').style.display = 'none';
                        }
                    }
                    if (i == 5) {
                        target_properties = target.feature.properties.switch;
                        if(Object.keys(target_properties).length === 0) {
                            document.getElementById('switchFormDiv').style.display = 'none';
                            document.getElementById('switchAddButton').style.display = 'inline-block';
                        }
                        else {
                            document.getElementById('switchFormDiv').style.display = 'block';
                            document.getElementById('switchAddButton').style.display = 'none';
                        }
                    }
                }

                let editor_elems = editor_form.children[i].children;

                //features can have a std_type input and other input fields related to that std_type. Std_type properties should only be editable via the std_type list
                //for all features that correspond to the std_type, the properties are still added as read-only, while std_types are selectable from a dropdown menu
                let selectedStdType;
                for (let i = 0; i < editor_elems.length; i++) {
                    if (editor_elems[i].nodeName == 'INPUT') {
                        if(target_properties[editor_elems[i].name] != null) {
                            editor_elems[i].value = target_properties[editor_elems[i].name];
                        }
                        else {
                            editor_elems[i].value = '';
                        }
                    }
                    if (editor_elems[i].nodeName == 'SELECT') {
                        selectedStdType = target.feature.properties['std_type']

                        for (let j = 0; j < editor_elems[i].options.length; j++) {
                            if (editor_elems[i].options[j].text == selectedStdType) {
                                editor_elems[i].selectedIndex = j;
                                break;
                            }
                        }
                        let k = 1;
                            for (idx in maptool_network_gen.NetworkObject[feature + '_stdList'][selectedStdType]) {
                                if(feature == 'trafo') {
                                    //console.log(idx, editor_elems[i+k+1].name);
                                }
                                if(maptool_network_gen.NetworkObject[feature + '_stdList'][selectedStdType][editor_elems[i+k+1].name] != undefined) {
                                    editor_elems[i+k+1].value = maptool_network_gen.NetworkObject[feature + '_stdList'][selectedStdType][editor_elems[i+k+1].name];
                                }
                                k += 2; // + 2 because we need to skip the label elements
                            }
                        i += k;
                    }
                }
            }
        }
    }

    //onchange function for editor view. If a field is changed, its new value is written back to the relevant object
    function writeBackEditedNetworkFeature(target, targetDiv) {
        let feature = target.parentElement.id.replace("FormDiv", "");
        let secondary_feature = '';
        if(feature == 'load' || feature == 'sgen' || feature == 'switch') {
            secondary_feature = feature;
            feature = 'bus';
        }
        let idxInFeatureList = document.getElementById(feature + "Select").selectedIndex
        let featureName = target.id

        if(!feature.includes("std")) {
            if (target.nodeName == 'SELECT') {
                //console.log(target.options[target.selectedIndex].text, featureName)
                maptool_network_gen.NetworkObject[feature + "List"][idxInFeatureList].feature.properties[featureName] = target.options[target.selectedIndex].text
                updateStdTypeFeaturesInEditor(target)
            }
            else if(secondary_feature == '') {
                maptool_network_gen.NetworkObject[feature + "List"][idxInFeatureList].feature.properties[featureName] = target.value;
                //console.log(maptool_network_gen.NetworkObject[feature + "List"][idxInFeatureList].feature.properties[featureName]);
            }
            else if (secondary_feature != '') {
                maptool_network_gen.NetworkObject[feature + "List"][idxInFeatureList].feature.properties[secondary_feature][featureName] = target.value;
                //console.log(maptool_network_gen.NetworkObject[feature + "List"][idxInFeatureList].feature.properties.load[featureName]);
            }
        }
        else {
            let selectedElement = document.getElementById(feature + "Select")[idxInFeatureList].value;
            feature = feature.replace("_types", "");
            maptool_network_gen.NetworkObject[feature + "List"][selectedElement][featureName] = target.value;
        }
    }

    function updateStdTypeFeaturesInEditor(target) {

    }

    var acc = document.getElementsByClassName("accordion");
    var i;

    for (i = 0; i < acc.length; i++) {
    acc[i].addEventListener("click", function() {
        /* Toggle between adding and removing the "active" class,
        to highlight the button that controls the panel */
        this.classList.toggle("active");
        /* Toggle between hiding and showing the active panel */
        var panel = this.nextElementSibling;
        if (panel.style.display === "block") {
        panel.style.display = "none";
        } else {
        panel.style.display = "block";
        }
    });
    }

    //Purely for debug atm, we will want to keep feature information within the markers themselves
    //might be worth considering to display the editor window via the popup (visually too messy?)
    function createPopup(feature, layer) {
        var popup = L.popup();
        popup.setContent(
            "Index: " + feature.properties.index + "<br>" 
            + "Name: " + feature.properties.name + "<br>" 
        );
        layer.bindPopup(popup);
    }

    return {
        fillStdTypeList: fillStdTypeList,
        fillStdTypeEditor: fillStdTypeEditor,
        populateLists: populateLists,
        populateEditableNetworkEditor: populateEditableNetworkEditor,
        openEditableNetworkList: openEditableNetworkList,
        fillSelectedEditableNetworkFeatureEditor: fillSelectedEditableNetworkFeatureEditor,
        clickOnMarker: clickOnMarker,
        writeBackEditedNetworkFeature: writeBackEditedNetworkFeature,
        createPopup: createPopup,
        addSecondaryFeature: addSecondaryFeature,
    }

}();