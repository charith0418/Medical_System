const express = require('express');
const router = express.Router();
const { 
  getDashboardStats, 
  getDoctors, createDoctor, updateDoctor, deleteDoctor,
  getStaff, createStaff, updateStaff, deleteStaff 
} = require('../controllers/adminController');

// Handles GET /api/admin/dashboard and /api/admin/dashboard/stats
router.get('/dashboard', getDashboardStats);
router.get('/dashboard/stats', getDashboardStats);

// Doctor Routes (/api/admin/doctors)
router.route('/doctors')
  .get(getDoctors)
  .post(createDoctor);

router.route('/doctors/:id')
  .put(updateDoctor)
  .delete(deleteDoctor);

// Staff Routes (/api/admin/staff)
router.route('/staff')
  .get(getStaff)
  .post(createStaff);

router.route('/staff/:id')
  .put(updateStaff)
  .delete(deleteStaff);

module.exports = router;