function isValidLinkedInUrl(url) {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    const urlObj = new URL(url);
    
    if (!urlObj.hostname.includes('linkedin.com')) {
      return false;
    }
    
    const path = urlObj.pathname;
    if (!path.includes('/posts/') && !path.includes('/feed/update/')) {
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
}

function sanitizeText(text) {
  if (!text) return '';
  
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/[<>]/g, '')
    .trim();
}

function isValidLength(text, minLength = 10, maxLength = 10000) {
  if (!text || typeof text !== 'string') {
    return false;
  }
  
  const length = text.trim().length;
  return length >= minLength && length <= maxLength;
}

module.exports = {
  isValidLinkedInUrl,
  sanitizeText,
  isValidLength
};
