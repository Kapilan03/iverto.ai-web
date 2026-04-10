import cv2
import threading
import time
import os
from flask import Flask, Response
from flask_cors import CORS

# ================== SETTINGS ==================
STREAM_WIDTH = 1280
STREAM_HEIGHT = 720

# 🔴 Replace with your CCTV RTSP URL
RTSP_URL = "rtsp://admin:pass@192.168.1.100"

# ================== MODEL PATH ==================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# 🔴 If your model files are in a different folder, set the full path here:
# Model files are in the parent folder (CameraDemo)
MODEL_DIR = os.path.dirname(BASE_DIR)

# Search order: MODEL_DIR → parent folder → script folder
PROTOTXT_NAME = "deploy.prototxt"
MODEL_NAME = "res10_300x300_ssd_iter_140000.caffemodel"

PROTOTXT = None
MODEL = None

for search_dir in [MODEL_DIR, os.path.dirname(BASE_DIR), BASE_DIR]:
    p = os.path.join(search_dir, PROTOTXT_NAME)
    m = os.path.join(search_dir, MODEL_NAME)
    if os.path.exists(p) and os.path.exists(m):
        PROTOTXT = p
        MODEL = m
        print(f"Found model files in: {search_dir}")
        break

if PROTOTXT is None or MODEL is None:
    raise FileNotFoundError(
        f"Cannot find '{PROTOTXT_NAME}' and '{MODEL_NAME}'.\n"
        f"Searched in:\n"
        f"  1. {MODEL_DIR}\n"
        f"  2. {os.path.dirname(BASE_DIR)}\n"
        f"  3. {BASE_DIR}\n"
        f"Please set MODEL_DIR at line 23 to the folder containing your model files."
    )

net = cv2.dnn.readNetFromCaffe(PROTOTXT, MODEL)

# ================== FACE DETECTION ==================
def detect_faces(frame):
    h, w = frame.shape[:2]

    blob = cv2.dnn.blobFromImage(
        frame, 1.0, (300, 300),
        (104.0, 177.0, 123.0)
    )

    net.setInput(blob)
    detections = net.forward()

    faces = []
    for i in range(detections.shape[2]):
        confidence = detections[0, 0, i, 2]
        if confidence > 0.75:
            box = detections[0, 0, i, 3:7] * [w, h, w, h]
            x1, y1, x2, y2 = box.astype("int")
            faces.append((x1, y1, x2 - x1, y2 - y1))

    return faces


# ================== CAMERA CONNECTION ==================
def create_camera():
    cap = cv2.VideoCapture(RTSP_URL, cv2.CAP_FFMPEG)
    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
    return cap


cap = create_camera()

latest_frame = None
latest_processed = None
lock = threading.Lock()
running = True


# ================== BACKGROUND CAPTURE ==================
def capture_frames():
    global latest_frame, cap

    while running:
        if not cap.isOpened():
            print("Reconnecting CCTV...")
            cap.release()
            time.sleep(2)
            cap = create_camera()
            continue

        ret, frame = cap.read()

        if not ret:
            print("Camera read failed. Retrying...")
            time.sleep(1)
            continue

        with lock:
            latest_frame = frame


threading.Thread(target=capture_frames, daemon=True).start()


# ================== AI PROCESSING LOOP ==================
def process_frames():
    global latest_processed
    face_detected = False
    reset_timer = 0

    NORMAL_INTERVAL = 0.04  # ~25 FPS
    LOW_INTERVAL = 0.5      # ~2 FPS
    last_time = 0

    while running:
        if latest_frame is None:
            time.sleep(0.01)
            continue

        with lock:
            frame = latest_frame.copy()

        now = time.time()
        interval = LOW_INTERVAL if face_detected else NORMAL_INTERVAL

        if (now - last_time) >= interval:
            last_time = now

            faces = detect_faces(frame)

            if faces:
                face_detected = True
                reset_timer = time.time()
            else:
                if time.time() - reset_timer > 3:
                    face_detected = False

            # Draw rectangles on faces
            for (x, y, w, h) in faces:
                cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
                cv2.putText(frame, "FACE", (x, y - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

            # Add status text
            status = f"Faces: {len(faces)} | Mode: {'ALERT' if face_detected else 'NORMAL'}"
            cv2.putText(frame, status, (20, 40),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)

            # Resize for consistent streaming
            output = cv2.resize(frame, (STREAM_WIDTH, STREAM_HEIGHT))

            with lock:
                latest_processed = output

        time.sleep(0.01)


threading.Thread(target=process_frames, daemon=True).start()


# ================== FLASK MJPEG SERVER ==================
app = Flask(__name__)
CORS(app)  # Allow React to connect from localhost:5173


def generate_mjpeg():
    """Yields JPEG frames as a multipart HTTP response (MJPEG)."""
    while True:
        with lock:
            frame = latest_processed

        if frame is None:
            time.sleep(0.05)
            continue

        # Encode frame as JPEG
        ret, jpeg = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
        if not ret:
            continue

        yield (
            b'--frame\r\n'
            b'Content-Type: image/jpeg\r\n\r\n' + jpeg.tobytes() + b'\r\n'
        )

        time.sleep(0.03)  # ~30 FPS cap


@app.route('/cam1')
def camera_feed():
    """Serves the live MJPEG stream at http://localhost:5000/cam1"""
    return Response(
        generate_mjpeg(),
        mimetype='multipart/x-mixed-replace; boundary=frame'
    )


@app.route('/health')
def health():
    """Health check endpoint."""
    return {"status": "ok", "camera_connected": cap.isOpened()}


if __name__ == '__main__':
    print("=" * 50)
    print("  IVERTO AI Camera Stream Server")
    print("  Stream URL: http://localhost:5000/cam1")
    print("=" * 50)
    app.run(host='0.0.0.0', port=5000, threaded=True)