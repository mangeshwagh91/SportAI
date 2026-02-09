const express = require('express');
const { body } = require('express-validator');
const {
  calculateBMI,
  getBMIHistory,
  getBMIAnalytics,
  deleteBMIRecord
} = require('../controllers/bmiController');
const auth = require('../middleware/auth');

const router = express.Router();

// Validation rules
const bmiValidation = [
  body('height')
    .isFloat({ min: 50, max: 300 })
    .withMessage('Height must be between 50-300 cm'),
  body('weight')
    .isFloat({ min: 20, max: 500 })
    .withMessage('Weight must be between 20-500 kg'),
  body('age')
    .isInt({ min: 10, max: 150 })
    .withMessage('Age must be between 10-150 years'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters')
];

// Routes
router.post('/calculate', auth, bmiValidation, calculateBMI);
router.get('/history', auth, getBMIHistory);
router.get('/analytics', auth, getBMIAnalytics);
router.delete('/:id', auth, deleteBMIRecord);

module.exports = router;