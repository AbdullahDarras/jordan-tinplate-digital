# The Products page pictures: each source (transparent PNG) cropped to its content and fitted into 1200 x 900 with a margin.
#   python3 -I tools/range-webp.py <folder with fancy.png food-cans.png containers.png trays.png ends.png> assets/img/range
import sys, os
from PIL import Image
src, out = sys.argv[1], sys.argv[2]; os.makedirs(out, exist_ok=True)
for k in ['fancy', 'food-cans', 'containers', 'trays', 'ends']:
    f = os.path.join(src, k + '.png')
    if not os.path.exists(f): print('missing', k); continue
    im = Image.open(f).convert('RGBA'); im = im.crop(im.getchannel('A').point(lambda v: 255 if v > 6 else 0).getbbox())
    s = min(1200 * 0.86 / im.width, 900 * 0.84 / im.height); im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    c = Image.new('RGBA', (1200, 900), (0, 0, 0, 0)); c.paste(im, ((1200 - im.width) // 2, (900 - im.height) // 2), im)
    c.save(os.path.join(out, k + '.webp'), 'WEBP', quality=86, alpha_quality=90, method=6); print(k, os.path.getsize(os.path.join(out, k + '.webp')) // 1024, 'KB')
