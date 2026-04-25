require('dotenv').config();
require('express-async-errors');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Import database connection
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const needRoutes = require('./routes/needs');
const volunteerRoutes = require('./routes/volunteers');
const taskRoutes = require('./routes/tasks');
const surveyRoutes = require('./routes/surveys');
const matchingRoutes = require('./routes/matching');

// Import error handlers
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Connect to database
connectDB();

// Initialize Express app
const app = express();
const port  = process.env.PORT ;

// ============================================
// MIDDLEWARE
// ============================================

// Security headers
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://community-pulse-frontend.onrender.com/']
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// HTTP request logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.'
  }
});
app.use('/api/', limiter);

// ============================================
// HEALTH CHECK
// ============================================

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'CommunityPulse API is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ============================================
// API DOCUMENTATION ROUTE
// ============================================

app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to CommunityPulse API - Smart Resource Allocation for Social Impact',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Register a new user',
        'POST /api/auth/login': 'Login user',
        'GET  /api/auth/me': 'Get current user (Protected)',
        'PUT  /api/auth/profile': 'Update profile (Protected)',
        'PUT  /api/auth/change-password': 'Change password (Protected)'
      },
      needs: {
        'GET    /api/needs': 'Get all community needs (filterable)',
        'GET    /api/needs/stats': 'Get need statistics',
        'GET    /api/needs/:id': 'Get single need',
        'POST   /api/needs': 'Create a need (Protected)',
        'PUT    /api/needs/:id': 'Update a need (Protected)',
        'PUT    /api/needs/:id/verify': 'Verify a need (Protected)',
        'DELETE /api/needs/:id': 'Delete a need (Admin)'
      },
      volunteers: {
        'GET    /api/volunteers': 'Get all volunteers (filterable)',
        'GET    /api/volunteers/stats': 'Get volunteer statistics',
        'GET    /api/volunteers/:id': 'Get single volunteer',
        'POST   /api/volunteers': 'Register as volunteer',
        'PUT    /api/volunteers/:id': 'Update volunteer (Protected)',
        'PATCH  /api/volunteers/:id/status': 'Update status (Protected)',
        'POST   /api/volunteers/:id/rate': 'Rate volunteer (Protected)',
        'DELETE /api/volunteers/:id': 'Delete volunteer (Admin)'
      },
      tasks: {
        'GET    /api/tasks': 'Get all tasks (filterable)',
        'GET    /api/tasks/board': 'Get task board grouped by status',
        'GET    /api/tasks/:id': 'Get single task',
        'POST   /api/tasks': 'Create a task (Protected)',
        'PUT    /api/tasks/:id': 'Update a task (Protected)',
        'POST   /api/tasks/:id/assign': 'Assign volunteer (Protected)',
        'POST   /api/tasks/:id/unassign': 'Unassign volunteer (Protected)',
        'POST   /api/tasks/:id/complete': 'Complete task (Protected)',
        'DELETE /api/tasks/:id': 'Delete task (Admin)'
      },
      surveys: {
        'GET    /api/surveys': 'Get all survey entries',
        'GET    /api/surveys/stats': 'Get survey statistics',
        'GET    /api/surveys/:id': 'Get single survey',
        'POST   /api/surveys': 'Submit a field report',
        'PUT    /api/surveys/:id/verify': 'Verify survey (Protected)',
        'DELETE /api/surveys/:id': 'Delete survey (Admin)'
      },
      matching: {
        'POST /api/matching/need/:needId': 'Find matches for a specific need',
        'POST /api/matching/all': 'Find matches for all needs',
        'POST /api/matching/volunteer/:volunteerId': 'Find needs for a volunteer',
        'POST /api/matching/confirm': 'Confirm a match (Protected)'
      }
    }
  });
});

// ============================================
// ROUTES
// ============================================

app.use('/api/auth', authRoutes);
app.use('/api/needs', needRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/surveys', surveyRoutes);
app.use('/api/matching', matchingRoutes);

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler for unknown routes
app.use(notFound);

// Global error handler
app.use(errorHandler);

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════════╗
  ║   🤝 CommunityPulse API Server                   ║
  ║   Running on port ${PORT}                       ║
  ║   Environment: ${process.env.NODE_ENV || 'development'}            ║
  ║   API: http://localhost:${PORT}/api              ║
  ╚══════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

module.exports = app;
