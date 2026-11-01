# helpers: put the JC logo in place of a client logo on a photo (fill the logo's area with its own ground, then the JC logo)
import cv2, numpy as np
from PIL import Image
def logo(kind, colour):
    m = np.array(Image.open(f'jc-logo-{kind}-white.png'))[..., 3].astype(np.float32) / 255
    ys, xs = np.where(m > 0.02); m = m[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    return m, np.array(colour, np.float32)
def put(img, kind, colour, cx, cy, w):
    m, c = logo(kind, colour); h = int(round(w * m.shape[0] / m.shape[1])); m = cv2.resize(m, (int(w), h), interpolation=cv2.INTER_AREA)
    x0, y0 = int(cx - w / 2), int(cy - h / 2); reg = img[y0:y0 + h, x0:x0 + int(w)]
    img[y0:y0 + h, x0:x0 + int(w)] = reg * (1 - m[..., None]) + c * m[..., None]
def fill_ellipse(img, cx, cy, ax, ay, pick=None, ang=0):
    """fill an ellipse with the median colour of its own ground (pixels pick() accepts), softly edged"""
    H, W = img.shape[:2]; yy, xx = np.mgrid[0:H, 0:W]
    t = np.deg2rad(ang); X = (xx - cx) * np.cos(t) + (yy - cy) * np.sin(t); Y = -(xx - cx) * np.sin(t) + (yy - cy) * np.cos(t)
    d = np.sqrt((X / ax) ** 2 + (Y / ay) ** 2); inside = d < 1
    px = img[inside]; sel = pick(px) if pick else np.ones(len(px), bool)
    col = np.median(px[sel], 0) if sel.sum() > 10 else np.median(px, 0)
    a = np.clip((1 - d) / 0.08, 0, 1)[..., None]; img[:] = img * (1 - a) + col * a
    return col
def fill_rect(img, x0, y0, x1, y1, col=None):
    reg = img[y0:y1, x0:x1]
    if col is None: col = np.median(np.concatenate([img[y0:y1, max(0, x0 - 8):x0].reshape(-1, 3), img[y0:y1, x1:x1 + 8].reshape(-1, 3)]), 0)
    m = np.zeros(img.shape[:2], np.uint8); m[y0:y1, x0:x1] = 255
    out = cv2.inpaint(np.clip(img, 0, 255).astype(np.uint8), m, 9, cv2.INPAINT_TELEA).astype(np.float32); img[:] = out
def alpha_clean(a, keep=1):
    """the cut-out's mask: solid inside, the largest pieces only, a soft 1 px edge"""
    b = (a > 128).astype(np.uint8); n, lbl, st, _ = cv2.connectedComponentsWithStats(b, 8)
    order = np.argsort(-st[1:, 4])[:keep] + 1; b = np.isin(lbl, order).astype(np.uint8)
    b = cv2.morphologyEx(b, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
    cs, _ = cv2.findContours(b, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE); b = np.zeros_like(b); cv2.drawContours(b, cs, -1, 1, -1)
    return (cv2.GaussianBlur(b.astype(np.float32), (0, 0), 0.8) * 255).astype(np.uint8)
