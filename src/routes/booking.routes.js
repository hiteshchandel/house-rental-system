const router = require('express').Router();
const { createBooking, verifyPayment, cancelBooking, getUserBookings } = require('../constrollers/booking.controller.js');
const { verifyToken } = require('../middlewares/auth.middleware');
// const { isAdmin } = require('../middlewares/isAdmin.middleware');



router.post('/create', verifyToken, createBooking);

router.post('/verify',verifyToken, verifyPayment);

router.delete('/:bookingId/cancel', verifyToken, cancelBooking);

router.get('/my-bookings', verifyToken, getUserBookings);

module.exports = router;