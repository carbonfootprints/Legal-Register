import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import EmailLog from './src/models/EmailLog.js';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ MongoDB Connected');
  } catch (error) {
    console.error('✗ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

const clearLogs = async () => {
  await connectDB();

  const result = await EmailLog.deleteMany({});
  console.log(`✓ Cleared ${result.deletedCount} email logs`);

  await mongoose.disconnect();
  process.exit(0);
};

clearLogs().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
