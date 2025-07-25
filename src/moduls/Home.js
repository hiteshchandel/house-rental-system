const mongoose = require('mongoose');

const homeSchema = new mongoose.Schema({
    admin: {
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
    homeImage: {
        type: String
    }
}, {timestamps:true})

module.exports = mongoose.model('Home', homeSchema);