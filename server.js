import 'dotenv/config.js';
import pool, { initializeDatabase } from './db.js';
import express from 'express';
import cors from 'cors';
import ContactRoutes from './routes/ContactRoutes.js';
import RegisterRoutes from './routes/RegisterRoutes.js';
import LoginRoutes from './routes/LoginRoutes.js';
import ProductRoutes from './routes/ProductRoutes.js';
import userRoutes from './routes/UserRoutes.js';
const app = express();
const port = process.env.PORT || 3032;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    database: 'postgres',
  });
});

app.use('/api/contact', ContactRoutes);
app.use('/api/auth/register', RegisterRoutes);
app.use('/api/auth/login', LoginRoutes);
app.use('/api/products', ProductRoutes);
app.use('/api/users', userRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

initializeDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log('Server started at http://localhost:' + port);
    });
  })
  .catch((error) => {
    console.error('PostgreSQL initialization error:', error.message);
    process.exit(1);
  });

export default app;
