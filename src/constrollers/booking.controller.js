const express = require('express');
const Booking = require('../moduls/Booking');
const Room = require('../moduls/Room');
const User = require('../moduls/User');
const Razorpay = require('razorpay');   // ✅ Import Razorpay
const crypto = require('crypto');
require('dotenv').config();

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY,     // ✅ Correct keys
    key_secret: process.env.RAZORPAY_SECRET
});

// ✅ Create Booking (with Razorpay order)
exports.createBooking = async (req, res) => {
    try {
        const { roomId, checkInDate, checkOutDate, totalAmount } = req.body;
        console.log('roomId:', roomId);
        const userId = req.user._id;

        const room = await Room.findById(roomId);
        console.log('room:', room);
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        // Razorpay Order
        const options = {
            amount: totalAmount * 100,
            currency: "INR",
            receipt: `receipt_${userId}}`
        };

        const order = await razorpayInstance.orders.create(options);
        if (!order) {
            return res.status(500).json({ error: 'Failed to create Razorpay order' });
        }

        const booking = new Booking({
            user: userId,
            room: roomId,
            checkInDate,
            checkOutDate,
            totalAmount,
            status: 'booked',  // ✅ Fixed
            paymentStatus: 'pending',
            paymentDetails: {
                razorpayOrderId: order.id,
                method: 'online'
            }
        });

        await booking.save();

        res.status(201).json({
            success: true,
            bookingId: booking._id,
            order
        });
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ error: 'Failed to create booking' });
    }
};

// ✅ Verify Payment
exports.verifyPayment = async (req, res) => {
    try {
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
        
        const sign = razorpayOrderId + '|' + razorpayPaymentId;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_SECRET)
            .update(sign)
            .digest('hex');

        if (expectedSignature !== razorpaySignature) {
            return res.status(400).json({ error: 'Invalid signature' });
        }

        const booking = await Booking.findOneAndUpdate(
            { 'paymentDetails.razorpayOrderId': razorpayOrderId },
            {
                $set: {
                    paymentStatus: 'paid',
                    'paymentDetails.razorpayPaymentId': razorpayPaymentId,
                    'paymentDetails.razorpaySignature': razorpaySignature,
                    status: 'booked'
                }
            },
            { new: true }
        );

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        res.status(200).json({ success: true, booking });

    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ error: 'Failed to verify payment' });
    }
};

// ✅ Cancel Booking
exports.cancelBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        if (booking.status === 'cancelled') {
            return res.status(400).json({ error: 'Booking already cancelled' });
        }

        booking.status = 'cancelled';
        booking.paymentStatus = 'refunded'; // optional if you add refund
        await booking.save();

        res.status(200).json({ success: true, booking });
    } catch (error) {
        console.error('Error cancelling booking:', error);
        res.status(500).json({ error: 'Failed to cancel booking' });
    }
};

// ✅ Get User Bookings
exports.getUserBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id })
            .populate("room")
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, bookings });
    } catch (error) {
        res.status(500).json({ error: "Error fetching bookings" });
    }
};
