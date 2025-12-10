const { GoogleGenerativeAI } = require("@google/generative-ai");

// Note: If .env.local doesn't work with this simple script, we might need to manually pass the key or rely on process.env if loaded elsewhere.
// But usually for a standalone script, we need dotenv. 
// If dependency is missing, I'll assume the user has the key in their environment or I'll try to read .env manually.
// For now, let's assume the user runs it with `node --env-file=.env scripts/list-models.js` if they have node 20+, or we just use `dotenv`.

// Actually, safe bet:
if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not set.");
    // Try to load from .env file manually roughly
    const fs = require('fs');
    try {
        const envFile = fs.readFileSync('.env', 'utf8');
        const match = envFile.match(/GEMINI_API_KEY=(.*)/);
        if (match) {
            process.env.GEMINI_API_KEY = match[1].trim();
        }
    } catch (e) { }
}

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Dummy init to get client, actually wait, we need the model manager.

    // SDK 0.1.0+ might not have listModels exposed easily on the main client in early versions, 
    // but looking at docs usually it's via a ModelManager or similar.
    // Actually, standard REST call is safest if SDK is obscure vs version.
    // But let's try the SDK method if possible. 
    // Wait, the SDK doesn't always expose listModels directly. 

    // Alternative: Just try "gemini-1.5-flash-latest" or "gemini-pro-vision" which are safer bets.
    // But let's try to verify.

    console.log("Checking for models...");
    try {
        // Direct fetch if SDK fails us.
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.models) {
            console.log("Available Models:");
            data.models.forEach(m => {
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${m.name}`);
                }
            });
        } else {
            console.log("Error listing models:", data);
        }
    } catch (e) {
        console.error(e);
    }
}

listModels();
