import jwt from 'jsonwebtoken';
import User from '../models/user.js';

// Protect routes - verify JWT token
export const protect = async (req, res, next) => {
  try {
    let token;

    console.log('🔒 Protect middleware: Checking authorization...');
    console.log('📋 Headers:', req.headers.authorization ? 'Authorization header present' : 'No authorization header');

    // Check for token in Authorization header (for admin routes)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('🔑 Token found in Authorization header');
    }
    // Check for token in cookies (for regular auth routes)
    else if (req.cookies.token) {
      token = req.cookies.token;
      console.log('🔑 Token found in cookie');
    }

    if (!token) {
      console.log('❌ No token found');
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token'
      });
    }

    console.log('🔍 Verifying token...');
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token verified for userId:', decoded.userId);

    // Get user from token
    req.user = await User.findById(decoded.userId).select('-password');

    if (!req.user) {
      console.log('❌ User not found for userId:', decoded.userId);
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('✅ User authenticated:', req.user.email, 'Role:', req.user.role);
    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token failed',
      error: error.message
    });
  }
};

// Admin middleware - check if user is admin
export const admin = (req, res, next) => {
  console.log('👮 Admin middleware: Checking admin role...');
  console.log('👤 User role:', req.user?.role);
  
  if (req.user && req.user.role === 'admin') {
    console.log('✅ Admin access granted for:', req.user.email);
    next();
  } else {
    console.log('❌ Admin access denied. User role:', req.user?.role);
    res.status(403).json({
      success: false,
      message: 'Not authorized as admin'
    });
  }
};

/*   OPTIONAL AUTH MIDDLEWARE 
** Does NOT require authentication, but sets req.authUser if token is valid
** Perfect for pages that should be accessible to both logged-in and logged-out users
*/ 
export const optionalAuth = async (req, res, next) => {
  let token;

  try {
    
    if (req.cookies?.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // If no token, set user to null and continue
    if (!token) {
      req.authUser = null;
      return next();
    }

    // Try to verify and get user
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password -googleAccessToken -googleRefreshToken');
    
    req.authUser = user || null;
    
  } catch (error) {
    // If token verification fails, just set user to null
    // Don't throw error - this middleware should always succeed
    req.authUser = null;
  }

  next();
};

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ 
        error: 'No authentication token, access denied' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user info to request
    req.user = decoded;
    
    // Check if user is admin (optional, based on your requirements)
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Access denied. Admin privileges required.' 
      });
    }

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    res.status(500).json({ error: 'Server error during authentication' });
  }
};

export default authMiddleware;