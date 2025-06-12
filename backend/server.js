const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON request bodies
app.use(express.json());

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
