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
            titleCharCount.style.color = count > 60 ? '#e57373' : '#666666';
        }

        if (metaCharCount && data.metaDescription) {
            const count = data.metaDescription.length;
            metaCharCount.textContent = `${count}/160 characters`;
            metaCharCount.style.color = count > 160 ? '#e57373' : '#666666';
        }

        // Show results section with animation
        this.showResults();
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

    // Method to add copy functionality to results
    addCopyFunctionality() {
        const resultElements = document.querySelectorAll('.result-content span');
        
        resultElements.forEach(element => {
            // Add click listener for copying
            element.addEventListener('click', async () => {
                const text = element.textContent;
                const success = await this.copyToClipboard(text);
                
                if (success) {
                    // Show temporary feedback
                    const originalText = element.textContent;
                    element.textContent = 'Copied!';
                    element.style.color = '#7cb342';
                    
                    setTimeout(() => {
                        element.textContent = originalText;
                        element.style.color = '';
                    }, 1000);
                }
            });
            
            // Add hover effect
            element.style.cursor = 'pointer';
            element.title = 'Click to copy';
        });
    }

    // Method to clear form
    clearForm() {
        this.form.reset();
        this.hideResults();
        this.hideError();
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
    
    // Add copy functionality after results are displayed
    const originalDisplayResults = processor.displayResults.bind(processor);
    processor.displayResults = function(data) {
        originalDisplayResults(data);
        setTimeout(() => this.addCopyFunctionality(), 100);
    };
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SEOContentProcessor;
}