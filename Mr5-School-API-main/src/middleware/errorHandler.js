export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const errorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  } else {
    console.error(err.message || 'Internal Server Error');
  }

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered';
  }

  if (
    message.includes('before initial connection is complete') ||
    message.includes('bufferCommands = false')
  ) {
    statusCode = 503;
    message = 'Database is starting up. Please try again in a few seconds.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    error: message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};
