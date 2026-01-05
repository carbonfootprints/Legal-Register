import dotenv from 'dotenv';
dotenv.config();

import EmailService from './src/services/emailService.js';
import fs from 'fs';

// Mock register data
const mockRegister = {
  permit: "Test Environmental Certificate",
  authorizationNo: "TEST-123",
  issuingAuthority: "Test Authority",
  dueDateForRenewal: new Date('2026-01-05'),
  reportingFrequency: "Yearly once",
  responsibility: "Test Officer"
};

console.log('Generating test emails...\n');

// Generate "due today" email
const dueTodayEmail = EmailService.generateReminderEmail(mockRegister, 'due_date_reminder');
fs.writeFileSync('email-due-today.html', dueTodayEmail);
console.log('✓ Generated "due today" email → email-due-today.html');

// Generate "2 days" email
const twoDaysEmail = EmailService.generateReminderEmail(mockRegister, 'two_day_reminder');
fs.writeFileSync('email-2-days.html', twoDaysEmail);
console.log('✓ Generated "2 days" email → email-2-days.html');

console.log('\nCheck for differences:');
console.log('- email-due-today.html should have RED color (#DC2626) and say "DUE TODAY"');
console.log('- email-2-days.html should have ORANGE color (#FFA500) and say "DUE IN 2 DAYS"');

// Quick validation
if (dueTodayEmail.includes('#DC2626') && dueTodayEmail.includes('today')) {
  console.log('\n✓ "Due today" email looks correct (RED, contains "today")');
} else {
  console.log('\n✗ "Due today" email has issues');
}

if (twoDaysEmail.includes('#FFA500') && twoDaysEmail.includes('in 2 days')) {
  console.log('✓ "2 days" email looks correct (ORANGE, contains "in 2 days")');
} else {
  console.log('✗ "2 days" email has issues');
}

console.log('\nOpen the HTML files in a browser to verify visually.');
