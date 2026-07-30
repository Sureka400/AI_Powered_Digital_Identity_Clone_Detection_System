import os
os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")
os.environ.setdefault("TF_ENABLE_ONEDNN_OPTS", "0")

import numpy as np
from PIL import Image
import requests

# Create two simple test images
def make_test_image(path, color):
    img = np.zeros((224, 224, 3), dtype=np.uint8)
    img[:] = color
    img[80:160, 80:160] = [255, 255, 255]
    Image.fromarray(img).save(path)

img1 = os.path.join(os.path.dirname(__file__), "test_img1.jpg")
img2 = os.path.join(os.path.dirname(__file__), "test_img2.jpg")

make_test_image(img1, [100, 100, 100])
make_test_image(img2, [100, 100, 100])

print("=== Testing /face/verify endpoint ===")
try:
    with open(img1, "rb") as f1, open(img2, "rb") as f2:
        files = {
            "image1": ("original.jpg", f1, "image/jpeg"),
            "image2": ("clone.jpg", f2, "image/jpeg"),
        }
        response = requests.post(
            "http://127.0.0.1:8000/face/verify",
            files=files,
            timeout=120,
        )
    print("Status code:", response.status_code)
    print("Response:", response.text)
except Exception as e:
    import traceback
    traceback.print_exc()
    print("ERROR:", str(e))

# Cleanup
for f in (img1, img2):
    try:
        os.remove(f)
    except Exception:
        pass