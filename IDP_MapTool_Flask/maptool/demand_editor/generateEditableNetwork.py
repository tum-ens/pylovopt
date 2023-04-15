import pandas as pd
import json

line_std_properties = ["r_ohm_per_km", "x_ohm_per_km", "max_i_ka", "c_nf_per_km", "q_mm2", "type", "alpha"]
trafo_std_properties = ["sn_mva", "vn_hv_kv", "vn_lv_kv", "vk_percent", "vkr_percent", "pfe_kw", "i0_percent", "shift_degree", "tap_side", "tap_neutral", "tap_min", "tap_max", "tap_step_percent", "tap_step_degree", "tap_phase_shifter"]
trafo3w_std_properties = ["sn_hv_mva","sn_mv_mva","sn_lv_mva","vn_hv_kv", "vn_mv_kv","vn_lv_kv","vk_hv_percent", "vk_mv_percent","vk_lv_percent","vkr_hv_percent","vkr_mv_percent","vkr_lv_percent","pfe_kw","i0_percent","shift_mv_degree","shift_lv_degree","tap_side","tap_neutral","tap_min","tap_max","tap_step_percent"]

line_properties = ["name","from_bus", "to_bus","length_km", "r0_ohm_per_km", "x0_ohm_per_km", "c0_nf_per_km","df","g_us_per_km", "g0_us_per_km","parallel","max_loading_percent","temperature_degree_celsius", "tdpf","wind_speed_m_per_s", "wind_angle_degree", "conductor_outer_diameter_m", "air_temperature_degree_celsius","reference_temperature_degree_celsius", "solar_radiation_w_per_sq_m", "solar_absorptivity", "emissivity", "r_theta_kelvin_per_mw", "mc_joule_per_m_k", "std_type"]

ext_grid_properties = ["name", "bus", "vm_pu", "va_degree", "s_sc_max_mva", "s_sc_min_mva", "rx_max", "rx_min", "max_p_mw", "max_p_mw", "max_q_mvar", "min_q_mvar", "r0x0_max", "x0x_max", "slack_weight", "controllable", "in_service"]

bus_properties =  ["name","vn_kv","type","in_service", "max_vm_pu","min_vm_pu",]    
load_features = ['name', 'p_mw', 'q_mvar','max_p_mw', 'min_p_mw', 'max_q_mvar', 'min_q_mvar', 'const_z_percent', 'const_i_percent', 'sn_mva', 'scaling', 'in_service', 'type', 'controllable']
sgen_features = ['name', 'p_mw', 'q_mvar', 'max_p_mw', 'min_p_mw', 'max_q_mvar', 'min_q_mvar', 'sn_mva', 'scaling', 'in_service', 'type', 'current_source', 'k', 'rx', 'generator_type', 'lrc_pu', 'max_ik_ka', 'kappa', 'controllable']
switch_features = ['name', 'element', 'et', 'type', 'closed', 'z_ohm', 'in_ka']

trafo_properties = ["name", "hv_bus", "lv_bus", "vk0_percent", "vkr0_percent", "mag0_percent", "mag0_rx", "si0_hv_partial", "tap_pos", "in_service", "max_loading_percent", "parallel", "df", "tap_dependent_impedance", "vk_percent_characteristic", "vkr_percent_characteristic", "xn_ohm", "std_type"]

def extractPropertiesFromNet(input, index, properties):
    if input.empty:
        return {}
    
    output = {}
    input = input.fillna('')

    for entry in input:
        output[entry] = input.T.loc[entry].iloc[0]
    
    return output

def createFeatures (isLines, ppdata, featureName, featureProperties, propertyGroupNames, propertyGroupFeatures):
    input_data = ppdata[featureName]
    input_data = input_data.fillna('')
    input_geoCoords = pd.DataFrame()

    if featureName == 'bus' or featureName == 'line':
        input_geoCoords = ppdata[featureName + '_geodata']
        if featureName == 'bus':
            input_geoCoords = input_geoCoords.drop(['coords'], axis=1)

    else:
        input_geoCoords = ppdata.bus_geodata
        temp = pd.DataFrame()

        if featureName == 'ext_grid' :
            for bus in input_data['bus']:
                #print(input_geoCoords.T[bus].to_frame().T)
                ext_geocoords = input_geoCoords.T[bus].to_frame().T
                temp = pd.concat([temp, ext_geocoords], ignore_index=True)
            temp = temp.drop(['coords'], axis=1)

        elif featureName == 'trafo':
            i = 0
            for hv_bus, lv_bus in zip(input_data['hv_bus'], input_data['lv_bus']):
                hv_geocoords = input_geoCoords.T[hv_bus]
                lv_geocoords = input_geoCoords.T[lv_bus]
                tempLine = pd.Series(data={'hv_bus' : [hv_geocoords.x, hv_geocoords.y], 'lv_bus' : [lv_geocoords.x, lv_geocoords.y]}).to_frame().T
                temp = pd.concat([temp, tempLine], ignore_index=True)
                # hv_geocoords = input_geoCoords.T[hv_bus].to_frame().T
                # lv_geocoords = input_geoCoords.T[lv_bus].to_frame().T
                # hv_geocoords = hv_geocoords.rename(columns={'x' : 'x' + str(i), 'y' : 'y' + str(i)})
                # lv_geocoords = lv_geocoords.rename(columns={'x' : 'x' + str(i), 'y' : 'y' + str(i)})
                # temp = pd.concat([temp, pd.concat([hv_geocoords, lv_geocoords], ignore_index=True)], axis=1)
                #i += 1
            #temp = temp.drop(['coords'], axis=1)
        input_geoCoords = temp
        #return input_geoCoords

    input_geoJSON = {"type" : "FeatureCollection", "features": []}

    for point in input_geoCoords.T:
        currentFeatureProperties = {}
        index = 0
        if featureProperties:
            index = point if (featureName == 'bus' or featureName == 'line') else input_data.index[point]
            currentFeatureProperties["index"] = index
            
            for property in featureProperties:
                if property in input_data:
                    currentFeatureProperties[property] = input_data.loc[index][property]
                else:
                    currentFeatureProperties[property] = ""

        if propertyGroupNames and propertyGroupFeatures:
            for property in propertyGroupNames:
                if property in ppdata:
                    try:
                        propertyGroup = ppdata[property].loc[ppdata[property].bus == index]
                    except KeyError:
                        propertyGroup = pd.DataFrame()
                extractedProperties = extractPropertiesFromNet(propertyGroup, index, propertyGroupFeatures[propertyGroupNames.index(property)])
                currentFeatureProperties[property] = extractedProperties
        #return 0
        inputCoordinates = input_geoCoords.loc[point].tolist() 
        if featureName == 'line':
            inputCoordinates = inputCoordinates[0]   
        feature = { "type": "Feature", 
                        "geometry": {"type": "LineString" if isLines else "Point", 
                                     "coordinates": inputCoordinates}, 
                        "properties": currentFeatureProperties
                    }
        input_geoJSON["features"].append(feature)
    return input_geoJSON

def extractStdTypes(ppdata):
    return json.dumps(ppdata.std_types)


def createGeoJSONofNetwork(net):
    output = {}
    output['bus'] = createFeatures(False, net, 'bus', bus_properties, ['load', 'sgen', 'switch'], [load_features, sgen_features, switch_features])
    output['trafo'] = createFeatures(True, net, 'trafo', trafo_properties, '', '')
    output['line'] = createFeatures(True, net, 'line', line_properties, '', '')
    output['ext_grid'] = createFeatures(False, net, 'ext_grid', ext_grid_properties, '', '')
    output['std_types'] = extractStdTypes(net)

    return output