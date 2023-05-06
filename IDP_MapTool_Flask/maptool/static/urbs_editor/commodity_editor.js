var maptool_urbs_commodity = function () {
    
    let CommodityObject = {
        "commodityPropertiesList": {},
        "commodityPropertiesTemplate": {}
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
        console.log("new commodity")
    }

    function fillSelectedFeatureCommodityEditor(target) {
        console.log(CommodityObject);

        let editor_form = document.getElementById('commodityForm');
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

    function writeBackCommodityFeatures(target) {
        let idxInFeatureList = document.getElementById("commoditySelect").selectedIndex;
        let selectedElement = CommodityObject.commodityPropertiesList[idxInFeatureList];
        console.log(selectedElement[target.name], target.value);
        selectedElement[target.name] = target.value;
        console.log(selectedElement[target.name], target.value);
    }

    return {
        CommodityObject: CommodityObject,
        createNewCommodity: createNewCommodity,
        writeBackCommodityFeatures: writeBackCommodityFeatures,
        prepareCommodityObject: prepareCommodityObject,
        fillSelectedFeatureCommodityEditor: fillSelectedFeatureCommodityEditor
    }

}();