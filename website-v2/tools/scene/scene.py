# The Products page pictures in one scene: the owner's food-cans photograph (white plaster wall with window light, white
# marble) and, for the other families, the same scene emptied (plate2.png) with each product placed in it: same light
# from the left, a contact shadow, a soft shadow cast back and to the right, a faint reflection in the marble.
import sys, cv2, numpy as np
from PIL import Image
sys.path.insert(0, '/tmp/work/studio'); from studio import clean, grade, scale
OUT = sys.argv[1]
PL = cv2.cvtColor(cv2.imread('plate2.png'), cv2.COLOR_BGR2RGB).astype(np.float32); H, W = PL.shape[:2]
def over(bg, rgba, x, y, k=1.0):
    h, w = rgba.shape[:2]; X0, Y0, X1, Y1 = max(0, x), max(0, y), min(W, x + w), min(H, y + h)
    s = rgba[Y0 - y:Y1 - y, X0 - x:X1 - x]; a = s[..., 3:4] / 255 * k
    bg[Y0:Y1, X0:X1] = bg[Y0:Y1, X0:X1] * (1 - a) + s[..., :3] * a
def darken(bg, mask, x, y, k):
    h, w = mask.shape[:2]; X0, Y0, X1, Y1 = max(0, x), max(0, y), min(W, x + w), min(H, y + h)
    bg[Y0:Y1, X0:X1] *= (1 - k * mask[Y0 - y:Y1 - y, X0 - x:X1 - x])[..., None]
def place(bg, rgba, cx, base, cast=0.32, refl=0.12, contact=0.5):
    h, w = rgba.shape[:2]; x = int(cx - w / 2); a = rgba[..., 3] / 255
    # cast shadow: the silhouette laid back on the marble, sheared to the right (light from the front left)
    sh_h = max(4, int(h * 0.3)); sil = cv2.resize(a[::-1], (w, sh_h), interpolation=cv2.INTER_AREA)
    shear = int(h * 0.42); canvas = np.zeros((sh_h, w + shear), np.float32)
    for i in range(sh_h): off = int(shear * (i / sh_h)); canvas[sh_h - 1 - i, off:off + w] = np.maximum(canvas[sh_h - 1 - i, off:off + w], sil[sh_h - 1 - i])
    canvas = cv2.GaussianBlur(canvas, (0, 0), 14) * np.linspace(0.55, 1, sh_h)[::-1, None]
    darken(bg, canvas, x, base - sh_h + 6, cast)
    # contact shadow
    cw = int(w * 1.04); ch = max(10, int(w * 0.07)); yy, xx = np.mgrid[0:ch * 2, 0:cw]
    d = np.hypot((xx - cw / 2) / (cw / 2), (yy - ch) / ch); cm = np.clip(1 - d, 0, 1) ** 1.3
    darken(bg, cm, int(cx - cw / 2), base - ch, contact)
    # reflection in the marble
    r = rgba[::-1].copy(); n = int(h * 0.28); fade = np.clip(1 - np.arange(h) / n, 0, 1)[:, None] ** 1.5
    r[..., 3] *= fade; r[..., :3] = cv2.GaussianBlur(r[..., :3], (0, 0), 2.0); over(bg, r, x, base, refl)
    over(bg, rgba, x, base - h)
def save(img, name):
    im = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)); s = max(1600 / im.width, 1200 / im.height)
    im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS); l, t = (im.width - 1600) // 2, (im.height - 1200) // 2
    im.crop((l, t, l + 1600, t + 1200)).save(f'{OUT}/{name}.webp', 'WEBP', quality=88, method=6)
def load(p): return np.array(Image.open(p).convert('RGBA')).astype(np.float32)
def core(p, thr=230): r = load(p); r[..., 3] = np.where(r[..., 3] > thr, 255, 0); return r
def match(r, k=(1.0, 1.0, 1.0), lift=0):   # the scene's daylight: a touch cooler and softer
    o = r.copy(); o[..., :3] = np.clip(r[..., :3] * np.array(k) + lift, 0, 255); return o
# food cans: the owner's photograph with the JC logo
save(cv2.cvtColor(cv2.imread('cans_jc.png'), cv2.COLOR_BGR2RGB), 'food-cans')
# fancy: the JC tin
bg = PL.copy(); t = grade(clean(core('/tmp/work/range/fancy_1.png'), 1, 0.8), 1.04, 1.0, 0.25); t = scale(t, w=1000)
place(bg, t, 1000, 1290); save(bg, 'fancy')
# containers: olive-oil tin and white-cheese tin
bg = PL.copy()
o = scale(grade(clean(load('/tmp/work/wa/oil.png'), 1, 1.0), 1.06, 1.02, 0.4), h=860)
c = scale(grade(clean(load('/tmp/work/wa/cheese.png'), 1, 1.0), 1.06, 1.02, 0.4), h=500)
place(bg, o, 780, 1250); place(bg, c, 1190, 1330); save(bg, 'containers')
# trays standing, the Petra tray in front
bg = PL.copy()
t1 = scale(grade(load('/tmp/work/tray/tray_jc.png'), 1.05, 1.04, 0.35), w=700); t2 = scale(grade(load('/tmp/work/wa/trays.png'), 1.05, 1.02, 0.35), w=820)
place(bg, t1, 830, 1230, cast=0.26, contact=0.4); place(bg, t2, 1270, 1320, cast=0.26, contact=0.45); save(bg, 'trays')
# ends standing in a row, the easy open end in front
def cut(c, m):
    im = np.array(Image.open(c).convert('RGB')).astype(np.float32); a = np.array(Image.open(m).convert('L').resize((im.shape[1], im.shape[0]))).astype(np.float32)
    return np.dstack([im, a])
D = '/tmp/work/cat/im/'
E = [grade(clean(cut(D + f'p51-00{i}.png', D + f'p51-00{i + 1}.png'), 1, 0.8), 1.06, 1.02, 0.35) for i in (8, 2, 6, 0, 4)]
bg = PL.copy()
for e, cx, w, base in [(E[0], 520, 420, 1200), (E[1], 1480, 420, 1200), (E[2], 790, 470, 1250), (E[3], 1210, 470, 1250)]:
    place(bg, scale(e, w=w), cx, base, cast=0.22, contact=0.4)
place(bg, scale(E[4], w=540), 1000, 1320, cast=0.25, contact=0.45); save(bg, 'ends')
