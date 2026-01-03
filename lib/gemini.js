import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Parses a fuel receipt image using Gemini AI.
 * 
 * @param {Buffer} imageBuffer - Raw image buffer
 * @param {string} mimeType - Image mime type (e.g. 'image/jpeg')
 * @returns {Object} JSON extracted data
 */
/**
 * Parses a fuel receipt image using Gemini AI.
 * Includes retry logic for rate limits.
 */
export async function parseFuelReceipt(imageBuffer, mimeType = "image/jpeg") {
    const delays = [1000, 2000, 4000, 8000]; // Retry delays in ms

    for (let attempt = 0; attempt <= delays.length; attempt++) {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

            const prompt = `
      You are an OCR expert for trucking fuel receipts. 
      Analyze this image and extract the following fields in specific JSON format:
      {
        "date": "YYYY-MM-DD",
        "gallons": number,
        "totalAmount": number,
        "state": "2-letter US state code (e.g. TX, CA)",
        "vendor": "string"
      }
      
      Rules:
      1. If the state is not explicit, try to infer it from the address.
      2. If a field is missing, use null.
      3. Return ONLY valid raw JSON. No markdown ticks, no "json" label.
    `;

            const imagePart = {
                inlineData: {
                    data: imageBuffer.toString("base64"),
                    mimeType,
                },
            };

            const result = await model.generateContent([prompt, imagePart]);
            const response = await result.response;
            const text = response.text();

            // Clean up markdown code blocks if present
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

            return JSON.parse(cleanText);
        } catch (error) {
            // Check if it's a 429 or 503 error
            if ((error.message.includes('429') || error.message.includes('503')) && attempt < delays.length) {
                console.warn(`Gemini API rate limited. Retrying in ${delays[attempt]}ms...`);
                await new Promise(resolve => setTimeout(resolve, delays[attempt]));
                continue;
            }

            console.error("Error parsing receipt with Gemini:", error);
            throw new Error("Failed to parse receipt: " + error.message);
        }
    }
}

/**
 * Generates rich SEO content for a programmatic page using Gemini.
 * @param {string} topic - The specific topic (e.g., "Filing Form 2290 in March 2026")
 * @param {string} type - Page type (deadline, calculator, vin)
 * @param {Object} context - Metadata context (month, year, weight, etc.)
 */
export async function generatePseoContent(topic, type, context) {
    // Retry logic could be abstracted, but keeping it simple here
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
       - Use clean <h2> subheadings to break up text (e.g., "Understanding Tax Requirements for ${context.weight || 'Heavy'} Trucks").
       - Include a <table> or <ul> where appropriate to show data/rates.
       - Use <strong> tags for semantic emphasis on keywords like 'Form 2290', 'HVUT', 'Deadline', '${context.state || 'IRS'}'.
       - NO generic fluff. Be specific to the State, Vehicle Weight, or Month provided.
    
    2. **tips_html**: 
       - Provide 4-5 detailed, actionable tips.
       - Focus on local state compliance (if state provided) or vehicle-specific maintenance/compliance.
       - Format as a stylized list.

    3. **Tone**: Authoritative, Trustworthy, and Direct.

    4. **Safety**: Do not invent fake laws. Stick to federal IRS code (Section 4481) and general state DOT guidelines.
  `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(text);
    } catch (error) {
        console.error("Error generating pSEO content:", error);
        return null; // Handle null in caller
    }
}
