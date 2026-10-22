#!/usr/bin/env python3
"""Validate the generated site: well-formed HTML, internal links/anchors, hreflang reciprocity,
canonical, unique title/description, JSON-LD, sitemap, the creative-experience contract (shared chrome, 3D stages with
fallbacks, entrance only on the home pages, self-hosted libraries, no external JavaScript) and the approved decisions
(names, order-tool links, certificates shown only as image + name, no Saudi branch, olive-oil sizes), the gallery (click-to-load video facades,
photo grid only when photos exist, nav / sitemap / hreflang wiring, image files and dimensions), the final logo, the PANTONE 294 C palette
(WCAG contrast of the tokens) and that nothing "to be confirmed" is visible while SHOW_PENDING is false (see website/PENDING.md).
Usage: python3 -I website/tools/validate.py"""
import json, re, sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse, urldefrag

ROOT = Path(__file__).resolve().parent.parent
CONTENT = (ROOT / "tools/content.mjs").read_text(encoding="utf-8")
SHOW_PENDING = bool(re.search(r"export const SHOW_PENDING\s*=\s*true", CONTENT))
VOID = {"meta", "link", "br", "hr", "img", "input", "source", "area", "base", "col", "embed", "track", "wbr"}
errors = []
def err(msg): errors.append(msg)

class P(HTMLParser):
    def __init__(self, name):
        super().__init__(convert_charrefs=True)
        self.name, self.stack, self.ids, self.links, self.alts = name, [], set(), [], {}
        self.canonical = self.title = self.desc = None
        self.in_title = False; self.in_ld = False; self.ld = []; self.h1 = 0
        self.root_attrs = {}; self.meta = {}; self.imgs_no_alt = 0
        self.anchors = []; self.stages = []; self.scripts = []; self.ids_tag = {}; self.text = []; self.skip_text = 0; self.importmap = []; self.in_importmap = False
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "html": self.root_attrs = a
        if "id" in a:
            if a["id"] in self.ids: err(f"{self.name}: duplicate id {a['id']}")
            self.ids.add(a["id"])
        if tag == "h1": self.h1 += 1
        if tag == "a" and "href" in a: self.links.append(a["href"]); self.anchors.append(a)
        if "id" in a: self.ids_tag[a["id"]] = tag
        if "class" in a and "stage" in a["class"].split(): self.stages.append(a)
        if tag == "script": self.scripts.append(a); self.skip_text += 1
        if tag == "script" and a.get("type") == "importmap": self.in_importmap = True
        if tag in ("link",) and "href" in a:
            if a.get("rel") == "canonical": self.canonical = a["href"]
            elif a.get("rel") == "alternate" and "hreflang" in a: self.alts[a["hreflang"]] = a["href"]
            elif a.get("rel") in ("stylesheet", "icon"): self.links.append(a["href"])
        if tag == "script" and "src" in a: self.links.append(a["src"])
        if tag == "meta":
            if a.get("name") == "description": self.desc = a.get("content")
            k = a.get("property") or a.get("name")
            if k: self.meta[k] = a.get("content")
        if tag == "title": self.in_title = True
        if tag == "script" and a.get("type") == "application/ld+json": self.in_ld = True
        if tag not in VOID: self.stack.append(tag)
    def handle_startendtag(self, tag, attrs):  # <path/> etc. in SVG
        pass
    def handle_endtag(self, tag):
        if tag in VOID: return
        if not self.stack or self.stack[-1] != tag:
            err(f"{self.name}: mismatched </{tag}> (open: {self.stack[-3:]}) line {self.getpos()[0]}")
            if tag in self.stack:
                while self.stack and self.stack.pop() != tag: pass
            return
        self.stack.pop()
        if tag == "title": self.in_title = False
        if tag == "script": self.in_ld = False; self.in_importmap = False; self.skip_text -= 1
    def handle_data(self, d):
        if self.in_title: self.title = (self.title or "") + d
        if self.in_ld: self.ld.append(d)
        if self.in_importmap: self.importmap.append(d)
        if not self.skip_text: self.text.append(d)

