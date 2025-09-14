document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('seo-form');
    const resultsDiv = document.getElementById('results');
    const errorDiv = document.getElementById('error');
    const submitButton = form.querySelector('button[type="submit"]');
    
    // Quick Start Elements
    const quickStartBtn = document.getElementById('quickStartBtn');
    const popupOverlay = document.getElementById('popupOverlay');
    const closeBtn = document.getElementById('closeBtn');
    const pasteBtn = document.getElementById('pasteBtn');
    const titleInput = document.getElementById('title');
    const contentInput = document.getElementById('content');
    
    // Example data
    const exampleTitle = "How to Build a Scalable Full-Stack Application Using Modern Web Technologies in 2025 for Better Performance and Reliability";
    const exampleContent = "Building scalable web applications is crucial for handling growing traffic. This guide explores architecture patterns, database optimization techniques, caching strategies, containerization using Docker, and CI/CD workflows to ensure your applications remain fast and reliable even as user demand increases across multiple regions and devices.";
    
    // Quick Start Event Listeners
    quickStartBtn.addEventListener('click', openPopup);
    closeBtn.addEventListener('click', closePopup);
    popupOverlay.addEventListener('click', function(e) {
        if (e.target === popupOverlay) {
            closePopup();
        }
    });
    pasteBtn.addEventListener('click', pasteExample);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && popupOverlay.classList.contains('active')) {
            closePopup();
        }
    });
    
    function openPopup() {
        popupOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function closePopup() {
        popupOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    function pasteExample() {
        titleInput.value = exampleTitle;
        contentInput.value = exampleContent;
        closePopup();
        
        // Optional: Add a subtle animation to indicate the text was pasted
        titleInput.style.transition = 'all 0.3s ease';
        contentInput.style.transition = 'all 0.3s ease';
        titleInput.style.borderColor = '#00ff88';
        contentInput.style.borderColor = '#00ff88';
        
        setTimeout(() => {
            titleInput.style.borderColor = '';
            contentInput.style.borderColor = '';
        }, 1000);
    }
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const title = document.getElementById('title').value.trim();
        const content = document.getElementById('content').value.trim();
        
        if (!title || !content) {
            showError('Please fill in both title and content fields.');
            return;
        }
        
        try {
            submitButton.disabled = true;
            submitButton.textContent = 'Processing...';
            hideError();
            hideResults();
            
            const response = await fetch('/api/process', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, content })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Something went wrong');
            }
            
            displayResults(data);
            
        } catch (error) {
            showError(error.message);
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Generate SEO';
        }
    });
    
    function displayResults(data) {
        document.getElementById('slug-result').textContent = data.slug;
        document.getElementById('title-result').textContent = data.seoTitle;
        document.getElementById('description-result').textContent = data.metaDescription;
        
        resultsDiv.classList.remove('hidden');
    }
    
    function showError(message) {
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
    }
    
    function hideError() {
        errorDiv.classList.add('hidden');
    }
    
    function hideResults() {
        resultsDiv.classList.add('hidden');
    }
});