import os
import subprocess
import sys
import argparse

def run_command(command, description):
    print(f"\n{'='*50}")
    print(f"--- {description} ---")
    print(f"Executing: {' '.join(command)}")
    print(f"{'='*50}")
    
    try:
        subprocess.run(command, check=True)
    except subprocess.CalledProcessError as e:
        print(f"Error during {description}: {e}")
        sys.exit(1)

def train_vision_model(epochs=50, imgsz=640):
    print("\n[1/3] Preparing Vision Model (YOLOv8)...")
    
    # Ensure synthetic data exists for training if dataset is empty
    generate_data_cmd = [sys.executable, "backend/vision/training/generate_mock_data.py"]
    run_command(generate_data_cmd, "Generating Mock Data for YOLOv8")
    
    # Prepare the dataset structure
    prepare_ds_cmd = [sys.executable, "backend/vision/training/prepare_dataset.py"]
    run_command(prepare_ds_cmd, "Setting up YOLOv8 Dataset Structure")
    
    # Train the model
    train_vision_cmd = [
        sys.executable, "backend/vision/training/train.py",
        "--data", "backend/vision/training/dataset/data.yaml",
        "--epochs", str(epochs),
        "--imgsz", str(imgsz)
    ]
    run_command(train_vision_cmd, f"Training YOLOv8 Vision Model ({epochs} epochs)")
    
    print("\n✅ Vision model training complete and saved as 'best.pt'")

def train_federated_model():
    print("\n[2/3] Simulating Federated Learning SpoilageNet...")
    
    fl_train_cmd = [sys.executable, "backend/simulation/federated_simulation.py"]
    run_command(fl_train_cmd, "Simulating Local and Global Model Training")
    
    print("\n✅ Federated global model trained and saved as 'global_spoilage_model.pt'")
    
def check_causal_setup():
    print("\n[3/3] Checking Causal Inference Engine...")
    print("The DoWhy causal model in 'backend/core/causal_twin.py' does not require pre-trained weights.")
    print("It builds the causal graph and calculates effects dynamically based on incoming local or synthetic historical data at runtime.")
    print("✅ Causal Engine ready.")

def main():
    parser = argparse.ArgumentParser(description="Unified Training Script for FedCausalFreshNet")
    parser.add_argument("--epochs", type=int, default=10, help="Number of epochs for vision model training")
    parser.add_argument("--imgsz", type=int, default=320, help="Image size for vision model training")
    parser.add_argument("--best", action="store_true", help="Run 'BEST' mode for maximum accuracy (High epochs, more data)")
    args = parser.parse_args()
    
    if args.best:
        print("\n🌟 RUNNING IN 'BEST' ACCURACY MODE 🌟")
        args.epochs = 100
        args.imgsz = 640
        # For 'best' we also want more federation rounds
        os.environ["FCFN_FL_ROUNDS"] = "15"
    
    print("\n🚀 Starting FedCausalFreshNet Model Training Pipeline! 🚀")
    
    if os.path.exists("best.pt"):
        print("\n✨ 'best.pt' found in root. Skipping Vision Model training to save time.")
        print("Tip: Delete 'best.pt' if you want to force a re-train.")
    else:
        train_vision_model(epochs=args.epochs, imgsz=args.imgsz)
    
    train_federated_model()
    check_causal_setup()
    
    print("\n🎉 ALL TRAINING COMPLETE! 🎉")
    print("Models 'best.pt' and 'global_spoilage_model.pt' are available in the root directory.")
    print("Tip: Use './venv/bin/python3 main.py' to start the app with these new models.")

if __name__ == "__main__":
    # Ensure script is run from project root
    if not os.path.exists("backend"):
        print("Please run this script from the project root directory (where 'backend/' is).")
        sys.exit(1)
        
    main()
