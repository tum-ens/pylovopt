/*
This file contains everything related to the network editor windows.
This includes filling the feature lists and generating the editor input fields, as well as making sure changed inputs are saved
*/

//only called once on network generation
//fills html element for a given list of network features at intial editable network generation
//the index property of a feature and the option index do not have to match
function populateLists(listName) {
    var x = document.getElementById(listName + "Select");
    let list = NetworkObject[listName + 'List'];
    list = list.sort(function (a, b) {
        return parseInt(a.feature.properties.index) - parseInt(b.feature.properties.index);
    })
    //x.size = (list.length > 24) ? 24 : list.length;
    for (idx in list) {
        var option = document.createElement("option");
        option.text = list[idx].feature.properties.index;
        //option.value = idx;
        x.add(option);
    }
}

//only called once on network generation
//The feature editor window template for all feature types gets filled at runtime
//input fields and labels depend entirely on the properties defined in the displayNetwork function
function populateEditableNetworkEditor(listName, selectedProperties, std_typeList, std_type_properties, secondaryFeatureName) {
    let editor_form = document.getElementById(listName + 'Form');
    let formDiv = document.createElement('DIV');
    let formDivId = listName + 'FormDiv';
    formDiv.classList.add('feature-editor__selected-feature-editor__div');
    if (secondaryFeatureName != null) {
        formDivId = secondaryFeatureName + 'FormDiv';
        formDiv.style.display = 'None'

        let label = document.createElement("label");
        label.innerHTML = secondaryFeatureName.toUpperCase();
        label.classList.add('secondary-feature-label');

        formDiv.appendChild(label);
    }

    formDiv.id = formDivId;

    for (idx in selectedProperties) {
        let label = document.createElement("label");
        label.htmlFor = selectedProperties[idx];
        label.innerHTML = selectedProperties[idx];
        
        if(selectedProperties[idx] == 'std_type') {
            let form = document.createElement("select");
            form.classList.add('feature-editor__selected-feature-editor__stdtype-feature-select')
            form.setAttribute('onchange', 'writeBackEditedNetworkFeature(this, "' + listName + '_std_typesFormDiv")');
            let ctr = 0;
            for(type_idx in std_typeList) {
                let option = document.createElement("option");
                option.text = type_idx;
                option.value = ctr;
                form.add(option);
                ctr++;
            }
            formDiv.appendChild(form);
            formDiv.appendChild(label);
            for(prop_idx in std_type_properties) {
                let input = document.createElement("input");
                input.type="text";
                input.readOnly = true;
                input.id = std_type_properties[prop_idx];
                input.name = std_type_properties[prop_idx];
                formDiv.appendChild(input);

                let Prop_label = document.createElement("label");

                Prop_label.htmlFor = std_type_properties[prop_idx];
                Prop_label.innerHTML = std_type_properties[prop_idx];
                formDiv.appendChild(Prop_label);
            }
        }  
        else {
            let input = document.createElement("input");
            input.type="text";
            input.setAttribute('onchange', 'writeBackEditedNetworkFeature(this, "' + formDivId + '")');
            input.id = selectedProperties[idx];
            input.name = selectedProperties[idx];
            formDiv.appendChild(input);
            formDiv.appendChild(label);
        }
    }
    editor_form.appendChild(formDiv);
}

//gets called when one of the tablink buttons in the GUI gets pressed and opens the relevant feature list, while hiding all other GUI elements
function openEditableNetworkList(e, listName) {
    tabcontent = document.getElementsByClassName("feature-editor__featurelist-tab");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }

    editorcontent = document.getElementsByClassName('feature-editor__selected-feature-editor');

    for (i = 0; i < editorcontent.length; i++) {
        editorcontent[i].style.display = "none";
    }

    tablinks = document.getElementsByClassName("feature-editor__buttons-tab__tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    document.getElementById(listName).style.display = "inline-block";
    e.currentTarget.className += " active";

    //if a list element had been selected previously and the tab had been closed without another feature editor being opened elsewhere, we reopen the editor window of the 
    //currently selected feature
    if(listName == 'std_types') {

    }
    else {
        if (document.getElementById(listName + 'Select').selectedIndex != -1) {
            let editor = document.getElementById(listName + "Editor")
            editor.style.display = "inline-block";
        }
    }
}

//writes values of the currently selected feature into the input fields of the editor window
function fillSelectedEditableNetworkFeatureEditor(sel, listName) {
    let idx = parseInt(sel.selectedIndex);    
    let selectedObject = NetworkObject[listName + 'List'][idx];
    
    clickOnMarker(selectedObject, listName, 0);
}

