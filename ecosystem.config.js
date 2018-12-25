module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps: [
    // Second application
    {
      name: "ticket-manager-api-server",
      script: "ticket-manager/api-server/app.js",
      env: {
        COMMON_VARIABLE: "true",
        APP_NAME: "ticket-manager-api-server",
        PORT: 5000
      },
      env_production: {
        NODE_ENV: "production"
      },
      ignore_watch: ["ticket-manager/client/*"]
    }
  ]
};
