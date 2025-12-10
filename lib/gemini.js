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
