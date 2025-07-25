const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    home: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Home',
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
    kitchen: {
        type: Boolean,
        default: false
    },
    bathroom: {
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
    roomImage: {
        type: String
    },
    images: [{
        type: String
    }],

},{timestamps: true});

module.exports = mongoose.model('Room', roomSchema);