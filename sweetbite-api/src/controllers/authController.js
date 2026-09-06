const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { signToken } = require('../utils/jwt');

const SALT_ROUNDS = 10;

// Never send password_hash back to the client.
function toPublicUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    createdAt: row.created_at,
  };
}

async function register(req, res) {
  const { name, email, phone, password } = req.body;

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const result = await pool.query(
    `INSERT INTO users (name, email, phone, password_hash)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, phone, created_at`,
    [name, email.toLowerCase(), phone || null, passwordHash]
  );

  const user = result.rows[0];
  const token = signToken({ sub: user.id, email: user.email });

  res.status(201).json({ token, user: toPublicUser(user) });
}

async function login(req, res) {
  const { email, password } = req.body;

  const result = await pool.query(
    `SELECT id, name, email, phone, password_hash, created_at
     FROM users WHERE email = $1`,
    [email.toLowerCase()]
  );

  const user = result.rows[0];

  // Same error for "no such user" and "wrong password" — don't leak
  // which one it was, that's a free account-enumeration oracle otherwise.
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = signToken({ sub: user.id, email: user.email });
  res.json({ token, user: toPublicUser(user) });
}

async function getMe(req, res) {
  const result = await pool.query(
    `SELECT id, name, email, phone, created_at FROM users WHERE id = $1`,
    [req.userId]
  );

  const user = result.rows[0];
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  res.json({ user: toPublicUser(user) });
}

async function updateMe(req, res) {
  const { name, phone } = req.body;

  const result = await pool.query(
    `UPDATE users
     SET name = COALESCE($1, name), phone = COALESCE($2, phone)
     WHERE id = $3
     RETURNING id, name, email, phone, created_at`,
    [name || null, phone || null, req.userId]
  );

  const user = result.rows[0];
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  res.json({ user: toPublicUser(user) });
}

async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;

  const result = await pool.query(
    `SELECT password_hash FROM users WHERE id = $1`,
    [req.userId]
  );
  const user = result.rows[0];
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const currentMatches = await bcrypt.compare(currentPassword, user.password_hash);
  if (!currentMatches) {
    return res.status(401).json({ error: 'Current password is incorrect.' });
  }

  const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await pool.query(`UPDATE users SET password_hash = $1 WHERE id = $2`, [newHash, req.userId]);

  res.json({ message: 'Password updated.' });
}

module.exports = { register, login, getMe, updateMe, changePassword };
