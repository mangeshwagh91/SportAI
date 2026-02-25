const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxLength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minLength: [6, 'Password must be at least 6 characters']
  },
  chNo: {
    type: String,
    trim: true,
    sparse: true,
    index: true,
    alias: 'chestNumber'
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  // Direct profile fields
  age: Number,
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  profilePhoto: String,
  height: Number,
  weight: Number,
  bmi: Number,
  favouriteSport: String,
  playingSport: {
    type: Boolean,
    default: false
  },
  bio: {
    type: String,
    maxLength: [500, 'Bio cannot be more than 500 characters']
  },
  fitnessLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  goals: [String],
  
  // Onboarding completion flags
  onboardingComplete: {
    type: Boolean,
    default: false
  },
  onboardingStep: {
    type: Number,
    default: 1
  },
  
  // Stress Assessment Data
  stressAssessment: {
    responses: [{
      question: String,
      score: {
        type: Number,
        min: 0,
        max: 4
      },
      category: {
        type: String,
        enum: ['emotional', 'physical', 'social', 'lifestyle', 'financial']
      }
    }],
    totalScore: {
      type: Number,
      default: 0
    },
    stressLevel: {
      type: String,
      enum: ['low', 'mild', 'moderate', 'high'],
      default: 'low'
    },
    primaryStressSource: {
      type: String,
      enum: ['emotional', 'physical', 'social', 'lifestyle', 'financial']
    },
    completedAt: Date
  },
  
  // Nested profile for additional preferences
  profile: {
    preferences: {
      workoutTypes: [String],
      equipment: [String]
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, {
  timestamps: true
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
UserSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', UserSchema);