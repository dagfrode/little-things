#!/usr/bin/env python3
"""Render the social-media preview images (img/share-*.png, 1200x630) and the app icons (img/icon-*.png).

Link previews can't depend on the URL (the site is static), so each page gets one fixed image.
Needs Playwright with Chromium: pip install playwright && playwright install chromium

Usage: python3 scripts/make-share-images.py
"""
import asyncio
import pathlib

from playwright.async_api import async_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "img"

FONTS = (
    '<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700'
    '&family=Nunito+Sans:opsz,wght@6..12,600;6..12,700&display=block" rel="stylesheet">'
)

BASE_CSS = """
* { box-sizing: border-box; margin: 0; }
body { width: 1200px; height: 630px; overflow: hidden; background: #fdf8f0; color: #2b2420;
  font-family: "Nunito Sans", sans-serif; position: relative; }
.deco { position: absolute; border-radius: 50%; }
.d1 { width: 520px; height: 520px; right: -140px; top: -170px; background: #f6eee1; }
.d2 { width: 300px; height: 300px; right: 120px; bottom: -150px; background: #e3f1ec; }
.d3 { width: 150px; height: 150px; right: 40px; top: 260px; background: #efe7f7; }
.sun { position: absolute; width: 120px; height: 120px; border-radius: 50%; background: #e8a33d; right: 210px; top: 120px; }
.sun::after { content: ""; position: absolute; inset: 32px; border-radius: 50%; background: #fdf8f0; }
.wrap { position: absolute; left: 80px; top: 70px; right: 80px; bottom: 60px; display: flex; flex-direction: column; }
.eyebrow { font-weight: 700; font-size: 30px; color: #6d625a; letter-spacing: 0.01em; }
h1 { font-family: "Fraunces", serif; font-weight: 700; font-size: 132px; line-height: 0.95; letter-spacing: -0.03em;
  margin-top: 18px; max-width: 900px; }
h1 .dot { display: inline-block; width: 0.3em; height: 0.3em; border-radius: 50%; background: #e8a33d; margin-left: 0.06em; }
.sub { font-family: "Fraunces", serif; font-weight: 500; font-size: 44px; color: #6d625a; margin-top: 14px; }
.chips { margin-top: auto; display: flex; gap: 14px; flex-wrap: wrap; }
.chip { font-weight: 700; font-size: 28px; padding: 10px 24px; border-radius: 999px; background: #fff; border: 2px solid #eadfce; }
.chip.accent { background: #b5561f; color: #fff; border-color: #b5561f; }
.url { position: absolute; right: 80px; bottom: 64px; font-weight: 700; font-size: 26px; color: #b5561f; }
.nums { display: flex; gap: 16px; margin-top: auto; }
.num { width: 76px; height: 76px; border-radius: 50%; display: grid; place-items: center; font-family: "Fraunces", serif;
  font-weight: 700; font-size: 38px; background: #e8a33d; }
.num.extra { background: transparent; border: 4px dashed #e8a33d; }
"""

PAGES = {
    "share-main": """
      <div class="deco d1"></div><div class="deco d2"></div><div class="deco d3"></div><div class="sun"></div>
      <div class="wrap">
        <p class="eyebrow">Gaveguide for små barn · A gift guide for little ones</p>
        <h1>Små ting<span class="dot"></span></h1>
        <p class="sub">Enkle gaver barn faktisk bruker</p>
        <div class="chips"><span class="chip accent">0–6 år</span><span class="chip">Sortert etter alder</span>
          <span class="chip">Forskning bak hver idé</span></div>
      </div>""",
    "share-gift-rule": """
      <div class="deco d1"></div><div class="deco d2"></div><div class="deco d3"></div>
      <div class="wrap">
        <p class="eyebrow">Små ting · Gaveregelen</p>
        <h1 style="font-size:104px">Ønske, trenge, ha på, lese<span class="dot"></span></h1>
        <p class="sub">Færre, bedre gaver · Want, need, wear, read</p>
        <div class="nums"><span class="num">1</span><span class="num">2</span><span class="num">3</span><span class="num">4</span>
          <span class="num extra">5</span><span class="num extra">6</span></div>
      </div>
      <p class="url">dagfrode.com/little-things</p>""",
    "share-wish": """
      <div class="deco d1"></div><div class="deco d2"></div><div class="deco d3"></div><div class="sun"></div>
      <div class="wrap">
        <p class="eyebrow">Små ting · Little things</p>
        <h1>En ønskeliste<span class="dot"></span></h1>
        <p class="sub">Noen få gode gaver, valgt med omtanke</p>
        <div class="chips"><span class="chip">Noe de ønsker seg</span><span class="chip">Noe de trenger</span>
          <span class="chip">Noe å ha på seg</span><span class="chip">Noe å lese</span></div>
      </div>""",
}

ICON = """
<body style="margin:0;width:512px;height:512px;background:#fdf8f0;display:grid;place-items:center">
  <div style="width:400px;height:400px;border-radius:50%;background:#e8a33d;display:grid;place-items:center">
    <div style="width:190px;height:190px;border-radius:50%;background:#fdf8f0"></div>
  </div>
</body>"""


async def main():
    OUT.mkdir(exist_ok=True)
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": 1200, "height": 630})
        for name, body in PAGES.items():
            await page.set_content(f"<!doctype html><html><head>{FONTS}<style>{BASE_CSS}</style></head><body>{body}</body></html>")
            await page.evaluate("document.fonts.ready")
            await page.wait_for_timeout(300)
            await page.screenshot(path=str(OUT / f"{name}.png"))
            print("wrote", f"img/{name}.png")
        for size in (180, 512):
            icon = await browser.new_page(viewport={"width": 512, "height": 512}, device_scale_factor=size / 512)
            await icon.set_content(ICON)
            await icon.screenshot(path=str(OUT / f"icon-{size}.png"))
            print("wrote", f"img/icon-{size}.png")
        await browser.close()


if __name__ == "__main__":
    asyncio.run(main())
