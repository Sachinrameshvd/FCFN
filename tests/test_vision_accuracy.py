import sys
import os
from ultralytics import YOLO

# Ensure backend can be imported
sys.path.append(os.getcwd())

def test_vision_accuracy(model_path='yolov8n.pt', data_yaml='backend/vision/training/dataset/data.yaml'):
    """
    Evaluates the model on the validation set.
    """
    if not os.path.exists(model_path):
        print(f"Error: Model weights not found at {model_path}")
        return
    
    if not os.path.exists(data_yaml):
        print(f"Note: data.yaml not found. Skipping validation test until dataset is prepared.")
        return

    print(f"Validating model: {model_path} against {data_yaml}...")
    model = YOLO(model_path)
    
    # Run validation
    metrics = model.val(data=data_yaml)
    
    print("\n--- Vision Accuracy Report ---")
    print(f"Mean Average Precision (mAP@50): {metrics.results_dict['metrics/mAP50(B)']:.4f}")
    print(f"Precision: {metrics.results_dict['metrics/precision(B)']:.4f}")
    print(f"Recall: {metrics.results_dict['metrics/recall(B)']:.4f}")
    
    if metrics.results_dict['metrics/mAP50(B)'] > 0.7:
        print("Vision Test: PASSED (Good accuracy)")
    else:
        print("Vision Test: WARNING (Low accuracy, consider more data or epochs)")

if __name__ == "__main__":
    # Default to yolov8n.pt for testing the script structure
    # The user should run this with 'best.pt' after training
    weights = 'best.pt' if os.path.exists('best.pt') else 'yolov8n.pt'
    test_vision_accuracy(weights)
