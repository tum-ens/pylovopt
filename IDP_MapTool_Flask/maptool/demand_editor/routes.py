from maptool.demand_editor import bp
from flask import Flask, render_template, request, session
from syngrid.GridGenerator import GridGenerator
import pandapower as pp

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
        return pp.to_json(testnet)

    if request.method == 'POST':
        #print(request.get_json())
        return 'Success', 200