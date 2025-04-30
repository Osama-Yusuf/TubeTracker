// TubeTracker - history.js
// Handles playlist history functionality

// History feature functionality
function initHistoryFeature() {
    const clearHistoryBtn = document.getElementById('clear-history');
    
    // Load history on startup
    updateHistoryList();
    
    // Clear history button
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to clear your playlist history?')) {
                localStorage.removeItem('playlistHistory');
                updateHistoryList();
            }
        });
    }
}

function updateHistoryList() {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;
    
    // Clear previous items
    historyList.innerHTML = '';
    
    // Get history from localStorage
    const playlistHistory = JSON.parse(localStorage.getItem('playlistHistory')) || [];
    
    // If no history, show message
    if (playlistHistory.length === 0) {
        historyList.innerHTML = '<p class="no-history">No playlists in history yet.</p>';
        return;
    }
    
    // Add each history item
    playlistHistory.forEach((item, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        const playlistTitle = document.createElement('div');
        playlistTitle.className = 'history-title';
        playlistTitle.textContent = item.title || 'Untitled Playlist';
        
        const playlistUrl = document.createElement('div');
        playlistUrl.className = 'history-url';
        playlistUrl.textContent = item.url;
        
        // Format date nicely
        const dateObj = new Date(item.date);
        const formattedDate = dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const playlistDate = document.createElement('div');
        playlistDate.className = 'history-date';
        playlistDate.textContent = formattedDate;
        
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'history-actions';
        
        const loadBtn = document.createElement('button');
        loadBtn.className = 'history-load-btn';
        loadBtn.innerHTML = '<i class="fas fa-play"></i> Load';
        loadBtn.addEventListener('click', function() {
            const playlistUrlInput = document.getElementById('playlist-url');
            if (playlistUrlInput) {
                playlistUrlInput.value = item.url;
            }
            
            // Load the saved data if available
            if (item.formattedOutput && item.stats) {
                // Save the formatted output globally for persistence
                window.lastFormattedOutput = item.formattedOutput;
                
                // Set the playlist title for use in displayPlaylistSummary
                window.currentPlaylistTitle = item.title;
                
                // Display the stats and formatted output
                displayPlaylistSummary(item.videos || [], {
                    ...item.stats,
                    title: item.title // Explicitly pass the title to ensure it's used
                });
                
                // Show success message
                showAlert('Playlist loaded successfully!', 'success');
            } else {
                // If no saved data, trigger the format button
                const formatBtn = document.getElementById('format-btn');
                if (formatBtn) {
                    formatBtn.click();
                } else {
                    showAlert('Could not load playlist data. Please try formatting again.', 'error');
                }
            }
            
            // Close modal if it exists
            const historyModal = document.getElementById('history-modal');
            if (historyModal) {
                historyModal.style.display = 'none';
            } else {
                // Hide history section if using the old approach
                const historySection = document.querySelector('.history-section');
                if (historySection) {
                    historySection.style.display = 'none';
                }
            }
        });
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'history-remove-btn';
        removeBtn.innerHTML = '<i class="fas fa-trash"></i>';
        removeBtn.addEventListener('click', function() {
            removeFromHistory(index);
        });
        
        actionsDiv.appendChild(loadBtn);
        actionsDiv.appendChild(removeBtn);
        
        historyItem.appendChild(playlistTitle);
        historyItem.appendChild(playlistUrl);
        historyItem.appendChild(playlistDate);
        historyItem.appendChild(actionsDiv);
        
        historyList.appendChild(historyItem);
    });
}

// Remove from history
function removeFromHistory(index) {
    const playlistHistory = JSON.parse(localStorage.getItem('playlistHistory')) || [];
    if (index >= 0 && index < playlistHistory.length) {
        playlistHistory.splice(index, 1);
        localStorage.setItem('playlistHistory', JSON.stringify(playlistHistory));
        updateHistoryList();
    }
}

// Add to history
function addToHistory(item) {
    // Get existing history
    const playlistHistory = JSON.parse(localStorage.getItem('playlistHistory')) || [];
    
    // Check if URL already exists in history
    const existingIndex = playlistHistory.findIndex(historyItem => historyItem.url === item.url);
    
    if (existingIndex !== -1) {
        // Update existing entry
        playlistHistory[existingIndex] = item;
    } else {
        // Add new entry
        playlistHistory.unshift(item);
        // Limit history to 20 items
        if (playlistHistory.length > 20) {
            playlistHistory.pop();
        }
    }
    
    // Save to localStorage
    localStorage.setItem('playlistHistory', JSON.stringify(playlistHistory));
}

// Export functions for use in other modules
window.initHistoryFeature = initHistoryFeature;
window.updateHistoryList = updateHistoryList;
window.removeFromHistory = removeFromHistory;
window.addToHistory = addToHistory;
