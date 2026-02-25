import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.js'; 
import { protect, admin } from '../middleware/auth.js';
import generateToken from '../utils/generateToken.js'

const router = express.Router();

/** 
** @route   POST /api/admin/auth/login
*/
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('📥 Login attempt:', { email, hasPassword: !!password });

    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and password are required' 
      });
    }

    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    console.log('✅ User found:', user.email, 'Has password:', !!user.password);

    if (user.role !== 'admin') {
      console.log('❌ User is not admin:', user.role);
      return res.status(403).json({ 
        success: false,
        message: 'Access denied. Admin privileges required.' 
      });
    }

    if (!user.password) {
      console.log('❌ User has no password (OAuth account?)');
      return res.status(401).json({ 
        success: false,
        message: 'Invalid login method. Please use OAuth.' 
      });
    }

    console.log('🔍 Comparing passwords...');
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      console.log('❌ Invalid password');
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    console.log('✅ Password valid, generating token...');

    const token = generateToken(user._id, user.role);

    console.log('✅ Login successful for:', user.email);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('❌ Admin login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during login' 
    });
  }
});

/**
** @route   GET /api/admin/auth/verify
** @desc    Verify admin token and return user details
** @access  Private (requires admin token)
*/
router.get('/auth/verify', protect, admin, async (req, res) => {
  try {
    console.log('✅ Admin verify success for:', req.user.email);
    
    res.json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
    });
  } catch (error) {
    console.error('❌ Admin verify error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during verification' 
    });
  }
});


/**   
 *  @route   GET /api/admin/users
 *  @desc    Get all users
 *  @access  Private (Admin)
 */ 
router.get('/users', protect, admin, async (req, res) => {
  try {
    console.log('📋 Fetching all users...');
    
    const users = await User.find()
      .select('-password')  // Don't send passwords
      .sort({ createdAt: -1 });  // Newest first

    console.log(`✅ Found ${users.length} users`);

    res.json(users);
  } catch (error) {
    console.error('❌ Fetch users error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error fetching users' 
    });
  }
});

/**  
 * @route   PUT /api/admin/users/:id
 * @desc    Update user role
 * @access  Private (Admin)
 */
router.put('/users/:id', protect, admin, async (req, res) => {
  try {
    const { role } = req.body;
    const userId = req.params.id;

    console.log(`📝 Updating user ${userId} to role: ${role}`);

    // Prevent admin from demoting themselves
    if (userId === req.user._id.toString() && role !== 'admin') {
      return res.status(400).json({ 
        success: false,
        message: 'Cannot change your own admin role' 
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    console.log(`✅ User ${userId} role updated to ${role}`);

    res.json(user);
  } catch (error) {
    console.error('❌ Update user error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error updating user' 
    });
  }
});

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete user
 * @access  Private (Admin)
 */
router.delete('/users/:id', protect, admin, async (req, res) => {
  try {
    const userId = req.params.id;

    console.log(`🗑️ Attempting to delete user ${userId}`);

    // Prevent admin from deleting themselves
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ 
        success: false,
        message: 'Cannot delete your own account' 
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Prevent deleting other admins
    if (user.role === 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Cannot delete admin accounts' 
      });
    }

    await User.findByIdAndDelete(userId);

    console.log(`✅ User ${userId} deleted successfully`);

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('❌ Delete user error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error deleting user' 
    });
  }
});

export default router;