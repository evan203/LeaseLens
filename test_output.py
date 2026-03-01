import geopandas as gpd

# Load the newly created file
print("Loading enriched data...")
gdf = gpd.read_file("enriched_apartments.geojson")

# 1. Check the columns to make sure our new ones are there
print("\n--- Columns Present ---")
print(list(gdf.columns))

# 2. Check for missing data (NaN values) in our new calculations
print("\n--- Missing Data Check ---")
print(f"Total Apartments: {len(gdf)}")
print(f"Missing Gym Distances: {gdf['dist_miles_gym'].isna().sum()}")
print(f"Missing Campus Distances: {gdf['dist_miles_campus'].isna().sum()}")

# 3. Print the first row to visually inspect the actual numbers
print("\n--- Sample Row ---")
# Drop the geometry column just for cleaner printing in the terminal
print(gdf.drop(columns=['geometry']).iloc[0])
