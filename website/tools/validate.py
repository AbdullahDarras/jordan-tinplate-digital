#!/usr/bin/env python3
"""Validate the generated site: well-formed HTML, internal links/anchors, hreflang reciprocity,
canonical, unique title/description, JSON-LD, sitemap. Usage: python3 website/tools/validate.py"""
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
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "html": self.root_attrs = a
        if "id" in a:
            if a["id"] in self.ids: err(f"{self.name}: duplicate id {a['id']}")
            self.ids.add(a["id"])
        if tag == "h1": self.h1 += 1
        if tag == "a" and "href" in a: self.links.append(a["href"])
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
        if tag == "script": self.in_ld = False
    def handle_data(self, d):
        if self.in_title: self.title = (self.title or "") + d
        if self.in_ld: self.ld.append(d)

pages = sorted(ROOT.rglob("index.html")) + [ROOT / "404.html"]
pages = [p for p in pages if "tools" not in p.parts and "prototype" not in p.parts]  # /prototype/ is a separate noindex creative preview
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
        sw = re.search(r'<a class="tool tool--lang" href="([^"]+)"', f.read_text(encoding="utf-8"))
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
for must in ("assets/img/og-default.png", "assets/img/favicon.svg", "assets/css/site.css", "assets/js/site.js"):
    if not (ROOT / must).exists(): err(f"missing {must}")

print(f"checked {len(pages)} html files, {len(alt_map)} sitemap pages")
if errors:
    print("\n".join(errors)); sys.exit(1)
print("OK: well-formed HTML, links+anchors resolve, hreflang reciprocal, canonical/OG/JSON-LD/sitemap consistent")
