import express from 'express';
import authRoutes from './auth.js';
import menuRoutes from './menu.js';
import adminRoutes from  './admin.js';
import uploadRoutes from './uploadRoutes.js'

const router = express.Router();

// Mount all routes
router.use('/auth', authRoutes);
router.use('/menu', menuRoutes);
router.use('/admin', adminRoutes);
router.use('/upload', uploadRoutes);

export default router;