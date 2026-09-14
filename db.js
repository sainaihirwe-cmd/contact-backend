import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

  ssl: isProduction
    ? {
        rejectUnauthorized: false,
      }
    : false,
});

// =========================
// PostgreSQL connection test
// =========================

pool.on('connect', () => {
  console.log('PostgreSQL connected successfully');
});

pool.on('error', (error) => {
  console.error('Unexpected PostgreSQL error:', error);
});

// =========================
// Initialize Database
// =========================

export async function initializeDatabase() {
  const client = await pool.connect();

  try {
    console.log('Initializing PostgreSQL database...');

    // =========================
    // Users
    // =========================

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // =========================
    // Contacts
    // =========================

    await client.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // =========================
    // Products
    // =========================

    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price NUMERIC(10, 2) DEFAULT 0,
        image TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

export default pool;