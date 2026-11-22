const { getAIProvider } = require('./aiProvider');
const { SYSTEM_PROMPT, buildStructuredUserPrompt } = require('./promptTemplates');

/**
 * High-level AI review service entry points
 * Delegates to the active AI Provider (defaults to OllamaProvider)
 */

const analyzeCodeWithOllama = async ({
  programmingLanguage,
  sourceCode,
  reviewMode = 'detailed',
  reviewInstructions = '',
}) => {
  const provider = getAIProvider();
  return await provider.generateReview({
    programmingLanguage,
    sourceCode,
    reviewMode,
    reviewInstructions,
  });
};

const chatFollowUpWithOllama = async ({ review, message, chatHistory = [] }) => {
  const provider = getAIProvider();
  return await provider.chatFollowUp({ review, message, chatHistory });
};

const compareCodeWithOllama = async ({ originalCode, revisedCode, originalReview, programmingLanguage }) => {
  const provider = getAIProvider();
  return await provider.compareReviews({ originalCode, revisedCode, originalReview, programmingLanguage });
};

const checkOllamaHealth = async () => {
  const provider = getAIProvider();
  return await provider.checkHealth();
};

const getOllamaBaseUrl = () => {
  const provider = getAIProvider();
  return provider.getBaseUrl ? provider.getBaseUrl() : 'http://localhost:11434';
};

const getOllamaModel = () => {
  const provider = getAIProvider();
  return provider.getModel ? provider.getModel() : 'qwen2.5-coder:7b';
};

const validateAndFormatResponse = (parsed) => {
  const provider = getAIProvider();
  return provider.validateAndNormalizeResponse(parsed);
};

module.exports = {
  analyzeCodeWithOllama,
  chatFollowUpWithOllama,
  compareCodeWithOllama,
  checkOllamaHealth,
  validateAndFormatResponse,
  buildStructuredUserPrompt,
  SYSTEM_PROMPT,
  getOllamaBaseUrl,
  getOllamaModel,
};
