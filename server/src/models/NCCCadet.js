const mongoose = require('mongoose');

const NCCCadetSchema = new mongoose.Schema({
  slNo: Number,
  chNo: {
    type: String,
    required: true,
    unique: true,
    index: true,
    alias: 'chestNumber'
  },
  nccNo: String,
  rank: String,
  fullName: {
    type: String,
    required: true
  },
  directorate: String,
  groupHQ: String,
  nccUnit: String,
  dob: Date,
  education: String,
  specialAchievement: String,
  schoolCollege: String,
  catTeaching: String,
  mobile: String,
  aadhaar: String,
  food: String,
  permTemp: String,
  principal: String,
  coNameMobile: String,
  dc: String,
  email: String,
  dtOfSelect: Date,
  movOrder: String,
  nominalRoll: String,
  idemnityBond: String,
  medExamCert: String,
  riskCert: String,
  formIII: String,
  authentication: String,
  matriculation: String,
  dcCert: String,
  drowningCert: String,
  medStatus: String,
  wing: String,
  sdJdDiv: String,
  bloodGrp: String,
  arrivalDate: Date,
  arrivalTime: String,
  company: String,
  clubActivity: String,
  project: String,
  photo: String,
  dtOfComm: Date,
  rtu: String,
  married: String,
  nameOfNok: String,
  relationWithNok: String,
  mobileOfNok: String,
  addressOfNok: String,
  nameOfEmg: String,
  relationWithEmg: String,
  mobileOfEmg: String,
  addressOfEmg: String,
  doctor: String,
  hospital: String,
  image: String,
  // Track if user has signed up
  signedUp: {
    type: Boolean,
    default: false
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('NCCCadet', NCCCadetSchema);
