//fills html element for a given list of network features
function populateLists(listName, list) {
    //console.log(listName);
    var x = document.getElementById(listName + "Select");

    list = list.sort(function (a, b) {
        return parseInt(a.feature.properties.index) - parseInt(b.feature.properties.index);
    })
    //console.log(list);
    x.size = (list.length > 24) ? 24 : list.length;
    for (idx in list) {
        var option = document.createElement("option");
        option.text = list[idx].feature.properties.index;
        option.value = idx;
        x.add(option);
    }
}

function openList(e, listName) {
    tabcontent = document.getElementsByClassName("featureListTab");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }

    editorcontent = document.getElementsByClassName('selectedFeatureEditor');

    for (i = 0; i < editorcontent.length; i++) {
        editorcontent[i].style.display = "none";
    }

    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    document.getElementById(listName).style.display = "inline-block";
    e.currentTarget.className += " active";
}

function fillSelectedFeatureEditor(sel, listName) {
    let idx = parseInt(sel.options[sel.selectedIndex].value);
    let debugIdx = parseInt(sel.options[sel.selectedIndex].text);

    editorcontent = document.getElementsByClassName('selectedFeatureEditor');
    for (i = 0; i < editorcontent.length; i++) {
        editorcontent[i].style.display = "none";
    }

    document.getElementById(listName + 'Editor').style.display = 'inline-block';

    let selectedObject = null;
    let styleIndex = 0;
    if(sel.id == 'busSelect') {
        //console.log(debugIdx, busList[idx].feature.properties.index);
        selectedObject = busList[idx];
        }
    if(sel.id == 'lineSelect') {
        //console.log(debugIdx, lineList[idx].feature.properties.index);
        selectedObject = lineList[idx];
        styleIndex = 1;
        }
    if(sel.id == 'trafoSelect') {
        //console.log(debugIdx, trafoList[idx].feature.properties.index);
        selectedObject = trafoList[idx];
        styleIndex = 3;
        }
    if(sel.id == 'ext_gridSelect') {
        //console.log(debugIdx, ext_gridList[idx].feature.properties.index);
        selectedObject = ext_gridList[idx];
        styleIndex = 2;
    }

    clickOnMarker(selectedObject, getStyleDict(), styleIndex);

    let editor_form = document.getElementById(listName + 'Form');
    let editor_elems = editor_form.children;
    console.log(selectedObject);
    for (let i = 0; i < editor_elems.length; i++) {
        if (editor_elems[i].nodeName == 'INPUT') {
            if(selectedObject.feature.properties[editor_elems[i].name] != null) {
                editor_elems[i].value = selectedObject.feature.properties[editor_elems[i].name];
            }
        }
    }
}

function populateEditor(listName, selectedProperties) {
    let editor_form = document.getElementById(listName + 'Form');

    for (idx in selectedProperties) {
        let label = document.createElement("label");
        let input = document.createElement("input");

        label.htmlFor = selectedProperties[idx];
        label.innerHTML = selectedProperties[idx];

        input.type="text";
        input.id = selectedProperties[idx];
        input.name = selectedProperties[idx];

        editor_form.appendChild(label);
        editor_form.appendChild(input);
    }
}