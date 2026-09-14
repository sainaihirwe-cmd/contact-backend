import 'dotenv/config';

import express from 'express';
import cors from 'cors';

import { initializeDatabase } from './db.js';

import ContactRoutes from './routes/ContactRoutes.js';
import RegisterRoutes from './routes/RegisterRoutes.js';
import LoginRoutes from './routes/LoginRoutes.js';
import ProductRoutes from './routes/ProductRoutes.js';
import userRoutes from './routes/UserRoutes.js';

const app = express();

const port = process.env.PORT || 5050;

// =========================
// Middleware
// =========================

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

// =========================
// Health Check
// =========================

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    database: 'postgres',
  });
});

// =========================
// Routes
// =========================

app.use('/api/contact', ContactRoutes);

app.use('/api/auth/register', RegisterRoutes);

app.use('/api/auth/login', LoginRoutes);

app.use('/api/products', ProductRoutes);

app.use('/api/users', userRoutes);

// =========================
// 404
// =========================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// =========================
// Start Server
// =========================

initializeDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server started on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('PostgreSQL initialization error:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint,
    });

    process.exit(1);
  });

export default app;