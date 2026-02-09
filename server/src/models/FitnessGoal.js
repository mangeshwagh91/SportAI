const mongoose = require('mongoose');

const FitnessGoalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  goalType: {
    type: String,
    enum: ['weight_loss', 'weight_gain', 'muscle_gain', 'endurance', 'strength', 'flexibility', 'general_fitness'],
    required: true
  },
  targetWeight: Number,
  currentWeight: Number,
  targetDate: Date,
  status: {
    type: String,
    enum: ['active', 'completed', 'paused'],
    default: 'active'
  },
  description: String,
  workoutFrequency: {
    type: String,
    enum: ['daily', '3-4_times_week', '5-6_times_week', 'weekend_only'],
    default: '3-4_times_week'
  },
  preferredSports: [String],
  dietaryRestrictions: [String],
  fitnessLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  }
}, {
  timestamps: true
});

FitnessGoalSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('FitnessGoal', FitnessGoalSchema);