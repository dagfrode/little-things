# Little things

A gift guide for friends with babies and young children. It lists cheap, simple things kids actually play with,
by developmental stage, with the research behind each recommendation. Many of the items are everyday household
objects, and some are real toys.

Live at **https://dagfrode.com/little-things/**

- Filters: age/stage, everyday thing vs. toy vs. book, plastic (any / little / plastic-free), budget, skills, search.
  The filter state lives in the URL, so a selection can be shared ("ideas for a 9-month-old, plastic-free").
- Links: direct IKEA Norway product links; other Norwegian stores, FINN (secondhand) and Amazon.se link to a search.
- Research notes and the full bibliography: [research.md](research.md).

## Files

| | |
|---|---|
| `index.html`, `styles.css`, `app.js` | The static site (no build step) |
| `data/items.json` | The items: ages in months, kind, plastic, price (NOK), skills, why/tip/safety, sources, links |
| `data/sources.json` | Sources referenced by items |
| `scripts/refresh-ikea.py` | Updates IKEA prices and reports discontinued IKEA products |
| `scripts/check-links.py` | Checks every store and source link |

## Run locally

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Adding an item

Add an object to `data/items.json`. `kind` is `everyday`, `toy` or `book`; `plastic` is `none`, `some` or `plastic`;
`ages` is `[fromMonths, toMonths]`. Every item needs at least one id from `data/sources.json` in `sources`.
Links take either `url` (a direct product link, with optional `price`) or `q` (a search on that store).
Then run `python3 scripts/check-links.py`.
