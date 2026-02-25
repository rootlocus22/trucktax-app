/**
 * Phase 4: Unique content per UCR fee bracket (40%+ unique per bracket).
 * Used on /ucr-fee/for/[n]-trucks pages.
 */

/** Bracket group for content: 1-2, 3-5, 6-20, 21-100, 101+ */
export function getBracketGroup(powerUnits) {
  if (powerUnits <= 2) return '1-2';
  if (powerUnits <= 5) return '3-5';
  if (powerUnits <= 20) return '6-20';
  if (powerUnits <= 100) return '21-100';
  return '101+';
}

/** Unique intro + body copy per bracket (200+ words each) */
export const BRACKET_COPY = {
  '1-2': {
    heading: 'UCR for owner-operators and small carriers',
    intro: 'If you run one or two power units in interstate commerce, you’re in the smallest UCR fee tier. This bracket covers most owner-operators and small carriers who cross state lines.',
    body: [
      'Your UCR fee is the same whether you have one truck or two—the federal bracket is 0–2 power units. Many dispatchers and small fleets file UCR for each carrier they work with; if you’re the driver and the company, one filing per year keeps you legal. Keep your USDOT and legal name consistent with your MCS-150 so weigh stations see an active, compliant record. Filing early (after October 1) avoids the December rush and gives you time to fix any DOT data issues before the deadline.',
      'Brokers and freight forwarders pay the same $46 tier regardless of revenue; motor carriers with 1–2 trucks also pay this minimum. Add our filing service and you get a single total with no upfront payment—you pay when your UCR certificate is ready.',
    ],
  },
  '3-5': {
    heading: 'UCR for small fleets and growing carriers',
    intro: 'Fleets with three to five power units fall into the next UCR tier. This bracket is common for small trucking companies, regional haulers, and owner-operators who have added a few trucks.',
    body: [
      'Your UCR obligation is based on the total number of power units (trucks) you operate in interstate commerce. If you’re growing from one or two trucks to three or more, update your MCS-150 biennial update before filing UCR so your fleet size matches what’s on file with the FMCSA. Dispatchers who manage multiple carriers in this size range often file one UCR per entity; each company has one UCR registration per year.',
      'Staying in this bracket means you’re paying the 3–5 power unit fee regardless of how many months you run—UCR is an annual, non‑prorated fee. File by December 31 to avoid roadside fines and out-of-service orders in the new year. Many small fleets pair UCR with Form 2290 and MCS-150 updates in a single compliance workflow.',
    ],
  },
  '6-20': {
    heading: 'UCR for mid-size freight and regional fleets',
    intro: 'Carriers with six to twenty power units pay the 6–20 UCR bracket. This tier fits regional freight companies, dedicated fleets, and small for-hire carriers running multiple trucks.',
    body: [
      'Compliance for this size fleet often includes UCR, Form 2290 per vehicle, MCS-150 biennial updates, and possibly IFTA/IRP. UCR is one registration per legal entity—so one fee covers your entire fleet of 6–20 trucks for the year. Brokers and freight forwarders you work with have their own UCR (they pay the $46 tier); as a motor carrier, your fee is based on your power unit count.',
      'Weigh station enforcement checks UCR status electronically. Keeping your USDOT and fleet size current in the FMCSA system reduces delays and avoids citations. File UCR after October 1 for the new registration year; we’ll pull your DOT data and confirm your bracket so you pay the correct federal fee plus our filing service.',
    ],
  },
  '21-100': {
    heading: 'UCR for larger fleets and freight companies',
    intro: 'Fleets with 21 to 100 power units are in a higher UCR tier. This bracket applies to established trucking companies, dedicated and LTL operations, and private fleets that run interstate.',
    body: [
      'Your UCR fee is determined by the total number of power units in your fleet as reported to the FMCSA. Ensure your MCS-150 biennial update reflects your current fleet size—errors can lead to the wrong fee tier or enforcement issues. Many companies in this range use a compliance manager or third-party filer to handle UCR, 2290, and state credentials across the year.',
      'The federal fee is due by December 31; there is no proration for adding or removing trucks mid-year—the bracket is based on your fleet size at the time of registration. Filing early secures your compliance before the deadline crunch and gives time to resolve any DOT data mismatches.',
    ],
  },
  '101+': {
    heading: 'UCR for large and national fleets',
    intro: 'Carriers with over 100 power units are in the top UCR brackets. Large trucking companies, national fleets, and enterprise carriers fall here.',
    body: [
      'Your UCR fee is set by the official UCR Plan brackets (101–1,000 or 1,001+ power units). Fleet size must match your MCS-150 and FMCSA record. Many large fleets work with compliance teams or filing partners to handle UCR, 2290, and state filings at scale.',
      'Registration opens October 1; filing before the December 31 deadline keeps your entire fleet in compliance and avoids roadside penalties. We can assist with your UCR filing—enter your USDOT and we’ll confirm your bracket and total cost.',
    ],
  },
};

