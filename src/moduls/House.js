const mongoose = require('mongoose');

const houseSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    plotNumber: {
        type: String,
    },
    location: {
        type: String,
    },
    city: {
        type: String,
    },
    image: {
        url: String,
        public_id: String
    }
}, {timestamps:true})

module.exports = mongoose.model('House', houseSchema);