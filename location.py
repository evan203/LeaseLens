import osmnx as ox
import geopandas as gpd
from shapely.geometry import Point
from geopy.distance import geodesic
import warnings

# Suppress warnings about calculating centroids on unprojected geographic coordinates
warnings.filterwarnings("ignore", category=UserWarning)

def get_closest_amenities_and_campus_distance(lat, lon):
    """
    Takes a latitude and longitude and returns the nearest supermarket, 
    pharmacy, gym, and the distance/walk time to the UW Madison campus border.
    """
    
    # 1. Define the tags we are looking for
    amenity_tags = {
        'shop': ['supermarket', 'grocery'],
        'amenity': ['pharmacy'],
        'leisure': ['fitness_centre', 'sports_centre']
    }

    print("Fetching POI data from OpenStreetMap...")
    # Get features within a 5km (5000m) radius
    try:
        gdf_pois = ox.features_from_point((lat, lon), dist=5000, tags=amenity_tags)
    except Exception as e:
        print(f"Error fetching POIs: {e}")
        return None

    # Initialize lists to categorize our findings
    supermarkets = []
    pharmacies = []
    gyms = []
    origin = (lat, lon)

    # 2. Process the POIs
    if not gdf_pois.empty:
        for idx, row in gdf_pois.iterrows():
            geom = row['geometry']
            centroid = geom.centroid
            place_loc = (centroid.y, centroid.x)
            
            # Calculate distance using geopy
            dist_km = geodesic(origin, place_loc).km
            dist_miles = dist_km * 0.621371
            
            # Calculate estimated walk time (20 mins per mile = 3.0 mph)
            # Rounded to the nearest whole integer
            walk_time_mins = int(round(dist_miles * 20))
            
            # Clean up the name tag
            name = row.get('name')
            name = name if isinstance(name, str) else "Unknown"

            place_data = {
                'name': name,
                'distance_miles': round(dist_miles, 2),
                'estimated_walk_time_mins': walk_time_mins
            }

            # Categorize the POI based on its OSM tags
            if 'shop' in row and row['shop'] in ['supermarket', 'grocery']:
                supermarkets.append(place_data)
            elif 'amenity' in row and row['amenity'] == 'pharmacy':
                pharmacies.append(place_data)
            elif 'leisure' in row and row['leisure'] in ['fitness_centre', 'sports_centre']:
                gyms.append(place_data)

    # 3. Find the nearest for each category
    nearest_supermarket = min(supermarkets, key=lambda x: x['distance_miles']) if supermarkets else None
    nearest_pharmacy = min(pharmacies, key=lambda x: x['distance_miles']) if pharmacies else None
    nearest_gym = min(gyms, key=lambda x: x['distance_miles']) if gyms else None

    # 4. ---- CALCULATE DISTANCE TO UW MADISON BORDER ----
    print("Fetching UW Madison campus polygon...")
    campus_distance_miles = None
    campus_walk_time_mins = None
    try:
        # Fetch the UW Madison Polygon directly via its specific OSM Relation ID
        campus_gdf = ox.geocode_to_gdf("R7144092", by_osmid=True)
        
        point_gdf = gpd.GeoDataFrame(geometry=[Point(lon, lat)], crs="EPSG:4326")
        
        # Project using the updated v2.0 ox.projection syntax
        point_proj = ox.projection.project_gdf(point_gdf)
        campus_proj = ox.projection.project_gdf(campus_gdf, to_crs=point_proj.crs)
        
        point_geom = point_proj.geometry.iloc[0]
        campus_geom = campus_proj.geometry.iloc[0]
        
        campus_boundary = campus_geom.boundary
        
        # Calculate distance and walk time
        dist_meters = point_geom.distance(campus_boundary)
        campus_distance_miles = round(dist_meters * 0.000621371, 2)
        campus_walk_time_mins = int(round(campus_distance_miles * 20))
        
    except Exception as e:
        print(f"Error fetching/calculating campus distance: {e}")

    # 5. Return the compiled results
    return {
        "nearest_supermarket": nearest_supermarket,
        "nearest_pharmacy": nearest_pharmacy,
        "nearest_gym": nearest_gym,
        "campus_border_distance_miles": campus_distance_miles,
        "campus_border_walk_time_mins": campus_walk_time_mins
    }

# --- Example Usage ---
if __name__ == "__main__":
    test_lat, test_lon = 43.075153, -89.395803
    
    results = get_closest_amenities_and_campus_distance(test_lat, test_lon)
    
    print("\n--- RESULTS ---")
    for key, value in results.items():
        print(f"{key}: {value}")

