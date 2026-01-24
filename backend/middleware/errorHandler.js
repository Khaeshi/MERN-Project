// middleware/errorHandler.js

export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path
  });
};

export const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export const requestLogger = (req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  next();
};