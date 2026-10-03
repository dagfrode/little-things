(function () {
  "use strict";

  // Developmental phases in months; `to` is exclusive.
  const PHASES = [
    { id: "0-3m", label: "0–3 mo", name: "Newborn", from: 0, to: 3 },
    { id: "3-6m", label: "3–6 mo", name: "Reaching", from: 3, to: 6 },
    { id: "6-9m", label: "6–9 mo", name: "Sitting", from: 6, to: 9 },
    { id: "9-12m", label: "9–12 mo", name: "Crawling", from: 9, to: 12 },
    { id: "12-18m", label: "1–1½ yr", name: "First steps", from: 12, to: 18 },
    { id: "18-24m", label: "1½–2 yr", name: "Little helper", from: 18, to: 24 },
    { id: "2-3y", label: "2–3 yr", name: "Pretend & build", from: 24, to: 36 },
    { id: "3-5y", label: "3–5 yr", name: "Big imagination", from: 36, to: 72 }
  ];

  const KINDS = [
    { id: "", label: "All" },
    { id: "everyday", label: "Everyday things" },
    { id: "toy", label: "Toys" },
    { id: "book", label: "Books" }
  ];

  const PLASTIC = [
    { id: "", label: "Any" },
    { id: "little", label: "Little plastic" },
    { id: "none", label: "Plastic-free" }
  ];

  const PRICES = [
    { id: "", label: "Any" },
    { id: "0", label: "Free" },
    { id: "100", label: "≤ 100 kr" },
    { id: "300", label: "≤ 300 kr" },
    { id: "600", label: "≤ 600 kr" }
  ];

  const SKILLS = {
    hands: "Hands & fingers",
    movement: "Moving & balance",
    senses: "Senses",
    thinking: "Problem-solving",
    math: "Early maths",
    language: "Language",
    social: "Together & feelings",
    pretend: "Pretend play",
    creativity: "Creativity",
    independence: "Doing it myself",
    music: "Music",
    nature: "Outdoors & nature"
  };

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
    finn: { name: "FINN (used)", search: "https://www.finn.no/recommerce/forsale/search?q=" },
    amazon: { name: "Amazon.se", search: "https://www.amazon.se/s?k=" }
  };

  const KIND_LABEL = { everyday: "Everyday thing", toy: "Toy", book: "Book" };
  const PLASTIC_LABEL = { none: "Plastic-free", some: "Little plastic", plastic: "Plastic" };

  const state = { age: "", kind: "", plastic: "", price: "", skills: [], q: "" };
  let items = [];
  let sources = {};
  const sourceOrder = [];

  const $ = (sel) => document.querySelector(sel);

  function el(tag, attrs, text) {
    const node = document.createElement(tag);
    if (attrs) for (const [k, v] of Object.entries(attrs)) {
      if (v === false || v == null) continue;
      node.setAttribute(k, v === true ? "" : v);
    }
    if (text != null) node.textContent = text;
    return node;
  }

  function formatAge(m) {
    if (m < 24) return m + " mo";
    const y = m / 12;
    return (Number.isInteger(y) ? y : y.toFixed(1).replace(".5", "½")) + " yr";
  }

  function formatRange([from, to]) {
    if (from === 0) return "From birth to " + formatAge(to);
    return formatAge(from) + " – " + formatAge(to);
  }

  function formatPrice(p) {
    return p === 0 ? "Free / DIY" : "~" + p + " kr";
  }

  function linkUrl(link) {
    if (link.url) return link.url;
    const store = STORES[link.store];
    return store.search + encodeURIComponent(link.q);
  }

  // ---- URL state -----------------------------------------------------------

  function readUrl() {
    const p = new URLSearchParams(location.search);
    state.age = PHASES.some((ph) => ph.id === p.get("age")) ? p.get("age") : "";
    state.kind = KINDS.some((k) => k.id === p.get("type")) ? p.get("type") : "";
    state.plastic = PLASTIC.some((k) => k.id === p.get("plastic")) ? p.get("plastic") : "";
    state.price = PRICES.some((k) => k.id === p.get("budget")) ? p.get("budget") : "";
    state.skills = (p.get("skills") || "").split(",").filter((s) => s in SKILLS);
    state.q = p.get("q") || "";
  }

  function writeUrl() {
    const p = new URLSearchParams();
    if (state.age) p.set("age", state.age);
    if (state.kind) p.set("type", state.kind);
    if (state.plastic) p.set("plastic", state.plastic);
    if (state.price) p.set("budget", state.price);
    if (state.skills.length) p.set("skills", state.skills.join(","));
    if (state.q) p.set("q", state.q);
    const qs = p.toString();
    history.replaceState(null, "", qs ? "?" + qs : location.pathname);
  }

  // ---- Filters -------------------------------------------------------------

  function matches(item) {
    if (state.age) {
      const ph = PHASES.find((x) => x.id === state.age);
      if (!(item.ages[0] < ph.to && item.ages[1] > ph.from)) return false;
    }
    if (state.kind && item.kind !== state.kind) return false;
    if (state.plastic === "none" && item.plastic !== "none") return false;
    if (state.plastic === "little" && item.plastic === "plastic") return false;
    if (state.price !== "" && item.price > Number(state.price)) return false;
    if (state.skills.length && !state.skills.some((s) => item.skills.includes(s))) return false;
    if (state.q) {
      const hay = [item.name, item.why, item.tip, ...(item.links || []).map((l) => l.label)].join(" ").toLowerCase();
      if (!state.q.toLowerCase().split(/\s+/).every((w) => hay.includes(w))) return false;
    }
    return true;
  }

  function renderSeg(container, options, key) {
    container.replaceChildren(...options.map((o) => {
      const b = el("button", { type: "button", "data-value": o.id }, o.label);
      b.addEventListener("click", () => { state[key] = o.id; update(); });
      return b;
    }));
  }

  function renderFilters() {
    const ageOpts = [{ id: "", label: "Any age", name: "" }, ...PHASES];
    $("#f-age").replaceChildren(...ageOpts.map((o) => {
      const b = el("button", { type: "button", class: "chip", "data-value": o.id });
      b.append(el("span", { class: "chip-main" }, o.label));
      if (o.name) b.append(el("span", { class: "chip-sub" }, o.name));
      b.addEventListener("click", () => { state.age = o.id; update(); });
      return b;
    }));
    renderSeg($("#f-kind"), KINDS, "kind");
    renderSeg($("#f-plastic"), PLASTIC, "plastic");
    renderSeg($("#f-price"), PRICES, "price");
    $("#f-skill").replaceChildren(...Object.entries(SKILLS).map(([id, label]) => {
      const b = el("button", { type: "button", class: "chip chip-small", "data-skill": id }, label);
      b.addEventListener("click", () => {
        state.skills = state.skills.includes(id) ? state.skills.filter((s) => s !== id) : [...state.skills, id];
        update();
      });
      return b;
    }));
    if (state.skills.length || state.q) $("#more-filters").open = true;
  }

  // Reflect state on the filter buttons without re-rendering them (keeps keyboard focus).
  function syncFilters() {
    const groups = { "#f-age": "age", "#f-kind": "kind", "#f-plastic": "plastic", "#f-price": "price" };
    for (const [sel, key] of Object.entries(groups)) {
      for (const b of document.querySelectorAll(sel + " button")) b.setAttribute("aria-pressed", String(b.dataset.value === state[key]));
    }
    for (const b of document.querySelectorAll("#f-skill button")) b.setAttribute("aria-pressed", String(state.skills.includes(b.dataset.skill)));
  }

  // ---- Cards ---------------------------------------------------------------

  function renderCard(item) {
    const node = $("#card-tpl").content.firstElementChild.cloneNode(true);
    node.id = item.id;
    node.dataset.kind = item.kind;
    node.querySelector(".card-title").textContent = item.name;
    node.querySelector(".card-meta").textContent = formatRange(item.ages);

    const badges = node.querySelector(".badges");
    badges.append(
      el("li", { class: "badge badge-kind-" + item.kind }, KIND_LABEL[item.kind]),
      el("li", { class: "badge badge-plastic-" + item.plastic }, PLASTIC_LABEL[item.plastic]),
      el("li", { class: "badge badge-price" }, formatPrice(item.price))
    );
    for (const s of item.skills) badges.append(el("li", { class: "badge badge-skill", "data-skill": s }, SKILLS[s]));

    node.querySelector(".why").textContent = item.why;
    const tip = node.querySelector(".tip");
    if (item.tip) { tip.prepend(el("strong", null, "Tip: ")); tip.append(item.tip); } else tip.remove();
    const safety = node.querySelector(".safety");
    if (item.safety) { safety.prepend(el("strong", null, "Safety: ")); safety.append(item.safety); } else safety.remove();

    const buy = node.querySelector(".buy");
    if (item.links.length) {
      for (const link of item.links) {
        const a = el("a", { class: "buy-link", href: linkUrl(link), target: "_blank", rel: "noopener" });
        a.append(el("span", { class: "buy-store" }, STORES[link.store].name));
        a.append(el("span", { class: "buy-label" }, link.label));
        if (link.price) a.append(el("span", { class: "buy-price" }, link.price + " kr"));
        buy.append(a);
      }
    } else {
      buy.append(el("p", { class: "diy" }, "Nothing to buy: make it from things at home."));
    }

    const cites = node.querySelector(".cites");
    cites.append("Sources: ");
    item.sources.forEach((id, i) => {
      if (i) cites.append(", ");
      cites.append(el("a", { href: "#src-" + id }, sources[id] ? sources[id].short : id));
    });
    return node;
  }

  function renderItems() {
    const shown = items.filter(matches);
    $("#items").replaceChildren(...shown.map(renderCard));
    $("#empty").hidden = shown.length > 0;
    const ph = PHASES.find((x) => x.id === state.age);
    $("#count").textContent = shown.length + (shown.length === 1 ? " idea" : " ideas") +
      (ph ? " for " + ph.label.replace("mo", "months").replace("yr", "years") : "");
  }

  function renderSources() {
    $("#source-list").replaceChildren(...sourceOrder.map((id) => {
      const s = sources[id];
      const li = el("li", { id: "src-" + id });
      li.append(s.cite + " ");
      li.append(el("a", { href: s.url, target: "_blank", rel: "noopener" }, "Link"));
      return li;
    }));
  }

  function update() {
    writeUrl();
    syncFilters();
    renderItems();
  }

  // ---- Init ----------------------------------------------------------------

  function init() {
    readUrl();
    $("#f-q").value = state.q;
    let t;
    $("#f-q").addEventListener("input", (e) => {
      clearTimeout(t);
      t = setTimeout(() => { state.q = e.target.value.trim(); writeUrl(); renderItems(); }, 150);
    });
    $("#reset").addEventListener("click", () => {
      Object.assign(state, { age: "", kind: "", plastic: "", price: "", skills: [], q: "" });
      $("#f-q").value = "";
      update();
    });
    $("#share").addEventListener("click", async () => {
      const btn = $("#share");
      try {
        await navigator.clipboard.writeText(location.href);
        btn.textContent = "Link copied!";
      } catch (e) {
        btn.textContent = "Copy the address bar";
      }
      setTimeout(() => { btn.textContent = "Copy link to this selection"; }, 2000);
    });

    Promise.all([
      fetch("data/items.json").then((r) => r.json()),
      fetch("data/sources.json").then((r) => r.json())
    ]).then(([its, srcs]) => {
      sources = srcs;
      items = its.sort((a, b) => a.ages[0] - b.ages[0] || a.price - b.price);
      for (const it of items) for (const s of it.sources) if (!sourceOrder.includes(s)) sourceOrder.push(s);
      for (const s of Object.keys(sources)) if (!sourceOrder.includes(s)) sourceOrder.push(s);
      renderSources();
      renderFilters();
      update();
    }).catch(() => {
      $("#count").textContent = "Could not load the list. Try reloading the page.";
    });
  }

  init();
})();
