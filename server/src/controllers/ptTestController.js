const PTTest = require('../models/PTTest');
const User = require('../models/User');
const NCCCadet = require('../models/NCCCadet');

// PT Test standards based on age groups
const PT_STANDARDS = {
  run1_2km: {
    under30: { EX: 420, G: 390, S: 450 }, // in seconds (7:00 = 420s)
    '30to40': { EX: 420, G: 450, S: 480 },
    '40to45': { EX: 480, G: 510, S: 600 },
    '45to50': { EX: 600, G: 660, S: 720 },
    '50to55': { EX: 720, G: 780, S: 900 }
  },
  bendKneeSitup: {
    under30: { EX: 35, G: 30, S: 25 },
    '30to40': { EX: 30, G: 25, S: 20 },
    '40to45': { EX: 25, G: 20, S: 15 },
    '45to50': { EX: 15, G: 20, S: 15 },
    '50to55': { EX: 12, G: 8, S: 10 }
  },
  pushUp: {
    under30: { EX: 25, G: 20, S: 17 },
    '30to40': { EX: 20, G: 17, S: 14 },
    '40to45': { EX: 15, G: 12, S: 10 },
    '45to50': { EX: 10, G: 12, S: 10 },
    '50to55': { EX: 9, G: 8, S: 8 },
    over55: { EX: 7, G: 7, S: 6 }
  },
  shuttle5m: {
    under30: { EX: 15, G: 14, S: 13 },
    '30to40': { EX: 13, G: 12, S: 11 },
    '40to45': { EX: 11, G: 10, S: 9 },
    '45to50': { EX: 9, G: 9, S: 8 },
    '50to55': { EX: 7, G: 7, S: 7 }
  },
  walk1_5km: {
    under30: { EX: 840, G: 900, S: 1020 }, // in seconds (14:00 = 840s)
    '30to40': { EX: 900, G: 960, S: 1080 },
    '40to45': { EX: 1020, G: 1080, S: 1200 },
    '45to50': { EX: 1140, G: 1200, S: 1320 },
    '50to55': { EX: 1260, G: 1320, S: 1440 },
    over55: { EX: 1380, G: 1440, S: 1560 }
  },
  walk1km: {
    under30: { EX: 720, G: 780, S: 900 }, // in seconds (12:00 = 720s)
    '30to40': { EX: 780, G: 840, S: 960 },
    '40to45': { EX: 840, G: 900, S: 1020 },
    '45to50': { EX: 900, G: 960, S: 1080 },
    '50to55': { EX: 1020, G: 1080, S: 1200 },
    over55: { EX: 1140, G: 1200, S: 1320 }
  },
  firingTest: {
    all: { EX: 5, G: 4, S: 3 } // out of 5 bullets
  }
};

// Convert time string (MM:SS) to seconds
const timeToSeconds = (timeStr) => {
  if (!timeStr || timeStr === 'MIN' || timeStr === '-') return null;
  const parts = timeStr.split(':');
  if (parts.length === 2) {
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  }
  return null;
};

// Calculate grade based on performance
const calculateGrade = (testType, value, ageGroup) => {
  if (!value || value === 'MIN' || value === '-') return null;
  
  const standards = PT_STANDARDS[testType];
  if (!standards) return null;
  
  const ageStandards = standards[ageGroup] || standards['all'];
  if (!ageStandards) return null;
  
  // For time-based tests (lower is better)
  if (testType.includes('run') || testType.includes('walk')) {
    const seconds = timeToSeconds(value);
    if (!seconds) return null;
    
    if (seconds <= ageStandards.EX) return 'EX';
    if (seconds <= ageStandards.G) return 'G';
    if (seconds <= ageStandards.S) return 'S';
    return 'FAIL';
  }
  
  // For count-based tests (higher is better)
  const numValue = parseInt(value);
  if (isNaN(numValue)) return null;
  
  if (numValue >= ageStandards.EX) return 'EX';
  if (numValue >= ageStandards.G) return 'G';
  if (numValue >= ageStandards.S) return 'S';
  return 'FAIL';
};

