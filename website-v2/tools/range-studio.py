# The Products page pictures in one studio (tools/studio.py). Run: python3 tools/range-studio.py assets/img/range
# Sources: the owner's photos cut out and with the JC logo in place of the client's (see README, rounds 15-16).
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from studio import *
OUT = sys.argv[1]
def core(path, thr=230):
    r = load(path); r[..., 3] = np.where(r[..., 3] > thr, 255, 0); return r
# 1 fancy: the JC tin (3D render; its own floor shadow left out, the studio's used)
t = grade(clean(core('/tmp/work/range/fancy_1.png'), 1, 0.8), 1.04, 1.02, 0.25)
bg = backdrop(); t = scale(t, w=1060); place(bg, t, 800, FLOOR + 40, refl=0.14, shw=t.shape[1] * 0.95); save(bg, OUT + '/fancy.webp')
# 2 food cans: the group, a little larger and graded
c = grade(light(clean(load('/tmp/work/wa/food-cans.png'), 1, 1.0)), 1.1, 1.05, 0.5)
bg = backdrop(); c = scale(c, w=1180); place(bg, c, 800, FLOOR + 60, refl=0.12, shw=c.shape[1] * 0.98); save(bg, OUT + '/food-cans.webp')
# 3 containers: the olive-oil tin behind, the white-cheese tin in front
o = grade(light(clean(load('/tmp/work/wa/oil.png'), 1, 1.0)), 1.08, 1.04, 0.45)
ch = grade(light(clean(load('/tmp/work/wa/cheese.png'), 1, 1.0)), 1.08, 1.04, 0.45)
bg = backdrop(); o = scale(o, h=760); ch = scale(ch, h=440)
place(bg, o, 600, FLOOR + 10, refl=0.14); place(bg, ch, 930, FLOOR + 95, refl=0.14); save(bg, OUT + '/containers.webp')
# 4 trays: standing on the floor, the Petra tray in front
t1 = grade(load('/tmp/work/tray/tray_jc.png'), 1.06, 1.06, 0.4); t2 = grade(load('/tmp/work/wa/trays.png'), 1.06, 1.04, 0.4)
bg = backdrop(); t1 = scale(t1, w=640); t2 = scale(t2, w=760)
place(bg, t1, 560, FLOOR + 20, refl=0.12, shw=500); place(bg, t2, 990, FLOOR + 80, refl=0.12, shw=600); save(bg, OUT + '/trays.webp')
# 5 ends: the factory's own lids from the catalogue, standing in a row, the easy open end in front
def cut(c, m):
    im = np.array(Image.open(c).convert('RGB')).astype(np.float32); a = np.array(Image.open(m).convert('L').resize((im.shape[1], im.shape[0]))).astype(np.float32)
    return np.dstack([im, a])
D = '/tmp/work/cat/im/'
E = [cut(D + 'p51-008.png', D + 'p51-009.png'), cut(D + 'p51-002.png', D + 'p51-003.png'), cut(D + 'p51-006.png', D + 'p51-007.png'), cut(D + 'p51-000.png', D + 'p51-001.png'), cut(D + 'p51-004.png', D + 'p51-005.png')]
E = [grade(clean(e, 1, 0.8), 1.08, 1.04, 0.4) for e in E]
bg = backdrop()
for e, cx, w, base in [(E[0], 300, 400, FLOOR - 20), (E[1], 1300, 400, FLOOR - 20), (E[2], 560, 450, FLOOR + 30), (E[3], 1040, 450, FLOOR + 30)]:
    e = scale(e, w=w); place(bg, e, cx, base, refl=0.12, shw=w * 0.8)
e = scale(E[4], w=520); place(bg, e, 800, FLOOR + 90, refl=0.14, shw=440)
save(bg, OUT + '/ends.webp')
