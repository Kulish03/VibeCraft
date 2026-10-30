import dotenv from 'dotenv';
import app from './app.js';

// Load environment variables from .env file
dotenv.config();

// Read port from environment variable with fallback to 5000
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(` Backend server started successfully!`);
  console.log(` Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(` Listening on: http://localhost:${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/api/health`);
  console.log(`=========================================`);
});
