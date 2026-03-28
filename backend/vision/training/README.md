# YOLOv8 Training Guide - FedCausalFreshNet

This guide provides instructions for building a custom food detection dataset and training a YOLOv8 model for FCFN.

## 1. Dataset Structure

The dataset should follow the YOLOv8 format:

```text
dataset/
├── data.yaml
├── train/
│   ├── images/  (e.g., img1.jpg, img2.jpg)
│   └── labels/  (e.g., img1.txt, img2.txt)
└── val/
    ├── images/
    └── labels/
```

### data.yaml Example
```yaml
path: ../dataset
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
```

## 2. Data Collection Strategy

To build a robust model for a refrigerator environment:
- **Environment**: Capture images inside the fridge with various lighting conditions (door open, different shelves).
- **Diversity**: Rotate items, place them in different zones (back-left, front-right), and include overlapping items.
- **Backgrounds**: Include images of empty shelves and non-food items (water bottles, containers) as negative samples or background context.
- **Quantity**: Aim for at least 50-100 images per class for initial training.

## 3. Labeling Instructions

Use a tool like **CVAT**, **LabelImg**, or **Roboflow** to annotate your images.
- **Format**: Export in **YOLO format**.
- **Labels**: Each image will have a corresponding `.txt` file containing entries like:
  `<class_index> <x_center> <y_center> <width> <height>` (all normalized between 0 and 1).

## 4. Training Commands

Run these in your terminal from the `backend/vision/training` directory:

### Preparation
```bash
# Install ultralytics
pip install ultralytics

# Create directories
mkdir -p dataset/train/images dataset/train/labels dataset/val/images dataset/val/labels
```

### Training
```bash
# Train YOLOv8-nano on your custom dataset
yolo task=detect mode=train model=yolov8n.pt data=dataset/data.yaml epochs=50 imgsz=640
```

## 5. Integration

Once training is complete, YOLOv8 will save the best weights to `runs/detect/train/weights/best.pt`. 
Copy this file to the project root or a `weights/` folder and update `backend/vision/camera.py`:

```python
self.model = YOLO('custom_best.pt')  # Update this line in camera.py
```
