// Logger utility that only logs in development mode
const isDevelopment = process.env.NODE_ENV !== 'production';

const logger = {
  log: (...args) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  error: (...args) => {
    console.error(...args);
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
