module.exports = {
  apps: [
    {
      name: 'shopping-backend',
      script: 'npm',
      args: 'run start:pm2',
      watch: ['src'], // Watch the 'src' directory for changes
      ignore_watch: ['node_modules', 'dist'], // Ignore changes in 'node_modules' and 'dist'
      env: {
        NODE_ENV: 'development',
      },
    },
  ],
};
