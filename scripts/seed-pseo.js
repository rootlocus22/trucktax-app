const admin = require("firebase-admin");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: ".env.local" });

// You might need to set GOOGLE_APPLICATION_CREDENTIALS or use a service account key
// For local dev with firebase-admin, typically we use a service account.
// Since we don't have the key file in the env usually, we will assume standard auth or mock it if key is missing
// BUT user has firebase-admin installed.

// Initialize Firebase Admin with Env Vars (Support for Vercel-style config)
if (!admin.apps.length) {
    const serviceAccount = {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Handle escaped newlines in private key
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    if (serviceAccount.privateKey && serviceAccount.clientEmail) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log("Initialized Firebase Admin with Environment Variables.");
    } else {
        try {
            const serviceAccountKey = require("../service-account-key.json"); // Expecting this file
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccountKey)
            });
            console.log("Initialized Firebase Admin with Key File.");
        } catch (e) {
            console.log("Service account/Env Vars not found, trying default app...");
            admin.initializeApp();
        }
    }
}

const db = admin.firestore();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_API_KEY");

// Data Definitions (Mirrors lib/pseo/data.js but in CommonJS for script)
// Data Definitions (Enriched for ~2000 pages)
const months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
/* 
  Weights: 55,000 to 80,000 lbs in 1,000 increments 
  (Total: 26 weights)
*/
const weights = [];
for (let i = 55000; i <= 80000; i += 1000) {
    weights.push(i.toString());
}

/* 
  Vehicle Types: Common heavy vehicle configurations
  (Total: 12 types)
*/
const types = [
    "logging-truck", "agricultural-vehicle", "semi-truck", "box-truck",
    "dump-truck", "tow-truck", "concrete-mixer", "garbage-truck",
    "tanker-truck", "flatbed-truck", "refrigerated-truck", "bucket-truck"
];

/* 
  Manufacturers: Major truck brands
  (Total: 15 makes) 
*/
const manufacturers = [
    "freightliner", "kenworth", "peterbilt", "international", "volvo",
    "mack", "western-star", "hino", "isuzu", "ford-f650",
    "ford-f750", "chevrolet-silverado-md", "ram-5500", "gmc-topkick", "autocar"
];

const years = ["2025", "2026"];

// --- GENERATOR FUNCTION ---
async function generateContent(topic, type, context) {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `
    You are an expert Trucking Tax Consultant and SEO Copywriter. Write a comprehensive, "depth-first" guide for the topic: "${topic}".
    
    Context: ${JSON.stringify(context)}
    Page Type: ${type}
    
    Output JSON format ONLY:
    {
      "intro_html": "HTML_STRING", 
      "tips_html": "HTML_STRING",
      "faq": [
        { "q": "Question?", "a": "Answer." } // Generate 5-6 high-value questions
      ],
      "meta_title": "SEO Optimized Title (max 60 chars)",
      "meta_description": "SEO Optimized Description (max 155 chars)"
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

    3. **Tone**: Authoritative, Trustworthy, and Direct.

    4. **Safety**: Do not invent fake laws. Stick to federal IRS code (Section 4481).
  `;
    try {
        const result = await model.generateContent(prompt);
        let text = result.response.text();
        // Robust JSON cleanup
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        // Basic repair for common trailing commas if needed (Gemini sometimes adds them)
        return JSON.parse(text);
    } catch (e) {
        console.error("Gemini Error:", e.message);
        return null;
    }
}

async function seed() {
    console.log("Starting pSEO Seed (FORCE UPDATE MODE)...");
    let count = 0;

    // Pattern A: Deadlines (Months x Years = 24 pages)
    for (const year of years) {
        for (const month of months) {
            const slug = `filing-2290-${month}-${year}`;
            const topic = `Filing Form 2290 in ${month} ${year}`;
            await processPage(slug, topic, "deadline", { month, year });
            count++;
        }
    }

    // Pattern B: Calculator (Weights x Types = 26 * 12 = 312 pages)
    // To reach 2000, we can add "Tax Scenarios" or just expand types later. 
    // For now, let's run this batch.
    for (const weight of weights) {
        for (const type of types) {
            const slug = `2290-tax-for-${weight}-lb-${type}`;
            const topic = `Form 2290 Tax for ${weight} lb ${type.replace(/-/g, ' ')}`;
            await processPage(slug, topic, "calculator", { weight, type });
            count++;
        }
    }

    // Pattern C: VIN Decoding (Manufacturers = 15 pages)
    for (const make of manufacturers) {
        const slug = `${make}-vin-decoding`;
        const topic = `${make.replace(/-/g, ' ')} VIN Decoding for Form 2290`;
        await processPage(slug, topic, "vin", { make });
        count++;
    }

    // --- GEOGRAPHIC EXPANSION ---

    const usStates = [
        "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida",
        "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine",
        "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska",
        "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota",
        "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
        "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
    ];

    // Pattern D: filing-2290-in-[state] (50 pages)
    console.log("Starting Pattern D: State Deadlines...");
    for (const state of usStates) {
        const stateSlug = state.toLowerCase().replace(/ /g, '-');
        const slug = `filing-2290-in-${stateSlug}`;
        const topic = `How to file Form 2290 in ${state}`;
        const context = { state, year: "2025-2026" };

        await processPage(slug, topic, "state-deadline", context); // New type 'state-deadline'
        count++;
    }

    // Pattern E: 2290-tax-for-[weight]-lb-truck-in-[state] (1300 pages)
    // Iterate all states x all weights
    console.log("Starting Pattern E: State Tax Calculators...");
    for (const state of usStates) {
        const stateSlug = state.toLowerCase().replace(/ /g, '-');
        for (const weight of weights) {
            const slug = `2290-tax-for-${weight}-lb-truck-in-${stateSlug}`;
            const topic = `Form 2290 Tax for ${weight} lb Truck in ${state}`;
            const context = { state, weight, type: "truck" };

            // Rate limit check before big loops
            await processPage(slug, topic, "state-calculator", context);
            count++;
        }
    }

    // Pattern F: 2290-tax-for-[vehicle-type]-in-[state] (600 pages)
    console.log("Starting Pattern F: State Vehicle Guides...");
    for (const state of usStates) {
        const stateSlug = state.toLowerCase().replace(/ /g, '-');
        for (const type of types) {
            const slug = `2290-tax-for-${type}-in-${stateSlug}`;
            const topic = `${type.replace(/-/g, ' ')} Tax Requirements in ${state}`;
            const context = { state, type };

            await processPage(slug, topic, "state-type", context);
            count++;
        }
    }

    console.log(`Seeding Complete. Generated ${count} pages.`);
}

async function processPage(slug, topic, type, context) {
    const docRef = db.collection("pseo_pages").doc(slug);
    // Removed "exists" check to force overwrite

    console.log(`Generating (Overwrite): ${slug}`);
    try {
        const content = await generateContent(topic, type, context);
        if (content) {
            await docRef.set({
                slug,
                type,
                ...content,
                updatedAt: new Date().toISOString()
            });
            // Rate limit safety: 1s sleep per 2 requests roughly
            await new Promise(r => setTimeout(r, 500));
        }
    } catch (e) {
        console.error(`Failed to generate ${slug}`, e);
    }
}

seed().catch(console.error);
