/**
 * Centralized Error-Handling Middleware
 * 
 * Protects clients from server stack traces, database credentials,
 * or raw runtime paths while returning clean, predictable JSON errors.
 */
export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  // 1. Handle JSON parse errors from express.json()
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MALFORMED_JSON',
        message: 'Invalid JSON payload received. Please verify syntax in the request body.'
      }
    });
  }

  // 2. Handle body-parser / express.json payload size exceeded errors
  if (err.type === 'entity.too.large' || err.status === 413) {
    return res.status(413).json({
      success: false,
      error: {
        code: 'PAYLOAD_TOO_LARGE',
        message: 'Request payload exceeds the maximum allowed network threshold.'
      }
    });
  }

  // 3. Determine status code (default to 500 for unhandled internal errors)
  const statusCode = typeof err.statusCode === 'number'
    ? err.statusCode
    : typeof err.status === 'number'
      ? err.status
      : 500;

  // Log error internally on the server for debugging (never exposed to client)
  if (statusCode >= 500) {
    console.error(`[Server Error ${new Date().toISOString()}] ${req.method} ${req.originalUrl}:`, err.message);
  }

  // 4. Safe user-facing response - strictly NO stack traces or internals sent to clients
  const userSafeMessage = statusCode >= 500
    ? 'An unexpected error occurred on the server. Please try again later.'
    : err.message || 'The request could not be processed.';

  return res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || (statusCode >= 500 ? 'INTERNAL_SERVER_ERROR' : 'REQUEST_ERROR'),
      message: userSafeMessage
    }
  });
}
