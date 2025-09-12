// SEO Content Processor - Express.js Server
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

const app = express();

// Environment Configuration
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

// Enhanced CORS Configuration
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = NODE_ENV === 'production' 
            ? [
                'https://your-domain.com',
                'https://www.your-domain.com'
              ] // Replace with your production domain(s)
            : [
                'http://localhost:3000',
                'http://127.0.0.1:3000',
                'http://localhost:5500',
                'http://127.0.0.1:5500',
                'http://localhost:8080',
                'http://127.0.0.1:8080'
              ];
        
        // Allow requests with no origin (mobile apps, postman, etc.)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn(`CORS blocked request from origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type', 
        'Authorization', 
        'X-Requested-With',
        'Accept',
        'Origin'
    ],
    exposedHeaders: [
        'X-Total-Count',
        'X-Processing-Time',
        'X-API-Version'
    ],
    credentials: true,
    maxAge: 86400 // Cache preflight for 24 hours
};

app.use(cors(corsOptions));

// Body Parser Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Enhanced Static Files Middleware - Serve frontend files with caching
const staticOptions = {
    // Enable caching for production
    maxAge: NODE_ENV === 'production' ? '1d' : '0',
    // Enable gzip compression
    setHeaders: (res, path, stat) => {
        // Set caching headers based on file type
        if (path.endsWith('.html')) {
            // Don't cache HTML files to ensure updates are seen immediately
            res.set('Cache-Control', 'no-cache');
        } else if (path.endsWith('.css') || path.endsWith('.js')) {
            // Cache CSS and JS files for longer
            res.set('Cache-Control', 'public, max-age=86400'); // 1 day
        } else if (path.endsWith('.png') || path.endsWith('.jpg') || path.endsWith('.jpeg') || path.endsWith('.gif') || path.endsWith('.svg')) {
            // Cache images for longer
            res.set('Cache-Control', 'public, max-age=604800'); // 1 week
        }
        
        // Add security headers
        res.set('X-Content-Type-Options', 'nosniff');
        res.set('X-Frame-Options', 'DENY');
        
        // Add API version header
        res.set('X-API-Version', '1.0.0');
    }
};

app.use(express.static(path.join(__dirname, '../frontend/public'), staticOptions));

// API Response Headers Middleware
app.use('/api', (req, res, next) => {
    // Add standard API headers
    res.set('X-API-Version', '1.0.0');
    res.set('X-Powered-By', 'SEO Content Processor');
    
    // Add processing time tracking
    req.startTime = Date.now();
    
    // Override res.json to add processing time
    const originalJson = res.json;
    res.json = function(obj) {
        if (req.startTime) {
            res.set('X-Processing-Time', `${Date.now() - req.startTime}ms`);
        }
        
        // Add timestamp to all API responses
        if (obj && typeof obj === 'object' && !obj.meta) {
            obj.meta = obj.meta || {};
            obj.meta.timestamp = new Date().toISOString();
        }
        
        return originalJson.call(this, obj);
    };
    
    next();
});

// Request Logging Middleware (Development)
if (NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
        next();
    });
}

// Health Check Endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: NODE_ENV
    });
});

// API Routes
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// Catch-all handler for SPA (Single Page Application)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);

    const statusCode = err.statusCode || 500;
    const message = NODE_ENV === 'production'
        ? 'Internal Server Error'
        : err.message;

    res.status(statusCode).json({
        error: true,
        message: message,
        ...(NODE_ENV === 'development' && { stack: err.stack })
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        error: true,
        message: 'Route not found',
        path: req.path,
        method: req.method
    });
});

// Start Server
const server = app.listen(PORT, () => {
    console.log('SEO Content Processor Server Started');
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${NODE_ENV}`);
    console.log(`Local URL: http://localhost:${PORT}`);
    console.log('Ready to process SEO content!');
});

// Graceful Shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed.');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed.');
        process.exit(0);
    });
});

// Export for testing
module.exports = app;