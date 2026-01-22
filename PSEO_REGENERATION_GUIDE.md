# PSEO Page Regeneration Guide
**Date:** January 20, 2026  
**Purpose:** Regenerate top-performing PSEO pages with improved content quality

---

## 🎯 Overview

With the improved PSEO content generation prompts, we need to regenerate the top 20-30 pages that currently have impressions (even if low) to improve their ranking potential.

---

## 📊 Priority Pages to Regenerate

Based on Google Search Console data, prioritize these pages:

### High Priority (Current Impressions)
1. `/blog/ifta-app-review-top-mobile-tools-for-fuel-tax-management` - 502 impressions
2. `/insights/ucr-renewal-guide` - 119 impressions
3. `/insights/form-2290-deadlines-penalties` - 118 impressions
4. `/insights/fmcsa-safety-ratings-explained` - 61 impressions
5. `/blog/form-2290-filing-guide-florida` - 35 impressions
6. `/blog/how-to-check-form-2290-filing-status` - 35 impressions
7. `/insights/trucking-compliance-calendar` - 30 impressions
8. `/blog/form-2290-filing-guide-missouri` - 25 impressions
9. `/blog/truckers-guide-dot-audits-record-keeping` - 24 impressions
10. `/insights/trip-permits-vs-ifta` - 21 impressions

### Medium Priority (PSEO Pages with Impressions)
11. `/2290-tax-for-semi-truck-in-texas` - 20 impressions
12. `/2290-tax-for-semi-truck-in-ohio` - 13 impressions
13. `/2290-tax-for-semi-truck-in-arizona` - 12 impressions (1 click!)
14. `/2290-tax-for-dump-truck-in-new-jersey` - 7 impressions (2 clicks!)
15. `/2290-tax-for-60000-lb-truck-in-alaska` - 6 impressions

### Low Priority (But Still Worth Regenerating)
- All other PSEO pages with 1-5 impressions
- Focus on state pages and popular vehicle types first

---

## 🔧 How to Regenerate Pages

### Method 1: Using SEO Admin Dashboard (Recommended)

1. **Navigate to SEO Admin:**
   ```
   https://www.quicktrucktax.com/seo-admin
   ```

2. **Find the page you want to regenerate:**
   - Use search/filter to find specific pages
   - Look for pages with type "pseo"

3. **Regenerate:**
   - Click "Regen" button next to the page
   - The system will:
     - Analyze current SEO issues
     - Generate new content with improved prompts
     - Update Firestore with new content
     - Preserve existing meta tags if they're good

4. **Verify:**
   - Check the page after regeneration
   - Verify content quality (should be 1,000+ words)
   - Check meta title/description (should include price/value props)

### Method 2: Using API Directly

**Endpoint:** `POST /api/pseo/regenerate`

**Request Body:**
```json
{
  "slug": "2290-tax-for-semi-truck-in-texas",
  "type": "state-calculator",
  "context": {
    "state": "Texas",
    "weight": "semi-truck"
  },
  "fixIssues": []
}
```

**Example using curl:**
```bash
curl -X POST https://www.quicktrucktax.com/api/pseo/regenerate \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "2290-tax-for-semi-truck-in-texas",
    "type": "state-calculator",
    "context": {
      "state": "Texas",
      "weight": "semi-truck"
    }
  }'
```

### Method 3: Batch Regeneration Script

Create a script to regenerate multiple pages:

```javascript
// scripts/regenerate-top-pages.js
const topPages = [
  { slug: '2290-tax-for-semi-truck-in-texas', type: 'state-calculator', context: { state: 'Texas', weight: 'semi-truck' } },
  { slug: '2290-tax-for-semi-truck-in-ohio', type: 'state-calculator', context: { state: 'Ohio', weight: 'semi-truck' } },
  { slug: '2290-tax-for-semi-truck-in-arizona', type: 'state-calculator', context: { state: 'Arizona', weight: 'semi-truck' } },
  // ... add more pages
];

async function regeneratePages() {
  for (const page of topPages) {
    try {
      const response = await fetch('https://www.quicktrucktax.com/api/pseo/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(page)
      });
      const result = await response.json();
      console.log(`✅ Regenerated: ${page.slug}`, result);
      
      // Rate limit: wait 2 seconds between requests
      await new Promise(r => setTimeout(r, 2000));
    } catch (error) {
      console.error(`❌ Failed: ${page.slug}`, error);
    }
  }
}

regeneratePages();
```

