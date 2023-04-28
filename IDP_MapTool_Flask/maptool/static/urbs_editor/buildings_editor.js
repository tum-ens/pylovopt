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

        input.id = propertiesToAdd;
        input.name = propertiesToAdd;

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
}