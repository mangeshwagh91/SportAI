// Script to clear all user records from database (excluding admin users for safety)
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../src/models/User');

const clearUserRecords = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete all users except admins (for safety)
    const result = await User.deleteMany({ role: { $ne: 'admin' } });
    console.log(`Deleted ${result.deletedCount} user records (admin users preserved)`);
    
    // If you want to delete ALL users including admins, uncomment the line below:
    // const result = await User.deleteMany({});
    // console.log(`Deleted ${result.deletedCount} user records (including admins)`);

    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

clearUserRecords();