// @desc    Submit PT test results
// @route   POST /api/pt-test/submit
// @access  Private
const submitPTTest = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { ageGroup, tests, testDate, remarks } = req.body;
    
    if (!ageGroup) {
      return res.status(400).json({
        success: false,
        message: 'Age group is required'
      });
    }
    
    // Get user and cadet info
    const user = await User.findById(userId);
    let cadet = null;
    if (user.chNo) {
      cadet = await NCCCadet.findOne({ chNo: user.chNo });
    }
    
    // Prepare PT test data with calculated grades
    const ptTestData = {
      user: userId,
      cadet: cadet?._id,
      ageGroup,
      testDate: testDate || new Date(),
      remarks,
      submittedBy: 'self'
    };
    
    // Process each test
    if (tests.run1_2km) {
      ptTestData.run1_2km = {
        time: tests.run1_2km,
        grade: calculateGrade('run1_2km', tests.run1_2km, ageGroup)
      };
    }
    
    if (tests.bendKneeSitup) {
      ptTestData.bendKneeSitup = {
        count: parseInt(tests.bendKneeSitup),
        grade: calculateGrade('bendKneeSitup', tests.bendKneeSitup, ageGroup)
      };
    }
    
    if (tests.pushUp) {
      ptTestData.pushUp = {
        count: parseInt(tests.pushUp),
        grade: calculateGrade('pushUp', tests.pushUp, ageGroup)
      };
    }
    
    if (tests.shuttle5m) {
      ptTestData.shuttle5m = {
        count: parseInt(tests.shuttle5m),
        grade: calculateGrade('shuttle5m', tests.shuttle5m, ageGroup)
      };
    }
    
    if (tests.walk1_5km) {
      ptTestData.walk1_5km = {
        time: tests.walk1_5km,
        grade: calculateGrade('walk1_5km', tests.walk1_5km, ageGroup)
      };
    }
    
    if (tests.walk1km) {
      ptTestData.walk1km = {
        time: tests.walk1km,
        grade: calculateGrade('walk1km', tests.walk1km, ageGroup)
      };
    }
    
    if (tests.firingTest !== undefined) {
      ptTestData.firingTest = {
        score: parseInt(tests.firingTest),
        grade: calculateGrade('firingTest', tests.firingTest, ageGroup)
      };
    }
    
    // Create PT test record
    const ptTest = await PTTest.create(ptTestData);
    
    // Calculate overall grade
    ptTest.overallGrade = ptTest.calculateOverallGrade();
    await ptTest.save();
    
    res.status(201).json({
      success: true,
      message: 'PT test results submitted successfully',
      data: { ptTest }
    });
    
  } catch (error) {
    console.error('Submit PT test error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error submitting PT test',
      error: error.message
    });
  }
};

// @desc    Get user's PT test history
// @route   GET /api/pt-test/my-tests
// @access  Private
const getMyPTTests = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const ptTests = await PTTest.find({ user: userId })
      .sort({ testDate: -1 })
      .populate('cadet', 'fullName chNo rank company');
    
    res.json({
      success: true,
      data: { ptTests }
    });
    
  } catch (error) {
    console.error('Get my PT tests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching PT tests',
      error: error.message
    });
  }
};

// @desc    Get PT test by ID
// @route   GET /api/pt-test/:id
// @access  Private
const getPTTestById = async (req, res) => {
  try {
    const ptTest = await PTTest.findById(req.params.id)
      .populate('user', 'name email chNo')
      .populate('cadet', 'fullName chNo rank company');
    
    if (!ptTest) {
      return res.status(404).json({
        success: false,
        message: 'PT test not found'
      });
    }
    
    // Check if user has permission
    if (ptTest.user._id.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this PT test'
      });
    }
    
    res.json({
      success: true,
      data: { ptTest }
    });
    
  } catch (error) {
    console.error('Get PT test by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching PT test',
      error: error.message
    });
  }
};

// @desc    Get all PT tests (Admin)
// @route   GET /api/pt-test/admin/all
// @access  Private/Admin
const getAllPTTests = async (req, res) => {
  try {
    const { page = 1, limit = 50, ageGroup, overallGrade } = req.query;
    
    const filter = {};
    if (ageGroup) filter.ageGroup = ageGroup;
    if (overallGrade) filter.overallGrade = overallGrade;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const ptTests = await PTTest.find(filter)
      .sort({ testDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'name email chNo')
      .populate('cadet', 'fullName chNo rank company');
    
    const total = await PTTest.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        ptTests,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          total,
          perPage: parseInt(limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Get all PT tests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching PT tests',
      error: error.message
    });
  }
};

// @desc    Get PT standards
// @route   GET /api/pt-test/standards
// @access  Public
const getPTStandards = async (req, res) => {
  try {
    res.json({
      success: true,
      data: { standards: PT_STANDARDS }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  submitPTTest,
  getMyPTTests,
  getPTTestById,
  getAllPTTests,
  getPTStandards
};
