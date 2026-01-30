import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';  
import mongoose from 'mongoose';
import connectDB from './config/database.js';
import passport from './config/passport.js';
import apiRoutes from './routes/index.js';
import { requestLogger, notFoundHandler, errorHandler } from './middleware/errorHandler.js';



const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

/**
 * Middleware (in Order)
 */


app.use(cors({
  origin: process.env.CLIENT_URL || 'http://192.168.254.105:3000',  
  credentials: true, 
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(requestLogger);
app.use(passport.initialize());


/**
 * ROUTES
 */

app.get('/', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected ✅' : 'Disconnected ❌';
  
  res.json({ 
    success: true,
    message: 'Cafe API',
    database: dbStatus,
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      login: 'POST /api/auth/login',
      logout: 'POST /api/auth/logout',
      me: 'GET /api/auth/me',
      users: 'GET /api/auth/users',
      googleOAuth: 'GET /api/auth/google'
    }
  });
});
/**
 * Centralized routes
 */
app.use('/api', apiRoutes);

/**
 * Error Handling
 */
app.use(notFoundHandler);
app.use(errorHandler);

/**
 * Server start
 */
app.listen(PORT, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Client URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
  console.log(`🔐 Using JWT authentication (cookie-based)`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});


process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  process.exit(1);
});

export default app;