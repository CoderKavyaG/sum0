const inMemoryCache = new Map();

async function initializeCache() {
  console.log('🚀 Cache initialized (in-memory)');
}

async function getCacheKey(key) {
  try {
    if (inMemoryCache.has(key)) {
      const cachedItem = inMemoryCache.get(key);
      if (cachedItem.expiry > Date.now()) {
        console.log(`📦 Cache HIT: ${key}`);
        return cachedItem.value;
      } else {
        inMemoryCache.delete(key);
      }
    }
    return null;
  } catch (error) {
    console.error('Cache get error:', error.message);
    return null;
  }
}

async function setCacheKey(key, value, ttl = 86400) {
  try {
    inMemoryCache.set(key, {
      value,
      expiry: Date.now() + (ttl * 1000)
    });
    console.log(`💾 Cache SET: ${key} (TTL: ${ttl}s)`);
    return true;
  } catch (error) {
    console.error('Cache set error:', error.message);
    return false;
  }
}

async function deleteCacheKey(key) {
  try {
    inMemoryCache.delete(key);
    console.log(`🗑️ Cache DELETE: ${key}`);
    return true;
  } catch (error) {
    console.error('Cache delete error:', error.message);
    return false;
  }
}

function clearCache() {
  inMemoryCache.clear();
  console.log('🗑️ Cache cleared');
}

module.exports = {
  initializeCache,
  getCacheKey,
  setCacheKey,
  deleteCacheKey,
  clearCache
};
