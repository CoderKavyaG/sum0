const { GoogleGenerativeAI } = require("@google/generative-ai");
const { getCacheKey, setCacheKey } = require("../utils/cache");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateSummary(postText) {
  try {
    if (!postText || postText.trim().length === 0) {
      throw new Error('Post text is empty');
    }

    const cacheKey = `summary:${postText.substring(0, 100)}`;
    const cached = await getCacheKey(cacheKey);
    if (cached) {
      console.log('⚡ Returning cached summary');
      return cached;
    }

    const prompt = `You are a professional LinkedIn content analyzer. Read this post and create a concise 1-2 line summary.

IMPORTANT REQUIREMENTS:
- Include person names, company names, or specific details mentioned
- Capture the main action, achievement, or announcement
- Keep it factual and informative (not vague)
- Maximum 2 sentences or 40 words
- Use professional tone
- No hashtags or emojis

LinkedIn Post:
"""
${postText}
"""

Detailed Summary (1-2 lines):`;

    const modelNames = [
      "gemini-2.5-flash",
      "gemini-1.5-flash-latest",
      "gemini-1.5-flash", 
      "gemini-1.5-pro-latest",
      "gemini-1.5-pro"
    ];

    let summary;
    let lastError;

    for (const modelName of modelNames) {
      try {
        console.log(`Trying model: ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        summary = response.text();
        console.log(`✓ Success with model: ${modelName}`);
        break;
      } catch (err) {
        lastError = err;
        console.log(`✗ Failed with ${modelName}: ${err.message}`);
        continue;
      }
    }

    if (!summary) {
      throw new Error(`All models failed. Last error: ${lastError?.message}`);
    }

    const cleanedSummary = summary
      .trim()
      .replace(/\n+/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/^["']|["']$/g, '');

    if (!cleanedSummary || cleanedSummary.length === 0) {
      throw new Error('AI returned empty summary');
    }

    const MAX_LENGTH = 300;
    const finalSummary = cleanedSummary.length > MAX_LENGTH 
      ? cleanedSummary.substring(0, MAX_LENGTH) + '...'
      : cleanedSummary;

    await setCacheKey(cacheKey, finalSummary, 604800);
    console.log(`📝 Generated summary: "${finalSummary.substring(0, 100)}..."`);
    return finalSummary;

  } catch (error) {
    console.error('Gemini API error:', error);
    
    if (error.message.includes('API key') || error.message.includes('API_KEY')) {
      throw new Error('Invalid or missing Gemini API key. Check your .env file.');
    }
    
    if (error.message.includes('quota')) {
      throw new Error('Gemini API quota exceeded. Try again later.');
    }
    
    throw new Error(`Failed to generate summary: ${error.message}`);
  }
}

module.exports = { generateSummary };
