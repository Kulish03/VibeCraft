const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getCurrentUser,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

// Public authentication routes with brute-force rate limiting
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);

// Private profile route
router.get('/me', protect, getCurrentUser);

module.exports = router;
