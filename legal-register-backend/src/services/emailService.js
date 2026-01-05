import nodemailer from 'nodemailer';

class EmailService {
  static createTransporter() {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  static async sendEmail(to, subject, htmlContent) {
    const transporter = this.createTransporter();

    const mailOptions = {
      from: `"Legal Register System" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: htmlContent
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`Email sent to ${to} - Subject: ${subject}`);
      console.log('Message ID:', info.messageId);
      return { success: true };
    } catch (error) {
      console.error('Email error:', error.message);
      throw error;
    }
  }

  static generateReminderEmail(register, emailType) {
    let daysText, urgencyColor, badgeText;

    switch(emailType) {
      case 'seven_day_reminder':
        daysText = 'in 7 days';
        badgeText = 'DUE IN 7 DAYS';
        urgencyColor = '#3B82F6'; // Blue
        break;
      case 'two_day_reminder':
        daysText = 'in 2 days';
        badgeText = 'DUE IN 2 DAYS';
        urgencyColor = '#FFA500'; // Orange
        break;
      case 'due_date_reminder':
        daysText = 'today';
        badgeText = 'DUE TODAY';
        urgencyColor = '#DC2626'; // Red
        break;
      case 'overdue_reminder':
        daysText = 'OVERDUE (1 day past due)';
        badgeText = 'OVERDUE';
        urgencyColor = '#991B1B'; // Dark Red
        break;
      default:
        daysText = 'soon';
        badgeText = 'REMINDER';
        urgencyColor = '#6B7280'; // Gray
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: ${urgencyColor};
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
          }
          .content {
            background-color: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 5px 5px;
          }
          .alert-badge {
            display: inline-block;
            background-color: ${urgencyColor};
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
            margin-bottom: 15px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background-color: white;
          }
          td {
            padding: 12px;
            border: 1px solid #ddd;
          }
          td:first-child {
            font-weight: bold;
            background-color: #f5f5f5;
            width: 40%;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #ddd;
            color: #666;
            font-size: 12px;
          }
          .action-required {
            background-color: #FEF3C7;
            border-left: 4px solid #F59E0B;
            padding: 15px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="margin: 0;">⚠️ Permit Renewal Alert</h2>
          </div>
          <div class="content">
            <div class="alert-badge">${badgeText}</div>

            <p>This is an automated reminder that the following permit renewal is due <strong>${daysText}</strong>:</p>

            <table>
              <tr>
                <td>Permit</td>
                <td>${register.permit}</td>
              </tr>
              <tr>
                <td>Authorization No.</td>
                <td>${register.authorizationNo}</td>
              </tr>
              <tr>
                <td>Issuing Authority</td>
                <td>${register.issuingAuthority}</td>
              </tr>
              <tr>
                <td>Due Date for Renewal</td>
                <td><strong style="color: ${urgencyColor};">${new Date(register.dueDateForRenewal).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong></td>
              </tr>
              <tr>
                <td>Reporting Frequency</td>
                <td>${register.reportingFrequency}</td>
              </tr>
              <tr>
                <td>Responsibility</td>
                <td>${register.responsibility}</td>
              </tr>
            </table>

            <div class="action-required">
              <strong>📋 Action Required:</strong> Please take necessary steps to renew this permit on time to maintain compliance.
            </div>

            <div class="footer">
              <p>This is an automated message from the Legal Register Management System.</p>
              <p>Do not reply to this email. For any queries, please contact your system administrator.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export default EmailService;
