// API Routes for SEO Content Processor
const express = require('express');
const { validateProcessRequest, rateLimit, sanitizeInput } = require('../middleware/validation');
const seoProcessor = require('../utils/seo');

const router = express.Router();

// Apply rate limiting to all API routes
router.use(rateLimit);

// POST /api/process - Process article content for SEO optimization
router.post('/process', sanitizeInput, validateProcessRequest, async (req, res) => {
    try {
        const { title, content } = req.body;
        const startTime = Date.now();
        
        console.log('Processing request:', {
            titleLength: title.length,
            contentLength: content.length,
            timestamp: new Date().toISOString()
        });

        // Use enhanced SEO processing
        const seoData = seoProcessor.processSEOData(title, content);
        const processingTime = Date.now() - startTime;

        const response = {
            success: true,
            data: {
                slug: seoData.slug,
                seoTitle: seoData.seoTitle,
                metaDescription: seoData.metaDescription,
                originalTitle: seoData.originalTitle,
                originalContentLength: seoData.originalContentLength,
                seoScores: seoData.seoScores,
                recommendations: seoData.recommendations
            },
            meta: {
                processingTimeMs: processingTime,
                processedAt: new Date().toISOString(),
                version: '1.0.0'
            }
        };

        // Log successful processing with enhanced details
        console.log('Processing completed successfully:', {
            slug: response.data.slug,
            titleLength: response.data.seoTitle.length,
            descriptionLength: response.data.metaDescription.length,
            overallScore: response.data.seoScores.overall,
            processingTime: processingTime + 'ms'
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


module.exports = router;