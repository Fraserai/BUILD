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
    else if (v >= 0.001) opts = { minimumFractionDigits: 2, maximumFractionDigits: 3 };
    else return "<$0.001";
    return "$" + v.toLocaleString("en-AU", opts);
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
      return '<button type="button" class="tile glass" data-id="' + esc(m.id) + '"><span class="k">' + label + '</span><span class="v">' + esc(m.name) +
        '</span><span class="s">' + line + "</span></button>";
    }
    $("tiles").innerHTML =
      tile("Smartest", top, "Score " + top.index + " · " + aud(top.price.in) + " in · " + aud(top.price.out) + " out") +
      tile("Best value", value, "Score " + value.index + " · " + aud(value.price.in) + " in · " + aud(value.price.out) + " out") +
      tile("Best open model", open, "Score " + open.index + " · " + esc(open.weights.license) + " licence");
  }

  var COUNTRY = { US: "United States", CN: "China", FR: "France", AE: "UAE" };
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var ICON = {
    check: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 10.5l3.2 3.2L15 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    close: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5.5 5.5l9 9M14.5 5.5l-9 9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    chev: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M8 5l5 5-5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };

  function fmtTokens(n) {
    if (n >= 1e6) return +(n / 1e6).toFixed(2) + "M";
    return Math.round(n / 1000) + "K";
  }

  function fmtMonth(s) {
    var p = String(s || "").split("-");
    return p.length >= 2 ? MONTHS[+p[1] - 1] + " " + p[0] : s;
  }

  function sentence(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

  function byBlended(a, b) { return blendedUsd(a) - blendedUsd(b); }
  function sortedProviders(m) { return (m.providers || []).slice().sort(byBlended); }

  // Open models are listed at the lowest price any provider charges.
  function rowPrice(m) {
    var c = sortedProviders(m)[0];
    return c && blendedUsd(c) < blendedUsd(m.price) ? c : m.price;
  }

  function onshore(m) { return m.auHosting && m.auHosting.status === "available"; }

  function rows(pairs) {
    return '<dl class="kv">' + pairs.filter(function (p) { return p[1] != null && p[1] !== ""; }).map(function (p) {
      return "<div><dt>" + p[0] + "</dt><dd>" + p[1] + "</dd></div>";
    }).join("") + "</dl>";
  }

  function section(title, body) {
    return body ? '<section class="sec"><h3>' + title + "</h3>" + body + "</section>" : "";
  }

  // ---------- model sheet ----------

  function head(m) {
    var all = data.models.models;
    var rank = all.filter(function (x) { return x.index > m.index; }).length + 1;
    var price = rowPrice(m);
    var meta = [esc(m.lab), esc(COUNTRY[m.origin] || m.origin)];
    if (m.spec && m.spec.release) meta.push("Released " + fmtMonth(m.spec.release));
    var tags = (m.open ? '<span class="badge open">Open weights</span>' : "") +
      (onshore(m) ? '<span class="badge au">Hosted in AU</span>' : "");
    function stat(label, value, sub) {
      return '<div class="stat"><span class="st-label">' + label + '</span><span class="st-val">' + value + '</span><span class="st-sub">' + sub + "</span></div>";
    }
    return '<header class="sh-head"><p class="sh-meta">' + meta.join(" · ") + "</p>" +
      '<h2 id="sheet-title">' + esc(m.name) + "</h2>" + (tags ? '<div class="sh-tags">' + tags + "</div>" : "") +
      (m.bestFor ? '<p class="sh-best">' + esc(m.bestFor) + "</p>" : "") + "</header>" +
      '<div class="stats">' +
      stat("Intelligence", String(m.index), "#" + rank + " of " + all.length) +
      stat("Input", aud(price.in), price === m.price ? "per 1M tokens" : "cheapest, per 1M") +
      stat("Output", aud(price.out), price === m.price ? "per 1M tokens" : "cheapest, per 1M") +
      stat("Context", m.context ? fmtTokens(m.context) : "–", "tokens") +
      "</div>";
  }

  function pricing(m) {
    var p = m.price;
    var batch = p.batch ? aud(p.in * p.batch) + " in · " + aud(p.out * p.batch) + " out" : null;
    var body = rows([
      ["Input", aud(p.in)],
      ["Output", aud(p.out)],
      ["Cached input", p.cached != null ? aud(p.cached) : null],
      ["Batch", batch]
    ]);
    if (m.priceNote) body += '<p class="note">' + esc(inAud(m.priceNote)) + "</p>";
    var from = m.open ? "Official price" : esc(m.lab) + " price";
    return section("Pricing <span>" + from + ", per 1M tokens</span>", body);
  }

  function providers(m) {
    var list = sortedProviders(m);
    if (list.length < 2) return "";
    var hasCached = list.some(function (p) { return p.cached != null; });
    var body = '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Provider</th><th class="num">Input</th><th class="num">Output</th>' +
      (hasCached ? '<th class="num hide-sm">Cached</th>' : "") + "</tr></thead><tbody>" +
      list.map(function (p, i) {
        return "<tr" + (i === 0 ? ' class="best"' : "") + "><td>" + esc(p.name) +
          (i === 0 ? ' <span class="tag best">Lowest</span>' : "") + (p.official ? ' <span class="tag">Official</span>' : "") + "</td>" +
          '<td class="num">' + aud(p.in) + '</td><td class="num">' + aud(p.out) + "</td>" +
          (hasCached ? '<td class="num hide-sm">' + (p.cached != null ? aud(p.cached) : "–") + "</td>" : "") + "</tr>";
      }).join("") + "</tbody></table></div>";
    if (m.alsoOn && m.alsoOn.length) body += '<p class="note">Also on ' + esc(m.alsoOn.join(", ")) + ".</p>";
    return section("Providers <span>" + list.length + " with published prices</span>", body);
  }

  function capabilities(m) {
    var s = m.spec || {};
    var w = m.open ? m.weights : null;
    var reasoning = s.reasoning ? sentence(String(s.reasoning).split(";")[0].replace(/\s*\([^)]*\)/g, "").trim()) : null;
    return section("Capabilities", rows([
      ["Context window", m.context ? fmtTokens(m.context) + " tokens" : null],
      ["Max output", s.maxOutput ? fmtTokens(s.maxOutput) + " tokens" : null],
      ["Inputs", s.inputs ? esc(sentence(String(s.inputs).replace(/pdf/i, "PDF"))) : null],
      ["Reasoning", reasoning ? esc(reasoning) : null],
      ["Knowledge cutoff", s.cutoff ? fmtMonth(s.cutoff) : null],
      ["Speed", m.speed_tps ? m.speed_tps + " tokens/sec" : null],
      ["Size", w && w.params_b ? (w.params_b >= 1000 ? +(w.params_b / 1000).toFixed(2) + "T" : w.params_b + "B") + " parameters" + (w.active_b ? ", " + w.active_b + "B active" : "") : null],
      ["Licence", w ? esc(w.license) : null]
    ]));
  }

  function benchmarks(m) {
    var b = m.benchmarks || [];
    if (!b.length) return "";
    return section("Benchmarks", rows(b.map(function (x) {
      return [esc(x.name) + (x.lab ? ' <span class="tag">Lab-reported</span>' : ""), esc(x.score)];
    })));
  }

  function availability(m) {
    var plats = m.platforms || [];
    var au = onshore(m) ? '<p class="au-line"><span class="au-icon">' + ICON.check + "</span>" + esc(m.auHosting.how) + "</p>" : "";
    if (!plats.length && !au) return "";
    return section("Where to use it", au + (plats.length ? '<div class="chips">' + plats.map(function (p) {
      return '<span class="chip">' + esc(p) + "</span>";
    }).join("") + "</div>" : ""));
  }

  function runLocal(m) {
    if (!m.open || !m.weights.hf) return "";
    var w = m.weights, run = m.localRun || {};
    var mem = run.ram_gb ? "about " + run.ram_gb + " GB" : (w.params_b ? "about " + fmtGb(memoryGb(w.params_b)) : null);
    var hw = run.tier === "laptop" ? "a recent Mac or a PC with a high-end graphics card"
      : (w.params_b ? localOption(w.params_b, data.hw) : null);
    var body = rows([
      ["Memory needed", mem ? mem + (run.tier === "laptop" ? "" : " at 4-bit") : null],
      ["Runs on", hw ? esc(sentence(hw)) : null]
    ]);
    var btns = (run.lmstudio ? '<a class="btn primary" href="' + esc(run.lmstudio) + '" target="_blank" rel="noopener">Open in LM Studio</a>' : "") +
      (run.gguf ? '<a class="btn primary" href="' + esc(run.gguf) + '" target="_blank" rel="noopener">Download for LM Studio</a>' : "") +
      '<a class="btn" href="' + esc(w.hf) + '" target="_blank" rel="noopener">' + (/huggingface\.co/.test(w.hf) ? "Hugging Face" : "Model weights") + "</a>";
    return section("Run it yourself", body + '<div class="btns">' + btns + "</div>");
  }

  function sources(m) {
    var links = (m.sources || []).map(function (u) {
      return '<a href="' + esc(u) + '" target="_blank" rel="noopener">' + esc(u.replace(/^https?:\/\/(www\.)?/, "").split("/")[0]) + "</a>";
    }).join("");
    return links ? '<footer class="sh-foot">Sources ' + links + "</footer>" : "";
  }

  function renderSheet(m) {
    return '<button class="sh-close" type="button" aria-label="Close" data-close>' + ICON.close + "</button>" +
      '<div class="grabber" aria-hidden="true"></div>' +
      head(m) + pricing(m) + providers(m) + availability(m) + capabilities(m) + benchmarks(m) + runLocal(m) + sources(m);
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
    var q = state.query.trim().toLowerCase();
    var list = data.models.models.filter(function (m) {
      if (q && (m.name + " " + m.lab).toLowerCase().indexOf(q) < 0) return false;
      if (state.filter === "au") return onshore(m);
      return state.filter === "all" || (state.filter === "open") === m.open;
    }).sort(function (a, b) { return b.index - a.index || blendedUsd(a.price) - blendedUsd(b.price); });
    if (!list.length) { $("rows").innerHTML = '<li class="state">No models match.</li>'; return; }
    $("rows").innerHTML = list.map(function (m, i) {
      var price = rowPrice(m);
      var tags = (m.open ? '<span class="badge open">Open</span>' : "") + (onshore(m) ? '<span class="badge au">Hosted in AU</span>' : "");
      return '<li><button type="button" class="row-sum" data-id="' + esc(m.id) + '" aria-haspopup="dialog">' +
        '<span class="name"><span class="rank">' + (i + 1) + '</span><span class="name-text"><b>' + esc(m.name) + "</b>" +
        '<span class="sub">' + esc(m.lab) + tags + "</span></span></span>" +
        '<span class="score"><span class="bar"><i style="width:' + Math.round(m.index / 60 * 100) + '%"></i></span><span class="lbl">Score</span><b>' + m.index + "</b></span>" +
        '<span class="price num p-in"><span class="lbl">In</span>' + aud(price.in) + "</span>" +
        '<span class="price num p-out"><span class="lbl">Out</span>' + aud(price.out) + "</span>" +
        '<span class="chev" aria-hidden="true">' + ICON.chev + "</span></button></li>";
    }).join("");
  }

  function start() {
    state.query = "";
    $("filter-seg").addEventListener("click", function (e) {
      var b = e.target.closest("button[data-filter]");
      if (!b) return;
      state.filter = b.dataset.filter;
      this.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      renderRows();
    });
    $("search").addEventListener("input", function () { state.query = this.value; renderRows(); });
    document.addEventListener("click", function (e) {
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
