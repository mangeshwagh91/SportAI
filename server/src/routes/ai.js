const express = require('express');
const {
  getSportsRecommendations,
  generateWorkoutPlan,
  generateDietPlan,
  getWorkoutPlans,
  getDietPlans,
  updateWorkoutPlan
} = require('../controllers/aiController');
const auth = require('../middleware/auth');

const router = express.Router();

// AI recommendation routes
router.get('/sports-recommendations', auth, getSportsRecommendations);
router.post('/workout-plan', auth, generateWorkoutPlan);
router.post('/diet-plan', auth, generateDietPlan);
router.get('/workout-plans', auth, getWorkoutPlans);
router.get('/diet-plans', auth, getDietPlans);
router.put('/workout-plans/:id', auth, updateWorkoutPlan);

module.exports = router;