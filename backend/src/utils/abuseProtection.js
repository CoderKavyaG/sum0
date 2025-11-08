const crypto = require('crypto');

const MAX_REQUESTS_PER_HOUR = 50;
const MAX_REQUESTS_PER_DAY = 200;
const BAN_DURATION = 3600;

const inMemoryRateLimits = new Map();

function getFingerprint(req) {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.get('user-agent') || 'unknown';
  const combined = `${ip}:${userAgent}`;
  return crypto.createHash('sha256').update(combined).digest('hex');
}

function getIpAddress(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.headers['x-real-ip'] ||
    req.connection.remoteAddress ||
    'unknown'
  );
}

async function checkRateLimit(req, res, next) {
  try {
    const ip = getIpAddress(req);
    const now = Date.now();

    if (!inMemoryRateLimits.has(ip)) {
      inMemoryRateLimits.set(ip, { hourCount: 0, hourStart: now, dayCount: 0, dayStart: now, banned: false, banTime: 0 });
    }

    const limits = inMemoryRateLimits.get(ip);

    if (limits.banned && now - limits.banTime < BAN_DURATION * 1000) {
      console.warn(`🚫 IP ${ip} is banned`);
      return res.status(429).json({
        error: 'Too many requests',
        message: 'Your IP has been temporarily banned. Try again later.'
      });
    } else {
      limits.banned = false;
    }

    if (now - limits.hourStart > 3600000) {
      limits.hourCount = 0;
      limits.hourStart = now;
    }
    if (now - limits.dayStart > 86400000) {
      limits.dayCount = 0;
      limits.dayStart = now;
    }

    limits.hourCount++;
    limits.dayCount++;
    const hourCount = limits.hourCount;
    const dayCount = limits.dayCount;

    if (hourCount > MAX_REQUESTS_PER_HOUR) {
      console.warn(`⚠️ IP ${ip} exceeded hourly limit (${hourCount}/${MAX_REQUESTS_PER_HOUR})`);
      limits.banned = true;
      limits.banTime = now;
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: `Maximum ${MAX_REQUESTS_PER_HOUR} requests per hour allowed.`
      });
    }

    if (dayCount > MAX_REQUESTS_PER_DAY) {
      console.warn(`⚠️ IP ${ip} exceeded daily limit (${dayCount}/${MAX_REQUESTS_PER_DAY})`);
      limits.banned = true;
      limits.banTime = now;
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: `Maximum ${MAX_REQUESTS_PER_DAY} requests per day allowed.`
      });
    }

    res.set('X-RateLimit-Limit-Hour', MAX_REQUESTS_PER_HOUR);
    res.set('X-RateLimit-Remaining-Hour', Math.max(0, MAX_REQUESTS_PER_HOUR - hourCount));
    res.set('X-RateLimit-Limit-Day', MAX_REQUESTS_PER_DAY);
    res.set('X-RateLimit-Remaining-Day', Math.max(0, MAX_REQUESTS_PER_DAY - dayCount));

    next();
  } catch (error) {
    console.error('Rate limit check error:', error.message);
    next();
  }
}

module.exports = {
  checkRateLimit,
  getIpAddress,
  getFingerprint,
  MAX_REQUESTS_PER_HOUR,
  MAX_REQUESTS_PER_DAY
};
