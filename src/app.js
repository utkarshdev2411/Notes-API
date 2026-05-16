const express = require('express');
const app = express();

// Body parsing middleware
app.use(express.json());

// Health check — always alive
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Routes — added phase by phase
// Phase 2: Auth
// app.use('/', require('./routes/auth.routes'));

// Phase 3-5: Notes
// app.use('/notes', require('./routes/notes.routes'));

// Phase 6: Meta
// app.use('/', require('./routes/meta.routes'));

// 404 handler — catch all unknown routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

module.exports = app;
