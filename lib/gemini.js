import { GoogleGenerativeAI } from "@google/generative-ai";

// FIXED: Use single consistent model for deterministic scoring
// Different models produce different scores even with identical inputs
const GEMINI_MODELS = [
  "gemini-2.0-flash-lite" // Use ONLY this stable model for consistent ATS scoring
  // Removed other models to ensure consistency - same model = same results
];

// Error patterns that indicate model overload or unavailability
const OVERLOAD_ERRORS = [
  "model is overloaded",
  "503 service unavailable",
  "quota exceeded",
  "rate limit exceeded",
  "resource exhausted",
  "too many requests",
  "service temporarily unavailable",
  "model not found",
  "model unavailable",
  "invalid model",
  "model does not exist",
  "unsupported model",
  "model is not available"
];

/**
 * Attempts to generate content using multiple Gemini models with fallback
 * @param {string} prompt - The prompt to send to the model
 * @param {Object} options - Configuration options
 * @param {number} options.maxOutputTokens - Maximum output tokens
 * @param {number} options.temperature - Temperature for generation
 * @param {string} options.apiKey - Gemini API key
 * @returns {Promise<Object>} - Result with text and model used
 */
export async function generateWithFallback(prompt, options = {}) {
  const {
    maxOutputTokens = 250,
    temperature = 0.7,
    apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    timeout = 60000 // 60 second timeout
  } = options;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not provided");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  let lastError = null;
  const attemptedModels = [];

  // Try each model in order
  for (const modelName of GEMINI_MODELS) {
    try {
      console.log(`[Gemini Fallback] Attempting to use model: ${modelName}`);
      attemptedModels.push(modelName);
      
      console.log(`[Gemini Fallback] Model config:`, {
        model: modelName,
        maxOutputTokens,
        temperature,
        timeout
      });
      
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        generationConfig: {
          maxOutputTokens,
          temperature,
          topP: 1.0, // Use all tokens for consistency
          topK: 1,   // Use only the top token for maximum determinism
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH", 
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_NONE"
          }
        ]
      });

      // Add timeout protection
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`Request timeout for ${modelName}`)), timeout);
      });
      
      const generatePromise = model.generateContent(prompt);
      const result = await Promise.race([generatePromise, timeoutPromise]);
      const response = await result.response;
      const text = response.text();
      
      console.log(`[Gemini Fallback] Raw response from ${modelName}:`, text?.substring(0, 200) + (text?.length > 200 ? '...' : ''));
      
      // Validate response is not empty
      if (!text || text.trim().length < 10) {
        console.log(`[Gemini Fallback] ⚠️ Model ${modelName} returned empty/short response, trying next model...`);
        console.log(`[Gemini Fallback] Response length: ${text?.length || 0}`);
        console.log(`[Gemini Fallback] Response type: ${typeof text}`);
        continue; // Try next model
      }
      
      console.log(`[Gemini Fallback] ✅ Successfully generated content using ${modelName}`);
      console.log(`[Gemini Fallback] Response length: ${text.trim().length} characters`);
      
      return {
        text: text.trim(),
        model: modelName,
        success: true,
        attemptedModels
      };
      
    } catch (error) {
      lastError = error;
      const errorMessage = error.message?.toLowerCase() || '';
      
      console.log(`[Gemini Fallback] ❌ Model ${modelName} failed:`, errorMessage);
      console.log(`[Gemini Fallback] Full error object:`, error);
      
      // Check if this is an overload error
      const isOverloadError = OVERLOAD_ERRORS.some(pattern => 
        errorMessage.includes(pattern.toLowerCase())
      );
      
      if (isOverloadError) {
        console.log(`[Gemini Fallback] 🔄 Model ${modelName} is overloaded/unavailable, trying next model...`);
        continue; // Try next model
      } else {
        // If it's not an overload error, it might be a different issue
        // Log it but still try the next model
        console.log(`[Gemini Fallback] ⚠️ Model ${modelName} failed with non-overload error:`, errorMessage);
        console.log(`[Gemini Fallback] Continuing to next model...`);
        continue;
      }
    }
  }

  // If all models failed, throw a comprehensive error
  console.error(`[Gemini Fallback] 💥 All Gemini models failed. Attempted models:`, attemptedModels);
  console.error(`[Gemini Fallback] 💥 Last error:`, lastError?.message);
  
  throw new Error(`All Gemini models are currently unavailable. Please try again later. 
    Attempted models: ${attemptedModels.join(', ')}
    Last error: ${lastError?.message || 'Unknown error'}`);
}

