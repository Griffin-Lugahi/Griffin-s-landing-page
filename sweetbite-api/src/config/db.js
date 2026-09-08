const { Pool, types } = require('pg');
const env = require('./env');

// Postgres DATE columns (like orders.delivery_date) get parsed by pg into
// JS Date objects by default, which then serialize to an ISO timestamp in
// UTC. A calendar date has no time-of-day component, so that round trip
// can silently shift the date by a day depending on the server's local
// timezone (e.g. "2026-09-20" becomes "2026-09-19T21:00:00.000Z" for a
// server running in EAT). Returning the raw 'YYYY-MM-DD' string instead
// avoids that entirely. 1082 is Postgres' internal type OID for DATE.
types.setTypeParser(1082, (val) => val);

const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: env.databaseSsl ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  // A background/idle client error should not crash the whole server.
  console.error('Unexpected Postgres pool error:', err);
});

module.exports = pool;