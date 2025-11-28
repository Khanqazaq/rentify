/**
 * Main Server File
 * Express.js REST API Server
 */

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const path = require('path');

// Routes
const smsRoutes = require('./routes/smsRoutes');
const livenessRoutes = require('./routes/livenessRoutes');
const idRoutes = require('./routes/idRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

// Middleware
const authMiddleware = require('./middleware/authMiddleware');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MONGODB CONNECTION
// ============================================

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rentify_security', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
});

// ============================================
// MIDDLEWARE
// ============================================

// Security
app.use(helmet());

// CORS
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:8080',
    credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 100, // максимум 100 запросов
    message: 'Слишком много запросов. Попробуйте позже.',
    standardHeaders: true,
    legacyHeaders: false
});

app.use('/api/', limiter);

// Строгий rate limit для верификации
const verificationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 час
    max: 5,
    message: 'Превышен лимит попыток верификации. Попробуйте через час.'
});

app.use('/api/sms/send', verificationLimiter);
app.use('/api/liveness/upload', verificationLimiter);
app.use('/api/id/upload', verificationLimiter);

// Logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
});

// ============================================
// ROUTES
// ============================================

app.get('/', (req, res) => {
    res.json({
        message: 'Rentify Security System API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            sms: '/api/sms',
            liveness: '/api/liveness',
            id: '/api/id',
            reviews: '/api/reviews',
            users: '/api/users'
        },
        status: 'online',
        timestamp: new Date().toISOString()
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/sms', authMiddleware, smsRoutes);
app.use('/api/liveness', authMiddleware, livenessRoutes);
app.use('/api/id', authMiddleware, idRoutes);
app.use('/api/reviews', authMiddleware, reviewRoutes);
app.use('/api/users', authMiddleware, userRoutes);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        path: req.path
    });
});

// Error Handler
app.use(errorHandler);

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
    console.log('');
    console.log('='.repeat(50));
    console.log(`🚀 Rentify Security API Server`);
    console.log(`📍 Running on: http://localhost:${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📊 MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
    console.log('='.repeat(50));
    console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Closing server...');
    mongoose.connection.close(() => {
        console.log('MongoDB connection closed.');
        process.exit(0);
    });
});

module.exports = app;
