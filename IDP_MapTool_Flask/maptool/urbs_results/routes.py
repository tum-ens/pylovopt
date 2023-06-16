import json
import pandas as pd
import pandapower as pp
import os

from bs4 import BeautifulSoup
from maptool.urbs_editor import bp
from flask import Flask, render_template, request, session
from maptool.network_editor.generateEditableNetwork import createGeoJSONofNetwork
from maptool.urbs_results.urbs_results_plotting import *

#return main site html
@bp.route('/urbs_results', methods=['GET', 'POST'])
def urbs_results_setup():
    return render_template('urbs_results/index.html')

#loads and returns the network geojson collection of the previous steps
@bp.route('/urbs_results/editableNetwork', methods=['GET', 'POST'])
def urbs_resultsNetwork():
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

#manages generation and returning of the html divs containing plotted data 
@bp.route('/urbs_results/plots', methods=['GET', 'POST'])
def urbs_results_generate_plot():
    if request.method == 'POST':
        print(os.getcwd())
        data_path = request.get_json()['type']
        feature_name_dict = request.get_json()['name']
        print(feature_name_dict)
        hdf_path = '../urbs_optimizer/result/Trans-Dist-20230613T1603/flex_all_tsam_coordinated_flexible_step1.h5'
        if data_path == 'bus':
            feature_name = feature_name_dict['bus']
            print(data_path, feature_name)
            #cap_pro_generate_plot(hdf_path=hdf_path, site_name=feature_name)
            #e_pro_in_generate_plot(hdf_path=hdf_path, site_name=feature_name)
            #e_pro_out_generate_plot(hdf_path=hdf_path, site_name=feature_name)
        if data_path == 'line':
            feature_name_from = feature_name_dict['from_bus']
            feature_name_to = feature_name_dict['to_bus']
            print(data_path, feature_name_from, feature_name_to)
        return_json = {}

        return return_json