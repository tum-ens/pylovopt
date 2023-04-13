function returnEditedNet() {
    //console.log(NetworkObject);
    fetch("http://127.0.0.1:5000/networks/urbs_results", {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'},
                body: JSON.stringify("test")
        }).then(function (response) {
            return response.json();
        }).catch((err) => console.error(err));

    //console.log("returned Network");
}
