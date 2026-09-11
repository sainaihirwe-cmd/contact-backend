import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import pool from '../db.js';
const createToken = (user) => jwt.sign(
  {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role || 'user',
  },
  process.env.JWT_SECRET || 'contact-app-secret',
  { expiresIn: '7d' }
);

export const registerUser = async (req, res) => {
  try {
    const { username, email, password, phone } = req.body;

    const errors = [];
    const cleanUsername = typeof username === 'string' ? username.trim() : '';
    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const cleanPassword = typeof password === 'string' ? password : '';
    const cleanPhone = typeof phone === 'string' ? phone.replace(/\D/g, '').slice(0, 15) : '';

    if (!cleanUsername || cleanUsername.length < 3) errors.push('Username must be at least 3 characters');
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) errors.push('Valid email is required');
    if (!cleanPassword || cleanPassword.length < 8) errors.push('Password must be at least 8 characters');

    if (errors.length > 0) return res.status(400).json({ success: false, errors });

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [cleanEmail]);
    if (existing.rowCount > 0) return res.status(409).json({ success: false, message: 'Email already registered' });

    const result = await pool.query(
      `INSERT INTO users (username, email, password, phone, role)
       VALUES ($1, $2, $3, $4, 'user')
       RETURNING id, username, email, role`,
      [cleanUsername, cleanEmail, await bcrypt.hash(cleanPassword, 10), cleanPhone || null]
    );
    const user = result.rows[0];

    const token = createToken(user);

    return res.status(201).json({
      success: true,
      message: 'Registered successfully',
      token,
      data: { id: user.id, username: user.username, email: user.email, role: user.role || 'user' }
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Registration failed' });
  }
};
