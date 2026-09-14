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
        username VARCHAR(255),
        phone VARCHAR(20),
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS id SERIAL,
      ADD COLUMN IF NOT EXISTS username VARCHAR(255),
      ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
      ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';
    `);

    await client.query(`
      UPDATE users
      SET username = split_part(email, '@', 1)
      WHERE username IS NULL;
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS login_attempts (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        ip VARCHAR(255),
        success BOOLEAN NOT NULL DEFAULT FALSE,
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
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      ALTER TABLE contacts
      ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
    `);

    await client.query(`
      ALTER TABLE contacts
      ADD COLUMN IF NOT EXISTS id SERIAL;
    `);

    await client.query(`
      ALTER TABLE contacts
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
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
        quantity INTEGER DEFAULT 0,
        category VARCHAR(255),
        image TEXT,
        created_by INTEGER,
        created_by_name VARCHAR(255),
        created_by_role VARCHAR(50),
        updated_by INTEGER,
        updated_by_name VARCHAR(255),
        updated_by_role VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      ALTER TABLE products
      ADD COLUMN IF NOT EXISTS id SERIAL,
      ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS category VARCHAR(255),
      ADD COLUMN IF NOT EXISTS created_by INTEGER,
      ADD COLUMN IF NOT EXISTS created_by_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS created_by_role VARCHAR(50),
      ADD COLUMN IF NOT EXISTS updated_by INTEGER,
      ADD COLUMN IF NOT EXISTS updated_by_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS updated_by_role VARCHAR(50),
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
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