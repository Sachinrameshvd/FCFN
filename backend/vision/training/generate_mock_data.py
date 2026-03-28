import os
import numpy as np
from PIL import Image

def generate_synthetic_data(base_dir="backend/vision/training/dataset", n_train=500, n_val=100):
    """
    Generates synthetic images and labels with distinct color signatures to ensure YOLOv8 can learn 15+ categories.
    """
    print(f"Generating ULTIMATE QUALITY synthetic data (15+ classes) in {base_dir}...")
    
    classes = [
        {"id": 0, "name": "Tomato", "color": [255, 50, 50]},
        {"id": 1, "name": "Milk", "color": [240, 240, 240]},
        {"id": 2, "name": "Brinjal", "color": [100, 30, 150]},
        {"id": 3, "name": "Egg", "color": [255, 230, 150]},
        {"id": 4, "name": "Apple", "color": [200, 20, 20]},
        {"id": 5, "name": "Banana", "color": [255, 255, 50]},
        {"id": 6, "name": "Carrot", "color": [255, 140, 0]},
        {"id": 7, "name": "Cucumber", "color": [30, 150, 30]},
        {"id": 8, "name": "Onion", "color": [200, 160, 200]},
        {"id": 9, "name": "Potato", "color": [180, 160, 120]},
        {"id": 10, "name": "Cheese", "color": [255, 215, 0]},
        {"id": 11, "name": "Bread", "color": [210, 180, 140]},
        {"id": 12, "name": "Spinach", "color": [0, 100, 0]},
        {"id": 13, "name": "Paneer", "color": [255, 250, 240]},
        {"id": 14, "name": "Chicken", "color": [255, 220, 200]},
        {"id": 15, "name": "Yogurt", "color": [255, 255, 255]}
    ]
    
    for split, count in [("train", n_train), ("val", n_val)]:
        img_dir = os.path.join(base_dir, split, "images")
        lab_dir = os.path.join(base_dir, split, "labels")
        os.makedirs(img_dir, exist_ok=True)
        os.makedirs(lab_dir, exist_ok=True)
        
        for i in range(count):
            img_name = f"mock_{split}_{i}.jpg"
            img_path = os.path.join(img_dir, img_name)
            
            # Select a random class
            cls = np.random.choice(classes)
            
            # Create image with a "blob" of class color
            img_data = np.random.randint(0, 50, (640, 640, 3), dtype=np.uint8) # Dark background
            
            # Draw a 400x400 square in the middle with the class color + noise
            noise = np.random.randint(-20, 20, (400, 400, 3))
            blob = np.clip(np.array(cls["color"]) + noise, 0, 255).astype(np.uint8)
            img_data[120:520, 120:520] = blob
            
            img = Image.fromarray(img_data)
            img.save(img_path)
            
            # Label: class x_center y_center width height (all 0-1)
            lab_name = f"mock_{split}_{i}.txt"
            lab_path = os.path.join(lab_dir, lab_name)
            with open(lab_path, "w") as f:
                f.write(f"{cls['id']} 0.5 0.5 0.65 0.65\n")
                
    print(f"Successfully generated {n_train} train and {n_val} val high-quality samples.")

if __name__ == "__main__":
    try:
        generate_synthetic_data()
    except ImportError:
        print("Pillow is required. Installing now...")
        import subprocess
        subprocess.check_call(["pip", "install", "Pillow"])
        generate_synthetic_data()
