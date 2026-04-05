import numpy as np
import rasterio
from rasterio.transform import from_origin

def create_mock_geotiff(filename="sample_satellite.tif"):
    # Define dimensions (256x256)
    width, height = 256, 256
    
    # Create 3 bands of random data (simulating R, G, B or multispectral)
    data = np.random.randint(0, 100, (3, height, width), dtype=np.uint8)
    
    # Add some "anomalies" (very bright spots)
    # Anomaly 1: Hot spot in the center
    data[:, 120:130, 120:130] = 255
    
    # Anomaly 2: Another spot
    data[:, 50:55, 200:205] = 240

    # Define geospatial metadata (Paris coordinates roughly)
    transform = from_origin(2.3522, 48.8566, 0.0001, 0.0001)
    
    with rasterio.open(
        filename,
        'w',
        driver='GTiff',
        height=height,
        width=width,
        count=3,
        dtype=data.dtype,
        crs='+proj=latlong',
        transform=transform,
    ) as dst:
        dst.write(data)
    
    print(f"Mock GeoTIFF created: {filename}")

if __name__ == "__main__":
    create_mock_geotiff()
