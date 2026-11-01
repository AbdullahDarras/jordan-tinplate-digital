# The main tin in the JC identity, made from the Al Qaisi tin's photos (qaisi-*), keeping its shape and every ornament:
#   lid:  PANTONE 294 C navy lacquer with the stamped ornaments (shaded from the relief map, as on the real stamped lid), the
#         client's logo taken out and the JC logo (vertical lock-up) put in its place in white, raised (embossed)
#   band: deep navy with the gold line-art ornaments only, no logo: where the client's logos were, the band's own anise star
# Run from website-v2: python3 tools/jc-tin.py assets/img/tins /path/to/jc-v.png
#   jc-v.png: the vertical logo as a white mask on transparent, rendered from brand/logo/logo-vertical.svg (tools/logo-png.cjs)
import cv2, numpy as np, sys
T = sys.argv[1]
NAVY = np.array([0x86, 0x3d, 0x0b], np.float32)        # BGR of a lit PANTONE 294 C (#0b3d86); shaded darker below
GOLD = np.array([0x6c, 0xc0, 0xe3], np.float32)        # champagne gold #e3c06c
WHITE = np.array([0xf6, 0xf3, 0xf1], np.float32)
logo = cv2.imread(sys.argv[2] if len(sys.argv) > 2 else 'jc-v.png', cv2.IMREAD_UNCHANGED)[..., 3].astype(np.float32) / 255
ys, xs = np.where(logo > 0.02); logo = logo[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
def place(shape, cx, cy, w):
    h = int(round(w * logo.shape[0] / logo.shape[1])); m = cv2.resize(logo, (w, h), interpolation=cv2.INTER_AREA)
    out = np.zeros(shape, np.float32); x0, y0 = int(cx - w / 2), int(cy - h / 2)
    X0, Y0, X1, Y1 = max(0, x0), max(0, y0), min(shape[1], x0 + w), min(shape[0], y0 + h)
    if X1 > X0 and Y1 > Y0: out[Y0:Y1, X0:X1] = m[Y0 - y0:Y1 - y0, X0 - x0:X1 - x0]
    return out
def lum(img): return cv2.cvtColor(np.clip(img, 0, 255).astype(np.uint8), cv2.COLOR_BGR2GRAY).astype(np.float32)
def navy_from(L, ref, k=1.0):  # a clean lacquer: only the broad light of the photo, not its grain or the old print
    n = np.clip(cv2.GaussianBlur(L, (0, 0), 40) / ref, 0.7, 1.35)[..., None]; return NAVY * (0.45 + 0.6 * n) * k
def foil(L, ref):
    n = np.clip(L / ref, 0.6, 1.5)[..., None]; return GOLD * (0.55 + 0.5 * n)

# ---------------------------------------------------------------- lid
col = cv2.imread(f'{T}/qaisi-lid.jpg').astype(np.float32); rel = cv2.imread(f'{T}/qaisi-lid-relief.png', 0); spt = cv2.imread(f'{T}/qaisi-lid-spot.png', 0)
N = col.shape[0]; yy, xx = np.mgrid[0:N, 0:N]
box = (((xx - 1024) / 248.0) ** 2 + ((yy - 942) / 318.0) ** 2 < 1).astype(np.uint8)   # inside the oval frame
box[np.hypot(xx - 1262, yy - 1058) < 46] = 1                                         # the registered mark, just inside the frame
hsv = cv2.cvtColor(col.astype(np.uint8), cv2.COLOR_BGR2HSV)
lm = (((hsv[..., 2] < 140) | (np.abs(rel.astype(np.int16) - 127) > 10) | (spt > 30)) & (box > 0)).astype(np.uint8)
lm = cv2.dilate(lm, np.ones((31, 31), np.uint8)) & box
col = cv2.inpaint(col.astype(np.uint8), lm, 25, cv2.INPAINT_TELEA).astype(np.float32)
rel = rel.copy(); rel[lm > 0] = 127; spt = spt.copy(); spt[lm > 0] = 0
L = lum(col); ref = np.median(L)
r = (cv2.GaussianBlur(rel.astype(np.float32), (0, 0), 0.9) - 127) / 127
out = navy_from(L, ref, 0.66) * np.clip(1 + 0.75 * r, 0.45, 1.9)[..., None]      # the stamped ornaments, lit and shaded
lg = place((N, N), 1024, 915, 470)
out = out * (1 - lg[..., None]) + WHITE * lg[..., None]
rel = np.clip(rel.astype(np.float32) + cv2.GaussianBlur(lg, (0, 0), 2.2) * 80, 0, 255)     # the logo raised like the ornaments
spt = np.maximum(spt.astype(np.float32), lg * 255)
cv2.imwrite(f'{T}/jc-lid.jpg', np.clip(out, 0, 255).astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 90])
cv2.imwrite(f'{T}/jc-lid-relief.png', rel.astype(np.uint8), [cv2.IMWRITE_PNG_COMPRESSION, 9])
cv2.imwrite(f'{T}/jc-lid-spot.png', spt.astype(np.uint8), [cv2.IMWRITE_PNG_COMPRESSION, 9])

# ---------------------------------------------------------------- side band
col = cv2.imread(f'{T}/qaisi-side.jpg').astype(np.float32); rel = cv2.imread(f'{T}/qaisi-side-relief.png', 0).astype(np.float32); spt = cv2.imread(f'{T}/qaisi-side-spot.png', 0).astype(np.float32)
H, W = col.shape[:2]; B0, B1 = 24, 346                       # the printed band between the gold rims
L0 = lum(col); refB = np.median(L0[B0 + 20:B1 - 20][spt[B0 + 20:B1 - 20] < 20])
# take the client's logos out (one sits on the seam): plain band there
for a, b in [(0, 215), (1440, 1815), (3040, W)]:
    col[B0:B1, a:b] = np.median(col[B0 + 20:B1 - 20, 120:200].reshape(-1, 3), 0); rel[B0:B1, a:b] = 0; spt[B0:B1, a:b] = 0
# the band's own anise star in each gap, so the ornaments run on round the tin
sy0, sy1, sx0, sx1 = 138, 246, 1166, 1276
patch = [a[sy0:sy1, sx0:sx1].copy() for a in (col, rel, spt)]
for cx in (1628, 44, 44 + W):
    x0 = cx - (sx1 - sx0) // 2
    for arr, p in zip((col, rel, spt), patch):
        X0, X1 = max(0, x0), min(W, x0 + p.shape[1])
        if X1 > X0: arr[sy0:sy1, X0:X1] = p[:, X0 - x0:X1 - x0]
L = lum(col); band = np.zeros((H, W), np.float32); band[B0:B1] = 1
lines = np.clip(cv2.GaussianBlur(spt, (0, 0), 0.8) / 255 * 1.6, 0, 1)
gold = np.where(band[..., None] > 0, foil(L, np.median(L[B0:B1][lines[B0:B1] > 0.5])), col)
navy = navy_from(np.where(band > 0, refB, L).astype(np.float32), refB, 0.58)
m = np.maximum(lines, 1 - band)[..., None]
out = gold * m + navy * (1 - m)
cv2.imwrite(f'{T}/jc-side.jpg', np.clip(out, 0, 255).astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 90])
cv2.imwrite(f'{T}/jc-side-relief.png', rel.astype(np.uint8), [cv2.IMWRITE_PNG_COMPRESSION, 9])
cv2.imwrite(f'{T}/jc-side-spot.png', spt.astype(np.uint8), [cv2.IMWRITE_PNG_COMPRESSION, 9])
print('ok')
