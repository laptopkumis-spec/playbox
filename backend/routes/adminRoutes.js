const express = require('express');
const router = express.Router();
// Create simple admin routes to match Laravel's routes/api/admin.php
// const dashboardController = require('../controllers/admin/dashboardController');
// const userController = require('../controllers/admin/userController');
// const unitController = require('../controllers/admin/unitController');
// const bookingAdminController = require('../controllers/admin/bookingAdminController');
// const reportsController = require('../controllers/admin/reportsController');

const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

router.use(authenticateToken, isAdmin);

const pool = require('../config/database');

router.get('/dashboard', async (req, res) => {
  try {
    const [units] = await pool.query('SELECT COUNT(id) as total FROM units');
    const [bookings] = await pool.query('SELECT COUNT(id) as total FROM bookings');
    const [activeBookings] = await pool.query("SELECT COUNT(id) as total FROM bookings WHERE status = 'active'");
    const [revenue] = await pool.query("SELECT SUM(total_price) as total FROM bookings WHERE status IN ('completed', 'active')");
    
    res.json({
      total_units: units[0].total,
      total_bookings: bookings[0].total,
      active_bookings: activeBookings[0].total,
      total_revenue: revenue[0].total || 0,
      monthly_revenue: revenue[0].total || 0 // simplification
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/reports', async (req, res) => {
  try {
    const [rev] = await pool.query("SELECT SUM(total_price) as total_revenue, SUM(total_fines) as total_fines FROM bookings WHERE status IN ('completed', 'active')");
    
    const [popularUnits] = await pool.query(`
      SELECT u.id, u.name, COUNT(b.id) as bookings_count 
      FROM units u 
      LEFT JOIN bookings b ON u.id = b.unit_id 
      GROUP BY u.id 
      ORDER BY bookings_count DESC 
      LIMIT 5
    `);

    // Simplified peak hours (group by hour of start_time)
    const [peakHours] = await pool.query(`
      SELECT HOUR(start_time) as hour, COUNT(id) as count 
      FROM bookings 
      GROUP BY HOUR(start_time) 
      ORDER BY count DESC 
      LIMIT 5
    `);

    // Simplified revenue chart (last 7 days)
    const [revenueChart] = await pool.query(`
      SELECT DATE(created_at) as date, SUM(total_price) as total 
      FROM bookings 
      WHERE status IN ('completed', 'active') 
      GROUP BY DATE(created_at) 
      ORDER BY date DESC 
      LIMIT 7
    `);

    res.json({
      summary: {
        total_revenue: rev[0].total_revenue || 0,
        total_fines: rev[0].total_fines || 0,
        grand_total: (Number(rev[0].total_revenue || 0) + Number(rev[0].total_fines || 0))
      },
      popular_units: popularUnits,
      peak_hours: peakHours,
      revenue_chart: revenueChart.reverse()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, name, email, role, created_at FROM users');
    res.json({ data: users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/units', async (req, res) => {
  try {
    const [units] = await pool.query('SELECT * FROM units');
    res.json({ data: units });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/bookings', async (req, res) => {
  try {
    const [bookings] = await pool.query(`
      SELECT b.*, 
             u.name as unit_name, 
             users.name as user_name,
             p.id as payment_id, p.amount as payment_amount, p.status as payment_status, p.payment_method, p.created_at as payment_created_at
      FROM bookings b 
      LEFT JOIN units u ON b.unit_id = u.id 
      LEFT JOIN users ON b.user_id = users.id 
      LEFT JOIN payments p ON b.id = p.booking_id
      ORDER BY b.created_at DESC
    `);
    
    const formattedBookings = bookings.map(b => ({
      ...b,
      user: { name: b.user_name },
      unit: { name: b.unit_name },
      payment: b.payment_id ? {
        id: b.payment_id,
        amount: b.payment_amount,
        status: b.payment_status,
        payment_method: b.payment_method,
        created_at: b.payment_created_at
      } : null
    }));
    
    res.json({ data: formattedBookings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;
