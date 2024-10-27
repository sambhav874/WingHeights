export default ({ env }) => ({
    host: env('HOST', '127.0.0.1'),
    port: env.int('PORT', 1338),
    app: {
      keys: env.array('APP_KEYS', ['default_key']), 
    },
  url: env('PUBLIC_URL', 'https://srv618269.hstgr.cloud')  , 
    admin: {
      auth: {
        secret: env('ADMIN_JWT_SECRET', 'your-production-admin-secret'),
      },
    },
  });