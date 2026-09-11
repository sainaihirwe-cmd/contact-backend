import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/Register.js';
import LoginAttempt from '../models/Login.js';
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

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const cleanPassword = typeof password === 'string' ? password : '';

    if (!cleanEmail || !cleanPassword) return res.status(400).json({ success: false, message: 'Email and password required' });

    const user = await User.findOne({ email: cleanEmail });
    const attempt = new LoginAttempt({ email: cleanEmail, ip: req.ip });

    if (!user) {
      attempt.success = false;
      await attempt.save();
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(cleanPassword, user.password);
    attempt.success = isMatch;
    await attempt.save();

    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = createToken(user);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      data: { id: user._id, username: user.username, email: user.email, role: user.role || 'user' }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    return res.status(500).json({ success: false, message: 'Login failed' });
  }
};
