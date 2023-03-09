import pandapower as pp
import pandapower.networks as nw
from pandapower.plotting.plotly.mapbox_plot import geo_data_to_latlong
import geopandas
from pandas_geojson import to_geojson
import matplotlib.pyplot as plt

#Test Netzwerk
def getTestNetwork():
    net = nw.mv_oberrhein()
    geo_data_to_latlong(net, projection='epsg:31467')
    df = pp.to_json(net)
    return df


# def getTestNetwork():
#     net = nw.mv_oberrhein()
#     geo_data_to_latlong(net, projection='epsg:31467')
#     df = net['bus_geodata'].drop('coords', axis=1).to_json()
#     test_df = net['bus_geodata']
#     geo_json = to_geojson(df=test_df, lat='y', lon='x',
#                  properties=[])
#     #print(geo_json)
#     return geo_json
#     #print(df.head())

#     #return df

# gdf = geopandas.GeoDataFrame(
#     df, geometry=geopandas.points_from_xy(df.y, df.x))

# fig, ax = plt.subplots()
# ax.plot(gdf.x, gdf.y, 'bo')
# ax.grid()
# plt.show()

#print('We have {} rows'.format(len(df)))
#print(str(df.columns.tolist()))

#Laden sollte mittels from_excel möglich sein, netz liegt unter _transmissions/pp_net.xlsx, hat aber keine Geodaten
#pp.to_excel(net, 'test.xlsx')