pages = sorted(ROOT.rglob("index.html")) + [ROOT / "404.html"]
pages = [p for p in pages if "tools" not in p.parts]
parsed = {}
for f in pages:
    name = "/" + str(f.relative_to(ROOT))
    p = P(name); p.feed(f.read_text(encoding="utf-8")); p.close()
    if p.stack: err(f"{name}: unclosed {p.stack}")
    parsed[f] = p

def resolve(href, src_url):
    """map an internal href to a file under ROOT, or None if external/ignored"""
    if re.match(r"^(mailto:|tel:|data:|javascript:)", href): return "skip"
    u = urlparse(href)
    if u.scheme in ("http", "https") and u.netloc not in ("www.jordantinplate.com", "") : return "skip"
    if u.scheme in ("http", "https"):
        if u.path.startswith("/pdf/"): return "skip"        # existing site's catalogue PDF
    path = u.path or src_url
    t = ROOT / path.lstrip("/")
    if path.endswith("/"): t = t / "index.html"
    return t

ORIGIN = None
url_of = {}
for f, p in parsed.items():
    rel = "/" + str(f.relative_to(ROOT))
    url_of[f] = rel.replace("index.html", "")

site_pages = [f for f in pages if f.parts[len(ROOT.parts)] in ("en", "ar")]
titles, descs, alt_map = {}, {}, {}
for f, p in parsed.items():
    n = p.name
    for l in p.links:
        r = resolve(l, url_of[f])
        if r == "skip": continue
        if not r.exists(): err(f"{n}: broken link {l}")
        elif urlparse(l).fragment:
            frag = urlparse(l).fragment
            tgt = parsed.get(r)
            if tgt is not None and frag not in tgt.ids: err(f"{n}: missing anchor {l}")
    if f in site_pages:
        lang = f.parts[len(ROOT.parts)]
        if p.root_attrs.get("lang") != lang: err(f"{n}: lang attr")
        if p.root_attrs.get("dir") != ("rtl" if lang == "ar" else "ltr"): err(f"{n}: dir attr")
        if p.h1 != 1: err(f"{n}: {p.h1} h1")
        for k in ("og:title", "og:description", "og:url", "og:image", "og:locale", "twitter:card"):
            if not p.meta.get(k): err(f"{n}: missing {k}")
        if not p.title or not p.desc: err(f"{n}: title/description missing")
        if p.title in titles: err(f"{n}: title duplicates {titles[p.title]}")
        if p.desc in descs: err(f"{n}: description duplicates {descs[p.desc]}")
        titles[p.title] = n; descs[p.desc] = n
        if len(p.desc) > 200: err(f"{n}: description {len(p.desc)} chars")
        if p.meta.get("og:title") != p.title.strip(): err(f"{n}: og:title != title")
        # canonical == own hreflang entry == og:url
        if p.alts.get(lang) != p.canonical: err(f"{n}: canonical != self hreflang")
        if p.meta.get("og:url") != p.canonical: err(f"{n}: og:url != canonical")
        if not p.canonical.endswith(url_of[f]): err(f"{n}: canonical does not match file path")
        if set(p.alts) != {"en", "ar", "x-default"}: err(f"{n}: hreflang set {sorted(p.alts)}")
        alt_map[p.canonical] = p.alts
        # JSON-LD
        try:
            ld = json.loads("".join(p.ld)); types = [g["@type"] for g in ld["@graph"]]
            for need in ("Organization", "WebSite"):
                if need not in types: err(f"{n}: JSON-LD missing {need}")
            is_home = url_of[f] in ("/en/", "/ar/")
            if is_home == ("BreadcrumbList" in types): err(f"{n}: BreadcrumbList presence wrong (home={is_home})")
        except Exception as e:
            err(f"{n}: JSON-LD invalid: {e}")
        # language switch link points at the equivalent page
        sw = re.search(r'<a class="tool tool--lang"[^>]*? href="([^"]+)"', f.read_text(encoding="utf-8"))
        other = "ar" if lang == "en" else "en"
        if not sw or sw.group(1) != url_of[f].replace(f"/{lang}/", f"/{other}/", 1): err(f"{n}: language switch href {sw and sw.group(1)}")

