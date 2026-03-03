module.exports = {
  apps: [
    {
      name: 'legal-register-backend',
      script: 'src/server.js',
      interpreter: 'node',
      interpreter_args: '--experimental-specifier-resolution=node',

      // Environment
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },

      // Restart behavior
      watch: false,
      max_memory_restart: '512M',
      restart_delay: 5000,
      max_restarts: 10,

      // Logging
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      out_file: './logs/app-out.log',
      error_file: './logs/app-error.log',
      merge_logs: true,

      // Cluster mode (set instances: 1 for single core VPS)
      instances: 1,
      exec_mode: 'fork',
    },
  ],
};
