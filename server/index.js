import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './db.js';
import authRoutes from './routes/auth.js';
import leadsRoutes from './routes/leads.js';
import scrapingRoutes from './routes/scraping.js';
import { authenticateToken } from './middleware/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
await initializeDatabase();

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/leads', authenticateToken, leadsRoutes);
app.use('/api/scraping', authenticateToken, scrapingRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Propela API is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Propela Server running on http://localhost:${PORT}`);
  console.log(`📊 Dashboard available at http://localhost:3000`);
});
