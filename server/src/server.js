import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import apiRoutes from './routes/index.js';
import { errorHandler } from './middleware/error.js';
import { User } from './models/User.js';
import { RateFeed } from './models/RateFeed.js';
import { DEFAULT_CORRIDORS, generateRailQuotes } from './services/fxAggregator.service.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// 1. Trust Reverse Proxy (Required for AWS ALB, Nginx, Cloudflare, Render, Railway, Heroku)
app.set('trust proxy', 1);

// 2. HTTP Security Headers
app.use(helmet());

// 3. Response Compression
app.use(compression());

// 4. Dynamic Multi-Origin CORS
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS origin ${origin} not allowed by policy`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// 5. Rate Limiting (DDoS & Brute-Force Protection)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'fail',
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // Limit auth attempts to 30 per 15 minutes
  message: {
    status: 'fail',
    message: 'Too many authentication attempts, please try again after 15 minutes.',
  },
});

app.use('/api/', globalLimiter);
app.use('/api/auth/', authLimiter);

// 6. Body Parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// 7. Request Logging
if (NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// 8. Health Check Endpoints (For Docker, K8s, AWS ALB, Render & Railway probes)
const getHealthStatus = () => ({
  status: 'healthy',
  timestamp: new Date().toISOString(),
  uptimeSeconds: Math.floor(process.uptime()),
  environment: NODE_ENV,
  database: {
    state: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    host: mongoose.connection.host || 'none',
  },
  memoryUsage: {
    rssMb: Number((process.memoryUsage().rss / 1024 / 1024).toFixed(2)),
    heapUsedMb: Number((process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)),
  },
  service: 'Cross-Border FX Spread & Remittance Router API',
});

app.get('/health', (req, res) => res.status(200).json(getHealthStatus()));
app.get('/api/health', (req, res) => res.status(200).json(getHealthStatus()));

// 9. API Routes
app.use('/api', apiRoutes);

// Root fallback
app.get('/', (req, res) => {
  res.json({
    name: 'Cross-Border FX Spread & Remittance Router API',
    version: '1.0.0',
    docs: '/api/health',
    status: 'online',
  });
});

// 10. Centralized Error Handler
app.use(errorHandler);

// Automatic DB self-seeding on fresh deployment if empty
const ensureInitialData = async () => {
  try {
    // 1. Ensure Super Admin Account
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@globaltrade.io';
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      console.log(`[Auto-Seed] Provisioning Super Admin account (${adminEmail})...`);
      await User.create({
        name: 'Alexander Vance',
        email: adminEmail,
        password: process.env.ADMIN_PASSWORD || 'Password123!',
        companyName: 'Global FX Router Operations',
        role: 'admin',
        pricingPlan: 'fixed_retainer',
        basisPointSplitRate: 20,
      });
      console.log('[Auto-Seed] Super Admin account ready.');
    }

    // 2. Ensure Treasury Manager Account
    const treasuryExists = await User.findOne({ email: 'treasury@globaltrade.io' });
    if (!treasuryExists) {
      console.log('[Auto-Seed] Provisioning Treasury Manager account (treasury@globaltrade.io)...');
      await User.create({
        name: 'Elena Rostova',
        email: process.env.INITIAL_ADMIN_EMAIL || 'treasury@globaltrade.io',
        password: process.env.INITIAL_ADMIN_PASSWORD || 'Password123!',
        companyName: 'Apex Industrial Dynamics Ltd.',
        role: 'treasury_manager',
        pricingPlan: 'basis_point_split',
        basisPointSplitRate: 20,
      });
      console.log('[Auto-Seed] Treasury Manager account ready.');
    }

    const rateFeedCount = await RateFeed.countDocuments();
    if (rateFeedCount === 0) {
      console.log('[Auto-Seed] Initializing base corridor rate feeds...');
      for (const [corridor, data] of Object.entries(DEFAULT_CORRIDORS)) {
        const [src, tgt] = corridor.split('-');
        const rails = generateRailQuotes(src, tgt, data.midRate);
        await RateFeed.create({
          corridor,
          sourceCurrency: src,
          targetCurrency: tgt,
          midMarketRate: data.midRate,
          rails,
          lastUpdated: new Date(),
        });
      }
      console.log('[Auto-Seed] Corridors & dynamic rails ready.');
    }
  } catch (err) {
    console.warn(`[Auto-Seed Warning] Could not complete auto-seed: ${err.message}`);
  }
};

// 11. Server Start & Graceful Shutdown
let serverInstance;

const startServer = async () => {
  await connectDB();
  await ensureInitialData();

  serverInstance = app.listen(PORT, () => {
    console.log(`[FX Router Server] Running on port ${PORT} in ${NODE_ENV} mode`);
    console.log(`[Health Probe] http://localhost:${PORT}/health`);
  });
};

const handleShutdown = async (signal) => {
  console.log(`\n[Shutdown] Received ${signal}. Closing HTTP server gracefully...`);
  if (serverInstance) {
    serverInstance.close(async () => {
      console.log('[Shutdown] Closed remaining active HTTP connections.');
      try {
        await mongoose.connection.close(false);
        console.log('[Shutdown] MongoDB connection closed.');
      } catch (err) {
        console.error('[Shutdown Error] Failed to close MongoDB:', err.message);
      }
      process.exit(0);
    });

    // Force exit if shutdown takes longer than 10s
    setTimeout(() => {
      console.error('[Shutdown] Forceful termination after 10s timeout.');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

startServer();
