//FOR TESTING

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/user.js';
import connectDB from '../config/database.js';

dotenv.config();

const createAdmin = async () => {
  try {
    await connectDB();

    const email = 'admin@example.com';
    const existing = await User.findOne({ email });
    if (existing) {
      console.log('⚠️ Admin already exists');
      process.exit(0);
    }

    const password = 'password123';
    const hashedPassword = await bcrypt.hash('password123', 10);

    const adminUser = new User({
    name: 'Test Admin',
    email: 'admin@example.com',
    password: hashedPassword,
    role: 'admin',
    createdAt: new Date(),
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully!');
    process.exit(0);

  } catch (err) {
    console.error('❌ Failed to create admin:', err);
    process.exit(1);
  }
};

createAdmin();