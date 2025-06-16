'use strict';

/**
 * Module dependencies.
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = (module.exports = express());

// create an error with .status. we
// can then use the property in our
// custom error handler (Connect respects this prop as well)
function error(status, msg) {
  const err = new Error(msg);
  err.status = status;
  return err;
}

// Connect to MongoDB only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
      console.log('Connected to MongoDB');
    })
    .catch((err) => {
      console.error('MongoDB connection error:', err);
      process.exit(1);
    });
}

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(morgan('dev')); // Logging

// Rate limiting middleware
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Stricter rate limit for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 requests per windowMs
  message: { error: 'Too many authentication attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limit for apartment creation/updates
const apartmentWriteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 requests per windowMs
  message: { error: 'Too many apartment modifications, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to routes
app.use('/api/auth/', authLimiter); // Stricter limits for auth routes
app.use('/api/apartments', apartmentWriteLimiter); // Stricter limits for apartment modifications
app.use('/api/', apiLimiter); // General rate limit for all other routes

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Apartment Flow API Documentation"
}));

// Import routes
const authRoutes = require('./routes/auth.routes');
const apartmentRoutes = require('./routes/apartment.routes');
const favoriteRoutes = require('./routes/favorite.routes');
const commuteRoutes = require('./routes/commute.routes');
const userRoutes = require('./routes/user.routes');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/apartments', apartmentRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/commute', commuteRoutes);
app.use('/api/users', userRoutes);

// Error handling middleware (from Express.js web-service example)
app.use(function (err, req, res, next) {
  // whatever you want here, feel free to populate
  // properties on `err` to treat it differently in here.
  res.status(err.status || 500);
  res.json({ error: err.message });
});

// 404 handler (from Express.js web-service example)
app.use(function (req, res) {
  res.status(404);
  res.json({ error: "Sorry, can't find that" });
});

// Start server
if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

module.exports = app;
