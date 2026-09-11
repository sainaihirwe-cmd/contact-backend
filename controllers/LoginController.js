import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
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

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const cleanPassword = typeof password === 'string' ? password : '';

    if (!cleanEmail || !cleanPassword) return res.status(400).json({ success: false, message: 'Email and password required' });

    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [cleanEmail]);
    const user = userResult.rows[0];

    if (!user) {
      await pool.query(
        'INSERT INTO login_attempts (email, ip, success) VALUES ($1, $2, FALSE)',
        [cleanEmail, req.ip]
      );
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(cleanPassword, user.password);
    await pool.query(
      'INSERT INTO login_attempts (email, ip, success) VALUES ($1, $2, $3)',
      [cleanEmail, req.ip, isMatch]
    );

    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = createToken(user);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      data: { id: user.id, username: user.username, email: user.email, role: user.role || 'user' }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    return res.status(500).json({ success: false, message: 'Login failed' });
  }
};
