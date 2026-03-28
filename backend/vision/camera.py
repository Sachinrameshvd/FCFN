import cv2
from ultralytics import YOLO
import time

class FridgeCamera:
    def __init__(self):
        # Load custom weights if available, else fallback to YOLOv8-nano
        import os
        weights_path = 'best.pt' # Standard YOLO output
        if not os.path.exists(weights_path):
            weights_path = 'yolov8n.pt'
            
        print(f"Vision Module: Loading weights from {weights_path}")
        self.model = YOLO(weights_path)
        self.cap = None

    def capture_and_detect(self):
        # macOS AVFOUNDATION backend fix
        self.cap = cv2.VideoCapture(0)
        time.sleep(2)  # Warm-up
        
        ret, frame = self.cap.read()
        if not ret:
            self.cap.release()
            return []

        results = self.model(frame)
        detections = []
        
        for r in results:
            for box in r.boxes:
                cls = int(box.cls[0])
                name = self.model.names[cls]
                conf = float(box.conf[0])
                
                # Zone assignment logic based on 3x3 grid
                x1, y1, x2, y2 = box.xyxy[0]
                center_x = (x1 + x2) / 2
                center_y = (y1 + y2) / 2
                height, width = frame.shape[:2]
                
                # Vertical Zone (Top/Middle/Bottom -> Back/Middle/Front in fridge terms)
                if center_y < height / 3: v_zone = 'back'
                elif center_y < 2 * height / 3: v_zone = 'middle'
                else: v_zone = 'front'
                
                # Horizontal Zone (Left/Middle/Right)
                if center_x < width / 3: h_zone = 'left'
                elif center_x < 2 * width / 3: h_zone = 'center'
                else: h_zone = 'right'
                
                zone = f"{v_zone}-{h_zone}"
                
                detections.append({
                    'name': name,
                    'confidence': conf,
                    'zone': zone
                })
        
        self.cap.release()
        return detections
