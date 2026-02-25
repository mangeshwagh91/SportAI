const express = require('express');
const {
  getAllUsers,
  getUserById,
  updateUserStatus,
  getDashboardStats,
  getNCCCadets,
  getNCCCadetByChNo
} = require('../controllers/adminController');
const auth = require('../middleware/auth');

const router = express.Router();

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  // The auth middleware should have already populated req.user
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // Check if user has admin role
  // We need to fetch the user to check their role
  const User = require('../models/User');
  User.findById(req.user.userId)
    .then(user => {
      if (!user || user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin privileges required.'
        });
      }
      next();
    })
    .catch(error => {
      return res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    });
};

// All routes require authentication and admin role
router.use(auth);
router.use(isAdmin);

// Routes
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/status', updateUserStatus);
router.get('/stats', getDashboardStats);

// NCC Cadets routes
router.get('/ncc-cadets', getNCCCadets);
router.get('/ncc-cadets/:chNo', getNCCCadetByChNo);

module.exports = router;
