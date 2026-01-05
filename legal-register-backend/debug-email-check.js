import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import LegalRegister from './src/models/LegalRegister.js';
import User from './src/models/User.js';

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ MongoDB Connected');
  } catch (error) {
    console.error('✗ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

const debugEmailCheck = async () => {
  await connectDB();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const twoDaysLater = new Date(today);
  twoDaysLater.setDate(today.getDate() + 2);

  console.log('='.repeat(60));
  console.log('EMAIL CHECK DEBUG REPORT');
  console.log('='.repeat(60));
  console.log('\n📅 DATE INFORMATION:');
  console.log('Today (normalized):', today.toISOString());
  console.log('Today (readable):', today.toDateString());
  console.log('Two days later:', twoDaysLater.toDateString());
  console.log('Today timestamp:', today.getTime());
  console.log('Two days timestamp:', twoDaysLater.getTime());

  // Find all legal registers
  const allRegisters = await LegalRegister.find({})
    .populate('createdBy', 'email name');

  console.log('\n📊 DATABASE STATISTICS:');
  console.log('Total legal registers:', allRegisters.length);

  if (allRegisters.length === 0) {
    console.log('\n⚠️  NO LEGAL REGISTERS FOUND IN DATABASE!');
    console.log('Please create legal register entries first.');
    process.exit(0);
  }

  // Filter active registers with renewal dates
  const activeWithRenewal = allRegisters.filter(r =>
    ['Active', 'Pending Renewal'].includes(r.status) && r.dueDateForRenewal
  );

  console.log('Active with renewal dates:', activeWithRenewal.length);

  console.log('\n📋 ALL LEGAL REGISTERS:');
  allRegisters.forEach((register, index) => {
    const dueDate = register.dueDateForRenewal ? new Date(register.dueDateForRenewal) : null;
    if (dueDate) {
      dueDate.setHours(0, 0, 0, 0);
    }

    console.log(`\n${index + 1}. ${register.permit} (${register.authorizationNo})`);
    console.log(`   Status: ${register.status}`);
    console.log(`   Created By: ${register.createdBy?.email || 'No user'}`);
    console.log(`   Renewal Date: ${dueDate ? dueDate.toISOString() : 'Not set'}`);
    console.log(`   Renewal Date (readable): ${dueDate ? dueDate.toDateString() : 'Not set'}`);

    if (dueDate) {
      console.log(`   Renewal timestamp: ${dueDate.getTime()}`);
      console.log(`   Matches today? ${dueDate.getTime() === today.getTime()}`);
      console.log(`   Matches 2 days? ${dueDate.getTime() === twoDaysLater.getTime()}`);

      const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
      console.log(`   Days until renewal: ${diffDays}`);
    }
  });

  console.log('\n' + '='.repeat(60));
  console.log('MATCHING LOGIC:');
  console.log('='.repeat(60));

  const dueTodayMatches = activeWithRenewal.filter(r => {
    const dueDate = new Date(r.dueDateForRenewal);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() === today.getTime();
  });

  const twoDayMatches = activeWithRenewal.filter(r => {
    const dueDate = new Date(r.dueDateForRenewal);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() === twoDaysLater.getTime();
  });

  console.log(`\n✅ Due Today Matches: ${dueTodayMatches.length}`);
  dueTodayMatches.forEach(r => {
    console.log(`   - ${r.permit} (${r.authorizationNo})`);
  });

  console.log(`\n✅ Due in 2 Days Matches: ${twoDayMatches.length}`);
  twoDayMatches.forEach(r => {
    console.log(`   - ${r.permit} (${r.authorizationNo})`);
  });

  console.log('\n' + '='.repeat(60));

  await mongoose.disconnect();
  process.exit(0);
};

debugEmailCheck().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
