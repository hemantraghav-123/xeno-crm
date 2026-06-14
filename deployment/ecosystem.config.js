// PM2 Ecosystem Configuration for Xeno CRM
// Path on server: /var/www/xeno-crm/ecosystem.config.js
// Start all services with: pm2 start ecosystem.config.js

module.exports = {
  apps: [
    {
      name: 'frontend',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/xeno-crm/frontend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '250M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
    {
      name: 'backend',
      script: 'dist/server.js',
      cwd: '/var/www/xeno-crm/backend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
    },
    {
      name: 'channel-service',
      script: 'dist/server.js',
      cwd: '/var/www/xeno-crm/channel-service',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '150M',
      env: {
        NODE_ENV: 'production',
        PORT: 6001,
      },
    },
  ],
};
