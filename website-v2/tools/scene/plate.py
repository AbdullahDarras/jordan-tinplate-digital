import cv2, numpy as np
img = cv2.imread('plate.png').astype(np.float32); src = cv2.imread('src.jpg').astype(np.float32); H, W = img.shape[:2]
HOR = 1040; fh = H - HOR
rng = np.random.default_rng(21)
def fbm(h, w, oct=6, base=3):
    out = np.zeros((h, w), np.float32); amp = 1; tot = 0
    for o in range(oct):
        n = rng.normal(0, 1, (base * 2 ** o + 2, int(base * 2 ** o * w / h) + 2)).astype(np.float32)
        out += cv2.resize(n, (w, h), interpolation=cv2.INTER_CUBIC) * amp; tot += amp; amp *= 0.5
    return out / tot
TH, TW = 700, 2400
warp = fbm(TH, TW, 4, 2) * 0.35; n = fbm(TH, TW, 6, 2) + warp
lines = np.zeros((TH, TW), np.float32)
for lvl, wdt, k in [(0.18, 0.010, 0.55), (-0.22, 0.007, 0.45), (0.42, 0.006, 0.3), (-0.5, 0.009, 0.35)]:
    lines += np.exp(-((n - lvl) / wdt) ** 2) * k
lines = cv2.GaussianBlur(lines, (0, 0), 1.1); cloud = cv2.GaussianBlur(fbm(TH, TW, 5, 3), (0, 0), 6)
tex = 238 - lines * 55 - np.clip(cloud, 0, None) * 14
r = np.arange(fh, dtype=np.float32); z = 1 / (r + 90); vt = (1 / 90 - z) / (1 / 90 - 1 / (fh + 90)) * (TH - 1)
xs = np.arange(W, dtype=np.float32); mapx = np.zeros((fh, W), np.float32); mapy = np.zeros((fh, W), np.float32)
for i in range(fh):
    sc = 0.55 + 0.45 * (i / fh); mapx[i] = TW / 2 + (xs - W / 2) / sc * 0.8; mapy[i] = vt[i]
floor = cv2.remap(tex.astype(np.float32), mapx, mapy, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
floor = np.repeat(floor[..., None], 3, 2) * np.array([1.0, 1.0, 0.99])[None, None, :]
blur = cv2.GaussianBlur(src, (0, 0), 25)
L = blur[HOR:, 10:140].mean(1); R = blur[HOR:, 1870:1990].mean(1); t = np.linspace(0, 1, W)[None, :, None]
floor = floor * ((L[:, None, :] * (1 - t) + R[:, None, :] * t) / 238)
# a soft sunlit streak across the marble, as in the photo (diagonal, from the left)
yy, xx = np.mgrid[0:fh, 0:W].astype(np.float32)
streak = np.exp(-(((xx * 0.55 + yy * 1.3) - 700) / 260) ** 2) * 0.07; floor = floor * (1 + streak[..., None])
edge = np.exp(-((np.arange(fh) - 3) / 3.0) ** 2)[:, None, None]; floor = floor * (1 - 0.15 * edge)
plate = img.copy(); plate[HOR:] = floor
plate[HOR - 3:HOR] = plate[HOR - 3:HOR] * 0.94
cv2.imwrite('plate2.png', np.clip(plate, 0, 255).astype(np.uint8))
cv2.imwrite('plate2_s.jpg', cv2.resize(np.clip(plate, 0, 255).astype(np.uint8), (1000, 746)))
