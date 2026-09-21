const RateLimit = require('../models/RateLimit');

/**
 * Serverless-safe MongoDB rate limiter middleware generator.
 * @param {Object} options
 * @param {string} options.prefix - Key namespace (e.g. 'login_ip', 'login_email')
 * @param {number} options.max - Maximum requests allowed within window
 * @param {number} options.windowSec - Window in seconds
 * @param {string} options.message - Friendly message on 429
 * @param {Function} [options.keyGenerator] - Custom key generator function (req) => string
 */
const mongoRateLimit = ({ prefix, max, windowSec, message, keyGenerator }) => {
  return async (req, res, next) => {
    try {
      const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown_ip';
      let identifier = clientIp;

      if (keyGenerator) {
        const customId = keyGenerator(req);
        if (customId) {
          identifier = customId;
        }
      }

      const key = `${prefix}:${identifier}`;
      const now = new Date();
      const windowStart = new Date(now.getTime() - windowSec * 1000);

      // Find or create record
      const record = await RateLimit.findOne({ key, createdAt: { $gte: windowStart } });

      if (!record) {
        // First request in this window
        await RateLimit.create({ key, count: 1, createdAt: now });
        return next();
      }

      if (record.count >= max) {
        return res.status(429).json({
          success: false,
          message: message || 'Too many requests. Please slow down and try again later.'
        });
      }

      // Increment count
      record.count += 1;
      await record.save();
      return next();
    } catch (error) {
      console.warn(`[RATE LIMIT ERROR] Non-fatal limiter error: ${error.message}`);
      // Fail open so users aren't blocked on rate-limiter db errors
      return next();
    }
  };
};

/**
 * Honeypot middleware - rejects bot requests silently if hidden 'website' field is populated
 */
const checkHoneypot = (req, res, next) => {
  if (req.body && req.body.website && String(req.body.website).trim() !== '') {
    console.warn(`[HONEYPOT] Spambot detected and rejected from IP ${req.ip}`);
    // Return standard success to fool the bot without doing actual work
    return res.status(200).json({
      success: true,
      message: 'Request processed successfully.'
    });
  }
  next();
};

module.exports = {
  mongoRateLimit,
  checkHoneypot
};
