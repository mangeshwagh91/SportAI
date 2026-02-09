const aiService = require('../services/aiService');
const User = require('../models/User');
const BMIRecord = require('../models/BMIRecord');
const FitnessGoal = require('../models/FitnessGoal');
const WorkoutPlan = require('../models/WorkoutPlan');
const DietPlan = require('../models/DietPlan');

// @desc    Get AI sport recommendations
// @route   GET /api/ai/sports-recommendations
// @access  Private
const getSportsRecommendations = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get user profile and latest BMI
    const user = await User.findById(userId);
    const latestBMI = await BMIRecord.findOne({ userId }).sort({ createdAt: -1 });
    const activeGoals = await FitnessGoal.find({ userId, status: 'active' });

    if (!latestBMI) {
      return res.status(400).json({
        success: false,
        message: 'Please calculate your BMI first to get personalized recommendations'
      });
    }

    const userProfile = {
      bmi: latestBMI.bmi,
      bmiCategory: latestBMI.category,
      age: latestBMI.age,
      fitnessLevel: user.profile?.fitnessLevel || 'beginner',
      goals: activeGoals.map(goal => goal.goalType)
    };

    const recommendations = await aiService.getSportRecommendations(userProfile);

    res.json({
      success: true,
      data: {
        recommendations,
        userProfile: {
          bmi: userProfile.bmi,
          category: userProfile.bmiCategory,
          fitnessLevel: userProfile.fitnessLevel
        }
      }
    });

  } catch (error) {
    console.error('Get sports recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating recommendations'
    });
  }
};

// @desc    Generate AI workout plan
// @route   POST /api/ai/workout-plan
// @access  Private
const generateWorkoutPlan = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { preferences = {} } = req.body;

    // Get user profile and latest BMI
    const user = await User.findById(userId);
    const latestBMI = await BMIRecord.findOne({ userId }).sort({ createdAt: -1 });
    const activeGoals = await FitnessGoal.find({ userId, status: 'active' });

    if (!latestBMI) {
      return res.status(400).json({
        success: false,
        message: 'Please calculate your BMI first to generate a workout plan'
      });
    }

    const userProfile = {
      bmi: latestBMI.bmi,
      bmiCategory: latestBMI.category,
      age: latestBMI.age,
      weight: latestBMI.weight,
      height: latestBMI.height,
      fitnessLevel: user.profile?.fitnessLevel || 'beginner',
      goals: activeGoals.map(goal => goal.goalType),
      gender: user.profile?.gender || 'male'
    };

    const aiPlan = await aiService.generateWorkoutPlan(userProfile, preferences);

    // Save the generated plan to database
    const workoutPlan = new WorkoutPlan({
      userId,
      title: aiPlan.title,
      description: aiPlan.description,
      difficulty: userProfile.fitnessLevel,
      duration: preferences.duration || 45,
      targetGoals: userProfile.goals,
      exercises: aiPlan.exercises || [],
      weeklySchedule: aiPlan.weeklySchedule || [],
      aiGenerated: true
    });

    await workoutPlan.save();

    res.status(201).json({
      success: true,
      message: 'Workout plan generated successfully',
      data: workoutPlan
    });

  } catch (error) {
    console.error('Generate workout plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating workout plan'
    });
  }
};

// @desc    Generate AI diet plan  
// @route   POST /api/ai/diet-plan
// @access  Private
const generateDietPlan = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { preferences = {} } = req.body;

    // Get user profile and latest BMI
    const user = await User.findById(userId);
    const latestBMI = await BMIRecord.findOne({ userId }).sort({ createdAt: -1 });
    const activeGoals = await FitnessGoal.find({ userId, status: 'active' });

    if (!latestBMI) {
      return res.status(400).json({
        success: false,
        message: 'Please calculate your BMI first to generate a diet plan'
      });
    }

    const userProfile = {
      bmi: latestBMI.bmi,
      bmiCategory: latestBMI.category,
      age: latestBMI.age,
      weight: latestBMI.weight,
      height: latestBMI.height,
      fitnessLevel: user.profile?.fitnessLevel || 'beginner',
      goals: activeGoals.map(goal => goal.goalType),
      gender: user.profile?.gender || 'male'
    };

    const aiPlan = await aiService.generateDietPlan(userProfile, preferences);

    // Save the generated plan to database
    const dietPlan = new DietPlan({
      userId,
      title: aiPlan.title,
      description: aiPlan.description,
      goalType: activeGoals[0]?.goalType || 'maintenance',
      dailyCalories: aiPlan.dailyCalories,
      macros: aiPlan.macros,
      meals: aiPlan.meals || [],
      weeklyMenu: aiPlan.weeklyMenu || [],
      dietaryRestrictions: preferences.dietaryRestrictions || [],
      aiGenerated: true
    });

    await dietPlan.save();

    res.status(201).json({
      success: true,
      message: 'Diet plan generated successfully',
      data: dietPlan
    });

  } catch (error) {
    console.error('Generate diet plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating diet plan'
    });
  }
};

// @desc    Get user's workout plans
// @route   GET /api/ai/workout-plans
// @access  Private
const getWorkoutPlans = async (req, res) => {
  try {
    const userId = req.user.userId;

    const plans = await WorkoutPlan.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: plans
    });

  } catch (error) {
    console.error('Get workout plans error:', error);
    res.status(500).json({
      success: false,  
      message: 'Server error while fetching workout plans'
    });
  }
};

// @desc    Get user's diet plans
// @route   GET /api/ai/diet-plans
// @access  Private
const getDietPlans = async (req, res) => {
  try {
    const userId = req.user.userId;

    const plans = await DietPlan.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: plans
    });

  } catch (error) {
    console.error('Get diet plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching diet plans'
    });
  }
};

// @desc    Update workout plan status
// @route   PUT /api/ai/workout-plans/:id
// @access  Private
const updateWorkoutPlan = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { isActive } = req.body;

    const plan = await WorkoutPlan.findOneAndUpdate(
      { _id: id, userId },
      { isActive },
      { new: true }
    );

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Workout plan not found'
      });
    }

    res.json({
      success: true,
      message: 'Workout plan updated successfully',
      data: plan
    });

  } catch (error) {
    console.error('Update workout plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating workout plan'
    });
  }
};

module.exports = {
  getSportsRecommendations,
  generateWorkoutPlan,
  generateDietPlan,
  getWorkoutPlans,
  getDietPlans,
  updateWorkoutPlan
};