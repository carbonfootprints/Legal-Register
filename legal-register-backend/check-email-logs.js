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

const checkEmailLogs = async () => {
  await connectDB();

  const logs = await EmailLog.find({}).sort({ createdAt: -1 });

  console.log('='.repeat(60));
  console.log('EMAIL LOGS');
  console.log('='.repeat(60));
  console.log(`Total email logs: ${logs.length}\n`);

  if (logs.length === 0) {
    console.log('No email logs found.');
  } else {
    logs.forEach((log, index) => {
      console.log(`${index + 1}. ${log.emailType}`);
      console.log(`   Recipient: ${log.recipientEmail}`);
      console.log(`   Status: ${log.status}`);
      console.log(`   Due Date: ${log.dueDateForRenewal?.toDateString() || 'N/A'}`);
      console.log(`   Sent At: ${log.createdAt?.toLocaleString() || 'N/A'}`);
      if (log.errorMessage) {
        console.log(`   Error: ${log.errorMessage}`);
      }
      console.log('');
    });
  }

  console.log('='.repeat(60));

  await mongoose.disconnect();
  process.exit(0);
};

checkEmailLogs().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
