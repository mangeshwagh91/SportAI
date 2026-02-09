const mongoose = require('mongoose');

const WorkoutPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  duration: Number, // in minutes
  targetGoals: [String],
  exercises: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    sets: Number,
    reps: String, // Could be "10-15" or "30 seconds"
    restTime: Number, // in seconds
    equipment: [String],
    muscleGroups: [String]
  }],
  weeklySchedule: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      required: true
    },
    exerciseIndexes: [Number] // References to exercises array
  }],
  aiGenerated: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

WorkoutPlanSchema.index({ userId: 1, isActive: 1 });

module.exports = mongoose.model('WorkoutPlan', WorkoutPlanSchema);