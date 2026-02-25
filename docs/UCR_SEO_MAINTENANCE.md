# UCR SEO & Content — Annual Maintenance Checklist

Quick reference for keeping UCR pages and SEO accurate each year. Run each Jan/Feb and when the UCR Plan updates fees.

---

## 1. Fee table and registration year

| Task | Location | When |
|------|----------|------|
| Update UCR fee brackets (if changed by UCR Plan) | `lib/ucr-fees.js` — `UCR_FEE_BRACKETS_2026` (rename year if needed) | When FMCSA/UCR Plan publishes new rates |
| Update registration year constant | `lib/ucr-fees.js` — `UCR_REGISTRATION_YEAR`, `UCR_OPENS_OCT`, `UCR_DEADLINE_DEC` | Every Jan/Feb for new year |
| Update fee content labels | Same file; any `2026` in bracket labels or comments | With fee update |

**Grep for year:**  
`rg "2026" --type-add 'code:*.{js,jsx,ts,tsx}' -t code app/ lib/`  
Update copy and meta (titles, descriptions) that reference the **current** or **next** registration year.

---

## 2. Copy and meta (year-specific)

| Area | What to update |
|------|----------------|
| Homepage | UCR banner and any “2026” / “2027” in hero or CTAs (e.g. in `UcrDeadlineBanner` logic the year is derived; no hardcode there) |
| UCR hub | `app/ucr/guides/page.js` — title/description if they include the year |
| UCR filing wizard | `app/ucr/file/page.js` — any year in headings or steps |
| State UCR pages | `app/ucr-filing/[state]/page.js` — uses `UCR_REGISTRATION_YEAR` from lib; ensure lib is updated |
| Fee pages | `app/ucr-fee/for/[trucks]/page.js` — uses `UCR_REGISTRATION_YEAR` |
| Guides | `lib/guides.js` — UCR guide titles/descriptions that say “2026” or “2027” |
| Sitemap | `app/sitemap.js` — priorities/changeFrequency; no year usually |

---

## 3. Seasonal (Sept–Dec)

| Task | Detail |
|------|--------|
| “UCR Opens October 1” article | Already in `lib/guides.js` as `ucr-registration-opens-october-1`. Update body/FAQs if opening date or process changes. |
| Deadline / urgency banner | `components/UcrDeadlineBanner.js` — shows countdown Oct–Dec and “Last chance” in December. Uses current date; no year hardcode. |
| Penalty content | `/insights/ucr-deadlines-penalties-explained` is linked from UCR hub and from December “Last chance” banner. Update if penalty rules change. |

---

## 4. After running the checklist

- Build and spot-check: `/ucr/file`, `/ucr/guides`, `/ucr-fee/for/1-truck`, one state page, homepage.
- Confirm `UCR_REGISTRATION_YEAR` is correct in `lib/ucr-fees.js` and that all pages using it show the right year.
- Optional: Request indexing in GSC for key UCR URLs after big copy/year updates.

---

*Part of the UCR SEO Action Plan. See `UCR_SEO_ACTION_PLAN.md` for full phases.*
