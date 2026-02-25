const mongoose = require('mongoose');

const PTTestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cadet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NCCCadet'
  },
  testDate: {
    type: Date,
    default: Date.now
  },
  ageGroup: {
    type: String,
    enum: ['under30', '30to40', '40to45', '45to50', '50to55', 'over55'],
    required: true
  },
  // 1.2 KM Run (time in format "6:30" or "MIN")
  run1_2km: {
    time: String,
    grade: {
      type: String,
      enum: ['EX', 'G', 'S', 'FAIL']
    }
  },
  // Bend Knee Sit-up (number of reps)
  bendKneeSitup: {
    count: Number,
    grade: {
      type: String,
      enum: ['EX', 'G', 'S', 'FAIL']
    }
  },
  // Push-up (number of reps)
  pushUp: {
    count: Number,
    grade: {
      type: String,
      enum: ['EX', 'G', 'S', 'FAIL']
    }
  },
  // 5 Meter Shuttle Run in 1 Min (number of shuttles)
  shuttle5m: {
    count: Number,
    grade: {
      type: String,
      enum: ['EX', 'G', 'S', 'FAIL']
    }
  },
  // 1.5 KM Walk (time in format "14:00" or "MIN")
  walk1_5km: {
    time: String,
    grade: {
      type: String,
      enum: ['EX', 'G', 'S', 'FAIL']
    }
  },
  // 1 KM Walk (time in format "13:00" or "MIN")
  walk1km: {
    time: String,
    grade: {
      type: String,
      enum: ['EX', 'G', 'S', 'FAIL']
    }
  },
  // Firing Test (5 bullets - score out of 5)
  firingTest: {
    score: {
      type: Number,
      min: 0,
      max: 5
    },
    grade: {
      type: String,
      enum: ['EX', 'G', 'S', 'FAIL']
    }
  },
  overallGrade: {
    type: String,
    enum: ['EX', 'G', 'S', 'FAIL']
  },
  remarks: String,
  submittedBy: {
    type: String,
    enum: ['self', 'admin'],
    default: 'self'
  }
}, {
  timestamps: true
});

// Calculate overall grade based on individual test grades
PTTestSchema.methods.calculateOverallGrade = function() {
  const grades = [];
  
  if (this.run1_2km?.grade) grades.push(this.run1_2km.grade);
  if (this.bendKneeSitup?.grade) grades.push(this.bendKneeSitup.grade);
  if (this.pushUp?.grade) grades.push(this.pushUp.grade);
  if (this.shuttle5m?.grade) grades.push(this.shuttle5m.grade);
  if (this.walk1_5km?.grade) grades.push(this.walk1_5km.grade);
  if (this.walk1km?.grade) grades.push(this.walk1km.grade);
  if (this.firingTest?.grade) grades.push(this.firingTest.grade);
  
  if (grades.includes('FAIL')) return 'FAIL';
  
  const exCount = grades.filter(g => g === 'EX').length;
  const gCount = grades.filter(g => g === 'G').length;
  
  if (exCount >= grades.length * 0.7) return 'EX';
  if (exCount + gCount >= grades.length * 0.6) return 'G';
  return 'S';
};

module.exports = mongoose.model('PTTest', PTTestSchema);
