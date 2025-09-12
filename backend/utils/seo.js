// SEO Processing Utilities
class SEOProcessor {
    constructor() {
        // SEO Best Practice Constants
        this.TITLE_MAX_LENGTH = 60;
        this.META_DESCRIPTION_MAX_LENGTH = 160;
        this.SLUG_MAX_LENGTH = 100;
        
        // Stop words to remove from slugs (common words that don't add SEO value)
        this.STOP_WORDS = new Set([
            'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
            'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
            'to', 'was', 'will', 'with'
        ]);
        
        // Keywords that should be preserved in slugs
        this.POWER_WORDS = new Set([
            'best', 'guide', 'how', 'tips', 'tutorial', 'complete', 'ultimate',
            'free', 'new', 'top', 'advanced', 'beginner', 'expert', 'review',
            'comparison', 'vs', 'latest', 'updated'
        ]);
    }

    /**
     * Generate SEO-friendly URL slug from title
     * @param {string} title - The article title
     * @returns {string} - URL-friendly slug
     */
    generateSlug(title) {
        if (!title || typeof title !== 'string') {
            return '';
        }

        let slug = title
            .toLowerCase()
            .trim()
            // Remove special characters except spaces and hyphens
            .replace(/[^\w\s-]/g, '')
            // Replace multiple spaces with single space
            .replace(/\s+/g, ' ')
            // Split into words for processing
            .split(' ')
            // Remove stop words but keep power words
            .filter(word => {
                word = word.trim();
                if (!word) return false;
                if (this.POWER_WORDS.has(word)) return true;
                return !this.STOP_WORDS.has(word);
            })
            // Rejoin with hyphens
            .join('-')
            // Remove multiple hyphens
            .replace(/-+/g, '-')
            // Remove leading/trailing hyphens
            .replace(/^-|-$/g, '');

        // Limit slug length
        if (slug.length > this.SLUG_MAX_LENGTH) {
            slug = slug.substring(0, this.SLUG_MAX_LENGTH);
            // Ensure we don't cut off in the middle of a word
            const lastHyphen = slug.lastIndexOf('-');
            if (lastHyphen > this.SLUG_MAX_LENGTH * 0.8) {
                slug = slug.substring(0, lastHyphen);
            }
        }

        // Fallback if slug is empty
        if (!slug) {
            slug = 'article-' + Date.now();
        }

        return slug;
    }

    /**
     * Optimize title for SEO (60 characters max)
     * @param {string} title - Original title
     * @returns {string} - SEO-optimized title
     */
    optimizeTitle(title) {
        if (!title || typeof title !== 'string') {
            return '';
        }

        let optimizedTitle = title.trim();

        // If title is within limit, return as-is
        if (optimizedTitle.length <= this.TITLE_MAX_LENGTH) {
            return optimizedTitle;
        }

        // Truncate at word boundary
        let truncated = optimizedTitle.substring(0, this.TITLE_MAX_LENGTH);
        const lastSpace = truncated.lastIndexOf(' ');
        
        // If we can find a good breaking point, use it
        if (lastSpace > this.TITLE_MAX_LENGTH * 0.6) {
            truncated = truncated.substring(0, lastSpace);
        }

        // Add ellipsis if truncated
        return truncated.trim() + (truncated.length < optimizedTitle.length ? '...' : '');
    }

    /**
     * Generate meta description from content
     * @param {string} content - Article content
     * @param {string} title - Article title (for context)
     * @returns {string} - SEO-optimized meta description
     */
    generateMetaDescription(content, title = '') {
        if (!content || typeof content !== 'string') {
            return '';
        }

        // Clean and normalize content
        let cleanContent = content
            .replace(/\s+/g, ' ') // Normalize whitespace
            .replace(/[^\w\s.,!?-]/g, '') // Remove special characters except basic punctuation
            .trim();

        // If content is short enough, use it as-is
        if (cleanContent.length <= this.META_DESCRIPTION_MAX_LENGTH) {
            return cleanContent;
        }

        // Try to find a good sentence break near the limit
        const sentences = cleanContent.split(/[.!?]+/);
        let description = '';
        
        for (const sentence of sentences) {
            const trimmedSentence = sentence.trim();
            if (!trimmedSentence) continue;
            
            const potentialDesc = description + 
                (description ? '. ' : '') + 
                trimmedSentence;
                
            if (potentialDesc.length <= this.META_DESCRIPTION_MAX_LENGTH - 3) {
                description = potentialDesc;
            } else {
                break;
            }
        }

        // If we have a good description, add period and return
        if (description && description.length > 50) {
            return description + (description.endsWith('.') ? '' : '.');
        }

        // Fallback: truncate at word boundary
        let truncated = cleanContent.substring(0, this.META_DESCRIPTION_MAX_LENGTH - 3);
        const lastSpace = truncated.lastIndexOf(' ');
        
        if (lastSpace > this.META_DESCRIPTION_MAX_LENGTH * 0.7) {
            truncated = truncated.substring(0, lastSpace);
        }

        return truncated.trim() + '...';
    }

