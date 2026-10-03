#!/usr/bin/env python3
"""Check that every link in data/items.json and data/sources.json responds.

Usage: python3 scripts/check-links.py
Some shops block scripted requests (403/429/503) even though the page works in a browser;
those are reported as BLOCKED rather than BROKEN.
"""
import json
import pathlib
import re
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor

ROOT = pathlib.Path(__file__).resolve().parent.parent
UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124 Safari/537.36"

# Must match STORES in app.js.
app_js = (ROOT / "app.js").read_text()
STORES = dict(re.findall(r'(\w+): \{ name: "[^"]+", search: "([^"]+)" \}', app_js))


def urls():
    for item in json.loads((ROOT / "data/items.json").read_text()):
        for link in item["links"]:
            url = link.get("url") or STORES[link["store"]] + urllib.parse.quote(link["q"])
            yield f"{item['id']} / {link['label']}", url
    for sid, src in json.loads((ROOT / "data/sources.json").read_text()).items():
        yield f"source {sid}", src["url"]


def check(entry):
    name, url = entry
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "nb-NO,en;q=0.8"})
    try:
        with urllib.request.urlopen(req, timeout=25) as r:
            return name, url, 200 if 200 <= r.status < 300 else r.status
    except urllib.error.HTTPError as e:
        return name, url, e.code
    except Exception as e:  # noqa: BLE001
        return name, url, type(e).__name__


def main():
    with ThreadPoolExecutor(8) as pool:
        results = list(pool.map(check, urls()))
    bad = 0
    for name, url, status in results:
        if status == 200:
            continue
        label = "BLOCKED" if status in (403, 429, 503) else "BROKEN "
        bad += label == "BROKEN "
        print(f"{label} {status}  {name}\n         {url}")
    print(f"{len(results)} links checked, {bad} broken")
    raise SystemExit(1 if bad else 0)


if __name__ == "__main__":
    main()
