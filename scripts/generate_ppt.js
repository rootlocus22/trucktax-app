const pptxgen = require('pptxgenjs');
const path = require('path');

const pres = new pptxgen();

// Common Colors
const NAVY = '001F3F';
const ORANGE = 'FF851B';
const WHITE = 'FFFFFF';
const SLATE = 'F8FAFC';

// Slide 1: Title Slide
{
    let slide = pres.addSlide();
    slide.background = { color: NAVY };

    // Background Image (if exists)
    slide.addImage({
        path: path.join(__dirname, '../public/images/truck_sunset_highway.png'),
        x: 5.5, y: 0, w: 4.5, h: 5.625
    });

    slide.addText('Partnership Opportunity:\nRevolutionizing Trucking Compliance', {
        x: 0.5, y: 1.5, w: 5, h: 2,
        fontSize: 36, color: WHITE, bold: true, fontFace: 'Arial'
    });

    slide.addText('Unlocking High-Intent Markets with QuickTruckTax.com', {
        x: 0.5, y: 3.5, w: 5, h: 1,
        fontSize: 18, color: WHITE, fontFace: 'Arial', italic: true
    });

    slide.addText('Presented by: [Your Name] | QuickTruckTax', {
        x: 0.5, y: 4.8, w: 5, h: 0.5,
        fontSize: 12, color: WHITE, fontFace: 'Arial'
    });

    slide.addShape(pres.ShapeType.rect, { x: 0.5, y: 1.2, w: 2.5, h: 0.3, fill: { color: ORANGE } });
    slide.addText('PARTNERSHIP OPPORTUNITY', { x: 0.6, y: 1.2, w: 2.4, h: 0.3, fontSize: 10, color: WHITE, bold: true, align: 'center' });
}

// Slide 2: The Opportunity – Market Demand
{
    let slide = pres.addSlide();
    slide.background = { color: SLATE };

    slide.addText('The Opportunity – Market Demand', { x: 0.5, y: 0.5, w: 9, h: 1, fontSize: 32, color: NAVY, bold: true });

    const points = [
        '3.5 Million+ truck drivers in the US.',
        'The Legal Mandate: Every heavy vehicle (55,000+ lbs) must file IRS Form 2290 annually.',
        'The Momentum: 170+ high-intent US visitors per month (Organic).',
        'Engagement: Users spend 20+ mins on our site.',
        'Conversion: AI-driven tools (Calculators, Calendars) are ready for launch.'
    ];

    points.forEach((p, i) => {
        slide.addText(p, { x: 1, y: 1.8 + (i * 0.7), w: 8, h: 0.5, fontSize: 18, color: NAVY, bullet: true });
    });
}

// Slide 3: Business Model – Scaling Through Automation
{
    let slide = pres.addSlide();
    slide.addText('Business Model – Scaling Through Automation', { x: 0.5, y: 0.5, w: 9, h: 1, fontSize: 32, color: NAVY, bold: true });

    const points = [
        'The Product: A seamless, agentic e-filing platform that turns complex tax laws into simple, 5-minute workflows.',
        'Revenue Streams: Filing Fees ($45 flat fee) + Compliance Retainers (Monthly recurring).',
        'The Edge: Zero advertising spend. Growth driven by SEO and AI referrals (ChatGPT/Copilot).'
    ];

    points.forEach((p, i) => {
        slide.addText(p, { x: 1, y: 1.8 + (i * 1.0), w: 8, h: 0.8, fontSize: 18, color: NAVY, bullet: true });
    });
}

// Slide 4: Your Role – The Responsible Official (RO)
{
    let slide = pres.addSlide();
    slide.background = { color: SLATE };
    slide.addText('Your Role – The Responsible Official (RO)', { x: 0.5, y: 0.5, w: 9, h: 1, fontSize: 32, color: NAVY, bold: true });

    const points = [
        'The Core Focus: Your primary responsibility is to serve as the US-resident "Responsible Official" to secure the EFIN license for the firm.',
        'No Expertise Required: You do not need to be a compliance expert. Your role is primarily administrative and oversight-based.',
        'In-House Support: We have an in-house PTIN holder who manages all technical compliance challenges and trucking-specific tax issues.'
    ];

    points.forEach((p, i) => {
        slide.addText(p, { x: 1, y: 1.8 + (i * 1.0), w: 8, h: 0.8, fontSize: 18, color: NAVY, bullet: true });
    });
}