---

## 📋 Regeneration Checklist

For each page you regenerate:

- [ ] **Content Quality:**
  - [ ] Minimum 1,000 words (check intro_html length)
  - [ ] Includes commercial intent (price, speed, guarantees)
  - [ ] Answers specific user questions
  - [ ] Includes internal linking opportunities

- [ ] **Meta Tags:**
  - [ ] Title is 50-60 characters
  - [ ] Title includes primary keyword + value prop
  - [ ] Description is 140-155 characters
  - [ ] Description includes price, speed, guarantee
  - [ ] Description ends with CTA

- [ ] **SEO Elements:**
  - [ ] FAQ section with 5-6 questions
  - [ ] FAQ answers are 40-60 words (for featured snippets)
  - [ ] Tips section with 5-7 actionable tips
  - [ ] Proper heading structure (H2, H3)

- [ ] **Verification:**
  - [ ] Page loads correctly
  - [ ] Content displays properly
  - [ ] Internal links work
  - [ ] Meta tags appear in page source

---

## 🎯 Expected Improvements

After regeneration, you should see:

### Week 1-2:
- **Content Quality:** 2x word count (500 → 1,000+ words)
- **Keyword Targeting:** Better primary keyword usage
- **Commercial Intent:** Price/speed/guarantees in every page

### Week 3-4:
- **Rankings:** Improved positions for target keywords
- **CTR:** Higher click-through rates (better titles/descriptions)
- **Impressions:** 20-30% increase in impressions

### Month 2-3:
- **Traffic:** 50-100% increase in organic traffic
- **Conversions:** Better conversion rates (more commercial intent)
- **Authority:** Improved domain authority signals

---

## 🚨 Common Issues & Solutions

### Issue: Content not generating
**Solution:** 
- Check Gemini API key is valid
- Check Firestore connection
- Verify slug format matches pattern

### Issue: Meta tags too long/short
**Solution:**
- Use SEO Admin "Fix" button to auto-correct
- Or manually edit in Firestore

### Issue: Content quality still low
**Solution:**
- Regenerate with `fixIssues` parameter
- Check prompt in `lib/gemini.js`
- Verify context data is correct

### Issue: Page not updating
**Solution:**
- Clear Next.js cache
- Check Firestore document was updated
- Verify page is using Firestore data (not fallback)

---

## 📊 Monitoring Progress

### Track These Metrics:

1. **Google Search Console:**
   - Impressions per page (should increase)
   - Average position (should improve)
   - CTR (should increase with better titles)

2. **Content Quality:**
   - Word count per page
   - Keyword density
   - Internal link count

3. **Technical:**
   - Page load speed
   - Mobile usability
   - Core Web Vitals

### Weekly Review:
- Check top 20 pages for improvements
- Identify pages needing regeneration
- Track ranking improvements
- Monitor CTR changes

---

## 🎯 Next Steps After Regeneration

1. **Submit to Google:**
   - Use Google Search Console "Request Indexing"
   - Submit updated sitemap
   - Monitor indexing status

2. **Internal Linking:**
   - Link regenerated pages from homepage
   - Link from related blog posts
   - Add to navigation if high priority

3. **Content Promotion:**
   - Share on social media
   - Link from email newsletters
   - Mention in blog posts

4. **Monitor & Iterate:**
   - Track performance weekly
   - Regenerate underperforming pages
   - Expand to more pages as results improve

---

## 💡 Pro Tips

1. **Start Small:** Regenerate top 10 pages first, then expand
2. **Monitor Results:** Wait 2-4 weeks between batches to see impact
3. **Focus on Quality:** Better to regenerate 20 pages well than 100 pages poorly
4. **Track Everything:** Use Google Search Console to track improvements
5. **Be Patient:** SEO improvements take 2-4 weeks to show in rankings

---

## 📞 Support

If you encounter issues:
1. Check SEO Admin dashboard for error messages
2. Review Firestore documents for content quality
3. Check Google Search Console for indexing issues
4. Verify API keys and permissions

---

**Remember:** Quality over quantity. Focus on regenerating your top 20-30 pages with excellent content rather than rushing through all 188 pages.

Good luck! 🚀
