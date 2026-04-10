import cv2
import threading
import time
import subprocess

# ================== SETTINGS ==================
SMALL_WIDTH = 640
SMALL_HEIGHT = 480

# WebRTC Stream Constant Resolution (Must stay constant for ffmpeg)
STREAM_WIDTH = 1280 
STREAM_HEIGHT = 720
STREAM_FPS = 15 # Adjust based on your target broadcast framerate

# ================== LOAD FACE MODEL ==================
net = cv2.dnn.readNetFromCaffe(
    "deploy.prototxt",
    "res10_300x300_ssd_iter_140000.caffemodel"
)

def detect_faces(frame):
    h, w = frame.shape[:2]

    blob = cv2.dnn.blobFromImage(frame, 1.0, (300, 300),
                                 (104.0, 177.0, 123.0))
    net.setInput(blob)
    detections = net.forward()

    faces = []
    for i in range(detections.shape[2]):
        confidence = detections[0, 0, i, 2]

        if confidence > 0.75:
            box = detections[0, 0, i, 3:7] * [w, h, w, h]
            (x1, y1, x2, y2) = box.astype("int")
            faces.append((x1, y1, x2-x1, y2-y1))

    return faces


# ================== RTSP STREAM ==================
# Update this with your real CCTV RTSP URL
cap = cv2.VideoCapture("rtsp://url")
cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)

latest_frame = None
lock = threading.Lock()

def capture():
    global latest_frame
    while True:
        ret, frame = cap.read()
        if ret:
            with lock:
                latest_frame = frame

threading.Thread(target=capture, daemon=True).start()

# ================== SETUP MEDIAMTX CONNECTION ==================
print("Starting connection to MediaMTX...")
ffmpeg_cmd = [
    'ffmpeg',
    '-y',
    '-f', 'rawvideo',
    '-vcodec', 'rawvideo',
    '-pix_fmt', 'bgr24',
    '-s', f"{STREAM_WIDTH}x{STREAM_HEIGHT}",
    '-r', str(STREAM_FPS),
    '-i', '-', 
    '-c:v', 'libx264',
    '-preset', 'ultrafast',
    '-tune', 'zerolatency',
    '-f', 'rtsp',
    'rtsp://localhost:8554/cam1'
]
ffmpeg_process = subprocess.Popen(ffmpeg_cmd, stdin=subprocess.PIPE)


# ================== FPS CONTROL ==================
NORMAL_INTERVAL = 0.04   # ~25 FPS
LOW_INTERVAL = 0.5       # ~2 FPS

last_time = 0
face_detected = False
reset_timer = 0

# ================== MAIN LOOP ==================
while True:
    if latest_frame is None:
        continue

    with lock:
        frame = latest_frame.copy()

    now = time.time()
    interval = LOW_INTERVAL if face_detected else NORMAL_INTERVAL

    if (now - last_time) >= interval:
        last_time = now

        # 🔥 FULL RESOLUTION PROCESSING
        faces = detect_faces(frame)

        if len(faces) > 0:
            face_detected = True
            reset_timer = time.time()
        else:
            if time.time() - reset_timer > 3:
                face_detected = False

        # Draw faces
        for (x, y, w, h) in faces:
            cv2.rectangle(frame, (x, y), (x+w, y+h), (0,255,0), 2)

        # ================== DISPLAY LOGIC ==================
        if face_detected:
            # 🔴 Reduced display (high-quality resize)
            display = cv2.resize(frame, (SMALL_WIDTH, SMALL_HEIGHT),
                                 interpolation=cv2.INTER_LANCZOS4)
        else:
            # 🟢 Normal → SAME AS ORIGINAL (NO RESIZE)
            display = frame.copy()

        # ================== TEXT ==================
        mode = "LOW FPS + SMALL DISPLAY" if face_detected else "NORMAL (FULL DISPLAY)"
        cv2.putText(display, mode, (20, 40),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0,0,255), 2)

        cv2.putText(display,
                    f"Processing: {frame.shape[1]}x{frame.shape[0]}",
                    (20, 80),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.7,
                    (255,0,0),
                    2)

        cv2.putText(display,
                    f"Display: {display.shape[1]}x{display.shape[0]}",
                    (20, 120),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.7,
                    (0,255,255),
                    2)

        # ================== SHOW ==================
        cv2.imshow("Face Detection System", display)
        
        # ================== STREAM TO DASHBOARD ==================
        stream_frame = cv2.resize(display, (STREAM_WIDTH, STREAM_HEIGHT))
        
        try:
             ffmpeg_process.stdin.write(stream_frame.tobytes())
        except Exception as e:
             # Prevent crash if MediaMTX is not running
             print(f"Warning: Couldn't stream to MediaMTX. Is it running? ({e})")

    if cv2.waitKey(1) & 0xFF == 27:
        break

# Cleanup
cap.release()
cv2.destroyAllWindows()
if ffmpeg_process:
    ffmpeg_process.stdin.close()
    ffmpeg_process.wait()