//resets the styling of the previously selected feature and sets the new styling of the now selected feature
function resetStyle(target, feature) {
    let zoomLevel = 14;
    if(feature == 'bus' || feature == 'ext_grid') {
        map.setView(target.getLatLng(), Math.max(map.getZoom(), zoomLevel));
    }
    else {
        map.setView(target.getLatLngs()[0], Math.max(map.getZoom(), zoomLevel));
    }

    if(clicked) {
        let oldStyle = NetworkObject[clicked[1] + 'Styles'];
        //makes sure the list that holds the previously selected feature deselects all options
        if(clicked[1] != feature) {
            document.getElementById(clicked[1] + 'Select').value = "";
        }
        clicked[0].setStyle(oldStyle[1]);
    }
    target.setStyle(NetworkObject[feature + 'Styles'][0]);
    clicked = [target, feature];

    let featureList = NetworkObject[feature + 'List'];
    let selectedList = document.getElementById(feature + "Select");
    let newIndex = featureList.findIndex((entry) => entry === target);
    selectedList.selectedIndex = newIndex;
}

//When clicking on a map element or making a selection from a list, we highlight the relevant element, open the Editor window and fill its input fields with the relevant values
function clickOnMarker(target, feature, drawModeOverride) {
    if((!map.pm.globalDrawModeEnabled()) || drawModeOverride) {
        //resets previously selected markers
        resetStyle(target, feature);

        let selectedButton = document.getElementById(feature + "ListButton");
        selectedButton.click();

        let editorcontent = document.getElementsByClassName('feature-editor__selected-feature-editor');
        for (i = 0; i < editorcontent.length; i++) {
            editorcontent[i].style.display = "none";
        }

        document.getElementById(feature + 'Editor').style.display = 'inline-block';

        let editor_form = document.getElementById(feature + 'Form');
        let editor_divs = editor_form.children;

        for (let i = 0; i < editor_divs.length; i++) {
            let editor_elems = editor_form.children[i].children;
            let target_properties = target.feature.properties
            
            //At the moment we know that only busses have more than one div and we know that load is the second, sgen the third div 
            //TODO: Change this to work regardless of network structure
            if(feature == 'bus') {
                if (i == 1) {
                    target_properties = target.feature.properties.load;
                    if(Object.keys(target_properties).length === 0) {
                        document.getElementById('loadFormDiv').style.display = 'none';
                    }
                    else {
                        document.getElementById('loadFormDiv').style.display = 'block';
                    }
                }
                if (i == 2) {
                    target_properties = target.feature.properties.sgen;
                    if(Object.keys(target_properties).length === 0) {
                        document.getElementById('sgenFormDiv').style.display = 'none';
                    }
                    else {
                        document.getElementById('sgenFormDiv').style.display = 'block';

                    }
                }
            }
            //features can have a std_type input and other input fields related to that std_type. Std_type properties should only be editable via the std_type list
            //for all features that correspond to the std_type, the properties are still added as read-only, while std_types are selectable from a dropdown menu
            let selectedStdType;
            for (let i = 0; i < editor_elems.length; i++) {
                if (editor_elems[i].nodeName == 'INPUT') {
                    if(target_properties[editor_elems[i].name] != null) {
                        editor_elems[i].value = target_properties[editor_elems[i].name];
                    }
                    else {
                        editor_elems[i].value = '';
                    }
                }
                if (editor_elems[i].nodeName == 'SELECT') {
                    selectedStdType = target.feature.properties['std_type']

                    for (let j = 0; j < editor_elems[i].options.length; j++) {
                        if (editor_elems[i].options[j].text == selectedStdType) {
                            editor_elems[i].selectedIndex = j;
                            break;
                        }
                    }
                    let k = 1;
                        for (idx in NetworkObject[feature + '_stdList'][selectedStdType]) {
                            if(feature == 'trafo') {
                                //console.log(idx, editor_elems[i+k+1].name);
                            }
                            if(NetworkObject[feature + '_stdList'][selectedStdType][editor_elems[i+k+1].name] != undefined) {
                                editor_elems[i+k+1].value = NetworkObject[feature + '_stdList'][selectedStdType][editor_elems[i+k+1].name];
                            }
                            k += 2; // + 2 because we need to skip the label elements
                        }
                    i += k;
                }
            }
        }
    }
}

