import os

class Config:
    DB_PATH = os.getenv("DB_PATH", "data/fridge.db")
    YOLO_MODEL = "yolov8n.pt"
    WHISPER_MODEL = "small.en"
    LOCATION = "Chennai"
    HUMIDITY_THRESHOLD = 80.0

config = Config()
