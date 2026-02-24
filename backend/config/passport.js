import dotenv from 'dotenv';
dotenv.config();

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/user.js';

console.log('🔧 Passport configuration loading...');
console.log('Google Client ID:', process.env.GOOGLECLIENTID ? 'SET' : 'NOT SET');
console.log('Google Client Secret:', process.env.GOOGLECLIENTSECRET ? 'SET' : 'NOT SET');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLECLIENTID,
    clientSecret: process.env.GOOGLECLIENTSECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    proxy: true,
    accessType: 'offline',  
    prompt: 'select_account consent'       
  },
  async (accessToken, refreshToken, profile, done) => {
    console.log('🔐 Google Strategy callback triggered');
    console.log('Profile ID:', profile.id);
    console.log('Profile Email:', profile.emails?.[0]?.value);
    
    try {
      console.log('📝 Google OAuth callback received');
      console.log('Access Token:', accessToken ? 'Received' : 'Not received');
      console.log('Refresh Token:', refreshToken ? 'Received' : 'Not received');
      
      // Calculate token expiry (Google access tokens typically last 1 hour)
      const tokenExpiry = new Date(Date.now() + 3600 * 1000);
      
      // Check if user already exists with this Google ID
      let user = await User.findOne({ googleId: profile.id });
      
      if (user) {
        console.log('✅ Existing user found:', user.email);
        user.googleAccessToken = accessToken;
        if (refreshToken) {
          user.googleRefreshToken = refreshToken;
        }
        user.tokenExpiry = tokenExpiry;
        user.profilePicture = profile.photos?.[0]?.value;
        await user.save();
        console.log('✅ User updated, calling done()');
        return done(null, user);
      }
      
      // Check if email already exists (merge accounts)
      user = await User.findOne({ email: profile.emails[0].value });
      
      if (user) {
        console.log('✅ Email exists, linking Google account:', user.email);
        user.googleId = profile.id;
        user.authProvider = 'google';
        user.profilePicture = profile.photos?.[0]?.value;
        user.googleAccessToken = accessToken;
        if (refreshToken) {
          user.googleRefreshToken = refreshToken;
        }
        user.tokenExpiry = tokenExpiry;
        await user.save();
        console.log('✅ Account linked, calling done()');
        return done(null, user);
      }
      
      // Create new user with tokens
      console.log('✅ Creating new user with Google OAuth');
      user = await User.create({
        googleId: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName,
        displayName: profile.displayName,
        profilePicture: profile.photos?.[0]?.value,
        authProvider: 'google',
        googleAccessToken: accessToken,
        googleRefreshToken: refreshToken,
        tokenExpiry: tokenExpiry
      });
      
      console.log('✅ New user created:', user.email);
      console.log('✅ Calling done() with user');
      done(null, user);
    } catch (err) {
      console.error('❌ Google OAuth error:', err);
      console.error('Error stack:', err.stack);
      done(err, null);
    }
  }
));

passport.serializeUser((user, done) => {
  console.log('📦 Serializing user:', user.id);
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  console.log('📦 Deserializing user:', id);
  try {
    const user = await User.findById(id);
    console.log('✅ User deserialized:', user?.email);
    done(null, user);
  } catch (err) {
    console.error('❌ Deserialization error:', err);
    done(err, null);
  }
});

console.log('✅ Passport configuration complete');

export default passport;