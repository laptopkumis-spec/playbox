const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/units', bookingController.units);
router.get('/units/:id/schedule', bookingController.unitSchedule);
// router.post('/payments/webhook', paymentController.webhook);

router.get('/bookings', authenticateToken, bookingController.index);
router.post('/bookings', authenticateToken, bookingController.store);
router.get('/bookings/:id', authenticateToken, bookingController.show);
router.put('/bookings/:id/cancel', authenticateToken, bookingController.cancel);
router.delete('/bookings/:id', authenticateToken, bookingController.destroy);

module.exports = router;
