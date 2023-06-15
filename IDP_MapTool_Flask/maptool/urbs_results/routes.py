import json
import pandas as pd
import pandapower as pp
from maptool.urbs_editor import bp
from flask import Flask, render_template, request, session
from maptool.network_editor.generateEditableNetwork import createGeoJSONofNetwork
from maptool.urbs_results.urbs_results_plotting import *

@bp.route('/urbs_results', methods=['GET', 'POST'])
def urbs_results_setup():
    return render_template('urbs_results/index.html')

@bp.route('/urbs_results/editableNetwork', methods=['GET', 'POST'])
def urbs_resultsNetwork():
    #on opening of the network view the js code requests full information of the previously selected network
    #we return the network with previously chosen and session-dependant plz, kcid and bcid with all features
    if request.method == 'GET':
        #--------------------------------COMMENT OUT IF DATABASE CONNECTION DOES NOT WORK--------------------------------#
        testnet = pp.from_excel("pandapower2urbs\\dataset\\_transmission\\test.xlsx")
        #--------------------------------COMMENT OUT IF DATABASE CONNECTION DOES NOT WORK--------------------------------#

        #--------------------------------PURELY FOR DEBUG OR MISSING DATABASE CONNECTION--------------------------------#
        #from maptool import net as testnet
        #from .generateEditableNetwork import createFeatures
        #createFeatures(False, pp.from_json(testnet), 'bus',0,0,0)
        #return pp.to_json(testnet)
        #--------------------------------PURELY FOR DEBUG OR MISSING DATABASE CONNECTION--------------------------------#

        json_net = createGeoJSONofNetwork(testnet, True, True, True, True, True)
        json_net = json.dumps(json_net, default=str, indent=6)
        return json_net

@bp.route('/urbs_results/plots', methods=['GET', 'POST'])
def urbs_results_generate_plot():
    if request.method == 'POST':
        data_path = request.get_json()['type']
        feature_name = request.get_json()['name']
        
        return_json = {}

        return return_json