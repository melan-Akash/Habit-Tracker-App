const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env variables
dotenv.config();

// Connect to MongoDB Database
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route Imports
const authRoutes = require('./routes/authRoutes');
const habitRoutes = require('./routes/habitRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/upload', uploadRoutes);

// Base Health Check Route
app.get('/', (req, res) => {
  res.status(200).json({
    message: '🚀 Habit Tracker API is running smoothly!',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('🔴 Error:', err.message);
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Server Error',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
