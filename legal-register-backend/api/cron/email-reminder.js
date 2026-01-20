import connectDB from '../../src/config/database.js';
import CronService from '../../src/services/cronService.js';

// Public cron endpoint - Called by external cron service (cron-job.org)
// This endpoint is secured by using a secret token in the URL
export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed. Use GET request.'
    });
  }

  // Check secret token from query parameter
  const token = req.query.token;
  const expectedToken = process.env.CRON_SECRET || 'legal-register-cron-secret-key-2024-vercel-secure-token';

  if (token !== expectedToken) {
    console.log('Unauthorized cron attempt - Invalid token');
    return res.status(401).json({
      success: false,
      message: 'Unauthorized - Invalid token'
    });
  }

  try {
    console.log('=====================================');
    console.log('External Cron: Daily email check started');
    console.log('Time:', new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
    console.log('=====================================');

    // Ensure database connection
    await connectDB();

    // Run email notification check
    const result = await CronService.checkAndSendReminders();

    console.log('=====================================');
    console.log('External Cron: Email check completed');
    console.log('Results:', result);
    console.log('=====================================');

    return res.status(200).json({
      success: true,
      message: 'Daily email check completed successfully',
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('External Cron Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Email check failed',
      error: error.message
    });
  }
}
