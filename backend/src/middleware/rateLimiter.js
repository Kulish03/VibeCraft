const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for authentication routes (login / register)
 * Protects against credential stuffing and brute-force attacks.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'test' ? 1000 : 20, // 20 attempts per window in production
  standardHeaders: true, // Return standard RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
  },
  skip: (req) => process.env.NODE_ENV === 'test',
});

/**
 * Rate limiter for AI review creation & comparison
 * Prevents denial of service and excessive local LLM resource exhaustion.
 */
const reviewLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'test' ? 1000 : 30, // 30 AI reviews per 15 min window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Review generation rate limit exceeded. Please wait a few minutes before submitting new code.',
  },
  skip: (req) => process.env.NODE_ENV === 'test',
});

/**
 * Rate limiter for follow-up AI chat messages
 */
const chatLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: process.env.NODE_ENV === 'test' ? 1000 : 50, // 50 chat messages per 10 min window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'AI chat question limit reached. Please allow a brief interval before sending more questions.',
  },
  skip: (req) => process.env.NODE_ENV === 'test',
});

module.exports = {
  authLimiter,
  reviewLimiter,
  chatLimiter,
};
