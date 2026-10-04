// Shared by every page: language, theme, labels, item cards, data loading and the wish-list link format.
// Exposed as window.LT. No build step.
(function () {
  "use strict";

  // ---- Language ------------------------------------------------------------
  // The inline script in each page's <head> sets data-lang before the CSS loads; this keeps it in sync.

  const I18N = {
    en: {
      theme_auto: "Auto", theme_light: "Light", theme_dark: "Dark", theme_label: "Colour theme",
      lang_label: "Language",
      mo: "mo", yr: "yr", months: "months", years: "years", month1: "month", year1: "year",
      from_birth: "From birth to ", free: "Free / DIY",
      tip: "Tip: ", safety: "Safety: ", sources: "Sources: ", diy: "Nothing to buy: make it from things at home.",
      lasts: "Lasts for years", core_badge: "Go deep: ",
      wish_add: "+ Wish list", wish_on: "✓ On the list",
      any: "Any", all: "All",
      kind_everyday: "Everyday things", kind_toy: "Toys", kind_book: "Books",
      kind1_everyday: "Everyday thing", kind1_toy: "Toy", kind1_book: "Book",
      plastic_little: "Little plastic", plastic_none: "Plastic-free", plastic_some: "Little plastic", plastic_plastic: "Plastic",
      price_free: "Free",
      gift_want: "Want", gift_need: "Need", gift_wear: "Wear", gift_read: "Read", gift_do: "Do", gift_share: "Share",
      giftl_want: "Something they want", giftl_need: "Something they need", giftl_wear: "Something to wear",
      giftl_read: "Something to read", giftl_do: "Something to do", giftl_share: "Something to share",
      core_build: "Build", core_smallworld: "Small world", core_pretend: "Pretend", core_move: "Move", core_create: "Create",
      skill_hands: "Hands & fingers", skill_movement: "Moving & balance", skill_senses: "Senses", skill_thinking: "Problem-solving",
      skill_math: "Early maths", skill_language: "Language", skill_social: "Together & feelings", skill_pretend: "Pretend play",
      skill_creativity: "Creativity", skill_independence: "Doing it myself", skill_music: "Music", skill_nature: "Outdoors & nature",
      phase_0: "Newborn", phase_1: "Reaching", phase_2: "Sitting", phase_3: "Crawling", phase_4: "First steps",
      phase_5: "Little helper", phase_6: "Pretend & build", phase_7: "Big imagination",
      finn: "FINN (used)"
    },
    no: {
      theme_auto: "Auto", theme_light: "Lys", theme_dark: "Mørk", theme_label: "Fargetema",
      lang_label: "Språk",
      mo: "mnd", yr: "år", months: "måneder", years: "år", month1: "måned", year1: "år",
      from_birth: "Fra fødsel til ", free: "Gratis / lag selv",
      tip: "Tips: ", safety: "Sikkerhet: ", sources: "Kilder: ", diy: "Ingenting å kjøpe: lag det av ting du har hjemme.",
      lasts: "Varer i årevis", core_badge: "Go deep: ",
      wish_add: "+ Ønskeliste", wish_on: "✓ På lista",
      any: "Alle", all: "Alle",
      kind_everyday: "Hverdagsting", kind_toy: "Leker", kind_book: "Bøker",
      kind1_everyday: "Hverdagsting", kind1_toy: "Leke", kind1_book: "Bok",
      plastic_little: "Lite plast", plastic_none: "Plastfri", plastic_some: "Lite plast", plastic_plastic: "Plast",
      price_free: "Gratis",
      gift_want: "Ønske", gift_need: "Trenger", gift_wear: "Ha på", gift_read: "Lese", gift_do: "Gjøre", gift_share: "Dele",
      giftl_want: "Noe de ønsker seg", giftl_need: "Noe de trenger", giftl_wear: "Noe å ha på seg",
      giftl_read: "Noe å lese", giftl_do: "Noe å gjøre", giftl_share: "Noe å dele",
      core_build: "Bygge", core_smallworld: "Småverden", core_pretend: "Rollelek", core_move: "Bevegelse", core_create: "Skape",
      skill_hands: "Hender og fingre", skill_movement: "Bevegelse og balanse", skill_senses: "Sanser", skill_thinking: "Problemløsning",
      skill_math: "Tidlig matte", skill_language: "Språk", skill_social: "Sammen og følelser", skill_pretend: "Rollelek",
      skill_creativity: "Kreativitet", skill_independence: "Klare selv", skill_music: "Musikk", skill_nature: "Ute og natur",
      phase_0: "Nyfødt", phase_1: "Griper", phase_2: "Sitter", phase_3: "Kryper", phase_4: "Første skritt",
      phase_5: "Liten hjelper", phase_6: "Lek og bygg", phase_7: "Stor fantasi",
      finn: "FINN (brukt)"
    }
  };

  const root = document.documentElement;
  const lang = () => (root.dataset.lang === "no" ? "no" : "en");
  // Page scripts add their own strings with LT.addStrings({ en: {...}, no: {...} }).
  function addStrings(more) { for (const l of ["en", "no"]) Object.assign(I18N[l], more[l]); }
  function t(key) { const s = I18N[lang()][key]; return s != null ? s : I18N.en[key] != null ? I18N.en[key] : key; }

  function store(key, value) {
    try { value == null ? localStorage.removeItem(key) : localStorage.setItem(key, value); } catch (e) { /* private mode */ }
  }
  function load(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }

  // Short UI strings in static HTML: <span data-i18n="key">English fallback</span>.
  function applyI18n() {
    for (const node of document.querySelectorAll("[data-i18n]")) node.textContent = t(node.dataset.i18n);
    for (const node of document.querySelectorAll("[data-i18n-placeholder]")) node.placeholder = t(node.dataset.i18nPlaceholder);
    const title = document.querySelector('meta[name="lt-title-' + lang() + '"]');
    if (title) document.title = title.content;
  }

  function setLang(l) {
    root.dataset.lang = l;
    root.lang = l === "no" ? "nb" : "en";
    store("lt-lang", l);
    applyI18n();
    syncChrome();
    document.dispatchEvent(new CustomEvent("lt-lang"));
  }

  // ---- Theme ---------------------------------------------------------------
  // Default is automatic (follows the system). Only a manual choice is stored.

  const THEMES = ["auto", "light", "dark"];
  const theme = () => root.dataset.theme || "auto";
  function setTheme(th) {
    if (th === "auto") delete root.dataset.theme; else root.dataset.theme = th;
    store("lt-theme", th === "auto" ? null : th);
    syncChrome();
  }

  // Language and theme switches, rendered into <div id="site-tools"> on each page.
  function initChrome() {
    const box = document.getElementById("site-tools");
    if (!box) return;
    const langs = el("div", { class: "tool-seg", role: "group" });
    for (const [id, label] of [["no", "NO"], ["en", "EN"]]) {
      const b = el("button", { type: "button", "data-lang-btn": id }, label);
      b.addEventListener("click", () => setLang(id));
      langs.append(b);
    }
    const th = el("button", { type: "button", class: "tool-theme", id: "theme-btn" });
    th.addEventListener("click", () => setTheme(THEMES[(THEMES.indexOf(theme()) + 1) % THEMES.length]));
    box.replaceChildren(langs, th);
    syncChrome();
  }

  function syncChrome() {
    for (const b of document.querySelectorAll("[data-lang-btn]")) b.setAttribute("aria-pressed", String(b.dataset.langBtn === lang()));
    const seg = document.querySelector("#site-tools .tool-seg");
    if (seg) seg.setAttribute("aria-label", t("lang_label"));
    const th = document.getElementById("theme-btn");
    if (th) {
      const icon = { auto: "◐", light: "☀", dark: "☾" }[theme()];
      th.textContent = icon + " " + t("theme_" + theme());
      th.setAttribute("aria-label", t("theme_label") + ": " + t("theme_" + theme()));
    }
  }

  // ---- Constants -----------------------------------------------------------

  // Developmental phases in months; `to` is exclusive.
  const PHASES = [
    { id: "0-3m", from: 0, to: 3 }, { id: "3-6m", from: 3, to: 6 }, { id: "6-9m", from: 6, to: 9 },
    { id: "9-12m", from: 9, to: 12 }, { id: "12-18m", from: 12, to: 18 }, { id: "18-24m", from: 18, to: 24 },
    { id: "2-3y", from: 24, to: 36 }, { id: "3-5y", from: 36, to: 72 }
  ];
  PHASES.forEach((p, i) => { p.nameKey = "phase_" + i; });

  const GIFT_IDS = ["want", "need", "wear", "read", "do", "share"];
  // "Go deep": the five kinds of open-ended toy worth building up over years. One-letter codes for wish-list links.
  const CORE_IDS = ["build", "smallworld", "pretend", "move", "create"];
  const CORE_CODE = { build: "b", smallworld: "s", pretend: "p", move: "m", create: "c" };
  const SKILL_IDS = ["hands", "movement", "senses", "thinking", "math", "language", "social", "pretend", "creativity", "independence", "music", "nature"];

  // Items whose age range spans at least this many months get a "Lasts for years" badge and filter.
  const LONG_LASTING = 48;
  const lastsYears = (item) => item.ages[1] - item.ages[0] >= LONG_LASTING;

  const STORES = {
    ikea: { name: "IKEA", search: "https://www.ikea.com/no/no/search/?q=" },
    clasohlson: { name: "Clas Ohlson", search: "https://www.clasohlson.com/no/search?text=" },
    europris: { name: "Europris", search: "https://www.europris.no/catalogsearch/result/?q=" },
    nille: { name: "Nille", search: "https://www.nille.no/sok?q=" },
    jollyroom: { name: "Jollyroom", search: "https://www.jollyroom.no/search?text=" },
    barnashus: { name: "Barnas Hus", search: "https://www.barnashus.no/sok?q=" },
    lekmer: { name: "Lekmer", search: "https://www.lekmer.com/nb-no/search?q=" },
    norli: { name: "Norli", search: "https://www.norli.no/search?q=" },
    panduro: { name: "Panduro", search: "https://www.panduro.com/nb-no/search?q=" },
    xxl: { name: "XXL", search: "https://www.xxl.no/search?query=" },
    janus: { name: "Janus", search: "https://www.janus.no/search?q=" },
    ark: { name: "ARK", search: "https://www.ark.no/sok?text=" },
    svommeforbund: { name: "Norges Svømmeforbund", search: "" },
    finn: { name: "FINN (used)", search: "https://www.finn.no/recommerce/forsale/search?q=" },
    amazon: { name: "Amazon.se", search: "https://www.amazon.se/s?k=" }
  };

  // ---- Helpers -------------------------------------------------------------

  function el(tag, attrs, text) {
    const node = document.createElement(tag);
    if (attrs) for (const [k, v] of Object.entries(attrs)) {
      if (v === false || v == null) continue;
      node.setAttribute(k, v === true ? "" : v);
    }
    if (text != null) node.textContent = text;
    return node;
  }

  // An item's text in the current language, falling back to English.
  function field(item, key) {
    return (lang() === "no" && item.no && item.no[key]) || item[key];
  }

  function formatAge(m) {
    if (m < 24) return m + " " + t("mo");
    const y = m / 12;
    return (Number.isInteger(y) ? y : y.toFixed(1).replace(".5", "½")) + " " + t("yr");
  }

  function formatRange([from, to]) {
    if (from === 0) return t("from_birth") + formatAge(to);
    return formatAge(from) + " – " + formatAge(to);
  }

  function formatPrice(p) {
    return p === 0 ? t("free") : "~" + p + " kr";
  }

  // "2 years 7 months" / "2 år og 7 måneder"
  function formatAgeLong(m) {
    const y = Math.floor(m / 12), mo = m % 12;
    const ys = y ? y + " " + (y === 1 ? t("year1") : t("years")) : "";
    const ms = mo || !y ? mo + " " + (mo === 1 ? t("month1") : t("months")) : "";
    return [ys, ms].filter(Boolean).join(lang() === "no" ? " og " : " ");
  }

  function linkUrl(link) {
    if (link.url) return link.url;
    return STORES[link.store].search + encodeURIComponent(link.q);
  }

  // Store search terms are Norwegian, so show them as the label in Norwegian.
  function linkLabel(link) {
    return lang() === "no" && link.q ? link.q : link.label;
  }

  // ---- Item card -----------------------------------------------------------
  // opts.wish: { has(code) -> bool, toggle(code) } adds the wish-list button.

  function renderCard(item, sources, opts) {
    opts = opts || {};
    const card = el("article", { class: "card", id: item.id, "data-kind": item.kind });
    const head = el("header", { class: "card-head" });
    head.append(el("h3", { class: "card-title" }, field(item, "name")), el("p", { class: "card-meta" }, formatRange(item.ages)));
    card.append(head);

    const badges = el("ul", { class: "badges" });
    badges.append(
      el("li", { class: "badge badge-kind-" + item.kind }, t("kind1_" + item.kind)),
      el("li", { class: "badge badge-plastic-" + item.plastic }, t("plastic_" + item.plastic)),
      el("li", { class: "badge badge-price" }, formatPrice(item.price))
    );
    if (item.core) badges.append(el("li", { class: "badge badge-core" }, t("core_badge") + t("core_" + item.core)));
    if (lastsYears(item)) badges.append(el("li", { class: "badge badge-years" }, t("lasts")));
    for (const g of item.gift) badges.append(el("li", { class: "badge badge-gift" }, t("giftl_" + g)));
    for (const s of item.skills) badges.append(el("li", { class: "badge badge-skill" }, t("skill_" + s)));
    card.append(badges);

    card.append(el("p", { class: "why" }, field(item, "why")));
    for (const [key, cls] of [["tip", "tip"], ["safety", "safety"]]) {
      const text = field(item, key);
      if (!text) continue;
      const p = el("p", { class: cls });
      p.append(el("strong", null, t(key)), text);
      card.append(p);
    }

    const buy = el("div", { class: "buy" });
    if (item.links.length) {
      for (const link of item.links) {
        const a = el("a", { class: "buy-link", href: linkUrl(link), target: "_blank", rel: "noopener" });
        a.append(el("span", { class: "buy-store" }, link.store === "finn" ? t("finn") : STORES[link.store].name));
        a.append(el("span", { class: "buy-label" }, linkLabel(link)));
        if (link.price) a.append(el("span", { class: "buy-price" }, link.price + " kr"));
        buy.append(a);
      }
    } else {
      buy.append(el("p", { class: "diy" }, t("diy")));
    }
    card.append(buy);

    if (opts.wish) {
      const b = el("button", { type: "button", class: "wish-btn" });
      const sync = () => {
        const on = opts.wish.has(item.code);
        b.textContent = on ? t("wish_on") : t("wish_add");
        b.setAttribute("aria-pressed", String(on));
      };
      b.addEventListener("click", () => { opts.wish.toggle(item.code); sync(); });
      sync();
      card.append(b);
    }

    const cites = el("p", { class: "cites" });
    cites.append(t("sources"));
    item.sources.forEach((id, i) => {
      if (i) cites.append(", ");
      cites.append(el("a", { href: (opts.sourceHref || "#src-") + id }, sources[id] ? sources[id].short : id));
    });
    card.append(cites);
    return card;
  }

  // ---- Data ----------------------------------------------------------------

  let dataPromise;
  function loadData() {
    dataPromise = dataPromise || Promise.all([
      fetch("data/items.json").then((r) => r.json()),
      fetch("data/sources.json").then((r) => r.json())
    ]).then(([items, sources]) => {
      const byCode = Object.fromEntries(items.map((i) => [i.code, i]));
      const byId = Object.fromEntries(items.map((i) => [i.id, i]));
      return { items, sources, byCode, byId };
    });
    return dataPromise;
  }

  // ---- Wish-list link format -----------------------------------------------
  // wish.html?n=Ola&b=2403&d=bsm&t=ac*traktorer&s=104.26.52&i=0a0b1F
  //   n  child's name           b  birth month YYMM        d  go-deep sets, one letter each
  //   t  interests: suggestion codes, then free words, separated by * (not encoded in URLs, unlike ~)
  //   s  sizes clothes.shoes.head                          i  item codes, two characters each, no separator
  // Everything read from the link is untrusted: it is cleaned here and only ever rendered with textContent.

  const MAX = { name: 40, interest: 30, interests: 5, deep: 5, items: 200 };

  function clean(text, max) {
    return String(text || "")
      .replace(/[\u0000-\u001f\u007f-\u009f<>*\u200b-\u200f\u202a-\u202e\u2066-\u2069]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, max);
  }

  function emptyWish() {
    return { name: "", birth: "", deep: [], interests: [], words: [], sizes: ["", "", ""], items: [] };
  }

  // interestCodes: the set of valid one-letter interest codes (from data/concepts.json).
  function parseWish(params, interestCodes) {
    const w = emptyWish();
    w.name = clean(params.get("n"), MAX.name);
    const b = params.get("b") || "";
    if (/^\d{4}$/.test(b) && +b.slice(2) >= 1 && +b.slice(2) <= 12) w.birth = b;
    const codeToCore = Object.fromEntries(Object.entries(CORE_CODE).map(([k, v]) => [v, k]));
    for (const c of params.get("d") || "") {
      const id = codeToCore[c];
      if (id && !w.deep.includes(id) && w.deep.length < MAX.deep) w.deep.push(id);
    }
    const [codes, ...words] = (params.get("t") || "").split("*");
    for (const c of codes || "") {
      if (interestCodes && interestCodes.has(c) && !w.interests.includes(c)) w.interests.push(c);
    }
    for (const word of words) {
      const cw = clean(word, MAX.interest);
      if (cw.length >= 2 && !w.words.includes(cw)) w.words.push(cw);
    }
    const room = MAX.interests - w.interests.length;
    w.interests = w.interests.slice(0, MAX.interests);
    w.words = w.words.slice(0, Math.max(0, room));
    const s = (params.get("s") || "").split(".");
    w.sizes = [0, 1, 2].map((i) => (/^\d{1,3}$/.test(s[i] || "") ? s[i] : ""));
    const i = params.get("i") || "";
    for (let k = 0; k + 1 < i.length && w.items.length < MAX.items; k += 2) {
      const code = i.slice(k, k + 2);
      if (/^[0-9a-zA-Z]{2}$/.test(code) && !w.items.includes(code)) w.items.push(code);
    }
    return w;
  }

  function wishQuery(w) {
    const p = new URLSearchParams();
    if (w.name) p.set("n", w.name);
    if (w.birth) p.set("b", w.birth);
    if (w.deep.length) p.set("d", w.deep.map((d) => CORE_CODE[d]).join(""));
    if (w.interests.length || w.words.length) p.set("t", [w.interests.join(""), ...w.words].join("*"));
    if (w.sizes.some(Boolean)) p.set("s", w.sizes.join(".").replace(/\.+$/, ""));
    if (w.items.length) p.set("i", w.items.join(""));
    return p.toString();
  }

  // Age in whole months today, from a YYMM birth month; null if unknown.
  function ageMonths(birth, now) {
    if (!birth) return null;
    now = now || new Date();
    const m = (now.getFullYear() * 12 + now.getMonth()) - ((2000 + +birth.slice(0, 2)) * 12 + (+birth.slice(2) - 1));
    return Math.max(0, m);
  }

  // The draft wish list is kept in this browser while it's being built (a convenience; the link is what's shared).
  const draft = {
    get(interestCodes) { return parseWish(new URLSearchParams(load("lt-wish") || ""), interestCodes); },
    set(w) { store("lt-wish", wishQuery(w)); },
    has(code) { return draft.get().items.includes(code); },
    toggle(code) {
      // Keep the stored query as-is apart from the items, so interests survive without knowing their codes here.
      const p = new URLSearchParams(load("lt-wish") || "");
      const w = parseWish(p, null);
      w.items = w.items.includes(code) ? w.items.filter((c) => c !== code) : [...w.items, code];
      if (w.items.length) p.set("i", w.items.join("")); else p.delete("i");
      store("lt-wish", p.toString());
      document.dispatchEvent(new CustomEvent("lt-wish"));
    },
    count() { return draft.get().items.length; }
  };

  window.LT = {
    t, addStrings, lang, setLang, applyI18n, initChrome, store, load,
    PHASES, GIFT_IDS, CORE_IDS, SKILL_IDS, STORES, lastsYears,
    el, field, formatAge, formatRange, formatPrice, formatAgeLong, linkUrl, renderCard, loadData,
    clean, MAX, emptyWish, parseWish, wishQuery, ageMonths, draft
  };

  document.addEventListener("DOMContentLoaded", () => { applyI18n(); initChrome(); });
})();
