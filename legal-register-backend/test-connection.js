const mongoose = require('mongoose');
require('dotenv').config();

console.log('Testing MongoDB Connection...');
console.log('MongoDB URI:', process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log('✅ MongoDB Connected Successfully!');
  console.log('Connection state:', mongoose.connection.readyState);
  process.exit(0);
})
.catch(err => {
  console.error('❌ MongoDB Connection Failed:');
  console.error('Error name:', err.name);
  console.error('Error message:', err.message);
  console.error('Full error:', err);
  process.exit(1);
});

setTimeout(() => {
  console.log('Connection timeout after 15 seconds');
  process.exit(1);
}, 15000);
