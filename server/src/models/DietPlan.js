const mongoose = require('mongoose');

const DietPlanSchema = new mongoose.Schema({
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
  goalType: {
    type: String,
    enum: ['weight_loss', 'weight_gain', 'muscle_gain', 'maintenance'],
    required: true
  },
  dailyCalories: Number,
  macros: {
    protein: Number, // percentage
    carbs: Number, // percentage  
    fats: Number // percentage
  },
  meals: [{
    type: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack_1', 'snack_2'],
      required: true
    },
    name: String,
    description: String,
    calories: Number,
    ingredients: [String],
    instructions: String,
    prepTime: Number // in minutes
  }],
  weeklyMenu: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      required: true
    },
    mealIndexes: [Number] // References to meals array
  }],
  dietaryRestrictions: [String],
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

DietPlanSchema.index({ userId: 1, isActive: 1 });

module.exports = mongoose.model('DietPlan', DietPlanSchema);