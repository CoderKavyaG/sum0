# 🔧 Backend - LinkedIn Post Summarizer

This is the **brain** of your application. It handles:
1. Receiving requests from the frontend
2. Scraping LinkedIn posts with Puppeteer
3. Sending text to Gemini AI
4. Returning the summary

---

## 📂 **Folder Structure Explained**

```
backend/
├── src/
│   ├── routes/
│   │   └── summarize.js       # 🛣️ API endpoint - where requests come in
│   ├── services/
│   │   ├── scraper.js         # 🕷️ Puppeteer logic - scrapes LinkedIn
│   │   └── geminiService.js   # 🤖 AI logic - talks to Gemini API
│   ├── utils/
│   │   └── validator.js       # ✅ Helper functions - validates URLs
│   └── server.js              # 🚀 Main file - starts the Express server
├── .env.example               # 📝 Template for environment variables
├── .gitignore                 # 🚫 Files to not commit to git
├── package.json               # 📦 Dependencies and scripts
└── README.md                  # 📖 This file
```

---

## 🎯 **What Each File Does**

### **1. `server.js` - The Main Entry Point**
**Purpose**: Starts the Express server and sets up middleware.

**What you'll learn:**
- How to create an Express app
- Middleware (cors, express.json, helmet)
- How to listen on a port
- Environment variables with dotenv

**Key concepts:**
```javascript
const express = require('express');
const app = express();

// Middleware runs before your routes
app.use(express.json()); // Parse JSON bodies
app.use(cors());         // Allow frontend to connect

// Routes
app.use('/api', routes);

// Start server
app.listen(PORT, () => console.log('Server running'));
```

---

### **2. `routes/summarize.js` - API Endpoint**
**Purpose**: Handles the `/api/summarize` POST request.

**What you'll learn:**
- Express routing
- Request/response handling
- Error handling with try-catch
- Calling service functions

**Flow:**
```
1. Frontend sends POST to /api/summarize with { url }
2. Validate the URL
3. Call scraper service to get post text
4. Call Gemini service to get summary
5. Return summary to frontend
```

**Key concepts:**
```javascript
router.post('/summarize', async (req, res) => {
  try {
    const { url } = req.body;
    
    // Validate
    if (!isValidLinkedInUrl(url)) {
      return res.status(400).json({ error: 'Invalid URL' });
    }
    
    // Scrape
    const postText = await scrapeLinkedInPost(url);
    
    // Summarize
    const summary = await generateSummary(postText);
    
    // Return
    res.json({ summary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

### **3. `services/scraper.js` - Puppeteer Logic**
**Purpose**: Opens LinkedIn URL and extracts post text.

**What you'll learn:**
- Launching a headless browser
- Navigating to URLs
- Waiting for elements to load
- Extracting text from DOM
- Closing browser properly

**Puppeteer basics:**
```javascript
const puppeteer = require('puppeteer');

