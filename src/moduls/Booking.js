const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    bookingDate: {
        type: Date,
        default: Date.now
    },
    checkInDate: {
        type: Date,
        required: true
    },
    checkOutDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['booked', 'cancelled', 'completed'],
        default: 'booked'
    },
    paymentMethod: {
        type: String,
        enum: ['online', 'cash'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    totalAmount: {
        type: Number,
        required: true
    },
    paymentDetails: {
        razorpayOrderId: { type: String },
        razorpayPaymentId: { type: String },
        razorpaySignature: { type: String },
        cashReceivedBy: { type: String }
    },
    refundDetails: {
        refundId: { type: String },
        refundStatus: { type: String, enum: ['pending', 'processed', 'failed'] }
    }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
