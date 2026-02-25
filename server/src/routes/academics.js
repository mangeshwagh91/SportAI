const express = require('express');
const router = express.Router();
const {
  getAcademicRecords,
  addOrUpdateSubject,
  addExamResult,
  updateExamResult,
  deleteExamResult,
  deleteSubject,
} = require('../controllers/academicController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Academic records routes
router.get('/', getAcademicRecords);

// Subject routes
router.post('/subjects', addOrUpdateSubject);
router.delete('/subjects/:subjectCode', deleteSubject);

// Exam routes
router.post('/subjects/:subjectCode/exams', addExamResult);
router.put('/subjects/:subjectCode/exams/:examId', updateExamResult);
router.delete('/subjects/:subjectCode/exams/:examId', deleteExamResult);

module.exports = router;
