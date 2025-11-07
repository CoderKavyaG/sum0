const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateSummary(postText) {
  try {
    if (!postText || postText.trim().length === 0) {
      throw new Error('Post text is empty');
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
    if (cleanedSummary.length > MAX_LENGTH) {
      return cleanedSummary.substring(0, MAX_LENGTH) + '...';
    }

    console.log(`📝 Generated summary: "${cleanedSummary.substring(0, 100)}..."`);
    return cleanedSummary;

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

// ============================================
// 📝 LEARNING NOTES:
// ============================================
//
// Q: What is an API?
// A: Application Programming Interface. A way for your code to talk to
//    another service (like Gemini AI). You send a request, get a response.
//
// Q: What is an API key?
// A: A secret password that identifies your application.
//    It's how Gemini knows who's making the request and tracks usage.
//
// Q: Why store API key in .env?
// A: Security! If you hardcode it in your code and push to GitHub,
//    anyone can steal it and use your quota. .env files are gitignored.
//
// Q: What is prompt engineering?
// A: The art of writing prompts that get good AI responses.
//    Same question, different wording = different quality results!
//
// Q: How does the AI work?
// A: It's a large language model trained on tons of text.
//    It predicts what text should come next based on your prompt.
//    It doesn't "understand" like humans, but it's very good at patterns.
//
// Q: What's the difference between model types?
// A: - gemini-pro: Text only, fast, free tier
//    - gemini-pro-vision: Can process images too
//    - gemini-ultra: More powerful, may cost money
//
// ============================================
// 🎯 TESTING THIS FUNCTION:
// ============================================
//
// Create a test file: test-gemini.js
//
// require('dotenv').config();
// const { generateSummary } = require('./services/geminiService');
//
// async function test() {
//   const sampleText = `
//     Just launched my new startup! After 2 years of hard work,
//     we're finally bringing AI-powered solutions to small businesses.
//     Excited to announce our $2M seed funding from XYZ Ventures.
//     Here's to the journey ahead! 🚀
//   `;
//   
//   try {
//     const summary = await generateSummary(sampleText);
//     console.log('Summary:', summary);
//   } catch (error) {
//     console.error('Error:', error.message);
//   }
// }
//
// test();
//
// Run: node test-gemini.js
//
// ============================================
// 🐛 DEBUGGING TIPS:
// ============================================
//
// 1. Check if API key is loaded:
//    console.log('API Key exists:', !!process.env.GEMINI_API_KEY);
//    console.log('API Key length:', process.env.GEMINI_API_KEY?.length);
//
// 2. Log the prompt being sent:
//    console.log('Sending prompt:', prompt);
//
// 3. Log the raw response:
//    console.log('Raw response:', JSON.stringify(result, null, 2));
//
// 4. Test with simple text first:
//    const testText = "Hello world";
//    const summary = await generateSummary(testText);
//
// 5. Check API status:
//    Visit: https://status.cloud.google.com/
//
// ============================================
// ⚠️ COMMON ISSUES:
// ============================================
//
// 1. "API key not valid":
//    - Check .env file exists
//    - Check key is correct (no extra spaces)
//    - Restart server after changing .env
//
// 2. "Quota exceeded":
//    - Free tier has limits (60 requests per minute)
//    - Wait a bit and try again
//    - Consider upgrading if needed
//
// 3. "Model not found":
//    - Check model name spelling: "gemini-pro"
//    - Some models require different API access
//
// 4. "Empty response":
//    - AI might refuse inappropriate content
//    - Try different prompt
//    - Check if input text is valid
//
// 5. "Timeout":
//    - AI is slow sometimes
//    - Increase timeout in your request
//    - Check internet connection
//
// ============================================
// 🚀 PROMPT ENGINEERING TIPS:
// ============================================
//
// 1. Be specific:
//    Bad: "Summarize"
//    Good: "Summarize in one sentence, max 20 words"
//
// 2. Give context:
//    Bad: "Make it short"
//    Good: "You are a professional LinkedIn content curator..."
//
// 3. Show examples (few-shot learning):
//    "Example: 'Long post about AI' → 'AI is transforming industries'"
//
// 4. Set constraints:
//    "Do not use hashtags, emojis, or questions"
//
// 5. Specify tone:
//    "Use professional tone" or "Make it casual and friendly"
//
// 6. Format instructions:
//    "Return only the summary, no extra text"
//
// ============================================
// 🎓 LEARNING EXERCISES:
// ============================================
//
// Once you understand the code, try:
//
// 1. Add sentiment analysis:
//    Ask AI: "Is this post positive, negative, or neutral?"
//
// 2. Extract key topics:
//    Ask AI: "List 3 main topics in this post"
//
// 3. Generate hashtags:
//    Ask AI: "Suggest 3 relevant hashtags"
//
// 4. Different summary lengths:
//    Create functions for short (10 words), medium (20), long (50)
//
// 5. Multi-language support:
//    Ask AI: "Summarize in Spanish/French/etc."
//
// ============================================
// 📊 COST CONSIDERATIONS:
// ============================================
//
// Gemini Free Tier (as of 2024):
// - 60 requests per minute
// - 1,500 requests per day
// - Free forever for personal projects
//
// If you exceed limits:
// - Implement caching (save summaries)
// - Add rate limiting
// - Consider paid tier if needed
//
// ============================================
