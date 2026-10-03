# Australian-hosted AI inference: the plan

_Researched 3 October 2026: five research agents, one planner and one red-team reviewer. Most figures come from search-result summaries; check the primary pages before quoting prices to a customer. Figures marked [assumption] are ours. All $ amounts are Australian dollars unless marked US$._

## The verdict

There is a real business here, but not the one that first comes to mind. "We host the newest open models in Australia" is not enough on its own:

- **Others got there first for some models.** SCX.ai (ASX: SCX, $6.5M contracted revenue, 49 paying customers) lists GLM-5.3, GLM-5.3-Flash and Qwen3.8-Max. AI Compute AU lists GLM-5.3-Flash and Qwen3.8 27B. Neither has confirmed the models actually run on Australian hardware, but the "nobody does this" pitch is gone.
- **Most buyers can already stay onshore for free.** Claude Opus 5.5 runs in Australia on Bedrock, and Gemini 3.8 Flash on Vertex Sydney. A company that only needs "data stays in Australia" will flip a setting at AWS or Google, not sign with a startup.

What buyers **can't** get today is three things together:
1. A provider that is **not US-owned**. The Australia–US CLOUD Act Agreement took effect on 31 January 2026, so data held onshore by a US company can still be compelled.
2. **Open weights**, so the customer can leave at any time and take the exact model with them.
3. **Australian contracts and billing**: AUD invoices, GST and audit rights.

That is exactly what APRA asked for in its April 2026 AI letter. It found banks, insurers and super funds "heavily dependent on a single provider" with few tested exit plans, and expects them to map AI dependencies and plan substitution under CPS 230.

**The one focus:** a private, Australian-owned AI endpoint that APRA-regulated companies use as their tested backup and exit route away from their US AI provider. It should then grow into their main provider.

## Who buys

**Mid-tier APRA-regulated companies:** insurers, super funds, mutual banks and credit unions. Each one is a large spender. They now have a written regulator expectation that this product answers, and they already buy material services from outside suppliers under CPS 230.

**Second wave:** Australian software companies handling sensitive data (legal tech, health software, fintech) that spend at least $15k a month on AI models and want a non-US option.

- **Do not lead with GP scribe vendors.** The red team found two firms hold about 95% of that market, and one already runs its own models on AWS Sydney.
- **Leave federal government until 2027.** IRAP PROTECTED costs $300–800k and takes 9–18 months, and new Hosting Certification Framework registrations are paused.

## The offer

- **Product:** a private endpoint with an OpenAI-compatible API. The customer only changes one URL.
  - Prompts are never stored or used for training.
  - Every byte is processed in a named Australian data centre.
  - Australian-owned company with no foreign parent.
  - The contract names the exit: same model, same weights, same serving setup.
- **Models.** Launch with one, chosen in the first calls:
  - **MiMo-V2.6-Pro** (MIT licence): the strongest open model, scoring 46 on the AA index.
  - **Nemotron 3 Ultra** (NVIDIA, US-origin, OpenMDW licence): for buyers who reject a Chinese-origin model. It's weaker, at 23.
  - Licences that need extra paperwork or have revenue caps: Kimi K3 (agreement needed above US$20M a year), Qwen3.8-Max (above US$50M), MiniMax-M3 (label required), Mistral (excludes large companies).
  - Keep DeepSeek out of anything that could reach government.
- **Price (AUD, excluding GST):**
  - **Private endpoint:** $15,000 a month on a 12-month term. This matches SCX's average of about $11k per customer per month and sovereign-hosting quotes of $8–20k a month for large models.
  - **Dedicated node:** $120,000 a month. That is 1.1–1.2× what Fireworks or Together charge for a US dedicated node. Single-region dedicated capacity commonly sells at 1.5–2× (Azure Regional PTU is 2×).
  - **Pilot:** $5,000 for 30 days, credited against the contract.

## The numbers for one node

**Node cost per month:**

| Hardware | Rent per month | Fits |
|---|---|---|
| 8× H200 (Micron21 / SharonAI rates) | ~$35–39k | Nemotron 3 Ultra, GLM-5.3-Flash, MiniMax-M3 |
| 8× B200 (Sydney on demand) | ~$59–63k | Needed for MiMo-V2.6-Pro (~1 TB) |
| 8× H200 on AWS Sydney | ~$67k | For comparison |

**Contribution on a B200 node at $63k a month** [assumption: about 10 endpoints per node, not yet benchmarked]:

| Customers on the node | Revenue | Contribution |
|---|---|---|
| 3 | $45k | −$18k |
| 5 | $75k | +$12k |
| 10 | $150k | +$87k |

On an H200 node at about $39k, break-even is the 3rd customer and 10 customers contribute about $111k a month.

**Whole company:**
- With 3–4 staff at about $55k a month [assumption], break-even is about 8 private endpoints.
- At 10 endpoints, that is $1.8M a year of revenue and about $380k profit.
- **One dedicated-node contract covers the whole overhead on its own.**
- Cash to reach break-even: about $600–700k [assumption], unless you sell before you build (below).

## How to start without burning money

The red team's main point: **sell first, build second.** Don't rent a GPU or hire anyone until customers have committed.

**Weeks 1–4, costing about $30–40k (legal, contract pack, calls) and $0 on hardware:**

