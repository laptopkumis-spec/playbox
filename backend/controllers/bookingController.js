const pool = require('../config/database');

exports.units = async (req, res) => {
  try {
    const [units] = await pool.query('SELECT * FROM units');
    
    // dynamically check for active/pending bookings
    for (let unit of units) {
      const [bookings] = await pool.query(
        `SELECT id FROM bookings WHERE unit_id = ? AND status IN ('pending', 'scheduled', 'active') LIMIT 1`,
        [unit.id]
      );
      const hasActiveBooking = bookings.length > 0;

      if (hasActiveBooking && unit.status !== 'maintenance') {
        unit.status = 'booked';
      } else if (!hasActiveBooking && unit.status === 'booked') {
        unit.status = 'available';
        // Sync DB state
        await pool.query('UPDATE units SET status = ? WHERE id = ?', ['available', unit.id]);
      }
    }

    res.json({ data: units });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch units' });
  }
};

exports.index = async (req, res) => {
  try {
    const userId = req.user.id;

    // Auto finish expired active bookings for this user
    const [expiredBookings] = await pool.query(
      `SELECT id, unit_id, end_time FROM bookings WHERE user_id = ? AND status = 'active' AND end_time < NOW()`,
      [userId]
    );

    for (let booking of expiredBookings) {
      await pool.query(`UPDATE bookings SET status = 'completed' WHERE id = ?`, [booking.id]);
      await pool.query(`UPDATE usage_logs SET actual_end_time = ? WHERE booking_id = ?`, [booking.end_time, booking.id]);
      
      // Restore unit status if no other active bookings
      const [activeOthers] = await pool.query(
        `SELECT id FROM bookings WHERE unit_id = ? AND status IN ('pending', 'scheduled', 'active') AND id != ? LIMIT 1`,
        [booking.unit_id, booking.id]
      );
      if (activeOthers.length === 0) {
        await pool.query(`UPDATE units SET status = 'available' WHERE id = ?`, [booking.unit_id]);
      }
    }

    const [bookings] = await pool.query(
      `SELECT b.*, u.name as unit_name, p.status as payment_status, p.payment_method 
       FROM bookings b 
       LEFT JOIN units u ON b.unit_id = u.id 
       LEFT JOIN payments p ON b.id = p.booking_id 
       WHERE b.user_id = ? AND b.is_hidden_by_user = false 
       ORDER BY b.created_at DESC`,
      [userId]
    );

    res.json({ data: bookings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
};

exports.store = async (req, res) => {
  try {
    const { unit_id, start_time, end_time, payment_method } = req.body;
    const userId = req.user.id;

    if (!unit_id || !start_time || !end_time) {
      return res.status(422).json({ message: 'Unit, start time, and end time are required' });
    }

    // This is simplified. In a real app you'd calculate price based on duration and unit price.
    const [units] = await pool.query('SELECT hourly_rate FROM units WHERE id = ?', [unit_id]);
    if (units.length === 0) return res.status(404).json({ message: 'Unit not found' });
    
    const start = new Date(start_time);
    const end = new Date(end_time);
    const hours = Math.abs(end - start) / 36e5;
    const totalPrice = units[0].hourly_rate * hours;

    const [result] = await pool.query(
      `INSERT INTO bookings (user_id, unit_id, start_time, end_time, total_price, status) VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, unit_id, start_time, end_time, totalPrice, 'pending']
    );
    const bookingId = result.insertId;

    const pm = payment_method || 'qris';
    let pStatus = 'pending';
    let bStatus = 'pending';

    if (pm === 'cash') {
      pStatus = 'paid';
      if (start <= new Date(Date.now() + 5 * 60000)) {
        bStatus = 'active';
      } else {
        bStatus = 'scheduled';
      }
    }

    await pool.query(
      `INSERT INTO payments (booking_id, amount, payment_method, status) VALUES (?, ?, ?, ?)`,
      [bookingId, totalPrice, pm, pStatus]
    );

    await pool.query(`UPDATE bookings SET status = ? WHERE id = ?`, [bStatus, bookingId]);

    const [newBooking] = await pool.query(`SELECT * FROM bookings WHERE id = ?`, [bookingId]);

    res.status(201).json({ message: 'Booking berhasil dibuat.', booking: newBooking[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create booking', error: error.message });
  }
};

exports.cancel = async (req, res) => {
  try {
    const [bookings] = await pool.query(
      `SELECT * FROM bookings WHERE id = ? AND user_id = ?`,
      [req.params.id, req.user.id]
    );

    if (bookings.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const booking = bookings[0];

    if (['pending', 'scheduled'].includes(booking.status)) {
      await pool.query(`UPDATE bookings SET status = 'cancelled' WHERE id = ?`, [booking.id]);
      await pool.query(`UPDATE payments SET status = 'failed' WHERE booking_id = ? AND status = 'pending'`, [booking.id]);
      
      const [activeOthers] = await pool.query(
        `SELECT id FROM bookings WHERE unit_id = ? AND status IN ('pending', 'scheduled', 'active') AND id != ? LIMIT 1`,
        [booking.unit_id, booking.id]
      );
      if (activeOthers.length === 0) {
        await pool.query(`UPDATE units SET status = 'available' WHERE id = ?`, [booking.unit_id]);
      }

      return res.json({ message: 'Booking berhasil dibatalkan.' });
    }

    res.status(400).json({ message: 'Booking tidak dapat dibatalkan.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to cancel booking' });
  }
};

exports.destroy = async (req, res) => {
  try {
    const [bookings] = await pool.query(
      `SELECT * FROM bookings WHERE id = ? AND user_id = ?`,
      [req.params.id, req.user.id]
    );

    if (bookings.length === 0) return res.status(404).json({ message: 'Booking not found' });

    const booking = bookings[0];

    if (['completed', 'cancelled'].includes(booking.status)) {
      await pool.query(`UPDATE bookings SET is_hidden_by_user = true WHERE id = ?`, [booking.id]);
      return res.json({ message: 'Riwayat booking dihapus dari tampilan Anda.' });
    }

    res.status(400).json({ message: 'Hanya booking selesai/batal yang bisa dihapus.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete booking history' });
  }
};

exports.show = async (req, res) => {
  try {
    const [bookings] = await pool.query(
      `SELECT * FROM bookings WHERE id = ? AND user_id = ?`,
      [req.params.id, req.user.id]
    );

    if (bookings.length === 0) return res.status(404).json({ message: 'Booking not found' });
    
    // Simplification for the example: In a real app we'd fetch relations properly
    const booking = bookings[0];
    const [payments] = await pool.query(`SELECT * FROM payments WHERE booking_id = ?`, [booking.id]);
    booking.payment = payments[0];

    res.json({ data: booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch booking details' });
  }
};

exports.unitSchedule = async (req, res) => {
  try {
    const [bookings] = await pool.query(
      `SELECT start_time, end_time, status FROM bookings WHERE unit_id = ? AND status IN ('scheduled', 'active')`,
      [req.params.id]
    );

    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch unit schedule' });
  }
};
