import geopandas as gpd


def get_bus_stops(geojson_path):
    """
    Loads Madison Metro Transit bus stops from GeoJSON.
    """
    stops_gdf = gpd.read_file(geojson_path)
    return stops_gdf


if __name__ == "__main__":
    STOPS_FILE = "Metro_Transit_Bus_Stops.geojson"
    stops = get_bus_stops(STOPS_FILE)
    print(f"Loaded {len(stops)} bus stops")
