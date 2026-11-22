const express = require('express');
const router = express.Router();
const {
  submitReview,
  getReviewHistory,
  getReviewInsights,
  compareCodeReviews,
  chatFollowUp,
  getReviewById,
  deleteReview,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const { reviewLimiter, chatLimiter } = require('../middleware/rateLimiter');

// All code review routes are protected with JWT
router.use(protect);

// Collection operations
router.route('/')
  .post(reviewLimiter, submitReview)
  .get(getReviewHistory);

// Specific feature endpoints (must be defined before /:id)
router.get('/insights', getReviewInsights);
router.post('/compare', reviewLimiter, compareCodeReviews);

// Item operations and chat thread
router.post('/:id/chat', chatLimiter, chatFollowUp);

router.route('/:id')
  .get(getReviewById)
  .delete(deleteReview);

module.exports = router;
