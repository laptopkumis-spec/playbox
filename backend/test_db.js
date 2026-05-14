const pool = require('./config/database');
async function test() {
  try {
    const [users] = await pool.query('SELECT * FROM users LIMIT 1');
    console.log(users);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}
test();
