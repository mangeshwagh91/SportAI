const Academic = require('../models/Academic');

// @desc    Get user's academic records
// @route   GET /api/academics
// @access  Private
const getAcademicRecords = async (req, res) => {
  try {
    let academic = await Academic.findOne({ user: req.user.userId });
    
    if (!academic) {
      // Create new academic record with default subjects
      academic = await Academic.create({
        user: req.user.userId,
        subjects: [
          { subjectName: '1.2 km Run', subjectCode: 'PT101', exams: [] },
          { subjectName: 'Bend Knee Sit-up', subjectCode: 'PT102', exams: [] },
          { subjectName: 'Push-up', subjectCode: 'PT103', exams: [] },
          { subjectName: '5 mt Shuttle Run in 01 min', subjectCode: 'PT104', exams: [] },
          { subjectName: 'Firing Test 5 bullets', subjectCode: 'PT105', exams: [] },
          { subjectName: 'PT Test', subjectCode: 'PT106', exams: [] },
        ],
      });
    }

    res.json({
      success: true,
      data: academic,
    });
  } catch (error) {
    console.error('Get academic records error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching academic records',
      error: error.message,
    });
  }
};

// @desc    Add or update subject
// @route   POST /api/academics/subjects
// @access  Private
const addOrUpdateSubject = async (req, res) => {
  try {
    const { subjectName, subjectCode, academicYear, semester } = req.body;

    let academic = await Academic.findOne({ user: req.user.userId });
    
    if (!academic) {
      academic = await Academic.create({
        user: req.user.userId,
        subjects: [],
      });
    }

    // Check if subject already exists
    const subjectIndex = academic.subjects.findIndex(
      s => s.subjectCode === subjectCode
    );

    if (subjectIndex > -1) {
      // Update existing subject
      academic.subjects[subjectIndex].subjectName = subjectName;
    } else {
      // Add new subject
      academic.subjects.push({
        subjectName,
        subjectCode,
        exams: [],
      });
    }

    if (academicYear) academic.academicYear = academicYear;
    if (semester) academic.semester = semester;

    await academic.save();

    res.json({
      success: true,
      message: 'Subject added/updated successfully',
      data: academic,
    });
  } catch (error) {
    console.error('Add/Update subject error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding/updating subject',
      error: error.message,
    });
  }
};

// @desc    Add exam result to subject
// @route   POST /api/academics/subjects/:subjectCode/exams
// @access  Private
const addExamResult = async (req, res) => {
  try {
    const { subjectCode } = req.params;
    const { examName, grade, marks, maxMarks, result, date } = req.body;

    const academic = await Academic.findOne({ user: req.user.userId });
    
    if (!academic) {
      return res.status(404).json({
        success: false,
        message: 'Academic record not found',
      });
    }

    const subject = academic.subjects.find(s => s.subjectCode === subjectCode);
    
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found',
      });
    }

    // Add exam result
    const examResult = {
      examName,
      date: date || new Date(),
    };

    // Add grade if provided (not required for Firing Test)
    if (grade) {
      examResult.grade = grade;
    }

    // Add result (Pass/Fail) for Test-1
    if (result) {
      examResult.result = result;
    }

    // Add marks and calculate percentage if provided
    if (marks !== undefined && maxMarks) {
      examResult.marks = marks;
      examResult.maxMarks = maxMarks;
      examResult.percentage = (marks / maxMarks) * 100;
    }

    subject.exams.push(examResult);

    // No need to calculate average score or current grade for PT tests
    // Grades are assigned directly by instructors

    await academic.save();

    res.json({
      success: true,
      message: 'Exam result added successfully',
      data: academic,
    });
  } catch (error) {
    console.error('Add exam result error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding exam result',
      error: error.message,
    });
  }
};

