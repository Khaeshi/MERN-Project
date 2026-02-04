import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';  
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit'; 
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

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `windowMs`
  message: 'Too many requests, please try again later.',
});

app.use(limiter);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https://cafe-prince-menu-images.s3.amazonaws.com'],
      fontSrc: ["'self'", 'data:'],
      connectSrc: ["'self'", 'https://cafe-prince-menu-images.s3.amazonaws.com'],
    },
  },
  xFrameOptions: {action: 'deny'},
  xssProtection: {action: 'block', mode: 'block'},
  referrerPolicy: {policy: 'same-origin'},
  hsts: {maxAge: 31536000, includeSubDomains: true},
  dnsPrefetchControl: {allow: false},
  hidePoweredBy: true,
  noCache: true,
  noSniff: true,
  permittedCrossDomainPolicies: {create: false},
  crossOriginOpenerPolicy: {action: 'deny'},
  crossOriginEmbedderPolicy: {action: 'deny'},
  crossOriginResourcePolicy: {action: 'deny'},
  crossOriginResourcePolicy: {action: 'deny'},
}));

app.use(cors({
  origin: (origin, callback) => {
    // Dynamic origin validation for security
    const allowedOrigins = [process.env.CLIENT_URL, 'http://localhost:3000'];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, 
}));


app.use(express.json({limit: '10mb'}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
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