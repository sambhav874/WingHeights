module.exports = {
  apps: [
    {
      name: 'frontend-prod',
      cwd: './frontend',
      script: 'npm',
      args: 'start',
      env: {
        PORT: 3000,
        NODE_ENV: 'production',
      },
    },
    {
      name: 'backend-prod',
      cwd: './backend',
      script: 'npm',
      args: 'start',
      env: {
        PORT: 1338,
        NODE_ENV: 'production',
      },
    },
  ],
};
