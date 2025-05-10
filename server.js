require('dotenv').config();
const express = require('express');
const cors = require('cors'); 
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Route Imports
const processImageRouter = require('./route/processImage'); 
const medicationRouter = require('./route/medications'); 
const authRouter = require('./route/auth'); 
// const reminderRouter = require('./route/reminder');

// Middleware
app.use(cors());
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));


// API routes
app.use('/api/process', processImageRouter);
app.use('/api/medication', medicationRouter);
app.use('/api/auth', authRouter);
// app.use('/api/reminder', reminderRouter);

// Handle root route - serve the test interface
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
  console.log(`Web interface available at http://localhost:${PORT}`);
});

