# Legal Register Management System - Backend

A Node.js/Express backend API for managing legal permits and registrations with automated email notifications.

## Features

- JWT-based authentication
- CRUD operations for legal registers
- Automated email notifications (2 days before & on renewal date)
- Excel and PDF export functionality
- MongoDB database with Mongoose ODM
- SendGrid email integration
- Cron job for scheduled tasks

## Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account (or local MongoDB)
- SendGrid API key

## Setup Instructions

1. **Install Dependencies**
   ```bash
   cd legal-register-backend
   npm install
   ```

2. **Configure Environment Variables**

   Update the `.env` file with your settings:

   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb+srv://carbonfootprint882024_db_user:XdpeYnXxM2EDQP9l@cluster0.qvckwqx.mongodb.net/?appName=Cluster0
   JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
   JWT_EXPIRE=7d
   SENDGRID_API_KEY=your-sendgrid-api-key
   SENDGRID_FROM_EMAIL=noreply@yourcompany.com
   CORS_ORIGIN=http://localhost:5173
   ```

   **Important**:
   - Replace `your-sendgrid-api-key` with your actual SendGrid API key
   - Replace `noreply@yourcompany.com` with a verified sender email in SendGrid
   - Generate a strong JWT_SECRET (at least 32 characters)

3. **Get SendGrid API Key**

   - Sign up at https://sendgrid.com (Free tier: 100 emails/day)
   - Go to Settings > API Keys
   - Create a new API key with "Mail Send" permissions
   - Copy the API key to `.env`
   - Verify a sender email address in SendGrid

## Running the Server

### Development Mode (with nodemon)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Legal Registers
- `GET /api/legal-registers` - Get all (with pagination, search, filter)
- `GET /api/legal-registers/:id` - Get single entry
- `POST /api/legal-registers` - Create new entry (protected)
- `PUT /api/legal-registers/:id` - Update entry (protected)
- `DELETE /api/legal-registers/:id` - Delete entry (protected)
- `GET /api/legal-registers/alerts/expiry` - Get expiry alerts (protected)
- `GET /api/legal-registers/stats/summary` - Get statistics (protected)

### Export
- `GET /api/export/excel` - Export to Excel (protected)
- `GET /api/export/pdf` - Export to PDF (protected)

### Cron
- `POST /api/cron/trigger-email-check` - Manual email check (for testing)

## Email Notifications

The system automatically sends email notifications:

- **2 days before** the due date for renewal
- **On the day** of the renewal due date

The cron job runs daily at 9:00 AM to check for upcoming renewals.

### Testing Email Notifications

1. Create a legal register entry with `dueDateForRenewal` set to 2 days from now or today
2. Wait for the cron job (9:00 AM) OR manually trigger:
   ```bash
   POST http://localhost:5000/api/cron/trigger-email-check
   ```
3. Check the recipient's email inbox

## Database Schema

### User
- email, password (hashed), name, role, isActive

### LegalRegister
- slNo (auto-increment), permit, authorizationNo, issuingAuthority
- dateOfApplication, dateOfIssue, dateOfExpiry, dueDateForRenewal
- reportingFrequency, dateOfLastReport, responsibility, status
- createdBy, updatedBy

### EmailLog (prevents duplicates)
- legalRegisterId, emailType, recipientEmail, sentAt, status
- dueDateForRenewal (compound unique index)

## Technologies Used

- Express.js - Web framework
- Mongoose - MongoDB ODM
- bcryptjs - Password hashing
- jsonwebtoken - JWT authentication
- @sendgrid/mail - Email service
- node-cron - Task scheduling
- exceljs - Excel generation
- pdfkit - PDF generation

## Notes

- Email duplicate prevention is handled via compound unique index
- All dates are stored in UTC
- Serial numbers (slNo) are auto-generated
- Password minimum length: 6 characters
- JWT tokens expire after 7 days (configurable)

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB URI is correct
- Check network access in MongoDB Atlas (allow your IP)

### Email Not Sending
- Verify SendGrid API key is valid
- Check sender email is verified in SendGrid
- Review console logs for error messages

### Cron Job Not Running
- Check server logs at 9:00 AM daily
- Manually trigger via API endpoint to test
