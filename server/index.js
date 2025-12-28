const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const logRoutes = require('./routes/logs');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


app.use(express.json({ limit: '10kb' })); // Body limit

// Security Middleware
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');

app.use(helmet());
app.use(mongoSanitize());
app.use(xss());

const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 mins
    max: 100
});
app.use('/api', limiter);




// Database Connection
mongoose.connect('mongodb+srv://mathivan007:RveUGmwEdyKNiHV2@shopcartdb.jjtmf79.mongodb.net/?retryWrites=true&w=majority&appName=ShopcartDB')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

require('./models/User');
require('./models/Log');

app.use(cors()); // Allow all origins to fix access issues across devices


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/logs', logRoutes);


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
