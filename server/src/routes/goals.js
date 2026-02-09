const express = require('express');
const { body } = require('express-validator');
const FitnessGoal = require('../models/FitnessGoal');
const auth = require('../middleware/auth');

const router = express.Router();

// @desc    Create fitness goal
// @route   POST /api/goals
// @access  Private
const createGoal = async (req, res) => {
  try {
    const userId = req.user.userId;
    const goalData = { ...req.body, userId };

    const goal = await FitnessGoal.create(goalData);

    res.status(201).json({
      success: true,
      message: 'Fitness goal created successfully',
      data: goal
    });

  } catch (error) {
    console.error('Create goal error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating goal'
    });
  }
};

// @desc    Get user's fitness goals
// @route   GET /api/goals
// @access  Private
const getGoals = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status } = req.query;

    const filter = { userId };
    if (status) filter.status = status;

    const goals = await FitnessGoal.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: goals
    });

  } catch (error) {
    console.error('Get goals error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching goals'
    });
  }
};

// @desc    Update fitness goal
// @route   PUT /api/goals/:id
// @access  Private
const updateGoal = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const goal = await FitnessGoal.findOneAndUpdate(
      { _id: id, userId },
      req.body,
      { new: true }
    );

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    res.json({
      success: true,
      message: 'Goal updated successfully',
      data: goal
    });

  } catch (error) {
    console.error('Update goal error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating goal'
    });
  }
};

// @desc    Delete fitness goal
// @route   DELETE /api/goals/:id
// @access  Private
const deleteGoal = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const goal = await FitnessGoal.findOneAndDelete({ _id: id, userId });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    res.json({
      success: true,
      message: 'Goal deleted successfully'
    });

  } catch (error) {
    console.error('Delete goal error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting goal'
    });
  }
};

// Validation rules
const goalValidation = [
  body('goalType')
    .isIn(['weight_loss', 'weight_gain', 'muscle_gain', 'endurance', 'strength', 'flexibility', 'general_fitness'])
    .withMessage('Invalid goal type'),
  body('targetWeight')
    .optional()
    .isFloat({ min: 20, max: 500 })
    .withMessage('Target weight must be between 20-500 kg'),
  body('targetDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid target date format'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters')
];

// Routes
router.post('/', auth, goalValidation, createGoal);
router.get('/', auth, getGoals);
router.put('/:id', auth, updateGoal);
router.delete('/:id', auth, deleteGoal);

module.exports = router;