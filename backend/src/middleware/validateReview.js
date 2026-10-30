import {
  SUPPORTED_LANGUAGES,
  LANGUAGE_ALIASES,
  MAX_CODE_LENGTH
} from '../constants/languages.js';

/**
 * Middleware to validate and normalize POST /api/review request payload.
 */
export function validateReviewRequest(req, res, next) {
  const { code, language } = req.body || {};

  // 1. Verify body presence
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_BODY',
        message: 'Request body must be a valid JSON object containing "code" and "language".'
      }
    });
  }

  // 2. Validate "code" field existence and type
  if (code === undefined || code === null) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_CODE',
        message: 'Field "code" is required.'
      }
    });
  }

  if (typeof code !== 'string') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_CODE_TYPE',
        message: 'Field "code" must be a string.'
      }
    });
  }

  // 3. Reject empty or whitespace-only code
  if (code.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'EMPTY_CODE',
        message: 'Field "code" cannot be empty or contain only whitespace.'
      }
    });
  }

  // 4. Enforce maximum code size limit
  if (code.length > MAX_CODE_LENGTH) {
    return res.status(413).json({
      success: false,
      error: {
        code: 'CODE_TOO_LARGE',
        message: `Code snippet exceeds the maximum allowed length of ${MAX_CODE_LENGTH} characters (received ${code.length}).`
      }
    });
  }

  // 5. Validate "language" field existence and type
  if (language === undefined || language === null) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_LANGUAGE',
        message: 'Field "language" is required.'
      }
    });
  }

  if (typeof language !== 'string') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_LANGUAGE_TYPE',
        message: 'Field "language" must be a string.'
      }
    });
  }

  if (language.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'EMPTY_LANGUAGE',
        message: 'Field "language" cannot be empty.'
      }
    });
  }

  // 6. Normalize and validate language name
  const rawLangKey = language.trim().toLowerCase();
  const normalizedLanguage = LANGUAGE_ALIASES[rawLangKey];

  if (!normalizedLanguage) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'UNSUPPORTED_LANGUAGE',
        message: `Unsupported language "${language}". Supported languages are: ${SUPPORTED_LANGUAGES.join(', ')}.`,
        supportedLanguages: SUPPORTED_LANGUAGES
      }
    });
  }

  // Attach sanitized and normalized payload to request object
  req.validatedReview = {
    code,
    language: normalizedLanguage,
    rawLanguageInput: language
  };

  next();
}
