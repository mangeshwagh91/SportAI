const express = require('express');
const { body } = require('express-validator');
const {
  startChatSession,
  sendMessage,
  getChatHistory,
  getChatSessions,
  deleteChatSession,
  getChatAnalytics
} = require('../controllers/chatController');
const auth = require('../middleware/auth');

const router = express.Router();

// Validation rules
const messageValidation = [
  body('message')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1-1000 characters')
];

// Routes
router.post('/start', auth, startChatSession);
router.post('/:sessionId/message', auth, messageValidation, sendMessage);
router.get('/sessions', auth, getChatSessions);
router.get('/analytics', auth, getChatAnalytics);
router.get('/:sessionId', auth, getChatHistory);
router.delete('/:sessionId', auth, deleteChatSession);

module.exports = router;