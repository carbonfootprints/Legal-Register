import mongoose from 'mongoose';
import logger from '../utils/logger.js';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
    maxPoolSize: 10,
    minPoolSize: 2,
    socketTimeoutMS: 45000,
    serverSelectionTimeoutMS: 5000,
  });

    logger.important(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`Database Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
