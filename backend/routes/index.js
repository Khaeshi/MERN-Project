import express from 'express';
import authRoutes from './auth.js';
import menuRoutes from './menu.js';

const router = express.Router();

// Mount all routes
router.use('/auth', authRoutes);
router.use('/menu', menuRoutes);

export default router;