# Crops the renders made by tools/renders.mjs to the tin and its soft shadow, pads them to 5:4 and saves them as webp.
#   python3 -I tools/crop_renders.py
import glob, os
from PIL import Image
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets', 'img', 'renders')
for f in glob.glob(os.path.join(D, '*.png')):
    im = Image.open(f).convert('RGBA')
    x0, y0, x1, y1 = im.split()[3].point(lambda v: 255 if v > 3 else 0).getbbox()
    w, h = x1 - x0, y1 - y0
    W = max(w / 0.9, h / 0.86 * 1.25); H = W / 1.25
    c = Image.new('RGBA', (round(W), round(H)), (0, 0, 0, 0))
    c.paste(im.crop((x0, y0, x1, y1)), (round((W - w) / 2), round((H - h) / 2)))
    c.resize((800, 640), Image.LANCZOS).save(f[:-4] + '.webp', quality=86, method=6)
    os.remove(f)
print('cropped', len(glob.glob(os.path.join(D, '*.webp'))))
