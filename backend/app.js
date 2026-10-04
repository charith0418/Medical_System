const express = require('express');
const cors = require('cors');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const treatmentRoutes = require('./routes/treatmentRoutes');
const reportRoutes = require('./routes/reportRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const medicineRoutes = require('./routes/medicineRoutes');
const visitationRoutes = require('./routes/visitations');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// CORS Configuration - allows incoming origins and handles preflight cleanly
const corsOptions = {
  origin: true, // Dynamically mirrors and allows incoming origin (Vercel & localhost)
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200,
};

// Middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Intercept and approve all preflight OPTIONS requests

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes Setup
app.use('/api/auth', authRoutes);

// Supports both singular and plural paths to prevent 404 errors
app.use('/api/patient', patientRoutes);
app.use('/api/patients', patientRoutes);

app.use('/api/treatments', treatmentRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/visitations', visitationRoutes);

// Admin Routes Mount
app.use('/api/admin', adminRoutes);

// Root Health Check Route
app.get('/', (req, res) => {
  res.send('Medicare Hospital API is running...');
});

// Global 404 Route Handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
  });
});

module.exports = app;