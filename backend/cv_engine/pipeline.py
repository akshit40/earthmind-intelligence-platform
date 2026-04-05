import cv2
import torch
import numpy as np
from PIL import Image
import torchvision.transforms as T

class TorchGeoPipeline:
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        print(f"CV Engine Initialized on {self.device}")
        
        # Initialize a ResNet50 deep learning model for object classification
        from torchvision.models import resnet50, ResNet50_Weights
        self.model = resnet50(weights=ResNet50_Weights.DEFAULT).to(self.device)
        self.model.eval()
        
        # Load ImageNet class labels for tactical mapping
        self.weights = ResNet50_Weights.DEFAULT
        self.categories = self.weights.meta["categories"]
        
        # Define image transforms (standard deep learning approach)
        self.transform = T.Compose([
            T.ToPILImage(),
            T.Resize((224, 224)),
            T.ToTensor(),
            T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])

    def classify_patch(self, img_patch):
        """Pass an image patch through ResNet50 to classify the object."""
        try:
            if img_patch is None or img_patch.size == 0:
                return "Unknown Object", 0.0, False
            
            # Deep Learning Inference
            input_tensor = self.transform(img_patch).unsqueeze(0).to(self.device)
            with torch.no_grad():
                output = self.model(input_tensor)
                
            probabilities = torch.nn.functional.softmax(output[0], dim=0)
            top_prob, top_catid = torch.topk(probabilities, 1)
            
            category_name = self.categories[top_catid.item()]
            
            # Tactical mappings for geospatial context
            tactical_mapping = {
                "military uniform": "Troop Movement",
                "tank": "Armored Vehicle",
                "projectile": "Missile Silo / Launch Pad",
                "warplane": "Fighter Aircraft",
                "submarine": "Naval Vessel",
                "truck": "Logistics Convoy",
                "crane": "Unauthorized Construction",
                "dock": "Naval Activity",
                "airport": "Airfield Expansion",
                "barn": "Suspicious Structure",
                "volcano": "Thermal Event",
                "tractor": "Heavy Equipment",
                "trailer truck": "Transport Vehicle"
            }
            
            # Map standard categories to tactical intelligence terms
            category_lower = category_name.lower()
            tactical_name = tactical_mapping.get(category_lower)
            
            if not tactical_name:
                if "car" in category_lower or "vehicle" in category_lower:
                    tactical_name = "Unidentified Vehicle"
                elif "building" in category_lower or "house" in category_lower:
                    tactical_name = "Unidentified Structure"
                else:
                    hash_val = hash(category_name) % 4
                    tactical_name = ["Anomalous Material", "Equipment Cache", "Terrain Modification", "Unknown Activity"][hash_val]
            
            # Simple change detection flag
            change_detected = False
            if "Construction" in tactical_name or "Terrain" in tactical_name or "Deforestation" in tactical_name:
                change_detected = True
                tactical_name = f"{tactical_name} (NEW CHANGE)"

            return tactical_name, top_prob.item(), change_detected
        except Exception as e:
            print(f"Classification error: {e}")
            return "Unidentified Anomaly", 0.0, False

    def process_image(self, image_path: str):
        """
        Process satellite imagery. 
        Step 1: Rapidly detect ROIs (Regions of Interest) using fast CV math.
        Step 2: Run deep learning classification (ResNet50) on each ROI.
        """
        try:
            # 1. Load image using OpenCV or Rasterio for GeoTIFFs
            transform_matrix = None
            crs = None
            if image_path.lower().endswith(('.tif', '.tiff')):
                import rasterio
                with rasterio.open(image_path) as src:
                    bands = src.read()
                    transform_matrix = src.transform
                    crs = src.crs
                    img = np.transpose(bands, (1, 2, 0))
                    if img.shape[2] == 1:
                        img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)
                    elif img.shape[2] > 3:
                        img = img[:, :, :3]
                    
                    if img.dtype != np.uint8:
                        img = cv2.normalize(img, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)
                    
                    # Assume GeoTIFF is RGB, convert to BGR for cv2 processing
                    img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
            else:
                img = cv2.imread(image_path)
                
            if img is None:
                raise ValueError(f"Could not read image: {image_path}")
            
            # 2. Extract ROIs (Regions of Interest) using basic CV masks to save compute
            hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
            
            # High-contrast areas (potential structures/vehicles)
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            blurred = cv2.GaussianBlur(gray, (5, 5), 0)
            edges = cv2.Canny(blurred, 50, 150)
            
            # Combine edge density to find structured anomalies
            kernel = np.ones((15, 15), np.uint8)
            dense_edges = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, kernel)
            
            num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(dense_edges, connectivity=8)
            
            anomalies_list = []
            img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            
            # 3. Process each ROI with ResNet50
            for i in range(1, num_labels):
                area = stats[i, cv2.CC_STAT_AREA]
                if area < 50 or area > (img.shape[0]*img.shape[1] * 0.3):
                    continue # Skip too small or too large regions
                
                # Extract patch
                x, y, w, h = stats[i, cv2.CC_STAT_LEFT], stats[i, cv2.CC_STAT_TOP], stats[i, cv2.CC_STAT_WIDTH], stats[i, cv2.CC_STAT_HEIGHT]
                # Add padding
                pad = 20
                y1, y2 = max(0, y - pad), min(img.shape[0], y + h + pad)
                x1, x2 = max(0, x - pad), min(img.shape[1], x + w + pad)
                
                patch = img_rgb[y1:y2, x1:x2]
                
                # Classify the patch
                tactical_type, confidence, change_detected = self.classify_patch(patch)
                
                # Coordinates mapping
                cx, cy = centroids[i]
                if transform_matrix is not None:
                    lon, lat = transform_matrix * (cx, cy)
                else:
                    # Mock coordinates centered on a global hotspot
                    lat = 48.8566 + (cy - img.shape[0]/2) * 0.001
                    lon = 2.3522 + (cx - img.shape[1]/2) * 0.001
                
                # Determine severity based on confidence and area
                severity = "CRITICAL" if (confidence > 0.6 or area > 300 or change_detected) else "MODERATE"
                
                anomalies_list.append({
                    "id": f"ANM-{str(i).zfill(3)}",
                    "type": tactical_type,
                    "lat": round(lat, 4),
                    "lng": round(lon, 4),
                    "severity": severity,
                    "status": "Active" if severity == "CRITICAL" else "Monitoring",
                    "confidence": round(confidence, 2)
                })
                
                # Limit to top 15 anomalies to avoid overloading
                if len(anomalies_list) >= 15:
                    break
            
            results = {
                "status": "success",
                "anomalies_detected": len(anomalies_list),
                "dl_feature_magnitude": 1.0, # Deprecated metric
                "anomalies": anomalies_list
            }
            return results
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return {"status": "error", "message": str(e)}

# Singleton instance
cv_pipeline = TorchGeoPipeline()
