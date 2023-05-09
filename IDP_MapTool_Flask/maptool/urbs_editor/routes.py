from maptool.urbs_editor import bp
from flask import Flask, render_template, request, session
from syngrid.GridGenerator import GridGenerator
import pandapower as pp
import pandas as pd
import os
from maptool.network_editor.generateEditableNetwork import createGeoJSONofNetwork
import json


#When user submits postal code or area selection in gui we return the corresponding postal code area boundary
@bp.route('/urbs', methods=['GET', 'POST'])
def urbs_setup():
    print("test")
    return render_template('urbs_editor/index.html')

@bp.route('/urbs/urbs_setup_properties', methods=['GET', 'POST'])
def urbs_setup_properties():
    if request.method == 'GET':
        f = open('maptool\\z_feature_jsons\\urbs_setup_features\\urbs_setup_features.json', 'r')
        urbs_setup_props = json.load(f)
        return urbs_setup_props

@bp.route('/urbs/editableNetwork', methods=['GET', 'POST'])
def editableNetwork():
    #on opening of the network view the js code requests full information of the previously selected network
    #we return the network with previously chosen and session-dependant plz, kcid and bcid with all features
    if request.method == 'GET':
        plz = session.get('plz')['value']
        kcid_bcid = session.get('kcid_bcid')['value']
        plz_version = session['plz_version']
        gg = GridGenerator(plz=plz, version_id=plz_version)
        pg = gg.pgr
        testnet = pg.read_net(plz=plz, kcid=kcid_bcid[0], bcid=kcid_bcid[1])

        #--------------------------------PURELY FOR DEBUG--------------------------------#
        #from maptool import net as testnet
        #from .generateEditableNetwork import createFeatures
        #createFeatures(False, pp.from_json(testnet), 'bus',0,0,0)
        #--------------------------------PURELY FOR DEBUG--------------------------------#
        #return pp.to_json(testnet)
        json_net = createGeoJSONofNetwork(testnet, True, True, True, True, True)
        json_net = json.dumps(json_net, default=str, indent=6)
        return json_net

    if request.method == 'POST':
        #print(request.get_json())
        return 'Success', 200
    
@bp.route('/urbs/demand_profiles', methods=['GET', 'POST'])
def demandProfiles():
    demand_electricity = pd.read_csv(os.path.join(os.getcwd(), 'pandapower2urbs/dataset/demand/profiles/electricity.csv'), sep=',')
    demand_electricity_reactive = pd.read_csv(os.path.join(os.getcwd(),'pandapower2urbs/dataset/demand/profiles/electricity-reactive.csv'), sep=',')
    demand_mobility = pd.read_csv(os.path.join(os.getcwd(),'pandapower2urbs/dataset/demand/profiles/mobility.csv'), sep=',')
    demand_space_heat = pd.read_csv(os.path.join(os.getcwd(),'pandapower2urbs/dataset/demand/profiles/space_heat.csv'), sep=',')
    demand_water_heat = pd.read_csv(os.path.join(os.getcwd(),'pandapower2urbs/dataset/demand/profiles/water_heat.csv'), sep=',')

    demand_json = {"demand_electricity" : demand_electricity.to_json(),
            "demand_electricity_reactive" : demand_electricity_reactive.to_json(),
            "demand_mobility" : demand_mobility.to_json(), 
            "demand_space_heat" : demand_space_heat.to_json(),
            "demand_water_heat" : demand_water_heat.to_json()
            }

    return demand_json

@bp.route('/urbs/demand_setup', methods=['GET', 'POST'])
def formatDemandSetup():
    if request.method == 'POST':
        # print(request.get_json())
        # f = open('demand_ouput_test.json', 'w')
        # json.dump(request.get_json(), f)
        # f.close()
        # TODO: extract demand info, save json in session and generate csv file
        return 'Success', 200
    


@bp.route('/urbs/buildings_setup', methods=['GET', 'POST'])
def formatBuildingsSetup():
    
    # TODO: Create csvs from data
    
    if request.method == 'POST':
        buildings_user_data = json.loads(request.get_json())

        plz = session.get('plz')['value']
        kcid_bcid = session.get('kcid_bcid')['value']
        plz_version = session['plz_version']
        gg = GridGenerator(plz=plz, version_id=plz_version)
        pg = gg.pgr
        testnet = pg.read_net(plz=plz, kcid=kcid_bcid[0], bcid=kcid_bcid[1])

        buildings_osm_id_list = []

        
        for entry in buildings_user_data:
            buildings_osm_id = pg.test__getBuildingOfBus(plz, entry['x'], entry['y'])
            
            if buildings_osm_id:
                buildings_osm_id_list.append(buildings_osm_id)

        buildings_data_aggregator = []
        for osm_id in buildings_osm_id_list:
            additional_data = pg.test_getAdditionalBuildingData(osm_id)
            buildings_data_aggregator.append(additional_data)

        buildings_data = pd.DataFrame(buildings_data_aggregator,columns=['area', 'type', 'peak_load_in_kw', 'free_walls_res','free_walls_oth', 'floors', 'houses_per_building'])
        buildings_data = buildings_data.join(pd.DataFrame.from_dict(buildings_user_data))
        print(buildings_data.columns)
        # f = open('buildings_ouput_test.json', 'w')
        # json.dump(buildings_data.to_json(orient="split"), f, indent=6)
        # f.close()
        return 'Success', 200
    
@bp.route('/urbs/process_profiles', methods=['GET', 'POST'])
def formatProcessSetup():
    pro_prop = pd.read_csv(os.path.join(os.getcwd(), 'pandapower2urbs/dataset/process/pro_prop.csv'), sep=',')
    pro_com_prop = pd.read_csv(os.path.join(os.getcwd(),'pandapower2urbs/dataset/process/pro_com_prop.csv'), sep=',')
    print(pro_com_prop.columns)
    process_json = {
        "pro_prop" : pro_prop.to_json(),
        "pro_com_prop" : pro_com_prop.to_json(),
        }

    return process_json

@bp.route('/urbs/storage_profiles', methods=['GET', 'POST'])
def formatStorageSetup():
    sto_prop = pd.read_csv(os.path.join(os.getcwd(), 'pandapower2urbs/dataset/storage/sto_prop.csv'), sep=',')
    storage_json = {
        "sto_prop" : sto_prop.to_json(),
        }

    return storage_json


@bp.route('/urbs/commodity_profiles', methods=['GET', 'POST'])
def formatCommoditySetup():
    com_prop = pd.read_csv(os.path.join(os.getcwd(), 'pandapower2urbs/dataset/commodity/com_prop.csv'), sep=',')
    commodity_json = {
        "com_prop" : com_prop.to_json(),
        }

    return commodity_json