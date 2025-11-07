const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeMetaTags(url) {
  console.log('📋 [1/3] Trying Open Graph meta tags...');
  
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html',
      },
      timeout: 8000,
      validateStatus: () => true
    });

    const $ = cheerio.load(response.data);
    
    const ogDescription = $('meta[property="og:description"]').attr('content');
    const ogTitle = $('meta[property="og:title"]').attr('content');
    const description = $('meta[name="description"]').attr('content');
    
    let content = '';
    if (ogTitle) content += ogTitle + '. ';
    if (ogDescription) content += ogDescription;
    else if (description) content += description;
    
    if (content && content.length > 40) {
      console.log('   ✅ Found meta tags!');
      return content.trim();
    }
    
    console.log('   ⚠️ No useful meta tags found');
    return null;
  } catch (error) {
    console.log('   ❌ Meta tags failed:', error.message);
    return null;
  }
}

async function scrapeWithProxy(url) {
  console.log('🌐 [2/3] Trying CORS proxies...');
  
  const proxies = [
    { name: 'AllOrigins', url: 'https://api.allorigins.win/raw?url=' },
    { name: 'CorsProxy', url: 'https://corsproxy.io/?' },
  ];
  
  for (const proxy of proxies) {
    try {
      console.log(`   → Trying ${proxy.name}...`);
      
      const response = await axios.get(proxy.url + encodeURIComponent(url), {
        timeout: 12000,
        headers: { 'User-Agent': 'Mozilla/5.0' },
        validateStatus: () => true
      });

      if (!response.data) continue;

      const $ = cheerio.load(response.data);
      $('script, style, nav, header, footer, iframe').remove();
      
      const selectors = [
        '.feed-shared-update-v2__description',
        '.feed-shared-text',
        '.update-components-text',
        'article',
        'main'
      ];
      
      for (const selector of selectors) {
        const text = $(selector).first().text().trim();
        if (text.length > 50) {
          console.log(`   ✅ Found content via ${proxy.name}!`);
          return text;
        }
      }
      
    } catch (error) {
      console.log(`   ❌ ${proxy.name} failed:`, error.message);
    }
  }
  
  console.log('   ⚠️ All proxies failed');
  return null;
}

async function scrapeDirect(url) {
  console.log('🔗 [3/3] Trying direct fetch...');
  
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html',
      },
      timeout: 8000,
      validateStatus: () => true
    });

    const $ = cheerio.load(response.data);
    $('script, style').remove();
    
    const text = $('body').text().replace(/\s+/g, ' ').trim();
    
    if (text.length > 100) {
      console.log('   ✅ Direct fetch worked!');
      return text;
    }
    
    console.log('   ⚠️ Not enough content');
    return null;
  } catch (error) {
    console.log('   ❌ Direct fetch failed:', error.message);
    return null;
  }
}

function cleanText(text) {
  if (!text) return null;
  
  const cleaned = text
    .replace(/\s+/g, ' ')
    .replace(/Sign in to LinkedIn|Join now/gi, '')
    .replace(/See more|Show less|…see more/gi, '')
    .replace(/\d+ reactions?|Like|Comment|Share|Send/gi, '')
    .trim();
  
  return cleaned.length >= 20 ? cleaned : null;
}

async function scrapeLinkedInPost(url) {
  console.log('\n🚀 Starting LinkedIn scraper');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('URL:', url);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  try {
    let content = await scrapeMetaTags(url);
    if (content) {
      const cleaned = cleanText(content);
      if (cleaned) {
        console.log('\n✅ SUCCESS via Meta Tags');
        console.log(`📝 Extracted ${cleaned.length} characters\n`);
        return cleaned;
      }
    }
    
    content = await scrapeWithProxy(url);
    if (content) {
      const cleaned = cleanText(content);
      if (cleaned) {
        console.log('\n✅ SUCCESS via CORS Proxy');
        console.log(`📝 Extracted ${cleaned.length} characters\n`);
        return cleaned;
      }
    }
    
    content = await scrapeDirect(url);
    if (content) {
      const cleaned = cleanText(content);
      if (cleaned) {
        console.log('\n✅ SUCCESS via Direct Fetch');
        console.log(`📝 Extracted ${cleaned.length} characters\n`);
        return cleaned;
      }
    }
    
    throw new Error('Unable to extract content from this LinkedIn post. The post may be private or require login.');
    
  } catch (error) {
    console.log('\n❌ FAILED - All methods exhausted\n');
    throw error;
  }
}

