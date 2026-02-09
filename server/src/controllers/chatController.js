const mongoose = require('mongoose');
const aiService = require('../services/aiService');
const ChatHistory = require('../models/ChatHistory');
const User = require('../models/User');
const BMIRecord = require('../models/BMIRecord');
const FitnessGoal = require('../models/FitnessGoal');
const { v4: uuidv4 } = require('uuid');

// @desc    Start new chat session
// @route   POST /api/chat/start
// @access  Private
const startChatSession = async (req, res) => {
  try {
    const userId = req.user.userId;
    const sessionId = uuidv4();

    // Get user context for personalized chat
    const user = await User.findById(userId);
    const latestBMI = await BMIRecord.findOne({ userId }).sort({ createdAt: -1 });
    const activeGoals = await FitnessGoal.find({ userId, status: 'active' });

    const userContext = {
      bmi: latestBMI?.bmi,
      age: latestBMI?.age,
      fitnessLevel: user.profile?.fitnessLevel || 'beginner',
      goals: activeGoals.map(goal => goal.goalType),
      lastBMICategory: latestBMI?.category
    };

    // Create initial chat session
    const chatHistory = new ChatHistory({
      userId,
      sessionId,
      messages: [{
        role: 'assistant',
        content: `Hello ${user.name}! I'm your AI fitness coach. I can help you with workout advice, nutrition tips, and sports recommendations based on your profile. What would you like to know today?`,
        timestamp: new Date()
      }],
      userContext
    });

    await chatHistory.save();

    res.status(201).json({
      success: true,
      data: {
        sessionId,
        messages: chatHistory.messages,
        userContext
      }
    });

  } catch (error) {
    console.error('Start chat session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while starting chat session'
    });
  }
};

// @desc    Send message to AI
// @route   POST /api/chat/:sessionId/message
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { sessionId } = req.params;
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    // Find existing chat session
    let chatHistory = await ChatHistory.findOne({ userId, sessionId });
    
    if (!chatHistory) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    // Add user message
    const userMessage = {
      role: 'user',
      content: message.trim(),
      timestamp: new Date()
    };

    // Get AI response
    const conversationHistory = chatHistory.messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    const aiResponse = await aiService.chatWithAI(
      chatHistory.userContext,
      message,
      conversationHistory
    );

    // Add AI response
    const assistantMessage = {
      role: 'assistant', 
      content: aiResponse,
      timestamp: new Date()
    };

    // Update chat history
    chatHistory.messages.push(userMessage, assistantMessage);
    
    // Keep only last 20 messages to prevent document size issues
    if (chatHistory.messages.length > 20) {
      chatHistory.messages = chatHistory.messages.slice(-20);
    }

    await chatHistory.save();

    res.json({
      success: true,
      data: {
        sessionId,
        userMessage,
        assistantMessage,
        allMessages: chatHistory.messages
      }
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while processing message'
    });
  }
};

// @desc    Get chat history
// @route   GET /api/chat/:sessionId
// @access  Private
const getChatHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { sessionId } = req.params;

    const chatHistory = await ChatHistory.findOne({ userId, sessionId });

    if (!chatHistory) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    res.json({
      success: true,
      data: chatHistory
    });

  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching chat history'
    });
  }
};

// @desc    Get all user chat sessions
// @route   GET /api/chat/sessions
// @access  Private
const getChatSessions = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { limit = 10 } = req.query;

    const sessions = await ChatHistory.find({ userId })
      .select('sessionId createdAt updatedAt userContext')
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit));

    // Add last message preview for each session
    const sessionsWithPreview = await Promise.all(
      sessions.map(async (session) => {
        const fullSession = await ChatHistory.findById(session._id);
        const lastMessage = fullSession.messages[fullSession.messages.length - 1];
        
        return {
          sessionId: session.sessionId,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
          userContext: session.userContext,
          lastMessage: {
            content: lastMessage?.content?.substring(0, 100) + (lastMessage?.content?.length > 100 ? '...' : ''),
            role: lastMessage?.role,
            timestamp: lastMessage?.timestamp
          },
          messageCount: fullSession.messages.length
        };
      })
    );

    res.json({
      success: true,
      data: sessionsWithPreview
    });

  } catch (error) {
    console.error('Get chat sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching chat sessions'
    });
  }
};

// @desc    Delete chat session
// @route   DELETE /api/chat/:sessionId
// @access  Private
const deleteChatSession = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { sessionId } = req.params;

    const chatHistory = await ChatHistory.findOneAndDelete({ userId, sessionId });

    if (!chatHistory) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    res.json({
      success: true,
      message: 'Chat session deleted successfully'
    });

  } catch (error) {
    console.error('Delete chat session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting chat session'
    });
  }
};

// @desc    Get chat analytics/stats
// @route   GET /api/chat/analytics
// @access  Private
const getChatAnalytics = async (req, res) => {
  try {
    const userId = req.user.userId;

    const totalSessions = await ChatHistory.countDocuments({ userId });
    
    const totalMessages = await ChatHistory.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      { $project: { messageCount: { $size: '$messages' } } },
      { $group: { _id: null, total: { $sum: '$messageCount' } } }
    ]);

    const recentActivity = await ChatHistory.find({ userId })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('sessionId updatedAt messages');

    res.json({
      success: true,
      data: {
        totalSessions,
        totalMessages: totalMessages[0]?.total || 0,
        recentActivity: recentActivity.map(session => ({
          sessionId: session.sessionId,
          lastActive: session.updatedAt,
          messageCount: session.messages.length
        }))
      }
    });

  } catch (error) {
    console.error('Get chat analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching chat analytics'
    });
  }
};

module.exports = {
  startChatSession,
  sendMessage,
  getChatHistory,
  getChatSessions,
  deleteChatSession,
  getChatAnalytics
};