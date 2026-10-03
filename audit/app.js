/* Renders AI model prices in AUD from the JSON files in data/. */
(function () {
  "use strict";

  var LIVE_FX_URL = "https://api.frankfurter.dev/v1/latest?base=USD&symbols=AUD";
  var Q4_BITS = 4.5; // effective bits per weight for a 4-bit quantised model
  var OVERHEAD = 1.15; // KV cache and runtime headroom
  var USABLE = 0.9; // share of device memory a model can actually use

  function blendedUsd(price) { return (3 * price.in + price.out) / 4; }
  function memoryGb(paramsB) { return paramsB * (Q4_BITS / 8) * OVERHEAD; }

  function fmtAud(v) {
    var opts;
    if (v >= 1000) opts = { maximumFractionDigits: 0 };
    else if (v >= 0.1) opts = { minimumFractionDigits: 2, maximumFractionDigits: 2 };
    else opts = { maximumSignificantDigits: 2 };
    return "A$" + v.toLocaleString("en-AU", opts);
  }

  function fmtGb(v) {
    if (v >= 1000) return (v / 1000).toLocaleString("en-AU", { maximumFractionDigits: 1 }) + " TB";
    return Math.round(v / 10) * 10 + " GB";
  }

  // Cheapest way to hold a model at 4-bit on hardware you can buy in Australia.
  function localOption(paramsB, hw) {
    var need = memoryGb(paramsB);
    // hardware.json lists devices from fastest-for-the-money to largest.
    var single = hw.local.filter(function (d) { return d.memory_gb * USABLE >= need; })[0];
    if (single) return "one " + single.name + ", about " + fmtAud(Math.round(single.aud / 100) * 100);
    var pro = hw.local.filter(function (d) { return d.id === "rtx-pro-6000"; })[0];
    var n = pro ? Math.ceil(need / (pro.memory_gb * USABLE)) : 0;
    if (pro && n <= 8) return n + " × " + pro.name + " GPUs, about " + fmtAud(Math.round(n * pro.aud / 1000) * 1000);
    return "a multi-GPU server cluster";
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { fmtAud: fmtAud, memoryGb: memoryGb, localOption: localOption };
  }
  if (typeof document === "undefined") return;

  var state = { filter: "all" };
  var data = {};
  var $ = function (id) { return document.getElementById(id); };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function getJson(url, timeoutMs) {
    var ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
    if (ctrl && timeoutMs) setTimeout(function () { ctrl.abort(); }, timeoutMs);
    return fetch(url, ctrl ? { signal: ctrl.signal } : undefined).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    });
  }

  function loadRate(saved) {
    return getJson(LIVE_FX_URL, 4000)
      .then(function (j) { if (!j.rates || !j.rates.AUD) throw new Error("no rate"); return j.rates.AUD; })
      .catch(function () { return saved.usd_aud; });
  }

  function aud(usd) { return fmtAud(usd * data.rate); }

  // Notes in the data quote US dollars; show them in AUD like everything else.
  function inAud(text) {
    return text.replace(/US\$([\d.]+)/g, function (_, v) { return aud(parseFloat(v)); });
  }

  function renderTiles() {
    var ms = data.models.models;
    var byIndex = function (a, b) { return b.index - a.index; };
    var top = ms.slice().sort(byIndex)[0];
    var value = ms.filter(function (m) { return m.index >= 40; })
      .sort(function (a, b) { return b.index / blendedUsd(b.price) - a.index / blendedUsd(a.price); })[0];
    var open = ms.filter(function (m) { return m.open && /MIT|Apache|OpenMDW/.test(m.weights.license); }).sort(byIndex)[0];
    function tile(label, m, line) {
      return '<div class="tile glass"><span class="k">' + label + '</span><span class="v">' + esc(m.name) +
        '</span><span class="s">' + line + "</span></div>";
    }
    $("tiles").innerHTML =
      tile("Smartest", top, "Score " + top.index + " · " + aud(top.price.in) + " in, " + aud(top.price.out) + " out") +
      tile("Best value", value, "Score " + value.index + " · " + aud(value.price.in) + " in, " + aud(value.price.out) + " out") +
      tile("Best open model", open, "Score " + open.index + " · free to download and run yourself");
  }

  var COUNTRY = { US: "United States", CN: "China", FR: "France", AE: "United Arab Emirates" };
  var TIERS = {
    laptop: { label: "Runs on a laptop", cls: "t-laptop" },
    workstation: { label: "Runs on a workstation", cls: "t-work" },
    server: { label: "Needs a GPU server", cls: "t-server" }
  };
  var ICON = {
    check: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 10.5l3.2 3.2L15 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    close: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5.5 5.5l9 9M14.5 5.5l-9 9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    arrow: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 13l6-6M8 7h5v5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };

  function fmtContext(n) {
    return n >= 1e6 ? +(n / 1e6).toFixed(2) + "M" : Math.round(n / 1000) + "K";
  }

  function byBlended(a, b) { return blendedUsd(a) - blendedUsd(b); }
  function sortedProviders(m) { return (m.providers || []).slice().sort(byBlended); }

  // Open models are listed at the lowest price any provider charges.
  function rowPrice(m) {
    var c = sortedProviders(m)[0];
    return c && blendedUsd(c) < blendedUsd(m.price) ? c : m.price;
  }

  function link(label, url) {
    return '<a class="ext" href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(label) + ICON.arrow + "</a>";
  }

  function badges(m) {
    var local = m.localRun && (m.localRun.tier === "laptop" || m.localRun.tier === "workstation");
    return (m.open ? '<span class="badge open">Open weights</span>' : '<span class="badge closed">Closed</span>') +
      (local ? '<span class="badge local">Runs locally</span>' : "") +
      (m.auHosting && m.auHosting.status === "available" ? '<span class="badge au">Hosted in AU</span>' : "");
  }

  // ---------- model sheet ----------

  function sheetHeader(m) {
    var all = data.models.models;
    var rank = all.filter(function (x) { return x.index > m.index; }).length + 1;
    return '<header class="sh-head">' +
      '<p class="sh-lab">' + esc(m.lab) + " · " + esc(COUNTRY[m.origin] || m.origin) + "</p>" +
      '<h2 id="sheet-title">' + esc(m.name) + "</h2>" +
      (m.variant ? '<p class="sh-variant">' + (/^\d+$/.test(m.variant) ? "Version " : "Benchmark setting: ") + esc(m.variant) + "</p>" : "") +
      '<div class="sh-badges">' + badges(m) + "</div>" +
      '<div class="sh-score"><span class="score-big">' + m.index + "</span>" +
      '<div class="score-meta"><b>Intelligence score</b><span>Ranked ' + rank + " of " + all.length + " models</span>" +
      '<span class="meter" role="img" aria-label="' + m.index + ' out of 60"><i style="width:' + Math.round(m.index / 60 * 100) + '%"></i></span></div></div>' +
      "</header>";
  }

  function priceTiles(m) {
    var best = rowPrice(m);
    var from = best !== m.price ? best.name : (m.open ? "Official API" : m.lab + " API");
    var cached = best.cached;
    function tile(label, v, sub) {
      return '<div class="ptile"><span class="pt-label">' + label + '</span><span class="pt-val">' + v +
        '</span><span class="pt-sub">' + sub + "</span></div>";
    }
    return '<section class="ptiles" aria-label="Price per million tokens">' +
      tile("Input", aud(best.in), "per 1M tokens") +
      tile("Output", aud(best.out), "per 1M tokens") +
      (cached != null ? tile("Cached input", aud(cached), "per 1M tokens") : tile("Blended", aud(blendedUsd(best)), "3:1 in to out")) +
      '</section><p class="pt-from">' + (best !== m.price ? "Lowest price, from " : "Price from ") + "<b>" + esc(from) + "</b>" +
      (m.priceNote ? ". " + esc(inAud(m.priceNote)) : ".") + "</p>";
  }

  // Only models that genuinely run onshore get the Australian hosting card.
  function auCard(m) {
    var h = m.auHosting;
    if (!h || h.status !== "available") return "";
    var links = (h.links || []).map(function (l) { return link(l[0], l[1]); }).join("");
    return '<section class="card au-card is-ok"><div class="au-title"><span class="au-icon">' + ICON.check +
      "</span><h3>Runs fully in Australia</h3></div><p>" + esc(h.how) + "</p>" +
      (links ? '<div class="links">' + links + "</div>" : "") + "</section>";
  }

  function providerCard(m) {
    var list = sortedProviders(m);
    if (!list.length) return "";
    var max = blendedUsd(list[list.length - 1]);
    var low = list[0];
    var official = list.filter(function (p) { return p.official; })[0];
    var saving = official && !low.official && blendedUsd(low) < blendedUsd(official) * 0.97
      ? Math.round((1 - blendedUsd(low) / blendedUsd(official)) * 100) : 0;
    var rows = list.map(function (p, i) {
      var isBest = i === 0 && list.length > 1;
      var tags = (p.official ? '<span class="tag">Official</span>' : "") + (isBest ? '<span class="tag best">Lowest price</span>' : "");
      var extra = [p.cached != null ? "Cached " + aud(p.cached) : "", p.tps ? p.tps + " tokens/sec" : ""].filter(Boolean).join(" · ");
      return '<li class="prow' + (isBest ? " is-best" : "") + '">' +
        '<div class="p-name"><b>' + esc(p.name) + "</b>" + tags + (extra ? '<span class="p-extra">' + esc(extra) + "</span>" : "") + "</div>" +
        '<div class="p-bar" title="Blended ' + esc(aud(blendedUsd(p))) + ' per million tokens"><i style="width:' + Math.max(4, Math.round(blendedUsd(p) / max * 100)) + '%"></i></div>' +
        '<div class="p-num"><span>' + aud(p.in) + '</span><small>in</small></div>' +
        '<div class="p-num"><span>' + aud(p.out) + '</span><small>out</small></div></li>';
    }).join("");
    var head = list.length > 1
      ? (saving ? esc(low.name) + " is " + saving + "% cheaper than the official API." : "Prices vary up to " + (max / blendedUsd(low)).toFixed(1) + "× between providers.")
      : "One provider publishes a price for this model.";
    return '<section class="card"><div class="card-head"><h3>Compare providers</h3><span>' + list.length +
      (list.length === 1 ? " provider" : " providers") + "</span></div>" +
      '<p class="card-lede">' + head + " Bars show the blended price.</p>" +
      '<ol class="plist">' + rows + "</ol>" +
      (m.alsoOn && m.alsoOn.length ? '<p class="fine">Also offered by ' + esc(m.alsoOn.join(", ")) + ", who don't publish a price yet.</p>" : "") +
      '<p class="fine">All prices in AUD per million tokens.</p></section>';
  }

  function runCard(m) {
    if (!m.open) return "";
    var w = m.weights, run = m.localRun || {};
    if (!w.hf) {
      return '<section class="card run"><div class="card-head"><h3>Run it yourself</h3><span class="tier t-server">Coming soon</span></div><p class="card-lede">' +
        esc(w.note || "The weights aren't downloadable yet.") + "</p></section>";
    }
    var tier = TIERS[run.tier || "server"];
    var mem = run.tier === "laptop" ? run.ram_gb + " GB" : (w.params_b ? fmtGb(memoryGb(w.params_b)) : null);
    var hw = run.tier === "laptop" ? "A recent Mac or a PC with a high-end graphics card runs it comfortably."
      : (w.params_b ? "Runs on " + localOption(w.params_b, data.hw) + "." : "Needs a multi-GPU server.");
    if (!run.tier || run.tier === "server") hw += " Most teams use a provider instead.";
    var btns = (run.lmstudio ? '<a class="btn primary" href="' + esc(run.lmstudio) + '" target="_blank" rel="noopener">Get it in LM Studio</a>' : "") +
      (run.gguf ? '<a class="btn primary" href="' + esc(run.gguf) + '" target="_blank" rel="noopener">Download for LM Studio</a>' : "") +
      '<a class="btn" href="' + esc(w.hf) + '" target="_blank" rel="noopener">' + (/huggingface\.co/.test(w.hf) ? "View on Hugging Face" : "Download weights") + "</a>";
    return '<section class="card run"><div class="card-head"><h3>Run it yourself</h3><span class="tier ' + tier.cls + '">' + tier.label + "</span></div>" +
      (mem ? '<div class="mem"><span class="mem-big">' + mem + '</span><span class="mem-label">memory needed' + (run.tier === "laptop" ? "" : " at 4-bit") + "</span></div>" : "") +
      '<p class="card-lede">' + esc(hw) + "</p>" +
      (m.local ? '<p class="fine">' + esc(m.local) + "</p>" : "") +
      (w.note ? '<p class="fine">' + esc(w.note) + "</p>" : "") +
      '<div class="btns">' + btns + "</div></section>";
  }

  function specCard(m) {
    var specs = [];
    if (m.context) specs.push(["Context window", fmtContext(m.context), "tokens"]);
    if (m.open && m.weights.params_b) specs.push(["Size", m.weights.params_b >= 1000 ? (m.weights.params_b / 1000).toFixed(2).replace(/0+$/, "").replace(/\.$/, "") + "T" : m.weights.params_b + "B", "parameters"]);
    if (m.open && m.weights.active_b) specs.push(["Active", m.weights.active_b + "B", "parameters per token"]);
    if (m.speed_tps) specs.push(["Speed", String(m.speed_tps), "tokens per second"]);
    if (m.open) specs.push(["Licence", m.weights.license, m.weights.arch || "Open weights"]);
    specs.push(["Made in", COUNTRY[m.origin] || m.origin, m.lab]);
    return '<section class="card"><div class="card-head"><h3>Specs</h3></div><div class="specs">' + specs.map(function (s) {
      return '<div class="spec"><span class="s-label">' + esc(s[0]) + '</span><span class="s-val">' + esc(s[1]) + '</span><span class="s-sub">' + esc(s[2]) + "</span></div>";
    }).join("") + "</div></section>";
  }

  function sources(m) {
    var hosts = (m.sources || []).map(function (u) {
      return link(u.replace(/^https?:\/\/(www\.)?/, "").split("/")[0], u);
    }).join("");
    return '<footer class="sh-foot"><span>Sources</span><div class="links">' + hosts + "</div></footer>";
  }

  function renderSheet(m) {
    return '<button class="sh-close" type="button" aria-label="Close" data-close>' + ICON.close + "</button>" +
      '<div class="grabber" aria-hidden="true"></div>' +
      sheetHeader(m) + priceTiles(m) + auCard(m) + providerCard(m) + runCard(m) + specCard(m) + sources(m);
  }

  var lastFocus = null;

  function openSheet(id) {
    var m = data.models.models.filter(function (x) { return x.id === id; })[0];
    var dlg = $("sheet");
    if (!m || !dlg) return;
    lastFocus = document.activeElement;
    $("sheet-panel").innerHTML = renderSheet(m);
    $("sheet-panel").scrollTop = 0;
    if (!dlg.open) {
      if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
    }
    document.documentElement.classList.add("sheet-open");
    try { history.replaceState(null, "", "#" + id); } catch (e) { /* not allowed in some frames */ }
  }

  function closeSheet() {
    var dlg = $("sheet");
    if (!dlg || !dlg.open) return;
    if (dlg.close) dlg.close(); else dlg.removeAttribute("open");
  }

  function onSheetClosed() {
    document.documentElement.classList.remove("sheet-open");
    try { history.replaceState(null, "", location.pathname + location.search); } catch (e) { /* ignore */ }
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  // ---------- leaderboard ----------

  function renderRows() {
    var list = data.models.models.filter(function (m) {
      if (state.filter === "au") return m.auHosting && m.auHosting.status === "available";
      return state.filter === "all" || (state.filter === "open") === m.open;
    }).sort(function (a, b) { return b.index - a.index || blendedUsd(a.price) - blendedUsd(b.price); });
    $("rows").innerHTML = list.map(function (m, i) {
      var price = rowPrice(m);
      var from = m.providers && m.providers.length > 1 ? '<span class="from">from</span>' : "";
      var count = m.providers && m.providers.length > 1 ? '<span class="count">' + m.providers.length + " providers</span>" : "";
      var local = m.localRun && (m.localRun.tier === "laptop" || m.localRun.tier === "workstation");
      var tags = (m.open ? '<span class="badge open">Open</span>' : "") +
        (local ? '<span class="badge local">Runs locally</span>' : "") +
        (m.auHosting && m.auHosting.status === "available" ? '<span class="badge au">Hosted in AU</span>' : "");
      return '<li><button type="button" class="row-sum" data-id="' + esc(m.id) + '" aria-haspopup="dialog">' +
        '<span class="name"><span class="rank">' + (i + 1) + '</span><span class="name-text"><b>' + esc(m.name) + "</b>" +
        '<span class="sub">' + esc(m.lab) + tags + count + "</span></span></span>" +
        '<span class="score"><span class="bar"><i style="width:' + Math.round(m.index / 60 * 100) + '%"></i></span><span class="lbl">Score</span><b>' + m.index + "</b></span>" +
        '<span class="price num p-in"><span class="lbl">In</span>' + from + aud(price.in) + "</span>" +
        '<span class="price num p-out"><span class="lbl">Out</span>' + from + aud(price.out) + "</span>" +
        '<span class="chev" aria-hidden="true"><svg viewBox="0 0 20 20"><path d="M8 5l5 5-5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>' +
        "</button></li>";
    }).join("");
  }

  function start() {
    $("filter-seg").addEventListener("click", function (e) {
      var b = e.target.closest("button[data-filter]");
      if (!b) return;
      state.filter = b.dataset.filter;
      this.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      renderRows();
    });
    $("rows").addEventListener("click", function (e) {
      var b = e.target.closest("button[data-id]");
      if (b) openSheet(b.dataset.id);
    });
    var dlg = $("sheet");
    dlg.addEventListener("click", function (e) {
      if (e.target === dlg || e.target.closest("[data-close]")) closeSheet();
    });
    dlg.addEventListener("close", onSheetClosed);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeSheet(); });

    Promise.all([getJson("data/models.json"), getJson("data/hardware.json"), getJson("data/fx.json")])
      .then(function (res) {
        data.models = res[0];
        data.hw = res[1];
        var d = new Date(res[0].updated + "T00:00:00");
        if (!isNaN(d)) $("updated").textContent = "Updated " + d.toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" });
        return loadRate(res[2]);
      })
      .then(function (rate) {
        data.rate = rate;
        renderTiles();
        renderRows();
        var id = (location.hash || "").slice(1);
        if (id) openSheet(id);
      })
      .catch(function () {
        $("rows").innerHTML = '<li class="state">Prices couldn\'t load. Please refresh the page.</li>';
      });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
