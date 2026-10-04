# Little things

A gift guide for friends with babies and young children. It lists cheap, simple things kids actually play with,
by developmental stage, with the research behind each recommendation. Many of the items are everyday household
objects, and some are real toys.

Live at **https://dagfrode.com/little-things/**

- Filters: age/stage, gift rule (want / need / wear / read / do / share), core toy set (build / small world / pretend /
  move / create), "lasts for years" (4+ years of use), everyday thing vs. toy vs. book, plastic (any / little / plastic-free), budget, skills, search.
  The filter state lives in the URL, so a selection can be shared ("ideas for a 9-month-old, plastic-free").
- Links: direct IKEA Norway product links; other Norwegian stores, FINN (secondhand) and Amazon.se link to a search.
- [wish.html](wish.html): parents build a wish list (child's name, birth month, sizes, interests, optional go-deep
  sets and picked ideas) and share it as one short link. Nothing is stored on a server; the list lives in the URL.
- English and Norwegian, picked from the browser language with a switch; light/dark follows the system with a switch.
- Link previews: each page has its own Open Graph/Twitter image and text (Norwegian first). A preview can't depend on the
  URL on a static site, so a shared wish list shows the generic wish-list card; the list itself appears when opened.
- [gift-rule.html](gift-rule.html) explains the gift rule and the "go deep, not wide" idea, with sources.
- Research notes and the full bibliography: [research.md](research.md).

## Files

| | |
|---|---|
| `index.html`, `styles.css`, `app.js` | The main list (no build step) |
| `common.js` | Shared by all pages: language, theme, labels, item cards, data loading, wish-list link format |
| `wish.html`, `wish.js` | Build and view wish lists |
| `data/concepts.json` | Short texts for the gift rule and go-deep sets, and the interest suggestions (en/no) |
| `gift-rule.html` | The gift rule and "go deep, not wide" explainer page |
| `data/items.json` | The items: ages in months, kind, plastic, price (NOK), skills, why/tip/safety, sources, links |
| `data/sources.json` | Sources referenced by items |
| `scripts/refresh-ikea.py` | Updates IKEA prices and reports discontinued IKEA products |
| `scripts/check-links.py` | Checks every store and source link |
| `scripts/make-share-images.py` | Renders the link-preview images (`img/share-*.png`, 1200×630) and icons (`img/icon-*.png`) |
| `scripts/check-codes.py` | Checks the permanent item codes used in wish-list links and prints the next free one |

## Run locally

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Adding an item

Add an object to `data/items.json`. `kind` is `everyday`, `toy` or `book`; `plastic` is `none`, `some` or `plastic`;
`ages` is `[fromMonths, toMonths]`. `gift` is a list from `want`, `need`, `wear`, `read`, `do`, `share`; the optional
`core` is one of `build`, `smallworld`, `pretend`, `move`, `create` (only for open-ended things a child builds up over years). Every item needs at least one id from `data/sources.json` in `sources`.
Links take either `url` (a direct product link, with optional `price`) or `q` (a search on that store).
Give it the next free `code` from `python3 scripts/check-codes.py`, and Norwegian text in `"no": { "name", "why",
"tip", "safety" }` (store search terms `q` are already Norwegian and are shown as the label in Norwegian).
Then run `python3 scripts/check-links.py` and `python3 scripts/check-codes.py`.

**Item codes are permanent.** Wish-list links store two-character codes back to back, so never change or reuse a code,
even after removing its item. Add removed codes to `RETIRED` in `scripts/check-codes.py`.

## Wish-list links

`wish.html?n=Ola&b=2403&d=bsm&t=ac*traktorer&s=104.26.52&i=0a0b1F`

| | |
|---|---|
| `n` | child's name (max 40 characters) |
| `b` | birth month `YYMM`; the age is worked out on the day the list is viewed |
| `d` | go-deep sets, one letter each: `b`uild, `s`mall world, `p`retend, `m`ove, `c`reate |
| `t` | interests: one-letter codes from `data/concepts.json`, then free words, separated by `*` (max 5 in total) |
| `s` | sizes: clothes cm `.` shoes EU `.` head cm, empty fields allowed |
| `i` | item codes, two characters each |

Everything read from the link is cleaned (control, bidi and `<>` characters removed, length capped) and only ever
rendered as text. Unknown codes are skipped, so old links keep working when items are removed.
