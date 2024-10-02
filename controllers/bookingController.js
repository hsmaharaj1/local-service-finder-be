const db = require('../db');

// Controller to handle booking a service
const bookService = async (req, res) => {
    const { name, number, timestamp, provider_id } = req.body;

    // Validate input data
    if (!name || !number || !timestamp || !provider_id) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    try {
        // Query to insert a new booking into the booking_logs table
        const result = await db.query(
            `INSERT INTO booking_logs (user_name, phone_number, booking_datetime, provider_id)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [name, number, timestamp, provider_id]
        );

        // Respond with the created booking details
        res.status(201).json({
            success: true,
            booking: result.rows[0], // Return the booking details
        });
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ success: false, message: 'Error creating booking' });
    }
};

// Controller to check bookings for a specific provider
const checkBookings = async (req, res) => {
    const providerId = parseInt(req.params.providerId, 10); // Get provider ID from request parameters

    if (isNaN(providerId)) {
        return res.status(400).json({ success: false, message: 'Invalid provider ID' });
    }

    try {
        // Query to fetch bookings for the specified provider where is_done is false
        const result = await db.query(
            `SELECT * FROM booking_logs
             WHERE provider_id = $1 AND is_done = false`,
            [providerId]
        );

        // if (result.rows.length === 0) {
        //     return res.status(404).json({ success: true, message: 'No pending bookings found for this provider' });
        // }

        res.status(200).json({
            success: true,
            bookings: result.rows,
        });
    } catch (error) {
        console.error('Error checking bookings:', error);
        res.status(500).json({ success: false, message: 'Error checking bookings' });
    }
};

// Controller to mark a task as done
const markTaskDone = async (req, res) => {
    const bookingId = parseInt(req.params.bookingId, 10); // Get booking ID from request parameters

    if (isNaN(bookingId)) {
        return res.status(400).json({ success: false, message: 'Invalid booking ID' });
    }

    try {
        // Execute the update query to mark the task as done
        const result = await db.query(
            `UPDATE booking_logs
             SET is_done = true
             WHERE id = $1
             RETURNING *`,
            [bookingId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        res.status(200).json({
            success: true,
            booking: result.rows[0],
        });
    } catch (error) {
        console.error('Error marking task as done:', error);
        res.status(500).json({ success: false, message: 'Error marking task as done' });
    }
};

module.exports = {
    bookService,
    checkBookings,
    markTaskDone,
};