/**
 * Enhanced version with retry logic for transient errors
 * @param {string} prompt - The prompt to send to the model
 * @param {Object} options - Configuration options
 * @param {number} options.maxRetries - Number of retries per model
 * @param {number} options.retryDelay - Delay between retries in ms
 * @returns {Promise<Object>} - Result with text and model used
 */
export async function generateWithRetry(prompt, options = {}) {
  const {
    maxRetries = 2,
    retryDelay = 1000,
    ...fallbackOptions
  } = options;

  let lastError = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[Gemini Retry] Attempt ${attempt + 1}/${maxRetries + 1}`);
      return await generateWithFallback(prompt, fallbackOptions);
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries) {
        console.log(`[Gemini Retry] Attempt ${attempt + 1} failed, retrying in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        continue;
      }
    }
  }

  throw lastError;
}

/**
 * Extract data from Schedule 1 PDF using Gemini Vision
 * @param {File} pdfFile - The PDF file to extract data from
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} - Extracted data
 */
export async function extractSchedule1Data(pdfFile, options = {}) {
  const {
    apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    timeout = 120000 // 2 minutes for PDF processing
  } = options;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not provided");
  }

  let timeoutId = null;

  try {
    // Convert PDF to base64
    const base64Data = await fileToBase64(pdfFile);
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-lite",
      generationConfig: {
        maxOutputTokens: 2000,
        temperature: 0.1, // Low temperature for accurate extraction
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_NONE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH", 
          threshold: "BLOCK_NONE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_NONE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_NONE"
        }
      ]
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

    const generatePromise = model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: "application/pdf"
        }
      }
    ]);

    // Add timeout protection with cleanup
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error('PDF extraction timeout'));
      }, timeout);
    });
    
    const result = await Promise.race([generatePromise, timeoutPromise]);
    
    // Clear timeout if request succeeded
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    
    const response = await result.response;
    const text = response.text();

    // Parse JSON from response
    let extractedData;
    try {
      // Try to extract JSON from the response (might have markdown code blocks)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
      } else {
        extractedData = JSON.parse(text);
      }
    } catch (parseError) {
      console.error('Error parsing extracted data:', parseError);
      console.error('Raw response:', text);
      throw new Error('Failed to parse extracted data. Please try again or use manual entry.');
    }

    return {
      success: true,
      data: extractedData,
      rawResponse: text
    };

  } catch (error) {
    console.error('Error extracting Schedule 1 data:', error);
    
    // Clear timeout if it was set
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    // Check if it's an abort error
    if (error.name === 'AbortError' || error.message?.includes('aborted') || error.message?.includes('cancelled')) {
      throw new Error('Request was cancelled or timed out. Please try again.');
    }
    
    // Check for timeout
    if (error.message?.includes('timeout')) {
      throw new Error('Request timed out. The PDF might be too large. Please try again or use manual entry.');
    }
    
    throw error;
  }
}

/**
 * Convert file to base64 string
 * @param {File} file - File to convert
 * @returns {Promise<string>} - Base64 string
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1]; // Remove data:application/pdf;base64, prefix
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Simple wrapper for backward compatibility
 * @param {string} prompt - The prompt to send to the model
 * @param {Object} options - Configuration options
 * @returns {Promise<string>} - Generated text
 */
export async function generateContent(prompt, options = {}) {
  const result = await generateWithFallback(prompt, options);
  return result.text;
}

/**
 * Get the list of available models for debugging
 * @returns {Array<string>} - List of available models
 */
export function getAvailableModels() {
  return [...GEMINI_MODELS];
}

/**
 * Check if an error is an overload error
 * @param {Error} error - The error to check
 * @returns {boolean} - True if it's an overload error
 */
export function isOverloadError(error) {
  const errorMessage = error.message?.toLowerCase() || '';
  return OVERLOAD_ERRORS.some(pattern => errorMessage.includes(pattern.toLowerCase()));
}

