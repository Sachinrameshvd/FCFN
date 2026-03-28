import os

def setup_dataset():
    """
    Sets up the directory structure and data.yaml for YOLOv8 training.
    """
    base_dir = "backend/vision/training/dataset"
    subdirs = [
        "train/images", "train/labels",
        "val/images", "val/labels"
    ]
    
    # Create directories
    for subdir in subdirs:
        path = os.path.join(base_dir, subdir)
        os.makedirs(path, exist_ok=True)
        print(f"Created: {path}")
    
    # Create data.yaml
    data_yaml_path = os.path.join(base_dir, "data.yaml")
    yaml_content = f"""path: {os.path.abspath(base_dir)}
train: train/images
val: val/images

names:
  0: tomato
  1: apple
  2: milk_packet
  3: carrot
  4: brinjal
  5: ladies_finger
  6: leafy_greens
  7: curd
  8: paneer
"""
    with open(data_yaml_path, "w") as f:
        f.write(yaml_content)
    
    print(f"Created initial data.yaml at: {data_yaml_path}")
    print("\nNext Steps:")
    print("1. Collect images of your food items.")
    print("2. Label them using a tool like LabelImg or Roboflow (YOLO format).")
    print("3. Place images in 'train/images' and labels in 'train/labels'.")
    print("4. Repeat for 'val' folder (10-20% of your data).")

if __name__ == "__main__":
    setup_dataset()
