# FCFN: Raspberry Pi Extension Guide

To move from MacBook simulation to a real fridge-mounted system, follow these steps:

## 1. Hardware Requirements
- **Compute**: Raspberry Pi 4 (4GB+) or Pi 5.
- **Camera**: Raspberry Pi Camera Module 3 (Wide) or a USB Wide-Angle Webcam.
- **Sensors**: DHT22 (Temperature & Humidity) connected to GPIO.
- **Audio**: USB Microphone + 3.5mm Speaker or I2S DAC.

## 2. Code Modifications

### Vision (`backend/vision/camera.py`)
Switch from `cv2.VideoCapture(0)` to the `libcamera` wrapper or optimized Pi camera stream:
```python
# Replace OpenCV with PiCamera2 for better performance
from picamera import PiCamera
# ... in capture_and_detect ...
camera = PiCamera()
camera.capture('frame.jpg')
frame = cv2.imread('frame.jpg')
```

### Sensors (`backend/core/sensors.py`)
Add a new module to read real GPIO data:
```python
import Adafruit_DHT
def get_real_metrics():
    humidity, temperature = Adafruit_DHT.read_retry(11, 4) # Pin 4
    return {"temp": temperature, "humidity": humidity}
```

### Voice (`backend/voice/assistant.py`)
On Pi, use `faster-whisper` with `device="cpu"` and `compute_type="int8"`. For TTS, `espeak` is a lightweight alternative to `pyttsx3` if performance is tight.

## 3. Mounting Strategy
- **Camera**: Top-center of the fridge interior, angled 45° down.
- **Sensors**: One DHT22 in the door (warmest) and one in the back-bottom (coolest) for gradient tracking.
- **Display**: 7" Touchscreen mounted on the exterior door running the React Dashboard in Kiosk Mode.
