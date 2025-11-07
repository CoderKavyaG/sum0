// Quick test script for the scraper
const { scrapeLinkedInPost } = require('./src/services/scraper');

// Test URL - use any public LinkedIn post
const testUrl = 'https://www.linkedin.com/posts/satyanadella_ai-microsoft-copilot-activity-7000000000000000000-XXXX';

console.log('Testing scraper...\n');

scrapeLinkedInPost(testUrl)
  .then(result => {
    console.log('\n=== RESULT ===');
    console.log(result);
    console.log('\n=== TEST PASSED ===');
    process.exit(0);
  })
  .catch(error => {
    console.log('\n=== ERROR ===');
    console.log(error.message);
    console.log('\n=== TEST FAILED ===');
    process.exit(1);
  });
