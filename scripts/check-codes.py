#!/usr/bin/env python3
"""Check the short item codes used in wish-list links, and print the next free code.

Every item in data/items.json has a permanent two-character `code` from 0-9a-zA-Z. Wish-list links store
these codes back to back, so a code must never change and must never be reused, even after its item is removed.
Removed codes are listed in RETIRED below so they are never handed out again.

Usage: python3 scripts/check-codes.py
"""
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
RETIRED = set()  # codes of removed items; add here when deleting an item


def index(code):
    return ALPHABET.index(code[0]) * len(ALPHABET) + ALPHABET.index(code[1])


def main():
    items = json.loads((ROOT / "data/items.json").read_text())
    seen, bad = {}, 0
    for item in items:
        code = item.get("code", "")
        if len(code) != 2 or any(c not in ALPHABET for c in code):
            print(f"BAD CODE   {item['id']}: {code!r}")
            bad += 1
        elif code in seen:
            print(f"DUPLICATE  {code}: {seen[code]} and {item['id']}")
            bad += 1
        elif code in RETIRED:
            print(f"RETIRED    {code} reused by {item['id']}")
            bad += 1
        seen.setdefault(code, item["id"])
    used = [index(c) for c in seen if len(c) == 2 and all(x in ALPHABET for x in c)] + [index(c) for c in RETIRED]
    nxt = max(used, default=-1) + 1
    print(f"{len(items)} items, {bad} problems. Next free code: {ALPHABET[nxt // 62]}{ALPHABET[nxt % 62]}")
    raise SystemExit(1 if bad else 0)


if __name__ == "__main__":
    main()
