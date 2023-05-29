var maptool_urbs_trans = function() {

    let TransmissionObject = {
        cable_dataList: {},
        trafo_dataList: {}
    }

    //TODO: Allow adding additional cables, trafo data
    /**
     * @param {JSON Object} TransmissionPropertiesJSON 
     * @param {string}      listName
     * 
     * prefills the TransmissionObject
     */
    //TODO: turn list_options into function parameter, find out how kont, ront are defined and pass as parameter for option generation
    function prepareTransmissionObjectList(TransmissionPropertiesJSON, listName) {
        TransmissionPropertiesJSON[listName].id.list_options.forEach(featureName => {
            let data_dict = {};
            for (feature in TransmissionPropertiesJSON[listName]) {
                if (feature != 'id') {
                    data_dict[feature] = TransmissionPropertiesJSON[listName][feature].default_val;
                }
            }
            TransmissionObject[listName + 'List'][featureName] = data_dict;
        })
    }

    /**
     * @param {JSON Object} UrbsPropertiesJSON
     * Creates list elements for the different transmission templates
     */
    function populateTransmissionEditorList(UrbsPropertiesJSON) {
        let transmissionEditorList = document.getElementById("transmissionSelect");
    
        let transmissionEditors = UrbsPropertiesJSON['transmission'];
        for (category in transmissionEditors) {
            var option = document.createElement("option");
            option.text = category;
            transmissionEditorList.add(option);
        }
    }

    /**
     * @param {html element} target     reference to the changed html input element
     * 
     * Saves changed inputs in the corresponding feature object within the TransmissionObject and, if the changed input was
     * the id select, calls a function that adjusts all other fields to match the id
     */
    function writeBackTransmissionFeatures(target) {
        let feature = document.getElementById('transmissionSelect').value;
        if (target.nodeName == 'SELECT') {
            fillInputFieldsOfSelectedID(target.value, feature);
        }
        else if (target.nodeName == 'INPUT') {
            let featureEditor = document.getElementById('transmission_' + feature + 'FormDiv');
            let featureSelect = featureEditor.querySelector('#id');
            TransmissionObject[feature + 'List'][featureSelect.value][target.id] = target.value;            
        }
    }

    /**
     * @param {string} id      key for TransmissionObject list element that contains values for a given id
     * 
     * If the Select element in the transmission editor changes, all other fields are updated with the values corresponding to the newly selected element
     */
    function fillInputFieldsOfSelectedID(id, feature) {
        let featureEditor = document.getElementById('transmission_' + feature + 'FormDiv');
        let featureValues = TransmissionObject[feature + 'List'][id];

        for (value in featureValues) {
            featureEditor.querySelector('#' + value).value = featureValues[value];
        }
    }

    return {
        TransmissionObject: TransmissionObject,
        prepareTransmissionObjectList: prepareTransmissionObjectList,
        populateTransmissionEditorList: populateTransmissionEditorList,
        writeBackTransmissionFeatures: writeBackTransmissionFeatures
    }
}();
