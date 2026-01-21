// routes/auth.js
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import MenuItem from '../models/menuItem.js';

const router = express.Router();

// Middleware to verify JWT and role (using your middleware/auth.js for consistency)
import { protect, admin } from '../middleware/auth.js';

// Login
router.post('/login', async (req, res) => {
  console.log('📨 POST /api/auth/login');
  console.log('req.body:', req.body);

  const { email, password } = req.body;

  // ✅ Add validation to ensure email and password are strings (prevents bcrypt errors)
  if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ message: 'Email and password are required and must be strings' });
  }

  try {
    // ✅ Fix: Explicitly select the password field (required if model has select: false)
    const user = await User.findOne({ email }).select('+password');
    console.log('Found user:', user);  // Should now include password

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // ✅ Ensure user.password exists and is a string (DB validation)
    if (!user.password || typeof user.password !== 'string') {
      console.error('User password is invalid:', user.password);
      return res.status(500).json({ message: 'Server error: Invalid user data' });
    }

    // ✅ Compare passwords (bcrypt expects strings)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    // ✅ Fixed: Use 'name' instead of 'username' to match frontend interface
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// In routes/auth.js
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  // ✅ Enhanced validation
  if (!name || !email || !password || typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ message: 'Name, email, and password are required and must be strings' });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters long' });
  }
  // Optional: Add regex for complexity, e.g., /[A-Z]/ for uppercase

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);  // Increased salt rounds for security
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin-only: Update/Delete menu items 

export default router;