# hreflang reciprocity: every alternate must exist, list the page back, and agree on the full set
for url, alts in alt_map.items():
    for lang, target in alts.items():
        if target not in alt_map: err(f"hreflang: {url} -> {lang} {target} is not a page"); continue
        if alt_map[target] != alts: err(f"hreflang: set at {target} differs from {url} (not reciprocal)")
        if lang != "x-default" and not target.split("/")[3] == lang: err(f"hreflang: {lang} points to {target}")

# sitemap
sm = (ROOT / "sitemap.xml").read_text(encoding="utf-8")
locs = re.findall(r"<loc>([^<]+)</loc>", sm)
if sorted(locs) != sorted(alt_map): err(f"sitemap <loc> set != pages ({len(locs)} vs {len(alt_map)})")
for block in re.findall(r"<url>(.*?)</url>", sm, re.S):
    loc = re.search(r"<loc>([^<]+)", block).group(1)
    got = dict(re.findall(r'hreflang="([^"]+)" href="([^"]+)"', block))
    if got != alt_map.get(loc): err(f"sitemap alternates for {loc} differ from page hreflang")
robots = (ROOT / "robots.txt").read_text()
if "Sitemap:" not in robots: err("robots.txt lacks Sitemap")
REQUIRED = ("assets/img/og-default.png", "assets/img/favicon.svg", "assets/css/site.css", "assets/js/site.js",
            "assets/js/engine/main.js", "assets/js/engine/scene.js", "assets/js/engine/art.js", "assets/data/land-110m.geojson",
            "assets/vendor/three/three.module.min.js", "assets/vendor/three/addons/environments/RoomEnvironment.js",
            "assets/vendor/three/addons/geometries/RoundedBoxGeometry.js", "assets/vendor/gsap/gsap.min.js",
            "assets/vendor/gsap/ScrollTrigger.min.js", "assets/vendor/lenis/lenis.min.js")
for must in REQUIRED:
    if not (ROOT / must).exists(): err(f"missing {must}")
if (ROOT / "prototype").exists(): err("website/prototype/ should be gone (superseded by the integrated site)")
for imp in re.findall(r"""from\s+['"](\.[^'"]+)['"]""", (ROOT / "assets/js/engine/scene.js").read_text()):
    if not (ROOT / "assets/js/engine" / imp).exists(): err(f"scene.js imports missing {imp}")

# ---- creative-experience contract + approved decisions, per page
NAME_AR = "الشركة الأردنية لصناعة وطباعة الصفيح والعبوات المعدنية"
def image_size(path):
    """(width, height) of a JPEG or WebP file read from its header (stdlib only)"""
    b = path.read_bytes()
    if b[:2] == b"\xff\xd8":
        i = 2
        while i < len(b):
            if b[i] != 0xFF: i += 1; continue
            mk = b[i + 1]
            if mk in (0xD8, 0x01) or 0xD0 <= mk <= 0xD7: i += 2; continue
            ln = int.from_bytes(b[i + 2:i + 4], "big")
            if 0xC0 <= mk <= 0xCF and mk not in (0xC4, 0xC8, 0xCC): return int.from_bytes(b[i + 7:i + 9], "big"), int.from_bytes(b[i + 5:i + 7], "big")
            i += 2 + ln
    if b[:4] == b"RIFF" and b[8:12] == b"WEBP":
        k = b[12:16]
        if k == b"VP8X": return int.from_bytes(b[24:27], "little") + 1, int.from_bytes(b[27:30], "little") + 1
        if k == b"VP8 ": return int.from_bytes(b[26:28], "little") & 0x3FFF, int.from_bytes(b[28:30], "little") & 0x3FFF
        if k == b"VP8L": v = int.from_bytes(b[21:25], "little"); return (v & 0x3FFF) + 1, ((v >> 14) & 0x3FFF) + 1
    return None
IMG_SIZES = {}
for base in ("fssc-22000", "jfda-food-contact"):
    sizes = {ext: image_size(ROOT / f"assets/img/certs/{base}.{ext}") if (ROOT / f"assets/img/certs/{base}.{ext}").exists() else None for ext in ("jpg", "webp")}
    if None in sizes.values() or sizes["jpg"] != sizes["webp"]: err(f"certificate image {base}: missing file or jpg/webp sizes differ {sizes}")
    IMG_SIZES[base] = sizes["jpg"]
