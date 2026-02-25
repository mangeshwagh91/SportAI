const express = require('express');
const {
  submitPTTest,
  getMyPTTests,
  getPTTestById,
  getAllPTTests,
  getPTStandards
} = require('../controllers/ptTestController');
const auth = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/standards', getPTStandards);

// Protected routes
router.post('/submit', auth, submitPTTest);
router.get('/my-tests', auth, getMyPTTests);
router.get('/:id', auth, getPTTestById);

// Admin routes
router.get('/admin/all', auth, getAllPTTests);

module.exports = router;
