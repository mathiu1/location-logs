const express = require('express');
const Log = require('../models/Log');
const User = require('../models/User'); // Ensure User model is registered
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Create Log
router.post('/', authMiddleware(), async (req, res) => {
    const { lat, lng } = req.body;
    try {
        const newLog = new Log({
            userId: req.user.id,
            location: { lat, lng }
        });
        await newLog.save();
        res.status(201).json(newLog);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get All Logs (Admin only) with Filtering
router.get('/', authMiddleware(['admin']), async (req, res) => {
    try {
        const { startDate, endDate, userId } = req.query;
        let query = {};

        if (userId) {
            query.userId = userId;
        }

        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = new Date(startDate);
            if (endDate) {
                // Set end date to end of day if just a date string is provided, or handle as is
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.timestamp.$lte = end;
            }
        }

        const limit = parseInt(req.query.limit) || 25;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * limit;

        const logs = await Log.find(query)
            .populate('userId', 'username')
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Log.countDocuments(query);

        res.json({
            logs,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
                hasMore: page * limit < total
            }
        });
    } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
