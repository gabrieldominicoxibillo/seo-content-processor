// Request Validation Middleware
const validateProcessRequest = (req, res, next) => {
    const { title, content } = req.body;
    const errors = [];

    // Title validation
    if (!title || typeof title !== 'string') {
        errors.push('Title is required and must be a string');
    } else {
        const trimmedTitle = title.trim();
        if (trimmedTitle.length < 3) {
            errors.push('Title must be at least 3 characters long');
        }
        if (trimmedTitle.length > 200) {
            errors.push('Title must be 200 characters or less');
        }
        // Update the title to be trimmed
        req.body.title = trimmedTitle;
    }

    // Content validation
    if (!content || typeof content !== 'string') {
        errors.push('Content is required and must be a string');
    } else {
        const trimmedContent = content.trim();
        if (trimmedContent.length < 50) {
            errors.push('Content must be at least 50 characters long');
        }
        if (trimmedContent.length > 10000) {
            errors.push('Content must be 10,000 characters or less');
        }
        // Update the content to be trimmed
        req.body.content = trimmedContent;
    }

    // If there are validation errors, return them
    if (errors.length > 0) {
        return res.status(400).json({
            error: true,
            message: 'Validation failed',
            details: errors
        });
    }

    // Validation passed, continue to next middleware
    next();
};

// Rate limiting validation (basic implementation)
const requestCounts = new Map();
const RATE_LIMIT = 100; // requests per hour
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

const rateLimit = (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    // Clean up old entries
    for (const [ip, data] of requestCounts.entries()) {
        if (now - data.firstRequest > RATE_WINDOW) {
            requestCounts.delete(ip);
        }
    }
    
    // Check current request count for this IP
    const clientData = requestCounts.get(clientIP);
    
    if (!clientData) {
        // First request from this IP
        requestCounts.set(clientIP, {
            count: 1,
            firstRequest: now
        });
    } else {
        // Check if within rate limit
        if (clientData.count >= RATE_LIMIT) {
            return res.status(429).json({
                error: true,
                message: 'Rate limit exceeded. Please try again later.',
                retryAfter: Math.ceil((clientData.firstRequest + RATE_WINDOW - now) / 1000)
            });
        }
        
        // Increment count
        clientData.count += 1;
    }
    
    next();
};

// Content sanitization middleware
const sanitizeInput = (req, res, next) => {
    if (req.body.title) {
        // Remove potentially harmful characters but keep basic punctuation
        req.body.title = req.body.title
            .replace(/[<>{}]/g, '') // Remove HTML-like characters
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();
    }
    
    if (req.body.content) {
        // Basic content sanitization
        req.body.content = req.body.content
            .replace(/[<>{}]/g, '') // Remove HTML-like characters
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();
    }
    
    next();
};

module.exports = {
    validateProcessRequest,
    rateLimit,
    sanitizeInput
};