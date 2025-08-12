// const mongoose = require('mongoose');

// const paymentSchema = new mongoose.Schema({
//     booking: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Booking',
//         required: true,
//     },
//     user: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',
//         required: true,
//     },
//     amount: {
//         type: Number,
//         required: true,
//     },
//     paymentMethod: {
//         type: String,
//         enum: ['cash', 'card', 'upi', 'netbanking'],
//         default: 'cash',
//     },
//     status: {
//         type: String,
//         enum: ['pending', 'paid', 'cancelled'],
//         default: 'pending',
//     },
//     paidAt: {
//         type: Date,
//         default: Date.now
//     },
//     transactionId: {
//         type: String,
//         unique: true
//     }
// }, { timestamps: true });

// module.exports = mongoose.model('Payment', paymentSchema);