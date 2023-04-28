function populateTransmissionEditorList() {
    let transmissionEditorList = document.getElementById("transmissionSelect");

    let transmissionEditors = UrbsPropertiesJSON['transmission'];
    for (category in transmissionEditors) {
        var option = document.createElement("option");
        option.text = category;
        transmissionEditorList.add(option);
    }
}

function fillSelectedFeatureTransEditor() {
    
}
