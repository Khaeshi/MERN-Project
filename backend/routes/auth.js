import express from 'express';
import bcrypt from 'bcryptjs';
import passport from 'passport';
import User from '../models/user.js';
import { protect, admin, optionalAuth } from '../middleware/auth.js';
import generateToken from '../utils/generateToken.js';

const router = express.Router();

/* 
** HELPER FUNCTION
*/
const setTokenCookie = (res, token) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: '/',
  };
  
  console.log('🍪 Setting cookie with options:', cookieOptions);
  res.cookie('token', token, cookieOptions);
  console.log('🍪 Cookie set successfully');
};


/*   
** @route   POST /api/auth/login
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
        message: `This account was created using ${user.authProvider}. Please sign in with ${user.authProvider}.`
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

/*   
** @route   POST /api/auth/logout
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

/*   
** USER INFO ROUTES
** @route   GET /api/auth/me
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

router.get('/users', protect, admin, async (req, res) => {
  try {
    const users = await User.find().select('-password -googleAccessToken -googleRefreshToken');
    
    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/*   
** GOOGLE OAUTH ROUTES
** @route   GET /google/profile
*/
router.get('/google', (req, res, next) => {
  const prompt = req.query.prompt || 'consent';
  
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: prompt,
    session: false
  })(req, res, next);
});

/*   
** @route   GET /google/callback
*/
router.get('/google/callback',
  (req, res, next) => {
    console.log('📨 GET /api/auth/google/callback - ENTRY POINT');
    console.log('Query params:', req.query);
    console.log('Headers:', req.headers);
    next();
  },
  passport.authenticate('google', { 
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/?error=oauth_failed`
  }),
  (req, res) => {
    console.log('📨 Inside final callback handler');
    console.log('Response headers sent?', res.headersSent);
    
    try {
      console.log('✅ Google OAuth successful, generating JWT...');
      
      if (!req.user) {
        console.error('❌ No user found in req.user');
        console.log('Redirecting to:', `${process.env.CLIENT_URL}/?error=no_user`);
        return res.redirect(`${process.env.CLIENT_URL}/?error=no_user`);
      }
      
      console.log('✅ User found:', {
        id: req.user._id,
        email: req.user.email,
        name: req.user.name
      });
      
      // Generate token
      console.log('🔑 Generating token...');
      const token = generateToken(req.user._id);
      console.log('🔑 Token generated:', token ? 'YES' : 'NO');
      
      // Set cookie
      console.log('🍪 Setting cookie...');
      setTokenCookie(res, token);
      
      const redirectUrl = `${process.env.CLIENT_URL}/success`;
      console.log('🚀 About to redirect to:', redirectUrl);
      console.log('CLIENT_URL env var:', process.env.CLIENT_URL);
      
      // Check if headers already sent
      if (res.headersSent) {
        console.error('❌ Headers already sent! Cannot redirect.');
        return;
      }
      
      console.log('✅ Calling res.redirect()...');
      res.redirect(redirectUrl);
      console.log('✅ res.redirect() called');
      
    } catch (err) {
      console.error('❌ OAuth callback error:', err);
      console.error('Error stack:', err.stack);
      
      if (!res.headersSent) {
        res.redirect(`${process.env.CLIENT_URL}/?error=server_error`);
      }
    }
  }
);

export default router;