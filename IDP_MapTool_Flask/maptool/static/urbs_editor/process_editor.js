var maptool_urbs_process = function() {
    let ProcessObject = {
        "pro_propList": {},
        "pro_com_propList": {},
        "pro_propTemplate": {}
    }

    function fetchProcessProfiles() {
        fetch('urbs/process_profiles')
        .then(function (response) {
            return response.json();
        }).then(function (process_data) {
            let processes = JSON.parse(process_data["pro_prop"])

            let processPropertyJSONTemplate = {};
            
            for (idx in processes) {
                processPropertyJSONTemplate[idx] = '';
            }

            ProcessObject.pro_propTemplate = processPropertyJSONTemplate;

            for (idx in processes['name']) {
                let processPropertyJSON = JSON.parse(JSON.stringify(processPropertyJSONTemplate));
                ProcessObject.pro_propList[processes['name'][idx]] = processPropertyJSON;
            }
            
            populateProcessEditorList('pro_prop', Object.keys(ProcessObject.pro_propList));
        });
    }

    function populateProcessEditorList(htmlListName, listEntries) {
        let processList = document.getElementById(htmlListName + "Select");
        for (entry in listEntries) {
            var option = document.createElement("option");
            option.text = listEntries[entry];
            processList.add(option);
        }
    }

    function openNewProcessForm(isCommodity) {
        let form = (isCommodity) ? document.getElementById("urbsProcessCommPopupForm") :  document.getElementById("urbsProcessPopupForm");
        form.style.display = "block";
    }

    function closeNewProcessForm(isCommodity) {
        let form = (isCommodity) ? document.getElementById("urbsProcessCommPopupForm") :  document.getElementById("urbsProcessPopupForm");
        form.style.display = "none";
        document.getElementById('pro_propCommSelect').selectedIndex = 0;
        document.getElementById("newProcessTextInput").value = '';
        document.getElementById("newProcessCommTextInput").value = '';
        document.getElementById("newProcessCreateButton").disabled = true;
        document.getElementById("newProcessCommTextInput").classList.add('hidden');
    }

    function processFormCommoditySelection(sel) {
        let processNameFlag = (document.getElementById("newProcessTextInput").value.length != 0);
        document.getElementById("newProcessCreateButton").disabled = true;

        if (sel.value == 'newCommodity') {
            document.getElementById("newProcessCreateButton").disabled = true;
            document.getElementById("newProcessCommTextInput").classList.remove('hidden');
            if(document.getElementById("newProcessCommTextInput").value != '' && processNameFlag) {
                document.getElementById("newProcessCreateButton").disabled = false;
            }
        }
        else if(sel.value != 'none'){
            if (processNameFlag) {
                document.getElementById("newProcessCreateButton").disabled = false;
            }
            document.getElementById("newProcessCommTextInput").classList.add('hidden');

        }
    }

    function createNewProcessPropertyOrCommodity(isCommodity) {
        if(isCommodity) {
            createNewProcessCommodity();
        }
        else {
            createNewProcessProperty(document.getElementById("newProcessTextInput").value);
        }
        closeNewProcessForm(isCommodity)
    }

    function createNewProcessProperty(name) {
        console.log("new Process")
        let processList = document.getElementById("pro_propSelect");
        let option = document.createElement("option");
        option.text = name;
        processList.add(option);

        let processPropertyJSON = JSON.parse(JSON.stringify(ProcessObject.pro_propTemplate));
        ProcessObject.pro_propList[name] = processPropertyJSON;
    }   

    
    function createNewProcessCommodity() {
        console.log("new Process Commodity")
        let form = document.getElementById("pro_prop_form")
    }

    function writeBackProcessFeatures(target) {
        let idxInFeatureList = document.getElementById("pro_propSelect").selectedIndex;
        let keyInFeatureList = document.getElementById("pro_propSelect").options[idxInFeatureList].text;
        let selectedElement = ProcessObject.pro_propList[keyInFeatureList];
        selectedElement[target.name] = target.value;
    }

    function fillSelectedProcessEditor(target) {
        let editor_form = document.getElementById('pro_propForm');
        let editor_divs = editor_form.children;

        for (let i = 0; i < editor_divs.length; i++) {
            let editor_elems = editor_form.children[i].children;
            for (let i = 0; i < editor_elems.length; i++) {
                if (editor_elems[i].nodeName == 'INPUT') {
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
    
    return {
        ProcessObject: ProcessObject,
        fetchProcessProfiles: fetchProcessProfiles,
        populateProcessEditorList: populateProcessEditorList,
        fillSelectedProcessEditor: fillSelectedProcessEditor,
        openNewProcessForm: openNewProcessForm,
        closeNewProcessForm: closeNewProcessForm,
        processFormCommoditySelection: processFormCommoditySelection,
        createNewProcessPropertyOrCommodity: createNewProcessPropertyOrCommodity,
        writeBackProcessFeatures: writeBackProcessFeatures
        
    }
}();