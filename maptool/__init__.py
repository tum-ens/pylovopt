#-----------------------------CRUCIAL PYTHON TODOS-----------------------------#
# TODO: receive final pandapower net and verify correctness
# TODO: add interaction with syngrid tool
# TODO: add interaction with urbs tool

import sys
import os

from syngrid.GridGenerator import GridGenerator
from syngrid import pgReaderWriter
import geopandas as gpd
import pandapower as pp

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


    # a simple page that says hello
    @app.route('/')
    def home():
        return render_template('postcode.html')
    

    @app.route('/postcode', methods=['GET', 'POST'])
    def postcode():
        if request.method == 'POST':
            plz = {'key' : request.get_json()}
            session['plz'] = plz

            return 'Success', 200

        if request.method == 'GET':
            plz = session.get('plz')['key']
            gg = GridGenerator(plz=plz)
            pg = gg.pgr
            postcode_gdf = pg.getGeoDataFrame(table="postcode_result", id=plz).to_crs(epsg=4326)
            postcode_boundary = postcode_gdf.boundary.to_json()

            return postcode_boundary
    
    @app.route('/postcode/nets', methods=['GET', 'POST'])
    def postcodeNets():
        if request.method == 'GET':
            plz = session.get('plz')['key']
            gg = GridGenerator(plz=plz)
            pg = gg.pgr
            kcids_bcids = pg.getAllNetsOfVersion(plz)
            netList = []
            for version_id, kcid, bcid in kcids_bcids:
                #if kcid < 2 and bcid < 4:
                print(kcid, bcid)
                netList.append(pp.to_json(pg.read_net(plz=plz, kcid=kcid, bcid=bcid)))
            return netList
   
    
    @app.route('/networks', methods=['GET', 'POST'])
    def networks():
        return render_template('home.html')

    @app.route('/networks/editableNetwork', methods=['GET', 'POST'])
    def editableNetwork():
        if request.method == 'GET':
            plz = session.get('plz')['key']
            gg = GridGenerator(plz=plz)
            pg = gg.pgr
            testnet = pg.read_net(plz=plz, kcid=1, bcid=4)

            net = pp.to_json(testnet)
            return net

        if request.method == 'POST':
            #print(request.get_json())
            return 'Success', 200

        #return render_template('network.html')
        return render_template('home.html')
    return app


    