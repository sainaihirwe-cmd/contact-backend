import jwt from 'jsonwebtoken';
import User from '../models/Register.js';
import pool from '../db.js';
const createToken = (user) => jwt.sign(
  {
    id: user._id,
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

    const existing = await User.findOne({ email: cleanEmail });
    if (existing) return res.status(409).json({ success: false, message: 'Email already registered' });

    const user = new User({ username: cleanUsername, email: cleanEmail, password: cleanPassword, phone: cleanPhone || undefined, role: 'user' });
    await user.save();

    const token = createToken(user);

    return res.status(201).json({
      success: true,
      message: 'Registered successfully',
      token,
      data: { id: user._id, username: user.username, email: user.email, role: user.role || 'user' }
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Registration failed' });
  }
};
