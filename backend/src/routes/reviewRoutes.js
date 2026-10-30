import { Router } from 'express';
import { validateReviewRequest } from '../middleware/validateReview.js';
import { createCodeReview } from '../controllers/reviewController.js';

const router = Router();

// POST /api/review - Submit code snippet for pedagogical review
router.post('/', validateReviewRequest, createCodeReview);

export default router;
