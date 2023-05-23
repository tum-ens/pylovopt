var maptool_return_urbs =  function() {
    function returnUrbsSetup() {
        returnUrbsSetup_Buildings();
        returnUrbsSetup_DemandConf();
        returnUrbsSetup_BuySellPrice();
        returnUrbsSetup_Transmissions();
        returnUrbsSetup_Global();
        returnUrbsSetup_Commodity();
        returnUrbsSetup_Processes();
        returnUrbsSetup_Storage();
        returnUrbsSetup_SupIm();
        returnUrbsSetup_Timevareff();
    }
    //DONE
    function returnUrbsSetup_DemandConf() {
        let demand_json = {};
        for(idx in maptool_urbs_buildings.BuildingsObject.busWithLoadList) {
            demand_json[maptool_urbs_buildings.BuildingsObject.busWithLoadList[idx].feature.properties.name] = maptool_urbs_demand.DemandObject.bus_demands[idx];
        }
        //postData("http://127.0.0.1:5000/urbs/demand_setup", demand_json);
    }
    //DONE
    function returnUrbsSetup_Buildings() {
        let buildings_json = JSON.stringify(maptool_urbs_buildings.BuildingsObject.buildingsPropertiesList);

        //postData("http://127.0.0.1:5000/urbs/buildings_setup", buildings_json);
    }
    //DONE
    function returnUrbsSetup_BuySellPrice() {
        //postData("http://127.0.0.1:5000/urbs/urbs_setup", jsonData);
    }
    //DONE
    function returnUrbsSetup_Transmissions() {
        let transmission_json = {};

        const cableFormData = new FormData(document.getElementById('transmission_cable_dataForm'));
        const cableFormProps = Object.fromEntries(cableFormData);
        transmission_json['cable_data'] = cableFormProps;

        const trafoFormData = new FormData(document.getElementById('transmission_trafo_dataForm'));
        const trafoFormProps = Object.fromEntries(trafoFormData);
        transmission_json['trafo_data'] = trafoFormProps;

        const voltageFormData = new FormData(document.getElementById('transmission_voltage_limitsForm'));
        const voltageProps = Object.fromEntries(voltageFormData);
        transmission_json['voltage_limits'] = voltageProps;

        //postData("http://127.0.0.1:5000/urbs/transmission_setup", transmission_json);
    }
    //DONE
    function returnUrbsSetup_Global() {
        let global_json = {};

        const globalFormData = new FormData(document.getElementById('globalForm'));
        const globalProps = Object.fromEntries(globalFormData);
        global_json['global'] = globalProps;

        //postData("http://127.0.0.1:5000/urbs/global_setup", global_json);
    }
    //DONE
    function returnUrbsSetup_Commodity() {
        let commodity_json = JSON.stringify(maptool_urbs_commodity.CommodityObject.commodityPropertiesList);
        //postData("http://127.0.0.1:5000/urbs/commodity_setup", commodity_json);
    }
    //DONE
    function returnUrbsSetup_Processes() {
        let process_json = {};
        process_json['pro_prop'] = JSON.stringify(maptool_urbs_process.ProcessObject.pro_propList);
        process_json['pro_com_prop'] = JSON.stringify(maptool_urbs_process.ProcessObject.pro_com_propList);
        process_json['pro_conf'] = JSON.stringify(maptool_urbs_process.hot.getData());

        //postData("http://127.0.0.1:5000/urbs/process_setup", jsonData);
    }
    //DONE
    function returnUrbsSetup_Storage() {
        let storage_json = {};
        storage_json['sto_prop'] = JSON.stringify(maptool_urbs_storage.StorageObject.storagePropertiesList);
        storage_json['sto_conf'] = JSON.stringify(maptool_urbs_storage.hot.getData());

        console.log(storage_json);
        //postData("http://127.0.0.1:5000/urbs/storage_setup", storage_json);
    }
    //DONE
    function returnUrbsSetup_SupIm() {
        let supim_json = {};
        for(idx in maptool_urbs_buildings.BuildingsObject.busWithLoadList) {
            supim_json[maptool_urbs_buildings.BuildingsObject.busWithLoadList[idx].feature.properties.name] = maptool_urbs_supim.SupimObject.bus_supim[idx];
        }
        //postData("http://127.0.0.1:5000/urbs/supim_setup", supim_json);

    }
    //DONE
    function returnUrbsSetup_Timevareff() {
        let timevareff_json = {};

        for(idx in maptool_urbs_buildings.BuildingsObject.busWithLoadList) {
            timevareff_json[maptool_urbs_buildings.BuildingsObject.busWithLoadList[idx].feature.properties.name] = maptool_urbs_timevareff.TimevareffObject.bus_timevareff[idx];
        }
        //postData("http://127.0.0.1:5000/urbs/timevareff_setup", timevareff_json);
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