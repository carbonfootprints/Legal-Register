// Logger utility that only logs in development mode
const isDevelopment = process.env.NODE_ENV !== 'production';

const logger = {
  log: (...args) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  error: (...args) => {
    // Always log errors, but with less detail in production
    if (isDevelopment) {
      console.error(...args);
    } else {
      // In production, log only the error message, not full stack
      const message = args[0];
      console.error(typeof message === 'string' ? message : 'An error occurred');
    }
  },
  warn: (...args) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  info: (...args) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },
  // For important logs that should always appear (like server startup)
  important: (...args) => {
    console.log(...args);
  },
};

export default logger;
