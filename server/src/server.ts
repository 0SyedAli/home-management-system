import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import app from './app';
import { seedDatabase } from './seeds/seedData';

import { initCronJobs, resetMonthlyCommitteeStatus } from './services/cronService';

// In cPanel Phusion Passenger, process.env.PORT is provided dynamically
const PORT = process.env.PORT || 5001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/home_management_db';

// 1. Start HTTP Server immediately so Passenger/cPanel does NOT time out with 503
const server = app.listen(PORT, () => {
  console.log(`Household Financial API running on port ${PORT}`);
});

// 2. Initialize background cron jobs
initCronJobs();

// 3. Connect to MongoDB asynchronously
console.log('Connecting to MongoDB...');
mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('MongoDB connection established successfully.');
    if (process.env.SEED_ON_START === 'true') {
      await seedDatabase();
    }
    // Check and initialize current month's status for committee members
    await resetMonthlyCommitteeStatus().catch((e) => console.log('Monthly status check:', e.message));
  })
  .catch((error) => {
    console.error('MongoDB connection error (Check MongoDB Atlas Network Access IP Whitelist!):', error.message);
  });

export default server;
