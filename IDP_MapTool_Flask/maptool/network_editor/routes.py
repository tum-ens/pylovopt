from maptool.network_editor import bp

from syngrid.GridGenerator import GridGenerator

import pandapower as pp
import pandapower.networks as nw
from pandapower.plotting.plotly.mapbox_plot import geo_data_to_latlong

from flask import Flask, render_template, request, session

from pandapower2urbs import construct_model_components as pp2u

#once the Select Network button is pressed, we return the editable network view 
@bp.route('/networks', methods=['GET', 'POST'])
def networks():
    return render_template('network_editor/index.html')

@bp.route('/networks/editableNetwork', methods=['GET', 'POST'])
def editableNetwork():
    #on opening of the network view the js code requests full information of the previously selected network
    if request.method == 'GET':
        plz = session.get('plz')['value']
        kcid_bcid = session.get('kcid_bcid')['value']
        gg = GridGenerator(plz=plz)
        pg = gg.pgr
        testnet = pg.read_net(plz=plz, kcid=kcid_bcid[0], bcid=kcid_bcid[1])
        print(testnet)

        #--------------------------------PURELY FOR DEBUG--------------------------------#
        #from maptool import net as testnet
        #from .generateEditableNetwork import createFeatures
        #createFeatures(False, pp.from_json(testnet), 'bus',0,0,0)
        #--------------------------------PURELY FOR DEBUG--------------------------------#
        return pp.to_json(testnet)

    if request.method == 'POST':
        #print(request.get_json())
        return 'Success', 200
    
@bp.route('/networks/urbs_results', methods=['GET', 'POST'])
def urbs_results():
    if request.method == 'POST':
        print(request)
        #pp2u.convertPandapower2Urbs()
        return 'Success', 200