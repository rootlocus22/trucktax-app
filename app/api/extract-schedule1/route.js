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

    const prompt = `You are an expert at extracting data from IRS Form 2290 Schedule 1 documents. 

Extract the following information from this Schedule 1 PDF and return it as a JSON object:

{
  "businessName": "Business name from the form",
  "ein": "EIN (Employer Identification Number) in format XX-XXXXXXX",
  "address": "Complete business address",
  "phone": "Phone number if available",
  "signingAuthorityName": "Name of person signing",
  "signingAuthorityTitle": "Title of person signing",
  "taxYear": "Tax year (e.g., 2025-2026)",
  "vehicles": [
    {
      "vin": "17-character VIN",
      "grossWeightCategory": "Weight category letter (A-W)",
      "isSuspended": false,
      "taxableGrossWeight": "Weight in pounds if available"
    }
  ]
}

Important:
- Extract ALL vehicles listed on the Schedule 1
- VIN must be exactly 17 characters
- Weight category should be the letter code (A through W)
- isSuspended should be true if the vehicle qualifies for suspended status
- Return ONLY valid JSON, no additional text or explanation
- If a field is not found, use null or empty string
- Ensure EIN format is XX-XXXXXXX`;

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

