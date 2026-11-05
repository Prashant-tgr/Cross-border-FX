import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import apiRoutes from './routes/index.js';
import { errorHandler } from './middleware/error.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middlewares
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// API Routes
app.use('/api', apiRoutes);

// Root fallback
app.get('/', (req, res) => {
  res.json({
    name: 'Cross-Border FX Spread & Remittance Router API',
    version: '1.0.0',
    docs: '/api/health',
  });
});

// Centralized error handler
app.use(errorHandler);

// Connect DB and listen
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[FX Router Server] Running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`[API Base] http://localhost:${PORT}/api`);
  });
};

startServer();
