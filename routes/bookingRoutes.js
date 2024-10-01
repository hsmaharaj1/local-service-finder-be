const express = require('express');
const { bookService, checkBookings, markTaskDone } = require('../controllers/bookingController');
const router = express.Router();

// Route to book a service
router.post('/book', bookService);

// Route to check bookings for a specific provider
router.get('/check-bookings/:providerId', checkBookings);

// Route to mark a task as done for a specific booking
router.put('/mark-task-done/:bookingId', markTaskDone);

module.exports = router;
