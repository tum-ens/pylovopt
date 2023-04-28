function prepareBuildingsObject() {
    let propertiesToAdd = UrbsPropertiesJSON['_buildings']['from_user_input'];
    for (bus in BuildingsObject.busWithLoadList) {
        let coordinates = BuildingsObject.busWithLoadList[bus].feature.geometry.coordinates
        let name = BuildingsObject.busWithLoadList[bus].feature.properties.name
        let buildingJSON = {"name": name,"x": coordinates[0], "y": coordinates[1]};
        for (property in propertiesToAdd) {
            buildingJSON[property] = parseInt(bus)
        }
        BuildingsObject.buildingsPropertiesList.push(buildingJSON);
    }
}

function populateBuildingsEditor() {
    let form = document.getElementById('buildingsForm');
    let propertiesToAdd = UrbsPropertiesJSON['_buildings']['from_user_input'];
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

function fillSelectedFeatureBuildingEditor(target) {
    resetLoadBusStyle(target)


    let editorcontent = document.getElementsByClassName('feature-editor__selected-feature-editor');
    for (i = 0; i < editorcontent.length; i++) {
        editorcontent[i].style.display = "none";
    }

    document.getElementById('buildingsEditor').style.display = 'inline-block';

    let editor_form = document.getElementById('buildingsForm');
    let editor_divs = editor_form.children;
    
    let target_properties = UrbsPropertiesJSON['_buildings']['from_user_input']
    let selectedBuildingIndex = document.getElementById('buildingsSelect').selectedIndex;
    let selectedBuilding = BuildingsObject.buildingsPropertiesList[selectedBuildingIndex];

    for (let i = 0; i < editor_divs.length; i++) {
        let editor_elems = editor_form.children[i].children;
        console.log(editor_elems)

        for (let i = 0; i < editor_elems.length; i++) {
            if (editor_elems[i].nodeName == 'INPUT') {
                console.log(editor_elems[i].name);
                if(selectedBuilding[editor_elems[i].name] != null) {
                    console.log(selectedBuilding[editor_elems[i].name])
                    editor_elems[i].value = selectedBuilding[editor_elems[i].name];
                }
                else {
                    editor_elems[i].value = '';
                }
            }
        }
    }
}

function writeBackEditedBuildingFeatures() {

}