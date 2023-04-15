from maptool.demand_editor import bp
from flask import Flask, render_template, request, session
from syngrid.GridGenerator import GridGenerator
import pandapower as pp
import pandas as pd
import os
from .generateEditableNetwork import createGeoJSONofNetwork
import json


#When user submits postal code or area selection in gui we return the corresponding postal code area boundary
@bp.route('/demand', methods=['GET', 'POST'])
def demand():
    print("test")
    return render_template('demand_editor/index.html')

@bp.route('/demand/editableNetwork', methods=['GET', 'POST'])
def editableNetwork():
    #on opening of the network view the js code requests full information of the previously selected network
    #we return the network with previously chosen and session-dependant plz, kcid and bcid with all features
    if request.method == 'GET':
        plz = session.get('plz')['value']
        kcid_bcid = session.get('kcid_bcid')['value']
        gg = GridGenerator(plz=plz)
        pg = gg.pgr
        testnet = pg.read_net(plz=plz, kcid=kcid_bcid[0], bcid=kcid_bcid[1])

        #--------------------------------PURELY FOR DEBUG--------------------------------#
        #from maptool import net as testnet
        #from .generateEditableNetwork import createFeatures
        #createFeatures(False, pp.from_json(testnet), 'bus',0,0,0)
        #--------------------------------PURELY FOR DEBUG--------------------------------#
        #return pp.to_json(testnet)
        json_net = createGeoJSONofNetwork(testnet)
        json_net = json.dumps(json_net, default=str, indent=6)
        return json_net

    if request.method == 'POST':
        #print(request.get_json())
        return 'Success', 200
    
@bp.route('/demand/demand_profiles', methods=['GET', 'POST'])
def demandProfiles():
    demand_electricity = pd.read_csv(os.path.join(os.getcwd(), 'pandapower2urbs/dataset/demand/profiles/electricity.csv'), sep=',').T
    demand_electricity_reactive = pd.read_csv(os.path.join(os.getcwd(),'pandapower2urbs/dataset/demand/profiles/electricity-reactive.csv'), sep=',').T
    demand_mobility = pd.read_csv(os.path.join(os.getcwd(),'pandapower2urbs/dataset/demand/profiles/mobility.csv'), sep=',').T
    demand_space_heat = pd.read_csv(os.path.join(os.getcwd(),'pandapower2urbs/dataset/demand/profiles/space_heat.csv'), sep=',').T
    demand_water_heat = pd.read_csv(os.path.join(os.getcwd(),'pandapower2urbs/dataset/demand/profiles/water_heat.csv'), sep=',').T

    demand_json = {"demand_electricity" : demand_electricity.to_json(),
            "demand_electricity_reactive" : demand_electricity_reactive.to_json(),
            "demand_mobility" : demand_mobility.to_json(), 
            "demand_space_heat" : demand_space_heat.to_json(),
            "demand_water_heat" : demand_water_heat.to_json()
            }

    return demand_json