import cron from 'node-cron';
import LegalRegister from '../models/LegalRegister.js';
import EmailLog from '../models/EmailLog.js';
import EmailService from './emailService.js';

class CronService {
  // Run daily at 9:00 AM
  static startRenewalNotificationJob() {
    // Schedule: minute hour day month day-of-week
    // '0 9 * * *' = Every day at 9:00 AM
    cron.schedule('0 9 * * *', async () => {
      console.log('=====================================');
      console.log('Running renewal notification check...');
      console.log('Time:', new Date().toLocaleString());
      console.log('=====================================');

      await this.checkAndSendReminders();
    });

    console.log('✓ Cron job scheduled: Daily at 9:00 AM for renewal notifications');
  }

  static async checkAndSendReminders() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const sevenDaysLater = new Date(today);
      sevenDaysLater.setDate(today.getDate() + 7);

      const twoDaysLater = new Date(today);
      twoDaysLater.setDate(today.getDate() + 2);

      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      console.log('Checking for renewals:');
      console.log('- Yesterday (overdue check):', yesterday.toDateString());
      console.log('- Today:', today.toDateString());
      console.log('- Two days later:', twoDaysLater.toDateString());
      console.log('- Seven days later:', sevenDaysLater.toDateString());

      // Find all active legal registers
      const registers = await LegalRegister.find({
        status: { $in: ['Active', 'Pending Renewal'] },
        dueDateForRenewal: { $exists: true, $ne: null }
      }).populate('createdBy', 'email name');

      console.log(`Found ${registers.length} active legal registers to check`);

      let sevenDayCount = 0;
      let twoDayCount = 0;
      let dueTodayCount = 0;
      let overdueCount = 0;

      for (const register of registers) {
        const dueDate = new Date(register.dueDateForRenewal);
        dueDate.setHours(0, 0, 0, 0);

        console.log(`Checking: ${register.permit} (${register.documentNo})`);
        console.log(`  Due Date: ${dueDate.toDateString()}`);
        console.log(`  Yesterday: ${yesterday.toDateString()}`);
        console.log(`  Today: ${today.toDateString()}`);
        console.log(`  Two Days Later: ${twoDaysLater.toDateString()}`);
        console.log(`  Seven Days Later: ${sevenDaysLater.toDateString()}`);
        console.log(`  Matches 7 days? ${dueDate.getTime() === sevenDaysLater.getTime()}`);
        console.log(`  Matches 2 days? ${dueDate.getTime() === twoDaysLater.getTime()}`);
        console.log(`  Matches today? ${dueDate.getTime() === today.getTime()}`);
        console.log(`  Matches overdue? ${dueDate.getTime() === yesterday.getTime()}`);

        // Check for 7-day reminder
        if (dueDate.getTime() === sevenDaysLater.getTime()) {
          console.log(`  → Sending 7-day reminder...`);
          const sent = await this.sendReminderEmail(register, 'seven_day_reminder');
          if (sent) sevenDayCount++;
        }

        // Check for 2-day reminder
        if (dueDate.getTime() === twoDaysLater.getTime()) {
          console.log(`  → Sending 2-day reminder...`);
          const sent = await this.sendReminderEmail(register, 'two_day_reminder');
          if (sent) twoDayCount++;
        }

        // Check for due date reminder
        if (dueDate.getTime() === today.getTime()) {
          console.log(`  → Sending due today reminder...`);
          const sent = await this.sendReminderEmail(register, 'due_date_reminder');
          if (sent) dueTodayCount++;
        }

        // Check for overdue reminder (1 day past due)
        if (dueDate.getTime() === yesterday.getTime()) {
          console.log(`  → Sending overdue reminder...`);
          const sent = await this.sendReminderEmail(register, 'overdue_reminder');
          if (sent) overdueCount++;
        }
      }

      console.log('=====================================');
      console.log('Renewal notification check completed');
      console.log(`- 7-day reminders sent: ${sevenDayCount}`);
      console.log(`- 2-day reminders sent: ${twoDayCount}`);
      console.log(`- Due today reminders sent: ${dueTodayCount}`);
      console.log(`- Overdue reminders sent: ${overdueCount}`);
      console.log('=====================================');

      return {
        success: true,
        sevenDayReminders: sevenDayCount,
        twoDayReminders: twoDayCount,
        dueTodayReminders: dueTodayCount,
        overdueReminders: overdueCount
      };
    } catch (error) {
      console.error('Error in renewal notification job:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async sendReminderEmail(register, emailType) {
    try {
      // Check if email already SUCCESSFULLY sent for this renewal date
      const existingLog = await EmailLog.findOne({
        legalRegisterId: register._id,
        emailType: emailType,
        dueDateForRenewal: register.dueDateForRenewal,
        status: 'sent' // Only skip if previously sent successfully
      });

      if (existingLog) {
        console.log(`✓ Email already sent: ${emailType} for ${register.documentNo} (${register.permit})`);
        return false;
      }

      // Check if user has email
      if (!register.createdBy || !register.createdBy.email) {
        console.log(`✗ No email found for register: ${register.documentNo}`);
        return false;
      }

      // Send email
      const recipientEmail = register.createdBy.email;

      let subject;
      switch(emailType) {
        case 'seven_day_reminder':
          subject = `📢 Reminder: Permit Renewal Due in 7 Days - ${register.permit}`;
          break;
        case 'two_day_reminder':
          subject = `⚠️ Reminder: Permit Renewal Due in 2 Days - ${register.permit}`;
          break;
        case 'due_date_reminder':
          subject = `🚨 Alert: Permit Renewal Due Today - ${register.permit}`;
          break;
        case 'overdue_reminder':
          subject = `🔴 URGENT: Permit Renewal OVERDUE - ${register.permit}`;
          break;
        default:
          subject = `Permit Renewal Reminder - ${register.permit}`;
      }

      const emailContent = EmailService.generateReminderEmail(register, emailType);

      await EmailService.sendEmail(recipientEmail, subject, emailContent);

      // Log successful send
      await EmailLog.create({
        legalRegisterId: register._id,
        emailType: emailType,
        recipientEmail: recipientEmail,
        status: 'sent',
        dueDateForRenewal: register.dueDateForRenewal
      });

      console.log(`✓ Sent ${emailType} for ${register.documentNo} (${register.permit}) to ${recipientEmail}`);
      return true;
    } catch (error) {
      console.error(`✗ Failed to send ${emailType} for ${register.documentNo}:`, error.message);

      // Log failure
      try {
        await EmailLog.create({
          legalRegisterId: register._id,
          emailType: emailType,
          recipientEmail: register.createdBy ? register.createdBy.email : 'unknown',
          status: 'failed',
          errorMessage: error.message,
          dueDateForRenewal: register.dueDateForRenewal
        });
      } catch (logError) {
        console.error('Failed to log email error:', logError.message);
      }

      return false;
    }
  }

  // Manual trigger for testing (can be called via API endpoint)
  static async triggerManualCheck() {
    console.log('Manual renewal notification check triggered');
    return await this.checkAndSendReminders();
  }
}

export default CronService;
