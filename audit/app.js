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

  function facts(m) {
    var rows = [];
    if (m.context) rows.push(["Context window", (m.context >= 1e6 ? (m.context / 1e6).toFixed(m.context % 1e6 ? 2 : 0) + "M" : Math.round(m.context / 1000) + "K") + " tokens"]);
    if (m.price.cached != null) rows.push(["Cached input", aud(m.price.cached) + " per 1M"]);
    if (m.speed_tps) rows.push(["Speed", m.speed_tps + " tokens/sec"]);
    if (m.open) rows.push(["Licence", m.weights.license]);
    if (!rows.length) rows.push(["Made by", m.lab]);
    return '<dl class="facts">' + rows.map(function (r) {
      return "<div><dt>" + esc(r[0]) + "</dt><dd>" + esc(r[1]) + "</dd></div>";
    }).join("") + "</dl>";
  }

  function hosts(m) {
    var list = (m.providers || []).filter(function (p) { return p.in != null && p.out != null; });
    if (list.length < 2) return "";
    return '<section><h3>Price by provider</h3><table class="hosts"><thead><tr><th>Provider</th><th class="num">Input</th><th class="num">Output</th></tr></thead><tbody>' +
      list.map(function (p) {
        return "<tr><td>" + esc(p.name) + '</td><td class="num">' + aud(p.in) + '</td><td class="num">' + aud(p.out) + "</td></tr>";
      }).join("") + "</tbody></table></section>";
  }

  function runLocal(m) {
    if (!m.open || !m.weights.params_b) return "";
    return '<section><h3>Run it yourself</h3><p class="note">Needs about ' + fmtGb(memoryGb(m.weights.params_b)) +
      " of memory at 4-bit. Runs on " + esc(localOption(m.weights.params_b, data.hw)) + ".</p>" +
      (m.local ? '<p class="note">' + esc(m.local) + "</p>" : "") + "</section>";
  }

  function detail(m) {
    return '<div class="detail"><section><h3>Details</h3>' + facts(m) +
      (m.priceNote ? '<p class="note">' + esc(inAud(m.priceNote)) + "</p>" : "") + "</section>" +
      hosts(m) + runLocal(m) + "</div>";
  }

  function renderRows() {
    var list = data.models.models.filter(function (m) {
      return state.filter === "all" || (state.filter === "open") === m.open;
    }).sort(function (a, b) { return b.index - a.index || blendedUsd(a.price) - blendedUsd(b.price); });
    $("rows").innerHTML = list.map(function (m, i) {
      var badges = (m.open ? '<span class="badge open">Open</span>' : "") +
        (m.au && m.au.status === "au-region" ? '<span class="badge au">Hosted in AU</span>' : "");
      return '<li><details><summary class="row-sum">' +
        '<span class="name"><span class="rank">' + (i + 1) + '</span><span class="name-text"><b>' + esc(m.name) + "</b>" +
        '<span class="sub">' + esc(m.lab) + badges + "</span></span></span>" +
        '<span class="score"><span class="bar"><i style="width:' + Math.round(m.index / 60 * 100) + '%"></i></span><b>' + m.index + "</b></span>" +
        '<span class="price num p-in"><span class="lbl">In</span>' + aud(m.price.in) + "</span>" +
        '<span class="price num p-out"><span class="lbl">Out</span>' + aud(m.price.out) + "</span>" +
        "</summary>" + detail(m) + "</details></li>";
    }).join("");
  }

  function bindTheme() {
    var modes = ["auto", "light", "dark"];
    var mode = "auto";
    try { mode = modes.indexOf(localStorage.getItem("audit-theme")) >= 0 ? localStorage.getItem("audit-theme") : "auto"; } catch (e) { /* storage blocked */ }
    function apply() {
      if (mode === "auto") document.documentElement.removeAttribute("data-theme");
      else document.documentElement.setAttribute("data-theme", mode);
      $("theme-label").textContent = mode.charAt(0).toUpperCase() + mode.slice(1);
    }
    apply();
    $("theme-btn").addEventListener("click", function () {
      mode = modes[(modes.indexOf(mode) + 1) % modes.length];
      try { localStorage.setItem("audit-theme", mode); } catch (e) { /* storage blocked */ }
      apply();
    });
  }

  function start() {
    bindTheme();
    $("filter-seg").addEventListener("click", function (e) {
      var b = e.target.closest("button[data-filter]");
      if (!b) return;
      state.filter = b.dataset.filter;
      this.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      renderRows();
    });
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
      })
      .catch(function () {
        $("rows").innerHTML = '<li class="state">Prices couldn\'t load. Please refresh the page.</li>';
      });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
