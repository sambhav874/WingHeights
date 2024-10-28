module.exports = {
  apps: [
    {
      name: 'frontend-dev',
      cwd: './frontend',
      script: 'npm',
      args: 'start',
      env: {
        PORT: 3001,
        NODE_ENV: 'development',
      },
    },
    {
      name: 'backend-dev',
      cwd: './backend',
      script: 'npm',
      args: 'start',
      env: {
        PORT: 1339,
        NODE_ENV: 'development',
      },
    },
  ],
};
