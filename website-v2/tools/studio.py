# One studio for every Products picture: a warm ivory seamless sweep with a soft light behind the subject, the same floor,
# a mirror-like floor reflection, contact and ambient shadows, the same scale and placement; each cut-out is cleaned (edge
# halo removed, edge feathered) and graded the same way (contrast, a touch of colour, sharpening).
import cv2, numpy as np
from PIL import Image
W, H, FLOOR = 1600, 1200, 905
def backdrop():
    y = np.linspace(0, 1, H)[:, None]; x = np.linspace(0, 1, W)[None, :]
    top, mid, floor = np.array([246, 243, 237]), np.array([236, 231, 222]), np.array([226, 220, 209])
    t = np.clip((y - 0) / (FLOOR / H), 0, 1)
    bg = top * (1 - t[..., None]) + mid * t[..., None]
    f = np.clip((y - FLOOR / H) / (1 - FLOOR / H), 0, 1)[..., None] * np.ones((1, W, 1))
    sweep = np.clip((y - (FLOOR - 60) / H) / (120 / H), 0, 1)[..., None]           # the soft bend of the paper, no hard line
    bg = bg * (1 - sweep) + (mid * (1 - f) + floor * f) * sweep
    d = np.hypot((x - 0.5) * 1.25, (y - 0.46) * 1.7)                                 # the light behind the subject
    bg = bg + np.array([18, 16, 12]) * np.clip(1 - d / 0.62, 0, 1)[..., None] ** 1.6
    v = np.hypot((x - 0.5) * 1.1, (y - 0.5) * 1.1); bg = bg * (1 - 0.13 * np.clip(v - 0.35, 0, 1)[..., None] / 0.5)
    noise = np.random.default_rng(1).normal(0, 1.1, (H, W, 1)); bg = bg + noise
    return np.clip(bg, 0, 255).astype(np.float32)
def clean(rgba, erode=1, feather=0.9):
    a = rgba[..., 3].astype(np.float32) / 255; rgb = rgba[..., :3].astype(np.float32)
    core = (a > 0.5).astype(np.uint8)
    if erode: core = cv2.erode(core, np.ones((2 * erode + 1, 2 * erode + 1), np.uint8))
    n, lbl, st, _ = cv2.connectedComponentsWithStats(core, 8)
    if n > 1: core = np.isin(lbl, [i for i in range(1, n) if st[i, 4] > 0.01 * st[1:, 4].max()]).astype(np.uint8)
    # edge colours: pull the outermost ring's colour from just inside (no halo of the old background)
    inner = cv2.erode(core, np.ones((5, 5), np.uint8)); ring = (core > 0) & (inner == 0)
    fill = cv2.inpaint(np.clip(rgb, 0, 255).astype(np.uint8), (ring * 255).astype(np.uint8), 3, cv2.INPAINT_TELEA).astype(np.float32)
    rgb = np.where(ring[..., None], rgb * 0.35 + fill * 0.65, rgb)
    a = cv2.GaussianBlur(core.astype(np.float32), (0, 0), feather)
    return np.dstack([rgb, a * 255])
def grade(rgba, contrast=1.08, sat=1.06, sharp=0.45, lift=0):
    rgb = rgba[..., :3].astype(np.float32)
    rgb = np.clip((rgb - 128) * contrast + 128 + lift, 0, 255)
    hsv = cv2.cvtColor(rgb.astype(np.uint8), cv2.COLOR_RGB2HSV).astype(np.float32); hsv[..., 1] = np.clip(hsv[..., 1] * sat, 0, 255)
    rgb = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2RGB).astype(np.float32)
    b = cv2.GaussianBlur(rgb, (0, 0), 1.3); rgb = np.clip(rgb * (1 + sharp) - b * sharp, 0, 255)
    return np.dstack([rgb, rgba[..., 3]])
def light(rgba, k=0.10):
    """the studio's key light from the upper left on every subject: a gentle gradient over the object"""
    h, w = rgba.shape[:2]; y = np.linspace(0, 1, h)[:, None]; x = np.linspace(0, 1, w)[None, :]
    g = 1 + k * (0.6 - (x * 0.55 + y * 0.45)); out = rgba.copy(); out[..., :3] = np.clip(rgba[..., :3] * g[..., None], 0, 255); return out
def scale(rgba, w=None, h=None):
    ys, xs = np.where(rgba[..., 3] > 8); rgba = rgba[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    s = (w / rgba.shape[1]) if w else (h / rgba.shape[0]); s = min(s, (h / rgba.shape[0]) if (w and h) else s)
    # premultiplied resize: no dark fringe
    a = rgba[..., 3:4] / 255; pm = np.dstack([rgba[..., :3] * a, rgba[..., 3:4]])
    pm = cv2.resize(pm, (max(1, round(rgba.shape[1] * s)), max(1, round(rgba.shape[0] * s))), interpolation=cv2.INTER_AREA if s < 1 else cv2.INTER_LANCZOS4)
    a = np.clip(pm[..., 3:4], 0, 255) / 255; rgb = np.where(a > 1e-3, pm[..., :3] / np.maximum(a, 1e-3), 0)
    return np.dstack([np.clip(rgb, 0, 255), np.clip(pm[..., 3:4], 0, 255)])
def over(bg, rgba, x, y, alpha_k=1.0):
    h, w = rgba.shape[:2]; X0, Y0 = max(0, x), max(0, y); X1, Y1 = min(W, x + w), min(H, y + h)
    if X1 <= X0 or Y1 <= Y0: return
    s = rgba[Y0 - y:Y1 - y, X0 - x:X1 - x]; a = s[..., 3:4] / 255 * alpha_k
    bg[Y0:Y1, X0:X1] = bg[Y0:Y1, X0:X1] * (1 - a) + s[..., :3] * a
def shade(bg, cx, base, w, depth=0.06, k=0.42, wide=0.22):
    yy, xx = np.mgrid[0:H, 0:W]
    d = np.hypot((xx - cx) / (w * 0.52), (yy - base) / (w * depth)); bg *= (1 - k * np.clip(1 - d, 0, 1) ** 1.5)[..., None]        # contact
    d2 = np.hypot((xx - cx - w * 0.06) / (w * 0.75), (yy - base - w * 0.02) / (w * 0.16)); bg *= (1 - wide * np.clip(1 - d2, 0, 1) ** 2)[..., None]  # ambient
def reflect(bg, rgba, x, base, k=0.16, frac=0.32):
    h, w = rgba.shape[:2]; r = rgba[::-1].copy(); n = int(h * frac)
    fade = np.clip(1 - np.arange(h) / max(1, n), 0, 1)[:, None] ** 1.4; r[..., 3] = r[..., 3] * fade
    r[..., :3] = cv2.GaussianBlur(r[..., :3], (0, 0), 1.6); over(bg, r, x, base, k)
def place(bg, rgba, cx, base, refl=0.16, sh=True, shw=None):
    h, w = rgba.shape[:2]; x = int(cx - w / 2)
    if sh: shade(bg, cx, base, shw or w)
    if refl: reflect(bg, rgba, x, base, refl)
    over(bg, rgba, x, base - h)
def save(bg, path):
    Image.fromarray(np.clip(bg, 0, 255).astype(np.uint8)).save(path, 'WEBP', quality=88, method=6)
def load(path):
    return np.array(Image.open(path).convert('RGBA')).astype(np.float32)
