# Legal Register Management System - Frontend

A React-based frontend application for managing legal permits and registrations with a modern, responsive UI.

## Features

- User authentication (Register/Login/Logout)
- Dashboard with statistics and expiry alerts
- Complete CRUD operations for legal registers
- Color-coded renewal alerts (Red/Orange/Yellow/Green)
- Search and filter functionality
- Excel and PDF export
- Responsive design with TailwindCSS
- Real-time form validation

## Prerequisites

- Node.js (v18 or higher)
- Running backend server (see backend README)

## Setup Instructions

1. **Install Dependencies**
   ```bash
   cd legal-register-frontend
   npm install
   ```

2. **Configure Environment Variables**

   The `.env` file is already configured:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

   If your backend runs on a different port, update this URL.

## Running the Application

### Development Mode
```bash
npm run dev
```

The application will start on `http://localhost:5173`

### Build for Production
```bash
npm run build
```

The build output will be in the `dist/` directory.

## Usage Guide

### 1. Register/Login

- Navigate to `http://localhost:5173`
- You'll be redirected to the login page
- Click "Register here" to create a new account
- Fill in your name, email, and password (min. 6 characters)
- After registration, you'll be automatically logged in

### 2. Dashboard

The dashboard shows:

- **Statistics Cards**: Total permits, active permits, expiring soon, overdue
- **Renewal Alerts**: Categorized by urgency
  - **Red**: Due today or overdue
  - **Orange**: Due within 2 days
  - **Yellow**: Due within a week
  - **Green**: Safe (7+ days)

### 3. Legal Registers

#### Add New Entry
1. Click "Add New" button
2. Fill in all required fields (marked with *)
3. Select dates using the date picker
4. Choose reporting frequency and status
5. Click "Create"

#### Edit Entry
1. Click the edit icon (pencil) on any row
2. Modify the fields
3. Click "Update"

#### Delete Entry
1. Click the delete icon (trash) on any row
2. Confirm deletion

#### Search
- Use the search bar to filter by permit name, authorization number, or issuing authority
- Results update automatically as you type

#### Export
- **Excel**: Click "Excel" button to download .xlsx file
- **PDF**: Click "PDF" button to download .pdf file
- Exports include current search filters

### 4. Logout

- Click on your name in the top-right corner
- Select "Logout" from the dropdown

## Technologies Used

- React 18
- Vite - Build tool
- React Router - Routing
- Axios - HTTP client
- TailwindCSS - Styling
- react-hook-form - Form management
- react-hot-toast - Notifications
- react-datepicker - Date selection
- react-icons - Icon library
- date-fns - Date utilities

## Troubleshooting

### Cannot Connect to Backend
- Ensure backend server is running on port 5000
- Check `.env` file has correct API URL

### Login/Register Not Working
- Verify backend server is running
- Password must be at least 6 characters

### Export Not Working
- Ensure you're logged in
- Check backend server is running
