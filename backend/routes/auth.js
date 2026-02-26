import express from 'express';
import bcrypt from 'bcryptjs';
import passport from 'passport';
import User from '../models/user.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import generateToken from '../utils/generateToken.js';

const router = express.Router();

const setTokenCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: '/',
  });
};

/**
 * @route  POST /api/auth/login
 * @access Public
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  try {
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: `This account uses ${user.authProvider}. Please sign in with ${user.authProvider}.`
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = generateToken(user._id, user.role);
    setTokenCookie(res, token);

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        authProvider: user.authProvider,
        profilePicture: user.profilePicture
      }
    });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

/**
 * @route  POST /api/auth/logout
 * @access Public
 */
router.post('/logout', (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
    });

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

/**
 * @route  GET /api/auth/me
 * @access Public (optional auth)
 */
router.get('/me', optionalAuth, (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: req.authUser || null,
    });
  } catch (err) {
    console.error('❌ Error in /me route:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      user: null
    });
  }
});

/**
 * @route  GET /api/auth/google
 * @access Public
 */
router.get('/google', (req, res, next) => {
  const prompt = req.query.prompt || 'consent';
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt,
    session: false
  })(req, res, next);
});

/**
 * @route  GET /api/auth/google/callback
 * @access Public
 */
router.get('/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/?error=oauth_failed`
  }),
  (req, res) => {
    try {
      if (!req.user) {
        return res.redirect(`${process.env.CLIENT_URL}/?error=no_user`);
      }

      const token = generateToken(req.user._id, req.user.role);
      setTokenCookie(res, token);
      res.redirect(`${process.env.CLIENT_URL}/success`);
    } catch (err) {
      console.error('❌ OAuth callback error:', err);
      if (!res.headersSent) {
        res.redirect(`${process.env.CLIENT_URL}/?error=server_error`);
      }
    }
  }
);

export default router;