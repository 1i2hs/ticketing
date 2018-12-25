module.exports = {
  /**
   * Application configuration section
   * This json config file is for microservice
   */
  apps: [
    // First application
    {
      name: "qrcode-generator",
      script: "qrcode-generator/app.js",
      env: {
        COMMON_VARIABLE: "true",
        APP_NAME: "grcode-generator",
        PORT: 4000
      },
      env_production: {
        NODE_ENV: "production"
      },
      ignore_watch: ["ticket-manager/client/*"]
    },
    // Second application
    {
      name: "ticket-manager-api-server",
      script: "ticket-manager/api-server/ms_app.js",
      env: {
        COMMON_VARIABLE: "true",
        APP_NAME: "ticket-manager-api-server",
        QRCODE_GENERATOR_ADDRESS: "http://localhost:4000",
        PORT: 5000
      },
      env_production: {
        NODE_ENV: "production"
      },
      ignore_watch: ["ticket-manager/client/*"]
    }
  ]
};
