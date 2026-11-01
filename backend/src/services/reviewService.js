import { getOpenAiReview } from './openAiProvider.js';

/**
 * Review Service Layer
 * Uses OpenAI (or other provider) to generate code review.
 */
export async function generateCodeReview({ code, language }) {
  // Calculate meta info
  const lineCount = code.split('\\n').length;
  const codeLength = code.length;

  // Call the AI provider (throws on error)
  const reviewResult = await getOpenAiReview(code, language);

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
      isMock: false,
      engine: 'openai-gpt-4o-mini',
      reviewedAt: new Date().toISOString()
    }
  };
}

