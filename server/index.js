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

const allowedOrigins = [
  'http://localhost:5173', // Your new local port
  'http://localhost:5174', // Your old local port
  'https://location-logs.netlify.app' // Your deployed frontend
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
  },
  credentials: true, // Useful if you plan to use cookies/sessions later
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/logs', logRoutes);


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
