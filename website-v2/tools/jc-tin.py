# The main tin in the JC identity (owner, 2026-11-02): the Al Qaisi tin exactly as made (its stamped gold lid, its dark band with
# the gold line art, its colours), with the client's logo taken out and the JC logo (vertical lock-up) put in its places:
#   lid:  the JC logo in the dark the Al Qaisi logo was printed in, raised (embossed) like the ornaments
#   band: the JC logo in the band's gold, where the Al Qaisi logos were
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
ink = np.median(cv2.imread(f'{T}/qaisi-lid.jpg').astype(np.float32)[(lm > 0) & (hsv[..., 2] < 90)], 0)   # the old logo's dark
out = col.copy()
lg = place((N, N), 1024, 915, 470)
out = out * (1 - lg[..., None]) + ink * lg[..., None]
rel = np.clip(rel.astype(np.float32) + cv2.GaussianBlur(lg, (0, 0), 2.2) * 80, 0, 255)     # the logo raised like the ornaments
spt = np.maximum(spt.astype(np.float32), lg * 255)
cv2.imwrite(f'{T}/jc-lid.jpg', np.clip(out, 0, 255).astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 90])
# the relief and spot maps at half size: the bump and the clear coat need no more, and the page loads 1.7 MB less
half = lambda m: cv2.resize(np.clip(m, 0, 255).astype(np.uint8), (N // 2, N // 2), interpolation=cv2.INTER_AREA)
cv2.imwrite(f'{T}/jc-lid-relief.png', half(rel), [cv2.IMWRITE_PNG_COMPRESSION, 9])
cv2.imwrite(f'{T}/jc-lid-spot.png', half(spt), [cv2.IMWRITE_PNG_COMPRESSION, 9])

# ---------------------------------------------------------------- side band
col = cv2.imread(f'{T}/qaisi-side.jpg').astype(np.float32); rel = cv2.imread(f'{T}/qaisi-side-relief.png', 0).astype(np.float32); spt = cv2.imread(f'{T}/qaisi-side-spot.png', 0).astype(np.float32)
H, W = col.shape[:2]; B0, B1 = 24, 346                       # the printed band between the gold rims
L0 = lum(col); refB = np.median(L0[B0 + 20:B1 - 20][spt[B0 + 20:B1 - 20] < 20])
# take the client's logos out (one sits on the seam): plain band there
hm = np.zeros((H, W), np.uint8)
hsvB = cv2.cvtColor(col.astype(np.uint8), cv2.COLOR_BGR2HSV)
for a, b in [(0, 215), (1440, 1815), (3040, W)]:
    zone = np.zeros((H, W), bool); zone[B0 + 4:B1 - 4, a:b] = True
    hm |= (zone & ((spt > 25) | (hsvB[..., 2] > np.median(hsvB[B0 + 20:B1 - 20, 120:200, 2]) + 18))).astype(np.uint8)
    rel[B0:B1, a:b] = 0; spt[B0:B1, a:b] = 0
hm = cv2.dilate(hm, np.ones((9, 9), np.uint8))
col = cv2.inpaint(col.astype(np.uint8), hm, 9, cv2.INPAINT_TELEA).astype(np.float32)   # only the logo's pixels, from the band round them
# the JC logo in the band's gold where the Al Qaisi logos were (one sits on the seam)
gold = np.median(col[B0 + 20:B1 - 20][spt[B0 + 20:B1 - 20] > 200], 0)
lg = np.zeros((H, W), np.float32)
for cx in (1628, 44, 44 + W): lg = np.maximum(lg, place((H, W), cx, (B0 + B1) // 2, 300))
out = col * (1 - lg[..., None]) + gold * 1.05 * lg[..., None]
rel = np.clip(rel + cv2.GaussianBlur(lg, (0, 0), 1.2) * 200, 0, 255); spt = np.maximum(spt, lg * 255)
cv2.imwrite(f'{T}/jc-side.jpg', np.clip(out, 0, 255).astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 90])
cv2.imwrite(f'{T}/jc-side-relief.png', rel.astype(np.uint8), [cv2.IMWRITE_PNG_COMPRESSION, 9])
cv2.imwrite(f'{T}/jc-side-spot.png', spt.astype(np.uint8), [cv2.IMWRITE_PNG_COMPRESSION, 9])
print('ok')
