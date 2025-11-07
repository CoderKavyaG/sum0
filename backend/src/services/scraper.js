const axios = require('axios');
const cheerio = require('cheerio');
const { getCacheKey, setCacheKey } = require('../utils/cache');

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
    const cacheKey = `scrape:${url}`;
    const cached = await getCacheKey(cacheKey);
    if (cached) {
      console.log('⚡ Returning cached result\n');
      return cached;
    }
    
    let content = await scrapeMetaTags(url);
    if (content) {
      const cleaned = cleanText(content);
      if (cleaned) {
        await setCacheKey(cacheKey, cleaned, 86400);
        console.log('\n✅ SUCCESS via Meta Tags');
        console.log(`📝 Extracted ${cleaned.length} characters\n`);
        return cleaned;
      }
    }
    
    content = await scrapeWithProxy(url);
    if (content) {
      const cleaned = cleanText(content);
      if (cleaned) {
        await setCacheKey(cacheKey, cleaned, 86400);
        console.log('\n✅ SUCCESS via CORS Proxy');
        console.log(`📝 Extracted ${cleaned.length} characters\n`);
        return cleaned;
      }
    }
    
    content = await scrapeDirect(url);
    if (content) {
      const cleaned = cleanText(content);
      if (cleaned) {
        await setCacheKey(cacheKey, cleaned, 86400);
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