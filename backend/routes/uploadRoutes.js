import express from 'express';
const router = express.Router();
import { upload, s3 } from '../config/s3Config.js';
import { protect, admin } from '../middleware/auth.js';
import { ListObjectsV2Command, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'; // <-- Added GetObjectCommand
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'; // <-- Added for signed URL generation

/**
 * Helper function to generate a signed URL for a given S3 key
 */
const getSignedImageUrl = async (key) => { // <-- Added
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 3600 }); // 1 hour expiry
  return url;
};

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
    const contents = data.Contents || [];
    
    // const images = (data.Contents || []).map(item => ({
    //   key: item.Key,
    //   url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${item.Key}`,
    //   lastModified: item.LastModified,
    //   size: item.Size
    // })).filter(img => img.key !== 'menu-images/'); 

    // Map images to include signed URLs
    const images = await Promise.all(
      contents
        .filter(item => item.Key !== 'menu-images/') // skip folder key
        .map(async (item) => ({
          key: item.Key,
          url: await getSignedImageUrl(item.Key), // <-- Signed URL
          lastModified: item.LastModified,
          size: item.Size
        }))
    );

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