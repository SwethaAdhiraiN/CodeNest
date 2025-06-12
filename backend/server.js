const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

// Seed admin user on startup (only if none exists)
const { seedAdmin } = require('./auth');
seedAdmin();

// Set up authentication routes
const authRoutes = require('./routes/auth');
  // Middleware to parse JSON request bodies
  app.use(express.json());

  // Mount authentication/user management routes
  app.use('/api/auth', authRoutes);

  // Example API endpoint
  // PUBLIC_INTERFACE
  app.get('/api/health', (req, res) => {
    /** Health check endpoint for CodeNest backend */
    res.json({ status: 'ok', message: 'CodeNest backend is running!' });
  });

// Serve static files from frontend build (optional for full-stack prod deployment)
app.use(express.static(path.join(__dirname, '../frontend/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`CodeNest backend listening at http://localhost:${PORT}`);
});
