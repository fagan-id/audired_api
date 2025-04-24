require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import routes
const processImageRouter = require('./route/processImage');

// Create the Express application
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for base64 images
app.use(express.urlencoded({ extended: true, limit: '50mb' }));


// API routes
app.use('/api/process', processImageRouter);

// Basic route for testing
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'OCR API is running' });
});

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
  console.log(`OCR Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
  console.log(`Web interface available at http://localhost:${PORT}`);
});

