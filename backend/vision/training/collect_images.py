import cv2
import os
import time

def main():
    # Setup directories
    base_dir = "backend/vision/training/dataset/train/images"
    os.makedirs(base_dir, exist_ok=True)
    
    # Open webcam
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        print("Error: Could not open the webcam.")
        return

    print("\n" + "="*50)
    print("🍅 FCFN Image Collection Tool 🍅")
    print("="*50)
    print(f"Images will be saved to: {base_dir}")
    print("\nInstructions:")
    print("- Press 'SPACE' to capture an image")
    print("- Press 'q' or 'ESC' to quit")
    print("="*50 + "\n")

    img_count = 0
    # Find existing image count to avoid overwriting
    existing_files = [f for f in os.listdir(base_dir) if f.startswith("real_") and f.endswith(".jpg")]
    if existing_files:
        numbers = [int(f.split("_")[1].split(".")[0]) for f in existing_files]
        img_count = max(numbers) + 1

    while True:
        ret, frame = cap.read()
        if not ret:
            print("Failed to grab frame")
            break
            
        # Display instructions on screen
        display_frame = frame.copy()
        cv2.putText(display_frame, f"Saved: {img_count} | Press SPACE to capture", 
                    (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
                    
        cv2.imshow("FCFN Data Collector", display_frame)

        k = cv2.waitKey(1)
        if k % 256 == 27 or k % 256 == ord('q'):
            # ESC or 'q' pressed
            print("Escape hit, closing...")
            break
        elif k % 256 == 32:
            # SPACE pressed
            img_name = f"real_{img_count}.jpg"
            img_path = os.path.join(base_dir, img_name)
            cv2.imwrite(img_path, frame)
            print(f"✅ Saved {img_name}!")
            
            # Briefly flash the screen to indicate capture
            flash = display_frame.copy()
            flash[:] = (255, 255, 255)
            cv2.imshow("FCFN Data Collector", flash)
            cv2.waitKey(100)
            
            img_count += 1

    cap.release()
    cv2.destroyAllWindows()
    
    print("\nNext steps:")
    print("1. Collect around 10-20 images per item (tomato, milk, etc.) from different angles.")
    print("2. Once collected, you need to draw bounding boxes around them.")
    print("3. I highly recommend using a free web tool like https://www.makesense.ai/")
    print("4. Upload your images there, create labels (tomato, apple, etc.), draw boxes, and export as 'YOLO format'.")
    print("5. Place the exported .txt files into 'backend/vision/training/dataset/train/labels'.")

if __name__ == "__main__":
    main()
