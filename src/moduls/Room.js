const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    house: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'House',
        required: true
    },
    roomNumber: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['single', 'double'],
        default: 'single'
    },
    attachedKitchen: {
        type: Boolean,
        default: false
    },
    attachedBathroom: {
        type: Boolean,
        default: false
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    rentAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['available', 'booked', 'maintenance'],
        default: 'available'
    },
    images: [{
        public_Id: String,
        url: String
    }],

},{timestamps: true});

module.exports = mongoose.model('Room', roomSchema);