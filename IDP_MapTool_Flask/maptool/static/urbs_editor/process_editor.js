//TODO: Edit conf table when new process, new commodity is added

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


    function fetchProcessProfiles() {
        fetch('urbs/process_profiles')
        .then(function (response) {
            return response.json();
        }).then(function (process_data) {
            let processes = JSON.parse(process_data["pro_prop"]);
            let process_commodities = JSON.parse(process_data["pro_com_prop"]);

            let processPropertyJSONTemplate = {};
            let pro_com_propJSONTemplate = {};

            
            for (key in processes) {
                processPropertyJSONTemplate[key] = '';
            }

            for (key in process_commodities) {
                pro_com_propJSONTemplate[key] = '';
            }

            ProcessObject.pro_propTemplate = processPropertyJSONTemplate;
            ProcessObject.pro_com_propTemplate = pro_com_propJSONTemplate;

            let i = 0;
            for (idx in processes['name']) {
                let processPropertyJSON = JSON.parse(JSON.stringify(processPropertyJSONTemplate));
                for (feature_idx in processes) {
                    if (feature_idx != 'name') {
                        processPropertyJSON[feature_idx] = processes[feature_idx][i];
                    }
                }
                ProcessObject.pro_propList[processes['name'][idx]] = processPropertyJSON;
                ProcessObject.pro_com_propList[processes['name'][idx]] = {};
                i++;
            }            

            populateProcessEditorList('pro_prop', Object.keys(ProcessObject.pro_propList));
            createPro_Conf_Editor();
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

    function fillSecondaryEditorList(target_properties) {
        let secondaryFeatureSelect = document.getElementById('pro_com_propSelect');
        for (let i = 0; i < secondaryFeatureSelect.options.length; i++) {
            if (Object.keys(target_properties).includes(secondaryFeatureSelect.options[i].value)) {
                secondaryFeatureSelect.options[i].hidden = false;
            }
            else {
                secondaryFeatureSelect.options[i].hidden = true;
            }
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

    function createNewProcessPropertyOrCommodity(isCommodity) {
        if(isCommodity) {
            createNewProcessCommodity();
        }
        else {
            createNewProcessProperty(document.getElementById("newProcessTextInput").value);
            if (document.getElementById("pro_propCommSelect").value == 'newCommodity') {
                createNewProcessCommodity(document.getElementById("newProcessTextInput").value, document.getElementById("newProcessCommTextInput").value);
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
    function createNewProcessCommodity(pro_name, com_name) {
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

        //TODO: we create a new div to attach to the process editor
        document.getElementById('pro_com_propSelect').add(option);
        document.getElementById('pro_propCommSelect').add(option);
        if (!Object.keys(ProcessObject.pro_com_propList).includes(pro_name)) {
            ProcessObject.pro_com_propList[pro_name] = {};
        }
        ProcessObject.pro_com_propList[pro_name][com_name] =JSON.parse(JSON.stringify(ProcessObject.pro_com_propTemplate));
    }

    function writeBackProcessFeatures(target) {
        let idxInFeatureList = document.getElementById("pro_propSelect").selectedIndex;
        let keyInFeatureList = document.getElementById("pro_propSelect").options[idxInFeatureList].text;
        let selectedElement = ProcessObject.pro_propList[keyInFeatureList];
        selectedElement[target.name] = target.value;
    }

    function createPro_Conf_Editor() {
        var data = [];
        var headers = ['urbs_name'];
        var placeholders = []

        for (commodity in maptool_urbs_commodity.CommodityObject.commodityPropertiesList) {
            headers.push(commodity);
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
        createNewProcessPropertyOrCommodity: createNewProcessPropertyOrCommodity,
        writeBackProcessFeatures: writeBackProcessFeatures,
        createPro_Conf_Editor: createPro_Conf_Editor
    }
}();
