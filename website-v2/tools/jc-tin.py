# The main tin in the JC identity: same tin and ornaments as the Al Qaisi lid and band, recoloured to PANTONE 294 C navy with the
# ornaments in gold, the client's logo taken out and the JC logo (vertical lock-up, gold foil, raised) put in its place.
# Run from website-v2: python3 tools/jc-tin.py assets/img/tins /path/to/jc-v.png
#   jc-v.png: the vertical logo as a white mask on transparent, rendered from brand/logo/logo-vertical.svg (tools/logo-png.cjs)
import cv2, numpy as np, sys
T = sys.argv[1]  # assets/img/tins
NAVY = np.array([0x86, 0x3d, 0x0b], np.float32)        # BGR of a lit PANTONE 294 C (#0b3d86)
GOLD = np.array([0x6c, 0xc0, 0xe3], np.float32)        # champagne gold #e3c06c
logo = cv2.imread(sys.argv[2] if len(sys.argv) > 2 else 'jc-v.png', cv2.IMREAD_UNCHANGED)[..., 3].astype(np.float32) / 255
ys, xs = np.where(logo > 0.02); logo = logo[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
def place(canvas_shape, cx, cy, w):
    h = int(round(w * logo.shape[0] / logo.shape[1])); m = cv2.resize(logo, (w, h), interpolation=cv2.INTER_AREA)
    out = np.zeros(canvas_shape, np.float32); x0, y0 = int(cx - w / 2), int(cy - h / 2)
    X0, Y0, X1, Y1 = max(0, x0), max(0, y0), min(canvas_shape[1], x0 + w), min(canvas_shape[0], y0 + h)
    if X1 > X0 and Y1 > Y0: out[Y0:Y1, X0:X1] = m[Y0 - y0:Y1 - y0, X0 - x0:X1 - x0]
    return out
def lum(img): return cv2.cvtColor(np.clip(img, 0, 255).astype(np.uint8), cv2.COLOR_BGR2GRAY).astype(np.float32)
def navy_from(L, ref):  # a clean lacquer: only the broad light of the photo, not its grain or the old print
    n = np.clip(cv2.GaussianBlur(L, (0, 0), 40) / ref, 0.7, 1.35)[..., None]; return NAVY * (0.45 + 0.6 * n)
def foil(L, ref):  # gold foil keeps the photo's light and shade
    n = np.clip(L / ref, 0.6, 1.5)[..., None]; return GOLD * (0.55 + 0.5 * n)

# ---------------------------------------------------------------- lid
col = cv2.imread(f'{T}/qaisi-lid.jpg').astype(np.float32); rel = cv2.imread(f'{T}/qaisi-lid-relief.png', 0); spt = cv2.imread(f'{T}/qaisi-lid-spot.png', 0)
N = col.shape[0]; yy, xx = np.mgrid[0:N, 0:N]; d = np.hypot(xx - N / 2, yy - N / 2) / (N / 2)
# the client's logo: inside the oval, everything that is dark or raised
box = (((xx - 1024) / 248.0) ** 2 + ((yy - 942) / 318.0) ** 2 < 1).astype(np.uint8)   # inside the oval frame
hsv = cv2.cvtColor(col.astype(np.uint8), cv2.COLOR_BGR2HSV)
lm = (((hsv[..., 2] < 140) | (np.abs(rel.astype(np.int16) - 127) > 10) | (spt > 30)) & (box > 0)).astype(np.uint8)
lm = cv2.dilate(lm, np.ones((31, 31), np.uint8)) & box
col = cv2.inpaint(col.astype(np.uint8), lm, 25, cv2.INPAINT_TELEA).astype(np.float32)
rel = rel.copy(); rel[lm > 0] = 127; spt = spt.copy(); spt[lm > 0] = 0
# recolour: navy lacquer, the stamped ornaments shaded from the relief map (crisp, unlike the photo's highlights), a light gold
# glint on their raised, lit edges, and a gold edge round the lid
L = lum(col); ref = np.median(L[d < 0.9])
r = (cv2.GaussianBlur(rel.astype(np.float32), (0, 0), 0.8) - 127) / 127
out = navy_from(L, ref) * 0.84 * np.clip(1 + 0.55 * r, 0.55, 1.6)[..., None]
m = np.clip((r - 0.28) / 0.35, 0, 0.55)
m = np.maximum(m, np.clip((d - 0.952) / 0.012, 0, 1))[..., None]
out = foil(L, ref) * m + out * (1 - m)
# the JC logo in the oval
lg = place((N, N), 1024, 915, 470)
out = out * (1 - lg[..., None]) + foil(np.full_like(L, ref * 1.12), ref) * lg[..., None]
rel = np.clip(rel.astype(np.float32) + cv2.GaussianBlur(lg, (0, 0), 2.0) * 70, 0, 255)
spt = np.maximum(spt.astype(np.float32), lg * 255)
cv2.imwrite(f'{T}/jc-lid.jpg', np.clip(out, 0, 255).astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 90])
cv2.imwrite(f'{T}/jc-lid-relief.png', rel.astype(np.uint8), [cv2.IMWRITE_PNG_COMPRESSION, 9])
cv2.imwrite(f'{T}/jc-lid-spot.png', spt.astype(np.uint8), [cv2.IMWRITE_PNG_COMPRESSION, 9])

# ---------------------------------------------------------------- side band
col = cv2.imread(f'{T}/qaisi-side.jpg').astype(np.float32); rel = cv2.imread(f'{T}/qaisi-side-relief.png', 0).astype(np.float32); spt = cv2.imread(f'{T}/qaisi-side-spot.png', 0).astype(np.float32)
H, W = col.shape[:2]; B0, B1 = 24, 346                       # the printed band between the gold rims
L = lum(col); band = np.zeros((H, W), np.float32); band[B0:B1] = 1
lines = np.clip(cv2.GaussianBlur(spt, (0, 0), 0.8) / 255 * 1.6, 0, 1)
clear = np.zeros((H, W), np.float32)
for a, b in [(0, 215), (1440, 1815), (3040, W)]: clear[B0:B1, a:b] = 1    # the client's logos (one sits on the seam)
lines *= 1 - clear; rel *= 1 - clear; spt *= 1 - clear
refB = np.median(L[B0 + 20:B1 - 20][lines[B0 + 20:B1 - 20] < 0.05])
gold = np.where(band[..., None] > 0, foil(L, np.median(L[B0:B1][lines[B0:B1] > 0.5])), col)
navy = navy_from(L, refB)
navy[clear > 0] = navy_from(np.full_like(L, refB), refB)[clear > 0]
m = np.maximum(lines, 1 - band)[..., None]
out = gold * m + navy * (1 - m)
lg = np.zeros((H, W), np.float32)
for cx in (1628, 44, 44 + W): lg = np.maximum(lg, place((H, W), cx, (B0 + B1) // 2, 300))
out = out * (1 - lg[..., None]) + foil(np.full_like(L, 150.0), 150.0) * lg[..., None]
rel = np.clip(rel + cv2.GaussianBlur(lg, (0, 0), 1.2) * 200, 0, 255); spt = np.maximum(spt, lg * 255)
cv2.imwrite(f'{T}/jc-side.jpg', np.clip(out, 0, 255).astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 90])
cv2.imwrite(f'{T}/jc-side-relief.png', rel.astype(np.uint8), [cv2.IMWRITE_PNG_COMPRESSION, 9])
cv2.imwrite(f'{T}/jc-side-spot.png', spt.astype(np.uint8), [cv2.IMWRITE_PNG_COMPRESSION, 9])
print('ok')
