const { Pool } = require('pg');
const env = require('./env');

const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: env.databaseSsl ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  // A background/idle client error should not crash the whole server.
  console.error('Unexpected Postgres pool error:', err);
});

module.exports = pool;
