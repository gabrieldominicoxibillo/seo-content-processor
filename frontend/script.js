document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('seo-form');
    const resultsDiv = document.getElementById('results');
    const errorDiv = document.getElementById('error');
    const submitButton = form.querySelector('button[type="submit"]');
    
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