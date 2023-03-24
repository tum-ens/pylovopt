from maptool.postcode_editor import bp
from flask import request, session
from syngrid.GridGenerator import GridGenerator
import pandapower as pp

#When user submits postal code or area selection in gui we return the corresponding postal code area boundary
@bp.route('/postcode', methods=['GET', 'POST'])
def postcode():
    if request.method == 'POST':
        plz = {'key' : request.get_json()}
        session['plz'] = plz
        gg = GridGenerator(plz=request.get_json())
        pg = gg.pgr
        postcode_gdf = pg.getGeoDataFrame(table="postcode_result", id=request.get_json()).to_crs(epsg=4326)
        postcode_boundary = postcode_gdf.boundary.to_json()

        return postcode_boundary


@bp.route('/postcode/nets', methods=['GET', 'POST'])
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
