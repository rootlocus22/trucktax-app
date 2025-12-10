const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

// Initialize Gemini
if (!process.env.GEMINI_API_KEY) {
    // Try to load from .env file manually
    try {
        const envFile = fs.readFileSync('.env', 'utf8');
        const match = envFile.match(/GEMINI_API_KEY=(.*)/);
        if (match) {
            process.env.GEMINI_API_KEY = match[1].trim();
        }
    } catch (e) {
        console.error("GEMINI_API_KEY not found in env or .env file");
        process.exit(1);
    }
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const OUTPUT_FILE = path.join(__dirname, '../app/blog/iftaData.js');

async function generateTopics() {
    console.log("Generating 50 high-volume IFTA topics...");
    const prompt = `
    Generate a list of 50 unique, high-traffic SEO blog post titles related to "IFTA Fuel Tax" for truck drivers and owner-operators. 
    Focus on keywords like: IFTA calculation, IFTA due dates, IFTA audit, IFTA exemptions, fuel tax reporting, etc.
    Return ONLY a JSON array of strings. Example: ["What is IFTA?", "How to Calculate IFTA"].
  `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text);
}

async function generatePost(topic) {
    console.log(`Generating content for: ${topic}`);
    const prompt = `
    Write a comprehensive SEO blog post for a trucking website about: "${topic}".
    Target Audience: Owner-operators and truck drivers.
    Tone: Professional, helpful, authoritative.
    
    Return a valid JSON object with the following fields:
    - id: (kebab-case string based on title)
    - title: (string)
    - excerpt: (string, max 160 chars)
    - category: (string, e.g., "IFTA", "Compliance", "Guides")
    - readTime: (string, e.g. "5 min")
    - date: (string, e.g. "December 2025")
    - dateISO: (string YYYY-MM-DD)
    - keywords: (array of strings)
    - content: (A string containing HTML-like JSX. 
      Use <h2> for headings, <p> for paragraphs, <ul/ol/li> for lists. 
      Use className="mb-4" etc for standard tailwind spacing. 
      Do NOT include a wrapper <div> or <>, just the inner elements. 
      Important: Do NOT use markdown. Use actual HTML tags that are valid JSX)

    Make the content substantial (approx 800 words).
    Return ONLY the raw JSON.
  `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(text);
    } catch (e) {
        console.error(`Failed to generate ${topic}:`, e.message);
        return null;
    }
}

async function main() {
    try {
        const topics = await generateTopics();
        console.log(`Found ${topics.length} topics. Starting generation...`);

        let fileContent = `// Auto-generated IFTA Data
import React from 'react';

export const iftaPosts = [
`;

        fs.writeFileSync(OUTPUT_FILE, fileContent);

        for (let i = 0; i < topics.length; i++) {
            const post = await generatePost(topics[i]);
            if (post) {
                // Convert content string to a JSX rendering function style if needed, 
                // but since the existing system uses an object with a 'content' property that is a JSX element,
                // we need to be careful. The existing system in blogData.js has content: (<> ... </>).
                // Our JSON has content as a string. We will output it as code.

                // Hack: We need to inject the content string as raw JSX code in the file.
                // We'll trust the LLM generated valid JSX-like HTML tags.

                const contentJSX = post.content;
                delete post.content; // Remove from JSON stringify to handle separately

                let postString = JSON.stringify(post, null, 2);
                // remove the closing brace to append content
                postString = postString.substring(0, postString.lastIndexOf('}'));

                // Add content field
                postString += `,\n  content: (\n    <>\n      ${contentJSX}\n    </>\n  )\n},`;

                fs.appendFileSync(OUTPUT_FILE, postString + '\n');
                console.log(`[${i + 1}/50] Saved: ${post.title}`);
            }
            // Delay significant amount to avoid hitting rate limits (15 RPM is safe for free tier mostly)
            console.log("Waiting 10s to respect rate limits...");
            await new Promise(r => setTimeout(r, 10000));
        }

        fs.appendFileSync(OUTPUT_FILE, '];\n');
        console.log("Done! File saved to app/blog/iftaData.js");

    } catch (error) {
        console.error("Fatal Error:", error);
    }
}

main();
