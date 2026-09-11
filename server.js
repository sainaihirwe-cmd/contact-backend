import 'dotenv/config.js';
import pool from './db.js';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import ContactRoutes from './routes/ContactRoutes.js';
import RegisterRoutes from './routes/RegisterRoutes.js';
import LoginRoutes from './routes/LoginRoutes.js';
import ProductRoutes from './routes/ProductRoutes.js';
import userRoutes from './routes/UserRoutes.js';
const app = express();
const port = process.env.PORT || 3032;
const mongoURI = process.env.MONGODB_URI;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

mongoose
  .connect(mongoURI, {
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => console.log('Connected to MongoDB successfully!'))
  .catch((error) => console.error('MongoDB connection error:', error.message));

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
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

app.listen(port, () => {
  console.log('Server started at http://localhost:' + port);
});

export default app;
