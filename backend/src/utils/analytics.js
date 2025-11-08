const events = {
  summarizeButtonClicked: 'summarize_button_clicked',
  linkedinUrlTransformed: 'linkedin_url_transformed',
  summaryGenerated: 'summary_generated',
  scrapingFailed: 'scraping_failed',
  rateLimited: 'rate_limited',
  cacheHit: 'cache_hit',
  cacheMiss: 'cache_miss',
  summaryApiCalled: 'summary_api_called'
};

const analytics = {
  trackEvent(eventName, data = {}) {
    const timestamp = new Date().toISOString();
    const eventData = {
      event: eventName,
      timestamp,
      ...data
    };

    console.log(`📊 [ANALYTICS] ${eventName}:`, eventData);

    try {
      if (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') {
        logToVercelAnalytics(eventName, eventData);
      }
    } catch (error) {
      console.error('Analytics tracking error:', error.message);
    }
  },

  trackSummarizeClick(ipAddress, userAgent) {
    this.trackEvent(events.summarizeButtonClicked, {
      ip: ipAddress,
      userAgent: userAgent,
      timestamp: new Date().toISOString()
    });
  },

  trackUrlTransformation(url, success, domain, characterCount = 0) {
    this.trackEvent(events.linkedinUrlTransformed, {
      url: url,
      success: success,
      domain: domain,
      characterCount: characterCount,
      timestamp: new Date().toISOString()
    });
  },

  trackSummaryGenerated(url, summaryLength, modelUsed, timeMs) {
    this.trackEvent(events.summaryGenerated, {
      url: url,
      summaryLength: summaryLength,
      modelUsed: modelUsed,
      processingTimeMs: timeMs,
      timestamp: new Date().toISOString()
    });
  },

  trackScrapingFailed(url, reason) {
    this.trackEvent(events.scrapingFailed, {
      url: url,
      reason: reason,
      timestamp: new Date().toISOString()
    });
  },

  trackRateLimited(ipAddress, limitType) {
    this.trackEvent(events.rateLimited, {
      ip: ipAddress,
      limitType: limitType,
      timestamp: new Date().toISOString()
    });
  },

  trackCacheHit(cacheKey, hitType = 'scrape') {
    this.trackEvent(events.cacheHit, {
      cacheKey: cacheKey,
      hitType: hitType,
      timestamp: new Date().toISOString()
    });
  },

  trackCacheMiss(cacheKey, missType = 'scrape') {
    this.trackEvent(events.cacheMiss, {
      cacheKey: cacheKey,
      missType: missType,
      timestamp: new Date().toISOString()
    });
  },

  trackApiCall(endpoint, statusCode, responseTimeMs) {
    this.trackEvent(events.summaryApiCalled, {
      endpoint: endpoint,
      statusCode: statusCode,
      responseTimeMs: responseTimeMs,
      timestamp: new Date().toISOString()
    });
  }
};

function logToVercelAnalytics(eventName, eventData) {
  try {
    const analyticsPayload = {
      dsn: process.env.VERCEL_ANALYTICS_ID || '',
      pathname: '/api/summarize',
      event: eventName,
      properties: eventData
    };

    console.log('✅ Queued for Vercel Analytics:', analyticsPayload);
  } catch (error) {
    console.error('Failed to log to Vercel Analytics:', error.message);
  }
}

module.exports = analytics;
