const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// SEO Processing Functions
function generateSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

function generateSeoTitle(title) {
    if (title.length <= 60) {
        return title;
    }

    const truncated = title.substring(0, 57);
    const lastSpace = truncated.lastIndexOf(' ');

    if (lastSpace > 40) {
        return truncated.substring(0, lastSpace) + '...';
    }

    return truncated + '...';
}

function generateMetaDescription(content) {
    if (content.length <= 160) {
        return content;
    }

    const truncated = content.substring(0, 157);
    const lastSpace = truncated.lastIndexOf(' ');

    if (lastSpace > 120) {
        return truncated.substring(0, lastSpace) + '...';
    }

    return truncated + '...';
}

// API Endpoint
app.post('/api/process', (req, res) => {
    const { title, content } = req.body;

    // Basic validation
    if (!title || !content) {
        return res.status(400).json({
            error: 'Title and content are required'
        });
    }

    try {
        const result = {
            slug: generateSlug(title),
            seoTitle: generateSeoTitle(title),
            metaDescription: generateMetaDescription(content)
        };

        res.json(result);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to process content'
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

module.exports = app;