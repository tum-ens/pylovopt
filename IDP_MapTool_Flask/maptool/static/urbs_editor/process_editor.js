//TODO: Pro_com_prop value write-back
//TODO: Pro_com_prop in/out difference
//TODO: Pro_com_prop deletion possible


var maptool_urbs_process = function() {
    let ProcessObject = {
        "pro_propList": {},
        "pro_com_propList": {},
        "pro_propTemplate": {},
        "pro_com_propTemplate": {}
    }

    let container = document.getElementById('process_confHOTContainer');
    let hot = new Handsontable(container, {
        data: [[]],
        rowHeaders: true,
        colHeaders: [],
        minRows: 1,
        minCols: 1,
        minSpareRows: 1,
        overflow: 'auto',
        licenseKey: 'non-commercial-and-evaluation'
        });


    /**
     * retrieves pre-existing process property data from the server
     */
    function fetchProcessProfiles() {
        fetch('urbs/process_profiles')
        .then(function (response) {
            return response.json();
        }).then(function (process_data) {
            let processes = JSON.parse(process_data["pro_prop"]);
            let process_commodities = JSON.parse(process_data["pro_com_prop"]);

            createProcessJSONTemplates(processes, process_commodities);

            let i = 0;
            for (idx in processes['name']) {
                let processPropertyJSON = JSON.parse(JSON.stringify(ProcessObject.pro_propTemplate));
                for (feature_idx in processes) {
                    if (feature_idx != 'name') {
                        processPropertyJSON[feature_idx] = processes[feature_idx][i];
                    }
                }
                ProcessObject.pro_propList[processes['name'][idx]] = processPropertyJSON;
                ProcessObject.pro_com_propList[processes['name'][idx]] = {'in': {}, 'out': {}};
                i++;
            }       
            populateProcessEditorList('pro_prop', Object.keys(ProcessObject.pro_propList));
            createPro_Conf_Editor();
        });
    }

    /**
     * 
     * @param {dict} processes              dict with process feature:value key:value pairs
     * @param {dict} process_commodities    dict with pro_com feature:value key:value pairs
     * creates dict entry templates to use if we want to add new processes or new process commodities
     */
    function createProcessJSONTemplates(processes, process_commodities) {
        let processPropertyJSONTemplate = {};
        let pro_com_propJSONTemplate = {};
        
        for (key in processes) {
            //name should not be an editable input value in the editor, since we use name as key in the pro_prop dict
            if(key != 'name') {
                processPropertyJSONTemplate[key] = '';
            }
        }

        for (key in process_commodities) {
            //direction and commodity should not be editable inputs in the editor, since we use them as keys in the pro_com_prop dict
            if(key != 'Direction' && key != 'Commodity' && key != 'Process') {
                pro_com_propJSONTemplate[key] = '';
            }
        }
        ProcessObject.pro_propTemplate = processPropertyJSONTemplate;
        ProcessObject.pro_com_propTemplate = pro_com_propJSONTemplate;
    }

    function populateProcessEditorList(htmlListName, listEntries) {
        let processList = document.getElementById(htmlListName + "Select");
        for (entry in listEntries) {
            var option = document.createElement("option");
            option.text = listEntries[entry];
            processList.add(option);
        }
    }

    function fillSecondaryEditorList(target_properties) {
        let secondaryFeatureSelect = document.getElementById('pro_com_propSelect');
        for (let i = 0; i < secondaryFeatureSelect.options.length; i++) {
            if (Object.keys(target_properties["in"]).includes((secondaryFeatureSelect.options[i].value).slice(0, -3)) || 
                Object.keys(target_properties["out"]).includes((secondaryFeatureSelect.options[i].value).slice(0, -4)) ) {
                secondaryFeatureSelect.options[i].hidden = false;
            }
            else {
                secondaryFeatureSelect.options[i].hidden = true;
            }
        }
    }

    function openNewProcessForm(isCommodity) {
        let form = (isCommodity) ? document.getElementById("urbsProcessCommodityPopupForm") :  document.getElementById("urbsProcessPopupForm");
        form.style.display = "block";
    }

    function closeNewProcessForm(isCommodity) {
        let form = (isCommodity) ? document.getElementById("urbsProcessCommodityPopupForm") :  document.getElementById("urbsProcessPopupForm");
        form.style.display = "none";
        document.getElementById('pro_propCommSelect').selectedIndex = 0;
        document.getElementById("newProcessTextInput").value = '';
        document.getElementById("newProcessCommTextInput").value = '';
        document.getElementById("newProcessCreateButton").disabled = true;
        document.getElementById("newProcessCommDiv").classList.add('hidden');
    }

    function processFormCommoditySelection(sel) {
        let processNameFlag = (document.getElementById("newProcessTextInput").value.length != 0);
        document.getElementById("newProcessCreateButton").disabled = true;

        if (sel.value == 'newCommodity') {
            document.getElementById("newProcessCreateButton").disabled = true;
            document.getElementById("newProcessCommDiv").classList.remove('hidden');
            if(document.getElementById("newProcessCommTextInput").value != '' && processNameFlag) {
                document.getElementById("newProcessCreateButton").disabled = false;
            }
        }
        else if(sel.value != 'none'){
            if (processNameFlag) {
                document.getElementById("newProcessCreateButton").disabled = false;
            }
            document.getElementById("newProcessCommDiv").classList.add('hidden');

        }
    }

    function processAddCommoditySelection(sel) {
        
        if (sel.value == 'newCommodity') {
            document.getElementById("ProcessAddCreateButton").disabled = true;
            document.getElementById("ProcessAddCommDiv").classList.remove('hidden');
            if(document.getElementById("ProcessAddCommTextInput").value != '') {
                document.getElementById("ProcessAddCreateButton").disabled = false;
            }
        }
        else if(sel.value != 'none'){
            document.getElementById("ProcessAddCreateButton").disabled = false;
            document.getElementById("ProcessAddCommDiv").classList.add('hidden');

        }
    }

    function createNewProcessPropertyOrCommodity(isCommodity) {
        if(isCommodity) {
            let inOrOut = (document.getElementById('ProcessAddCommCheckboxIn').checked) ? "in" : "out";
            if (document.getElementById("pro_propAddCommSelect").value == 'newCommodity') {
                createNewProcessCommodity(document.getElementById("pro_propSelect").value, document.getElementById("ProcessAddCommTextInput").value, inOrOut);
            }
            else {
                ProcessObject.pro_com_propList[document.getElementById("pro_propSelect").value][inOrOut][document.getElementById("pro_propAddCommSelect").value] = JSON.parse(JSON.stringify(ProcessObject.pro_com_propTemplate));
                
                const select = document.querySelector("#pro_com_propSelect");
                const optionLabels = Array.from(select.options).map((opt) => opt.value);
                const hasOption = optionLabels.includes(document.getElementById("pro_propAddCommSelect").value + " " + inOrOut);
        

                if(!hasOption) {
                    let option = document.createElement("option");
                    option.text = document.getElementById("pro_propAddCommSelect").value + " " + inOrOut;
                    option.value = document.getElementById("pro_propAddCommSelect").value + " " + inOrOut;
                    document.getElementById('pro_com_propSelect').add(option);
                }
            }
        }
        else {
            let inOrOut = (document.getElementById('newProcessCommCheckboxIn').checked) ? "in" : "out";
            createNewProcessProperty(document.getElementById("newProcessTextInput").value);
            if (document.getElementById("pro_propCommSelect").value == 'newCommodity') {
                createNewProcessCommodity(document.getElementById("newProcessTextInput").value, document.getElementById("newProcessCommTextInput").value, inOrOut);
            }
            else {
                ProcessObject.pro_com_propList[document.getElementById("newProcessTextInput").value] = {};
                ProcessObject.pro_com_propList[document.getElementById("newProcessTextInput").value][document.getElementById("pro_propCommSelect").value] =JSON.parse(JSON.stringify(ProcessObject.pro_com_propTemplate));
                
                let option = document.createElement("option");
                option.text = document.getElementById("pro_propCommSelect").value;
                option.value = document.getElementById("pro_propCommSelect").value;
                document.getElementById('pro_com_propSelect').add(option);
            }
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

    //we must add a newly defined process commodity to the list of commodities, the process_config table and the editor window of the process
    //the commodity is associated with
    function createNewProcessCommodity(pro_name, com_name, inOrOut) {
        console.log("new Process Commodity")

        //we grab the commodity list and add a new option. All values are blank at the start. We also add a blank entry to the Commodity Object List
        let commodityList = document.getElementById("commoditySelect");
        let option = document.createElement("option");
        option.text = com_name;
        option.value = com_name;
        commodityList.add(option);
        maptool_urbs_commodity.CommodityObject.commodityPropertiesList[com_name] = JSON.parse(JSON.stringify(maptool_urbs_commodity.CommodityObject.commodityPropertiesTemplate));
        
        //we insert a new column into the commodity table
        hot.alter('insert_col', hot.countCols(), 1)
        hot.headers[hot.headers.length - 1] = com_name;

        const select = document.querySelector("#pro_com_propSelect");
        const optionLabels = Array.from(select.options).map((opt) => opt.value);
        const hasOption = optionLabels.includes(com_name + " " + inOrOut);

        if (!hasOption) {
            let pro_com_propOption = document.createElement("option");
            pro_com_propOption.text = com_name + " " + inOrOut;
            pro_com_propOption.value = com_name + " " + inOrOut;

            document.getElementById('pro_com_propSelect').add(pro_com_propOption);
        }

        let pro_propCommOption = document.createElement("option");
        pro_propCommOption.text = com_name;
        pro_propCommOption.value = com_name;
        document.getElementById('pro_propCommSelect').add(pro_propCommOption);
        if (!Object.keys(ProcessObject.pro_com_propList).includes(pro_name)) {
            ProcessObject.pro_com_propList[pro_name] = {"in": {}, "out": {}};
        }
        ProcessObject.pro_com_propList[pro_name][inOrOut][com_name] = JSON.parse(JSON.stringify(ProcessObject.pro_com_propTemplate));
    }

    function writeBackProcessFeatures(target, isPro_com_prop) {
        let idxInFeatureList = document.getElementById("pro_propSelect").selectedIndex;
        let keyInFeatureList = document.getElementById("pro_propSelect").options[idxInFeatureList].text;
        
        if(isPro_com_prop) {
            let pro_com_propKey = document.getElementById("pro_com_propSelect").value;
            let inOrOutFlag = (pro_com_propKey.slice(-3) === ' in') ? true : false;

            let selectedElement = ProcessObject.pro_com_propList[keyInFeatureList][(inOrOutFlag) ? "in" : "out"][(inOrOutFlag) ? pro_com_propKey.slice(0, -3) : pro_com_propKey.slice(0, -4)];
            selectedElement[target.name] = target.value;
        }
        else {
            let selectedElement = ProcessObject.pro_propList[keyInFeatureList];
            selectedElement[target.name] = target.value;
        }
    }
    
    function createPro_Conf_Editor() {
        var data = [];
        var headers = ['urbs_name'];
        var placeholders = []

        for (processName in ProcessObject.pro_propList) {
            headers.push(processName);
            placeholders.push('');
        }

        for (bus in maptool_urbs_buildings.BuildingsObject.busWithLoadList) {
            data.push([maptool_urbs_buildings.BuildingsObject.busWithLoadList[bus].feature.properties.name].concat(placeholders));
        }
        hot.loadData(data);
        hot.headers = headers;

        hot.updateSettings({
            cells(row, col, prop) {
                const cellProperties = {};
            
                if (col == 0) {
                  cellProperties.readOnly = true;
            
                } else {
                  cellProperties.editor = 'numeric';
                }
            
                return cellProperties;
              }, 
              colHeaders: headers 
        })
    }
    
    return {
        ProcessObject: ProcessObject,
        hot: hot,
        fetchProcessProfiles: fetchProcessProfiles,
        populateProcessEditorList: populateProcessEditorList,
        fillSecondaryEditorList: fillSecondaryEditorList,
        openNewProcessForm: openNewProcessForm,
        closeNewProcessForm: closeNewProcessForm,
        processFormCommoditySelection: processFormCommoditySelection,
        processAddCommoditySelection: processAddCommoditySelection,
        createNewProcessPropertyOrCommodity: createNewProcessPropertyOrCommodity,
        writeBackProcessFeatures: writeBackProcessFeatures,
        createPro_Conf_Editor: createPro_Conf_Editor
    }
}();
