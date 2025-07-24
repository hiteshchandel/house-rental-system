const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
    },
    home: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Home',
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        trim: true
    },
    visibleToAdminOnly: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);