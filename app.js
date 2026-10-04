// The main list: filters, cards, sources and the wish-list bar. Shared pieces live in common.js (window.LT).
(function () {
  "use strict";

  const { t, el, PHASES, GIFT_IDS, CORE_IDS, SKILL_IDS, lastsYears, field } = LT;

  LT.addStrings({
    en: {
      age: "Age", any_age: "Any age", gift_rule: "Gift rule", whats_this: "what's this?", core_sets: "Go deep",
      go_deep_link: "go deep, not wide", type: "Type", plastic: "Plastic", budget: "Budget",
      years_toggle: "Only things that last for years", years_note: "(4+ years of use)",
      skills_search: "Skills and search", good_for: "Good for (any of)", search: "Search", search_ph: "e.g. bowl, puzzle, bath",
      reset: "Reset filters", share: "Copy link to this selection", copied: "Link copied!", copy_fail: "Copy the address bar",
      idea: "idea", ideas: "ideas", for: " for ", empty: "No matches. Try a wider age or budget.",
      load_fail: "Could not load the list. Try reloading the page.", link: "Link",
      wish_bar: "Wish list", wish_open: "Open the wish list",
      phases: ["0–3 mo", "3–6 mo", "6–9 mo", "9–12 mo", "1–1½ yr", "1½–2 yr", "2–3 yr", "3–5 yr"],
      phases_long: ["0–3 months", "3–6 months", "6–9 months", "9–12 months", "1–1½ years", "1½–2 years", "2–3 years", "3–5 years"]
    },
    no: {
      age: "Alder", any_age: "Alle aldre", gift_rule: "Gaveregel", whats_this: "hva er det?", core_sets: "Go deep",
      go_deep_link: "gå i dybden", type: "Type", plastic: "Plast", budget: "Budsjett",
      years_toggle: "Bare ting som varer i årevis", years_note: "(4+ års bruk)",
      skills_search: "Ferdigheter og søk", good_for: "Bra for (minst én av)", search: "Søk", search_ph: "f.eks. bolle, puslespill, bad",
      reset: "Nullstill filtre", share: "Kopier lenke til utvalget", copied: "Lenke kopiert!", copy_fail: "Kopier adresselinjen",
      idea: "idé", ideas: "ideer", for: " for ", empty: "Ingen treff. Prøv en videre alder eller et større budsjett.",
      load_fail: "Kunne ikke laste lista. Prøv å laste siden på nytt.", link: "Lenke",
      wish_bar: "Ønskeliste", wish_open: "Åpne ønskelista",
      phases: ["0–3 mnd", "3–6 mnd", "6–9 mnd", "9–12 mnd", "1–1½ år", "1½–2 år", "2–3 år", "3–5 år"],
      phases_long: ["0–3 måneder", "3–6 måneder", "6–9 måneder", "9–12 måneder", "1–1½ år", "1½–2 år", "2–3 år", "3–5 år"]
    }
  });

  const KINDS = ["", "everyday", "toy", "book"];
  const PLASTIC = ["", "little", "none"];
  const PRICES = ["", "0", "100", "300", "600"];

  const state = { age: "", gift: "", core: "", kind: "", plastic: "", price: "", years: false, skills: [], q: "" };
  let items = [];
  let sources = {};
  const sourceOrder = [];

  const $ = (sel) => document.querySelector(sel);

  // ---- URL state -----------------------------------------------------------

  function readUrl() {
    const p = new URLSearchParams(location.search);
    const pick = (value, allowed) => (allowed.includes(value) ? value : "");
    state.age = pick(p.get("age"), PHASES.map((ph) => ph.id));
    state.gift = pick(p.get("gift"), GIFT_IDS);
    state.core = pick(p.get("core"), CORE_IDS);
    state.kind = pick(p.get("type"), KINDS);
    state.plastic = pick(p.get("plastic"), PLASTIC);
    state.price = pick(p.get("budget"), PRICES);
    state.years = p.get("years") === "1";
    state.skills = (p.get("skills") || "").split(",").filter((s) => SKILL_IDS.includes(s));
    state.q = p.get("q") || "";
  }

  function writeUrl() {
    const p = new URLSearchParams();
    const lang = new URLSearchParams(location.search).get("lang");
    if (lang) p.set("lang", lang);
    if (state.age) p.set("age", state.age);
    if (state.gift) p.set("gift", state.gift);
    if (state.core) p.set("core", state.core);
    if (state.kind) p.set("type", state.kind);
    if (state.plastic) p.set("plastic", state.plastic);
    if (state.price) p.set("budget", state.price);
    if (state.years) p.set("years", "1");
    if (state.skills.length) p.set("skills", state.skills.join(","));
    if (state.q) p.set("q", state.q);
    const qs = p.toString();
    history.replaceState(null, "", (qs ? "?" + qs : location.pathname) + location.hash);
  }

  // ---- Filters -------------------------------------------------------------

  function matches(item) {
    if (state.age) {
      const ph = PHASES.find((x) => x.id === state.age);
      if (!(item.ages[0] < ph.to && item.ages[1] > ph.from)) return false;
    }
    if (state.gift && !item.gift.includes(state.gift)) return false;
    if (state.core && item.core !== state.core) return false;
    if (state.kind && item.kind !== state.kind) return false;
    if (state.plastic === "none" && item.plastic !== "none") return false;
    if (state.plastic === "little" && item.plastic === "plastic") return false;
    if (state.price !== "" && item.price > Number(state.price)) return false;
    if (state.years && !lastsYears(item)) return false;
    if (state.skills.length && !state.skills.some((s) => item.skills.includes(s))) return false;
    if (state.q) {
      const no = item.no || {};
      const hay = [item.name, item.why, item.tip, no.name, no.why, no.tip, ...item.links.map((l) => l.label + " " + (l.q || ""))]
        .join(" ").toLowerCase();
      if (!state.q.toLowerCase().split(/\s+/).every((w) => hay.includes(w))) return false;
    }
    return true;
  }

  function renderSeg(container, options, key) {
    container.replaceChildren(...options.map(([id, label]) => {
      const b = el("button", { type: "button", "data-value": id }, label);
      b.addEventListener("click", () => { state[key] = id; update(); });
      return b;
    }));
  }

  function renderFilters() {
    const labels = t("phases");
    const ageOpts = [["", t("any_age"), ""], ...PHASES.map((ph, i) => [ph.id, labels[i], t(ph.nameKey)])];
    $("#f-age").replaceChildren(...ageOpts.map(([id, label, name]) => {
      const b = el("button", { type: "button", class: "chip", "data-value": id });
      b.append(el("span", { class: "chip-main" }, label));
      if (name) b.append(el("span", { class: "chip-sub" }, name));
      b.addEventListener("click", () => { state.age = id; update(); });
      return b;
    }));
    renderSeg($("#f-gift"), [["", t("any")], ...GIFT_IDS.map((g) => [g, t("gift_" + g)])], "gift");
    renderSeg($("#f-core"), [["", t("any")], ...CORE_IDS.map((c) => [c, t("core_" + c)])], "core");
    renderSeg($("#f-kind"), KINDS.map((k) => [k, k ? t("kind_" + k) : t("all")]), "kind");
    renderSeg($("#f-plastic"), PLASTIC.map((k) => [k, k ? t("plastic_" + k) : t("any")]), "plastic");
    renderSeg($("#f-price"), PRICES.map((k) => [k, k === "" ? t("any") : k === "0" ? t("price_free") : "≤ " + k + " kr"]), "price");
    $("#f-skill").replaceChildren(...SKILL_IDS.map((id) => {
      const b = el("button", { type: "button", class: "chip chip-small", "data-skill": id }, t("skill_" + id));
      b.addEventListener("click", () => {
        state.skills = state.skills.includes(id) ? state.skills.filter((s) => s !== id) : [...state.skills, id];
        update();
      });
      return b;
    }));
    if (state.skills.length || state.q) $("#more-filters").open = true;
    syncFilters();
  }

  // Reflect state on the filter buttons without re-rendering them (keeps keyboard focus).
  function syncFilters() {
    const groups = { "#f-age": "age", "#f-gift": "gift", "#f-core": "core", "#f-kind": "kind", "#f-plastic": "plastic", "#f-price": "price" };
    for (const [sel, key] of Object.entries(groups)) {
      for (const b of document.querySelectorAll(sel + " button")) b.setAttribute("aria-pressed", String(b.dataset.value === state[key]));
    }
    $("#f-years").checked = state.years;
    for (const b of document.querySelectorAll("#f-skill button")) b.setAttribute("aria-pressed", String(state.skills.includes(b.dataset.skill)));
  }

  // ---- Cards and sources ---------------------------------------------------

  function renderItems() {
    const shown = items.filter(matches);
    $("#items").replaceChildren(...shown.map((item) => LT.renderCard(item, sources, { wish: LT.draft })));
    $("#empty").hidden = shown.length > 0;
    const i = PHASES.findIndex((x) => x.id === state.age);
    $("#count").textContent = shown.length + " " + (shown.length === 1 ? t("idea") : t("ideas")) +
      (i >= 0 ? t("for") + t("phases_long")[i] : "") +
      (state.gift ? ": " + t("giftl_" + state.gift).toLowerCase() : "");
  }

  function renderSources() {
    $("#source-list").replaceChildren(...sourceOrder.map((id) => {
      const s = sources[id];
      const li = el("li", { id: "src-" + id });
      li.append(s.cite + " ");
      li.append(el("a", { href: s.url, target: "_blank", rel: "noopener" }, t("link")));
      return li;
    }));
  }

  // The bar at the bottom that appears once something is on the wish list.
  function renderWishBar() {
    const n = LT.draft.count();
    const bar = $("#wish-bar");
    bar.hidden = n === 0;
    $("#wish-count").textContent = t("wish_bar") + ": " + n + " " + (n === 1 ? t("idea") : t("ideas"));
    $("#wish-open").textContent = t("wish_open") + " →";
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
    $("#f-years").addEventListener("change", (e) => { state.years = e.target.checked; update(); });
    let timer;
    $("#f-q").addEventListener("input", (e) => {
      clearTimeout(timer);
      timer = setTimeout(() => { state.q = e.target.value.trim(); writeUrl(); renderItems(); }, 150);
    });
    $("#reset").addEventListener("click", () => {
      Object.assign(state, { age: "", gift: "", core: "", kind: "", plastic: "", price: "", years: false, skills: [], q: "" });
      $("#f-q").value = "";
      update();
    });
    $("#share").addEventListener("click", async () => {
      const btn = $("#share");
      try {
        await navigator.clipboard.writeText(location.href);
        btn.textContent = t("copied");
      } catch (e) {
        btn.textContent = t("copy_fail");
      }
      setTimeout(() => { btn.textContent = t("share"); }, 2000);
    });
    document.addEventListener("lt-wish", renderWishBar);
    document.addEventListener("lt-lang", () => { renderFilters(); renderItems(); renderSources(); renderWishBar(); });

    LT.loadData().then((data) => {
      sources = data.sources;
      items = data.items.slice().sort((a, b) => a.ages[0] - b.ages[0] || a.price - b.price);
      for (const it of items) for (const s of it.sources) if (!sourceOrder.includes(s)) sourceOrder.push(s);
      for (const s of Object.keys(sources)) if (!sourceOrder.includes(s)) sourceOrder.push(s);
      renderSources();
      renderFilters();
      update();
      renderWishBar();
      // Links like ./#wooden-blocks point at a card that only exists after rendering.
      const target = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (target) target.scrollIntoView();
    }).catch(() => {
      $("#count").textContent = t("load_fail");
    });
  }

  init();
})();
