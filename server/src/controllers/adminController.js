const User = require('../models/User');
const NCCCadet = require('../models/NCCCadet');

// @desc    Get all users with filters
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const { search, stressLevel, gender, onboardingComplete, page = 1, limit = 20 } = req.query;

    // Build filter object
    const filter = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (stressLevel) {
      filter['stressAssessment.stressLevel'] = stressLevel;
    }
    
    if (gender) {
      filter.gender = gender;
    }
    
    if (onboardingComplete !== undefined) {
      filter.onboardingComplete = onboardingComplete === 'true';
    }

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get users with pagination
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalUsers = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalUsers / parseInt(limit)),
          totalUsers,
          usersPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching users',
      error: error.message
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get academic data
    const Academic = require('../models/Academic');
    const academicData = await Academic.findOne({ user: req.params.id });

    res.json({
      success: true,
      data: { 
        user,
        academics: academicData
      }
    });

  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user',
      error: error.message
    });
  }
};

// @desc    Update user status (activate/deactivate)
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
const updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: { user: user.toJSON() }
    });

  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating user status',
      error: error.message
    });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    // Total users
    const totalUsers = await User.countDocuments();

    // Users who completed onboarding
    const onboardingComplete = await User.countDocuments({ onboardingComplete: true });

    // Users with high stress
    const highStressUsers = await User.countDocuments({ 'stressAssessment.stressLevel': 'high' });

    // Average BMI
    const avgBmiResult = await User.aggregate([
      { $match: { bmi: { $exists: true, $ne: null } } },
      { $group: { _id: null, avgBMI: { $avg: '$bmi' } } }
    ]);
    const avgBMI = avgBmiResult.length > 0 ? avgBmiResult[0].avgBMI.toFixed(2) : 0;

    // Stress level distribution
    const stressDistribution = await User.aggregate([
      { $match: { 'stressAssessment.stressLevel': { $exists: true } } },
      { $group: { _id: '$stressAssessment.stressLevel', count: { $sum: 1 } } }
    ]);

    // Gender distribution
    const genderDistribution = await User.aggregate([
      { $match: { gender: { $exists: true } } },
      { $group: { _id: '$gender', count: { $sum: 1 } } }
    ]);

    // Recent users (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentUsers = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    res.json({
      success: true,
      data: {
        totalUsers,
        onboardingComplete,
        highStressUsers,
        avgBMI,
        recentUsers,
        stressDistribution,
        genderDistribution
      }
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching statistics',
      error: error.message
    });
  }
};

// @desc    Get all NCC cadets with signup status
// @route   GET /api/admin/ncc-cadets
// @access  Private/Admin
const getNCCCadets = async (req, res) => {
  try {
    const { search, company, signedUp, page = 1, limit = 50 } = req.query;

    // Build filter object
    const filter = {};
    
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { chNo: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (company) {
      filter.company = company;
    }
    
    if (signedUp !== undefined) {
      filter.signedUp = signedUp === 'true';
    }

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get cadets with pagination and populate user data
    const cadets = await NCCCadet.find(filter)
      .populate('userId', 'name email profilePhoto onboardingComplete')
      .sort({ chNo: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalCadets = await NCCCadet.countDocuments(filter);

    // Get signup statistics
    const signedUpCount = await NCCCadet.countDocuments({ signedUp: true });
    const notSignedUpCount = await NCCCadet.countDocuments({ signedUp: false });

    res.json({
      success: true,
      data: {
        cadets,
        stats: {
          total: totalCadets,
          signedUp: signedUpCount,
          notSignedUp: notSignedUpCount
        },
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCadets / parseInt(limit)),
          totalCadets,
          cadetsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get NCC cadets error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching NCC cadets',
      error: error.message
    });
  }
};

// @desc    Get NCC cadet by Chest Number
// @route   GET /api/admin/ncc-cadets/:chNo
// @access  Private/Admin
const getNCCCadetByChNo = async (req, res) => {
  try {
    const cadet = await NCCCadet.findOne({ chNo: req.params.chNo })
      .populate('userId', '-password');

    if (!cadet) {
      return res.status(404).json({
        success: false,
        message: 'NCC Cadet not found'
      });
    }

    res.json({
      success: true,
      data: { cadet }
    });

  } catch (error) {
    console.error('Get NCC cadet by CH NO error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching NCC cadet',
      error: error.message
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUserStatus,
  getDashboardStats,
  getNCCCadets,
  getNCCCadetByChNo
};
