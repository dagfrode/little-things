#!/usr/bin/env python3
"""Refresh IKEA prices in data/items.json from IKEA Norway's search API.

Usage: python3 scripts/refresh-ikea.py
Prints any IKEA link whose product can no longer be found, so it can be replaced.
"""
import json
import pathlib
import re
import urllib.parse
import urllib.request

UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124 Safari/537.36"
API = "https://sik.search.blue.cdtapps.com/no/no/search-result-page?size=10&types=PRODUCT&q="
ITEMS = pathlib.Path(__file__).resolve().parent.parent / "data" / "items.json"


def article_no(url):
    m = re.search(r"-(s?\d{8})/?$", url)
    return m.group(1) if m else None


def lookup(art):
    req = urllib.request.Request(API + urllib.parse.quote(art.lstrip("s")), headers={"User-Agent": UA})
    data = json.load(urllib.request.urlopen(req, timeout=20))
    for hit in data["searchResultPage"]["products"]["main"]["items"]:
        p = hit["product"]
        if article_no(p["pipUrl"]) == art:
            return p
    return None


def main():
    items = json.loads(ITEMS.read_text())
    changed = 0
    for item in items:
        for link in item["links"]:
            if link["store"] != "ikea" or "url" not in link:
                continue
            art = article_no(link["url"])
            product = lookup(art) if art else None
            if not product:
                print(f"MISSING  {item['id']}: {link['label']} ({link['url']})")
                continue
            price = round(product["salesPrice"]["numeral"])
            if link.get("price") != price:
                print(f"PRICE    {item['id']}: {link['label']} {link.get('price')} -> {price}")
                link["price"] = price
                changed += 1
    if changed:
        ITEMS.write_text(json.dumps(items, ensure_ascii=False, indent=2) + "\n")
    print(f"{changed} price(s) updated")


if __name__ == "__main__":
    main()
