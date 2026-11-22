const dotenv = require('dotenv');

// Load environment variables before initializing dependencies
dotenv.config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(` AI Code Review Assistant Backend Server`);
      console.log(` Running in: ${process.env.NODE_ENV || 'development'} mode`);
      console.log(` Listening on: http://localhost:${PORT}`);
      console.log(` Health check: http://localhost:${PORT}/api/health`);
      console.log(`===============================================`);
    });

    // Graceful shutdown
    const handleShutdown = async (signal) => {
      console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        console.log('[Server] HTTP server closed.');
        try {
          const mongoose = require('mongoose');
          await mongoose.connection.close(false);
          console.log('[Server] MongoDB connection closed.');
        } catch (err) {
          console.error('[Server] Error closing MongoDB:', err);
        }
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));
  } catch (error) {
    console.error(`[Server] Failed to initialize: ${error.message}`);
    process.exit(1);
  }
};

startServer();
