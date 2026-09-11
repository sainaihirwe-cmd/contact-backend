import express from 'express';
import pkg from 'pg';
const { Pool } = pkg;

const app = express();
const PORT = 3032;

// 1. DATABASE CONNECTION CONFIGURATION
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'contact_us',
  password: 'MyNewSecurePassword123', // ◄ Use your exact database password
  port: 5432,
});

// 2. CRITICAL MIDDLEWARE (Fixes common routing issues/hangs)
app.use(express.json()); 

// 3. POST ROUTE: CREATE NEW USER
app.post('/api/users', async (req, res) => {
  const { name, email} = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    // 1. AUTOMATIC TABLE GENERATOR (Fixes the "relation does not exist" error)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL
      );
    `);

    // 2. NOW RUN YOUR INSERT COMMAND SAFELY
    const queryText = `
      INSERT INTO users (name, email) 
      VALUES ($1, $2) 
      RETURNING *;
    `;
    const values = [name, email];
    
    const result = await pool.query(queryText, values);
    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error('Database Error:', error);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running smoothly on http://localhost:${PORT}`);
});
