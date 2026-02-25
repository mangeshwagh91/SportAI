// Script to clear all academic records so they can be recreated with new PT Test subjects
const mongoose = require('mongoose');
require('dotenv').config();

const Academic = require('../src/models/Academic');

const clearAcademicRecords = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const result = await Academic.deleteMany({});
    console.log(`Deleted ${result.deletedCount} academic records`);
    console.log('Academic records cleared. New records will be created with updated PT Test subjects.');

    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

clearAcademicRecords();
