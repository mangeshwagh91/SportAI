const mongoose = require('mongoose');

const BMIRecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  height: {
    type: Number,
    required: [true, 'Height is required'],
    min: [50, 'Height must be at least 50cm']
  },
  weight: {
    type: Number,
    required: [true, 'Weight is required'],
    min: [20, 'Weight must be at least 20kg']
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [10, 'Age must be at least 10']
  },
  bmi: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    enum: ['Underweight', 'Normal weight', 'Overweight', 'Obese'],
    required: true
  },
  notes: String
}, {
  timestamps: true
});

// Index for efficient querying
BMIRecordSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('BMIRecord', BMIRecordSchema);