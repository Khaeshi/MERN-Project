// utils/seed.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/user.js';

// Load environment variables
dotenv.config();

// Sample users data
const users = [
  {
    name: 'Admin User',
    email: 'admin@musicschool.com',
    password: 'admin123',
    role: 'admin',
    phone: '1234567890'
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'user',
    phone: '0987654321'
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
    role: 'user',
    phone: '5555555555'
  },
  {
    name: 'Bob Johnson',
    email: 'bob@example.com',
    password: 'password123',
    role: 'user',
    phone: '4444444444'
  },
  {
    name: 'Alice Brown',
    email: 'alice@example.com',
    password: 'password123',
    role: 'user',
    phone: '3333333333'
  }
];

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

// Import (seed) data
const importData = async () => {
  try {
    console.log('🌱 Starting seed process...');
    
    // Clear existing data
    await User.deleteMany();
    console.log('🗑️  Cleared existing users');

    // Insert sample users
    const createdUsers = await User.insertMany(users);
    console.log(`✅ Created ${createdUsers.length} users`);

    console.log('\n📊 Seeded Users:');
    createdUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.email}) - ${user.role}`);
    });

    console.log('\n🎉 Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed Error:', error.message);
    process.exit(1);
  }
};

// Destroy (delete) data
const destroyData = async () => {
  try {
    console.log('🗑️  Destroying data...');
    
    await User.deleteMany();
    console.log('✅ All users deleted');

    console.log('🎉 Data destroyed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Destroy Error:', error.message);
    process.exit(1);
  }
};

// Run based on command line argument
if (process.argv[2] === '-d') {
  await connectDB();
  await destroyData();
} else {
  await connectDB();
  await importData();
}