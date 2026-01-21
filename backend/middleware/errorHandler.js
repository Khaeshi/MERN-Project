// ... existing code ...

// 404 handler
app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: 'Route not found',
      path: req.path
    });
  });
  
  // Error handler (catch-all for unhandled errors)
  app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err);
    
    // Default error response
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })  // Show stack in dev
    });
  });
  
  // ... existing code ...