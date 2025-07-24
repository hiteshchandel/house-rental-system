const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    paymentType: {
        type: String,
        enum: ['advance', 'full'],
        default: 'advance',
    },
    status: {
        type: String,
        enum: ['pending', 'paid', 'cancelled'],
        default: 'pending',
    },
    paidAt: {
        type: Date
    }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);