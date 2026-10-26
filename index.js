
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
// Allow requests from the local React/Vite frontend
app.use(cors({
    origin: 'http://localhost:5173',
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
    console.error('Unhandled Error:', err);

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
        console.log('Mongo db connected...');

        app.listen(PORT, () => {
            console.log(`Server Started And Running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Db Error:', error);
        process.exit(1);
    });
