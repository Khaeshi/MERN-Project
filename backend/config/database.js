import mongoose from 'mongoose';

const connectDB = async () => {
  try {
   const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log('✅ MongoDB Connected Successfully!');
    console.log(`📦 Host: ${conn.connection.host}`);
    console.log(`🗄️  Database: ${conn.connection.name}`);
    console.log(`🔌 Port: ${conn.connection.port}`);
    console.log(`📊 Collections: ${Object.keys(conn.connection.collections).join(', ') || 'None yet'}`);

  } catch (error) {
    console.error('❌ MongoDB Connection FAILED:');
    console.error('Error:', error.message);
    
    if (error.message.includes('authentication')) {
      console.error('💡 TIP: Check your username and password in .env');
    }
    if (error.message.includes('ENOTFOUND')) {
      console.error('💡 TIP: Check your MongoDB URI format');
    }
    
    process.exit(1);
  }
};

export default connectDB;