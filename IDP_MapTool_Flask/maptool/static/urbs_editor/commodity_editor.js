//TODO: Edit conf table when new commodity is added
//TODO: Create new commodity function

var maptool_urbs_commodity = function () {
    
    let CommodityObject = {
        "commodityPropertiesList": {},
        "commodityPropertiesTemplate": {}
    }

    function fetchProfiles() {
        fetch('urbs/commodity_profiles')
        .then(function (response) {
            return response.json();
        }).then(function (data) {
            let commodity = JSON.parse(data["com_prop"])
            let propertyJSONTemplate = {};
            
            for (idx in commodity) {
                propertyJSONTemplate[idx] = '';
            }

            CommodityObject.commodityPropertiesTemplate = propertyJSONTemplate;

            let i = 0;
            for (idx in commodity['name']) {
                let propertyJSON = JSON.parse(JSON.stringify(propertyJSONTemplate));
                for (feature_idx in commodity) {
                    if (feature_idx != 'name') {
                        propertyJSON[feature_idx] = commodity[feature_idx][i];
                    }
                }
                let name = commodity['name'][idx];
                CommodityObject.commodityPropertiesList[name] = propertyJSON;
                i++;
            }
            maptool_urbs_process.populateProcessEditorList('commodity', Object.keys(CommodityObject.commodityPropertiesList));
        });
    }

    function prepareCommodityObject(UrbsPropertiesJSON, commodities) {
        let propertiesToAdd = UrbsPropertiesJSON['commodity'];
        let commodityJSON = {};
        for (property in propertiesToAdd) {
            commodityJSON[property] = ''
        }
        CommodityObject.commodityPropertiesTemplate = commodityJSON;

        for (idx in commodities) {
            let name = commodities[idx]
            CommodityObject.commodityPropertiesList[name] = JSON.parse(JSON.stringify(commodityJSON));
            addCommToProcessCreationFormList(name)
        }
    }

    function addCommToProcessCreationFormList(name) {
        let commSelect = document.getElementById("pro_propCommSelect");
        let newOption = document.createElement("option");
        newOption.value = name;
        newOption.text = name;
        commSelect.appendChild(newOption);

    }

    function createNewCommodity() {
        console.log("new commodity");
    }
    function writeBackCommodityFeatures(target) {
        let idxInFeatureList = document.getElementById("commoditySelect").value;
        let selectedElement = CommodityObject.commodityPropertiesList[idxInFeatureList];
        selectedElement[target.name] = target.value;
        console.log(selectedElement[target.name], target.value);
    }

    return {
        CommodityObject: CommodityObject,
        fetchProfiles: fetchProfiles,
        createNewCommodity: createNewCommodity,
        writeBackCommodityFeatures: writeBackCommodityFeatures,
        prepareCommodityObject: prepareCommodityObject
    }

}();