//onchange function for editor view. If a field is changed, its new value is written back to the relevant object
function writeBackEditedNetworkFeature(target, targetDiv) {
    let feature = target.parentElement.id.replace("FormDiv", "");
    let load_sgen_flag = 0;
    if(feature == 'load' || feature == 'sgen') {
        load_sgen_flag = (feature == 'load') * 1 +  (feature == 'sgen') * 2
        feature = 'bus';
    }
    let idxInFeatureList = document.getElementById(feature + "Select").selectedIndex
    let featureName = target.id

    //console.log(feature, featureName, idxInFeatureList, target.value);

    // TODO: Fix Std-type wrriteback
    if(!feature.includes("std")) {
        if(load_sgen_flag == 0) {
            NetworkObject[feature + "List"][idxInFeatureList].feature.properties[featureName] = target.value;
            //console.log(NetworkObject[feature + "List"][idxInFeatureList].feature.properties[featureName]);
        }
        else if (load_sgen_flag == 1) {
            NetworkObject[feature + "List"][idxInFeatureList].feature.properties.load[featureName] = target.value;
            //console.log(NetworkObject[feature + "List"][idxInFeatureList].feature.properties.load[featureName]);
        }
        else if (load_sgen_flag ==2) {
            NetworkObject[feature + "List"][idxInFeatureList].feature.properties.sgen[featureName] = target.value;
            //console.log(NetworkObject[feature + "List"][idxInFeatureList].feature.properties.sgen[featureName]);
        }
    }
    else {
        let selectedElement = document.getElementById(feature + "Select")[idxInFeatureList].value;
        feature = feature.replace("_types", "");
        //console.log(selectedElement);
        NetworkObject[feature + "List"][selectedElement][featureName] = target.value;
    }
}

//Purely for debug atm, we will want to keep feature information within the markers themselves
//might be worth considering to display the editor window via the popup (visually too messy?)
function createPopup(feature, layer) {
    var popup = L.popup();
    popup.setContent(
        "Index: " + feature.properties.index + "<br>" 
        + "Name: " + feature.properties.name + "<br>" 
    );
    layer.bindPopup(popup);
}

//DEMAND STUFF

function populateDemandEditor (demand_data, demandName, demandIndex) {
    let testDiv = document.getElementById(demandName + "Panel")
    for (key in demand_data) {

        if(key > 100) {
          break;
        }

        let checkbox = document.createElement('INPUT');
        checkbox.setAttribute("type", "checkbox");
        checkbox.setAttribute("name", "checkbox_" + key);
        checkbox.setAttribute("onclick", "check_uncheck_demand(this, '" + demandName + "', " + key + ", '" + demandIndex + "')");
        
        let label = document.createElement('LABEL')
        label.appendChild(checkbox);
        label.insertAdjacentHTML("beforeend", key)
        label.for = "checkbox_" + key;

        testDiv.appendChild(label);
    }
}

function fillSelectedFeatureDemandEditor() {

}

function check_uncheck_demand(checkbox, demand_type, key, demandIndex) {
  if (checkbox.checked) {
    let data = DemandObject[demand_type][key];
    delete data['t'];

    let newgraph = {
      name: '' + key,
      type: 'line',
      stack: 'Total',
      areaStyle: {},
      emphasis: {
        focus: 'series'
      },
      data: Object.values(data)
    };
    let option = charts[demandIndex].getOption();
    option.series.push(newgraph);
    option.legend[0].data.push(newgraph.name);
    charts[demandIndex].setOption(option);
  }
  else {
    let option = charts[demandIndex].getOption();
    let index = option.series.findIndex(data => data.name === 'Test' + checkbox.name);
    option.series.splice(index, 1);

    index = option.legend[0].data.findIndex(name => name === 'Test' + checkbox.name);
    option.legend[0].data.splice(index, 1);

    charts[demandIndex].setOption(option, true);
  }
}

var acc = document.getElementsByClassName("accordion");
var i;

for (i = 0; i < acc.length; i++) {
  acc[i].addEventListener("click", function() {
    /* Toggle between adding and removing the "active" class,
    to highlight the button that controls the panel */
    this.classList.toggle("active");

    /* Toggle between hiding and showing the active panel */
    var panel = this.nextElementSibling;
    if (panel.style.display === "block") {
      panel.style.display = "none";
    } else {
      panel.style.display = "block";
    }
  });
}


function addData(chart, label, data) {
  chart.data.labels.push(label);
  chart.data.datasets.forEach((dataset) => {
      dataset.data.push(data);
  });
  chart.update();
}

function removeData(chart) {
  chart.data.labels.pop();
  chart.data.datasets.forEach((dataset) => {
      dataset.data.pop();
  });
  chart.update();
}

let charts = [];

let graphs = document.getElementsByClassName("feature-editor__selected-feature-editor__demand__graph");
for (let i = 0; i < graphs.length; i++) {
    var myChart = echarts.init(graphs[i]);
    // Specify the configuration items and data for the chart
    var option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
          }
        },
        legend: {
          data: []
        },
        toolbox: {
          feature: {
            saveAsImage: {}
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            boundaryGap: false,
            data: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56]
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ],
        series: []
      };

    // Display the chart using the configuration items and data just specified.
    myChart.setOption(option);
    charts.push(myChart);
}