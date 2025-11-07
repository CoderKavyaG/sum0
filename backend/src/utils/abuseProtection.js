const crypto = require('crypto');
const { getRedisClient, isRedisConnected } = require('./cache');

const MAX_REQUESTS_PER_HOUR = 50;
const MAX_REQUESTS_PER_DAY = 200;
const BAN_DURATION = 3600;
const SUSPICIOUS_THRESHOLD = 10;

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
    const redisClient = getRedisClient();
    if (!isRedisConnected() || !redisClient) {
      console.warn('⚠️ Redis unavailable, skipping rate limit check');
      return next();
    }

    const ip = getIpAddress(req);
    const fingerprint = getFingerprint(req);
    const url = req.body?.url || 'unknown';

    const banKey = `ban:${ip}`;
    const hourKey = `ratelimit:hour:${ip}`;
    const dayKey = `ratelimit:day:${ip}`;
    const urlKey = `ratelimit:url:${url}`;

    const isBanned = await redisClient.get(banKey);
    if (isBanned) {
      console.warn(`🚫 IP ${ip} is banned`);
      return res.status(429).json({
        error: 'Too many requests',
        message: 'Your IP has been temporarily banned. Try again later.',
        retryAfter: parseInt(isBanned)
      });
    }

    const hourCount = await redisClient.incr(hourKey);
    if (hourCount === 1) {
      await redisClient.expire(hourKey, 3600);
    }

    const dayCount = await redisClient.incr(dayKey);
    if (dayCount === 1) {
      await redisClient.expire(dayKey, 86400);
    }

    const urlCount = await redisClient.incr(urlKey);
    if (urlCount === 1) {
      await redisClient.expire(urlKey, 3600);
    }

    req.rateLimit = {
      ip,
      fingerprint,
      hourCount,
      dayCount,
      urlCount
    };

    if (hourCount > MAX_REQUESTS_PER_HOUR) {
      console.warn(`⚠️ SUSPICIOUS: IP ${ip} exceeded hourly limit (${hourCount}/${MAX_REQUESTS_PER_HOUR})`);
      await redisClient.setEx(banKey, BAN_DURATION, BAN_DURATION.toString());
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: `Maximum ${MAX_REQUESTS_PER_HOUR} requests per hour allowed.`,
        retryAfter: 3600
      });
    }

    if (dayCount > MAX_REQUESTS_PER_DAY) {
      console.warn(`⚠️ SUSPICIOUS: IP ${ip} exceeded daily limit (${dayCount}/${MAX_REQUESTS_PER_DAY})`);
      await redisClient.setEx(banKey, BAN_DURATION, BAN_DURATION.toString());
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: `Maximum ${MAX_REQUESTS_PER_DAY} requests per day allowed.`,
        retryAfter: 86400
      });
    }

    if (urlCount > SUSPICIOUS_THRESHOLD && dayCount > MAX_REQUESTS_PER_HOUR / 2) {
      console.warn(`🚨 ABUSE DETECTED: IP ${ip} repeatedly scraping same URL`);
      const abuseKey = `abuse:${fingerprint}`;
      const abuseCount = await redisClient.incr(abuseKey);
      await redisClient.expire(abuseKey, 86400);

      if (abuseCount > 3) {
        console.warn(`🚫 AUTO-BAN: IP ${ip} for abuse patterns`);
        await redisClient.setEx(banKey, BAN_DURATION * 2, (BAN_DURATION * 2).toString());
        return res.status(429).json({
          error: 'Abuse detected',
          message: 'Suspicious activity detected. IP temporarily banned.',
          retryAfter: BAN_DURATION * 2
        });
      }
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

async function logAbuseAttempt(req, abuseType) {
  try {
    const redisClient = getRedisClient();
    if (!isRedisConnected() || !redisClient) return;

    const ip = getIpAddress(req);
    const timestamp = new Date().toISOString();
    const logKey = `abuse:log:${ip}`;
    const logEntry = JSON.stringify({ type: abuseType, timestamp });

    await redisClient.lPush(logKey, logEntry);
    await redisClient.expire(logKey, 86400);
    console.warn(`📋 Abuse logged: ${abuseType} from ${ip}`);
  } catch (error) {
    console.error('Abuse logging error:', error.message);
  }
}

async function unbanIp(ip) {
  try {
    const redisClient = getRedisClient();
    if (!isRedisConnected() || !redisClient) return false;

    const banKey = `ban:${ip}`;
    await redisClient.del(banKey);
    console.log(`✅ IP ${ip} unbanned`);
    return true;
  } catch (error) {
    console.error('Unban error:', error.message);
    return false;
  }
}

module.exports = {
  checkRateLimit,
  logAbuseAttempt,
  unbanIp,
  getIpAddress,
  getFingerprint,
  MAX_REQUESTS_PER_HOUR,
  MAX_REQUESTS_PER_DAY
};
