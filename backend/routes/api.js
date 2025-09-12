// API Routes for SEO Content Processor
const express = require('express');
const { validateProcessRequest, rateLimit, sanitizeInput } = require('../middleware/validation');

const router = express.Router();

// Apply rate limiting to all API routes
router.use(rateLimit);

// POST /api/process - Process article content for SEO optimization
router.post('/process', sanitizeInput, validateProcessRequest, async (req, res) => {
    try {
        const { title, content } = req.body;
        
        console.log('Processing request:', {
            titleLength: title.length,
            contentLength: content.length,
            timestamp: new Date().toISOString()
        });

        // For now, return a basic response structure
        // This will be enhanced with actual SEO processing logic in Step 7
        const response = {
            success: true,
            data: {
                slug: generateBasicSlug(title),
                seoTitle: truncateTitle(title),
                metaDescription: generateBasicMetaDescription(content),
                originalTitle: title,
                originalContentLength: content.length
            },
            processedAt: new Date().toISOString()
        };

        // Log successful processing
        console.log('Processing completed successfully:', {
            slug: response.data.slug,
            titleLength: response.data.seoTitle.length,
            descriptionLength: response.data.metaDescription.length
        });

        res.status(200).json(response);

    } catch (error) {
        console.error('Processing error:', error);
        
        res.status(500).json({
            error: true,
            message: 'An error occurred while processing your content',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// GET /api/status - API status endpoint
router.get('/status', (req, res) => {
    res.status(200).json({
        status: 'online',
        version: '1.0.0',
        endpoints: [
            'POST /api/process - Process article content',
            'GET /api/status - API status'
        ],
        timestamp: new Date().toISOString()
    });
});

// Basic helper functions (these will be enhanced in Step 7)
function generateBasicSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

function truncateTitle(title) {
    const maxLength = 60;
    if (title.length <= maxLength) {
        return title;
    }
    
    // Truncate at word boundary
    const truncated = title.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    if (lastSpace > 0) {
        return truncated.substring(0, lastSpace) + '...';
    }
    
    return truncated + '...';
}

function generateBasicMetaDescription(content) {
    const maxLength = 160;
    
    // Clean up the content
    const cleanContent = content
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
    
    if (cleanContent.length <= maxLength) {
        return cleanContent;
    }
    
    // Truncate at word boundary
    const truncated = cleanContent.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    if (lastSpace > 0) {
        return truncated.substring(0, lastSpace) + '...';
    }
    
    return truncated + '...';
}

module.exports = router;