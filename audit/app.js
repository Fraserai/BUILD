/* AUDit: renders AI model prices in AUD from the JSON files in data/. */
(function () {
  "use strict";

  var LIVE_FX_URL = "https://api.frankfurter.dev/v1/latest?base=USD&symbols=AUD";
  var BLEND_IN = 3; // Artificial Analysis blends price 3:1 input to output
  var BITS = { q4: 4.5, fp8: 8, bf16: 16 }; // effective bits per weight
  var OVERHEAD = 1.15; // KV cache and runtime headroom
  var USABLE = 0.9; // share of device memory a model can actually use
  var HOURS_PER_MONTH = 730;

  // ---------- pure helpers (also used by tests) ----------

  function audRate(usdAud, margin, gst) {
    return usdAud * (1 + (margin || 0)) * (gst ? 1.1 : 1);
  }

  function blendedUsd(price) {
    return (BLEND_IN * price.in + price.out) / (BLEND_IN + 1);
  }

  function monthlyUsd(price, inM, outM) {
    return price.in * inM + price.out * outM;
  }

  function memoryGb(paramsB, bits) {
    return paramsB * (bits / 8) * OVERHEAD;
  }

  function fmtAud(v) {
    if (v == null || isNaN(v)) return "–";
    var opts;
    if (v >= 1000) opts = { maximumFractionDigits: 0 };
    else if (v >= 1) opts = { minimumFractionDigits: 2, maximumFractionDigits: 2 };
    else if (v >= 0.01) opts = { minimumFractionDigits: 2, maximumFractionDigits: 3 };
    else if (v > 0) opts = { maximumSignificantDigits: 2 };
    else opts = { maximumFractionDigits: 0 };
    return "A$" + v.toLocaleString("en-AU", opts);
  }

  function fmtGb(v) {
    if (v >= 1000) return (v / 1000).toLocaleString("en-AU", { maximumFractionDigits: 1 }) + " TB";
    return Math.round(v).toLocaleString("en-AU") + " GB";
  }

  function fmtContext(n) {
    if (!n) return null;
    if (n >= 1000000) return (n / 1000000).toLocaleString("en-AU", { maximumFractionDigits: 2 }) + "M context";
    return Math.round(n / 1000) + "K context";
  }

  // Models nothing else beats on both price and intelligence, cheapest first.
  function frontier(points) {
    var sorted = points.slice().sort(function (a, b) { return a.x - b.x || b.y - a.y; });
    var best = -Infinity;
    return sorted.filter(function (p) {
      if (p.y > best) { best = p.y; return true; }
      return false;
    });
  }

  // Hardware options that hold a model at 4-bit.
  function hardwareFits(paramsB, hw, fx) {
    if (!paramsB) return [];
    var need = memoryGb(paramsB, BITS.q4);
    var out = [];
    hw.local.forEach(function (d) {
      if (d.memory_gb * USABLE >= need) out.push({ label: "1 × " + d.name, cost: fmtAud(d.aud) });
    });
    var pro = hw.local.filter(function (d) { return d.id === "rtx-pro-6000"; })[0];
    if (pro) {
      var n = Math.ceil(need / (pro.memory_gb * USABLE));
      if (n > 1 && n <= 8) out.push({ label: n + " × " + pro.name + " (cards only)", cost: fmtAud(n * pro.aud) });
    }
    var h200 = hw.cloud.filter(function (c) { return c.id === "h200"; })[0];
    if (h200) {
      var g = Math.max(1, Math.ceil(need / (h200.memory_gb * USABLE)));
      out.push({ label: "Rent " + g + " × " + h200.name, cost: fmtAud(g * h200.usd_hr * fx) + "/hr" });
    }
    return out;
  }

  var api = {
    audRate: audRate, blendedUsd: blendedUsd, monthlyUsd: monthlyUsd, memoryGb: memoryGb,
    fmtAud: fmtAud, frontier: frontier, hardwareFits: hardwareFits, BITS: BITS
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof document === "undefined") return;

  // ---------- page ----------

  var state = { filter: "all", sort: "index", inM: 20, outM: 5, margin: 0, gst: false, kwh: 0.33 };
  var data = { models: null, hw: null, fx: null };
  var $ = function (id) { return document.getElementById(id); };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function store(key, val) {
    try { if (val === undefined) return localStorage.getItem(key); localStorage.setItem(key, val); } catch (e) { return null; }
  }

  function getJson(url, timeoutMs) {
    var ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
    var t = ctrl && timeoutMs ? setTimeout(function () { ctrl.abort(); }, timeoutMs) : null;
    return fetch(url, ctrl ? { signal: ctrl.signal } : undefined).then(function (r) {
      if (t) clearTimeout(t);
      if (!r.ok) throw new Error(url + " returned " + r.status);
      return r.json();
    });
  }

  function loadFx(saved) {
    return getJson(LIVE_FX_URL, 4000).then(function (j) {
      var rate = j && j.rates && j.rates.AUD;
      if (!rate) throw new Error("no AUD rate");
      return { usd_aud: rate, date: j.date, live: true, source: "ECB reference rate" };
    }).catch(function () {
      return { usd_aud: saved.usd_aud, date: saved.date, live: false, source: saved.source };
    });
  }

  function fx() { return audRate(data.fx.usd_aud, state.margin, state.gst); }

  function auLabel(status) {
    return { "au-region": "AU region", "self-host": "Self-host", "offshore": "Offshore" }[status] || status;
  }

  function fmtDate(iso) {
    var d = new Date(iso + "T00:00:00");
    if (isNaN(d)) return iso;
    return d.toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" });
  }

  function visibleModels() {
    var list = data.models.models.filter(function (m) {
      if (state.filter === "open") return m.open;
      if (state.filter === "closed") return !m.open;
      if (state.filter === "au") return m.au && (m.au.status === "au-region" || m.au.status === "self-host");
      return true;
    });
    var key = {
      index: function (a, b) { return b.index - a.index || blendedUsd(a.price) - blendedUsd(b.price); },
      cost: function (a, b) { return monthlyUsd(a.price, state.inM, state.outM) - monthlyUsd(b.price, state.inM, state.outM); },
      value: function (a, b) { return b.index / blendedUsd(b.price) - a.index / blendedUsd(a.price); }
    }[state.sort];
    return list.sort(key);
  }

  function renderFxChip() {
    var r = fx();
    var bits = ["US$1 = " + fmtAud(r)];
    if (state.gst) bits.push("incl. GST");
    if (state.margin) bits.push("+" + Math.round(state.margin * 100) + "% card fee");
    bits.push(data.fx.live ? "live" : new Date(data.fx.date + "T00:00:00").toLocaleDateString("en-AU", { day: "numeric", month: "short" }));
    $("fx-chip").textContent = bits.join(" · ");
    $("fx-chip").title = (data.fx.live ? "Live " : "Saved ") + data.fx.source + ", " + data.fx.date;
  }

  function renderTiles() {
    var ms = data.models.models;
    var r = fx();
    var top = ms.slice().sort(function (a, b) { return b.index - a.index; })[0];
    var strong = ms.filter(function (m) { return m.index >= 40; });
    var value = strong.slice().sort(function (a, b) { return b.index / blendedUsd(b.price) - a.index / blendedUsd(a.price); })[0];
    var openTop = ms.filter(function (m) { return m.open && /MIT|Apache|OpenMDW/.test(m.weights.license); })
      .sort(function (a, b) { return b.index - a.index; })[0];
    function tile(k, m, s) {
      return '<div class="tile glass"><span class="k">' + esc(k) + '</span><span class="v">' + esc(m.name) +
        '<span class="score-pill">' + m.index + '</span></span><span class="s">' + s + "</span></div>";
    }
    $("tiles").innerHTML =
      tile("Smartest model", top, fmtAud(top.price.in * r) + " in · " + fmtAud(top.price.out * r) + " out per 1M") +
      tile("Best value scoring 40+", value, fmtAud(blendedUsd(value.price) * r) + " blended per 1M tokens") +
      tile("Smartest you can own", openTop, esc(openTop.weights.license) + " licence · " + fmtGb(memoryGb(openTop.weights.params_b, BITS.q4)) + " at 4-bit");
  }

  function providerTable(m, r) {
    if (!m.providers || !m.providers.length) return "";
    var rows = m.providers.map(function (p) {
      var price;
      if (p.hourly) price = '<td class="num" colspan="2">' + fmtAud(p.hourly * r) + "/hr</td>";
      else if (p.blended != null && p.in == null) price = '<td class="num" colspan="2">' + fmtAud(p.blended * r) + " blended</td>";
      else price = '<td class="num">' + fmtAud(p.in * r) + '</td><td class="num">' + (p.out != null ? fmtAud(p.out * r) : "–") + "</td>";
      var perf = [p.quant ? p.quant.toUpperCase() : "", p.tps ? p.tps + " tok/s" : "", p.ttft ? p.ttft + "s to first token" : ""].filter(Boolean).join(", ");
      return "<tr><td>" + esc(p.name) + (perf ? '<br><span class="muted">' + esc(perf) + "</span>" : "") + "</td>" + price + "</tr>";
    }).join("");
    return '<section><h4>Price by host, per 1M tokens</h4><table class="mini"><thead><tr><th>Host</th><th class="num">Input</th><th class="num">Output</th></tr></thead><tbody>' + rows + "</tbody></table></section>";
  }

  function selfHost(m, r) {
    if (!m.open) return "";
    var w = m.weights || {};
    var html = "<section><h4>Run it yourself</h4>";
    if (w.note) html += "<p>" + esc(w.note) + "</p>";
    if (!w.params_b) {
      return html + "<p>The parameter count isn't published in our sources yet, so we can't size hardware for it.</p></section>";
    }
    html += '<div class="mem">' +
      "<div><b>" + fmtGb(memoryGb(w.params_b, BITS.q4)) + "</b><span>4-bit</span></div>" +
      "<div><b>" + fmtGb(memoryGb(w.params_b, BITS.fp8)) + "</b><span>8-bit</span></div>" +
      "<div><b>" + fmtGb(memoryGb(w.params_b, BITS.bf16)) + "</b><span>16-bit (full)</span></div></div>";
    html += "<p>" + esc(w.params_b.toLocaleString("en-AU")) + "B parameters" +
      (w.active_b ? ", " + w.active_b + "B active per token, so it runs faster than its size suggests" : "") +
      ". Memory includes about 15% headroom for context.</p>";
    if (m.local) html += "<p>" + esc(m.local) + "</p>";
    var fits = hardwareFits(w.params_b, data.hw, r);
    if (fits.length) {
      html += '<ul class="fit">' + fits.map(function (f) {
        return "<li><span>" + esc(f.label) + "</span><span>" + f.cost + "</span></li>";
      }).join("") + "</ul>";
    }
    return html + "</section>";
  }

  function detail(m, r) {
    var notes = "";
    if (m.priceNote) notes += '<div class="callout">' + esc(m.priceNote) + "</div>";
    if (m.gov) notes += '<div class="callout gov"><strong>Government use.</strong> ' + esc(m.gov) + "</div>";
    var info = [
      m.lab + " (" + m.origin + ")",
      m.open ? (m.weights.license + ", " + (m.weights.arch || "")) : "Closed weights",
      fmtContext(m.context),
      m.speed_tps ? m.speed_tps + " tokens/s measured" : null,
      m.price.cached != null ? "Cached input " + fmtAud(m.price.cached * r) + " per 1M" : null
    ].filter(Boolean);
    var src = (m.sources || []).map(function (u) {
      var host = u.replace(/^https?:\/\/(www\.)?/, "").split("/")[0];
      return '<a href="' + esc(u) + '" target="_blank" rel="noopener">' + esc(host) + "</a>";
    }).join("");
    return '<div class="detail">' +
      "<section><h4>About</h4><p>" + esc(info.join(" · ")) + "</p>" + notes +
      "<h4>Australian hosting</h4><p><span class=\"badge " + esc(m.au.status) + '">' + auLabel(m.au.status) + "</span> " + esc(m.au.note) + "</p>" +
      '<h4>Sources</h4><div class="sources">' + src + "</div></section>" +
      providerTable(m, r) + selfHost(m, r) + "</div>";
  }

  function renderRows() {
    var r = fx();
    var list = visibleModels();
    var open = {};
    document.querySelectorAll("#rows details[open]").forEach(function (d) { open[d.dataset.id] = true; });
    if (!list.length) { $("rows").innerHTML = '<li class="state">No models match this filter.</li>'; return; }
    $("rows").innerHTML = list.map(function (m, i) {
      var month = monthlyUsd(m.price, state.inM, state.outM) * r;
      return '<li><details data-id="' + esc(m.id) + '"' + (open[m.id] ? " open" : "") + ">" +
        '<summary class="row-sum">' +
        '<span class="rank">' + (i + 1) + "</span>" +
        '<span class="mname"><b>' + esc(m.name) + (m.variant ? "<small>" + esc(m.variant) + "</small>" : "") + "</b>" +
        '<span class="meta"><span>' + esc(m.lab) + '</span><span class="badge origin">' + esc(m.origin) + "</span>" +
        (m.open ? '<span class="badge open">Open weights</span>' : "") +
        '<span class="badge ' + esc(m.au.status) + '">' + auLabel(m.au.status) + "</span></span></span>" +
        '<span class="iq"><span class="bar"><i style="width:' + Math.round(m.index / 60 * 100) + '%"></i></span><span>' + m.index + "</span></span>" +
        '<span class="price num p-in"><span class="mobile-label">In</span>' + fmtAud(m.price.in * r) + "</span>" +
        '<span class="price num p-out"><span class="mobile-label">Out</span>' + fmtAud(m.price.out * r) + "</span>" +
        '<span class="price num month"><span class="mobile-label">Month</span>' + fmtAud(month) + "</span>" +
        "</summary>" + detail(m, r) + "</details></li>";
    }).join("");
    $("board-sub").textContent = "Intelligence score from the " + data.models.benchmark.name + " " + data.models.benchmark.version +
      ". \"Your month\" is " + state.inM + "M input + " + state.outM + "M output tokens. Tap a model for host prices, hardware and sources.";
  }

  function renderChart() {
    var svg = $("chart");
    var W = 760, H = 400, L = 48, R = 24, T = 20, B = 46;
    var r = fx();
    var pts = data.models.models.map(function (m) {
      return { x: blendedUsd(m.price) * r, y: m.index, m: m };
    });
    var xs = pts.map(function (p) { return Math.log10(p.x); });
    var x0 = Math.floor(Math.min.apply(null, xs) * 2) / 2, x1 = Math.ceil(Math.max.apply(null, xs) * 2) / 2;
    var y0 = 10, y1 = 60;
    function sx(v) { return L + (Math.log10(v) - x0) / (x1 - x0) * (W - L - R); }
    function sy(v) { return T + (1 - (v - y0) / (y1 - y0)) * (H - T - B); }
    var g = "";
    for (var y = y0; y <= y1; y += 10) {
      g += '<line class="grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + sy(y) + '" y2="' + sy(y) + '"></line>';
      g += '<text class="tick" x="' + (L - 10) + '" y="' + (sy(y) + 4) + '" text-anchor="end">' + y + "</text>";
    }
    [0.1, 0.3, 1, 3, 10, 30, 100].forEach(function (v) {
      var lv = Math.log10(v);
      if (lv < x0 || lv > x1) return;
      g += '<line class="grid" x1="' + sx(v) + '" x2="' + sx(v) + '" y1="' + T + '" y2="' + (H - B) + '"></line>';
      g += '<text class="tick" x="' + sx(v) + '" y="' + (H - B + 18) + '" text-anchor="middle">' + fmtAud(v).replace(".00", "") + "</text>";
    });
    g += '<text class="axis-label" x="' + ((L + W - R) / 2) + '" y="' + (H - 6) + '" text-anchor="middle">Blended price per 1M tokens (log scale)</text>';
    g += '<text class="axis-label" x="14" y="' + ((T + H - B) / 2) + '" text-anchor="middle" transform="rotate(-90 14 ' + ((T + H - B) / 2) + ')">Intelligence</text>';
    var f = frontier(pts);
    var path = f.map(function (p, i) {
      return (i ? "H" : "M") + sx(p.x).toFixed(1) + (i ? " V" : " ") + sy(p.y).toFixed(1);
    }).join(" ");
    g += '<path class="frontier" d="' + path + '"></path>';
    pts.forEach(function (p) {
      g += '<circle class="' + (p.m.open ? "pt-open" : "pt-closed") + '" cx="' + sx(p.x).toFixed(1) + '" cy="' + sy(p.y).toFixed(1) + '" r="6"><title>' +
        esc(p.m.name + ": " + p.m.index + " points, " + fmtAud(p.x) + " blended per 1M") + "</title></circle>";
    });
    f.forEach(function (p, i) {
      var right = sx(p.x) < W - 170;
      g += '<text class="lbl" x="' + (sx(p.x) + (right ? 10 : -10)) + '" y="' + (sy(p.y) + (i % 2 ? 14 : -8)) + '" text-anchor="' + (right ? "start" : "end") + '">' + esc(p.m.name) + "</text>";
    });
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    svg.innerHTML = g;
  }

  function renderHardware() {
    var hw = data.hw;
    var open = data.models.models.filter(function (m) { return m.open && m.weights && m.weights.params_b; });
    $("hw-grid").innerHTML = hw.local.map(function (d) {
      var runs = open.filter(function (m) { return d.memory_gb * USABLE >= memoryGb(m.weights.params_b, BITS.q4); })
        .sort(function (a, b) { return b.index - a.index; }).map(function (m) { return m.name; });
      var powerMonth = d.watts / 1000 * 8 * 30 * state.kwh;
      return '<article class="hw-card glass"><span class="kind">' + esc(d.kind) + "</span><h3>" + esc(d.name) + "</h3>" +
        '<span class="big">' + fmtAud(d.aud) + "</span>" +
        '<span class="specs"><span class="badge">' + d.memory_gb + ' GB memory</span><span class="badge">' + d.watts + " W</span>" +
        '<span class="badge">' + fmtAud(powerMonth) + "/mo power at 8 h/day</span></span>" +
        "<p>" + esc(d.aud_note) + "</p>" +
        '<p class="runs"><strong>Runs at 4-bit:</strong> ' + (runs.length ? esc(runs.join(", ")) : "None of the listed open models on one unit. Stack several or pick a smaller model.") + "</p>" +
        "<p>" + esc(d.best_for) + ' <a href="' + esc(d.source) + '" target="_blank" rel="noopener">Price source</a></p></article>';
    }).join("");
    $("cloud-table").innerHTML = "<thead><tr><th>GPU</th><th class=\"num\">Memory</th><th class=\"num\">Per hour</th><th class=\"num\">Per month, 24/7</th><th>Rate</th></tr></thead><tbody>" +
      hw.cloud.map(function (c) {
        var hr = c.usd_hr * fx();
        return "<tr><td>" + esc(c.name) + '</td><td class="num">' + c.memory_gb + ' GB</td><td class="num">' + fmtAud(hr) +
          '</td><td class="num">' + fmtAud(hr * HOURS_PER_MONTH) + '</td><td><a href="' + esc(c.source) + '" target="_blank" rel="noopener">' + esc(c.note) + "</a></td></tr>";
      }).join("") + "</tbody>";
    $("cloud-note").textContent = hw.cloud_note;
  }

  function renderAll() {
    renderFxChip();
    renderTiles();
    renderRows();
    renderChart();
    renderHardware();
  }

  function num(id, fallback) {
    var v = parseFloat($(id).value);
    return isNaN(v) || v < 0 ? fallback : v;
  }

  function bind() {
    $("filter-seg").addEventListener("click", function (e) {
      var b = e.target.closest("button[data-filter]");
      if (!b) return;
      state.filter = b.dataset.filter;
      this.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      renderRows();
    });
    $("sort").addEventListener("change", function () { state.sort = this.value; renderRows(); });
    $("in-tokens").addEventListener("input", function () { state.inM = num("in-tokens", 0); renderRows(); });
    $("out-tokens").addEventListener("input", function () { state.outM = num("out-tokens", 0); renderRows(); });
    $("fx-margin").addEventListener("change", function () { state.margin = parseFloat(this.value) || 0; renderAll(); });
    $("gst").addEventListener("change", function () { state.gst = this.checked; renderAll(); });
    $("kwh").addEventListener("input", function () { state.kwh = num("kwh", 0); renderHardware(); });

    var modes = ["auto", "light", "dark"];
    var saved = store("audit-theme");
    var mode = modes.indexOf(saved) >= 0 ? saved : "auto";
    function applyTheme() {
      if (mode === "auto") document.documentElement.removeAttribute("data-theme");
      else document.documentElement.setAttribute("data-theme", mode);
      $("theme-label").textContent = mode.charAt(0).toUpperCase() + mode.slice(1);
    }
    applyTheme();
    $("theme-btn").addEventListener("click", function () {
      mode = modes[(modes.indexOf(mode) + 1) % modes.length];
      store("audit-theme", mode);
      applyTheme();
    });
  }

  function start() {
    bind();
    Promise.all([getJson("data/models.json"), getJson("data/hardware.json"), getJson("data/fx.json")])
      .then(function (res) {
        data.models = res[0];
        data.hw = res[1];
        $("hero-eyebrow").textContent = "Updated " + fmtDate(res[0].updated) + " · " + res[0].models.length + " models";
        $("foot-updated").textContent = "Prices checked " + fmtDate(res[0].updated) + ".";
        return loadFx(res[2]);
      })
      .then(function (f) { data.fx = f; renderAll(); })
      .catch(function (err) {
        $("rows").innerHTML = '<li class="state">The price data didn\'t load (' + esc(err.message) +
          "). If you opened this file directly, serve the folder instead: <code>python3 -m http.server</code> in the audit folder.</li>";
      });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