1. **Company setup.** Register an Australian Pty Ltd with Australian directors, ABN and GST. Draft the contract pack: master services agreement, data processing addendum with the onshore and no-foreign-access clause, SLA, and exit clause.
2. **GPU quotes.** Get written quotes for an 8× H200 and an 8× B200 node from Australian-owned suppliers: SharonAI, Micron21, Firmus and Macquarie. Check ownership, data centre, any offshore support access and minimum term.
   - **Go/no-go:** an Australian-owned supplier, monthly terms, and an H200 node under about $40k.
3. **Target list.** List 40 targets: 25 mid-tier APRA entities (insurers, super funds, mutual banks) and 15 sensitive-data software firms that spend $15k+ a month on models. For each, find the CIO or CRO and the head of AI.
4. **The pitch.** "Your tested CPS 230 exit for AI: an Australian-owned, open-weights endpoint, not another US provider." In each call, ask:
   - "What's your current AI provider?"
   - "What's your monthly spend?"
   - "Would a US-owned provider in Australia (Azure Australia East, Bedrock AU) do? Why not?"
   - "Does model origin matter?"
5. **The gate.** Get **3 signed, paid commitments of at least $15k a month**, as letters of intent with a deposit or paid pilots. Each must come from a buyer who says in writing that a US-owned onshore option didn't meet their need.
   - **Hit the gate:** rent the node, run pilots on it and go.
   - **Miss the gate:** stop. You've spent about $35k, not $600k+.

**After the gate (weeks 5–13):**
- Rent the node monthly. Benchmark the chosen model on the customers' real workloads, and set capacity per endpoint from the result.
- Start SOC 2 Type 2: $20–80k over 4–6 months, which pilots will accept as "in progress".
- Bring Essential Eight to Maturity Level 2, and get a penetration test and insurance.
- Convert pilots to 12-month contracts before the mid-December shutdown.
- Sign a 12-month GPU term only once contracted revenue covers 70% of the node cost.

## What the price site does

- **Proof of independence.** It's the one place that shows, model by model, what really runs in Australia. Keep it honest: list SCX, AI Compute AU and the hyperscalers fairly, date every claim, and disclose that the owner sells onshore endpoints.
- **Demand signal.** A "Request this model onshore" button on each model shows which models buyers actually want.
- **Lead capture.** A private-endpoint enquiry form.

## What kills it, and the early warning

| Risk | Early warning | Response |
|---|---|---|
| Buyers say Azure AU or Bedrock AU is good enough | The answer to the US-owned question in calls | If 3 of the first 10 say "fine", narrow to buyers that require a non-US owner, or stop. |
| Buyers reject a Chinese-origin model | 2 of the first 5 calls object | Lead with Nemotron 3 Ultra, and accept the lower quality. |
| Switching takes 3–6 months (prompt and evaluation rework) | Pilots slip past December | No node until there are commitments. Price the pilot to cover the slot. |
| No moat on the model | SCX or a hyperscaler adds the same model in Sydney | The moat is Australian ownership, the exit contract and the APRA fit, not the model. |
| One node is a single point of failure | First GPU fault | Sell a 99.5% SLA only. Add a second site after 5 customers. |
| GPU costs in USD against AUD revenue | AUD falls | Index the price or hedge, and match GPU and customer terms. |

## Key sources

- APRA AI letter, 30 April 2026: https://www.apra.gov.au/news-and-publications/apra-letter-industry-artificial-intelligence-ai
- Analysis of the APRA letter (Clayton Utz): https://www.claytonutz.com/insights/2026/may/apras-ai-letter-a-shift-from-framework-to-targeted-expectations
- Sovereignty survey of 300 Australian C-suite respondents (83% would trade features for sovereignty): https://www.arnnet.com.au/article/4228536/enterprise-demand-for-sovereignty-opens-doors-for-partners-everpure.html
- SCX.ai after its IPO ($6.5M ARR, 49 customers): https://kalkine.com.au/news/announcements/scxai-holdings-commences-asx-trading-after-40-million-ipo-reports-a65-million-arr
- SCX.ai model listings: https://scx.ai/models/glm-5-3-flash
- AI Compute AU: https://api.aicompute.au/
- Australian H200 pricing compared with AWS, Azure and Google: https://www.micron21.com/blog/nvidia-h200-cloud-pricing-in-australia-2026-mcloud-vs-aws-azure-google-cloud-and-neoclouds
- Sydney B200 pricing (Spheron): https://gpuaas.com/gpu-cloud/australia
- Dedicated endpoint pricing: Fireworks https://www.morphllm.com/fireworks-ai-pricing, Together https://www.eesel.ai/blog/together-ai-pricing
- Azure provisioned throughput regional premium: https://techcommunity.microsoft.com/blog/azure-ai-foundry-blog/unveiling-azure-openai-service-provisioned-reservations-and-hourly-pricing/4214560
- IRAP cost and timeline: https://frontrowtech.com.au/insights/irap-assessment-process-cost-australia
- SOC 2 cost: https://soc2auditors.org/soc-2-audit-cost/
- Model licences:
  - Kimi K3: https://venturebeat.com/technology/kimi-k3s-full-weights-are-here-but-theyre-open-with-a-caveat-what-enterprises-should-know
  - Qwen3.8-Max: https://llm-stats.com/blog/research/qwen3-8-max-open-weights
  - GLM: https://thenewstack.io/zai-glm-weights-license/
- DeepSeek government direction: https://www.protectivesecurity.gov.au/publications-library/direction-001-2025-deepseek-products-applications-and-web-services
- GP scribe market share (red-team check): https://www.medicalrepublic.com.au/ai-scribe-wars-heating-up/111273
