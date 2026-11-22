const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error details in development
  if (process.env.NODE_ENV === 'development') {
    console.error(`[Error Handler] ${err.name || 'Error'}: ${err.message}`);
  }

  // Handle invalid Mongoose ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    return res.status(400).json({
      success: false,
      message,
    });
  }

  // Handle Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const message = `A user with this ${field} already exists.`;
    return res.status(409).json({
      success: false,
      message,
    });
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: messages,
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token.',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Authentication token has expired. Please log in again.',
    });
  }

  // Handle bad JSON in request body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Malformed JSON payload in request body.',
    });
  }

  const statusCode = error.statusCode || err.status || 500;
  const isProduction = process.env.NODE_ENV === 'production';
  const responseMessage =
    statusCode === 500 && isProduction
      ? 'An internal server error occurred. Please try again later.'
      : (error.message || 'Internal Server Error');

  res.status(statusCode).json({
    success: false,
    message: responseMessage,
  });
};

module.exports = errorHandler;