/** Bracket-specific FAQ (schema + display). Different questions per bracket. */
export const BRACKET_FAQS = {
  '1-2': [
    {
      q: 'Do I need UCR for just one truck?',
      a: 'Yes. If you operate that truck in interstate commerce (cross state lines for hire or for your business), you must register for UCR. The fee for 1–2 power units is $46 for the registration year, plus any filing service fee.',
    },
    {
      q: 'What if I add a second truck mid-year?',
      a: 'Your UCR fee is based on your fleet size at the time you register. If you had one truck when you filed, you paid the 0–2 bracket. If you add a second truck later, you don’t pay again—your current registration covers you through December 31. Next year, file under the bracket that matches your fleet size as of registration.',
    },
  ],
  '3-5': [
    {
      q: 'Do I need UCR for 3 trucks?',
      a: 'Yes. Once you operate three or more power units in interstate commerce, you move into the 3–5 UCR bracket. The fee is $138 for the registration year (plus filing service if you use a provider). File by December 31.',
    },
    {
      q: 'What if I add a truck mid-year?',
      a: 'UCR is an annual fee based on your fleet size when you register. If you had 3 trucks at filing time and add a fourth later, you don’t owe more for that year. When you renew next year, use the bracket that matches your current power unit count (e.g. 4 trucks still in 3–5).',
    },
  ],
  '6-20': [
    {
      q: 'How is the 6–20 UCR bracket calculated?',
      a: 'The UCR fee for 6–20 power units is a single tier: $276 for the registration year. It doesn’t matter if you have 6 or 20 trucks—the fee is the same. Your fleet size should match your MCS-150 filing with the FMCSA.',
    },
    {
      q: 'Do freight brokers in my company need a separate UCR?',
      a: 'Brokers pay the $46 tier (0–2 equivalent) regardless of revenue. If your company operates both trucks and a brokerage, the motor carrier side pays the 6–20 fee based on power units; the brokerage entity typically has its own UCR at the $46 rate.',
    },
  ],
  '21-100': [
    {
      q: 'What UCR bracket is 25 trucks?',
      a: '25 power units fall in the 21–100 bracket. The fee for this tier is $963 for the registration year. Your MCS-150 must show your current fleet size so the correct bracket is applied.',
    },
    {
      q: 'Can I prorate UCR if I reduce my fleet mid-year?',
      a: 'No. UCR fees are not prorated. You pay the fee for the bracket that applies at the time of registration, and it covers you through December 31. If you reduce your fleet later, you don’t get a refund; next year you’ll file under the new bracket.',
    },
  ],
  '101+': [
    {
      q: 'What is the UCR fee for 500 trucks?',
      a: '500 power units fall in the 101–1,000 bracket. The federal UCR fee for this tier is $4,592 for the registration year. Large fleets often file through a compliance team or third-party service.',
    },
    {
      q: 'When should large fleets file UCR?',
      a: 'Registration opens October 1. Filing early gives time to verify fleet size against MCS-150 and fix any FMCSA data issues before the December 31 deadline. Late filing can result in fines and out-of-service orders.',
    },
  ],
};
