var maptool_urbs_process = function() {
    function populateProcessEditorList(htmlListName, listEntries) {
        let processList = document.getElementById(htmlListName + "Select");
        for (entry in listEntries) {
            var option = document.createElement("option");
            option.text = listEntries[entry];
            processList.add(option);
        }
    }

    return {
        populateProcessEditorList: populateProcessEditorList
    }
}();