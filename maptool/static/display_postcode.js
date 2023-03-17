function getPostalCodeArea() {
    let plz = document.getElementById("PLZ").value;
    fetch("http://127.0.0.1:5000/postcode", {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'},
                body: JSON.stringify(plz)
        }).then(response =>{
            console.log(response)
        }).catch((err) => console.error(err));
    
    console.log('starting Postcode Fetch');
    
    fetch('/postcode')
    .then(function (response) {
        return response.json();
    }).then(function (postcodeData) {
        let postcodeGeoJSON = L.geoJSON(postcodeData).addTo(map);
        map.fitBounds(postcodeGeoJSON.getBounds());
        console.log('added plz area');
        
        console.log('starting Postcode nets fetch');
        fetch('/postcode/nets')
        .then(function (response) {
            return response.json();
        }).then(function (postcodeNets) {
            console.log('added all nets in plz area');
            
            for(let i = 0; i < postcodeNets.length; i++) {
                displayPreviewNet(JSON.parse(postcodeNets[i]));
                console.log("Added net " + i);
            }
        });
    });
}

function displayPreviewNet(ppdata) {
    let line_geoJSON = createFeatures(true, ppdata, 'line', null, null, null);
    
    let linePreviewLayer = L.geoJSON(line_geoJSON, {
        style: getStyleDict()['LineStyles'][1]        
    }).addTo(map);

    linePreviewLayer.on('mouseover', styleWhenMouseOver)
    linePreviewLayer.on('mouseout', styleWhenMouseOut)
    
    function styleWhenMouseOver(e) {
        linePreviewLayer.setStyle({ color: 'green', fillColor: 'green' })
    }
    function styleWhenMouseOut(e) {
      //geoJsonLayer.setStyle({color:"gray"});
        linePreviewLayer.eachLayer(function (layer) {
            linePreviewLayer.resetStyle(layer)
            })
    }
}

