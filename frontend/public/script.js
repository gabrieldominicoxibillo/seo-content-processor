// SEO Content Processor - Frontend JavaScript
class SEOContentProcessor {
    constructor() {
        this.apiBaseUrl = 'http://localhost:3000/api';
        this.form = document.getElementById('content-form');
        this.resultsSection = document.getElementById('results');
        this.loadingSection = document.getElementById('loading');
        this.errorSection = document.getElementById('error');
        this.processButton = document.getElementById('process-btn');
        
        this.init();
    }

    init() {
        if (!this.form) {
            console.error('Form element not found');
            return;
        }

        // Bind event listeners
        this.form.addEventListener('submit', this.handleFormSubmit.bind(this));
        
        // Check if we're in development mode
        this.checkEnvironment();
    }

    checkEnvironment() {
        // Check if running locally or in production
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            this.apiBaseUrl = 'http://localhost:3000/api';
        } else {
            // Update this with your production API URL
            this.apiBaseUrl = 'https://your-worker-name.your-subdomain.workers.dev/api';
        }
    }

    async handleFormSubmit(event) {
        event.preventDefault();
        
        // Get form data
        const formData = new FormData(this.form);
        const title = formData.get('title')?.trim();
        const content = formData.get('content')?.trim();

        // Validate input
        if (!this.validateInput(title, content)) {
            return;
        }

        // Process the content
        await this.processContent({ title, content });
    }

    validateInput(title, content) {
        const errors = [];

        // Title validation
        if (!title || title.length < 3) {
            errors.push('Title must be at least 3 characters long');
        }
        if (title && title.length > 200) {
            errors.push('Title must be 200 characters or less');
        }

        // Content validation
        if (!content || content.length < 50) {
            errors.push('Content must be at least 50 characters long');
        }
        if (content && content.length > 10000) {
            errors.push('Content must be 10,000 characters or less');
        }

        // Show errors if any
        if (errors.length > 0) {
            this.showError(errors.join('. '));
            return false;
        }

        this.hideError();
        return true;
    }

    async processContent(data) {
        try {
            // Show loading state
            this.setLoadingState(true);

            // Make API request
            const response = await fetch(`${this.apiBaseUrl}/process`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            // Handle response
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Server error occurred' }));
                throw new Error(errorData.error || `Server error: ${response.status}`);
            }

            const result = await response.json();
            
            // Display results
            this.displayResults(result);

        } catch (error) {
            console.error('Processing error:', error);
            this.showError(`Failed to process content: ${error.message}`);
        } finally {
            // Hide loading state
            this.setLoadingState(false);
        }
    }

    displayResults(data) {
        // Hide error and loading sections
        this.hideError();
        this.hideLoading();

        // Store data for copy functionality
        this.currentResults = data;

        // Populate results
        const slugElement = document.getElementById('result-slug');
        const seoTitleElement = document.getElementById('result-seo-title');
        const metaDescElement = document.getElementById('result-meta-description');
        const titleCharCount = document.getElementById('title-char-count');
        const metaCharCount = document.getElementById('meta-char-count');

        if (slugElement) {
            slugElement.textContent = data.slug || 'N/A';
        }

        if (seoTitleElement) {
            seoTitleElement.textContent = data.seoTitle || 'N/A';
        }

        if (metaDescElement) {
            metaDescElement.textContent = data.metaDescription || 'N/A';
        }

        // Update character counts
        if (titleCharCount && data.seoTitle) {
            const count = data.seoTitle.length;
            titleCharCount.textContent = `${count}/60 characters`;
            titleCharCount.className = 'char-count';
            if (count > 60) {
                titleCharCount.classList.add('over-limit');
            } else if (count > 50) {
                titleCharCount.classList.add('warning');
            } else {
                titleCharCount.classList.add('good');
            }
        }

        if (metaCharCount && data.metaDescription) {
            const count = data.metaDescription.length;
            metaCharCount.textContent = `${count}/160 characters`;
            metaCharCount.className = 'char-count';
            if (count > 160) {
                metaCharCount.classList.add('over-limit');
            } else if (count > 140) {
                metaCharCount.classList.add('warning');
            } else {
                metaCharCount.classList.add('good');
            }
        }

        // Show success indicator with animation
        this.showSuccessIndicator();

        // Show results section with animation
        this.showResults();

        // Initialize copy functionality
        this.initializeCopyButtons();
    }

    setLoadingState(isLoading) {
        if (isLoading) {
            this.showLoading();
            this.hideResults();
            this.hideError();
            
            // Disable form
            this.processButton.disabled = true;
            this.processButton.textContent = 'Processing...';
            
            // Disable form inputs
            const inputs = this.form.querySelectorAll('input, textarea');
            inputs.forEach(input => input.disabled = true);
            
        } else {
            this.hideLoading();
            
            // Re-enable form
            this.processButton.disabled = false;
            this.processButton.textContent = 'Process Content';
            
            // Re-enable form inputs
            const inputs = this.form.querySelectorAll('input, textarea');
            inputs.forEach(input => input.disabled = false);
        }
    }

    showResults() {
        if (this.resultsSection) {
            this.resultsSection.style.display = 'block';
            this.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    hideResults() {
        if (this.resultsSection) {
            this.resultsSection.style.display = 'none';
        }
    }

    showLoading() {
        if (this.loadingSection) {
            this.loadingSection.style.display = 'block';
        }
    }

    hideLoading() {
        if (this.loadingSection) {
            this.loadingSection.style.display = 'none';
        }
    }

    showError(message) {
        if (this.errorSection) {
            const errorText = document.getElementById('error-text');
            if (errorText) {
                errorText.textContent = message;
            }
            this.errorSection.style.display = 'block';
            this.errorSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    hideError() {
        if (this.errorSection) {
            this.errorSection.style.display = 'none';
        }
    }

    // Utility method to copy text to clipboard
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            return false;
        }
    }

    // Initialize copy buttons functionality
    initializeCopyButtons() {
        // Individual copy buttons
        const copyButtons = document.querySelectorAll('.copy-btn');
        copyButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                e.preventDefault();
                const copyType = button.getAttribute('data-copy');
                await this.handleCopyClick(button, copyType);
            });
        });

        // Copy all button
        const copyAllBtn = document.getElementById('copy-all-btn');
        if (copyAllBtn) {
            copyAllBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                await this.copyAllAsHTML();
            });
        }

        // Process another button
        const processAnotherBtn = document.getElementById('process-another-btn');
        if (processAnotherBtn) {
            processAnotherBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.resetForNewProcess();
            });
        }

        // Make result text clickable for copying
        const resultTexts = document.querySelectorAll('.result-text');
        resultTexts.forEach(element => {
            element.style.cursor = 'pointer';
            element.title = 'Click to copy';
            element.addEventListener('click', async () => {
                const text = element.textContent;
                const success = await this.copyToClipboard(text);
                if (success) {
                    this.showCopyFeedback(element);
                }
            });
        });
    }

    // Handle individual copy button clicks
    async handleCopyClick(button, copyType) {
        let textToCopy = '';
        
        switch (copyType) {
            case 'slug':
                textToCopy = this.currentResults?.slug || '';
                break;
            case 'seo-title':
                textToCopy = this.currentResults?.seoTitle || '';
                break;
            case 'meta-description':
                textToCopy = this.currentResults?.metaDescription || '';
                break;
        }

        if (textToCopy) {
            const success = await this.copyToClipboard(textToCopy);
            if (success) {
                this.showButtonCopyFeedback(button);
            }
        }
    }

    // Copy all results as HTML meta tags
    async copyAllAsHTML() {
        if (!this.currentResults) return;

        const htmlOutput = `<!-- SEO Meta Tags -->
<title>${this.currentResults.seoTitle || ''}</title>
<meta name="description" content="${this.currentResults.metaDescription || ''}">
<meta property="og:title" content="${this.currentResults.seoTitle || ''}">
<meta property="og:description" content="${this.currentResults.metaDescription || ''}">
<meta name="twitter:title" content="${this.currentResults.seoTitle || ''}">
<meta name="twitter:description" content="${this.currentResults.metaDescription || ''}">

<!-- URL Slug: ${this.currentResults.slug || ''} -->`;

        const success = await this.copyToClipboard(htmlOutput);
        if (success) {
            const copyAllBtn = document.getElementById('copy-all-btn');
            this.showButtonCopyFeedback(copyAllBtn, 'HTML Copied!');
        }
    }

    // Show copy feedback for buttons
    showButtonCopyFeedback(button, customText = 'Copied!') {
        const originalText = button.innerHTML;
        button.innerHTML = `<span class="success-icon">✓</span> ${customText}`;
        button.classList.add('copied');
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.classList.remove('copied');
        }, 2000);
    }

    // Show copy feedback for text elements
    showCopyFeedback(element) {
        const originalText = element.textContent;
        element.textContent = 'Copied!';
        element.classList.add('copied-text');
        
        setTimeout(() => {
            element.textContent = originalText;
            element.classList.remove('copied-text');
        }, 1500);
    }

    // Show success indicator with animation
    showSuccessIndicator() {
        const indicator = document.getElementById('success-indicator');
        if (indicator) {
            indicator.style.display = 'flex';
            indicator.style.opacity = '0';
            indicator.style.transform = 'translateY(-10px)';
            
            // Animate in
            setTimeout(() => {
                indicator.style.transition = 'all 0.3s ease-out';
                indicator.style.opacity = '1';
                indicator.style.transform = 'translateY(0)';
            }, 100);
        }
    }

    // Hide success indicator
    hideSuccessIndicator() {
        const indicator = document.getElementById('success-indicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
    }

    // Reset for new process
    resetForNewProcess() {
        this.hideResults();
        this.hideError();
        this.hideSuccessIndicator();
        this.currentResults = null;
        
        // Scroll to form
        this.form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Focus on title input
        const titleInput = document.getElementById('article-title');
        if (titleInput) {
            setTimeout(() => titleInput.focus(), 500);
        }
    }

    // Method to clear form
    clearForm() {
        this.form.reset();
        this.hideResults();
        this.hideError();
        this.hideSuccessIndicator();
    }

    // Method to handle keyboard shortcuts
    handleKeyboardShortcuts(event) {
        // Ctrl/Cmd + Enter to submit form
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            event.preventDefault();
            this.form.dispatchEvent(new Event('submit'));
        }
        
        // Escape to clear form
        if (event.key === 'Escape') {
            this.clearForm();
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const processor = new SEOContentProcessor();
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', processor.handleKeyboardShortcuts.bind(processor));
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SEOContentProcessor;
}