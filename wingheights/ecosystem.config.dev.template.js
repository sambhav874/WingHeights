module.exports = {
  apps: [
    {
      name: 'frontend-dev',
      cwd: '/root/project/WingHeights/wingheights/frontend',
      script: 'npm',
      args: 'run start',
      env: {
        PORT: 3001,
        NODE_ENV: 'development',
      },
    },
    {
      name: 'backend-dev',
      cwd: '/root/project/WingHeights/wingheights/backend',
      script: 'npm',
      args: 'run start',
      env: {
        PORT: 1339,
        NODE_ENV: 'development',
      },
    },
  ],
};
