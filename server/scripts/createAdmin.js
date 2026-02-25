const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../src/models/User');

const createAdmin = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@sportai.com' });
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email: admin@sportai.com');
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@sportai.com',
      password: 'admin123',
      role: 'admin',
      onboardingComplete: true
    });

    console.log('✅ Admin user created successfully!');
    console.log('Email: admin@sportai.com');
    console.log('Password: admin123');
    console.log('\n⚠️  Please change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();
