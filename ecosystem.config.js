module.exports = {
  apps: [
    {
      name: "xeno-crm-backend",
      script: "./backend/dist/server.js",
      env: {
        NODE_ENV: "production",
        PORT: 5000
      }
    },
    {
      name: "xeno-crm-channel-service",
      script: "./channel-service/dist/server.js",
      env: {
        NODE_ENV: "production",
        PORT: 6001
      }
    }
  ]
};
