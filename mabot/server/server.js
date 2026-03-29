/**
 * MaBot - Household Coordination Platform
 * Main Server Entry Point
 */

/**
 * MaBot - Household Coordination Platform
 * Main Server Entry Point (Supabase Edition)
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');

dotenv.config();

// Verify Supabase connection on startup
const supabase = require('./utils/supabase');

// Import routes
const authRoutes = require('./routes/auth');
const familyRoutes = require('./routes/family');
const taskRoutes = require('./routes/tasks');
const groceryRoutes = require('./routes/groceries');
const billRoutes = require('./routes/bills');
const serviceRoutes = require('./routes/services');
const notificationRoutes = require('./routes/notifications');
const dashboardRoutes = require('./routes/dashboard');

// Import agent orchestration
const { runAgentOrchestration } = require('./services/orchestrator');

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/family', familyRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/groceries', groceryRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/api/health', async (req, res) => {
  // Quick DB ping
  const { error } = await supabase.from('users').select('id').limit(1);
  res.json({
    status: error ? 'DB_ERROR' : 'OK',
    message: 'MaBot API is running (Supabase)',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// ─── Agent Orchestration Cron ─────────────────────────────────────────────────
cron.schedule('0 * * * *', async () => {
  console.log('🤖 Running Agent Orchestration...');
  await runAgentOrchestration();
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
🚀 MaBot Server Running! (Supabase Edition)
   Port    : ${PORT}
   Mode    : ${process.env.NODE_ENV || 'development'}
   URL     : http://localhost:${PORT}
   API     : http://localhost:${PORT}/api
   DB      : Supabase PostgreSQL
  `);
});

module.exports = app;
