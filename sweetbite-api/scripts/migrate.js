// Runs db/schema.sql directly through the pg driver instead of shelling
// out to psql. This avoids two problems the old npm-script approach had:
//   1. npm scripts run through cmd.exe on Windows, which doesn't understand
//      the bash "$DATABASE_URL" syntax the old script relied on.
//   2. It required psql to be installed and on PATH, which is an extra
//      manual setup step this project doesn't otherwise need.
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const sqlPath = path.join(__dirname, '..', 'db', 'schema.sql');

async function run() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set. Copy .env.example to .env and fill it in.');
    process.exit(1);
  }

  const sql = fs.readFileSync(sqlPath, 'utf8');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log('Running db/schema.sql...');
    // A plain string with no parameters goes through Postgres' simple
    // query protocol, which runs multiple semicolon-separated statements
    // in one call — exactly what a schema file needs.
    await pool.query(sql);
    console.log('Migration complete.');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

run();