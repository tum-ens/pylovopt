//fills html element for a given list of network features
function populateLists(listName) {
    //console.log(listName);
    var x = document.getElementById(listName + "Select");
    let list = NetworkObject[listName + 'List'];
    list = list.sort(function (a, b) {
        return parseInt(a.feature.properties.index) - parseInt(b.feature.properties.index);
    })
    //x.size = (list.length > 24) ? 24 : list.length;
    for (idx in list) {
        var option = document.createElement("option");
        option.text = list[idx].feature.properties.index;
        option.value = idx;
        x.add(option);
    }
}

function populateEditor(listName, selectedProperties, std_typeList, std_type_properties) {
    let editor_form = document.getElementById(listName + 'Form');

    for (idx in selectedProperties) {
        let label = document.createElement("label");
        label.htmlFor = selectedProperties[idx];
        label.innerHTML = selectedProperties[idx];
        
        if(selectedProperties[idx] == 'std_type') {
            let form = document.createElement("select");
            let ctr = 0;
            for(type_idx in std_typeList) {
                let option = document.createElement("option");
                option.text = type_idx;
                option.value = ctr;
                form.add(option);
                ctr++;
            }
            editor_form.appendChild(form);
            editor_form.appendChild(label);
            for(prop_idx in std_type_properties) {
                let input = document.createElement("input");
                input.type="text";
                input.readOnly = true;
                input.id = std_type_properties[prop_idx];
                input.name = std_type_properties[prop_idx];
                editor_form.appendChild(input);

                let Prop_label = document.createElement("label");

                Prop_label.htmlFor = std_type_properties[prop_idx];
                Prop_label.innerHTML = std_type_properties[prop_idx];
                editor_form.appendChild(Prop_label);
            }
        }  
        else {
            let input = document.createElement("input");
            input.type="text";
            input.setAttribute('onchange', 'writeBackEditedFeature(this)');
            input.id = selectedProperties[idx];
            input.name = selectedProperties[idx];
            editor_form.appendChild(input);
            editor_form.appendChild(label);
        }
    }
}

function openList(e, listName) {
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
}

function fillSelectedFeatureEditor(sel, listName) {
    let idx = parseInt(sel.options[sel.selectedIndex].value);
    //let debugIdx = parseInt(sel.options[sel.selectedIndex].text);
    
    let selectedObject = NetworkObject[listName + 'List'][idx];

    clickOnMarker(selectedObject, listName);
}

function clickOnMarker(target, feature) {
    let zoomLevel = 14;
    if(feature == 'bus' || feature == 'ext_grid') {
        map.setView(target.getLatLng(), Math.max(map.getZoom(), zoomLevel));
    }
    else {
        map.setView(target.getLatLngs()[0], Math.max(map.getZoom(), zoomLevel));
    }

    if(clicked) {
        let oldStyle = NetworkObject[clicked[1] + 'Styles'];
        clicked[0].setStyle(oldStyle[1]);
    }
    target.setStyle(NetworkObject[feature + 'Styles'][0]);
    clicked = [target, feature];

    let featureList = NetworkObject[feature + 'List'];

    let selectedButton = document.getElementById(feature + "ListButton");
    selectedButton.click();

    let selectedList = document.getElementById(feature + "Select");
    let newIndex = featureList.findIndex((entry) => entry === target);
    selectedList.selectedIndex = newIndex;

    let editorcontent = document.getElementsByClassName('feature-editor__selected-feature-editor');
    for (i = 0; i < editorcontent.length; i++) {
        editorcontent[i].style.display = "none";
    }

    document.getElementById(feature + 'Editor').style.display = 'inline-block';

    let editor_form = document.getElementById(feature + 'Form');
    let editor_elems = editor_form.children;

    let selectedStdType;
    for (let i = 0; i < editor_elems.length; i++) {
        if (editor_elems[i].nodeName == 'INPUT') {
            if(target.feature.properties[editor_elems[i].name] != null) {
                editor_elems[i].value = target.feature.properties[editor_elems[i].name];
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
                for (idx in NetworkObject[feature + '_stdList'][selectedStdType]) {
                    //console.log(editor_elems[i+k+1].name, idx, line_stdList[selectedStdType][idx]);
                    editor_elems[i+k+1].value = NetworkObject[feature + '_stdList'][selectedStdType][idx];
                    k += 2;
                }
            i += k;
        }
    }
}

function writeBackEditedFeature(target) {
    let feature = target.parentElement.id.replace("Form", "");
    let idxInFeatureList = document.getElementById(feature + "Select").selectedIndex
    let featureName = target.id

    console.log(feature, idxInFeatureList, target.value);
    if(!feature.includes("std")) {
        NetworkObject[feature + "List"][idxInFeatureList].feature.properties[featureName] = target.value;
        console.log(NetworkObject[feature + "List"][idxInFeatureList].feature.properties[featureName]);
    }
    else {
        let selectedElement = document.getElementById(feature + "Select")[idxInFeatureList].value;
        feature = feature.replace("_types", "");
        console.log(selectedElement);
        NetworkObject[feature + "List"][selectedElement][featureName] = target.value;
    }
}


//Purely for debug, we will want to keep feature information within the markers themselves
function createPopup(feature, layer) {
    var popup = L.popup();
    popup.setContent(
        "Index: " + feature.properties.index + "<br>" 
        + "Name: " + feature.properties.name + "<br>" 
    );
    layer.bindPopup(popup);
}