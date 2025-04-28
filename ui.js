// UI handling for YouTube Playlist Formatter
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const playlistUrlInput = document.getElementById('playlist-url');
    const apiKeyInput = document.getElementById('api-key');
    const toggleApiKeyBtn = document.getElementById('toggle-api-key');
    const formatBtn = document.getElementById('format-btn');
    const copyBtn = document.getElementById('copy-btn');
    const resultText = document.getElementById('result-text');
    const loadingSection = document.querySelector('.loading-section');
    const resultSection = document.querySelector('.result-section');
    const errorSection = document.querySelector('.error-section');
    const errorMessage = document.getElementById('error-message');

    // Toggle API key visibility
    toggleApiKeyBtn.addEventListener('click', function() {
        const type = apiKeyInput.getAttribute('type') === 'password' ? 'text' : 'password';
        apiKeyInput.setAttribute('type', type);
        toggleApiKeyBtn.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
    });

    // Format playlist button click
    formatBtn.addEventListener('click', async function() {
        const playlistUrl = playlistUrlInput.value.trim();
        const apiKey = apiKeyInput.value.trim();

        // Validate inputs
        if (!playlistUrl) {
            showError('Please enter a YouTube playlist URL');
            return;
        }

        if (!apiKey) {
            showError('Please enter your YouTube API key');
            return;
        }

        // Show loading spinner
        hideError();
        resultSection.style.display = 'none';
        loadingSection.style.display = 'block';

        try {
            // Call the formatPlaylist function from app.js
            const result = await formatPlaylist(playlistUrl, apiKey);
            
            if (result.startsWith('Error:')) {
                showError(result);
                loadingSection.style.display = 'none';
                return;
            }

            // Display result
            resultText.textContent = result;
            loadingSection.style.display = 'none';
            resultSection.style.display = 'block';
            
            // Scroll to result
            resultSection.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            showError('An error occurred: ' + error.message);
            loadingSection.style.display = 'none';
        }
    });

    // Copy button click
    copyBtn.addEventListener('click', function() {
        const textToCopy = resultText.textContent;
        
        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                // Visual feedback
                copyBtn.classList.add('copy-success');
                copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                
                setTimeout(() => {
                    copyBtn.classList.remove('copy-success');
                    copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy text: ', err);
                showError('Failed to copy text to clipboard');
            });
    });

    // Helper function to show error
    function showError(message) {
        errorMessage.textContent = message;
        errorSection.style.display = 'block';
        
        // Scroll to error
        errorSection.scrollIntoView({ behavior: 'smooth' });
    }

    // Helper function to hide error
    function hideError() {
        errorSection.style.display = 'none';
    }

    // Add sample playlist URL if empty
    if (!playlistUrlInput.value) {
        playlistUrlInput.value = 'https://youtube.com/playlist?list=PLpQQipWcxwt_zElnggTMS3Y_MzF9EjOGr';
    }
});
