import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/database.js'
import authRoutes from './routes/auth.js'
import users from './models/users.js'

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI,{dbName: "mern_db"})
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error(err));

// API Routes
app.use('/api/auth', authRoutes);
// app.use('/api/cofee', coffeeRoutes);

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Server is ready' })
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));