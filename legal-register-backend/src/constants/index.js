// Application Constants

// User Roles
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin'
};

// Legal Register Status
export const REGISTER_STATUS = {
  ACTIVE: 'Active',
  EXPIRED: 'Expired',
  PENDING_RENEWAL: 'Pending Renewal',
  CANCELLED: 'Cancelled'
};

// Reporting Frequencies
export const REPORTING_FREQUENCIES = {
  NA: 'N/A',
  MONTHLY: 'Monthly',
  QUARTERLY: 'Quarterly',
  HALF_YEARLY: 'Half-Yearly',
  YEARLY: 'Yearly once',
  TWO_YEARS: 'Two years',
  THREE_YEARS: 'Three years once',
  FOUR_YEARS: 'Four years',
  FIVE_YEARS: 'Five years'
};

// Email Types
export const EMAIL_TYPES = {
  SEVEN_DAY_REMINDER: 'seven_day_reminder',
  TWO_DAY_REMINDER: 'two_day_reminder',
  DUE_DATE_REMINDER: 'due_date_reminder',
  OVERDUE_REMINDER: 'overdue_reminder'
};

// Pagination Defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
};

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_MIME_TYPES: [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  ALLOWED_EXTENSIONS: ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx']
};

// Password Requirements
export const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 8,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBER: true,
  REQUIRE_SPECIAL_CHAR: true
};

// JWT Settings
export const JWT_CONFIG = {
  DEFAULT_EXPIRE: '7d',
  RESET_TOKEN_EXPIRE: 60 * 60 * 1000 // 1 hour in milliseconds
};

// Rate Limiting
export const RATE_LIMITS = {
  API: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100
  },
  AUTH: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 5
  },
  PASSWORD_RESET: {
    WINDOW_MS: 60 * 60 * 1000, // 1 hour
    MAX_REQUESTS: 3
  },
  UPLOAD: {
    WINDOW_MS: 60 * 60 * 1000, // 1 hour
    MAX_REQUESTS: 20
  }
};

// Alert Categories (Days)
export const ALERT_THRESHOLDS = {
  OVERDUE: 0,
  DUE_TODAY: 0,
  DUE_TWO_DAYS: 2,
  DUE_WEEK: 7,
  DUE_MONTH: 30
};

// Error Messages
export const ERROR_MESSAGES = {
  // Auth
  INVALID_CREDENTIALS: 'Invalid credentials',
  USER_EXISTS: 'User already exists with this email',
  USER_NOT_FOUND: 'User not found',
  USER_INACTIVE: 'User account is inactive',
  UNAUTHORIZED: 'Not authorized to access this resource',
  TOKEN_EXPIRED: 'Token has expired',
  TOKEN_INVALID: 'Invalid token',

  // Validation
  REQUIRED_FIELDS: 'Please provide all required fields',
  INVALID_EMAIL: 'Please provide a valid email',
  PASSWORD_WEAK: 'Password does not meet requirements',
  PASSWORDS_NOT_MATCH: 'Passwords do not match',

  // Legal Register
  REGISTER_NOT_FOUND: 'Legal register entry not found',

  // File Upload
  NO_FILE: 'No file uploaded',
  INVALID_FILE_TYPE: 'Invalid file type',
  FILE_TOO_LARGE: 'File size exceeds limit',

  // General
  SERVER_ERROR: 'Internal server error',
  RATE_LIMIT_EXCEEDED: 'Too many requests, please try again later'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  // Auth
  REGISTER_SUCCESS: 'Registration successful',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logged out successfully',
  PASSWORD_RESET_SENT: 'If an account exists with this email, you will receive a password reset link',
  PASSWORD_RESET_SUCCESS: 'Password reset successful. You can now login with your new password.',

  // Legal Register
  REGISTER_CREATED: 'Legal register created successfully',
  REGISTER_UPDATED: 'Legal register updated successfully',
  REGISTER_DELETED: 'Legal register entry deleted successfully',

  // File Upload
  FILE_UPLOADED: 'File uploaded successfully',
  FILE_DELETED: 'File deleted successfully',

  // Export
  EXPORT_SUCCESS: 'Export completed successfully'
};
