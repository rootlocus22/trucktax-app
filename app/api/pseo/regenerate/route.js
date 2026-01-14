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
    You are an expert Trucking Tax Consultant and SEO Copywriter. Write a comprehensive guide for: "${topic}".
    
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
      "meta_title": "SEO Optimized Title (MUST be 50-60 chars)",
      "meta_description": "SEO Optimized Description (MUST be 140-155 chars)"
    }

    CONTENT RULES (Strict):
    1. **intro_html**: MUST be 500+ words of rich HTML. 
       - Use clean <h2> subheadings to break up text.
       - Include a <table> or <ul> where appropriate.
       - Use <strong> tags for semantic emphasis.
       - NO generic fluff. Be specific.
    
    2. **tips_html**: 
       - Provide 4-5 detailed, actionable tips.
       - Format as a stylized list.

    3. **meta_title**: EXACTLY between 50-60 characters. This is critical for SEO.
    
    4. **meta_description**: EXACTLY between 140-155 characters. This is critical for SEO.

    5. **Tone**: Authoritative, Trustworthy, and Direct.

    6. **Safety**: Do not invent fake laws. Stick to federal IRS code (Section 4481).
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