MAIN_VIDEO = (re.search(r"mainVideoId:\s*'([\w-]{11})'", CONTENT) or [None, ""])[1]
VIDEO_IDS = re.findall(r"\{ id: '([\w-]{11})', label: t\(", CONTENT)
if not MAIN_VIDEO or MAIN_VIDEO not in VIDEO_IDS: err("SITE.mainVideoId must be one of the VIDEOS ids")
if sorted(VIDEO_IDS) != ["CQW1UaWpC2k", "xozO8TLl6T8"]: err(f"VIDEOS ids are {VIDEO_IDS}")
SITE_FB = (re.search(r"Facebook: '([^']+)'", CONTENT) or [None, ""])[1]
PHOTO_ENTRIES = len(re.findall(r"alt_en:", (re.search(r"export const PHOTOS = \[(.*?)\n?\];", CONTENT, re.S) or [None, ""])[1]))
for pm in re.finditer(r"\{[^{}]*src:\s*'([^']+)'[^{}]*\}", (re.search(r"export const PHOTOS = \[(.*?)\n?\];", CONTENT, re.S) or [None, ""])[1]):
    if not (ROOT / pm.group(1).lstrip("/")).exists(): err(f"PHOTOS: file {pm.group(1)} does not exist")
    if "alt_en" not in pm.group(0) or "alt_ar" not in pm.group(0): err(f"PHOTOS: {pm.group(1)} lacks alt_en / alt_ar")
