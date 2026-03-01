import osmnx as ox
import geopandas as gpd
import pandas as pd
import warnings

warnings.filterwarnings("ignore", category=UserWarning)

def enrich_apartments_with_amenities(input_geojson_path, output_geojson_path):
    """
    Takes a GeoJSON of apartments, fetches Madison amenity data ONCE, 
    calculates all distances in memory, and saves an enriched GeoJSON.
    """
    print("1. Loading Apartments GeoJSON...")
    apartments = gpd.read_file(input_geojson_path)
    
    # 2. Define our target tags
    amenity_tags = {
        'shop': ['supermarket', 'grocery'],
        'amenity': ['pharmacy'],
        'leisure': ['fitness_centre', 'sports_centre', 'sports_hall'],
        'sport': ['fitness', 'multi'],
        'building': ['sports_centre', 'sports_hall', 'gymnasium'],
        'name': [
            'Nicholas Recreation Center', 
            'Bakke Recreation & Wellbeing Center', 
            'Bakke Recreation Center'
        ]
    }

    print("2. Fetching all Madison POIs (Just once!)...")
    # Instead of a 5km radius from a point, we fetch a 15km radius from the center of Madison 
    # to ensure we capture amenities for apartments in suburbs like Middleton or Fitchburg.
    madison_center = (43.075153, -89.395803) 
    pois = ox.features_from_point(madison_center, dist=15000, tags=amenity_tags)
    
    # Convert polygon buildings to point centroids so distances are measured to the center
    pois['geometry'] = pois['geometry'].centroid

    print("3. Fetching UW Madison Campus Boundary...")
    campus = ox.geocode_to_gdf("R7144092", by_osmid=True)

    print("4. Projecting all data to meters for accurate distance math...")
    # EPSG:4326 is standard GPS (degrees). We project the campus first, 
    # then force everything else into that exact same local projection (meters).
    campus_proj = ox.projection.project_gdf(campus)
    target_crs = campus_proj.crs
    
    pois_proj = pois.to_crs(target_crs)
    apartments_proj = apartments.to_crs(target_crs)

    # 5. Split POIs into categories
    def categorize_poi(row):
        if pd.notna(row.get('shop')) and row['shop'] in ['supermarket', 'grocery']:
            return 'supermarket'
        elif pd.notna(row.get('amenity')) and row['amenity'] == 'pharmacy':
            return 'pharmacy'
        elif row.get('name') != "Unknown": # Expanded net for Gyms/Rec Centers
            return 'gym'
        return None

    pois_proj['category'] = pois_proj.apply(categorize_poi, axis=1)
    
    # Create separate GeoDataFrames
    supermarkets = pois_proj[pois_proj['category'] == 'supermarket'][['name', 'geometry']]
    pharmacies = pois_proj[pois_proj['category'] == 'pharmacy'][['name', 'geometry']]
    gyms = pois_proj[pois_proj['category'] == 'gym'][['name', 'geometry']]

    print("5. Calculating Nearest Neighbors and Distances (Vectorized)...")
    
    # --- A. Campus Distance ---
    campus_boundary = campus_proj.geometry.iloc[0].boundary
    # Calculates distance from every apartment to the campus line instantly
    apartments_proj['dist_meters_campus'] = apartments_proj.geometry.distance(campus_boundary)

    # --- B. Nearest POIs using Spatial Join (sjoin_nearest) ---
    # This magically finds the closest point from the right dataframe to the left dataframe
    
    # Supermarkets
    apts_with_super = gpd.sjoin_nearest(apartments_proj, supermarkets, how='left', distance_col='dist_meters_supermarket')
    apts_with_super = apts_with_super.rename(columns={'name': 'nearest_supermarket'}).drop(columns=['index_right'], errors='ignore')

    # Pharmacies (Join onto the running dataframe)
    apts_with_pharm = gpd.sjoin_nearest(apts_with_super, pharmacies, how='left', distance_col='dist_meters_pharmacy')
    apts_with_pharm = apts_with_pharm.rename(columns={'name': 'nearest_pharmacy'}).drop(columns=['index_right'], errors='ignore')

    # Gyms
    final_apts = gpd.sjoin_nearest(apts_with_pharm, gyms, how='left', distance_col='dist_meters_gym')
    final_apts = final_apts.rename(columns={'name': 'nearest_gym'}).drop(columns=['index_right'], errors='ignore')

    print("6. Converting meters to miles and calculating walk times...")
    # Conversion Constants
    M_TO_MILES = 0.000621371
    MINS_PER_MILE = 20

    # Apply conversions across the whole dataframe at once
    for category in ['campus', 'supermarket', 'pharmacy', 'gym']:
        dist_col = f'dist_meters_{category}'
        miles_col = f'dist_miles_{category}'
        time_col = f'walk_time_mins_{category}'
        
        # Calculate Miles (rounded to 2 decimals)
        final_apts[miles_col] = (final_apts[dist_col] * M_TO_MILES).round(2)
        # Calculate Time (rounded to integer)
        final_apts[time_col] = (final_apts[miles_col] * MINS_PER_MILE).round().astype(int)
        
        # Drop the raw meters column to keep the file clean
        final_apts = final_apts.drop(columns=[dist_col])

    # De-duplicate any potential multi-matches from sjoin
    final_apts = final_apts[~final_apts.index.duplicated(keep='first')]

    # 7. Saving final output...
    print("7. Cleaning up internal columns and saving...")
    
    # List of columns created by the spatial joins that we don't need in our final app
    cols_to_drop = [
        'element_left', 'id_left', 'element_right', 
        'id_right', 'element', 'id', 'index_right'
    ]
    final_apts = final_apts.drop(columns=cols_to_drop, errors='ignore')

    # Convert back to standard GPS coordinates before saving
    final_apts = final_apts.to_crs("EPSG:4326")
    final_apts.to_file(output_geojson_path, driver="GeoJSON")
    
    print(f"Success! Enriched data for {len(final_apts)} apartments saved to {output_geojson_path}")

# --- Example Usage ---
if __name__ == "__main__":
    # Replace these with your actual file paths
    enrich_apartments_with_amenities("residential.geojson", "enriched_apartments.geojson")
    pass
