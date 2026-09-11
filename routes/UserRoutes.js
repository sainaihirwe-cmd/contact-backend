import express from 'express';
import pool from '../db.js';
 
const router = express.Router();
 
// POST /users — add a new user
router.post('/users', async (req, res) => {
 const { name, email } = req.body;
 
  try {
    const result = await pool.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [name, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});
 
export default router;