FORBIDDEN = ["ISO 9001", "ISO 22000", "HACCP", "BRC", "UKAS", "JO000011", "COID", "2029", "31 December 2026", "2026-12-31", "31/12/2026", "Saudi branch", "branch in Saudi", "فرع في السعودية", "فرع السعودية", "مصنع الأردنية", "JORDAN CANNING</"]
for f in site_pages:
    p = parsed[f]; n = p.name; src = f.read_text(encoding="utf-8")
    lang = f.parts[len(ROOT.parts)]
    is_home = url_of[f] in ("/en/", "/ar/")
    for need, label in (('id="main"', "main landmark"), ('class="skip"', "skip link"), ('id="themeBtn"', "theme button"), ('id="burger"', "menu button"),
                        ('id="menu"', "mobile menu"), ('id="curtain"', "page-transition curtain"), ('id="jt-data"', "engine data"), ('class="cursor', "custom cursor"),
                        ('type="importmap"', "import map"), ('assets/js/engine/main.js', "engine script"), ('assets/js/site.js', "site script"),
                        ('<footer class="foot">', "footer"), ('id="contact"', "contact section"), ('rel="stylesheet" href="/assets/css/site.css', "stylesheet")):
        if need not in src: err(f"{n}: missing {label}")
    # no external JavaScript: every script is same-origin (or inline)
    for sc in p.scripts:
        if sc.get("src") and re.match(r"^(https?:)?//", sc["src"]): err(f"{n}: external script {sc['src']}")
    im = json.loads("".join(p.importmap) or "{}").get("imports", {})
    if not all(v.startswith("/assets/vendor/") for v in im.values()) or "three" not in im: err(f"{n}: import map must point at /assets/vendor/")
    # entrance: only on the two home pages (once per session, with a Skip button)
    has_loader = 'id="loader"' in src
    if has_loader != is_home: err(f"{n}: loader present={has_loader} but home={is_home}")
    if is_home and ('id="ldSkip"' not in src): err(f"{n}: entrance has no Skip button")
    if is_home and "jt-intro" not in src: err(f"{n}: home page does not manage the once-per-session flag")
    # every 3D stage is labelled and carries a drawing fallback (the loader's stage is decorative)
    for st in p.stages:
        deco = st.get("aria-hidden") == "true"
        if not deco and (st.get("role") != "img" or not st.get("aria-label")): err(f"{n}: stage without role=img + aria-label")
    if f.name == "index.html" and url_of[f] != "/ar/contact/" and url_of[f] != "/en/contact/":
        if not [s for s in p.stages if s.get("data-pose") == "hero" and s.get("role") == "img"]: err(f"{n}: no hero 3D stage")
    if src.count('class="stage__fb"') < len([s for s in p.stages if s.get("aria-hidden") != "true"]): err(f"{n}: a stage lacks its SVG fallback")
    # the order tool opens in a new tab with noopener; mailto fallback exists
    orders = [a for a in p.anchors if a["href"].startswith("https://jc-order.netlify.app")]
    if not orders: err(f"{n}: no link to the order tool")
    for a in orders:
        if a.get("target") != "_blank" or "noopener" not in a.get("rel", ""): err(f"{n}: order-tool link without target=_blank rel=noopener")
    if any(a["href"].rstrip("/").endswith("/prototype") or "/prototype/" in a["href"] for a in p.anchors): err(f"{n}: links to /prototype/")
    # external links never open without noopener
    for a in p.anchors:
        if a.get("target") == "_blank" and "noopener" not in a.get("rel", ""): err(f"{n}: target=_blank without noopener: {a['href']}")
    # decisions
    visible = " ".join(p.text)
    for bad in FORBIDDEN:
        if bad in src: err(f"{n}: forbidden text {bad!r}")
    if re.search(r"(?<!J)FDA", visible.replace("JFDA", "")) or "warranty" in visible.lower(): err(f"{n}: FDA claim / warranty text")
    # certifications: a heading and two cards (certificate image + name only). No table, list of facts, number, date or scope text.
    m = re.search(r'<section class="certs"[^>]*>(.*?)</section>', src, re.S)
    if not m:
        if is_home or url_of[f].endswith("/about/"): err(f"{n}: certifications section missing")
    else:
        cs = m.group(1)
        if len(re.findall(r'<li class="cert"', cs)) != 2: err(f"{n}: certifications must be exactly two cards")
        if len(re.findall(r"<h[1-6]\b", cs)) != 1 or not re.search(r"<h2[^>]*>" + ("الاعتمادات" if lang == "ar" else "Certifications") + "</h2>", cs): err(f"{n}: certifications heading must be the only heading and read Certifications / الاعتمادات")
        for bad in ("<table", "<tr", "<td", "<th", "<dl", "<dt", "<dd", "qlist", "valid", "Valid", "Scope", "scope", "سارية", "النطاق", "رقم الشهادة"):
            if bad in cs: err(f"{n}: certifications block contains {bad!r} (image + name only)")
        if len(re.findall(r"\d", re.sub(r"<[^>]+>", " ", cs).replace("22000", ""))): err(f"{n}: certifications block shows a number or date in its text")
        names = re.findall(r"<figcaption>(.*?)</figcaption>", cs, re.S)
        want = (["FSSC 22000", "Bureau Veritas"], ["اعتماد مواد ملامسة للأغذية — المؤسسة العامة للغذاء والدواء (JFDA)"]) if lang == "ar" else (["FSSC 22000", "Bureau Veritas"], ["Food-contact materials approval — JFDA"])
        if len(names) != 2 or any(w not in names[i] for i, ws in enumerate(want) for w in ws): err(f"{n}: certificate names wrong: {names}")
        pics = re.findall(r"<picture>(.*?)</picture>", cs, re.S)
        if len(pics) != 2: err(f"{n}: each certificate needs a <picture>")
        for pic, base in zip(pics, ("fssc-22000", "jfda-food-contact")):
            if f"/assets/img/certs/{base}.webp" not in pic or f'src="/assets/img/certs/{base}.jpg"' not in pic: err(f"{n}: <picture> for {base} lacks the webp source / jpg fallback")
            im = re.search(r"<img\b([^>]*)>", pic)
            at = dict(re.findall(r'([\w-]+)="([^"]*)"', im.group(1))) if im else {}
            if not at.get("alt", "").strip(): err(f"{n}: certificate image {base} has no alt text")
            if at.get("loading") != "lazy": err(f"{n}: certificate image {base} is not lazy-loaded")
            real = IMG_SIZES.get(base)
            if not real or (at.get("width"), at.get("height")) != (str(real[0]), str(real[1])): err(f"{n}: certificate image {base} width/height {at.get('width')}x{at.get('height')} != file {real}")
        if 'id="lightbox"' not in src or src.count('data-lightbox="certs"') != 2: err(f"{n}: certificate lightbox wiring missing")
    # images on the page: always alt + dimensions or a fixed frame; only the approved sources (no separate FSSC / UKAS / JFDA / Bureau Veritas logo files)
    for im in re.finditer(r"<img\b([^>]*)>", src):
        at = dict(re.findall(r'([\w-]+)="([^"]*)"', im.group(1)))
        if "alt" not in at: err(f"{n}: <img> without alt: {at.get('src')}")
        sp = at.get("src", "")
        if not (sp.startswith("/assets/img/certs/") or sp.startswith("/assets/img/gallery/") or re.match(r"https://i\.ytimg\.com/vi/[\w-]{11}/hqdefault\.jpg$", sp)): err(f"{n}: image from an unapproved source {sp}")
        if sp.startswith("/assets/") and not (ROOT / sp.lstrip("/")).exists(): err(f"{n}: image file missing {sp}")
        if re.search(r"logo|ukas|fssc-mark|bureau", sp, re.I): err(f"{n}: logo file used as an image: {sp}")
    # video facades: no iframe or YouTube script is ever in the page (it is created on click); only the youtube-nocookie embed is allowed in script
    if "<iframe" in src: err(f"{n}: an iframe is in the HTML (videos must be click-to-load facades)")
    if re.search(r'<script[^>]+src="[^"]*(youtube|ytimg|facebook)', src): err(f"{n}: third-party video script")
    for vm in re.finditer(r'<div class="vid" data-vid="([^"]*)" data-title="([^"]*)">(.*?)</a>\s*</div>', src, re.S):
        vid, title, body = vm.groups()
        if not re.fullmatch(r"[\w-]{11}", vid): err(f"{n}: bad YouTube id {vid!r}")
        if not title.strip() or 'aria-label="' not in body or f"https://www.youtube.com/watch?v={vid}" not in body: err(f"{n}: video facade {vid} lacks title / aria-label / no-JS link")
        if 'class="vid__gear"' not in body or 'class="vid__btn"' not in body or f"https://i.ytimg.com/vi/{vid}/hqdefault.jpg" not in body: err(f"{n}: video facade {vid} lacks poster / fallback pieces")
    # nav wiring of the gallery page: header, mobile menu and footer
    gl = f"/{lang}/gallery/"
    if src.count(f'href="{gl}"') < 3: err(f"{n}: gallery link must be in the header nav, the mobile menu and the footer (found {src.count(f'href={chr(34)}{gl}{chr(34)}')})")
    if 'class="foot__cert"' in src or re.search(r"<footer.*?FSSC", src, re.S): err(f"{n}: the footer must not carry certification text")
    if is_home and f'href="{gl}"' not in re.search(r'<section class="story".*?</section>', src, re.S).group(0): err(f"{n}: home page has no gallery link in the story section")
    if url_of[f].endswith("/about/"):
        am = re.search(r'<section class="featured".*?</section>', src, re.S)
        if not am or f'data-vid="{MAIN_VIDEO}"' not in am.group(0) or f'href="{gl}"' not in am.group(0): err(f"{n}: About page lacks the featured video (SITE.mainVideoId) with its gallery link")
        elif src.index('class="featured"') > src.index('class="story"'): err(f"{n}: the featured video must come before the story")
    if url_of[f].endswith("/gallery/"):
        for vid_id in VIDEO_IDS:
            if f'data-vid="{vid_id}"' not in src: err(f"{n}: gallery lacks video {vid_id}")
        if SITE_FB not in src: err(f"{n}: gallery lacks the Facebook page card")
        has_sec = 'id="photos"' in src
        if PHOTO_ENTRIES == 0 and (has_sec or 'class="photos"' in src): err(f"{n}: empty PHOTOS list must render nothing for photos")
        if PHOTO_ENTRIES and (not has_sec or src.count('data-lightbox="photos"') != PHOTO_ENTRIES): err(f"{n}: photo grid does not match PHOTOS ({PHOTO_ENTRIES})")
    elif 'class="photos"' in src or 'data-lightbox="photos"' in src: err(f"{n}: photo grid outside the gallery")
    if "@jordantinplate" not in src: err(f"{n}: handle @jordantinplate missing")
    if lang == "ar" and (NAME_AR not in src or p.root_attrs.get("dir") != "rtl"): err(f"{n}: official Arabic name missing")
    if lang == "en" and "Jordan Tinplate Canning" not in src: err(f"{n}: official English name missing")
    if re.search(r"\bCanning\b", visible) and "Tinplate Canning" not in visible and "Jordan Canning" in visible: err(f"{n}: 'Canning' used without the full name")
    if "Al-Zmailat" not in src and lang == "en": err(f"{n}: address missing")
    if "الزميلات" not in src and lang == "ar": err(f"{n}: address missing")
    if url_of[f].endswith("/olive-oil/"):
        for size in ("1 L/kg", "4 L/kg", "8 L/kg", "16 L/kg") if lang == "en" else ("1 لتر/كغ", "4 لتر/كغ", "8 لتر/كغ", "16 لتر/كغ"):
            if size not in src: err(f"{n}: olive-oil size {size} missing")
        if 'data-shape="oil8"' not in src: err(f"{n}: olive-oil hero tin not configured")
    # headings: split-text headings keep their text in the HTML (SEO)
    for m in re.finditer(r"<h[12][^>]*data-split[^>]*>(.*?)</h[12]>", src, re.S):
        if not re.sub(r"<[^>]+>", "", m.group(1)).strip(): err(f"{n}: empty split heading")

