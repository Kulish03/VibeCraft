import express from 'express';
import cors from 'cors';
import reviewRoutes from './routes/reviewRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Middlewares
app.use(cors());

// Parse JSON bodies with a conservative size limit (50 KB) to prevent oversized payloads
app.use(express.json({ limit: '50kb' }));

// Health-check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Backend server is running healthy and ready for requests.',
    timestamp: new Date().toISOString()
  });
});

// Code Review Routes
app.use('/api/review', reviewRoutes);

// Fallback 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `The requested endpoint ${req.method} ${req.originalUrl} does not exist.`
    }
  });
});

// Centralized error handling middleware (always placed after routes)
app.use(errorHandler);

export default app;