// Slide 5: Risk Management – Your Protection First
{
    let slide = pres.addSlide();
    slide.addText('Risk Management – Your Protection First', { x: 0.5, y: 0.5, w: 9, h: 1, fontSize: 32, color: NAVY, bold: true });

    const risks = [
        { title: 'Risk: Financial Liability?', text: 'Reality: No. You are not liable for individual trucker taxes. Operational integrity is managed by our PTIN expert.' },
        { title: 'Risk: Compliance Errors?', text: 'Reality: Our in-house PTIN holder anchors the technical filing. You act as the "Gatekeeper" with power to pause operations.' },
        { title: 'Risk: Software Errors?', text: 'Reality: Signed Indemnification Agreement. QuickTruckTax assumes all technical and software liability.' }
    ];

    risks.forEach((r, i) => {
        slide.addText(r.title, { x: 1, y: 1.8 + (i * 1.2), w: 8, h: 0.4, fontSize: 20, color: ORANGE, bold: true });
        slide.addText(r.text, { x: 1, y: 2.2 + (i * 1.2), w: 8, h: 0.6, fontSize: 16, color: NAVY });
    });
}

// Slide 6: Effort vs. Reward – A Passive Partnership
{
    let slide = pres.addSlide();
    slide.background = { color: NAVY };
    slide.addText('Effort vs. Reward – A Passive Partnership', { x: 0.5, y: 0.5, w: 9, h: 1, fontSize: 32, color: WHITE, bold: true });

    const items = [
        { title: 'Your Time Investment:', text: 'Setup (2 hours) + Ongoing (1 hour/month log review).' },
        { title: 'The Reward:', text: '30% of every filing fee revenue share.' },
        { title: 'Potential:', text: 'At 500 filings/season = $6,750+ for roughly 10 hours of work per year.' }
    ];

    items.forEach((item, i) => {
        slide.addText(item.title, { x: 1, y: 1.8 + (i * 1.2), w: 8, h: 0.4, fontSize: 20, color: ORANGE, bold: true });
        slide.addText(item.text, { x: 1, y: 2.2 + (i * 1.2), w: 8, h: 0.6, fontSize: 16, color: WHITE });
    });
}

// Slide 7: Step-by-Step – The Path to Launch
{
    let slide = pres.addSlide();
    slide.background = { color: SLATE };
    slide.addText('Step-by-Step – The Path to Launch', { x: 0.5, y: 0.5, w: 9, h: 1, fontSize: 32, color: NAVY, bold: true });

    const steps = [
        'Identity Verification: Create account on IRS e-Services (via ID.me).',
        'Application Link: I list QuickTruckTax; you accept the invite as the RO.',
        'Suitability: IRS conducts a background check (~45 days).',
        'EFIN Issuance: IRS grants the license to the firm.',
        'Launch: We flip the switch on QuickTruckTax.com and start generating revenue.'
    ];

    steps.forEach((step, i) => {
        slide.addText(`${i + 1}. ${step}`, { x: 1, y: 1.8 + (i * 0.7), w: 8, h: 0.5, fontSize: 18, color: NAVY });
    });
}

// Slide 8: Conclusion – Shared Success
{
    let slide = pres.addSlide();
    slide.background = { color: NAVY };
    slide.addText('Conclusion – Shared Success', { x: 0.5, y: 0.5, w: 9, h: 1, fontSize: 32, color: WHITE, bold: true, align: 'center' });

    slide.addText('"Your Compliance + Our Technology = Market Dominance."', {
        x: 0.5, y: 1.8, w: 9, h: 1.5,
        fontSize: 28, color: ORANGE, bold: true, italic: true, align: 'center'
    });

    slide.addText('Let\'s build the future of trucking compliance together.', {
        x: 0.5, y: 3.5, w: 9, h: 0.5,
        fontSize: 22, color: WHITE, bold: true, align: 'center'
    });

    slide.addText('Contact Info: [Your Email/WhatsApp]', {
        x: 0.5, y: 4.5, w: 9, h: 0.5,
        fontSize: 14, color: WHITE, align: 'center'
    });
}

pres.writeFile({ fileName: 'QuickTruckTax_Partnership_Deck.pptx' }).then(fileName => {
    console.log(`Created file: ${fileName}`);
});
