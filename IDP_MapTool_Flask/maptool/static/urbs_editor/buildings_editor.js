var maptool_urbs_buildings = function () {
    let BuildingsObject = {
        "busWithLoadList": [],
        "buildingsPropertiesList": []
    }
    
    function prepareBuildingsObject(UrbsPropertiesJSON) {
        console.log(UrbsPropertiesJSON)
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
    
    function fillSelectedFeatureBuildingEditor(target) {
        maptool_urbs_setup.resetLoadBusStyle(target)
    
    
        let editorcontent = document.getElementsByClassName('feature-editor__selected-feature-editor');
        for (i = 0; i < editorcontent.length; i++) {
            editorcontent[i].style.display = "none";
        }
    
        document.getElementById('buildingsEditor').style.display = 'inline-block';
    
        let editor_form = document.getElementById('buildingsForm');
        let editor_divs = editor_form.children;
        
        let selectedBuildingIndex = document.getElementById('buildingsSelect').selectedIndex;
        let selectedBuilding = BuildingsObject.buildingsPropertiesList[selectedBuildingIndex];
    
        for (let i = 0; i < editor_divs.length; i++) {
            let editor_elems = editor_form.children[i].children;
            for (let i = 0; i < editor_elems.length; i++) {
                if (editor_elems[i].nodeName == 'INPUT') {
                    if(selectedBuilding[editor_elems[i].name] != null) {
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

    return {
        BuildingsObject: BuildingsObject,
        prepareBuildingsObject: prepareBuildingsObject,
        fillSelectedFeatureBuildingEditor: fillSelectedFeatureBuildingEditor,
        writeBackEditedBuildingFeatures: writeBackEditedBuildingFeatures
    }
}();

