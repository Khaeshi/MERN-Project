import express from 'express';
import { google } from 'googleapis';
import User from '../models/user.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

/*   
** Helper function to refresh access token if expired
*/
async function getValidAccessToken(user) {
  // Check if token is expired or about to expire (within 5 minutes)
  const isExpired = !user.tokenExpiry || new Date(user.tokenExpiry) <= new Date(Date.now() + 5 * 60 * 1000);
  
  if (isExpired && user.googleRefreshToken) {
    console.log('🔄 Access token expired, refreshing...');
    
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    
    oauth2Client.setCredentials({
      refresh_token: user.googleRefreshToken
    });
    
    try {
      const { credentials } = await oauth2Client.refreshAccessToken();
      
      // Update user with new token
      user.googleAccessToken = credentials.access_token;
      user.tokenExpiry = new Date(credentials.expiry_date);
      await user.save();
      
      console.log('✅ Access token refreshed');
      return credentials.access_token;
    } catch (err) {
      console.error('❌ Token refresh failed:', err);
      throw new Error('Failed to refresh access token');
    }
  }
  
  return user.googleAccessToken;
}

/*
** GET /gmail/profile
** Get user's Gmail profile
*/ 
router.get('/gmail/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('+googleAccessToken +googleRefreshToken');
    
    if (!user.googleAccessToken) {
      return res.status(400).json({
        success: false,
        message: 'User not authenticated with Google'
      });
    }
    
    // Get valid access token (refresh if needed)
    const accessToken = await getValidAccessToken(user);
    
    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    
    // Get Gmail API
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    
    // Get user's Gmail profile
    const profile = await gmail.users.getProfile({ userId: 'me' });
    
    res.json({
      success: true,
      data: profile.data
    });
    
  } catch (err) {
    console.error('Gmail API error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Gmail profile'
    });
  }
});

export default router;