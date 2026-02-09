const BMIRecord = require('../models/BMIRecord');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Calculate and save BMI
// @route   POST /api/bmi/calculate
// @access  Private
const calculateBMI = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { height, weight, age, notes } = req.body;
    const userId = req.user.userId;

    // Calculate BMI
    const heightInMeters = height / 100;
    const bmi = parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));

    // Determine BMI category
    let category;
    if (bmi < 18.5) category = 'Underweight';
    else if (bmi < 25) category = 'Normal weight';
    else if (bmi < 30) category = 'Overweight';
    else category = 'Obese';

    // Save BMI record
    const bmiRecord = await BMIRecord.create({
      userId,
      height,
      weight,
      age,
      bmi,
      category,
      notes
    });

    // Update user's current BMI in profile
    await User.findByIdAndUpdate(userId, {
      $set: {
        'profile.currentBMI': bmi,
        'profile.age': age,
        'profile.weight': weight,
        'profile.height': height
      }
    });

    res.status(201).json({
      success: true,
      message: 'BMI calculated and saved successfully',
      data: bmiRecord
    });

  } catch (error) {
    console.error('Calculate BMI error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during BMI calculation'
    });
  }
};

// @desc    Get BMI history
// @route   GET /api/bmi/history
// @access  Private
const getBMIHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { limit = 10, page = 1 } = req.query;

    const skip = (page - 1) * limit;

    const bmiRecords = await BMIRecord.find({ userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await BMIRecord.countDocuments({ userId });

    // Calculate BMI trends
    const trends = await calculateBMITrends(userId);

    res.json({
      success: true,
      data: {
        records: bmiRecords,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: bmiRecords.length,
          totalRecords: total
        },
        trends
      }
    });

  } catch (error) {
    console.error('Get BMI history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching BMI history'
    });
  }
};

// @desc    Get BMI statistics and analysis
// @route   GET /api/bmi/analytics
// @access  Private
const getBMIAnalytics = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get recent BMI records for analysis
    const recentRecords = await BMIRecord.find({ userId })
      .sort({ createdAt: -1 })
      .limit(12); // Last 12 records for trend analysis

    if (recentRecords.length === 0) {
      return res.json({
        success: true,
        data: {
          message: 'No BMI records found. Start by calculating your first BMI!'
        }
      });
    }

    const currentBMI = recentRecords[0];
    const previousBMI = recentRecords[1];

    // Calculate progress
    const progress = previousBMI ? {
      bmiChange: parseFloat((currentBMI.bmi - previousBMI.bmi).toFixed(1)),
      weightChange: parseFloat((currentBMI.weight - previousBMI.weight).toFixed(1)),
      daysBetween: Math.floor((currentBMI.createdAt - previousBMI.createdAt) / (1000 * 60 * 60 * 24))
    } : null;

    // Calculate monthly averages
    const monthlyData = await getMonthlyBMIAverages(userId);

    // Health recommendations based on current BMI
    const healthRecommendations = getHealthRecommendations(currentBMI);

    res.json({
      success: true,
      data: {
        current: currentBMI,
        progress,
        monthlyData,
        healthRecommendations,
        totalRecords: recentRecords.length
      }
    });

  } catch (error) {
    console.error('Get BMI analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching BMI analytics'
    });
  }
};

// @desc    Delete BMI record
// @route   DELETE /api/bmi/:id
// @access  Private
const deleteBMIRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const bmiRecord = await BMIRecord.findOneAndDelete({
      _id: id,
      userId: userId
    });

    if (!bmiRecord) {
      return res.status(404).json({
        success: false,
        message: 'BMI record not found'
      });
    }

    res.json({
      success: true,
      message: 'BMI record deleted successfully'
    });

  } catch (error) {
    console.error('Delete BMI record error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting BMI record'
    });
  }
};

// Helper functions
const calculateBMITrends = async (userId) => {
  const records = await BMIRecord.find({ userId })
    .sort({ createdAt: -1 })
    .limit(6);

  if (records.length < 2) return null;

  const latest = records[0];
  const oldest = records[records.length - 1];

  return {
    trend: latest.bmi > oldest.bmi ? 'increasing' : 'decreasing',
    change: parseFloat((latest.bmi - oldest.bmi).toFixed(1)),
    period: `Last ${records.length} records`
  };
};

const getMonthlyBMIAverages = async (userId) => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const records = await BMIRecord.find({
    userId,
    createdAt: { $gte: sixMonthsAgo }
  }).sort({ createdAt: 1 });

  // Group by month and calculate averages
  const monthlyData = {};
  records.forEach(record => {
    const monthKey = record.createdAt.toISOString().substring(0, 7);
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { total: 0, count: 0, records: [] };
    }
    monthlyData[monthKey].total += record.bmi;
    monthlyData[monthKey].count += 1;
    monthlyData[monthKey].records.push(record);
  });

  return Object.entries(monthlyData).map(([month, data]) => ({
    month,
    averageBMI: parseFloat((data.total / data.count).toFixed(1)),
    recordCount: data.count
  }));
};

const getHealthRecommendations = (bmiRecord) => {
  const { category, bmi, age } = bmiRecord;
  
  const recommendations = {
    'Underweight': [
      'Consider consulting a healthcare provider about healthy weight gain',
      'Focus on nutrient-dense, calorie-rich foods',
      'Include strength training to build muscle mass',
      'Ensure adequate protein intake'
    ],
    'Normal weight': [
      'Maintain your current healthy weight',
      'Continue regular physical activity',
      'Follow a balanced, nutritious diet',
      'Monitor your weight regularly'
    ],
    'Overweight': [
      'Aim for gradual weight loss of 1-2 pounds per week',
      'Increase physical activity and exercise',
      'Reduce portion sizes and caloric intake',
      'Focus on whole foods and reduce processed foods'
    ],
    'Obese': [
      'Consult with a healthcare provider for a weight loss plan',
      'Start with low-impact exercises like walking or swimming',
      'Consider working with a registered dietitian',
      'Focus on long-term lifestyle changes'
    ]
  };

  return {
    category,
    bmi,
    recommendations: recommendations[category] || recommendations['Normal weight'],
    riskLevel: category === 'Obese' ? 'High' : category === 'Overweight' ? 'Moderate' : 'Low'
  };
};

module.exports = {
  calculateBMI,
  getBMIHistory,
  getBMIAnalytics,
  deleteBMIRecord
};