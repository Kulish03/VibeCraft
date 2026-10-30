import { generateCodeReview } from '../services/reviewService.js';

/**
 * Controller to handle POST /api/review
 */
export async function createCodeReview(req, res, next) {
  try {
    const { code, language } = req.validatedReview;

    const result = await generateCodeReview({ code, language });

    return res.status(200).json({
      success: true,
      data: result.review,
      meta: result.meta
    });
  } catch (error) {
    // Forward unexpected errors to centralized error handling middleware
    next(error);
  }
}
