var maptool_return_urbs =  function() {
    function returnUrbsSetup() {
        returnUrbsSetup_Buildings();
        returnUrbsSetup_DemandConf();
        returnUrbsSetup_BuySellPrice();
        returnUrbsSetup_Transmissions();
        returnUrbsSetup_Processes();
        returnUrbsSetup_Storage();
    }
    
    function returnUrbsSetup_DemandConf() {
        let demand_json = {};
        for(idx in maptool_network_gen.NetworkObject.busList) {
            demand_json[maptool_network_gen.NetworkObject.busList[idx].feature.properties.name] = maptool_urbs_demand.DemandObject.bus_demands[idx];
        }
    
        postData("http://127.0.0.1:5000/urbs/demand_setup", demand_json);
    }
    
    function returnUrbsSetup_Buildings() {
        let buildings_json = JSON.stringify(BuildingsObject.buildingsPropertiesList);
        postData("http://127.0.0.1:5000/urbs/buildings_setup", buildings_json);
    }
    
    function returnUrbsSetup_BuySellPrice() {
        //postData("http://127.0.0.1:5000/urbs/urbs_setup", jsonData);
    }
    
    function returnUrbsSetup_Transmissions() {
        //postData("http://127.0.0.1:5000/urbs/urbs_setup", jsonData);
    }
    
    function returnUrbsSetup_Processes() {
        //postData("http://127.0.0.1:5000/urbs/urbs_setup", jsonData);
    }
    
    function returnUrbsSetup_Storage() {
        //postData("http://127.0.0.1:5000/urbs/urbs_setup", jsonData);
    }
    
    function postData(url, jsonData) {
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'},
            body: JSON.stringify(jsonData)
        }).then(function (response) {
            console.log(response)
        }).catch((err) => console.error(err));
    }

    return {
        returnUrbsSetup: returnUrbsSetup
    }
}();