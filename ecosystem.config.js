module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps: [
    // First application
    {
      name: "qrcode-generator",
      script: "qrcode-generator/app.js",
      env: {
        COMMON_VARIABLE: "true",
        APP_NAME: "qrcode-generator",
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
      script: "ticket-manager/api-server/app.js",
      env: {
        COMMON_VARIABLE: "true",
        APP_NAME: "ticket-manager-api-server",
        PORT: 5000,
        QRCODE_GENERATOR_ADDRESS: "http://localhost:4000"
      },
      env_production: {
        TICKET_CHECK_PAGE_BASE_URI: ""
      },
      ignore_watch: ["ticket-manager/client/*"]
    }
    // {
    //   name: "ticket-manager-web-server",
    //   script: "ticket-manager/web-server/app.js"
    // }
  ],

  /**
   * Deployment section
   * http://pm2.keymetrics.io/docs/usage/deployment/
   */
  deploy: {
    production: {
      user: "node",
      host: "212.83.163.1",
      ref: "origin/master",
      repo: "git@github.com:repo.git",
      path: "/var/www/production",
      "post-deploy":
        "npm install && pm2 reload ecosystem.config.js --env production"
    },
    dev: {
      user: "node",
      host: "212.83.163.1",
      ref: "origin/master",
      repo: "git@github.com:repo.git",
      path: "/var/www/development",
      "post-deploy": "npm install && pm2 reload ecosystem.config.js --env dev",
      env: {
        NODE_ENV: "dev"
      }
    }
  }
};
