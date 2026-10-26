
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Server configuration
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

// CORS configuration
const allowedOrigins = [
    'http://localhost:5173',
    'https://pos.mytestindevlab.online'
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests without an Origin header, such as server-to-server requests
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request body parsing
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Import routes
const UserRoute = require('./routers/UserRouter');
const CustomerRoute = require('./routers/CustomerRouter');
const ProductRoute = require('./routers/ProductRouter');
const OrderRoute = require('./routers/OrderRouter');

// Health check endpoint
app.get('/abc', (req, resp) => {
    return resp.json({ message: 'Server Started..' });
});

// API routes
app.use('/api/user', UserRoute);
app.use('/api/customer', CustomerRoute);
app.use('/api/product', ProductRoute);
app.use('/api/order', OrderRoute);

// 404 handler for unknown routes
app.use((req, resp) => {
    return resp.status(404).json({
        message: 'Route Not Found'
    });
});

// Centralized error handler
app.use((err, req, resp, next) => {
    console.error('Unhandled Error:', err.message);

    if (resp.headersSent) {
        return next(err);
    }

    return resp.status(err.status || 500).json({
        message: 'Internal Server Error'
    });
});

// Connect to MongoDB, then start the server
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('MongoDB connected successfully');

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error.message);
        process.exit(1);
    });
