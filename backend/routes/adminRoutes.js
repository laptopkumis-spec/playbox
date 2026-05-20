const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
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

// Create user
router.post('/users', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(422).json({ message: 'Nama, email, password, dan role wajib diisi' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );
    const [newUser] = await pool.query('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [result.insertId]);
    res.status(201).json(newUser[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'User berhasil dihapus' });
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

// Create unit
router.post('/units', async (req, res) => {
  try {
    const { name, hourly_rate } = req.body;
    if (!name || !hourly_rate) {
      return res.status(422).json({ message: 'Nama unit dan tarif per jam wajib diisi' });
    }
    const [result] = await pool.query(
      'INSERT INTO units (name, hourly_rate, status) VALUES (?, ?, ?)',
      [name, hourly_rate, 'available']
    );
    const [newUnit] = await pool.query('SELECT * FROM units WHERE id = ?', [result.insertId]);
    res.status(201).json(newUnit[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update unit
router.put('/units/:id', async (req, res) => {
  try {
    const { name, hourly_rate, status } = req.body;
    const { id } = req.params;
    await pool.query(
      'UPDATE units SET name = ?, hourly_rate = ?, status = ? WHERE id = ?',
      [name, hourly_rate, status, id]
    );
    const [updatedUnit] = await pool.query('SELECT * FROM units WHERE id = ?', [id]);
    res.json(updatedUnit[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete unit
router.delete('/units/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM units WHERE id = ?', [id]);
    res.json({ message: 'Unit berhasil dihapus' });
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

// Update booking status
router.put('/bookings/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    
    const [bookings] = await pool.query('SELECT unit_id FROM bookings WHERE id = ?', [id]);
    if (bookings.length > 0) {
      const unitId = bookings[0].unit_id;
      if (['completed', 'cancelled'].includes(status)) {
        const [activeOthers] = await pool.query(
          `SELECT id FROM bookings WHERE unit_id = ? AND status IN ('pending', 'scheduled', 'active') AND id != ? LIMIT 1`,
          [unitId, id]
        );
        if (activeOthers.length === 0) {
          await pool.query(`UPDATE units SET status = 'available' WHERE id = ?`, [unitId]);
        }
      } else if (status === 'active') {
        await pool.query(`UPDATE units SET status = 'booked' WHERE id = ?`, [unitId]);
      }
    }

    await pool.query('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);
    res.json({ message: 'Status booking berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update booking fine status
router.put('/bookings/:id/fine-status', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("UPDATE bookings SET fine_status = 'paid' WHERE id = ?", [id]);
    res.json({ message: 'Denda berhasil dilunaskan' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
