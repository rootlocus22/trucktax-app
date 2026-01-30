import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
if (!getApps().length) {
    const serviceAccount = {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    if (serviceAccount.privateKey && serviceAccount.clientEmail) {
        initializeApp({
            credential: cert(serviceAccount)
        });
    } else {
        initializeApp();
    }
}

const db = getFirestore();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * POST /api/pseo/regenerate
 * Regenerate content for a single pSEO page
 */
export async function POST(request) {
    try {
        const { slug, type, context, fixIssues } = await request.json();

        if (!slug) {
            return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
        }

        // Generate new content
        const content = await generateContent(slug, type, context, fixIssues);

        if (!content) {
            return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 });
        }

        // Save to Firestore
        const docRef = db.collection('pseo_pages').doc(slug);
        await docRef.set({
            slug,
            type,
            ...content,
            updatedAt: new Date().toISOString()
        });

        return NextResponse.json({
            success: true,
            slug,
            updatedAt: new Date().toISOString(),
            content
        });
    } catch (error) {
        console.error('Regeneration error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * GET /api/pseo/regenerate?slug=xxx
 * Get current content for a pSEO page
 */
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
        return NextResponse.json({ error: 'Slug parameter required' }, { status: 400 });
    }

    try {
        const docRef = db.collection('pseo_pages').doc(slug);
        const docSnap = await docRef.get();

        if (docSnap.exists) {
            return NextResponse.json({ exists: true, data: docSnap.data() });
        } else {
            return NextResponse.json({ exists: false, data: null });
        }
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

async function generateContent(slug, type, context, fixIssues = null) {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Build topic from slug
    const topic = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    let additionalInstructions = '';
    if (fixIssues && fixIssues.length > 0) {
        additionalInstructions = `
    IMPORTANT: Fix these SEO issues:
    ${fixIssues.map(i => `- ${i.message}`).join('\n')}
    `;
    }

    const prompt = `
    You are an expert Trucking Tax Consultant and SEO Copywriter. Write a comprehensive, conversion-focused guide for: "${topic}".
    
    Context: ${JSON.stringify(context || {})}
    Page Type: ${type || 'general'}
    ${additionalInstructions}
    
    Output JSON format ONLY:
    {
      "intro_html": "HTML_STRING", 
      "tips_html": "HTML_STRING",
      "faq": [
        { "q": "Question?", "a": "Answer." }
      ],
      "meta_title": "SEO Optimized Title (MUST be 50-60 chars, include primary keyword + value prop)",
      "meta_description": "SEO Optimized Description (MUST be 140-155 chars, include price/speed/guarantee)"
    }

    CONTENT RULES (Strict):
    1. **intro_html**: MUST be 1,000+ words of rich HTML (not 500). 
       - Use clean <h2> subheadings to break up text.
       - Include a <table> or <ul> where appropriate to show data/rates.
       - Use <strong> tags for semantic emphasis on keywords like 'Form 2290', 'HVUT', 'Deadline'.
       - Include commercial intent: Mention "file online", "e-file", "$34.99", "get Schedule 1 in minutes"
       - Answer specific questions: "How much does it cost?", "How long does it take?", "What if I make a mistake?"
       - NO generic fluff. Be specific to the State, Vehicle Weight, or Month provided.
       - Include at least 3 internal linking opportunities (mention related topics naturally).
    
    2. **tips_html**: 
       - Provide 5-7 detailed, actionable tips.
       - Include at least one tip about e-filing benefits or using QuickTruckTax service.
       - Format as a stylized list with <strong> emphasis on key points.

    3. **meta_title**: 
       - MUST be 50-60 characters exactly
       - Include primary keyword (Form 2290, HVUT, etc.)
       - Include value prop: "$34.99", "File Online", "Get Schedule 1 in Minutes"
       - Format: "[Primary Keyword] + [Value Prop] | QuickTruckTax"
       - Example: "Form 2290 for 60,000 lb Truck in Texas | File Online $34.99"

    4. **meta_description**:
       - MUST be 140-155 characters exactly
       - Include primary keyword in first 20 characters
       - Include price: "$34.99 flat fee"
       - Include speed: "Get Schedule 1 in minutes"
       - Include guarantee: "Free VIN corrections" or "Trusted by 10,000+ truckers"
       - End with CTA: "Start now →" or "E-file now →"
       - Example: "File Form 2290 for 60,000 lb trucks in Texas. Get IRS Schedule 1 in minutes. $34.99 flat fee. Free VIN corrections. Start now →"

    5. **faq**: 
       - Generate 5-6 questions that people actually search for
       - Include commercial questions: "How much does it cost to file Form 2290?", "How long does it take to get Schedule 1?"
       - Keep answers concise (40-60 words) for featured snippet eligibility
       - Use natural language questions (not keyword-stuffed)

    6. **Tone**: Authoritative, Trustworthy, Direct, and Conversion-Focused.

    7. **Safety**: Do not invent fake laws. Stick to federal IRS code (Section 4481).

    8. **SEO Keywords to Naturally Include**:
       - Primary: "Form 2290", "file Form 2290", "e-file Form 2290", "Form 2290 online"
       - Secondary: "HVUT", "Heavy Vehicle Use Tax", "Schedule 1", "2290 tax calculator"
       - Commercial: "file online", "e-file", "$34.99", "get Schedule 1", "instant Schedule 1"
       - Use variations naturally throughout content (don't keyword stuff)
  `;

    try {
        const result = await model.generateContent(prompt);
        let text = result.response.text();
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(text);
    } catch (e) {
        console.error('Gemini Error:', e.message);
        return null;
    }
}
