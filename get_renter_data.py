import os
import requests
import pandas as pd
import geopandas as gpd
import osmnx as ox
from pathlib import Path
from shapely.geometry import Polygon

# --- Configuration ---
API_URL = "https://maps.cityofmadison.com/arcgis/rest/services/Planning/Zoning/MapServer/3/query"
RAW_FILE = Path("renters_raw.geojson")
OUTPUT_FILE = Path("renters.geojson")
BATCH_SIZE = 1000

# Mapping for "Pretty" PropertyUse names
PROPERTY_USE_MAP = {
    'Single family': 'Single Family Home',
    '2 Unit': 'Duplex (2 Unit)',
    '3 Unit': 'Triplex (3 Unit)',
    'Apartments': 'Apartment Building',
    'Apartment & office': 'Multi-Use Apartment',
    'Apartment & store': 'Multi-Use Apartment',
    'Apartments & rooms': 'Multi-Use Apartment',
    'Apartment Sec 42': 'Affordable Housing (Sec 42)',
    'Rooming house': 'Rooming House',
    'Condominium': 'Condominium',
    'Condominium -apt': 'Condominium'
}

RESIDENTIAL_USES = list(PROPERTY_USE_MAP.keys())

def fetch_data(force_refresh=False):
    """
    Handles data lifecycle: 
    1. If OUTPUT_FILE exists, skips to check.
    2. If RAW_FILE exists, processes it.
    3. Otherwise, fetches from ArcGIS API.
    """
    if OUTPUT_FILE.exists() and not force_refresh:
        print(f"Using existing output: {OUTPUT_FILE}")
        return gpd.read_file(OUTPUT_FILE)
    
    if RAW_FILE.exists() and not force_refresh:
        print(f"Processing existing raw data: {RAW_FILE}")
        gdf = gpd.read_file(RAW_FILE)
    else:
        gdf = download_from_api()
    
    processed_gdf = process_data(gdf)
    processed_gdf = add_walkability_data(processed_gdf)
    
    processed_gdf.to_file(OUTPUT_FILE, driver="GeoJSON")
    check_data(processed_gdf)
    return processed_gdf

def download_from_api():
    """Fetches paginated data from Madison ArcGIS REST API."""
    print("Fetching data from Madison ArcGIS API...")
    all_features = []
    offset = 0
    formatted_uses = "'" + "','".join(RESIDENTIAL_USES) + "'"
    where_clause = f"PropertyUse IN ({formatted_uses})"
    fields = "OwnerName1,OwnerName2,Address,PropertyUse,OwnerAddress,OwnerCityStZip"
    
    while True:
        params = {
            'where': where_clause, 'outFields': fields, 'outSR': '4326',
            'f': 'json', 'resultOffset': offset, 'resultRecordCount': BATCH_SIZE,
            'returnGeometry': 'true'
        }
        response = requests.get(API_URL, params=params)
        data = response.json()
        features = data.get('features', [])
        
        if not features: 
            break
            
        for f in features:
            all_features.append({
                'type': 'Feature', 
                'properties': f['attributes'],
                'geometry': Polygon(f['geometry']['rings'][0])
            })
            
        offset += BATCH_SIZE
        if len(features) < BATCH_SIZE: 
            break

    gdf = gpd.GeoDataFrame.from_features(all_features, crs="EPSG:4326")
    gdf.to_file(RAW_FILE, driver='GeoJSON')
    return gdf

