import osmnx as ox
from geopy.distance import geodesic
import warnings

# Suppress warnings about calculating centroids on unprojected geographic coordinates
warnings.filterwarnings("ignore", category=UserWarning)

# Your location (Madison, WI)
lat, lon =  43.075153, -89.395803

# Search for grocery stores and pharmacies
tags = {
    'shop': ['supermarket', 'grocery'],
    'amenity': ['pharmacy']
}

print("Fetching data from OpenStreetMap...")
# Get features within 5km (5000m)
gdf = ox.features_from_point((lat, lon), dist=5000, tags=tags)

# Calculate distances and find nearest
origin = (lat, lon)
results = []

for idx, row in gdf.iterrows():
    # 1. Grab the geometry
    geom = row['geometry']
    
    # 2. Find the center point (handles both Points and building Polygons)
    centroid = geom.centroid
    
    # 3. Extract lat (y) and lon (x)
    place_loc = (centroid.y, centroid.x)
    
    # Calculate distance
    dist_km = geodesic(origin, place_loc).km
    dist_miles = dist_km * 0.621371
    
    # Clean up the name tag (OSM sometimes returns 'NaN' for missing names)
    name = row.get('name')
    name = name if isinstance(name, str) else "Unknown"
    
    results.append({
        'name': name,
        'type': row.get('shop') or row.get('amenity'),
        'distance_miles': round(dist_miles, 2)
    })

# Sort by distance
results.sort(key=lambda x: x['distance_miles'])

print(f"\nFound {len(results)} locations. Here are the 5 closest:\n")
for place in results[:5]:
    print(place)
