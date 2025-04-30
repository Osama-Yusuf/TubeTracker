// TubeTracker - main.js
// Main entry point that loads all modules

// This file serves as the main entry point for the TubeTracker application
// It ensures all modules are loaded in the correct order

// Global variables
window.lastFormattedOutput = null;
window.currentPlaylistTitle = null;
window.currentVideosData = null;
window.originalStats = null;

// Document ready function
document.addEventListener('DOMContentLoaded', function() {
    console.log('TubeTracker initialized');
    
    // Initialize core functionality
    if (typeof initApp === 'function') {
        initApp();
    } else {
        console.error('Core initialization function not found');
    }
});
