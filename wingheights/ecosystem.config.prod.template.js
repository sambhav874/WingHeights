module.exports = {
  apps: [
    {
      name: 'frontend-prod',
      cwd: '/root/project/WingHeights/wingheights/frontend',
      script: 'npm',
      args: 'run start',
      env: {
        PORT: 3000,
        NODE_ENV: 'production',
      },
    },
    {
      name: 'backend-prod',
      cwd: '/root/project/WingHeights/wingheights/backend',
      script: 'npm',
      args: 'run start',
      env: {
        PORT: 1338,
        NODE_ENV: 'production',
      },
    },
  ],
};

