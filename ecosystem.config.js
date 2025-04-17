module.exports = {
  apps: [
    {
      name: "bartertap-app",
      script: "./server/index.js", // Build olunmuş nəticənin yolu
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 5000
      },
      watch: false,
      ignore_watch: ["node_modules", "logs", "uploads"],
      max_memory_restart: "500M",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      out_file: "./logs/app-out.log",
      error_file: "./logs/app-error.log",
      merge_logs: true,
      autorestart: true,
      exp_backoff_restart_delay: 100,
      max_restarts: 10,
      restart_delay: 1000,
      env_production: {
        PORT: 5000,
        NODE_ENV: "production",
      }
    }
  ],
  deploy: {
    production: {
      user: "u726371272",
      host: "46.202.156.134",
      path: "~/public_html",
      "post-deploy": "npm install --production && pm2 startOrRestart ecosystem.config.js --env production"
    }
  }
};