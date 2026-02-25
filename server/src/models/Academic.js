const mongoose = require('mongoose');

const examResultSchema = new mongoose.Schema({
  examName: {
    type: String,
    required: true,
  },
  marks: {
    type: Number,
    min: 0,
  },
  maxMarks: {
    type: Number,
    default: 100,
  },
  percentage: {
    type: Number,
  },
  grade: {
    type: String,
    enum: ['EX', 'G', 'S', ''],
  },
  result: {
    type: String,
    enum: ['Pass', 'Fail', ''],
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

const subjectSchema = new mongoose.Schema({
  subjectName: {
    type: String,
    required: true,
  },
  subjectCode: {
    type: String,
    required: true,
  },
  exams: [examResultSchema],
  currentGrade: {
    type: String,
  },
  averageScore: {
    type: Number,
  },
});

const academicSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  subjects: [subjectSchema],
  academicYear: {
    type: String,
  },
  semester: {
    type: String,
  },
  overallPercentage: {
    type: Number,
  },
}, {
  timestamps: true,
});

// Calculate percentage before saving
examResultSchema.pre('save', function(next) {
  if (this.marks !== undefined && this.maxMarks) {
    this.percentage = (this.marks / this.maxMarks) * 100;
  }
  next();
});

// Calculate average score for subject
subjectSchema.methods.calculateAverage = function() {
  if (this.exams.length === 0) return 0;
  const total = this.exams.reduce((sum, exam) => sum + (exam.percentage || 0), 0);
  return total / this.exams.length;
};

// Calculate overall percentage
academicSchema.methods.calculateOverallPercentage = function() {
  if (this.subjects.length === 0) return 0;
  
  let totalPercentage = 0;
  let subjectCount = 0;
  
  this.subjects.forEach(subject => {
    const avg = subject.exams.length > 0 
      ? subject.exams.reduce((sum, exam) => sum + (exam.percentage || 0), 0) / subject.exams.length
      : 0;
    
    if (avg > 0) {
      totalPercentage += avg;
      subjectCount++;
    }
  });
  
  return subjectCount > 0 ? totalPercentage / subjectCount : 0;
};

module.exports = mongoose.model('Academic', academicSchema);
