# US Regulatory "Forcing Functions" (2025-2028) for Solo-Founder Niche Software / Software-Plus-Service

Research date: 2026-09-29. Status labels used below: **LIVE** (in force or firm date), **DELAYED** (date moved but rule stands), **UNCERTAIN** (proposed, not final, or in litigation), **DEAD/RESCINDED** (vacated, repealed or exempted away). Opportunity ratings are the researcher's rough judgment for a solo founder aiming at ~$30k/month profit in 12-24 months: High / Medium / Low.

---

## Q1. FDA FSMA Section 204 Food Traceability Rule (21 CFR Part 1, Subpart S)

### Takeaway
DELAYED but locked in: Congress barred FDA from enforcing before **July 20, 2028** (it was January 20, 2026). Independent grocers, restaurants over $250k in food sales, distributors, packers and seafood firms that handle Food Traceability List (FTL) foods must record KDEs at each CTE and produce a sortable spreadsheet within 24 hours. Low-cost tools start around $99/month, but they are built for manufacturers. Opportunity: **Medium-High**. Demand should build through 2027-2028, and the gap is receiving-side KDE capture at the store or restaurant back door.

### Cited Findings
- Original compliance date was Jan 20, 2026. FDA proposed a 30-month extension to July 20, 2028 (Federal Register, Aug 7, 2025, doc 2025-14967). In November 2025 Congress made the delay binding in the Continuing Appropriations, Agriculture, Legislative Branch, Military Construction and Veterans Affairs, and Extensions Act of 2026, which directs FDA not to enforce before July 20, 2028. — [Federal Register](https://www.federalregister.gov/documents/2025/08/07/2025-14967/requirements-for-additional-traceability-records-for-certain-foods-compliance-date-extension); [Nulogy](https://nulogy.com/fsma-204-timeline-shifted-key-takeaways-for-food-businesses/)
- FDA says it "intends to comply with this Congressional directive". The rule covers anyone who manufactures, processes, packs or holds FTL foods, domestic or foreign, "farm-to-table". FDA's page mentions no proposal to cut the rule's scope. — [FDA](https://www.fda.gov/food/food-safety-modernization-act-fsma/fsma-final-rule-requirements-additional-traceability-records-certain-foods)
- There are seven CTEs: harvesting, cooling, initial packing, first land-based receiving, shipping, receiving and transformation. On an outbreak or recall request, a firm must give FDA "an electronic sortable spreadsheet" within 24 hours. — [FDA](https://www.fda.gov/food/food-safety-modernization-act-fsma/fsma-final-rule-requirements-additional-traceability-records-certain-foods)
- Firms must also assign Traceability Lot Codes and capture KDEs at each CTE. — [inecta](https://www.inecta.com/blog/fsma-204-compliance-guide)
- Exemptions:
  - Retail food establishments and restaurants with ≤$250,000 average annual food sales (3-year rolling, inflation-adjusted) are fully exempt.
  - Farms with <$25,000 average annual food sales are exempt.
  - Firms with ≤$1,000,000 in food sales must keep the records but need not provide the sortable spreadsheet.
  — [Canary/Policy guide](https://www.thecanary.io/resources/fsma-204/guide); [FSQ Network](https://fsqnetwork.com/posts/who-s-in-and-who-s-out-understanding-exemptions-to-fsma-204)
- Vendors and pricing:
  - FoodReady: from $99/month (HACCP plus basic lot tracking, aimed at small and mid-size producers).
  - Cloud platforms generally: about $200-$800/month per facility for basic FSMA 204 modules.
  - Trustwell/FoodLogiQ: network-scale, GS1-based; "a single small plant will use a fraction of it".
  - ReposiTrak: runs the Traceability Network (RTN) and is the National Grocers Association's traceability partner.
  — [Flux IoT comparison](https://flux-iot.com/blog/best-food-traceability-software-fsma-204); [Hashlogics](https://www.hashlogics.com/best/food-traceability-software-for-small-processors); [NGA/ReposiTrak](https://www.nationalgrocers.org/partnerships/traceability-resource-center-repositrak/resources/)

### Inferences
- Most tools target processors and manufacturers. For an independent grocer or restaurant, the job is mostly the **receiving CTE**: capture the supplier's TLC and KDEs from invoices or bills of lading and link them to the stock received. Supplier data will arrive in many formats, which makes OCR or LLM extraction of invoices into FDA's spreadsheet format a plausible wedge.
- The partial-exemption tier ($250k-$1M food sales) still has to keep records but not the spreadsheet. That tier is a large, price-sensitive segment that suits a cheap tool ($29-$79/month).
- Timing: buyers are unlikely to act seriously before 2027. Revenue in the first 12 months would be thin unless the founder sells to distributors or produce and seafood packers now, whose retail customers will start demanding data first.
- Political risk: the rule survived the deregulatory push so far (only delayed, and by Congress). Further narrowing is possible but not announced.

### Gaps
- I could not retrieve the counts of affected firms or the cost figures from the final rule's regulatory impact analysis (Federal Register fetch redirected). No reliable count of covered restaurants and grocers was found.
- No verified pricing for ReposiTrak or iTrade small-retailer tiers.

---

## Q2. DOJ ADA Title II Web/Mobile Accessibility Rule (28 CFR Part 35, Subpart H), plus the parallel HHS Section 504 rule

### Takeaway
DELAYED one year by interim final rule (Apr 20, 2026). Entities serving populations of 50,000 or more now face **April 26, 2027**. Entities under 50,000 and **all special districts** face **April 26, 2028**. The standard is still WCAG 2.1 AA. HHS followed on May 7-11, 2026: HHS-funded recipients with 15 or more employees have until **May 11, 2027**, and those with fewer than 15 until **May 10, 2028**. This is the largest pool of chronically under-resourced buyers found (90,837 local governments, most of them tiny), and the need recurs because every new agenda, minutes document or PDF must be accessible. Opportunity: **High**.

### Cited Findings
- DOJ published the interim final rule on Apr 20, 2026, four days before the original Apr 24, 2026 deadline (Federal Register doc 2026-07663). Comments closed June 19, 2026. — [ADA Title III blog](https://www.adatitleiii.com/2026/04/doj-extends-ada-title-ii-website-accessibility-deadlines-for-governmental-entities-but-litigation-and-compliance-risks-remain/); [Federal Register](https://www.federalregister.gov/documents/2026/04/20/2026-07663/extension-of-compliance-dates-for-nondiscrimination-on-the-basis-of-disability-accessibility-of-web)
- New dates are Apr 26, 2027 (population ≥50,000) and Apr 26, 2028 (population <50,000 and special districts). The rule covers "state and local governments, public colleges and universities, courts and special districts (such as water, fire protection and transit authorities)". Covered content includes websites, online forms, PDFs, e-filing portals, mobile apps and learning management system materials. Per the interim rule, it "changes only the timing… WCAG 2.1 Level AA remains the standard." — [Duane Morris](https://www.duanemorris.com/alerts/doj_extends_ada_title_ii_digital_accessibility_deadlines_one_year_0426.html)
- DOJ stated it had "underestimated the costs and burden" of the 2024 rule, particularly for smaller governments. The underlying Title II nondiscrimination duties, and lawsuit exposure, continue meanwhile. — [ADA Title III blog](https://www.adatitleiii.com/2026/04/doj-extends-ada-title-ii-website-accessibility-deadlines-for-governmental-entities-but-litigation-and-compliance-risks-remain/)
- Disability groups opposed the delay, and a lawsuit has been reported over DOJ's change. — [AAPD](https://www.aapd.com/aapd-statement-title-ii-doj-web-rule-ifr/); [LF Legal](https://www.lflegal.com/2026/03/title-ii-action-needed/)
- HHS Section 504:
  - Interim final rule announced May 7, 2026 (Federal Register doc 2026-09266).
  - Recipients with 15 or more employees: May 11, 2027. Fewer than 15: May 10, 2028. Still WCAG 2.1 AA.
  - OCR asked for comment by July 6, 2026 on whether further rulemaking should reduce burdens on small recipients.
  - Covered recipients include community health centers, hospitals and primary care practices that take HHS funding.
  — [HHS press](https://www.hhs.gov/press-room/hhs-extends-mobile-and-web-accessibility-deadline.html); [Federal Register](https://www.federalregister.gov/documents/2026/05/11/2026-09266/extension-of-compliance-dates-for-nondiscrimination-on-the-basis-of-disability-accessibility-of-web)
- Affected population (2022 Census of Governments): 90,837 local governments, made up of 3,031 counties, 35,705 municipalities and townships, 12,546 independent school districts and 39,555 special districts. Public colleges and state agencies come on top. — [St. Louis Fed / Census](https://www.stlouisfed.org/publications/regional-economist/2024/march/local-governments-us-number-type); [Census](https://www.census.gov/data/tables/2022/econ/gus/2022-governments.html)
- Vendors and pricing:
  - Siteimprove: roughly $15k-$50k+/year. Vendr buyer data shows about €870-€2,170/month for 1k-5k pages.
  - Monsido (now part of Acquia): roughly $5k-$15k+/year.
  - Silktide: about €490/month for 1,000 pages.
  - CivicPlus: small towns pay about $4,600-$4,800/year for the website alone, with PDF remediation (DocAccess) and AudioEye sold as add-ons.
  - PDF remediation services: about $4-$25 per page ($4-$8/page at the budget end).
  — [TestParty](https://testparty.ai/blog/siteimprove-alternatives); [Vendr](https://www.vendr.com/marketplace/siteimprove); [Askem](https://askem.com/alternatives/silktide/); [Town Web](https://townweb.com/blog/how-much-does-a-municipal-website-cost/); [CivicPlus DocAccess](https://www.civicplus.com/web-accessibility-software/docaccess/); [Venngage](https://venngage.com/blog/pdf-accessibility-cost/); [DigitalA11Y](https://www.digitala11y.com/pricing/)

### Inferences
- The best-shaped niche is **special districts and towns under 50,000 people** (well over 60,000 entities). Many are run by a part-time clerk and publish recurring board packets, minutes, budgets, water-quality reports (CCRs) and meeting notices as scanned PDFs. Enterprise monitoring at $5k-$50k/year is out of reach for them. A product that converts documents to accessible PDF or HTML on upload, and generates each meeting's agenda packet, could sell at $99-$399/month.
- Rough maths: about 150 customers at $250/month is about $37.5k MRR. A software-plus-service model (AI remediation plus human QA) fits the quality bar.
- A second segment is **small HHS-funded clinics, FQHCs and behavioral health practices** under the May 2028 date for employers with fewer than 15 staff. They face the same work: patient forms, intake PDFs and portals.
- Risk: DOJ might revise further, since it admitted underestimating costs. But the Title II obligation itself does not go away, and plaintiff litigation keeps demand alive even without the technical rule.

### Gaps
- I did not retrieve the DOJ final regulatory impact analysis count of covered public entities or per-entity cost estimates.
- No data on what share of small towns currently meet WCAG 2.1 AA.

---

## Q3. HIPAA Security Rule overhaul (NPRM Jan 6, 2025)

### Takeaway
UNCERTAIN. The overhaul is **not final**. The regulatory agenda now shows final action for July 2027, and the rule could be finalized, changed or withdrawn. Opportunity now: **Low-Medium** (watch it). The current Security Rule already requires risk analysis, which small practices do poorly.

### Cited Findings
- NPRM announced Dec 27, 2024 and published Jan 6, 2025. Comments closed Mar 7, 2025, with about 4,745 comments. OMB's 2026 Regulatory Agenda targets a final rule by July 2027. — [HIPAA Journal](https://www.hipaajournal.com/hipaa-updates-hipaa-changes/); [Feldesman](https://www.feldesman.com/ocr-delays-final-action-on-proposed-hipaa-security-rule/)
- Possible outcomes: finalized as proposed, finalized with changes, delayed, republished or withdrawn. The current rule remains in effect. — [Clearwater](https://clearwatersecurity.com/blog/hipaa-security-rule-enforcement-2026/)
- Proposed requirements include annual compliance audits, an asset inventory, a network map of ePHI flows and stronger risk analysis. HHS estimated about $9B in first-year costs and about $6B/year in years 2-5. AHA and CHIME warned of disproportionate burden on small and rural providers. — [TechTarget](https://www.techtarget.com/healthtechsecurity/feature/Things-to-know-about-proposed-HIPAA-Security-Rule-updates)

### Inferences
- If finalized in mid-2027, and assuming the NPRM's proposed 240-day compliance period survives (not verified), the forcing date would fall around 2028. Existing SMB HIPAA vendors (Compliancy Group, Medcurity and similar) would absorb much of the demand.
- A solo founder could build a "HIPAA asset inventory and network map for 1-20 provider practices" wedge, but the regulatory trigger is not certain.

### Gaps
- I could not verify the number of small covered entities, or the NPRM's exact compliance period (240 days is claimed by vendor blogs).

---

## Q4. State privacy and AI laws affecting SMBs (CO AI Act, CA ADMT, NYC LL144, IL HB 3773, new state privacy laws)

### Takeaway
The AI laws have been softened and delayed:
- **Colorado:** SB 24-205 was replaced by **SB 26-189**, a notice and transparency law effective **January 1, 2027**, with no impact assessments.
- **California:** ADMT rules take effect **January 1, 2027**.
- **Illinois:** HB 3773 (AI notice and anti-discrimination in employment) has been live since **January 1, 2026**.
- **NYC:** LL144 bias audits are live, and enforcement may tighten after a state comptroller audit.

Comprehensive state privacy laws keep spreading, with new ones in 2026 (IN, KY, RI), 2027 (LA, OK, AL) and 2028 (VT). Most apply only above consumer-volume thresholds. Opportunity: **Low-Medium**. The requirements are largely paperwork (notices, adverse-action letters) that HR and ATS vendors will bundle. A niche "AI-in-hiring notice and recordkeeping kit" for small employers is possible, but willingness to pay is weak.

### Cited Findings
- Colorado:
  - SB25B-004 (signed Aug 28, 2025) moved the effective date to June 30, 2026.
  - On May 14, 2026, Gov. Polis signed SB 26-189, delaying the law to Jan 1, 2027. It removed the duty of care, deployer risk-management programs and impact assessments, and certain reporting duties to the Attorney General.
  — [Hunton](https://www.hunton.com/privacy-and-cybersecurity-law-blog/colorado-ai-act-amended-and-effective-date-delayed); [Carpe Datum Law](https://www.carpedatumlaw.com/2026/05/colorados-ai-reset-two-weeks-a-white-house-callout-and-a-pivot-away-from-the-eu-model/)
- SB 26-189 deployer duties:
  - Notice before covered ADMT is used in a consequential decision.
  - A notice within 30 days of an adverse outcome that the ADMT materially influenced.
  - Consumer rights to access and correct data and to request human review "to the extent commercially reasonable".
  - The Attorney General enforces exclusively, with penalties up to $20,000 per violation.
  — [Seyfarth](https://www.seyfarth.com/news-insights/colorado-enacts-artificial-intelligence-replacement-law.html); [AI Clear summary](https://aiclear.org/colorado-ai-act)
- xAI sued over the Colorado law, DOJ intervened, and enforcement of the original act was reported suspended. — [Norton Rose Fulbright](https://www.nortonrosefulbright.com/en-us/knowledge/publications/de3ad9de/xai-sues-doj-intervenes-enforcement-of-colorado-ai-act-suspended)
- California CPPA (finalized Sept 2025):
  - ADMT compliance is required by Jan 1, 2027: pre-use notice, opt-out and access rights for "significant decisions".
  - Risk assessments are required from Jan 1, 2026, with submissions to the CPPA due by Apr 1, 2028.
  - Cybersecurity audits are phased by revenue. Businesses under $50M revenue complete their first audit by Jan 1, 2030.
  — [CPPA](https://www.cppa.ca.gov/announcements/2025/20250923.html); [White & Case](https://www.whitecase.com/insight-alert/cppa-finalizes-rules-admt-risk-assessments-and-cybersecurity-audits-requirements); [Skadden](https://www.skadden.com/insights/publications/2025/10/california-finalizes-cppa-regulations)
- Illinois HB 3773 (effective Jan 1, 2026) amends the Illinois Human Rights Act. It bars AI use that has a discriminatory effect in recruitment, hiring, promotion, discipline and similar decisions, and requires notice to employees and applicants when AI is used. IDHR temporarily withdrew its proposed rules. — [Nat'l Law Review](https://natlawreview.com/article/illinois-anti-discrimination-law-address-ai-goes-effect-1-january-2026); [Seyfarth](https://www.seyfarth.com/news-insights/illinois-department-of-human-rights-temporarily-withdraws-proposed-rules-on-use-of-artificial-intelligence-in-employment.html)
- NYC Local Law 144:
  - A December 2025 NY State Comptroller audit found DCWP enforcement ineffective. Auditors reviewed 32 companies and found 17 potential non-compliance instances; DCWP had found one.
  - DCWP agreed to move toward proactive enforcement.
  — [NY OSC](https://www.osc.ny.gov/state-agencies/audits/2025/12/02/enforcement-local-law-144-automated-employment-decision-tools); [DLA Piper](https://www.dlapiper.com/en-us/insights/publications/2026/01/critical-audit-of-nyc-ai-hiring-law-signals-increased-risk-for-employers)
- State privacy laws:
  - Indiana, Kentucky and Rhode Island took effect Jan 1, 2026, bringing the total to about 20 states.
  - Louisiana and Oklahoma take effect Jan 1, 2027, Alabama May 1, 2027 ($15,000/violation) and Vermont Jan 1, 2028.
  - All are enforced by attorneys general, with no private right of action.
  — [Koley Jessen](https://www.koleyjessen.com/insights/publications/new-state-privacy-laws-effective-january-1-2026-indiana-kentucky-and-rhode-island); [MultiState](https://www.multistate.us/insider/2026/2/4/all-of-the-comprehensive-privacy-laws-that-take-effect-in-2026); [Davis+Gilbert](https://www.dglaw.com/new-state-privacy-laws-alabama-louisiana-oklahoma-and-vermont-join-the-party/); [Taft](https://www.privacyanddatasecurityinsight.com/2026/08/coming-soon-near-you-new-privacy-laws-in-alabama-louisiana-oklahoma-and-vermont/)

### Inferences
- Most comprehensive privacy laws exempt small businesses through consumer-count thresholds (typically 100,000 consumers). The SMB forcing function is weak except for data-heavy SMBs. Consent-management platforms (Termly, Osano, OneTrust and others) already serve this market cheaply.
- AI-in-employment rules (IL, CO, CA, NYC) do reach SMB employers that use AI screening in their ATS. The deliverables (notices, adverse-outcome letters, human-review logs) are templated and likely bundled by ATS vendors.
- LL144 bias audits require an "independent auditor" and suit a services business more than a SaaS one.

### Gaps
- No reliable count of SMB employers using AEDTs in NYC, IL, CO or CA.
- I did not confirm the CCPA revenue threshold figure for 2026 (inflation-adjusted from $25M).

---

## Q5. Building Performance Standards and benchmarking (NYC LL97, Boston BERDO, Denver, DC, St. Louis, WA CBPS)

### Takeaway
LIVE and escalating. NYC LL97 covers about 50,000 buildings with annual May 1 filings certified by a registered design professional (RDP). Washington's **Tier 2** (20,000-50,000 sq ft, including multifamily) must report by **July 1, 2027**, with no performance target, only benchmarking and plans. Denver, DC, Boston and St. Louis are in compliance cycles now. Engineering and consulting firms dominate, and small co-ops and condos complain about consultant costs. Opportunity: **Medium**. The best wedge is low-cost benchmarking and report-prep for 20k-50k sq ft buildings (WA Tier 2, DC under 50k benchmarking), sold through property managers.

### Cited Findings
- NYC LL97:
  - Covers buildings over 25,000 sq ft, plus multi-building lots or condo groups over 50,000 sq ft: about 50,000 buildings, about 40% of the city's building stock.
  - Penalty: $268 per metric ton of CO2e over the limit.
  - The 2025-emissions report was due May 1, 2026, with a grace period to June 30, 2026. About 93% of covered private buildings filed 2024 reports.
  — [Brightcore](https://brightcoreenergy.com/nyc-local-law-97-in-2026/); [NYC Accelerator](https://accelerator.nyc/ll97)
- LL97 reports must be certified by an RDP (PE or RA). The extension fee is $60 via the BEAM portal. Failure to file carries a penalty of up to gross floor area × $0.50 per month. Co-op and condo coalitions called the late fees "punitive". — [NYC Accelerator](https://accelerator.nyc/building-laws/ll97); [Brick Underground](https://www.brickunderground.com/improve/punitive-late-filing-fees-local-law-97-benchmarking-data)
- Washington CBPS:
  - Tier 2 covers multifamily and non-residential buildings of 20,000-50,000 sq ft. They report by July 1, 2027 and are not required to meet an energy target. Tier 2 penalties are capped at $0.30/sq ft.
  - Tier 1 fines run up to $5,000 plus $1.00/sq ft per year.
  — [WA Commerce Tier 2](https://www.commerce.wa.gov/cbps/tier-2-compliance/); [Greeneconome](https://greeneconome.com/washington-clean-buildings-performance-standards-cbps/)
- Denver (Energize Denver): applies to buildings of 25,000 sq ft or more, with annual benchmarking, a first compliance year of 2025 and interim targets in 2027 and 2030. It received "deemed compliance" status with Colorado's statewide BPS in Jan 2026. — [CMTA](https://www.cmta.com/news/energize-denver-faq); [Trane](https://www.trane.com/commercial/north-america/us/en/support/regulations/building-performance-standards/energize-denver-ordinance.html)
- DC BEPS: covers buildings of 50,000 sq ft or more. Cycle 1 (2021-2026) ends in 2026, with maximum penalties up to $10/sq ft. Private buildings over 10,000 sq ft must benchmark annually (first deadline April 1, 2025). — [Envigilance](https://envigilance.com/energy-monitoring/beps/); [DCSEU](https://www.dcseu.com/resource-library/beps)
- Boston BERDO 2.0: five-year cycles from 2025 to 2050. Fines reported at up to $1,000/day for non-compliant buildings over 35,000 sq ft. — [Boston.gov](https://www.boston.gov/departments/environment/berdo); [Oxmaint summary](https://oxmaint.com/industries/facility-management/building-performance-standards-compliance-guide)
- St. Louis BEPS: no rollback found. About 50% of large buildings are out of compliance, down from 65%. A second cycle begins in 2026, and affordable housing and houses of worship have until May 2027. — [Facilities Dive](https://www.facilitiesdive.com/news/st-louis-building-performance-standards-compliance-deadline-energy-reductions/742157/); [St. Louis Magazine](https://www.stlmag.com/news/st-louis-building-performance-standards/)
- JLL research (via secondary source) says total fines rise about 82% on average between the first and second compliance periods. — [Envigilance](https://envigilance.com/blog/building-decarbonization/) (secondary; not verified against JLL)

### Inferences
- The recurring workflow is annual: pull utility data (often manually for buildings without aggregated data), update ENERGY STAR Portfolio Manager, compute emissions or EUI against limits, and prepare the filing for RDP sign-off.
- A founder could offer "benchmarking-as-a-service" at about $500-$1,500 per building per year, with RDP partners handling certification in NYC.
- Crowded at the top (Bueno, Conservice, engineering firms), but small 20k-50k sq ft buildings in WA, DC and Denver are underserved.

### Gaps
- No count of WA Tier 2 buildings found. No verified vendor pricing for LL97 filing services (anecdotally a few thousand dollars per report, unverified).

---

## Q6. California SB 253/261 climate disclosure, and EU CBAM cascading to US suppliers

### Takeaway
SB 253 is LIVE for companies with more than $1B revenue: Scope 1 and 2 reports were due **Aug 10, 2026**. SB 261 is **enjoined** by the Ninth Circuit, pending appeal. CBAM's definitive (paid) period began Jan 1, 2026, but a new **50-tonne/year** de minimis exempts most small EU importers, and obligations fall on EU importers, not US exporters. Supplier data requests to small US suppliers will grow, but the legal forcing function on SMBs is indirect. Opportunity: **Low-Medium**.

### Cited Findings
- CARB adopted a first-year SB 253 deadline of Aug 10, 2026 for Scope 1 and 2 emissions, for entities "doing business in California" with more than $1B revenue. — [Greenberg Traurig](https://www.gtlaw.com/en/insights/2026/3/carb-adopts-initial-climate-disclosure-reporting-regulations-to-implement-sb-253-and-sb-261); [Davis Polk](https://www.davispolk.com/insights/client-update/sb-253-261-update-carb-workshop-august-2026-reporting-proposed-rules-2027)
- The Ninth Circuit granted an injunction pending appeal for SB 261 in November 2025 but denied one for SB 253. Oral argument was held Jan 9, 2026, and the stay remains. CARB paused SB 261 enforcement and opened a voluntary docket. — [K&L Gates](https://www.klgates.com/California-Climate-Disclosure-Regulations-Update-CARB-Provides-Additional-Clarifications-on-Implementation-and-Ninth-Circuit-Stay-of-SB-261-Enforcement-12-8-2025); [White & Case](https://www.whitecase.com/insight-alert/california-climate-disclosure-laws-ninth-circuit-temporarily-halts-sb-261-and-carb)
- CBAM:
  - The definitive period began Jan 1, 2026.
  - The old €150/shipment exemption was replaced by a 50-tonne annual threshold per importer, covering cement, fertilizers, iron and steel, and aluminum.
  - Importers may use Commission default values. Verification is needed only when actual values are used.
  - Non-EU producers are asked for granular emissions data.
  — [ICAP](https://icapcarbonaction.com/en/news/eu-adopts-simplifications-cbam-rules-ahead-compliance-phase-starting-2026); [Spectreco](https://www.spectreco.com/blog/eu-cbam-2026-simplification-de-minimis-definitive-period)

### Inferences
- SB 253 Scope 3 reporting (see Gaps) would push supplier emissions questionnaires down to SMB suppliers. Those suppliers have no legal duty, only commercial pressure, and many will answer with spend-based estimates.
- A "supplier carbon questionnaire responder" for small manufacturers is conceivable, but willingness to pay is unproven and competition from carbon-accounting SaaS (Normative, Sweep, Watershed and others) is heavy.
- CBAM default values reduce the need for real data from small US steel and aluminum exporters.

### Gaps
- I did not verify in this session the Scope 3 start date (the statute says 2027) or CARB's 2027 rules.
- No data on the volume of supplier requests reaching US SMBs.

---

## Q7. DSCSA enhanced drug distribution security for small dispensers (pharmacies)

### Takeaway
LIVE and imminent: FDA's exemption for small dispensers (25 or fewer full-time pharmacists or technicians) **ends November 27, 2026**, with no further extension expected. About 18,960 independent pharmacies must then exchange and verify package-level transaction data electronically (GS1 EPCIS) and trace product during recalls or investigations. Opportunity: **Medium**. The deadline is now, so the land-grab window is short, and wholesalers such as McKesson, Cardinal and AmerisourceBergen/Cencora (and regional ones) offer portals. A solo founder would need to differentiate on returns and exception handling, suspect-product investigations and saleable-returns verification.

### Cited Findings
- The small-dispenser exemption (≤25 full-time pharmacists or technicians) lasts until Nov 27, 2026 and applies automatically, with no application. It covers the requirement to use interoperable electronic package-level exchange of transaction information and statements via GS1 EPCIS and package-level tracing. — [FDA exemptions](https://www.fda.gov/drugs/drug-supply-chain-security-act-dscsa/exemptions-under-drug-supply-chain-security-act); [Quarles](https://www.quarles.com/newsroom/publications/fda-issues-broad-exemptions-from-dscsa-enhanced-drug-distribution-security-requirements); [NABP](https://nabp.pharmacy/news/blog/fdas-small-dispenser-dscsa-exemption/)
- The exemption was granted July 12, 2024, and "no further extensions are expected" (vendor guide). — [ColdChainCheck](https://coldchaincheck.com/guides/dscsa-small-dispenser-compliance-2026)
- In September 2026 FDA ran a survey, promoted by NCPA, on whether DSCSA software and hardware are accessible, "prohibitively expensive" or integrable, which signals cost concerns. — [NCPA](https://ncpa.org/newsroom/qam/2026/09/01/fda-survey-dscsa-electronic-tracking)
- NCPA counted 18,960 independent community pharmacy locations as of July 2025, about 36% of retail pharmacies. — [NCPA](https://ncpa.org/newsroom/news-releases/2025/10/19/ncpa-releases-2025-digest-report)
- An HDA readiness survey shows progress but gaps. 86% of respondents use EPCIS 1.2. — [Pharmaceutical Commerce](https://www.pharmaceuticalcommerce.com/view/hda-annual-dscsa-readiness-survey-shows-progress-but-gaps-remain)

### Inferences
- Primary wholesalers will provide EPCIS data to their pharmacy customers, often through free or cheap portals, which limits standalone SaaS pricing power.
- The underserved slice is pharmacies buying from **multiple secondary wholesalers or 503B/specialty suppliers**, plus workflows like DSCSA returns, suspect/illegitimate product handling, 6-year record retention and FDA Form 3911 notifications.
- There is also a hedge: FDA may grant waivers or further exemptions if the September 2026 survey shows unaffordability.

### Gaps
- No verified pricing for pharmacy-level DSCSA tools (TrackTraceRx, RxERP, Datakey and others).
- It is unknown whether FDA will extend again after its September 2026 survey.

---

## Q8. OSHA heat rule, EPA refrigerants (AIM Act), EPA TSCA PFAS reporting, and state PFAS/EPR product reporting

### Takeaway
- **OSHA heat:** UNCERTAIN and stalled. A supplemental NPRM is planned for Dec 2026, while state heat rules (CA, MD, NV, among others) are live.
- **AIM Act refrigerant leak repair:** LIVE since **Jan 1, 2026** for HFC appliances with 15 lb or more of charge (down from 50 lb). This newly pulls many restaurants, convenience stores, small grocers and light-commercial HVAC into mandatory leak-rate calculation and 3-year recordkeeping. Opportunity: **Medium-High**. Cheap tools exist ($29/month), but distribution through HVAC contractors is open.
- **TSCA PFAS 8(a)(7):** DELAYED. The submission window opens the earlier of 60 days after a revised rule or Jan 31, 2027, and scope is being narrowed.
- **State product reporting:** LIVE. Minnesota PFAS reports are due Sept 15, 2026, and packaging EPR reports are due annually in 6+ states. Opportunity for small consumer-product brands: **Medium-High**.

### Cited Findings
- OSHA heat:
  - NPRM published Aug 30, 2024. The post-hearing comment period closed Oct 30, 2025, and the rule has not been finalized.
  - DOL's 2026 plan calls for a supplemental NPRM in Dec 2026 to scale back burdens.
  - A revised Heat National Emphasis Program runs Apr 10, 2026 to 2031.
  — [SafetyRegulatory](https://safetyregulatory.com/updates/osha-heat-illness-rulemaking-2026/); [Ogletree](https://ogletree.com/insights-resources/blog-posts/oshas-heat-program-to-expire-while-heat-standard-stalls/); [OSHA](https://www.osha.gov/heat-exposure/rulemaking)
- State heat rules: Maryland (COMAR 09.12.32, effective Sept 30, 2024) requires a written plan and triggers at a heat index of 80°F. Nevada (enforcement from Apr 29, 2025) requires employers with more than 10 employees to keep a written plan and job hazard analysis. — [Heatstress.com](https://heatstress.com/blog/heat-stress-policy-update-where-states-stand-in-2026); [Workplace Compliance Insights](https://workplacecomplianceinsights.com/guides/heat-illness-prevention-by-state/)
- AIM Act (40 CFR Part 84 Emissions Reduction and Reclamation rule, finalized 2024):
  - From Jan 1, 2026, appliances with 15 lb or more of HFC (GWP >53) require leak-rate calculation each time refrigerant is added.
  - Leaks must be repaired within 30 days, with initial and follow-up verification tests.
  - Records must be kept 3 years, covering leak rates, repairs, verification, retrofit/retirement plans and automatic leak detection (ALD) calibration.
  — [Oxmaint](https://oxmaint.com/industries/hvac/epa-aim-act-compliance-hvac-refrigerant-management-leak-repair); [Beveridge & Diamond](https://www.bdlaw.com/publications/epa-finalizes-hfc-emissions-reduction-and-reclamation-program/); [Axiom Cloud](https://axiomcloud.ai/blog/2025/10/20/mandatory-retirements)
- BSI characterized the change as expanding federal refrigerant oversight by about 70%. — [BSI](https://www.bsigroup.com/en-US/insights-and-media/insights/blogs/federal-regulators-just-expanded-refrigerant-oversight-by-70/)
- EPA's deregulatory actions:
  - It is reconsidering the Technology Transitions rule. The Oct 3, 2025 proposal would raise GWP limits for some refrigeration systems.
  - A May 26, 2026 rule excluded road and intermodal transport refrigeration units from leak repair.
  - The core 15-lb leak repair requirement appears intact.
  — [Hunton](https://www.hunton.com/the-nickel-report/status-update-on-the-aim-act-and-epas-hfc-refrigerant-regulations); [Federal Register](https://www.federalregister.gov/documents/2026/05/26/2026-10388/phasedown-of-hydrofluorocarbons-excluding-road-and-intermodal-container-transport-refrigeration)
- Refrigerant tracking software: RefriComply-type tools for HVAC contractors start at $29/month. Axiom Cloud serves grocery chains, and Refritrak is another option. — [RefriComply blog](https://www.refricomply.com/blog/best-refrigerant-tracking-software-2026/); [Axiom Cloud](https://www.axiomcloud.ai/post/new-reporting-features-help-grocery-stores-navigate-complex-epa-refrigerant-requirements)
- TSCA 8(a)(7):
  - EPA proposed scope changes Nov 13, 2025.
  - An April 13, 2026 Federal Register notice moved the submission start to the earlier of 60 days after the revised rule takes effect or Jan 31, 2027.
  — [Federal Register](https://www.federalregister.gov/documents/2026/04/13/2026-07062/modification-to-the-start-of-the-submission-period-for-perfluoroalkyl-and-polyfluoroalkyl-substances); [Stoel Rives](https://www.stoelrivesenvironmentallawblog.com/laws-and-regulations/regulations/epa-again-delays-start-of-tsca-pfas-reporting-now-until-january-2027-at-the-latest/)
- Minnesota PFAS in products (Amara's Law):
  - Reports are due Sept 15, 2026 (moved from July 1, 2026), with one 90-day extension available to Dec 14, 2026.
  - There is a one-time $800 fee per report.
  - It covers all products with intentionally added PFAS sold in Minnesota.
  — [Beveridge & Diamond](https://www.bdlaw.com/publications/minnesota-extends-pfas-in-products-reporting-deadline-to-september-15-2026/); [MPCA](https://www.pca.state.mn.us/air-water-land-climate/reporting-pfas-in-products)
- Packaging EPR:
  - Six states require producer reports by May 31, 2026. Oregon and Colorado Annual Supply Reports use 2025 data.
  - California SB 54 regulations took effect May 1, 2026, with producer registration by June 1, 2026 and a baseline report by July 1, 2026.
  - California is expected to exempt brands under $1M in gross sales.
  — [Printing United Alliance](https://www.printing.org/content/2026/05/07/six-states-face-packaging-epr-reporting-deadline-on-may-31); [Repurpose Global](https://www.repurpose.global/blog/2026-epr-deadlines-complete-guide); [O'Melveny](https://www.omm.com/insights/alerts-publications/2026-plastics-epr-packaging-rules-update-what-sb-54-sb-343-state-reporting-deadlines-prc-laws-the-eu-ppwr-mean-for-producers-retailers/)

### Inferences
- **AIM Act:** the recurring workflow is event-driven. Every refrigerant addition means a log entry, a leak-rate calculation, a 30-day repair clock and verification tests. Restaurant and convenience-store owners rely on their HVAC-R contractor.
  - One option is a contractor-facing app that automatically produces owner compliance records, with a white-label "compliance portal" for the owner, sold at $50-$150 per tech per month.
  - Competition is nascent and fragmented (RefriComply, Refritrak, CMMS add-ons).
- **Packaging EPR and PFAS:** the work is annual, multi-state data collection by SKU and material (packaging weights, material types, PFAS presence).
  - Enterprise vendors serve large CPGs. Shopify-scale brands with $1M-$20M revenue that sell into CO, OR, CA, MN, ME and MD are underserved.
  - This is a strong solo-founder shape: integrate with Shopify or Amazon SKU catalogs and produce state-specific reports plus PRO submissions for about $100-$500/month. Growth rides on additional states' deadlines.

### Gaps
- No count of US HFC appliances in the 15-50 lb band.
- No verified count of small producers obligated under state EPR laws (thresholds differ by state).

---

## Q9. Payroll/tax changes: OBBBA "no tax on tips/overtime" W-2 reporting, 1099-K and 1099-NEC thresholds, Corporate Transparency Act

### Takeaway
- **W-2 reporting:** LIVE for tax year 2026. Employers must report qualified overtime premium (**Box 12 code TT**), qualified tips (**code TP**) and a Treasury tipped-occupation code (**Box 14b**) on W-2s furnished in January 2027. Overtime and tip tracking must happen all year.
- **1099 thresholds:** burden reduced. OBBBA restored the 1099-K threshold to $20,000 and 200 transactions and raised 1099-NEC/MISC to $2,000 from 2026.
- **CTA:** DEAD for domestic companies. A final rule (Aug 14, 2026) permanently removed BOI reporting for US companies.

Opportunity: **Low-Medium**. Payroll incumbents (Gusto, ADP, Paychex, Toast Payroll) absorb W-2 changes. The niche is restaurants and bars running tip pools or manual payroll, and employers with messy FLSA regular-rate calculations.

### Cited Findings
- For tax year 2026, employers report cash tips in Box 12 code TP, qualified overtime in code TT and tipped occupation codes in Box 14b. Only the FLSA-required overtime premium counts (the "half" in time-and-a-half). 2025 carried penalty relief, but 2026 is mandatory. — [IRS 2026 W-2 instructions](https://www.irs.gov/pub/irs-pdf/iw2w3.pdf); [Warren Averett](https://warrenaverett.com/insights/one-big-beautiful-bill-act-overtime-tip-payroll-reporting-requirements/); [MP](https://mp-hr.com/resources/hr-blog/no-tax-on-tips-2026-w2-reporting-requirements/)
- Qualified tips exclude mandatory service charges and automatic gratuities. — [MP](https://mp-hr.com/resources/hr-blog/no-tax-on-tips-2026-w2-reporting-requirements/)
- OBBBA (signed July 4, 2025) permanently restored the 1099-K threshold to more than $20,000 and more than 200 transactions, per platform. The 1099-NEC/MISC threshold rises from $600 to $2,000 beginning in 2026. — [1099Pro](https://1099pro.com/content-library/1099-k-2026-obbbba-enterprise-compliance-guide/); [1800Accountant](https://1800accountant.com/blog/irs-1099-reporting-changes-2026)
- CTA: FinCEN's March 21, 2025 interim final rule exempted all domestic entities. A final rule issued Aug 11, 2026 and published Aug 14, 2026 made the exemption permanent. Only foreign-formed entities registered in the US must report. — [FinCEN](https://www.fincen.gov/boi); [Federal Register](https://www.federalregister.gov/documents/2026/08/14/2026-16576/beneficial-ownership-information-reporting-requirement-revision); [Mayer Brown](https://www.mayerbrown.com/en/insights/publications/2026/08/the-final-chapter-fincen-permanently-eliminates-boi-reporting-requirements-for-us-companies-and-us-persons)

### Inferences
- Tips: restaurants must separate voluntary tips from service charges at the POS or tip-pool level and map each employee to a Treasury occupation code. A tip-pool distribution and qualified-tip classification tool that plugs into POS and payroll is a narrow but real niche. Toast and Square will likely build it natively.
- CTA-based BOI filing businesses are dead, except for foreign-formed entities.

### Gaps
- I did not confirm the current IRS e-file threshold (10 returns aggregate since 2024) or any 2026 changes.
- No data on how many small employers still run payroll manually.

---

## Q10. CMS rules: prior authorization/interoperability (CMS-0057-F), nursing home staffing, home health EVV

### Takeaway
- **CMS-0057-F:** LIVE but payer-facing. Faster decision timeframes (72 hours expedited, 7 days standard) and specific denial reasons apply from Jan 1, 2026. FHIR Prior Authorization, Provider Access and Payer-to-Payer APIs are due **Jan 1, 2027**.
- **WISeR:** a CMS prior-authorization pilot in traditional Medicare, launched Jan 2026 and running through 2031.
- **Nursing home minimum staffing:** DEAD. It was repealed on Dec 2, 2025, effective Feb 2, 2026.
- **EVV:** LIVE, and states are moving to hard edits (claim rejections) in 2026.

Opportunity: **Low** for a solo founder. Payers and large EHR/RCM vendors dominate, and EVV has state aggregators plus many agency software vendors.

### Cited Findings
- CMS-0057-F applies to Medicare Advantage, Medicaid (fee-for-service and managed care), CHIP and federal-exchange QHPs. Payers must stand up four FHIR APIs, including Prior Authorization, by Jan 1, 2027. Faster decision timeframes and denial reasons have applied since Jan 1, 2026. — [CMS fact sheet](https://www.cms.gov/newsroom/fact-sheets/cms-interoperability-prior-authorization-final-rule-cms-0057-f); [Connext](https://connextglobal.com/ms-prior-authorization-mandate-2027/)
- The WISeR model launched Jan 1, 2026, with requests starting Jan 5, 2026, and runs as a 6-year pilot through Dec 31, 2031. — [Medicotech](https://medicotechllc.com/prior-authorization-medical-billing-2026-cms-rules/)
- CMS repealed the nursing home minimum staffing standards (3.48 total nurse staffing hours per resident day, 24/7 RN) on Dec 2, 2025, effective Feb 2, 2026. — [AHA News](https://www.aha.org/news/headline/2025-12-02-cms-repeals-minimum-staffing-requirements-skilled-nursing-long-term-care-facilities); [Federal Register](https://www.federalregister.gov/documents/2025/12/03/2025-21792/medicare-and-medicaid-programs-repeal-of-minimum-staffing-standards-for-long-term-care-facilities)
- EVV must capture six data elements (service type, individual, caregiver, date, start and end time, location). In 2026 states are shifting from soft to hard edits. Example: Minnesota requires 50% verified visits from Jan 1, 2026 and 80% by July 1, 2026. — [myEZcare](https://www.myezcare.com/evv-requirements-for-home-health-agencies-in-2026/); [CareSmartz360](https://www.caresmartz360.com/blog/evv/minnesota-evv-requirements-for-home-care-agencies/); [Medicaid.gov](https://www.medicaid.gov/medicaid/home-community-based-services/home-community-based-services-guidance-additional-resources/electronic-visit-verification)

### Inferences
- Provider-side prior-authorization pain (WISeR in pilot states, MA plans) is real. A "prior-auth packet builder" for small specialty practices could work, but it is an RCM or AI-agent play rather than a clean regulatory forcing function.
- EVV hard edits create a denial-management niche (reconciling EVV exceptions before claims). The market is crowded.

### Gaps
- No data on the WISeR states or provider counts affected (not retrieved).

---

## Q11. Other high-impact 2025-2028 rules (FMCSA, junk fees, click-to-cancel, TCPA, pay transparency, HUD NSPIRE, Lead and Copper, CFPB 1071)

### Takeaway
Status by rule:
- **LIVE or firm:**
  - HUD **NSPIRE for vouchers** (PHAs and landlords): Feb 1, 2027.
  - EPA **Lead and Copper Rule Improvements**: Nov 1, 2027. Litigation is pending, with oral argument in fall 2026.
  - CFPB **Section 1071**: revised, with a single compliance date of Jan 1, 2028.
  - FMCSA **non-domiciled CDL final rule**: effective Mar 16, 2026. English-proficiency out-of-service codification is under rulemaking (Aug 2026).
  - State **junk-fee** laws: Colorado HB25-1090 has applied to restaurants and rental housing since Jan 1, 2026.
  - **Pay transparency**: 14 states plus DC, with Delaware next on Sept 26, 2027.
  - **TCPA revocation**: live since Apr 11, 2025. The "revoke-all" part is delayed to Jan 31, 2027, and the FCC revised it on Sept 9, 2026.
- **DEAD:**
  - FTC click-to-cancel: vacated July 2025, with only an ANPRM in March 2026.
  - TCPA one-to-one consent: vacated Jan 2025 and removed.

Best of this group for a solo founder: **Lead and Copper (small water systems)**, **Medium-High**, and junk-fee or landlord fee-disclosure compliance, **Medium**. The rest are **Low**.

### Cited Findings
- **HUD NSPIRE:**
  - The HCV/PBV/Mod Rehab compliance date moved to Feb 1, 2027. Scoring of new affirmative requirements starts Oct 1, 2026.
  - Carbon monoxide and smoke alarm requirements are already in effect.
  — [NLIHC](https://nlihc.org/resource/hud-pih-announces-voucher-nspire-implementation-delay-february-1-2027); [HUD PIH-2026-18](https://www.hud.gov/sites/default/files/PIH/documents/PIH-2026-18.pdf); [Navigate Housing](https://www.navigatehousing.com/nspire-compliance-date-hud-delays-scoring-to-oct-2026/)
- **Lead and Copper Rule Improvements (LCRI):**
  - Published Oct 30, 2024. Community and non-transient non-community water systems must meet core requirements by Nov 1, 2027.
  - Core requirements include 10-year lead service line replacement, a 0.010 mg/L action level, and annual notices each November (2025-2027) to customers with lead, galvanized-requiring-replacement or unknown service lines.
  — [CDM Smith FAQ](https://www.cdmsmith.com/en/resources/insights/lead-and-copper-rule-improvements-faq); [EPA](https://www.epa.gov/ground-water-and-drinking-water/lead-and-copper-rule-improvements)
- In the LCRI litigation (AWWA v. EPA), briefing is complete and oral argument is expected in fall 2026. In April 2026 EPA sought input on implementation "Tips" documents, which suggests it is implementing the rule rather than rescinding it. — [NRDC](https://www.nrdc.org/court-battles/american-water-works-association-et-v-epa-lead-and-copper-rule-improvements); [EPA](https://www.epa.gov/newsreleases/epa-releases-new-guidance-reduce-lead-exposure-drinking-water-protect-american)
- **CFPB 1071:**
  - Revised final rule published May 1, 2026, with a uniform compliance date of Jan 1, 2028.
  - It applies to lenders with 1,000 or more small-business originations in each of 2026 and 2027.
  - First filing is due June 1, 2029, with a 2028 grace period for data errors.
  — [Federal Register](https://www.federalregister.gov/documents/2026/05/01/2026-08494/small-business-lending-under-the-equal-credit-opportunity-act-regulation-b); [Mayer Brown](https://www.mayerbrown.com/en/insights/publications/2026/05/cfpb-issues-final-section-1071-rule-on-small-business-lending-data-collection)
- **FMCSA:**
  - The non-domiciled CDL final rule was published Feb 13, 2026 and took effect Mar 16, 2026. Only H-2A, H-2B and E-2 status qualifies.
  - FMCSA estimates 97% of about 200,000 non-domiciled CDL holders cannot qualify.
  - The English-language-proficiency out-of-service NPRM was published Aug 10, 2026.
  - Carriers must verify ELP in driver qualification files.
  — [Jackson Lewis](https://www.jacksonlewis.com/insights/fmcsa-new-rule-cracks-down-non-citizen-commercial-drivers-licenses-creating-carrier-burdens); [Federal Register ELP](https://www.federalregister.gov/documents/2026/08/10/2026-16288/english-language-proficiency-out-of-service-criteria); [FMCSA FAQ](https://www.fmcsa.dot.gov/regulations/non-domiciled-cdl-2026-final-rule-faqs)
- **Junk fees:**
  - Colorado HB25-1090 applies from Jan 1, 2026. Advertised prices must include all mandatory fees as a single number, and the law adds fee transparency for rental housing and restaurants.
  - California SB 478 has been in effect since July 2024. Restaurants are exempt if the fee is clearly disclosed.
  - Minnesota and Virginia have similar laws. Georgia, Illinois, Massachusetts and New York had bills pending in 2026.
  - The FTC has prioritized hidden fees in rental housing.
  — [Clark Hill](https://www.clarkhill.com/news-events/news/what-is-colorados-junk-fee-ban-compliance-checklist-for-hotels-restaurants-hospitality-businesses-hb-25-1090/); [NCSL](https://www.ncsl.org/financial-services/consumer-goods-and-services-pricing-and-junk-fees-2026-legislation); [Arnold & Porter](https://www.arnoldporter.com/en/perspectives/advisories/2026/02/ftc-prioritizes-hidden-fees-in-housing-rental-markets-amidst-broader-state-scrutiny-of-junk-fees); [Entrata](https://www.entrata.com/blog/2025-fee-transparency-laws-in-the-rental-market-what-to-watch-in-2026)
- **FTC click-to-cancel:**
  - Vacated by the Eighth Circuit on July 8, 2025 for failing to do a preliminary regulatory analysis.
  - The FTC reopened rulemaking with a March 2026 ANPRM, which is not binding. ROSCA enforcement continues.
  - California, New York and Massachusetts have strengthened auto-renewal laws.
  — [WilmerHale](https://www.wilmerhale.com/en/insights/client-alerts/20250801-eighth-circuit-vacates-the-ftcs-click-to-cancel-rule-but-federal-and-state-regulators-likely-to-remain-active); [Gibson Dunn](https://www.gibsondunn.com/ftc-restarts-negative-option-rulemaking-after-eighth-circuit-vacatur-enforcement-under-rosca-continues/); [Arnold & Porter](https://www.arnoldporter.com/en/perspectives/advisories/2026/02/ftc-and-state-ags-continue-to-scrutinize-subscription-practices)
- **TCPA:**
  - The one-to-one consent rule was vacated by the Eleventh Circuit on Jan 24, 2025, and the text was removed effective Aug 29, 2025.
  - Revocation rules have applied since Apr 11, 2025: revocation by any reasonable method, honored within 10 business days.
  - "Revoke-all" is delayed to Jan 31, 2027, and the FCC issued a revising Report and Order on Sept 9, 2026.
  — [Kelley Drye](https://www.kelleydrye.com/viewpoints/blogs/ad-law-access/eleventh-circuit-vacates-tcpa-11-consent-rule); [ComplianceHub](https://compliancehub.wiki/tcpa-2026-consent-revocation-one-to-one-rule-vacated-compliance/); [Mac Murray & Shuster](https://mslawgroup.com/delayed-again-fcc-pushes-back-tcpas-revoke-all-rule-to-january-31-2027/); [Cullen and Dykman](https://www.cullenllp.com/blog/fcc-substantially-revises-tcpa-consent-revocation-rules-set-to-take-effect-january-2027/)
- **Pay transparency:**
  - New Jersey took effect June 1, 2025 (10+ employees), Vermont July 1, 2025, and Massachusetts Oct 29, 2025 (25+ employees).
  - Delaware takes effect Sept 26, 2027 (26+ employees).
  - Fourteen states plus DC require pay ranges in job postings.
  — [Loio tracker](https://loio.com/guides/pay-transparency-laws-by-state/); [Employment Law Insights](https://www.employmentlawinsights.com/2026/07/show-and-tell-new-state-salary-disclosure-laws-go-into-effect/)

### Inferences
- **LCRI and small water systems:** thousands of small community systems (many under 3,300 people served) must maintain service-line inventories, send annual notices, run tap sampling and plan replacements, with Nov 2027 as the core date.
  - These same entities are special districts that also face ADA Title II in April 2028. A combined "small utility compliance" product (service-line inventory map, annual notice generator, accessible CCR/PDF publishing) is an appealing bundle.
  - Risk: the litigation outcome in 2026-2027 could vacate or remand parts of the rule.
- **Junk fees and landlords:** independent landlords and small property managers in CO, CA, MN and elsewhere need all-in rent advertising and fee schedules. Listing platforms and PMS vendors will likely absorb this, so standalone value is modest.
- **NSPIRE:** most landlords rely on the PHA's inspector. A self-inspection prep checklist app for voucher landlords is low-price and low-willingness-to-pay.
- **CFPB 1071:** targets community banks and CDFIs with 1,000 or more originations. Existing compliance vendors (Wolters Kluwer and others) dominate, so it is a poor fit for a solo founder.
- **FMCSA:** small carriers' driver-qualification-file upkeep is already served by J.J. Keller, Foley and others.

### Gaps
- No verified count of community water systems or small systems (EPA SDWIS figures not retrieved).
- No count of landlords affected by the junk-fee laws.
- The content of the FCC's Sept 9, 2026 Report and Order was not reviewed in detail.

---

## Q12. Synthesis: ranking forcing functions for a solo founder ($30k/month profit in 12-24 months)

### Takeaway
The strongest opportunities combine a hard date, a large count of small, under-resourced entities, a **recurring** workflow and incumbents priced for enterprises:
1. ADA Title II and Section 504 document accessibility for small governments, special districts and small HHS recipients (2027-2028).
2. Multi-state packaging EPR and PFAS product reporting for small consumer-product brands (annual, expanding).
3. AIM Act refrigerant leak-rate records, sold through HVAC-R contractors (live 2026).
4. FSMA 204 receiving-side traceability for independent grocers, restaurants and distributors (2028, with demand ramping in 2027).
5. LCRI plus accessibility bundles for small water systems (2027-2028).

Rules to avoid building on: those that are dead or rescinded (CTA domestic BOI, FTC click-to-cancel, TCPA one-to-one, nursing home staffing), not final (HIPAA Security overhaul, OSHA heat), or enjoined (SB 261).

### Cited Findings
- Summary status table. Every row is sourced in the relevant section above.

| Forcing function | Status (late Sept 2026) | Key date(s) | Affected SMB population | Rough rating |
|---|---|---|---|---|
| ADA Title II web/mobile (WCAG 2.1 AA) | DELAYED (IFR 4/20/26) | 4/26/2027 (≥50k pop.); 4/26/2028 (<50k and special districts) | 90,837 local governments ([Census via St. Louis Fed](https://www.stlouisfed.org/publications/regional-economist/2024/march/local-governments-us-number-type)) | High |
| HHS §504 web/mobile | DELAYED (IFR 5/2026) | 5/11/2027 (15+ employees); 5/10/2028 (<15) | HHS-funded providers ([HHS](https://www.hhs.gov/press-room/hhs-extends-mobile-and-web-accessibility-deadline.html)) | High (bundled with above) |
| FSMA 204 traceability | DELAYED by Congress | 7/20/2028 | Food chain handling FTL foods; retail/restaurants over $250k food sales | Medium-High |
| DSCSA small dispensers | LIVE, exemption ending | 11/27/2026 | 18,960 independent pharmacies | Medium |
| AIM Act HFC leak repair | LIVE | since 1/1/2026 (15 lb+) | Restaurants, grocers, convenience stores, HVAC-R contractors | Medium-High |
| Packaging EPR (CO, OR, CA +3) | LIVE | annual by 5/31; CA registration 6/1/2026 | Brand owners (CA exempts <$1M) | Medium-High |
| MN PFAS in products | LIVE | 9/15/2026 (ext. to 12/14/2026) | Manufacturers selling into MN | Medium (one-time plus updates) |
| TSCA PFAS 8(a)(7) | DELAYED/revising | window opens by 1/31/2027 | Manufacturers/importers since 2011 | Low-Medium |
| NYC LL97 / BPS | LIVE | annual 5/1 (NYC); WA Tier 2 by 7/1/2027 | ~50,000 NYC buildings; WA 20k-50k sq ft buildings | Medium |
| SB 253 / SB 261 | 253 LIVE (>$1B revenue); 261 ENJOINED | 8/10/2026 first report | Indirect supplier pressure | Low-Medium |
| CBAM | LIVE (EU importers) | 2026 definitive period; 50 t threshold | Indirect for US exporters | Low |
| HIPAA Security overhaul | UNCERTAIN (NPRM) | final targeted 7/2027 | All covered entities | Low-Medium (watch) |
| CO AI law (SB 26-189) | REVISED/DELAYED | 1/1/2027 | Deployers of ADMT in CO | Low-Medium |
| CA ADMT regulations | LIVE (phased) | 1/1/2027 ADMT; risk assessment submissions 4/1/2028 | CCPA-covered businesses | Low-Medium |
| IL HB 3773 / NYC LL144 | LIVE | since 1/1/2026 (IL) | Employers using AI in HR | Low-Medium |
| New state privacy laws | LIVE/phasing | 1/1/2026 (IN, KY, RI); 2027 (LA, OK, AL); 2028 (VT) | Businesses above thresholds | Low |
| W-2 codes TT/TP (OBBBA) | LIVE | TY2026 W-2s due Jan 2027 | All employers with OT or tips | Low-Medium |
| 1099-K / 1099-NEC | Burden REDUCED | $20k/200 txns; $2,000 NEC | n/a | None |
| CTA BOI (domestic) | DEAD (final rule 8/14/2026) | n/a | n/a | None |
| CMS-0057-F prior authorization | LIVE (payers) | 1/1/2027 APIs | Payers | Low |
| Nursing home staffing | DEAD (repealed) | n/a | n/a | None |
| EVV hard edits | LIVE | 2026 (state by state) | Home care agencies | Low |
| OSHA heat | UNCERTAIN (SNPRM planned 12/2026) | none | n/a (state rules live) | Low |
| HUD NSPIRE vouchers | DELAYED | 2/1/2027 | PHAs and voucher landlords | Low |
| EPA LCRI | LIVE, in litigation | 11/1/2027 | Community and NTNC water systems | Medium-High (with ADA bundle) |
| CFPB 1071 | REVISED | 1/1/2028 | Lenders with 1,000+ originations | Low |
| FMCSA non-domiciled CDL / ELP | LIVE / NPRM | 3/16/2026; ELP NPRM 8/2026 | Carriers | Low |
| State junk-fee laws | LIVE (CO 1/1/2026) | varies | Restaurants, landlords, hotels | Low-Medium |
| FTC click-to-cancel | DEAD (vacated), ANPRM 3/2026 | n/a | n/a | Low |
| TCPA one-to-one | DEAD | n/a | n/a | None |
| TCPA revoke-all | DELAYED/REVISED | 1/31/2027 | Businesses that text or call customers | Low |
| Pay transparency | LIVE/expanding | DE 9/26/2027 | Employers in 14 states + DC | Low |

### Inferences
- **#1 candidate: small-government and special-district accessible-document pipeline** (ADA Title II, April 2028 cohort).
  - Buyers: town clerks, water, fire and library districts, small school districts, and later small HHS-funded clinics.
  - Product: upload or email a PDF, get back a WCAG 2.1 AA PDF or HTML, a public accessible document library and an audit log, priced at $99-$399/month.
  - Sales motion: state municipal leagues, special-district associations and clerk associations. Lawsuit and demand-letter risk keeps urgency even if DOJ softens the rule.
  - Most likely to reach about 150-300 paying customers within 12-24 months.
- **#2: multi-state EPR and PFAS reporting for $1M-$50M consumer-product brands.** Annual recurring reports and more states each year. Integrates with Shopify, Amazon and ERP SKU data. Incumbents are enterprise-priced.
- **#3: contractor-distributed AIM Act refrigerant compliance.** Small HVAC-R shops resell it to their restaurant and convenience-store clients.
- **#4: FSMA 204 receiving-side capture for independent grocers and restaurants.** Start with distributors and packers in 2026-2027, then expand downstream before July 2028. Main risk is another delay or narrowing.
- **Bundle idea: small water systems.** The LCRI (Nov 2027) plus ADA accessible CCRs and notices (Apr 2028) give one buyer two forcing functions.
- Rules to deprioritize are those that are dead, not final or enjoined (CTA, click-to-cancel, TCPA one-to-one, nursing home staffing, HIPAA overhaul, OSHA heat, SB 261), plus areas where large incumbents already own the workflow (CMS prior-auth APIs, EVV, CFPB 1071, payroll W-2 codes).

### Gaps
- Pricing for small-segment competitors in several niches (DSCSA pharmacy tools, LL97 filing services, EPR SaaS for small brands) was not verified with primary price pages.
- Count estimates for FSMA 204-covered retailers, AIM Act appliances in the 15-50 lb band, small water systems and WA Tier 2 buildings were not found and should be obtained before sizing a market.
- Status can change fast. The DOJ and HHS interim final rules, LCRI litigation, the FCC's Sept 2026 TCPA order and FDA's DSCSA survey outcome should be re-checked before committing.
