import express from 'express';
const router = express.Router();
import { upload, s3 } from '../config/s3Config.js';
import { protect, admin } from '../middleware/auth.js';
import { ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';

/**
 * Get all images from S3
 */
router.get('/images', protect, admin, async (req, res) => {
  try {
    const command = new ListObjectsV2Command({
      Bucket: process.env.AWS_BUCKET_NAME,
      Prefix: 'menu-images/'
    });

    const data = await s3.send(command);
    
    const images = (data.Contents || []).map(item => ({
      key: item.Key,
      url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${item.Key}`,
      lastModified: item.LastModified,
      size: item.Size
    })).filter(img => img.key !== 'menu-images/'); 

    res.json({ images });
  } catch (error) {
    console.error('Error listing images:', error);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

/**
 * Upload single image
 */
router.post('/image', protect, admin, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    res.json({
      message: 'Image uploaded successfully',
      imageUrl: req.file.location,
      key: req.file.key
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Delete image
 */
router.delete('/image', protect, admin, async (req, res) => {
  try {
    const { key } = req.body;
    
    if (!key) {
      return res.status(400).json({ error: 'Image key is required' });
    }

    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key
    });

    await s3.send(command);
    
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

export default router;