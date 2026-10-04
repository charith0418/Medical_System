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

// Allowed Origins List
// Allowed Origins List
const allowedOrigins = [
  process.env.CLIENT_URL,
  'https://medical-healthcare-tau.vercel.app', // Your live Vercel frontend
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
].filter(Boolean);

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy does not allow access from origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

// Middleware
app.use(cors(corsOptions));
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