module.exports = { scrapeLinkedInPost };

// ============================================
// 📝 LEARNING NOTES:
// ============================================
//
// Q: What is Puppeteer?
// A: A Node.js library that controls Chrome/Chromium browser.
//    You can automate anything a human can do in a browser.
//
// Q: What is a headless browser?
// A: A browser that runs without a visible window. Faster and uses less resources.
//    Great for automation and scraping.
//
// Q: What are CSS selectors?
// A: Ways to find elements on a page:
//    - '.class-name' = find by class
//    - '#id-name' = find by ID
//    - '[attribute="value"]' = find by attribute
//    - 'div.class' = find div with class
//
// Q: Why multiple selectors?
// A: LinkedIn's HTML structure changes. Having fallbacks makes your scraper
//    more resilient. If one selector fails, try another.
//
// Q: What's the difference between innerText and textContent?
// A: - innerText: Returns visible text (respects CSS display)
//    - textContent: Returns all text, even if hidden
//    Usually innerText is better for scraping.
//
// Q: Why finally block?
// A: Ensures browser.close() runs even if there's an error.
//    Otherwise, you'd have zombie browser processes eating memory!
//
// ============================================
// 🎯 TESTING THIS FUNCTION:
// ============================================
//
// Create a test file: test-scraper.js
//
// const { scrapeLinkedInPost } = require('./services/scraper');
//
// async function test() {
//   const url = 'https://www.linkedin.com/posts/...';
//   try {
//     const text = await scrapeLinkedInPost(url);
//     console.log('Scraped text:', text);
//   } catch (error) {
//     console.error('Error:', error.message);
//   }
// }
//
// test();
//
// Run: node test-scraper.js
//
// ============================================
// 🐛 DEBUGGING TIPS:
// ============================================
//
// 1. Set headless: false to see the browser:
//    browser = await puppeteer.launch({ headless: false });
//
// 2. Take screenshots to see what Puppeteer sees:
//    await page.screenshot({ path: 'debug.png' });
//
// 3. Log the page HTML:
//    const html = await page.content();
//    console.log(html);
//
// 4. Increase timeouts if page loads slowly:
//    await page.goto(url, { timeout: 60000 });
//
// 5. Check if element exists before extracting:
//    const exists = await page.$('.selector') !== null;
//    console.log('Element exists:', exists);
//
// ============================================
// ⚠️ COMMON ISSUES:
// ============================================
//
// 1. "Navigation timeout":
//    - LinkedIn is slow or blocking you
//    - Try increasing timeout
//    - Check if URL is accessible in regular browser
//
// 2. "Element not found":
//    - LinkedIn changed their HTML structure
//    - Use browser DevTools to find new selectors
//    - Right-click element → Inspect → Copy selector
//
// 3. "Post is private":
//    - Only public posts can be scraped
//    - LinkedIn might require login for some posts
//    - Test with definitely public posts first
//
// 4. "Rate limiting":
//    - LinkedIn detects too many requests
//    - Add delays between requests
//    - Use residential proxies (advanced)
//
// ============================================
// 🚀 ADVANCED IMPROVEMENTS (Optional):
// ============================================
//
// 1. Browser reuse: Keep browser open between requests
//    (faster, but more complex)
//
// 2. Stealth mode: Use puppeteer-extra-plugin-stealth
//    to avoid detection
//
// 3. Retry logic: Retry failed scrapes with exponential backoff
//
// 4. Proxy support: Rotate IPs to avoid rate limiting
//
// 5. Screenshot on error: Save screenshot when scraping fails
//    for debugging
//
// ============================================
