const express = require('express');
const app = express();

app.use(express.json());

// Auth routes
app.use('/', require('./routes/auth.routes'));

// Notes routes
app.use('/notes', require('./routes/notes.routes'));

// Phase 6: Meta (uncommented when phase is built)
// app.use('/', require('./routes/meta.routes'));

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

module.exports = app;
