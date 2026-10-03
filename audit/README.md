# AUDit: AI model prices in Australian dollars

A one-page static site that lists the leading AI models (ranked by the Artificial Analysis Intelligence Index) with:

- input, output and cached token prices converted to **AUD** at the live exchange rate
- optional **10% GST** and **card FX fee**, plus a monthly cost for your own token volume
- **Australian hosting** status for each model: AU region, self-hostable, or offshore
- **per-host prices** for open-weight models (DeepInfra, Fireworks, Together and others)
- **self-hosting sizing**: memory needed at 4/8/16-bit and which Australian-priced hardware fits
- a price-vs-intelligence chart with the best-value frontier
- notes for government buyers (PSPF directions, licences, GST)

No build step and no dependencies. The design uses a liquid-glass style inspired by Apple's newest iOS look.

## Run locally

```bash
cd audit
python3 -m http.server 8000
# open http://localhost:8000
```

The page loads its data with `fetch`, so opening `index.html` straight from disk won't work. Serve the folder.

## Files

| Path | What it holds |
| --- | --- |
| `index.html`, `styles.css`, `app.js` | The page |
| `data/models.json` | Models, USD prices, open-weight details, AU hosting notes, sources |
| `data/hardware.json` | Australian retail hardware prices (AUD, incl. GST) and cloud GPU rates |
| `data/fx.json` | Saved USD→AUD rate, used when the live rate can't load |
| `scripts/refresh_data.py` | Daily refresh of the FX rate and prices (standard library only) |

All prices are stored in USD and converted in the browser, so a new exchange rate never needs a data edit.

## Keeping it current

`.github/workflows/audit-refresh.yml` runs every morning at about 6am Sydney time:

1. Pulls the ECB USD→AUD reference rate into `data/fx.json`.
2. Pulls OpenRouter's public model list. Closed models marked `"autoPrice": true` get their list price updated.
3. For open-weight models, pulls each host's price (and speed where reported) and merges it into `providers`.
4. Runs `tests/test_audit_data.py` and commits any changes.

The script never overwrites a saved price with a missing or zero value. If nothing can be fetched it exits non-zero so the failed run shows up in Actions.

When the leaderboard changes (a new model or new scores), edit `data/models.json` by hand: add the model, its `index`, `openrouter` slug and `sources`.

## Hosting

Any static host works. The simplest options:

- **GitHub Pages**: Settings → Pages → deploy from branch, folder `/audit` (or move it to `/docs`).
- **Cloudflare Pages / Netlify**: set the output directory to `audit`, no build command. Both have Sydney edge locations.

## Data notes

- Benchmark scores are from Artificial Analysis Intelligence Index v4.3.2.
- First-party prices were checked on 3 October 2026. Every model lists its sources in the page.
- Memory estimates are parameters × bits ÷ 8 plus 15% headroom. Real usage depends on context length and runtime.
- Local hardware prices are Australian retail and move often. Cloud GPU rates are global marketplace rates. Sydney capacity usually costs more.
