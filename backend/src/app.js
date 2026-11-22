const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const errorHandler = require('./middleware/errorHandler');
const { checkOllamaHealth } = require('./services/ollamaService');

// Route handlers
const authRoutes = require('./routes/authRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const app = express();

// Trust reverse proxy (crucial for Render, AWS ELB, Cloudflare, Nginx)
app.set('trust proxy', 1);

// CORS configuration supporting single/multiple origins and Vercel domains
const configuredOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((url) => url.trim().replace(/\/+$/, ''))
  : [];

const baseAllowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost',
  'http://127.0.0.1',
  ...configuredOrigins,
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) {
      return callback(null, true);
    }
    const cleanOrigin = origin.replace(/\/+$/, '');
    const isExplicitlyAllowed = baseAllowedOrigins.includes(cleanOrigin);
    const isVercelDomain = /^https:\/\/[a-zA-Z0-9_-]+\.vercel\.app$/.test(cleanOrigin);
    const isLocalDev =
      process.env.NODE_ENV !== 'production' &&
      (cleanOrigin.startsWith('http://localhost:') || cleanOrigin.startsWith('http://127.0.0.1:'));

    if (isExplicitlyAllowed || isVercelDomain || isLocalDev) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy: Request origin not allowed.'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// HTTP body parsing with 5MB limit
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Request logging (suppressed in test environment, combined format in production)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Health check endpoint (checks Express, MongoDB & Ollama connectivity)
app.get('/api/health', async (req, res) => {
  const ollamaStatus = await checkOllamaHealth();
  const dbStateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  const dbState = mongoose.connection.readyState;
  const dbStatus = dbStateMap[dbState] || 'unknown';
  const memUsage = process.memoryUsage();

  res.status(200).json({
    success: true,
    status: dbState === 1 ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    service: 'VIBECRAFT AI Code Review Assistant Backend',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptimeSeconds: Math.floor(process.uptime()),
    memoryUsageMB: {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
    },
    database: {
      status: dbStatus,
      connected: dbState === 1,
      host: mongoose.connection.host || 'N/A',
      name: mongoose.connection.name || 'N/A',
    },
    ollama: ollamaStatus,
  });
});

// Mount modular API routes
app.use('/api/auth', authRoutes);
app.use('/api/reviews', reviewRoutes);

// Catch-all for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found.`,
  });
});

// Centralized error handler
app.use(errorHandler);

module.exports = app;