async function scrapeLinkedInPost(url) {
  // 1. Launch browser
  const browser = await puppeteer.launch({
    headless: true,  // No visible window
    args: ['--no-sandbox']
  });
  
  // 2. Open new page
  const page = await browser.newPage();
  
  // 3. Set user agent (pretend to be real browser)
  await page.setUserAgent('Mozilla/5.0...');
  
  // 4. Go to URL
  await page.goto(url, { waitUntil: 'networkidle2' });
  
  // 5. Wait for content to load
  await page.waitForSelector('.post-content');
  
  // 6. Extract text
  const text = await page.$eval('.post-content', el => el.textContent);
  
  // 7. Close browser
  await browser.close();
  
  return text;
}
```

**Important notes:**
- LinkedIn's HTML structure may change
- You might need to adjust selectors
- Handle cases where post is not accessible
- Consider timeouts for slow loading

---

### **4. `services/geminiService.js` - AI Integration**
**Purpose**: Sends post text to Gemini API and gets summary.

**What you'll learn:**
- Using Google's Generative AI SDK
- API key management
- Prompt engineering
- Error handling for API calls

**Gemini API basics:**
```javascript
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateSummary(postText) {
  // 1. Get the model
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
  // 2. Create a good prompt
  const prompt = `
    Summarize the following LinkedIn post in one catchy, 
    engaging sentence that captures the main idea:
    
    "${postText}"
    
    Summary:
  `;
  
  // 3. Generate content
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const summary = response.text();
  
  return summary.trim();
}
```

**Prompt engineering tips:**
- Be specific about what you want
- Give context (it's a LinkedIn post)
- Specify length (one sentence)
- Ask for a specific tone (catchy, professional, etc.)

---

### **5. `utils/validator.js` - Helper Functions**
**Purpose**: Validate and sanitize user input.

**What you'll learn:**
- URL validation with regex
- Input sanitization
- Defensive programming

**Example:**
```javascript
function isValidLinkedInUrl(url) {
  // Check if it's a valid URL
  try {
    const urlObj = new URL(url);
    
    // Check if it's LinkedIn
    if (!urlObj.hostname.includes('linkedin.com')) {
      return false;
    }
    
    // Check if it's a post URL
    if (!urlObj.pathname.includes('/posts/') && 
        !urlObj.pathname.includes('/feed/update/')) {
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
}
```

---

## 🔐 **Environment Variables (.env)**

**What are environment variables?**
- Store sensitive data (API keys, secrets)
- Different values for development vs production
- Never committed to git

**Your .env file should look like:**
```
PORT=5000
GEMINI_API_KEY=your_actual_api_key_here
NODE_ENV=development
```

**How to use them:**
```javascript
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;
const port = process.env.PORT || 5000;
```

---

## 📦 **Dependencies (package.json)**

### **Production Dependencies:**
```json
{
  "express": "^4.18.2",           // Web framework
  "puppeteer": "^21.0.0",         // Web scraping
  "@google/generative-ai": "^0.1.0", // Gemini API
  "dotenv": "^16.0.3",            // Environment variables
  "cors": "^2.8.5",               // Cross-origin requests
  "helmet": "^7.0.0",             // Security headers
  "express-rate-limit": "^7.0.0"  // Rate limiting
}
```

### **Dev Dependencies:**
```json
{
  "nodemon": "^3.0.1"  // Auto-restart server on file changes
}
```

### **Scripts:**
```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  }
}
```

---

## 🚀 **How to Run**

### **1. Install Dependencies**
```bash
cd backend
npm install
```

### **2. Create .env file**
```bash
cp .env.example .env
# Then edit .env and add your GEMINI_API_KEY
```

### **3. Get Gemini API Key**
- Go to: https://makersuite.google.com/app/apikey
- Click "Create API Key"
- Copy and paste into .env

### **4. Run Development Server**
```bash
npm run dev
```

Server will start on http://localhost:5000

---

## 🧪 **Testing Your API**

### **Using Thunder Client / Postman:**

**Endpoint:** `POST http://localhost:5000/api/summarize`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "url": "https://www.linkedin.com/posts/username_activity-123456789"
}
```

**Expected Response:**
```json
{
  "summary": "This post discusses the importance of AI in modern web development."
}
```

**Error Response:**
```json
{
  "error": "Invalid LinkedIn URL"
}
```

---

## 🐛 **Common Errors & Solutions**

### **1. "Cannot find module 'puppeteer'"**
**Solution:** Run `npm install`

### **2. "GEMINI_API_KEY is not defined"**
**Solution:** 
- Check .env file exists
- Check dotenv is loaded: `require('dotenv').config()`
- Restart server after editing .env

### **3. "TimeoutError: Navigation timeout"**
**Solution:**
- Increase timeout: `page.goto(url, { timeout: 60000 })`
- Check if URL is accessible
- LinkedIn might be blocking

### **4. "CORS error"**
**Solution:**
```javascript
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:3000' // Your frontend URL
}));
```

---

## 🔒 **Security Checklist**

- [ ] API key in .env, not hardcoded
- [ ] .env in .gitignore
- [ ] Input validation on all endpoints
- [ ] Rate limiting enabled
- [ ] Helmet middleware for security headers
- [ ] CORS configured properly
- [ ] Error messages don't leak sensitive info

---

## 📈 **Performance Tips**

1. **Reuse browser instance**: Don't launch new browser for each request
2. **Add caching**: Cache summaries for same URL
3. **Set timeouts**: Don't let requests hang forever
4. **Limit concurrent requests**: Use queue for Puppeteer

---

## 🎓 **Learning Exercises**

Once you understand the code, try:

1. **Add logging**: Use `console.log` to see what's happening
2. **Add error types**: Different error messages for different failures
3. **Add request validation**: Check URL format before processing
4. **Add response time**: Log how long each step takes
5. **Add caching**: Store summaries in memory (use Map)

---

## 📚 **Next Steps**

1. Read through each file's placeholder comments
2. Implement `server.js` first (simplest)
3. Then `routes/summarize.js`
4. Then `utils/validator.js`
5. Then `services/scraper.js` (trickiest)
6. Finally `services/geminiService.js`

---

**Remember**: Code one file at a time, test frequently, and don't be afraid to console.log everything!
