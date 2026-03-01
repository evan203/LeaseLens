import os
import geopandas as gpd
import osmnx as ox
from pathlib import Path

OUTPUT_FILE = Path("public/amenities.geojson")

def fetch_amenities():
    """Fetches grocery stores, pharmacies, and gyms from OSM."""
    if OUTPUT_FILE.exists():
        print(f"Using existing amenities: {OUTPUT_FILE}")
        return gpd.read_file(OUTPUT_FILE)
    
    print("Fetching amenities from OSM...")
    
    tags = {
        'shop': ['supermarket', 'grocery'],
        'amenity': ['pharmacy'],
        'leisure': ['fitness_centre', 'sports_centre'],
        'sport': ['fitness']
    }
    
    pois = ox.features_from_point((43.075, -89.40), dist=12000, tags=tags)
    print(f"Found {len(pois)} POIs")
    
    gdf = gpd.GeoDataFrame(pois)
    gdf = gdf.to_crs("EPSG:4326")
    gdf['geometry'] = gdf.geometry.centroid
    
    def categorize(row):
        if row.get('shop') in ['supermarket', 'grocery']:
            return 'grocery'
        elif row.get('amenity') == 'pharmacy':
            return 'pharmacy'
        elif row.get('leisure') in ['fitness_centre', 'sports_centre'] or row.get('sport') == 'fitness':
            return 'gym'
        return 'other'
    
    gdf['category'] = gdf.apply(categorize, axis=1)
    gdf = gdf[gdf['category'] != 'other']
    
    gdf = gdf[['name', 'category', 'geometry']].copy()
    gdf.to_file(OUTPUT_FILE, driver="GeoJSON")
    print(f"Saved {len(gdf)} amenities to {OUTPUT_FILE}")
    return gdf

if __name__ == "__main__":
    fetch_amenities()
