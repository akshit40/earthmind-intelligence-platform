import cv2
import numpy as np
import os

# Create a dummy image (e.g., 512x512)
img = np.zeros((512, 512, 3), dtype=np.uint8)

# Add some background noise (simulating satellite terrain)
noise = np.random.randint(0, 50, (512, 512, 3), dtype=np.uint8)
img = cv2.add(img, noise)

# Add anomalies (bright spots simulating thermal or optical anomalies)
# Anomaly 1
cv2.circle(img, (100, 150), 15, (255, 255, 255), -1)
# Anomaly 2
cv2.circle(img, (400, 350), 20, (240, 240, 240), -1)
# Anomaly 3
cv2.circle(img, (250, 450), 10, (255, 200, 200), -1)

# Apply some blur to make it look a bit more natural
img = cv2.GaussianBlur(img, (5, 5), 0)

# Ensure data dir exists
os.makedirs("data", exist_ok=True)

# Save image
cv2.imwrite("data/dummy_satellite.png", img)
print("Dummy satellite image created at data/dummy_satellite.png")
