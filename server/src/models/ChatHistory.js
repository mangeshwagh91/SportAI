const mongoose = require('mongoose');

const ChatHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  userContext: {
    bmi: Number,
    age: Number,
    fitnessLevel: String,
    goals: [String],
    lastBMICategory: String
  }
}, {
  timestamps: true
});

ChatHistorySchema.index({ userId: 1, sessionId: 1 });
ChatHistorySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('ChatHistory', ChatHistorySchema);