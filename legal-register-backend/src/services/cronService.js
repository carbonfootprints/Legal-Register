import cron from 'node-cron';
import LegalRegister from '../models/LegalRegister.js';
import EmailLog from '../models/EmailLog.js';
import EmailService from './emailService.js';
import logger from '../utils/logger.js';

class CronService {
  // Run daily at 9:00 AM
  static startRenewalNotificationJob() {
    // Schedule: minute hour day month day-of-week
    // '0 9 * * *' = Every day at 9:00 AM
    cron.schedule('0 9 * * *', async () => {
      logger.log('=====================================');
      logger.log('Running renewal notification check...');
      logger.log('Time:', new Date().toLocaleString());
      logger.log('=====================================');

      await this.checkAndSendReminders();
    });

    logger.log('✓ Cron job scheduled: Daily at 9:00 AM for renewal notifications');
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

      logger.log('Checking for renewals:');
      logger.log('- Yesterday (overdue check):', yesterday.toDateString());
      logger.log('- Today:', today.toDateString());
      logger.log('- Two days later:', twoDaysLater.toDateString());
      logger.log('- Seven days later:', sevenDaysLater.toDateString());

      // Find all active legal registers
      const registers = await LegalRegister.find({
        status: { $in: ['Active', 'Pending Renewal'] },
        dueDateForRenewal: { $exists: true, $ne: null }
      }).populate('createdBy', 'email name');

      logger.log(`Found ${registers.length} active legal registers to check`);

      let sevenDayCount = 0;
      let twoDayCount = 0;
      let dueTodayCount = 0;
      let overdueCount = 0;

      for (const register of registers) {
        const dueDate = new Date(register.dueDateForRenewal);
        dueDate.setHours(0, 0, 0, 0);

        logger.log(`Checking: ${register.permit} (${register.documentNo})`);
        logger.log(`  Due Date: ${dueDate.toDateString()}`);
        logger.log(`  Yesterday: ${yesterday.toDateString()}`);
        logger.log(`  Today: ${today.toDateString()}`);
        logger.log(`  Two Days Later: ${twoDaysLater.toDateString()}`);
        logger.log(`  Seven Days Later: ${sevenDaysLater.toDateString()}`);
        logger.log(`  Matches 7 days? ${dueDate.getTime() === sevenDaysLater.getTime()}`);
        logger.log(`  Matches 2 days? ${dueDate.getTime() === twoDaysLater.getTime()}`);
        logger.log(`  Matches today? ${dueDate.getTime() === today.getTime()}`);
        logger.log(`  Matches overdue? ${dueDate.getTime() === yesterday.getTime()}`);

        // Check for 7-day reminder
        if (dueDate.getTime() === sevenDaysLater.getTime()) {
          logger.log(`  → Sending 7-day reminder...`);
          const sent = await this.sendReminderEmail(register, 'seven_day_reminder');
          if (sent) sevenDayCount++;
        }

        // Check for 2-day reminder
        if (dueDate.getTime() === twoDaysLater.getTime()) {
          logger.log(`  → Sending 2-day reminder...`);
          const sent = await this.sendReminderEmail(register, 'two_day_reminder');
          if (sent) twoDayCount++;
        }

        // Check for due date reminder
        if (dueDate.getTime() === today.getTime()) {
          logger.log(`  → Sending due today reminder...`);
          const sent = await this.sendReminderEmail(register, 'due_date_reminder');
          if (sent) dueTodayCount++;
        }

        // Check for overdue reminder (1 day past due)
        if (dueDate.getTime() === yesterday.getTime()) {
          logger.log(`  → Sending overdue reminder...`);
          const sent = await this.sendReminderEmail(register, 'overdue_reminder');
          if (sent) overdueCount++;
        }
      }

      logger.log('=====================================');
      logger.log('Renewal notification check completed');
      logger.log(`- 7-day reminders sent: ${sevenDayCount}`);
      logger.log(`- 2-day reminders sent: ${twoDayCount}`);
      logger.log(`- Due today reminders sent: ${dueTodayCount}`);
      logger.log(`- Overdue reminders sent: ${overdueCount}`);
      logger.log('=====================================');

      return {
        success: true,
        sevenDayReminders: sevenDayCount,
        twoDayReminders: twoDayCount,
        dueTodayReminders: dueTodayCount,
        overdueReminders: overdueCount
      };
    } catch (error) {
      logger.error('Error in renewal notification job:', error);
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
        logger.log(`✓ Email already sent: ${emailType} for ${register.documentNo} (${register.permit})`);
        return false;
      }

      // Check if user has email
      if (!register.createdBy || !register.createdBy.email) {
        logger.log(`✗ No email found for register: ${register.documentNo}`);
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

      logger.log(`✓ Sent ${emailType} for ${register.documentNo} (${register.permit}) to ${recipientEmail}`);
      return true;
    } catch (error) {
      logger.error(`✗ Failed to send ${emailType} for ${register.documentNo}:`, error.message);

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
        logger.error('Failed to log email error:', logError.message);
      }

      return false;
    }
  }

  // Manual trigger for testing (can be called via API endpoint)
  static async triggerManualCheck() {
    logger.log('Manual renewal notification check triggered');
    return await this.checkAndSendReminders();
  }
}

export default CronService;
