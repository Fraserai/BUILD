# Aussie AI model prices

A one-page static site that lists the leading AI models (ranked by the Artificial Analysis Intelligence Index) with:

- input and output token prices in **AUD**, converted at the live exchange rate
- a "Hosted in AU" tag where an Australian data-residency option is confirmed
- tap any model to open its **model sheet**: score and rank, release date, AUD pricing (cached and batch), every provider's
  price, where you can use it (Claude API, Bedrock, Foundry, Vertex...), capabilities, benchmarks and run-it-yourself links.
  Each sheet has its own link (`#model-id`)
- open models list **every inference provider** with input, output and cached prices in AUD, the lowest price
  highlighted and the saving against the official API
- a **Hosted in Australia** check for every model, plus a filter for the ones you can run fully onshore today. A provider is only listed when it runs that exact model fully
  onshore. Otherwise the page says so, flags "Australian" listings that route overseas, and names the closest onshore option
- a **Run it yourself** card for open models: whether it fits a laptop, a workstation or needs a server, the
  hardware in AUD, and links to LM Studio and Hugging Face

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
| `data/hardware.json` | Australian retail hardware prices (AUD), used for the "Run it yourself" line |
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