// @desc    Update exam result
// @route   PUT /api/academics/subjects/:subjectCode/exams/:examId
// @access  Private
const updateExamResult = async (req, res) => {
  try {
    const { subjectCode, examId } = req.params;
    const { examName, grade, marks, maxMarks, date } = req.body;

    const academic = await Academic.findOne({ user: req.user.userId });
    
    if (!academic) {
      return res.status(404).json({
        success: false,
        message: 'Academic record not found',
      });
    }

    const subject = academic.subjects.find(s => s.subjectCode === subjectCode);
    
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found',
      });
    }

    const exam = subject.exams.id(examId);
    
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found',
      });
    }

    // Update exam
    if (examName) exam.examName = examName;
    if (grade) exam.grade = grade;
    if (date) exam.date = date;
    
    // Update marks if provided
    if (marks !== undefined) exam.marks = marks;
    if (maxMarks !== undefined) exam.maxMarks = maxMarks;
    
    // Recalculate percentage if marks are available
    if (exam.marks !== undefined && exam.maxMarks) {
      exam.percentage = (exam.marks / exam.maxMarks) * 100;
    }

    // No need to recalculate average score or current grade for PT tests
    // Grades are assigned directly by instructors

    await academic.save();

    res.json({
      success: true,
      message: 'Exam result updated successfully',
      data: academic,
    });
  } catch (error) {
    console.error('Update exam result error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating exam result',
      error: error.message,
    });
  }
};

// @desc    Delete exam result
// @route   DELETE /api/academics/subjects/:subjectCode/exams/:examId
// @access  Private
const deleteExamResult = async (req, res) => {
  try {
    const { subjectCode, examId } = req.params;

    const academic = await Academic.findOne({ user: req.user.userId });
    
    if (!academic) {
      return res.status(404).json({
        success: false,
        message: 'Academic record not found',
      });
    }

    const subject = academic.subjects.find(s => s.subjectCode === subjectCode);
    
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found',
      });
    }

    // Remove exam
    subject.exams.pull(examId);

    // Recalculate average score
    if (subject.exams.length > 0) {
      const totalPercentage = subject.exams.reduce((sum, exam) => sum + exam.percentage, 0);
      subject.averageScore = totalPercentage / subject.exams.length;

      // Update grade
      const avg = subject.averageScore;
      if (avg >= 90) subject.currentGrade = 'A+';
      else if (avg >= 80) subject.currentGrade = 'A';
      else if (avg >= 70) subject.currentGrade = 'B';
      else if (avg >= 60) subject.currentGrade = 'C';
      else if (avg >= 50) subject.currentGrade = 'D';
      else subject.currentGrade = 'F';
    } else {
      subject.averageScore = 0;
      subject.currentGrade = null;
    }

    // Recalculate overall percentage
    academic.overallPercentage = academic.calculateOverallPercentage();

    await academic.save();

    res.json({
      success: true,
      message: 'Exam result deleted successfully',
      data: academic,
    });
  } catch (error) {
    console.error('Delete exam result error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting exam result',
      error: error.message,
    });
  }
};

// @desc    Delete subject
// @route   DELETE /api/academics/subjects/:subjectCode
// @access  Private
const deleteSubject = async (req, res) => {
  try {
    const { subjectCode } = req.params;

    const academic = await Academic.findOne({ user: req.user.userId });
    
    if (!academic) {
      return res.status(404).json({
        success: false,
        message: 'Academic record not found',
      });
    }

    // Remove subject
    academic.subjects = academic.subjects.filter(s => s.subjectCode !== subjectCode);

    // Recalculate overall percentage
    academic.overallPercentage = academic.calculateOverallPercentage();

    await academic.save();

    res.json({
      success: true,
      message: 'Subject deleted successfully',
      data: academic,
    });
  } catch (error) {
    console.error('Delete subject error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting subject',
      error: error.message,
    });
  }
};

module.exports = {
  getAcademicRecords,
  addOrUpdateSubject,
  addExamResult,
  updateExamResult,
  deleteExamResult,
  deleteSubject,
};
