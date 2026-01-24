import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';


const router = express.Router();

// Middleware to verify JWT and role
import { protect, admin } from '../middleware/auth.js';

// Helper function to set token cookie
const setTokenCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,  // Prevents XSS attacks
    secure: process.env.NODE_ENV === 'production',  // HTTPS only in production
    sameSite: 'strict',  // CSRF protection
    maxAge: 30 * 24 * 60 * 60 * 1000,  // 30 days (adjust as needed)
  });
};

// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  console.log('📝 Registration attempt...');
  console.log('req.body:', req.body);

  const { name, email, password, phone } = req.body;

  // Enhanced validation
  if (!name || !email || !password) {
    return res.status(400).json({ 
      success: false,
      message: 'Name, email, and password are required' 
    });
  }

  if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ 
      success: false,
      message: 'Name, email, and password must be strings' 
    });
  }

  if (password.length < 8) {
    return res.status(400).json({ 
      success: false,
      message: 'Password must be at least 8 characters long' 
    });
  }

  try {
    // Check if user already exists
    console.log('🔍 Checking if user exists...');
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      console.log('❌ User already exists:', email);
      return res.status(400).json({ 
        success: false,
        message: 'User already exists with this email' 
      });
    }

    // Hash password and create user
    console.log('➕ Creating new user...');
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({ name, email, password: hashedPassword, phone });
    await user.save();

    console.log('✅ User created successfully!');
    console.log('User ID:', user._id);

    // Generate token and set cookie
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '30d' }
    );
    setTokenCookie(res, token);

    // ✅ REMOVED: token from response body (now in cookie)
    res.status(201).json({ 
      success: true,
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });

  } catch (err) {
    console.error('❌ Registration error:', err);
    
    // Handle duplicate key error
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Handle validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({ 
      success: false,
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  console.log('🔐 Login attempt...');
  console.log('req.body:', req.body);

  const { email, password } = req.body;

  // Validation
  if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ 
      success: false,
      message: 'Email and password are required and must be strings' 
    });
  }

  try {
    // Find user and explicitly select password field
    console.log('🔍 Finding user...');
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    // Ensure password exists and is valid
    if (!user.password || typeof user.password !== 'string') {
      console.error('User password is invalid:', user.password);
      return res.status(500).json({ 
        success: false,
        message: 'Server error: Invalid user data' 
      });
    }

    // Compare passwords
    console.log('🔐 Checking password...');
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      console.log('❌ Invalid password');
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    console.log('✅ Login successful!');

    // Generate token and set cookie
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '30d' }
    );
    setTokenCookie(res, token);

    // ✅ REMOVED: token from response body (now in cookie)
    res.json({ 
      success: true,
      message: 'Login successful',
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      } 
    });

  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// @route   POST /api/auth/logout
// @access  Public
router.post('/logout', (req, res) => {
  try {
    console.log('👋 Logout attempt...');
    
    // Clear the token cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    console.log('✅ Logged out successfully');
    
    res.json({ 
      success: true,
      message: 'Logged out successfully' 
    });
  } catch (err) {
    console.error('❌ Logout error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error during logout' 
    });
  }
});

// @route   GET /api/auth/me
// @access  Private (requires authentication)
router.get('/me', protect, async (req, res) => {
  try {
    console.log('👤 Get current user...');
    
    // req.user is set by the protect middleware
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (err) {
    console.error('❌ Get me error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/auth/users
// @access  Public (change to protected later)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    
    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

export default router;