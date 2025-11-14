const express = require('express');
const router = express.Router();
const { scrapeLinkedInPost } = require('../services/scraper');
const { generateSummary } = require('../services/geminiService');
const { isValidLinkedInUrl } = require('../utils/validator');
const { getIpAddress } = require('../utils/abuseProtection');

router.post('/summarize', async (req, res) => {
  const { url } = req.body;
  const ipAddress = getIpAddress(req);
  const startTime = Date.now();

  if (!url || !isValidLinkedInUrl(url)) {
    return res.status(400).json({ 
      error: 'Invalid LinkedIn URL',
      message: 'Please provide a valid LinkedIn post URL'
    });
  }

  try {
    console.log('\n📥 New request:', url);
    console.log('📍 IP Address:', ipAddress);

    const postText = await scrapeLinkedInPost(url);

    if (!postText || postText.length < 20) {
      return res.status(404).json({ 
        error: 'No content found',
        message: 'Could not extract text from this post'
      });
    }

    console.log('📄 Post text preview:', postText.substring(0, 200) + '...');
    console.log('📏 Full text length:', postText.length, 'characters');
    console.log('🤖 Generating AI summary...');

    const summary = await generateSummary(postText);
    const processingTime = Date.now() - startTime;

    console.log('✅ Request completed successfully\n');
    console.log(`⏱️ Total processing time: ${processingTime}ms`);

    res.json({ 
      summary,
      originalLength: postText.length,
      summaryLength: summary.length,
      processingTimeMs: processingTime,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;

    console.error('❌ Request failed:', error.message, '\n');
    res.status(500).json({ 
      error: 'Failed to process request',
      message: error.message 
    });
  }
});

router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    service: 'LinkedIn Summarizer API',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
