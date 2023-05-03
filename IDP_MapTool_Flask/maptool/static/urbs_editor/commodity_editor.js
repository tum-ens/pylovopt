var maptool_urbs_commodity = function () {
    
    let CommodityObject = {
        "commodityPropertiesList": []
    }

    function prepareCommodityObject(UrbsPropertiesJSON, commodities) {
        let propertiesToAdd = UrbsPropertiesJSON['commodity'];
        for (idx in commodities) {
            let name = commodities[idx]
            let commodityJSON = {"name": name};
            for (property in propertiesToAdd) {
                commodityJSON[property] = ''
            }
            CommodityObject.commodityPropertiesList.push(commodityJSON);
        }
        console.log(CommodityObject)
    }

    function createNewCommodity() {
        console.log("new commodity")
    }

    function fillSelectedFeatureCommodityEditor(target) {
        console.log(target);

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