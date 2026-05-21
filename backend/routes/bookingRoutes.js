const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticateToken } = require('../middleware/authMiddleware');
const cancelRateLimit = require('../middleware/cancelRateLimit');

router.get('/units', bookingController.units);
router.get('/units/:id/schedule', bookingController.unitSchedule);

router.get('/bookings', authenticateToken, bookingController.index);
router.post('/bookings', authenticateToken, bookingController.store);
router.get('/bookings/:id', authenticateToken, bookingController.show);
router.put('/bookings/:id/cancel', authenticateToken, cancelRateLimit, bookingController.cancel);
router.delete('/bookings/:id', authenticateToken, bookingController.destroy);

module.exports = router;
