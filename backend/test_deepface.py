import os
os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")
os.environ.setdefault("TF_ENABLE_ONEDNN_OPTS", "0")

import numpy as np
from PIL import Image
from deepface import DeepFace

# Create two simple test images (solid color with a "face-like" region)
def make_test_image(path, color):
    img = np.zeros((224, 224, 3), dtype=np.uint8)
    img[:] = color
    # Add a simple face-like region
    img[80:160, 80:160] = [255, 255, 255]
    Image.fromarray(img).save(path)

img1 = os.path.join(os.path.dirname(__file__), "test_img1.jpg")
img2 = os.path.join(os.path.dirname(__file__), "test_img2.jpg")

make_test_image(img1, [100, 100, 100])
make_test_image(img2, [100, 100, 100])

print("=== Testing DeepFace.verify with enforce_detection=False ===")
try:
    result = DeepFace.verify(
        img1_path=img1,
        img2_path=img2,
        model_name="VGG-Face",
        detector_backend="opencv",
        enforce_detection=False,
        align=True,
    )
    print("SUCCESS:", result)
except Exception as e:
    import traceback
    traceback.print_exc()
    print("ERROR TYPE:", type(e).__name__)
    print("ERROR:", str(e))

# Cleanup
for f in (img1, img2):
    try:
        os.remove(f)
    except Exception:
        pass