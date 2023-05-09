var maptool_urbs_storage = function () {

    let StorageObject = {
        "storagePropertiesList": {},
        "storagePropertiesTemplate": {}
    }

    let container = document.getElementById('storage_confHOTContainer');
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


    function fetchProfiles() {
        fetch('urbs/storage_profiles')
        .then(function (response) {
            return response.json();
        }).then(function (data) {
            let storage = JSON.parse(data["sto_prop"])
            let storagePropertyJSONTemplate = {};
            
            for (idx in storage) {
                storagePropertyJSONTemplate[idx] = '';
            }

            StorageObject.storagePropertiesTemplate = storagePropertyJSONTemplate;

            let i = 0;
            for (idx in storage['name']) {
                let storagePropertyJSON = JSON.parse(JSON.stringify(storagePropertyJSONTemplate));
                for (feature_idx in storage) {
                    if (feature_idx != 'name') {
                        storagePropertyJSON[feature_idx] = storage[feature_idx][i];
                    }
                }
                let name = storage['name'][idx];
                StorageObject.storagePropertiesList[name] = storagePropertyJSON;
                i++;
            }
            maptool_urbs_process.populateProcessEditorList('storage', Object.keys(StorageObject.storagePropertiesList));

            createSto_Conf_Editor();
        });
    }

    function createSto_Conf_Editor() {
        var data = [];
        var headers = ['urbs_name'];
        var placeholders = []

        for (storage in StorageObject.storagePropertiesList) {
            headers.push(storage);
            placeholders.push('');
        }

        for (bus in maptool_urbs_buildings.BuildingsObject.busWithLoadList) {
            data.push([maptool_urbs_buildings.BuildingsObject.busWithLoadList[bus].feature.properties.name].concat(placeholders));
        }

        hot.loadData(data);

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
        StorageObject: StorageObject,
        hot: hot,
        fetchProfiles: fetchProfiles,
        createSto_Conf_Editor: createSto_Conf_Editor
    };
}();