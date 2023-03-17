import pandapower as pp
import pandapower.networks as nw
from pandapower.plotting.plotly.mapbox_plot import geo_data_to_latlong
import geopandas
from pandas_geojson import to_geojson
import matplotlib.pyplot as plt

#Test Netzwerk
def getTestNetwork(testnet):
    #net = nw.mv_oberrhein()
    net = testnet
    #net = nw.ieee_european_lv_asymmetric()
    #geo_data_to_latlong(net, projection='epsg:31467')
    df = pp.to_json(net)
    return df






# fig, ax = plt.subplots()
# ax.plot(gdf.x, gdf.y, 'bo')
# ax.grid()
# plt.show()

#print('We have {} rows'.format(len(df)))
#print(str(df.columns.tolist()))

#Laden sollte mittels from_excel möglich sein, netz liegt unter _transmissions/pp_net.xlsx, hat aber keine Geodaten
#pp.to_excel(net, 'test.xlsx')