# ---- everything that waits for management stays hidden (website/PENDING.md lists it); one flag restores it
PENDING_RX = re.compile(r"to be confirmed|بانتظار التأكيد|بانتظار تأكيد|more to come|coming soon|المزيد قريباً|قريباً|draft content|محتوى أولي|review mode|وضع المراجعة|logo pending|الشعار النهائي|final logo|preliminary", re.I)
PENDING_MARKUP = ('data-tbc', 'class="tbc', 'class="badge', 'class="proof', 'reviewBtn', 'review-only', 'specrow--tbc', 'pending.css')
for f in pages:
    src = f.read_text(encoding="utf-8"); n = "/" + str(f.relative_to(ROOT))
    if not SHOW_PENDING:
        # the one "coming soon" the owner asked for: the Trending finish chip (2026-10-22). Anything else stays hidden.
        m = PENDING_RX.search(re.sub(r'<button class="chip chip--soon"[^>]*>.*?</button>', '', src, flags=re.S))
        if m: err(f"{n}: pending wording is visible while SHOW_PENDING is false: {m.group(0)!r}")
        for mk in PENDING_MARKUP:
            if mk in src: err(f"{n}: placeholder markup {mk!r} while SHOW_PENDING is false")
pend = (ROOT / "PENDING.md").read_text(encoding="utf-8") if (ROOT / "PENDING.md").exists() else ""
if not pend: err("website/PENDING.md is missing")
for title in re.findall(r"k: 'tbc', title: t\('([^']+)'", CONTENT):
    if title not in pend: err(f"PENDING.md does not list the hidden block {title!r}")
