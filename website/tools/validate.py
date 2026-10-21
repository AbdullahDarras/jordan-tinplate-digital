#!/usr/bin/env python3
"""Validate the generated site: well-formed HTML, internal links/anchors, hreflang reciprocity,
canonical, unique title/description, JSON-LD, sitemap, the creative-experience contract (shared chrome, 3D stages with
fallbacks, entrance only on the home pages, self-hosted libraries, no external JavaScript) and the approved decisions
(names, order-tool links, no certification named, no Saudi branch, olive-oil sizes).
Usage: python3 -I website/tools/validate.py"""
import json, re, sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse, urldefrag

ROOT = Path(__file__).resolve().parent.parent
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
FORBIDDEN = ["ISO 9001", "ISO 22000", "HACCP", "BRC", "UKAS-accredited logo", "31 December 2026", "2026-12-31", "31/12/2026", "Saudi branch", "branch in Saudi", "فرع في السعودية", "فرع السعودية", "مصنع الأردنية", "JORDAN CANNING</"]
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
    if "<img" in src: err(f"{n}: images/logos are not used yet (text only)")
    if is_home or url_of[f].endswith("/about/"):
        need = ("FSSC 22000", "JO000011/1", "UKAS", "Bureau Veritas") ; need_ar = ("FSSC 22000", "JO000011/1", "26 نيسان 2029", "UKAS", "JFDA")
        for w in (need_ar if lang == "ar" else need + ("26 April 2029", "JFDA")):
            if w not in visible: err(f"{n}: quality section lacks {w!r}")
        if 'class="quality"' not in src: err(f"{n}: quality section missing")
    if "FSSC 22000" not in visible.replace("\n", " ") or "JFDA" not in src: err(f"{n}: footer/certification line missing")
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

print(f"checked {len(pages)} html files, {len(alt_map)} sitemap pages")
if errors:
    print("\n".join(errors)); sys.exit(1)
print("OK: well-formed HTML, links+anchors resolve, hreflang reciprocal, canonical/OG/JSON-LD/sitemap consistent")
