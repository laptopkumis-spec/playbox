const pool = require('./config/database');
pool.query("UPDATE users SET role = 'admin' WHERE email = 'test1@example.com'")
  .then(() => console.log('Successfully promoted test1@example.com to admin.'))
  .catch(console.error)
  .finally(() => process.exit());
