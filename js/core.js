// TubeTracker - core.js
// Core initialization and utility functions

// Main initialization function
function initApp() {
    // Initialize core functionality
    initThemeToggle();
    initApiKey();
    initModalButtons();
    initHistoryFeature();
    initExportOptions();
    initShareFeature();
    initFormatButton();
    initCopyButton();
    initWatchSpeedControl();
}

// Show alert message
function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alert-container');
    if (!alertContainer) {
        // Create alert container if it doesn't exist
        const container = document.createElement('div');
        container.id = 'alert-container';
        document.body.appendChild(container);
    }
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.innerHTML = `
        <div class="alert-content">
            <span>${message}</span>
            <button class="alert-close"><i class="fas fa-times"></i></button>
        </div>
    `;
    
    document.getElementById('alert-container').appendChild(alertDiv);
    
    // Add close button functionality
    const closeBtn = alertDiv.querySelector('.alert-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            alertDiv.remove();
        });
    }
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

// Extract playlist ID from URL
function extractPlaylistId(url) {
    if (!url) return null;
    
    const regex = /(?:youtube\.com\/playlist\?list=|youtube\.com\/watch\?v=.+&list=|youtu\.be\/.+&list=)([^&\s]+)/;
    const match = url.match(regex);
    
    return match ? match[1] : null;
}

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

// Export functions for use in other modules
window.showAlert = showAlert;
window.extractPlaylistId = extractPlaylistId;