    /**
     * Extract and clean text content
     * @param {string} content - Raw content
     * @returns {string} - Cleaned content
     */
    sanitizeContent(content) {
        if (!content || typeof content !== 'string') {
            return '';
        }

        return content
            // Remove HTML tags if any
            .replace(/<[^>]*>/g, '')
            // Remove extra whitespace
            .replace(/\s+/g, ' ')
            // Remove special characters that might cause issues
            .replace(/[^\w\s.,!?;:()\-'"]/g, '')
            .trim();
    }

    /**
     * Validate and process SEO data
     * @param {string} title - Article title
     * @param {string} content - Article content
     * @returns {object} - Processed SEO data
     */
    processSEOData(title, content) {
        // Sanitize inputs
        const cleanTitle = this.sanitizeContent(title);
        const cleanContent = this.sanitizeContent(content);

        // Generate SEO elements
        const slug = this.generateSlug(cleanTitle);
        const seoTitle = this.optimizeTitle(cleanTitle);
        const metaDescription = this.generateMetaDescription(cleanContent, cleanTitle);

        // Calculate quality scores
        const titleScore = this.calculateTitleScore(cleanTitle);
        const contentScore = this.calculateContentScore(cleanContent);
        const overallScore = Math.round((titleScore + contentScore) / 2);

        return {
            slug,
            seoTitle,
            metaDescription,
            originalTitle: cleanTitle,
            originalContentLength: cleanContent.length,
            seoScores: {
                title: titleScore,
                content: contentScore,
                overall: overallScore
            },
            recommendations: this.generateRecommendations(cleanTitle, cleanContent, seoTitle, metaDescription)
        };
    }

    /**
     * Calculate SEO score for title (0-100)
     */
    calculateTitleScore(title) {
        let score = 70; // Base score

        // Length optimization
        if (title.length >= 30 && title.length <= 60) {
            score += 20;
        } else if (title.length > 60) {
            score -= 10;
        } else if (title.length < 20) {
            score -= 15;
        }

        // Check for power words
        const lowerTitle = title.toLowerCase();
        const powerWordsFound = Array.from(this.POWER_WORDS).filter(word => 
            lowerTitle.includes(word)
        ).length;
        score += Math.min(powerWordsFound * 5, 15);

        // Check for numbers (often perform well)
        if (/\d/.test(title)) {
            score += 5;
        }

        return Math.max(0, Math.min(100, score));
    }

    /**
     * Calculate SEO score for content (0-100)
     */
    calculateContentScore(content) {
        let score = 60; // Base score

        // Length optimization
        if (content.length >= 300 && content.length <= 2000) {
            score += 25;
        } else if (content.length > 2000) {
            score += 15;
        } else if (content.length < 150) {
            score -= 20;
        }

        // Sentence structure
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const avgSentenceLength = content.length / sentences.length;
        if (avgSentenceLength >= 15 && avgSentenceLength <= 25) {
            score += 10;
        }

        // Readability (simple check for varied sentence starts)
        const sentenceStarts = sentences.map(s => s.trim().charAt(0).toLowerCase());
        const uniqueStarts = new Set(sentenceStarts).size;
        if (uniqueStarts / sentences.length > 0.6) {
            score += 5;
        }

        return Math.max(0, Math.min(100, score));
    }

    /**
     * Generate SEO recommendations
     */
    generateRecommendations(title, content, seoTitle, metaDescription) {
        const recommendations = [];

        // Title recommendations
        if (title.length > 60) {
            recommendations.push({
                type: 'title',
                level: 'warning',
                message: 'Title is longer than 60 characters and may be truncated in search results'
            });
        }
        
        if (title.length < 30) {
            recommendations.push({
                type: 'title',
                level: 'info',
                message: 'Consider making your title more descriptive (30-60 characters is optimal)'
            });
        }

        // Content recommendations  
        if (content.length < 200) {
            recommendations.push({
                type: 'content',
                level: 'warning',
                message: 'Content is quite short. Consider adding more valuable information'
            });
        }

        // Meta description recommendations
        if (metaDescription.length > 160) {
            recommendations.push({
                type: 'meta',
                level: 'warning',
                message: 'Meta description may be truncated in search results'
            });
        }

        // SEO best practices
        const lowerTitle = title.toLowerCase();
        const hasNumbers = /\d/.test(title);
        const hasPowerWords = Array.from(this.POWER_WORDS).some(word => 
            lowerTitle.includes(word)
        );

        if (!hasNumbers && !hasPowerWords) {
            recommendations.push({
                type: 'title',
                level: 'info',
                message: 'Consider adding numbers or power words like "best", "guide", "tips" to improve click-through rates'
            });
        }

        return recommendations;
    }
}

// Export singleton instance
module.exports = new SEOProcessor();