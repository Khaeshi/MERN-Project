import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      minlength: 3,
      maxlength: 50
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    password: {
      type: String,
      required: function() {
        // Password required only for admin/traditional login
        return this.role === 'admin' || !this.googleId;
      },
      minlength: 6,
      select: false
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'staff'],
      default: 'user'
    },
    phone: {
      type: String,
      trim: true
    },
    // OAuth fields
    googleId: { 
      type: String, 
      sparse: true
    },
    authProvider: {
      type: String,
      enum: ['local', 'google', 'github'],
      default: 'local'
    },
    profilePicture: String,
    displayName: String,
    googleRefreshToken: {
      type: String,
      select: false
    },
    googleAccessToken: {
      type: String,
      select: false
    },
    tokenExpiry: {
      type: Date,
      select: false
    }
  },
  {
    timestamps: true
  }
);

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ googleId: 1 }, { sparse: true });

/*  NO PRE-SAVE HOOK 
** We hash passwords manually in the auth routes
** This prevents conflicts with OAuth user creation
*/

// Instance methods
userSchema.methods.comparePassword = async function(enteredPassword) {
  if (!this.password) {
    throw new Error('User does not have a password (OAuth account)');
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.isTokenExpired = function() {
  if (!this.tokenExpiry) return true;
  return new Date() >= new Date(this.tokenExpiry);
};

const User = mongoose.model('User', userSchema);

export default User;