def process_data(gdf):
    """Cleans columns, remaps names, and identifies LLC-owned rentals."""
    print("Cleaning data and mapping management groups...")
    
    # 1. Standardize text and Titlecase
    for col in ['OwnerName1', 'OwnerName2', 'OwnerAddress', 'Address']:
        gdf[col] = gdf[col].fillna('').str.strip().str.upper()
        gdf[col] = gdf[col].str.replace(r'^%\s*', '', regex=True)

    # 2. Filter for Rentals (Multi-unit OR LLC-owned)
    is_llc = (gdf['OwnerName1'].str.contains('LLC')) | (gdf['OwnerName2'].str.contains('LLC'))
    is_multi = ~gdf['PropertyUse'].isin(['Single family', 'Condominium'])
    rentals = gdf[is_multi | is_llc].copy()

    # 3. "Pretty" Property Names
    rentals['PropertyUse'] = rentals['PropertyUse'].map(PROPERTY_USE_MAP).fillna(rentals['PropertyUse'])

    # 4. Count total units per owner (for deciding which owner wins for duplicate addresses)
    def get_all_owners(row):
        owners = set()
        if row['OwnerName1']:
            owners.add(row['OwnerName1'])
        if row['OwnerName2']:
            owners.add(row['OwnerName2'])
        return owners

    rentals['owner_set'] = rentals.apply(get_all_owners, axis=1)
    
    owner_unit_counts = {}
    for idx, row in rentals.iterrows():
        for owner in row['owner_set']:
            owner_unit_counts[owner] = owner_unit_counts.get(owner, 0) + 1

    # 5. For each unique Address, pick the owner with the most total units
    def pick_best_owner(group):
        owner_scores = {}
        for idx, row in group.iterrows():
            for owner in row['owner_set']:
                owner_scores[owner] = owner_unit_counts.get(owner, 0)
        if not owner_scores:
            return "UNKNOWN"
        return max(owner_scores, key=owner_scores.get)

    best_owner_per_address = rentals.groupby('Address').apply(pick_best_owner, include_groups=False).to_dict()
    rentals['ManagementGroup'] = rentals['Address'].map(best_owner_per_address)

    # 6. Drop duplicate addresses, keeping the first occurrence (now owned by best owner)
    rentals = rentals.drop_duplicates(subset=['Address'], keep='first')
    rentals = rentals.drop(columns=['owner_set'])
    
    return rentals

def add_walkability_data(gdf):
    """Calculates distances to Campus and Amenities using vectorized spatial joins."""
    print("Enriching with walkability metrics (OSM)...")
    
    # Project to local meters (UTM 16N) for accurate distance math
    gdf_proj = gdf.to_crs(epsg=32616)
    
    # Fetch Amenities from OSM
    tags = {
        'shop': ['supermarket', 'grocery'],
        'amenity': ['pharmacy'],
        'leisure': ['fitness_centre', 'sports_centre'],
        'sport': ['fitness']
    }
    # Madison center point
# --- Update this section in database.py ---

# 1. Fetch Amenities from OSM (returned in degrees)
    pois = ox.features_from_point((43.075, -89.40), dist=12000, tags=tags)

# 2. Project to meters FIRST
    pois_proj = pois.to_crs(gdf_proj.crs)

# 3. Now calculate the centroid on the projected data
# This removes the warning and ensures geometric accuracy
    pois_proj['geometry'] = pois_proj['geometry'].centroid

    # Campus Boundary
    campus = ox.geocode_to_gdf("R7144092", by_osmid=True).to_crs(gdf_proj.crs)
    campus_line = campus.geometry.iloc[0].boundary

    # Distance to Campus
    gdf_proj['dist_miles_campus'] = (gdf_proj.geometry.distance(campus_line) * 0.000621371).round(2)
    gdf_proj['walk_time_mins_campus'] = (gdf_proj['dist_miles_campus'] * 20).round().astype(int)

    # Spatial Joins for Amenities
    def join_nearest_amenity(base_gdf, target_pois, category, tag_key, tag_values):
        subset = target_pois[target_pois[tag_key].isin(tag_values)][['name', 'geometry']]
        joined = gpd.sjoin_nearest(base_gdf, subset, how='left', distance_col='dist_m')
        
        # Deduplicate indices from sjoin_nearest
        joined = joined[~joined.index.duplicated(keep='first')]
        
        joined[f'dist_miles_{category}'] = (joined['dist_m'] * 0.000621371).round(2)
        joined[f'walk_time_mins_{category}'] = (joined[f'dist_miles_{category}'] * 20).round().astype(int)
        joined[f'nearest_{category}'] = joined['name'].fillna("Unknown")
        
        return joined.drop(columns=['dist_m', 'index_right', 'name'], errors='ignore')

    res = join_nearest_amenity(gdf_proj, pois_proj, "grocery", "shop", ['supermarket', 'grocery'])
    res = join_nearest_amenity(res, pois_proj, "pharmacy", "amenity", ['pharmacy'])
    res = join_nearest_amenity(res, pois_proj, "gym", "leisure", ['fitness_centre', 'sports_centre'])

    return res.to_crs("EPSG:4326")

def check_data(gdf):
    """Validation checks for the final dataset."""
    print("\n--- Data Validation ---")
    print(f"Total rental units: {len(gdf)}")
    nulls = gdf['ManagementGroup'].isna().sum()
    if nulls > 0:
        print(f"Warning: {nulls} units missing ManagementGroup")
    
    sample = gdf[['Address', 'ManagementGroup', 'dist_miles_campus']].iloc[0]
    print(f"Sample Entry: {sample['Address']} managed by {sample['ManagementGroup']}")

if __name__ == "__main__":
    fetch_data()
