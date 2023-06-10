var maptool_urbs_trans = function() {

    let TransmissionObject = {
        cable_dataList: {},
        trafo_dataList: {}
    }

    function fetchTransmissionProfiles() {
        return fetch('urbs/transmission_profiles')
        .then(function(response) {
            return response.json();
        }).then(function(trafo_json) {
            let trafo_data = JSON.parse(trafo_json['trafo_data']);
            let trafo_data_profiles = Object.keys(trafo_data.id);

            for (let i = 0; i < trafo_data_profiles.length; i++) {
                let data_dict = {};
                for (key in trafo_data) {
                    if (key != 'id') {
                        data_dict[key] = trafo_data[key][i];
                    } 
                }
                if (i == 0) {
                    data_dict['cap'] = trafo_json['trafo_sn_mva']*1000;
                    TransmissionObject.trafo_dataList['kont' + trafo_json['trafo_sn_mva']*1000] = data_dict;

                }
                else  {
                    TransmissionObject.trafo_dataList[trafo_data.id[i]] = data_dict;
                }
            }
        });
    }

    //TODO: Allow adding additional cables
    /**
     * @param {JSON Object} TransmissionPropertiesJSON 
     * @param {string}      listName
     * 
     * prefills the TransmissionObject
     */
    function prepareCableDataList(TransmissionPropertiesJSON, listName) {
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

    function fillTrafoDataEditorIdSelect() {
        let input = document.getElementById("transmission_trafo_dataFormDiv").querySelector('#id');
        let propertiesToAdd = TransmissionObject.trafo_dataList

        for (option in propertiesToAdd) {
            let listOption = document.createElement("option");
            listOption.text = option;
            listOption.value = option;
            input.add(listOption);
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
     * @param {string} id key for TransmissionObject list element that contains values for a given id
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

    function openNewTrafoDataForm() {
        document.getElementById('urbsNewTrafoDataPopupForm').style.display = "block";
    }

    function closeNewTrafoDataForm() {
        document.getElementById('urbsNewTrafoDataPopupForm').style.display = "none";
        document.getElementById('newTrafoDataTextInput').value = "";
    }

    function trafoDataFormCheckValidInput(text) {
        if(!isNaN(text) && !isNaN(parseFloat(text))) {
            document.getElementById("newTrafoDataCreateButton").disabled = false;
        }
        else {
            //TODO: check if ront with this sn_mva already exists
            document.getElementById("newTrafoDataCreateButton").disabled = true;
        }
    }

    function createNewTrafoData(sn_mva) {
        let list = document.getElementById("transmission_trafo_dataFormDiv").querySelector('#id');
        let option = document.createElement('option');
        let  option_name = 'ront' + parseFloat(sn_mva) * 1000;
        option.value = option_name;
        option.text = option_name;
        list.append(option);

        let data_dict = {};
        for (key in maptool_urbs_setup.getUrbsPropertiesJSON()['transmission']['trafo_data']) {
            if (key != 'id') {
                data_dict[key] = '';
            }
        }

        data_dict['cap'] = parseFloat(sn_mva) * 1000;

        TransmissionObject.trafo_dataList[option_name] = data_dict;

        closeNewTrafoDataForm()
    }

    return {
        TransmissionObject: TransmissionObject,
        fetchTransmissionProfiles: fetchTransmissionProfiles,
        prepareCableDataList: prepareCableDataList,
        populateTransmissionEditorList: populateTransmissionEditorList,
        fillTrafoDataEditorIdSelect: fillTrafoDataEditorIdSelect,
        writeBackTransmissionFeatures: writeBackTransmissionFeatures,
        openNewTrafoDataForm: openNewTrafoDataForm,
        closeNewTrafoDataForm: closeNewTrafoDataForm,
        trafoDataFormCheckValidInput: trafoDataFormCheckValidInput,
        createNewTrafoData: createNewTrafoData
    }
}();