if "SHOW_PENDING" not in CONTENT: err("content.mjs has no SHOW_PENDING flag")
if (ROOT / "assets/js/site.js").read_text().count("review") or "body.review" in (ROOT / "assets/css/site.css").read_text(): err("Review-mode code is still in site.js / site.css")

# ---- the final logo (brand/logo/*.svg) is the brand mark: one sprite per page, <use> in header and footer, accessible name, no old mark
for f in site_pages:
    src = f.read_text(encoding="utf-8"); n = "/" + str(f.relative_to(ROOT))
    if src.count('id="lg-gear"') != 1 or src.count('id="lg-word"') != 1: err(f"{n}: logo sprite must be defined once")
    if len(re.findall(r'<svg class="logo"[^>]*>\s*<use class="logo__gear" href="#lg-gear"/>\s*<use href="#lg-word"/>', src)) < 2: err(f"{n}: logo missing from header and footer")
    if 'class="brand__mark"' in src or "brand__word" in src: err(f"{n}: old temporary brand mark still present")
    for m in re.finditer(r'<a class="brand"[^>]*aria-label="([^"]+)"', src):
        if "Jordan Tinplate Canning" not in m.group(1) and NAME_AR not in m.group(1): err(f"{n}: brand link name {m.group(1)!r} lacks the official name")
    if 'name="theme-color" content="#002F6C"' not in src: err(f"{n}: theme-color must be the Pantone 294 C approximation #002F6C")
    if url_of[f] in ("/en/", "/ar/") and 'class="ld__logo"' not in src: err(f"{n}: entrance lacks the logo")
