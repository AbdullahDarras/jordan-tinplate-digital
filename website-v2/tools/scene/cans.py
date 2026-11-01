import sys; sys.path.insert(0, '.')
from swap import *
img = cv2.imread('src.jpg').astype(np.float32); H, W = img.shape[:2]; yy, xx = np.mgrid[0:H, 0:W]
# Durra: the whole badge (red oval, white ring, the tab above, ®) taken out; each row rebuilt from the label on either side
for cx, cy, ax, ay in [(450, 877, 98, 42), (771, 861, 101, 42), (1121, 787, 123, 51), (1537, 792, 142, 55)]:
    s = ax / 98
    m = (((xx - cx) / (ax * 1.09)) ** 2 + ((yy - cy) / (ay * 1.2)) ** 2 < 1)
    tx, ty = cx + 16 * s, cy - ay - 12 * s
    m |= (np.abs(xx - tx) / (28 * s) + np.abs(yy - ty) / (26 * s) < 1) | ((np.abs(xx - tx) < 28 * s) & (yy > ty - 22 * s) & (yy < ty))
    # plus any white of the badge's ring or tab just outside it
    hsv0 = cv2.cvtColor(np.clip(img, 0, 255).astype(np.uint8), cv2.COLOR_BGR2HSV)
    near = (((xx - cx) / (ax * 1.3)) ** 2 + ((yy - (cy - 8 * s)) / (ay * 1.65)) ** 2 < 1)
    m |= near & (hsv0[..., 1] < 70) & (hsv0[..., 2] > 150)
    m = cv2.dilate(m.astype(np.uint8), np.ones((7, 7), np.uint8)).astype(bool)
    ys = np.where(m.any(1))[0]
    x0, x1 = int(cx - ax * 1.16), int(cx + ax * 1.16)
    fill = img.copy()
    for y in ys:
        Lc = np.median(img[max(0, y - 2):y + 3, x0 - 8:x0], axis=(0, 1)); Rc = np.median(img[max(0, y - 2):y + 3, x1:x1 + 8], axis=(0, 1))
        t = np.linspace(0, 1, x1 - x0)[:, None]; fill[y, x0:x1] = Lc * (1 - t) + Rc * t
    # the can's own light across it: keep the photo's horizontal shading (from rows just below the badge)
    a = cv2.GaussianBlur(m.astype(np.float32), (0, 0), 1.5)[..., None]
    img = img * (1 - a) + fill * a
    # the JC logo, white, straight on the label, with a faint shadow so it reads on light colours
    lg, _ = logo('h', (255, 255, 255)); w = ax * 1.75; h = int(round(w * lg.shape[0] / lg.shape[1])); lgm = cv2.resize(lg, (int(w), h), interpolation=cv2.INTER_AREA)
    X, Y = int(cx - w / 2), int(cy - h / 2)
    sh = cv2.GaussianBlur(lgm, (0, 0), 2.2) * 0.35
    img[Y + 2:Y + 2 + h, X + 1:X + 1 + int(w)] *= (1 - sh[..., None])
    img[Y:Y + h, X:X + int(w)] = img[Y:Y + h, X:X + int(w)] * (1 - lgm[..., None]) + 255 * lgm[..., None]
# Savona: the mountain badge and the navy oval -> the JC logo, white
rc = np.median(img[400:460, 1520:1560].reshape(-1, 3), 0)
d = np.hypot((xx - 1604) / 44, (yy - 428) / 31); a = np.clip((1 - d) / 0.1, 0, 1)[..., None]; img = img * (1 - a) + rc * a
navy = lambda p: (p[:, 0] > p[:, 2] + 25) & (p[:, 0] < 140)
fill_ellipse(img, 1610, 484, 101, 66, navy, ang=-8)
put(img, 'v', (255, 255, 255), 1610, 484, 128)
# Efendi: the gold lettering -> the JC logo in the same gold
hsv = cv2.cvtColor(img.astype(np.uint8), cv2.COLOR_BGR2HSV)
x0, x1, y0, y1 = 492, 690, 395, 612
gold = np.median(img[y0:y1, x0:x1][(hsv[y0:y1, x0:x1, 2] > 150) & (hsv[y0:y1, x0:x1, 1] > 60)], 0)
m = np.zeros(img.shape[:2], np.uint8); m[y0:y1, x0:x1] = ((hsv[y0:y1, x0:x1, 2] > 95)).astype(np.uint8)
m = cv2.dilate(m, np.ones((7, 7), np.uint8)) * 255
img = cv2.inpaint(np.clip(img, 0, 255).astype(np.uint8), m, 13, cv2.INPAINT_TELEA).astype(np.float32)
put(img, 'v', tuple(gold), 590, 500, 165)
cv2.imwrite('cans_jc.png', np.clip(img, 0, 255).astype(np.uint8))
cv2.imwrite('cans_chk.jpg', cv2.resize(np.clip(img, 0, 255).astype(np.uint8)[650:1050, 250:1800], (1550, 400)))
