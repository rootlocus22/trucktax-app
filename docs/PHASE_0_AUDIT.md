# Phase 0: UCR & Core Service URL Audit
**Date:** February 2026  
**Status:** Fixes applied; verify on deploy (run build, then check redirects and links).

## 1. UCR & Core Service Routes (from sitemap + app)

| URL pattern | App route exists? | Notes |
|-------------|--------------------|--------|
| `/` | ✅ | app/page.js |
| `/ucr/file` | ✅ | app/ucr/file/page.js |
| `/ucr/pricing` | ✅ | app/ucr/pricing/page.js |
| `/services/ucr-registration` | ✅ | app/services/ucr-registration/page.js |
| `/services/ucr-registration/[state]` | ✅ | app/services/ucr-registration/[state]/page.js |
| `/services/ucr-for/[entity]` | ✅ | app/services/ucr-for/[entity]/page.js |
| `/ucr-filing/[state]` | ✅ | app/ucr-filing/[state]/page.js |
| `/ucr-fee/for/[trucks]` | ✅ | app/ucr-fee/for/[trucks]/page.js |
| `/ucr-for/[type]` | ✅ | app/ucr-for/[type]/page.js (brokers, freight-forwarders, etc.) |
| `/tools/ucr-calculator` | ✅ | app/tools/ucr-calculator/ |
| `/insights/ucr-renewal-guide` | ✅ | app/insights/ucr-renewal-guide/page.js |
| `/insights/ucr-deadlines-penalties-explained` | ✅ | app/insights/ucr-deadlines-penalties-explained/page.js |
| `/insights/who-needs-ucr-registration` | ✅ | app/insights/who-needs-ucr-registration/page.js |
| `/insights/complete-guide-ucr-filing-2026` | ✅ | app/insights/complete-guide-ucr-filing-2026/page.js |
| `/insights/form-2290-vs-ucr-difference` | ✅ | app/insights/form-2290-vs-ucr-difference/page.js |
| `/services/mcs-150-update` | ✅ | app/services/mcs-150-update/page.js |
| `/services/ifta-irp` | ✅ | app/services/ifta-irp/page.js |

## 2. Issues Found (404 risk)

| Issue | Location | Fix |
|-------|----------|-----|
| Homepage links to `/services/mcs150-update` | app/page.js (services array) | Actual route is `/services/mcs-150-update` (hyphen). Link was 404. |
| Homepage links to `/services/ifta-filing` | app/page.js (services array) | Actual route is `/services/ifta-irp`. Link was 404. |

## 3. Redirects Added (next.config.js)

- `/services/mcs150-update` → `/services/mcs-150-update` (301)
- `/services/ifta-filing` → `/services/ifta-irp` (301)
- `/ucr-registration` → `/services/ucr-registration` (301) — in case external links use bare path

## 4. Canonicals Verified

- app/ucr/layout.js: canonical for /ucr/* defaults to https://www.quicktrucktax.com/ucr/file
- app/ucr/pricing/page.js: alternates.canonical set
- app/ucr-filing/[state]/page.js: canonical per state
- app/services/ucr-registration/page.js: canonical set
- app/services/ucr-for/[entity]/page.js: canonical per entity
- Root layout: metadataBase + canonical for homepage

## 5. Internal Links (sample)

- All UCR CTAs point to `/ucr/file` or `/services/ucr-registration` — no broken UCR links found.
- Dashboard, insights, services, tools: links to /ucr/file and /services/ucr-registration are correct.

## 6. GSC Follow-up (manual)

- In Google Search Console > Coverage: identify any 404s that reference the old URLs above; they will now redirect.
- Request indexing for key UCR URLs after deploy: /ucr/file, /services/ucr-registration, /insights/ucr-renewal-guide.