fav = (ROOT / "assets/img/favicon.svg").read_text()
if "#002F6C" not in fav or "<path" not in fav: err("favicon.svg is not the gear mark in #002F6C")
og = (ROOT / "assets/img/og-default.png").read_bytes()
if og[:8] != b"\x89PNG\r\n\x1a\n" or int.from_bytes(og[16:20], "big") != 1200 or int.from_bytes(og[20:24], "big") != 630: err("og-default.png must be a 1200x630 PNG")

# ---- no section is left with a heading and nothing else
for f in site_pages:
    src = f.read_text(encoding="utf-8"); n = "/" + str(f.relative_to(ROOT))
    for m in re.finditer(r'<section class="sec"[^>]*>(.*?)</section>', src, re.S):
        body = re.sub(r'<header class="sec-head">.*?</header>', "", m.group(1), flags=re.S)
        if not re.search(r"<(p|ul|ol|dl|blockquote|article|a)\b", body): err(f"{n}: a section has a heading but no content")

# ---- palette: every token comes from PANTONE 294 C (#002F6C) and text passes WCAG AA (4.5:1) in light and dark
css = (ROOT / "assets/css/site.css").read_text(encoding="utf-8")
def lum(h):
    h = h.lstrip("#"); r, g, b = [int(h[i:i+2], 16) / 255 for i in (0, 2, 4)]
    f = lambda v: v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
def cr(a, b):
    la, lb = sorted((lum(a), lum(b)), reverse=True); return (la + 0.05) / (lb + 0.05)
toks = dict(re.findall(r"(--navy[\w-]*|--gold):\s*(#[0-9a-fA-F]{6})", css))
if toks.get("--navy", "").lower() != "#002f6c": err("--navy must be #002F6C (PANTONE 294 C)")
def block(sel):
    m = re.search(re.escape(sel) + r"\s*\{(.*?)\}", css, re.S); return m.group(1) if m else ""
def tok(blk, name):
    m = re.search(r"(?<![\w-])" + name + r":\s*([^;]+);", blk)
    if not m: return None
    v = m.group(1).strip(); mv = re.match(r"var\((--[\w-]+)\)", v)
    return toks.get(mv.group(1)) if mv else (v if v.startswith("#") else None)
for label, blk in (("light", block(':root, :root[data-mode="light"]')), ("dark", block(':root[data-mode="dark"]'))):
    bg, bg2, ink, mute, acc = (tok(blk, k) for k in ("--bg", "--bg2", "--ink", "--mute", "--accent-text"))
    if not all((bg, bg2, ink, mute, acc)): err(f"palette {label}: could not read the tokens"); continue
    for fg, name in ((ink, "ink"), (mute, "mute"), (acc, "accent-text")):
        for b, bn in ((bg, "bg"), (bg2, "bg2")):
            if cr(fg, b) < 4.5: err(f"palette {label}: {name} on {bn} is {cr(fg, b):.2f}:1 (needs 4.5)")
if cr("#ffffff", toks.get("--navy", "#002F6C")) < 4.5: err("white on navy below 4.5:1")
if cr("#f4b34c", toks.get("--navy", "#002F6C")) < 4.5: err("amber on navy below 4.5:1")
if cr("#1a1204", "#d98b14") < 4.5: err("button text on the amber accent below 4.5:1")
OLD_BLUES = ("#213469", "#3d58a6", "#14224a", "#17365b", "#2c4486", "#0b1233", "#060a18", "#0b1228", "#dfe6fb", "#2a6fb8", "#1f5fae", "#1b4f8a", "#5b7cff")
for fn in ("assets/css/site.css", "assets/js/engine/art.js", "assets/js/engine/scene.js", "tools/og-card.html"):
    t = (ROOT / fn).read_text(encoding="utf-8").lower()
    for c in OLD_BLUES:
        if c in t: err(f"{fn}: leftover blue {c} outside the Pantone 294 C palette")

print(f"checked {len(pages)} html files, {len(alt_map)} sitemap pages")
if errors:
    print("\n".join(errors)); sys.exit(1)
print("OK: well-formed HTML, links+anchors resolve, hreflang reciprocal, canonical/OG/JSON-LD/sitemap consistent")
