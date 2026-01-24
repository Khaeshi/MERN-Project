import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';  
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/database.js';
import apiRoutes from './routes/index.js';
import { requestLogger, notFoundHandler, errorHandler } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

// Initialize express
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Configure CORS to allow credentials
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',  
  credentials: true,  
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());  
app.use(requestLogger);

// Root route
app.get('/', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected ✅' : 'Disconnected ❌';
  
  res.json({ 
    success: true,
    message: 'Cafe API',
    database: dbStatus,
    endpoints: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      logout: 'POST /api/auth/logout',
      me: 'GET /api/auth/me',
      users: 'GET /api/auth/users'
    }
  });
});

app.use('/api', apiRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});