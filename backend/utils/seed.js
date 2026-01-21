// utils/seed.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';  // ✅ Added for hashing
import User from '../models/user.js';
import menuItem from '../models/menuItem.js';  // Note: Your import was 'menuItem' but model is 'MenuItem' - adjust if needed

// Load environment variables
dotenv.config();

// Sample users data (passwords will be hashed below)
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

const menuItems = [
  // Your existing data here (copy from your component)
  {
    name: 'Espresso',
    price: 120,
    image: 'https://images.unsplash.com/photo-1564676677001-92e8f1a0df30?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjBkcmluayUyMGN1cHxlbnwxfHx8fDE3Njg3ODQzMDV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Rich and bold espresso shot'
  },
  {
    name: 'Croissant',
    price: 95,
    image: 'https://images.unsplash.com/photo-1712723247648-64a03ba7c333?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXN0cnklMjBjcm9pc3NhbnR8ZW58MXx8fHwxNzY4NzI4MzYyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Buttery flaky croissant'
  },
  // ... add the rest of your items
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

    await menuItem.deleteMany();
    console.log('🗑️  Cleared existing menu items');

    // ✅ Hash passwords manually before inserting (since insertMany skips hooks)
    const hashedUsers = await Promise.all(
      users.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10)  // Hash each password
      }))
    );

    // Insert sample users with hashed passwords
    const createdUsers = await User.insertMany(hashedUsers);
    console.log(`✅ Created ${createdUsers.length} users with hashed passwords`);

    const createdMenuItems = await menuItem.insertMany(menuItems);
    console.log('✅ Menu items seeded successfully!');

    console.log('\n📊 Seeded Users:');
    createdUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.email}) - ${user.role}`);
    });

    console.log('\n📊 Seeded Items:');
    createdMenuItems.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.name} (₱${item.price}) - ${item.description}`);
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

    await menuItem.deleteMany();
    console.log('✅ All menu items deleted');

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