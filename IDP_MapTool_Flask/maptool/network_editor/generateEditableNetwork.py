# //function generates GeoJSON for a given feature (i.e. bus, line, trafo, ext_grid)
# function createFeatures(isLines, ppdata, featureName, featureProperties, propertyGroupNames, propertyGroupFeatures) {
#     let input_geoJSON = {"type" : "FeatureCollection", "features": []};     
    
#     let input = ppdata['_object'][featureName];
#     let input_data = JSON.parse(input['_object'])['data'];
#     let input_indices = JSON.parse(input['_object'])['index'];
#     let input_columns = JSON.parse(input['_object'])['columns'];
    
#     let input_geodata = {};
#     let input_geoCoords = {};
#     let input_geoIndices = {};

#     if(featureName == 'bus' || featureName == 'line') {
#         input_geodata = ppdata['_object'][featureName + '_geodata'];
#         input_geoCoords = JSON.parse(input_geodata['_object'])['data'];
#         input_geoIndices = JSON.parse(input_geodata['_object'])['index'];
#     }
#     //(ext_grid and trafo geolocation depend on geolocation of buses)
#     else {
#         let input_columns = JSON.parse(input['_object'])['columns'];
#         let idx = [0, 0];
#         let temp = [];

#         input_geodata = ppdata['_object']['bus_geodata'];
#         input_geoCoords = JSON.parse(input_geodata['_object'])['data'];
#         input_geoIndices = JSON.parse(input_geodata['_object'])['index'];

#         if(featureName == 'ext_grid') {
#             idx[0] = input_columns.indexOf('bus', 0);
#             for (entry in input_data) {
#                  for (geo_entry in input_geoIndices) {
#                      if (input_data[entry][idx[0]] == input_geoIndices[geo_entry]) {
#                          temp.push(input_geoCoords[geo_entry]);
#                          break;
#                      }
     
#                  }
#              }
#         }
#         else if (featureName == 'trafo') {
#             idx[0] = input_columns.indexOf('hv_bus', 0);
#             idx[1] = input_columns.indexOf('lv_bus', 0);
#             tempLine = [];
           
#             for (entry in input_data) {
#                 tempLine = [];
#                  for (let geo_entry = 0; geo_entry < input_geoIndices.length; geo_entry++) {
#                      if (input_data[entry][idx[0]] == input_geoIndices[geo_entry]) {
#                         let x1 = [input_geoCoords[geo_entry][0], input_geoCoords[geo_entry][1]];
#                         tempLine.push(x1);

#                         for (let second_entry = 0; second_entry < input_geoIndices.length; second_entry++) {
#                             if (input_data[entry][idx[1]] == input_geoIndices[second_entry]) {
#                                 let x2 = [input_geoCoords[second_entry][0], input_geoCoords[second_entry][1]]
#                                 tempLine.push(x2);
#                                 break;
#                             }
#                         }
#                         temp.push([tempLine]);
#                         break;
#                      }
#                  }
#              }
#         }
#         input_geoCoords = temp;
#     }
#     let currentFeatureProperties = {};

#     for (point in input_geoCoords) {
#         currentFeatureProperties = {};

#         let inputCoordinates = [];
#         if(isLines) {
#             for (i in input_geoCoords[point]) {
#                 inputCoordinates.push(input_geoCoords[point][i]);
#             }
#         }
#         else {
#             inputCoordinates = [input_geoCoords[point][0], input_geoCoords[point][1]];
#         }

#         //corresponding index value associated with the bus
#         let pointIndex = input_geoIndices[point];
#         let pointNameIndex = (input_indices.indexOf(pointIndex, 0) != -1) ? input_indices.indexOf(pointIndex, 0) : pointIndex;

#         if(featureProperties != null) {
#             currentFeatureProperties.index = pointIndex;
#             for (property in featureProperties) {
#                 currentFeatureProperties[featureProperties[property]] = (input_columns.indexOf(featureProperties[property], 0) == -1) ? null : input_data[pointNameIndex][input_columns.indexOf(featureProperties[property], 0)];
#             }
#         }

#         //we add load, switch etc as subproperties on one of our main features
#         if(propertyGroupNames != null && propertyGroupFeatures != null) {
#             for (let property = 0; property < propertyGroupNames.length; property++) {
#                 let propertyGroup = ppdata['_object'][propertyGroupNames[property]];
#                 let extractedProperties = extractPropertiesFromNet(propertyGroup, pointIndex, propertyGroupFeatures[property])
#                 currentFeatureProperties[propertyGroupNames[property]] = extractedProperties;
#             }
#         }

#         let feature = { "type": "Feature", 
#                         "geometry": {"type": (isLines) ? "LineString" : "Point", "coordinates": (isLines) ? inputCoordinates[0] : inputCoordinates}, 
#                         "properties": currentFeatureProperties
#                     };
#         input_geoJSON.features.push(feature);
#     }
#     return input_geoJSON;
# }

# import pandas as pd



import pandapower as pp
import pandapower.networks as nw
from pandapower.plotting.plotly.mapbox_plot import geo_data_to_latlong
testnet = nw.mv_oberrhein()
geo_data_to_latlong(testnet, projection='epsg:31467')

net = pp.to_json(testnet)

def createFeatures (isLines, ppdata, featureName, featureProperties, propertyGroupNames, propertyGroupFeatures):
    input_data = ppdata[featureName]
    input_indices = input_data.index
    input_columns = input_data.columns

    input_geoCoords = {}
    input_geoIndices = {}

    if featureName == 'bus' or featureName == 'line':
        input_geoCoords = ppdata[featureName + '_geodata']
        input_geoIndices = input_geoCoords.index
    else:
        input_geoCoords = ppdata.bus_geodata
        input_geoIndices = input_geoCoords.index

        idx = [0,0]
        temp = []

        if featureName == 'ext_grid' :
            print("heyo")

createFeatures(False, testnet, 'line', '', '', '')
createFeatures(False, testnet, 'bus', '', '', '')
createFeatures(False, testnet, 'trafo', '', '', '')
createFeatures(False, testnet, 'ext_grid', '', '', '')
