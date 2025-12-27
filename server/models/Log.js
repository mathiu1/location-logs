const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'locationUser', required: true },
    location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('locationLog', LogSchema);
