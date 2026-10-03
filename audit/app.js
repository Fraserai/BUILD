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

  function fmtContext(n) {
    return (n >= 1e6 ? +(n / 1e6).toFixed(2) + "M" : Math.round(n / 1000) + "K") + " tokens";
  }

  function byBlended(a, b) { return blendedUsd(a) - blendedUsd(b); }

  // Open models are listed at the lowest price any provider charges.
  function rowPrice(m) {
    var c = (m.providers || []).slice().sort(byBlended)[0];
    return c && blendedUsd(c) < blendedUsd(m.price) ? c : m.price;
  }

  function facts(m) {
    var rows = [["Made by", m.lab]];
    if (m.context) rows.push(["Context window", fmtContext(m.context)]);
    if (m.price.cached != null) rows.push(["Cached input", aud(m.price.cached) + " per 1M"]);
    if (m.speed_tps) rows.push(["Speed", m.speed_tps + " tokens/sec"]);
    if (m.open) {
      rows.push(["Licence", m.weights.license]);
      if (m.weights.params_b) rows.push(["Size", m.weights.params_b.toLocaleString("en-AU") + "B parameters" + (m.weights.active_b ? ", " + m.weights.active_b + "B active" : "")]);
    }
    return '<dl class="facts">' + rows.map(function (r) {
      return "<div><dt>" + esc(r[0]) + "</dt><dd>" + esc(r[1]) + "</dd></div>";
    }).join("") + "</dl>";
  }

  function providers(m) {
    var list = (m.providers || []).slice().sort(byBlended);
    if (!list.length) return "";
    var hasSpeed = list.some(function (p) { return p.tps; });
    var hasCached = list.some(function (p) { return p.cached != null; });
    var low = list[0], high = list[list.length - 1];
    var official = list.filter(function (p) { return p.official; })[0];
    var summary = list.length + (list.length === 1 ? " provider" : " providers");
    if (official && !low.official && blendedUsd(low) < blendedUsd(official) * 0.97) {
      summary += " · " + esc(low.name) + " is " + Math.round((1 - blendedUsd(low) / blendedUsd(official)) * 100) + "% cheaper than " + esc(official.name.replace(/ \(.*\)$/, ""));
    } else if (list.length > 1 && blendedUsd(high) > blendedUsd(low) * 1.05) {
      summary += " · prices vary up to " + (blendedUsd(high) / blendedUsd(low)).toFixed(1) + "×";
    }
    var head = "<th>Provider</th><th class=\"num\">Input</th><th class=\"num\">Output</th>" +
      (hasCached ? "<th class=\"num hide-sm\">Cached</th>" : "") + (hasSpeed ? "<th class=\"num hide-sm\">Speed</th>" : "");
    var rows = list.map(function (p, i) {
      var tags = (p.official ? '<span class="tag official">Official</span>' : "") +
        (i === 0 && list.length > 1 ? '<span class="tag best">Lowest price</span>' : "");
      return '<tr class="' + (i === 0 && list.length > 1 ? "is-best" : "") + '"><td><span class="pname">' + esc(p.name) + "</span>" + tags + "</td>" +
        '<td class="num">' + aud(p.in) + '</td><td class="num">' + aud(p.out) + "</td>" +
        (hasCached ? '<td class="num hide-sm">' + (p.cached != null ? aud(p.cached) : "–") + "</td>" : "") +
        (hasSpeed ? '<td class="num hide-sm">' + (p.tps ? p.tps + " tok/s" : "–") + "</td>" : "") + "</tr>";
    }).join("");
    var also = m.alsoOn && m.alsoOn.length ? '<p class="also">Also on ' + esc(m.alsoOn.join(", ")) + ". Their prices aren't published yet.</p>" : "";
    return '<section class="prov"><div class="prov-head"><h3>Inference providers</h3><span>' + summary + "</span></div>" +
      '<div class="table-scroll"><table class="hosts"><thead><tr>' + head + "</tr></thead><tbody>" + rows + "</tbody></table></div>" +
      also + '<p class="also">AUD per million tokens.</p>' + auHosting(m) + "</section>";
  }

  function auHosting(m) {
    var h = m.auHosting;
    if (!h) return "";
    var ok = h.status === "available";
    var lines = ok ? "<p>" + esc(h.how) + "</p>" : "<p>No provider runs this model fully in Australia yet.</p>";
    if (h.warning) lines += '<p class="au-warn">' + esc(h.warning) + "</p>";
    if (h.closest) lines += "<p>" + esc(h.closest) + "</p>";
    if (!ok && m.open) {
      lines += "<p>" + (m.localRun && m.localRun.tier === "laptop" ? "It runs on your own computer, so you can keep every prompt onshore today."
        : "To keep data onshore today, run it on your own hardware or an Australian GPU cloud.") + "</p>";
    }
    var links = (h.links || []).map(function (l) {
      return '<a href="' + esc(l[1]) + '" target="_blank" rel="noopener">' + esc(l[0]) + "</a>";
    }).join("");
    return '<div class="au-box"><div class="au-head"><h3>Hosted in Australia</h3>' +
      (ok ? '<span class="pill-yes">Available</span>' : '<span class="pill-none">Not available yet</span>') + "</div>" +
      lines + (links ? '<div class="au-links">' + links + "</div>" : "") + "</div>";
  }

  var TIERS = {
    laptop: ["Runs on a laptop", "t-laptop"],
    workstation: ["Runs on a workstation", "t-work"],
    server: ["Needs a GPU server", "t-server"]
  };

  function runCard(m) {
    if (!m.open) return "";
    var w = m.weights, run = m.localRun || {};
    var tier = TIERS[run.tier || "server"];
    var body;
    if (!w.hf) {
      return '<div class="run-card"><span class="tier t-server">Coming soon</span><p>' + esc(w.note || "Weights are not downloadable yet.") + "</p></div>";
    }
    if (run.tier === "laptop") {
      body = "Needs about " + run.ram_gb + " GB of memory. A recent Mac or a PC with a high-end graphics card runs it comfortably.";
    } else if (w.params_b) {
      body = "Needs about " + fmtGb(memoryGb(w.params_b)) + " of memory at 4-bit. Runs on " + localOption(w.params_b, data.hw) + ".";
      if (run.tier !== "workstation") body += " Most teams use a provider instead.";
    } else {
      body = "Needs a multi-GPU server. Most teams use a provider instead.";
    }
    var btns = "";
    if (run.lmstudio) btns += '<a class="btn primary" href="' + esc(run.lmstudio) + '" target="_blank" rel="noopener">Get it in LM Studio</a>';
    if (run.gguf) btns += '<a class="btn primary" href="' + esc(run.gguf) + '" target="_blank" rel="noopener">Download for LM Studio</a>';
    btns += '<a class="btn" href="' + esc(w.hf) + '" target="_blank" rel="noopener">' + (/huggingface\.co/.test(w.hf) ? "Hugging Face" : "Download weights") + "</a>";
    return '<div class="run-card"><span class="tier ' + tier[1] + '">' + tier[0] + "</span><p>" + esc(body) + "</p>" +
      (m.local ? '<p class="muted">' + esc(m.local) + "</p>" : "") +
      (w.note ? '<p class="muted">' + esc(w.note) + "</p>" : "") +
      '<div class="btns">' + btns + "</div></div>";
  }

  function detail(m) {
    var notes = (m.priceNote ? '<p class="note">' + esc(inAud(m.priceNote)) + "</p>" : "") +
      "";
    var side = (m.open ? "" : auHosting(m)) + runCard(m) + "<section><h3>Details</h3>" + facts(m) + notes + "</section>";
    return '<div class="detail' + (m.open ? " is-open" : "") + '">' + providers(m) + '<div class="side">' + side + "</div></div>";
  }

  function renderRows() {
    var list = data.models.models.filter(function (m) {
      if (state.filter === "au") return m.auHosting && m.auHosting.status === "available";
      return state.filter === "all" || (state.filter === "open") === m.open;
    }).sort(function (a, b) { return b.index - a.index || blendedUsd(a.price) - blendedUsd(b.price); });
    $("rows").innerHTML = list.map(function (m, i) {
      var price = rowPrice(m);
      var from = m.providers && m.providers.length > 1 ? '<span class="from">from</span>' : "";
      var local = m.localRun && (m.localRun.tier === "laptop" || m.localRun.tier === "workstation");
      var badges = (m.open ? '<span class="badge open">Open</span>' : "") +
        (local ? '<span class="badge local">Runs locally</span>' : "") +
        (m.auHosting && m.auHosting.status === "available" ? '<span class="badge au">Hosted in AU</span>' : "");
      var count = m.providers && m.providers.length > 1 ? '<span class="count">' + m.providers.length + " providers</span>" : "";
      return '<li><details><summary class="row-sum">' +
        '<span class="name"><span class="rank">' + (i + 1) + '</span><span class="name-text"><b>' + esc(m.name) + "</b>" +
        '<span class="sub">' + esc(m.lab) + badges + count + "</span></span></span>" +
        '<span class="score"><span class="bar"><i style="width:' + Math.round(m.index / 60 * 100) + '%"></i></span><span class="lbl">Score</span><b>' + m.index + "</b></span>" +
        '<span class="price num p-in"><span class="lbl">In</span>' + from + aud(price.in) + "</span>" +
        '<span class="price num p-out"><span class="lbl">Out</span>' + from + aud(price.out) + "</span>" +
        "</summary>" + detail(m) + "</details></li>";
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
