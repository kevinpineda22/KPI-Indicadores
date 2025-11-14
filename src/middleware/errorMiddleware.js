const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Agregar más tipos de errores específicos de Supabase y validación
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Supabase specific errors
  if (err.code) {
    switch (err.code) {
      case '23505': // Unique violation
        statusCode = 409;
        message = 'Resource already exists';
        break;
      case '23503': // Foreign key violation
        statusCode = 400;
        message = 'Invalid reference';
        break;
      case '23502': // Not null violation
        statusCode = 400;
        message = 'Required field missing';
        break;
      case 'PGRST116': // Supabase row not found
        statusCode = 404;
        message = 'Resource not found';
        break;
      case 'PGRST106': // Supabase table not found
        statusCode = 500;
        message = 'Database table not found';
        break;
      case '42501': // Insufficient privilege
        statusCode = 403;
        message = 'Access denied';
        break;
      default:
        statusCode = 400;
    }
  }

  // Supabase auth errors
  if (err.message && err.message.includes('Invalid API key')) {
    statusCode = 500;
    message = 'Database configuration error';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Validation errors from Joi
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
  }

  // Joi validation errors específicos
  if (err.isJoi || (err.details && Array.isArray(err.details))) {
    statusCode = 400;
    message = 'Validation failed';

    if (process.env.NODE_ENV === 'development') {
      console.error('Validation errors:', err.details);
    }

    return res.status(statusCode).json({
      success: false,
      message,
      errors: err.details ? err.details.map(detail => detail.message) : [err.message],
      timestamp: new Date().toISOString()
    });
  }

  // CORS errors
  if (err.message && err.message.includes('CORS')) {
    statusCode = 403;
    message = 'CORS policy violation';
  }

  // Log error for debugging (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.error('Error Stack:', err.stack);
    console.error('Request Origin:', req.get('origin'));
    console.error('Request Method:', req.method);
    console.error('Request URL:', req.originalUrl);
  }

  // Asegurar headers CORS en respuestas de error
  const origin = req.get('origin');
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    process.env.FRONTEND_URL
  ].filter(Boolean);

  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
    timestamp: new Date().toISOString()
  });
};

export {
  notFound,
  errorHandler
};
