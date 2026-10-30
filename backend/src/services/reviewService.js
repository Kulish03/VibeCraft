import { getMockReview } from './mockReviewEngine.js';

/**
 * Review Service Layer
 * 
 * NOTE FOR NEXT STEP (AI INTEGRATION):
 * This service acts as the isolated abstraction layer between the HTTP controller
 * and the review generation engine. To integrate Google Gemini or OpenAI in the next step,
 * simply implement the AI provider call inside this module without altering the controller,
 * validation middleware, or client response schema.
 */

export async function generateCodeReview({ code, language }) {
  // Line count and character count calculation
  const lineCount = code.split('\n').length;
  const codeLength = code.length;

  // Currently returns structured, pedagogical mock feedback
  const reviewResult = getMockReview(code, language);

  return {
    review: {
      summary: reviewResult.summary,
      issues: reviewResult.issues || [],
      explanation: reviewResult.explanation,
      hints: reviewResult.hints || [],
      improvedCode: reviewResult.improvedCode || '',
      takeaways: reviewResult.takeaways || []
    },
    meta: {
      language,
      codeLength,
      lineCount,
      isMock: true,
      engine: 'mock-pedagogical-v1',
      reviewedAt: new Date().toISOString()
    }
  };
}
