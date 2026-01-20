import '../../src/config/database.js';
import connectDB from '../../src/config/database.js';
import CronService from '../../src/services/cronService.js';

// Vercel Cron endpoint - Called daily at 9:30 AM
export default async function handler(req, res) {
  // Security: Only allow requests from Vercel Cron
  const authHeader = req.headers.authorization;

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized - Invalid cron secret'
    });
  }

  try {
    console.log('=====================================');
    console.log('Vercel Cron: Daily email check started');
    console.log('Time:', new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
    console.log('=====================================');

    // Ensure database connection
    await connectDB();

    // Run email notification check
    const result = await CronService.checkAndSendReminders();

    console.log('=====================================');
    console.log('Vercel Cron: Email check completed');
    console.log('Results:', result);
    console.log('=====================================');

    return res.status(200).json({
      success: true,
      message: 'Daily email check completed successfully',
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Vercel Cron Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Email check failed',
      error: error.message
    });
  }
}
