import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request) {
  try {
    const { fileUrl, fileName } = await request.json();

    if (!fileUrl) {
      return NextResponse.json({ error: 'Missing fileUrl' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    // Fetch the PDF from the URL
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString('base64');

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-lite',
      generationConfig: {
        maxOutputTokens: 2000,
        temperature: 0.1,
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      ],
    });

    const prompt = `You are an expert at extracting structured data from IRS Form 2290 Schedule 1 (Schedule of Heavy Highway Vehicles). 

Extract the following information from this PDF and return it as a strictly formatted JSON object:

{
  "businessName": "Full legal name as displayed in the Business Name box",
  "ein": "EIN formatted as XX-XXXXXXX",
  "address": {
    "street": "Street address including Suite/Apt",
    "city": "City name",
    "state": "Two-letter state abbreviation",
    "zip": "ZIP code (5 or 9 digits)",
    "country": "United States of America"
  },
  "phone": "Phone number if found",
  "signingAuthorityName": "Name of the person who signed or the title-holder",
  "signingAuthorityTitle": "Official title (e.g., President, Owner)",
  "taxYear": "Format YYYY-YYYY based on the form header",
  "firstUsedMonth": "Month from the 'First Used Month' box",
  "isLogging": "Boolean: true if the form is for LOGGING vehicles (check for marks in the Logging section)",
  "vehicles": [
    {
      "vin": "17-character VIN string",
      "grossWeightCategory": "Single letter code A through W",
      "isSuspended": false,
      "taxableGrossWeight": "Weight in pounds"
    }
  ]
}

Extraction Rules:
1. VIN Integrity: VINs MUST be exactly 17 characters. If a VIN is distorted, correct obvious optical character recognition errors (e.g., '0' instead of 'O').
2. Entity Rules: Split the address into street, city, state, and zip.
3. Category A-W: Map the category exactly as circled or marked on the form.
4. Completeness: Extract EVERY vehicle listed. If multiple pages exist, parse all.
5. JSON Only: Return ONLY the JSON object. No intro, no outro.`;

    // Generate content with timeout
    const generatePromise = model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: 'application/pdf',
        },
      },
    ]);

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('PDF extraction timeout')), 120000);
    });

    const result = await Promise.race([generatePromise, timeoutPromise]);
    const responseObj = await result.response;
    const text = await responseObj.text();

    // Parse JSON from response
    let extractedData;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
      } else {
        extractedData = JSON.parse(text);
      }
    } catch (parseError) {
      console.error('Error parsing extracted data:', parseError);
      console.error('Raw response:', text);
      return NextResponse.json(
        { error: 'Failed to parse extracted data', rawResponse: text },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: extractedData,
    });

  } catch (error) {
    console.error('Error extracting Schedule 1 data:', error);

    let errorMessage = 'Failed to extract data from PDF';
    if (error.message?.includes('timeout')) {
      errorMessage = 'Request timed out. The PDF might be too large.';
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { error: errorMessage, details: error.message },
      { status: 500 }
    );
  }
}

