# EasyUCR Content Strategy — Launch Alignment

**Purpose:** Audit current content vs. market research report recommendations. Ensure right keywords, clusters, and structure for launch.

---

## Report Summary (Key Recommendations)

| Priority | Timeframe | Focus | Target Keywords |
|----------|-----------|-------|-----------------|
| **Immediate** | Month 1 | Featured snippets | "UCR renewal 2026", date-specific variants |
| **Medium** | Month 2 | Programmatic SEO | "[state] UCR registration" (41 state pages) |
| **Long-term** | Month 3+ | Education hub | "what is UCR", informational → convert |
| **Paid** | Day 1 | Google Ads | "UCR filing service", "UCR renewal 2026" |

---

## Current State Audit

### ✅ What You Have Right

| Asset | Status | Notes |
|-------|--------|-------|
| **UCR renewal 2026** | ✅ | `ucr-renewal-guide` has title "UCR Renewal 2026: Cost, Deadline & How to Renew UCR Registration Online" |
| **Layout keywords** | ✅ | `app/layout.js` includes "ucr renewal 2026", "ucr filing", "ucr registration" |
| **State pages** | ✅ | 50 states: `/states/[state]`, `/ucr-filing/[state]`, `/insights/state/[state]` |
| **State titles** | ✅ | "UCR Registration for {state} Carriers — File Online | EasyUCR" |
| **Education hub** | ✅ | `/learn/what-is-ucr`, `/ucr/guides`, `/insights` with 6+ UCR guides |
| **"What is UCR"** | ✅ | `/learn/what-is-ucr` — Complete 2026 Guide |
| **Filing CTA** | ✅ | `/ucr/file` — primary conversion path |
| **Schema** | ✅ | FAQ, Organization, Product, WebSite JSON-LD on homepage |
| **Differentiator** | ✅ | $79 + $0 upfront + agentic speed — matches report |

### ⚠️ Gaps to Fix

| Gap | Location | Action |
|-----|----------|--------|
| **"UCR filing service"** missing from keywords | `app/layout.js` | Add — report says this is a paid target from day 1 |
| **Homepage title** | `app/page.js` | Consider adding "UCR renewal 2026" or "UCR filing service" for featured snippet |
| **UCR file page metadata** | `app/ucr/file/page.js` | Client component — add metadata via layout or parent |
| **Legacy Form 2290 in pSEO** | `app/api/pseo/regenerate`, `lib/gemini.js` | Prompts still reference Form 2290 — update to UCR if pSEO is used |
| **Blog fee table** | `app/blog/ucrData.js` | 2026 fees show $37 for 0–2 (should be $46) — update |
| **Spotlight guides** | `app/page.js` | Uses "trucking-compliance-calendar" — verify it exists in guides |

### Content Cluster Map (Current)

```
Pillar: /ucr/guides (UCR hub)
├── complete-guide-ucr-filing-2026
├── who-needs-ucr-registration
├── ucr-deadlines-penalties-explained
├── ucr-renewal-guide          ← "UCR renewal 2026" primary
├── ucr-registration-opens-october-1
├── ucr-audit-prep
└── ucr-broker-freight-forwarder

Learn hub: /learn
├── what-is-ucr               ← "what is UCR" primary
├── ucr-fees-2026
├── ucr-deadline-2026
├── ucr-vs-dot-number
├── ucr-for-owner-operators
├── ucr-for-brokers
├── ucr-for-freight-forwarders
├── do-i-need-ucr
├── late-ucr-filing
└── non-ucr-states

State pages: 50 states
├── /states/[state]           ← "[state] UCR registration"
├── /ucr-filing/[state]
└── /insights/state/[state]

Fleet pages: /ucr-fee/for/[n]-trucks (1–50)
Operator pages: /ucr-for/[type] (brokers, owner-operators, etc.)
```

---

## Keyword Alignment Checklist

### Paid (Google Ads — Day 1)

| Keyword | In metadata? | In content? |
|---------|--------------|------------|
| UCR filing service | ⚠️ Add to layout | ✅ Homepage, services |
| UCR renewal 2026 | ✅ Layout | ✅ ucr-renewal-guide |

### Organic — Month 1 (Immediate wins)

| Keyword | Primary page | Status |
|---------|--------------|--------|
| UCR renewal 2026 | ucr-renewal-guide | ✅ |
| UCR registration 2026 | ucr-registration-opens-october-1 | ✅ |
| UCR deadline 2026 | ucr-deadlines-penalties-explained | ✅ |
| UCR fee 2026 | ucr-fees-2026, ucr-fee/for/* | ✅ |

### Organic — Month 2 (State pages)

| Pattern | Example | Status |
|---------|----------|--------|
| [state] UCR registration | Texas UCR registration | ✅ /states/texas, /ucr-filing/texas |
| UCR [state] | UCR Texas | ✅ |

### Organic — Month 3+ (Education flywheel)

| Keyword | Primary page | Status |
|---------|--------------|--------|
| what is UCR | /learn/what-is-ucr | ✅ |
| who needs UCR | who-needs-ucr-registration | ✅ |
| how to file UCR | complete-guide-ucr-filing-2026 | ✅ |

---

## Recommended Actions (Pre-Launch)

### 1. Add "UCR filing service" to global keywords
**File:** `app/layout.js`  
**Change:** Add "UCR filing service" to keywords array (first position for paid alignment).

### 2. Strengthen homepage metadata for "UCR renewal 2026"
**File:** `app/page.js`  
**Current:** "UCR Filing Service — $79 Flat, Pay After Filing | EasyUCR"  
**Consider:** "UCR Renewal 2026 — $79 Filing Service, Pay After | EasyUCR" (A/B test post-launch).

### 3. Fix blog fee table (2026 fees)
**File:** `app/blog/ucrData.js`  
**Change:** Update fee table — 0–2 = $46 (not $37). 3–5 = $138 (not $111). 6–20 = $276 (not $221). 21–100 = $963 (not $769). 101–1,000 = $4,592 (not $3,670). 1,001+ = $44,836 (not $35,836).

### 4. Verify spotlight guides exist
**File:** `app/page.js`  
**Check:** `trucking-compliance-calendar` — if missing from `lib/guides.js`, remove from spotlightSlugs or add guide.

### 5. UCR file page metadata
**File:** Create or update `app/ucr/file/layout.js` (if not exists) with:
- Title: "File UCR Online — $79, Pay After Filing | EasyUCR"
- Description: "File your 2026 UCR registration in under 10 minutes. $79 service fee, $0 upfront. Pay only when your certificate is ready."

---

## Paid Campaign Setup (Report Recommendation)

Launch Google Ads on day one with:
- **Campaign 1:** "UCR filing service" (exact + phrase)
- **Campaign 2:** "UCR renewal 2026" (exact + phrase)
- **Landing pages:** `/ucr/file` (primary), `/ucr/guides` (consider for "what is UCR" queries)

---

## Document Control

- **Created:** February 2026  
- **Source:** Market research report + codebase audit  
- **Next review:** Post-launch (GSC data, paid conversion rates)
