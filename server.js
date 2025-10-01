import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@libsql/client';

// Load environment variables
dotenv.config({ path: '.env' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.SERVER_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('dist')); // Serve built React app

// Initialize Turso client
function getTursoClient() {
  const url = process.env.TURSO_DATABASE_URL || process.env.VITE_TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN || process.env.VITE_TURSO_AUTH_TOKEN;

  if (!url) {
    throw new Error('Database URL not configured. Please set TURSO_DATABASE_URL environment variable.');
  }

  return createClient({ url, authToken });
}

const turso = getTursoClient();


// API Routes

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const server = app.listen(PORT, () => {
  const actualPort = server.address().port;
  console.log(`🚀 Local server running on http://localhost:${actualPort}`);
  console.log(`�� Email API endpoints available at:`);
  console.log(`   • POST /api/send-email-receipt`);
  console.log(`   • POST /api/send-employee-report`);
  console.log(`   • POST /api/send-test-email`);
});
