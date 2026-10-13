import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import app from './app';
import { seedDatabase } from './seeds/seedData';

const PORT = process.env.PORT || 5001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/home_management_db';


const startServer = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connection established successfully.');

    if (process.env.SEED_ON_START === 'true') {
      await seedDatabase();
    }

    app.listen(PORT, () => {
      console.log(`Household Financial API running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
