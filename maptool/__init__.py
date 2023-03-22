#-----------------------------CRUCIAL PYTHON TODOS-----------------------------#
# TODO: receive final pandapower net and verify correctness
# TODO: add interaction with urbs tool

import sys
import os

from syngrid.GridGenerator import GridGenerator
import pandapower as pp
import pandapower.networks as nw
from pandapower.plotting.plotly.mapbox_plot import geo_data_to_latlong

from .display_pdpw_networks import getTestNetwork
from flask import Flask, render_template, jsonify, request, session

def create_app(test_config=None):
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_mapping(
        SECRET_KEY='dev',
    )

    plz = ''

    if test_config is None:
        # load the instance config, if it exists, when not testing
        app.config.from_pyfile('config.py', silent=True)
    else:
        # load the test config if passed in
        app.config.from_mapping(test_config)
    
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass


    #On first opening, display postal code selection gui
    @app.route('/')
    def home():
        return render_template('postcode.html')
    
    #When user submits postal code or area selection in gui we return the corresponding postal code area boundary
    @app.route('/postcode', methods=['GET', 'POST'])
    def postcode():
        if request.method == 'POST':
            plz = {'key' : request.get_json()}
            session['plz'] = plz
            gg = GridGenerator(plz=request.get_json())
            pg = gg.pgr
            postcode_gdf = pg.getGeoDataFrame(table="postcode_result", id=request.get_json()).to_crs(epsg=4326)
            postcode_boundary = postcode_gdf.boundary.to_json()

            return postcode_boundary
    

    @app.route('/postcode/nets', methods=['GET', 'POST'])
    def postcodeNets():
        #once the user has selected a preview net, he submits the corresponding kcid and bcid
        if request.method == 'POST':
            kcid_bcid = {'key' : request.get_json()}
            session['kcid_bcid'] = kcid_bcid
            return 'Success', 200
        
        #After receiving the postal code boundary the js code requests all nets of the selected version and plz
        if request.method == 'GET':
            plz = session.get('plz')['key']
            gg = GridGenerator(plz=plz)
            pg = gg.pgr

            versions = pg.getAllVersionsofPLZ(plz)
            print("VERSIONS: ", versions[0][0])

            nets = pg.getAllNetsOfVersion(plz, versions[0][0])
            netList = []

            for kcid, bcid, grid in nets:
                netList.append([kcid, bcid, pp.to_json(grid)]) 

            return netList
    
    #once the Select Network button is pressed, we return the editable network view 
    @app.route('/networks', methods=['GET', 'POST'])
    def networks():
        return render_template('home.html')

    @app.route('/networks/editableNetwork', methods=['GET', 'POST'])
    def editableNetwork():
        #on opening of the network view the js code requests full information of the previously selected network
        if request.method == 'GET':
            # plz = session.get('plz')['key']
            # kcid_bcid = session.get('kcid_bcid')['key']
            # gg = GridGenerator(plz=plz)
            # pg = gg.pgr
            # testnet = pg.read_net(plz=plz, kcid=kcid_bcid[0], bcid=kcid_bcid[1])

            testnet = nw.mv_oberrhein()
            geo_data_to_latlong(testnet, projection='epsg:31467')
            net = pp.to_json(testnet)
            return net

        if request.method == 'POST':
            #print(request.get_json())
            return 'Success', 200
    return app


    