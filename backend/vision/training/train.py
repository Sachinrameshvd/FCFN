from ultralytics import YOLO
import argparse
import os

def train_custom_model(data_yaml, epochs=50, imgsz=640):
    """
    Trains YOLOv8 on a custom dataset specified by data_yaml.
    """
    print(f"Starting training with data: {data_yaml}")
    
    # Load a pretrained YOLOv8-nano model
    model = YOLO('yolov8n.pt')
    
    # Train the model
    results = model.train(
        data=data_yaml,
        epochs=epochs,
        imgsz=imgsz,
        project='fcfn_vision',
        name='food_detector'
    )
    
    print("Training complete.")
    best_weights = os.path.join(results.save_dir, 'weights/best.pt')
    print(f"Best weights saved to: {best_weights}")
    
    # Automatically copy to project root for easy integration
    import shutil
    target_path = os.path.join(os.getcwd(), 'best.pt')
    shutil.copy(best_weights, target_path)
    print(f"Weights successfully copied to project root: {target_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train custom YOLOv8 model for FCFN")
    # Updated default path to match project structure
    parser.add_argument("--data", type=str, default="backend/vision/training/dataset/data.yaml", help="Path to data.yaml")
    parser.add_argument("--epochs", type=int, default=50, help="Number of training epochs")
    parser.add_argument("--imgsz", type=int, default=640, help="Image size")
    
    args = parser.parse_args()
    
    # Check if data.yaml exists
    if not os.path.exists(args.data):
        print(f"Error: {args.data} not found. Please ensure your dataset is prepared correctly.")
    else:
        train_custom_model(args.data, args.epochs, args.imgsz)
