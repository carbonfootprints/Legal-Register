// Application Constants

// User Roles
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin'
};

// Legal Register Status Options
export const REGISTER_STATUS = {
  ACTIVE: 'Active',
  EXPIRED: 'Expired',
  PENDING_RENEWAL: 'Pending Renewal',
  CANCELLED: 'Cancelled'
};

export const STATUS_OPTIONS = [
  { value: 'Active', label: 'Active' },
  { value: 'Expired', label: 'Expired' },
  { value: 'Pending Renewal', label: 'Pending Renewal' },
  { value: 'Cancelled', label: 'Cancelled' }
];

// Reporting Frequency Options
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

export const FREQUENCY_OPTIONS = [
  { value: 'N/A', label: 'N/A' },
  { value: 'Monthly', label: 'Monthly' },
  { value: 'Quarterly', label: 'Quarterly' },
  { value: 'Half-Yearly', label: 'Half-Yearly' },
  { value: 'Yearly once', label: 'Yearly once' },
  { value: 'Two years', label: 'Two years' },
  { value: 'Three years once', label: 'Three years once' },
  { value: 'Four years', label: 'Four years' },
  { value: 'Five years', label: 'Five years' }
];

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_SIZE_MB: 10,
  ACCEPTED_FORMATS: '.pdf,.jpg,.jpeg,.png,.doc,.docx',
  ACCEPTED_TYPES: [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
};

// Password Requirements
export const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 8,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBER: true,
  REQUIRE_SPECIAL_CHAR: true,
  SPECIAL_CHARS: '!@#$%^&*(),.?":{}|<>'
};

// Alert Thresholds (in days)
export const ALERT_THRESHOLDS = {
  CRITICAL: 2,   // Red - 2 days or less
  WARNING: 7,    // Orange - 7 days or less
  CAUTION: 30    // Yellow - 30 days or less
};

// Status Badge Colors
export const STATUS_COLORS = {
  Active: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200'
  },
  Expired: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200'
  },
  'Pending Renewal': {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200'
  },
  Cancelled: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-200'
  }
};

// Urgency Badge Colors
export const URGENCY_COLORS = {
  expired: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    class: 'bg-gray-100 text-gray-800'
  },
  critical: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    class: 'bg-red-100 text-red-800'
  },
  warning: {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    class: 'bg-orange-100 text-orange-800'
  },
  caution: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    class: 'bg-yellow-100 text-yellow-800'
  },
  safe: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    class: 'bg-green-100 text-green-800'
  }
};

// Dashboard Stats Cards
export const DASHBOARD_CARDS = [
  { key: 'total', label: 'Total Permits', color: 'blue', icon: 'document' },
  { key: 'active', label: 'Active', color: 'green', icon: 'check' },
  { key: 'expiringSoon', label: 'Expiring Soon', color: 'yellow', icon: 'clock' },
  { key: 'overdue', label: 'Overdue', color: 'red', icon: 'alert' }
];

// Routes
export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  DASHBOARD: '/dashboard',
  LEGAL_REGISTERS: '/legal-registers',
  ARCHIVED_PERMITS: '/archived-permits'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user'
};

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    LOGOUT: '/auth/logout',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password'
  },
  LEGAL_REGISTERS: {
    BASE: '/legal-registers',
    STATS: '/legal-registers/stats/summary',
    ALERTS: '/legal-registers/alerts/expiry',
    ARCHIVED: '/legal-registers/archived'
  },
  EXPORT: {
    EXCEL: '/export/excel',
    PDF: '/export/pdf'
  },
  UPLOAD: {
    SINGLE: '/upload/single',
    DOCUMENTS: '/upload/documents'
  }
};

// Validation Messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  PASSWORD_MIN_LENGTH: `Password must be at least ${PASSWORD_REQUIREMENTS.MIN_LENGTH} characters`,
  PASSWORD_UPPERCASE: 'Password must contain at least one uppercase letter',
  PASSWORD_LOWERCASE: 'Password must contain at least one lowercase letter',
  PASSWORD_NUMBER: 'Password must contain at least one number',
  PASSWORD_SPECIAL: 'Password must contain at least one special character',
  PASSWORDS_MATCH: 'Passwords do not match'
};

// Toast Messages
export const TOAST_MESSAGES = {
  // Success
  LOGIN_SUCCESS: 'Login successful!',
  REGISTER_SUCCESS: 'Registration successful!',
  LOGOUT_SUCCESS: 'Logged out successfully',
  SAVE_SUCCESS: 'Saved successfully',
  DELETE_SUCCESS: 'Deleted successfully',
  UPLOAD_SUCCESS: 'File uploaded successfully',
  EXPORT_SUCCESS: 'Export completed successfully',
  PASSWORD_RESET_SENT: 'Password reset link sent to your email',
  PASSWORD_RESET_SUCCESS: 'Password reset successful!',

  // Error
  LOGIN_FAILED: 'Login failed',
  REGISTER_FAILED: 'Registration failed',
  SAVE_FAILED: 'Failed to save',
  DELETE_FAILED: 'Failed to delete',
  UPLOAD_FAILED: 'Failed to upload file',
  EXPORT_FAILED: 'Export failed',
  LOAD_FAILED: 'Failed to load data',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SESSION_EXPIRED: 'Session expired. Please login again.'
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'dd/MM/yyyy',
  INPUT: 'yyyy-MM-dd',
  FULL: 'dd MMMM yyyy',
  SHORT: 'dd MMM yyyy'
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100]
};
