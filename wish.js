// The wish list: build it (edit mode) or show a shared one (view mode). Everything lives in the link; see LT.parseWish.
(function () {
  "use strict";

  const { t, el, field, GIFT_IDS, CORE_IDS } = LT;

  LT.addStrings({
    en: {
      w_title_edit: "Make a wish list", w_title_view: "Wish list", w_title_for: "Wish list for ",
      w_edit_intro: "Pick ideas on the main list with “+ Wish list”, then fill in the rest here. Everything is optional.",
      w_privacy: "The list lives only in the link: nothing is stored on a server. A first name is enough.",
      w_child: "About the child", w_name: "Name", w_birth: "Born (month)",
      w_sizes: "Sizes", w_size_c: "Clothes (cm)", w_size_f: "Shoes (EU)", w_size_h: "Head (cm, for helmets)",
      w_interests: "Interests", w_interests_help: "What are they into right now? Pick up to 5, or write your own.",
      w_add: "Add", w_own_ph: "e.g. tractors", w_remove: "Remove",
      w_deep: "Go deep (optional)", w_deep_help: "Which kinds of toy are they building up over the years? Pick any, or none.",
      w_items: "Ideas on the list", w_items_empty: "Nothing yet.", w_find: "Find ideas on the main list",
      w_up: "Move up", w_down: "Move down", w_outside_age: "outside their age now",
      w_link: "Link to share", w_copy: "Copy link", w_copied: "Copied!", w_preview: "Preview", w_chars: "characters",
      w_long: "That's a long link; some apps may cut it off.",
      w_rule_intro: "The list follows a simple gift rule: something they want, something they need, something to wear, something to read, and maybe something to do and something to share.",
      w_rule_more: "Read more about it",
      w_loves: " loves", w_loves_anon: "Loves", w_ideas_for_interests: "Ideas that fit these interests",
      w_deep_title: "Going deep with", w_deep_title_name: " is going deep with",
      w_deep_intro: "Rather than lots of different toys, the family is building up these sets over the years. Adding to one is always a good gift.",
      w_more_ideas: "More ideas", w_outgrown: "May be outgrown by now",
      w_edit_this: "Edit this list", w_make_own: "Make your own wish list", w_all_ideas: "See all ideas",
      w_nothing: "This wish list is empty.", w_born: "born ", w_size_line: "Sizes: ",
      w_s_c: "clothes ", w_s_f: "shoes ", w_s_h: "head ", w_load_fail: "Could not load the list. Try reloading the page."
    },
    no: {
      w_title_edit: "Lag en ønskeliste", w_title_view: "Ønskeliste", w_title_for: "Ønskelista til ",
      w_edit_intro: "Velg ideer på hovedlista med «+ Ønskeliste», og fyll ut resten her. Alt er valgfritt.",
      w_privacy: "Lista finnes bare i lenken: ingenting lagres på en server. Fornavn holder.",
      w_child: "Om barnet", w_name: "Navn", w_birth: "Født (måned)",
      w_sizes: "Størrelser", w_size_c: "Klær (cm)", w_size_f: "Sko (EU)", w_size_h: "Hode (cm, til hjelm)",
      w_interests: "Interesser", w_interests_help: "Hva er barnet opptatt av akkurat nå? Velg opptil 5, eller skriv egne.",
      w_add: "Legg til", w_own_ph: "f.eks. traktorer", w_remove: "Fjern",
      w_deep: "Gå i dybden (valgfritt)", w_deep_help: "Hvilke typer leker bygger barnet opp over år? Velg noen, eller ingen.",
      w_items: "Ideer på lista", w_items_empty: "Ingenting ennå.", w_find: "Finn ideer på hovedlista",
      w_up: "Flytt opp", w_down: "Flytt ned", w_outside_age: "utenfor alderen nå",
      w_link: "Lenke til deling", w_copy: "Kopier lenke", w_copied: "Kopiert!", w_preview: "Forhåndsvis", w_chars: "tegn",
      w_long: "Lenken er lang; noen apper kan kutte den.",
      w_rule_intro: "Lista følger en enkel gaveregel: noe barnet ønsker seg, noe det trenger, noe å ha på seg, noe å lese, og kanskje noe å gjøre og noe å dele.",
      w_rule_more: "Les mer om den",
      w_loves: " er glad i", w_loves_anon: "Er glad i", w_ideas_for_interests: "Ideer som passer interessene",
      w_deep_title: "Går i dybden med", w_deep_title_name: " går i dybden med",
      w_deep_intro: "I stedet for mange ulike leker bygger familien opp disse settene over år. Å bygge videre på ett av dem er alltid en god gave.",
      w_more_ideas: "Flere ideer", w_outgrown: "Kanskje vokst fra den nå",
      w_edit_this: "Rediger lista", w_make_own: "Lag din egen ønskeliste", w_all_ideas: "Se alle ideer",
      w_nothing: "Denne ønskelista er tom.", w_born: "født ", w_size_line: "Størrelser: ",
      w_s_c: "klær ", w_s_f: "sko ", w_s_h: "hode ", w_load_fail: "Kunne ikke laste lista. Prøv å laste siden på nytt."
    }
  });

  const rootEl = document.getElementById("wish-root");
  const WISH_KEYS = ["n", "b", "d", "t", "s", "i"];
  let data, concepts, interestByCode, interestCodes, w, editing;

  // ---- Helpers -------------------------------------------------------------

  const ageNow = () => LT.ageMonths(w.birth);
  const fits = (item, age) => age == null || (item.ages[0] <= age && item.ages[1] > age);
  const chosen = () => w.items.map((c) => data.byCode[c]).filter(Boolean);
  const interestLabel = (code) => interestByCode[code][LT.lang()];

  function shareUrl() {
    const q = LT.wishQuery(w);
    return location.origin + location.pathname + (q ? "?" + q : "");
  }

  function birthLabel() {
    const d = new Date(2000 + +w.birth.slice(0, 2), +w.birth.slice(2) - 1, 1);
    return d.toLocaleDateString(LT.lang() === "no" ? "nb-NO" : "en-GB", { month: "long", year: "numeric" });
  }

  function sizeLine() {
    const [c, f, h] = w.sizes;
    const parts = [c && t("w_s_c") + c + " cm", f && t("w_s_f") + f, h && t("w_s_h") + h + " cm"].filter(Boolean);
    return parts.length ? t("w_size_line") + parts.join(" · ") : "";
  }

  // A short list of suggested ideas: links to the card on the main list.
  function miniList(list) {
    const ul = el("ul", { class: "mini-list" });
    for (const item of list) {
      const li = el("li");
      const a = el("a", { href: "./#" + item.id }, field(item, "name"));
      li.append(a, el("span", { class: "muted" }, " · " + LT.formatRange(item.ages) + " · " + LT.formatPrice(item.price)));
      ul.append(li);
    }
    return ul;
  }

  function suggestions(ids, exclude, max) {
    const age = ageNow();
    const seen = new Set(exclude);
    const out = [];
    for (const id of ids) {
      const item = data.byId[id];
      if (!item || seen.has(item.code) || !fits(item, age)) continue;
      seen.add(item.code);
      out.push(item);
      if (out.length >= max) break;
    }
    return out;
  }

  function chip(label, pressed, onClick, extra) {
    const b = el("button", Object.assign({ type: "button", class: "chip chip-small", "aria-pressed": String(pressed) }, extra || {}), label);
    b.addEventListener("click", onClick);
    return b;
  }

  // ---- View mode -----------------------------------------------------------

  function renderView() {
    const age = ageNow();
    const items = chosen();
    const parts = [];

    const head = el("section", { class: "wish-head" });
    head.append(el("h1", { class: "wish-title" }, w.name ? t("w_title_for") + w.name : t("w_title_view")));
    if (w.birth) head.append(el("p", { class: "wish-age" }, LT.formatAgeLong(age) + " · " + t("w_born") + birthLabel()));
    const intro = el("p", { class: "wish-intro" }, t("w_rule_intro") + " ");
    intro.append(el("a", { href: "gift-rule.html" }, t("w_rule_more")));
    head.append(intro);
    parts.push(head);

    if (!items.length && !w.interests.length && !w.words.length && !w.deep.length) {
      parts.push(el("p", { class: "empty" }, t("w_nothing")));
    }

    if (w.interests.length || w.words.length) {
      const sec = el("section", { class: "wish-section" });
      sec.append(el("h2", null, w.name ? w.name + t("w_loves") : t("w_loves_anon")));
      const tags = el("ul", { class: "interest-tags" });
      for (const c of w.interests) tags.append(el("li", { class: "interest-tag" }, interestByCode[c].icon + " " + interestLabel(c)));
      for (const word of w.words) tags.append(el("li", { class: "interest-tag" }, word));
      sec.append(tags);
      // Take one idea from each interest in turn, so the first interest doesn't fill the list.
      const lists = w.interests.map((c) => interestByCode[c].items);
      const mixed = [];
      for (let k = 0; lists.some((l) => k < l.length); k++) for (const l of lists) if (k < l.length) mixed.push(l[k]);
      const ideas = suggestions(mixed, w.items, 6);
      if (ideas.length) sec.append(el("h3", null, t("w_ideas_for_interests")), miniList(ideas));
      parts.push(sec);
    }

    const sizes = sizeLine();
    for (const g of GIFT_IDS) {
      const group = items.filter((i) => i.gift[0] === g);
      if (!group.length) continue;
      const sec = el("section", { class: "wish-section" });
      sec.append(el("h2", null, t("giftl_" + g)), el("p", { class: "wish-concept" }, concepts.gifts[g][LT.lang()]));
      if (sizes && (g === "wear" || g === "need")) sec.append(el("p", { class: "wish-sizes" }, sizes));
      const grid = el("div", { class: "grid" });
      for (const item of group) {
        const card = LT.renderCard(item, data.sources, { sourceHref: "./#src-" });
        if (age != null && item.ages[1] <= age) {
          card.classList.add("outgrown");
          card.querySelector(".card-head").append(el("p", { class: "outgrown-note" }, t("w_outgrown")));
        }
        grid.append(card);
      }
      sec.append(grid);
      parts.push(sec);
    }

    if (w.deep.length) {
      const sec = el("section", { class: "wish-section" });
      sec.append(el("h2", null, w.name ? w.name + t("w_deep_title_name") : t("w_deep_title")));
      const p = el("p", { class: "wish-concept" }, t("w_deep_intro") + " ");
      p.append(el("a", { href: "gift-rule.html#deep" }, t("w_rule_more")));
      sec.append(p);
      const grid = el("div", { class: "rule-grid" });
      for (const id of w.deep) {
        const c = concepts.core[id][LT.lang()];
        const card = el("article", { class: "rule-card deep-card" });
        card.append(el("h3", null, t("core_" + id)), el("p", null, c.text), el("p", { class: "rule-tip" }, c.add));
        const ideas = suggestions(data.items.filter((i) => i.core === id).map((i) => i.id), w.items, 4);
        if (ideas.length) card.append(el("p", { class: "mini-head" }, t("w_more_ideas")), miniList(ideas));
        grid.append(card);
      }
      sec.append(grid);
      parts.push(sec);
    }

    const actions = el("p", { class: "wish-actions" });
    actions.append(
      el("a", { href: "wish.html?edit=1&" + LT.wishQuery(w) }, t("w_edit_this")), " · ",
      el("a", { href: "wish.html?edit=1&new=1" }, t("w_make_own")), " · ",
      el("a", { href: "./" }, t("w_all_ideas"))
    );
    parts.push(actions);
    rootEl.replaceChildren(...parts);
    document.title = (w.name ? t("w_title_for") + w.name : t("w_title_view")) + " · " + t("site_name");
  }

  // ---- Edit mode -----------------------------------------------------------

  function save() {
    LT.draft.set(w);
    const q = LT.wishQuery(w);
    history.replaceState(null, "", "?edit=1" + (q ? "&" + q : ""));
    renderOutput();
  }

  function field2(labelKey, input) {
    const wrap = el("label", { class: "form-field" });
    wrap.append(el("span", { class: "form-label" }, t(labelKey)), input);
    return wrap;
  }

  function renderEdit() {
    const parts = [];
    const head = el("section", { class: "wish-head" });
    head.append(el("h1", { class: "wish-title" }, t("w_title_edit")), el("p", { class: "wish-intro" }, t("w_edit_intro")),
      el("p", { class: "muted" }, t("w_privacy")));
    parts.push(head);

    // About the child: text inputs update the state without re-rendering, so focus stays put.
    const child = el("fieldset", { class: "form-box" });
    child.append(el("legend", null, t("w_child")));
    const name = el("input", { type: "text", maxlength: LT.MAX.name, autocomplete: "off", value: w.name });
    name.addEventListener("input", () => { w.name = LT.clean(name.value, LT.MAX.name); save(); renderItemsList(); });
    const birth = el("input", { type: "month", value: w.birth ? "20" + w.birth.slice(0, 2) + "-" + w.birth.slice(2) : "" });
    birth.addEventListener("change", () => {
      const m = /^20(\d\d)-(\d\d)$/.exec(birth.value);
      w.birth = m ? m[1] + m[2] : "";
      save(); renderItemsList();
    });
    const row = el("div", { class: "form-row" });
    row.append(field2("w_name", name), field2("w_birth", birth));
    child.append(row);
    const sizes = el("div", { class: "form-row" });
    ["w_size_c", "w_size_f", "w_size_h"].forEach((key, i) => {
      const input = el("input", { type: "text", inputmode: "numeric", maxlength: 3, pattern: "[0-9]*", value: w.sizes[i], class: "input-short" });
      input.addEventListener("input", () => { w.sizes[i] = input.value.replace(/\D/g, "").slice(0, 3); save(); });
      sizes.append(field2(key, input));
    });
    child.append(el("p", { class: "form-sub" }, t("w_sizes")), sizes);
    parts.push(child);

    const interests = el("fieldset", { class: "form-box", id: "f-interests" });
    parts.push(interests);
    const deep = el("fieldset", { class: "form-box", id: "f-deep" });
    parts.push(deep);
    const list = el("section", { class: "form-box", id: "f-items" });
    parts.push(list);
    const out = el("section", { class: "form-box share-box", id: "f-out" });
    parts.push(out);

    rootEl.replaceChildren(...parts);
    renderInterests();
    renderDeep();
    renderItemsList();
    renderOutput();
    document.title = t("w_title_edit") + " · " + t("site_name");
  }

  function renderInterests() {
    const box = document.getElementById("f-interests");
    const total = w.interests.length + w.words.length;
    const full = total >= LT.MAX.interests;
    const chips = el("div", { class: "chips" });
    for (const it of concepts.interests) {
      const on = w.interests.includes(it.code);
      chips.append(chip(it.icon + " " + it[LT.lang()], on, () => {
        w.interests = on ? w.interests.filter((c) => c !== it.code) : [...w.interests, it.code];
        save(); renderInterests();
      }, { disabled: !on && full }));
    }
    const own = el("div", { class: "chips own-words" });
    for (const word of w.words) {
      own.append(chip(word + " ✕", true, () => { w.words = w.words.filter((x) => x !== word); save(); renderInterests(); },
        { "aria-label": t("w_remove") + ": " + word }));
    }
    const form = el("form", { class: "own-form" });
    const input = el("input", { type: "text", maxlength: LT.MAX.interest, placeholder: t("w_own_ph"), autocomplete: "off", disabled: full });
    const add = el("button", { type: "submit", class: "btn", disabled: full }, t("w_add"));
    form.append(input, add);
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const word = LT.clean(input.value, LT.MAX.interest);
      if (word.length >= 2 && !w.words.includes(word) && w.interests.length + w.words.length < LT.MAX.interests) {
        w.words.push(word);
        save(); renderInterests();
        document.querySelector(".own-form input").focus();
      }
    });
    box.replaceChildren(el("legend", null, t("w_interests")), el("p", { class: "form-help" }, t("w_interests_help")), chips, own, form);
  }

  function renderDeep() {
    const box = document.getElementById("f-deep");
    const chips = el("div", { class: "chips" });
    for (const id of CORE_IDS) {
      const on = w.deep.includes(id);
      chips.append(chip(t("core_" + id), on, () => {
        w.deep = on ? w.deep.filter((d) => d !== id) : CORE_IDS.filter((c) => c === id || w.deep.includes(c));
        save(); renderDeep();
      }));
    }
    box.replaceChildren(el("legend", null, t("w_deep")), el("p", { class: "form-help" }, t("w_deep_help")), chips);
  }

  function renderItemsList() {
    const box = document.getElementById("f-items");
    if (!box) return;
    const age = ageNow();
    const items = chosen();
    const ol = el("ol", { class: "pick-list" });
    items.forEach((item, idx) => {
      const li = el("li", { class: "pick" });
      const text = el("div", { class: "pick-text" });
      text.append(el("strong", null, field(item, "name")), el("span", { class: "muted" }, " · " + LT.formatRange(item.ages)));
      if (!fits(item, age)) text.append(el("span", { class: "pick-warn" }, " · " + t("w_outside_age")));
      const btns = el("div", { class: "pick-btns" });
      const move = (d) => () => {
        const i = w.items.indexOf(item.code), j = i + d;
        if (j < 0 || j >= w.items.length) return;
        [w.items[i], w.items[j]] = [w.items[j], w.items[i]];
        save(); renderItemsList();
      };
      const up = el("button", { type: "button", class: "icon-btn", "aria-label": t("w_up"), disabled: idx === 0 }, "↑");
      up.addEventListener("click", move(-1));
      const down = el("button", { type: "button", class: "icon-btn", "aria-label": t("w_down"), disabled: idx === items.length - 1 }, "↓");
      down.addEventListener("click", move(1));
      const rm = el("button", { type: "button", class: "icon-btn", "aria-label": t("w_remove") + ": " + field(item, "name") }, "✕");
      rm.addEventListener("click", () => { w.items = w.items.filter((c) => c !== item.code); save(); renderItemsList(); });
      btns.append(up, down, rm);
      li.append(text, btns);
      ol.append(li);
    });
    const find = el("p");
    find.append(el("a", { href: "./" }, t("w_find") + " →"));
    box.replaceChildren(el("h2", { class: "form-title" }, t("w_items") + " (" + items.length + ")"),
      items.length ? ol : el("p", { class: "muted" }, t("w_items_empty")), find);
  }

  function renderOutput() {
    const box = document.getElementById("f-out");
    if (!box) return;
    const url = shareUrl();
    const input = el("input", { type: "text", readonly: true, value: url, class: "share-input", "aria-label": t("w_link") });
    input.addEventListener("focus", () => input.select());
    const copy = el("button", { type: "button", class: "btn btn-primary" }, t("w_copy"));
    copy.addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(url); copy.textContent = t("w_copied"); } catch (e) { input.select(); }
      setTimeout(() => { copy.textContent = t("w_copy"); }, 2000);
    });
    const preview = el("a", { class: "btn", href: url }, t("w_preview"));
    const row = el("div", { class: "share-row" });
    row.append(copy, preview);
    const note = el("p", { class: "muted" }, url.length + " " + t("w_chars"));
    if (url.length > 1500) note.append(" · " + t("w_long"));
    box.replaceChildren(el("h2", { class: "form-title" }, t("w_link")), input, row, note);
  }

  // ---- Init ----------------------------------------------------------------

  function render() { editing ? renderEdit() : renderView(); }

  function init() {
    LT.addStrings({ en: { site_name: "Little Things" }, no: { site_name: "Små ting" } });
    const params = new URLSearchParams(location.search);
    const hasWish = WISH_KEYS.some((k) => params.has(k));
    editing = params.get("edit") === "1" || !hasWish;
    Promise.all([LT.loadData(), fetch("data/concepts.json").then((r) => r.json())]).then(([d, c]) => {
      data = d;
      concepts = c;
      interestByCode = Object.fromEntries(c.interests.map((i) => [i.code, i]));
      interestCodes = new Set(Object.keys(interestByCode));
      if (editing && params.get("new") === "1") { w = LT.emptyWish(); LT.draft.set(w); }
      else if (editing && !hasWish) w = LT.draft.get(interestCodes);
      else w = LT.parseWish(params, interestCodes);
      if (editing) save();
      render();
      document.addEventListener("lt-lang", render);
    }).catch(() => {
      rootEl.replaceChildren(el("p", { class: "empty" }, t("w_load_fail")));
    });
  }

  init();
})();
