# The $1,000/day plan

**Goal:** $1,000/day in profit ≈ **$30,400/month**, before income tax.

**Vehicle:** LeadBack, a small AI subscription product for local home-service businesses
(plumbers, HVAC, electricians, roofers, garage doors, pest control).

**Honest timeline:** first paying customer in weeks 2–6, $1,000/**month** within about 3 months,
$1,000/**day** in roughly 12–24 months of consistent selling. No shortcut. It's just math plus work.

---

## 1. The problem we sell against

A plumber is under a sink. An HVAC tech is in an attic. The phone rings, nobody answers, and the caller
goes to voicemail. Most people don't leave one. They call the next company on Google.

For the business, one missed job is worth anywhere from $150 (a drain) to $10,000+ (a new AC system or roof).
Most small operators know they're losing calls. They just don't know what it costs them.

**LeadBack fixes this in seconds:**

1. A call goes unanswered.
2. The caller gets a text right away: *"Hi, this is Ace Plumbing. Sorry we missed your call! What can we help you with?"*
3. An AI assistant texts with them and collects their name, the job, the address and how urgent it is.
4. The owner gets a clean lead summary on their phone, plus an instant alert for emergencies (gas, flooding).

**The pitch in one line:** *"If this saves you one job a month, it's paid for itself 5–50 times over."*

---

## 2. Pricing and unit economics

| | |
|---|---|
| Price | **$197/month**, plus a $297 setup fee (waive it for your first 10 customers) |
| Trial | 14 days free, cancel any time |

**Cost per customer per month.** These are estimates, so check current Twilio and Anthropic pricing before you set prices:

| Item | Estimate |
|---|---|
| Twilio phone number | ~$1–2 |
| SMS (≈60 leads × ≈10 messages, incl. carrier fees) | ~$6–10 |
| Voice minutes (forward mode only; missed-only mode is far cheaper) | ~$0–15 |
| Claude (≈60 conversations, low effort) | ~$5–10 (measure real usage in month 1) |
| A2P 10DLC SMS registration fees (US) | a few $/month plus one-time fees |
| **Total** | **~$20–40** → **~80–90% gross margin** |

**Contribution per customer: ~$165/month.**

### The math to $1,000/day

- $30,400 profit + ~$1,500/mo overhead (hosting, software, bookkeeping, insurance) ≈ $32,000 needed
- $32,000 ÷ $165 ≈ **~195 customers. Call it 200.**

### How fast you have to sell

Small-business software loses customers every month (churn). Assume 4%/month:

| New customers / month | Customers after 12 months | After 18 months | Steady state |
|---|---|---|---|
| 8 | ~77 | ~104 | 200 |
| 15 | ~145 | ~195 | 375 |
| 25 | ~242 | ~325 | 625 |

**Target: ~15 new customers a month.** At a realistic 5–10% close rate on real conversations with owners,
that's about **10 owner conversations per working day.** A solo founder can do that.

### Levers that shorten the timeline

- **Setup fees** fund your early months.
- **Agency partners:** local marketing agencies already serve hundreds of contractors. Sell to them wholesale
  at ~$97/account and let them resell it. One agency can bring 10–50 accounts.
- **Annual prepay:** 2 months free for paying a year up front. Cash now, less churn.
- **Upsells later:** review requests after a job, after-hours AI call answering, booking into their calendar.

---

## 3. Go-to-market, step by step

### Phase 0: Set up (week 1–2)

- [ ] Form an LLC, open a business bank account, set up Stripe for billing
- [ ] Create a Twilio account and complete **A2P 10DLC registration** (required for business texting in the US; approval can take days to weeks, so **start this first**)
- [ ] Get an Anthropic API key
- [ ] Deploy LeadBack (see README) and run it on **your own** number for a week. Call it, miss it, text it, break it.
- [ ] Get a short review of your opt-out wording and terms from a lawyer (a few hundred dollars well spent)

### Phase 1: First 10 customers (weeks 2–6)

**Pick ONE trade in ONE metro.** Example: HVAC companies in your city. A narrow niche makes your pitch,
your case studies and your referrals compound.

1. **Build a list:** 200 owner-operated businesses from Google Maps (under ~100 reviews, the owner's name on the site).
2. **Do the missed-call test:** call each one mid-morning on a weekday and write down who doesn't pick up.
   Those are your hottest prospects, because you've just experienced their problem first-hand.
3. **Follow up with proof:** call back, text, or walk in:

   > "Hey, I called you Tuesday at 10:14 and got voicemail. If I'd had a leak, I would've called the next
   > company. I run a service that texts missed callers back within seconds and gets their details, so
   > you never lose that job. I can set it up for you in 15 minutes and you can try it free for two weeks.
   > Want me to show you on your phone right now?"

4. **Demo live:** call your own LeadBack number from their phone, let it ring out, and watch the text arrive.
   That demo closes deals.
5. **Onboard by hand:** do the setup for them. It's 15 minutes of work for $197/month.

### Phase 2: 10 → 50 customers (months 2–6)

- **Referrals:** one free month for every customer they refer. Contractors know other contractors.
- **Monthly proof:** send every customer a text/email on the 1st: *"LeadBack caught 23 missed calls last month;
  9 became qualified leads."* This is your retention engine.
- **Where owners gather:** supply houses (early mornings), trade Facebook groups, BNI, chamber of commerce.
- **Case study:** one customer's real numbers ("recovered $8,400 in jobs in month one") becomes your ad.

### Phase 3: 50 → 200 customers (months 6–18)

- Hire a commission-based appointment setter or salesperson (pay per closed account).
- Launch the agency partner program.
- Expand to a second trade or a second metro using the same playbook.
- Build self-serve signup and Stripe billing into the app (see README next steps).

---

## 4. Daily routine (the real secret)

| Time | Activity |
|---|---|
| Morning | 1 hour: missed-call tests on 20–30 new businesses |
| Late morning | 2 hours: follow-up calls, texts and walk-ins with non-answerers |
| Afternoon | Demos and onboarding |
| End of day | Check every customer's dashboard; fix anything weird; log your numbers |

**Track weekly:** owner conversations, demos, trials started, trials converted, churned customers, and monthly recurring revenue (MRR).

---

## 5. Risks, and how to handle them

| Risk | Reality | Response |
|---|---|---|
| Competition | Plenty of "missed-call text-back" tools and CRM bundles already exist | Win on niche focus, real AI qualification, done-for-you setup and local service. Don't compete on price. |
| SMS compliance | A2P 10DLC registration is mandatory; TCPA rules apply | Only text people who called the business, always honor STOP (built in), no marketing blasts, lawyer review |
| Voicemail picks up first (forward mode) | Twilio can't tell voicemail from a human answer | Ring timeout is set below typical voicemail pickup; or use carrier "forward when unanswered" (missed-only mode) |
| Churn | Owners cancel when they forget it's working | The monthly proof report; the lead dashboard |
| AI says something wrong | Rare, but it happens | It never quotes prices or books; it hands off to the owner after 12 texts; the owner sees everything |
| It takes longer than planned | Very likely | Setup fees and annual prepay extend your runway; keep a day job until ~30 customers |

---

## 6. What exists now vs. what's on you

**Built (this repo):** the working product: missed-call detection, instant text-back, AI qualification,
owner alerts, emergency escalation, opt-out handling, AI failure fallback, multi-customer support,
an owner dashboard and an admin API.

**On you:** business accounts, A2P registration, deployment, and above all **talking to 10 owners a day.**
The software is roughly 10% of this business. Selling is the other 90%.
