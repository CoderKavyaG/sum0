const redis = require('redis');

let redisClient = null;
let isConnected = false;

async function initializeCache() {
  try {
    redisClient = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 500),
        connectTimeout: 10000
      }
    });

    redisClient.on('error', (err) => {
      console.error('❌ Redis connection error:', err.message);
      isConnected = false;
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis connected');
      isConnected = true;
    });

    await redisClient.connect();
    console.log('🚀 Cache initialized with Redis');
  } catch (error) {
    console.warn('⚠️ Redis unavailable, using in-memory cache:', error.message);
    redisClient = null;
  }
}

async function getCacheKey(key) {
  try {
    if (!redisClient || !isConnected) {
      return null;
    }
    const value = await redisClient.get(key);
    if (value) {
      console.log(`📦 Cache HIT: ${key}`);
      return JSON.parse(value);
    }
    return null;
  } catch (error) {
    console.error('Cache get error:', error.message);
    return null;
  }
}

async function setCacheKey(key, value, ttl = 86400) {
  try {
    if (!redisClient || !isConnected) {
      return false;
    }
    await redisClient.setEx(key, ttl, JSON.stringify(value));
    console.log(`💾 Cache SET: ${key} (TTL: ${ttl}s)`);
    return true;
  } catch (error) {
    console.error('Cache set error:', error.message);
    return false;
  }
}

async function deleteCacheKey(key) {
  try {
    if (!redisClient || !isConnected) {
      return false;
    }
    await redisClient.del(key);
    console.log(`🗑️ Cache DELETE: ${key}`);
    return true;
  } catch (error) {
    console.error('Cache delete error:', error.message);
    return false;
  }
}

function getRedisClient() {
  return redisClient;
}

function isRedisConnected() {
  return isConnected && redisClient !== null;
}

module.exports = {
  initializeCache,
  getCacheKey,
  setCacheKey,
  deleteCacheKey,
  getRedisClient,
  isRedisConnected
};
