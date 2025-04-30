// TubeTracker - UI.js
// Handles all UI interactions and localStorage functionality

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded - initializing TubeTracker');
    
    // Initialize core functionality with proper error handling
    try {
        initThemeToggle();
        console.log('Theme toggle initialized');
    } catch (error) {
        console.error('Error initializing theme toggle:', error);
    }
    
    try {
        initApiKey();
        console.log('API key initialized');
    } catch (error) {
        console.error('Error initializing API key:', error);
    }
    
    try {
        initModalButtons();
        console.log('Modal buttons initialized');
    } catch (error) {
        console.error('Error initializing modal buttons:', error);
    }
    
    try {
        initHistoryFeature();
        console.log('History feature initialized');
    } catch (error) {
        console.error('Error initializing history feature:', error);
    }
    
    try {
        initExportOptions();
        console.log('Export options initialized');
    } catch (error) {
        console.error('Error initializing export options:', error);
    }
    
    try {
        initShareFeature();
        console.log('Share feature initialized');
    } catch (error) {
        console.error('Error initializing share feature:', error);
    }
    
    try {
        initFormatButton();
        console.log('Format button initialized');
    } catch (error) {
        console.error('Error initializing format button:', error);
    }
    
    try {
        initCopyButton();
        console.log('Copy button initialized');
    } catch (error) {
        console.error('Error initializing copy button:', error);
    }
    
    try {
        initWatchSpeedControl();
        console.log('Watch speed control initialized');
    } catch (error) {
        console.error('Error initializing watch speed control:', error);
    }
    
    // Check localStorage items
    console.log('Theme from localStorage:', localStorage.getItem('theme'));
    console.log('API key exists in localStorage:', !!localStorage.getItem('youtubeApiKey'));
    console.log('History exists in localStorage:', !!localStorage.getItem('playlistHistory'));
});

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

// Format button initialization
function initFormatButton() {
    const formatBtn = document.getElementById('format-btn');
    if (!formatBtn) return;
    
    formatBtn.addEventListener('click', async function() {
        const playlistUrl = document.getElementById('playlist-url').value.trim();
        const apiKey = localStorage.getItem('youtubeApiKey') || '';
        
        if (!playlistUrl) {
            showAlert('Please enter a YouTube playlist URL.', 'error');
            return;
        }
        
        if (!apiKey) {
            showAlert('Please set your YouTube API key in settings.', 'error');
            return;
        }
        
        // Show loading
        const loadingSection = document.querySelector('.loading-section');
        if (loadingSection) loadingSection.style.display = 'flex';
        
        try {
            // Get formatting options
            const options = {
                includeNumbers: document.getElementById('include-numbers')?.checked || false,
                includeDuration: document.getElementById('include-duration')?.checked || false,
                includeLinks: document.getElementById('include-links')?.checked || false,
                watchSpeed: parseFloat(document.getElementById('watch-speed-input')?.value || '1') || 1
            };
            
            // Format playlist
            const result = await formatPlaylistWithOptions(playlistUrl, apiKey, options);
            
            if (result.error) {
                showAlert(result.error, 'error');
            } else {
                // Save the formatted output globally for persistence
                window.lastFormattedOutput = result.formattedOutput || '';
                
                // Display formatted output
                const formattedOutput = document.getElementById('formatted-output');
                if (formattedOutput) {
                    formattedOutput.value = result.formattedOutput || '';
                }
                
                // Set playlist title
                const playlistTitle = document.getElementById('playlist-title');
                if (playlistTitle) {
                    playlistTitle.textContent = result.title || 'Formatted Playlist';
                }
                
                // Save the playlist title globally
                window.currentPlaylistTitle = result.title;
                
                // Display playlist summary with stats and output
                displayPlaylistSummary(result.videos || [], {
                    ...result.stats,
                    title: result.title // Explicitly pass the title to the stats object
                });
                
                // Add to history
                addToHistory({
                    url: playlistUrl,
                    title: result.title || 'Untitled Playlist',
                    date: new Date().toISOString(),
                    formattedOutput: result.formattedOutput || '',
                    stats: result.stats || {},
                    videos: result.videos || []
                });
                
                // Update history list
                updateHistoryList();
            }
        } catch (error) {
            console.error('Error formatting playlist:', error);
            showAlert('An error occurred while formatting the playlist. Please try again.', 'error');
        } finally {
            // Hide loading
            if (loadingSection) loadingSection.style.display = 'none';
        }
    });
}

// Theme toggle functionality
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.querySelector('.theme-icon i');
    
    if (!themeToggle || !themeIcon) return;
    
    // Load saved theme preference with error handling
    let savedTheme = null;
    try {
        savedTheme = localStorage.getItem('theme');
        console.log('Theme from localStorage:', savedTheme);
    } catch (error) {
        console.error('Error retrieving theme from localStorage:', error);
    }
    
    if (savedTheme === 'dark') {
        console.log('Applying dark theme');
        document.body.setAttribute('data-theme', 'dark');
        themeToggle.checked = true;
        themeIcon.className = 'fas fa-sun';
    } else {
        console.log('Applying light theme (default)');
        document.body.setAttribute('data-theme', 'light');
        themeToggle.checked = false;
        themeIcon.className = 'fas fa-moon';
    }
    
    // Add event listener for theme toggle
    themeToggle.addEventListener('change', function() {
        if (this.checked) {
            document.body.setAttribute('data-theme', 'dark');
            themeIcon.className = 'fas fa-sun';
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.setAttribute('data-theme', 'light');
            themeIcon.className = 'fas fa-moon';
            localStorage.setItem('theme', 'light');
        }
    });
}

// API Key management
function initApiKey() {
    // Get all API key related elements from main UI
    const apiKeyInput = document.getElementById('api-key');
    const apiKeyMessage = document.getElementById('api-key-message');
    const apiKeySection = document.getElementById('api-key-section');
    const changeApiKeyBtn = document.getElementById('change-api-key');
    const toggleApiKeyBtn = document.getElementById('toggle-api-key');
    
    // Get settings modal elements
    const settingsApiKeyInput = document.querySelector('#settings-modal #api-key');
    const toggleApiKeyVisibilityBtn = document.getElementById('toggle-api-key-visibility');
    const saveApiKeyBtn = document.getElementById('save-api-key');
    const apiKeyStatus = document.getElementById('api-key-status');
    
    // Initialize API key in both places with error handling
    let savedApiKey = null;
    try {
        savedApiKey = localStorage.getItem('youtubeApiKey');
        console.log('API key exists in localStorage:', !!savedApiKey);
    } catch (error) {
        console.error('Error retrieving API key from localStorage:', error);
    }
    
    // Update main UI API key
    if (apiKeyInput) {
        if (savedApiKey) {
            console.log('Setting API key in input field');
            apiKeyInput.value = savedApiKey;
            
            // Update the API key message
            if (apiKeyMessage) {
                apiKeyMessage.textContent = 'API key saved';
                apiKeyMessage.style.color = 'var(--success-color)';
            }
            
            // Hide the API key section and show the change button
            if (apiKeySection) {
                apiKeySection.style.display = 'none';
            }
            
            if (changeApiKeyBtn) {
                changeApiKeyBtn.style.display = 'inline-block';
            }
        } else {
            console.log('No API key found in localStorage');
            // No API key saved
            if (apiKeyMessage) {
                apiKeyMessage.textContent = 'No API key saved';
                apiKeyMessage.style.color = 'var(--error-color)';
            }
            
            // Show the API key section
            if (apiKeySection) {
                apiKeySection.style.display = 'block';
            }
            
            if (changeApiKeyBtn) {
                changeApiKeyBtn.style.display = 'none';
            }
        }
        
        // Handle API key input changes in main UI
        apiKeyInput.addEventListener('input', function() {
            const apiKey = this.value.trim();
            if (apiKey) {
                // Save to localStorage on input change
                localStorage.setItem('youtubeApiKey', apiKey);
                
                // Update the message
                if (apiKeyMessage) {
                    apiKeyMessage.textContent = 'API key saved';
                    apiKeyMessage.style.color = 'var(--success-color)';
                }
                
                // Also update settings modal input if it exists
                if (settingsApiKeyInput) {
                    settingsApiKeyInput.value = apiKey;
                }
            }
        });
        
        // Toggle API key visibility in main UI
        if (toggleApiKeyBtn) {
            toggleApiKeyBtn.addEventListener('click', function() {
                if (apiKeyInput.type === 'password') {
                    apiKeyInput.type = 'text';
                    this.innerHTML = '<i class="fas fa-eye-slash"></i>';
                } else {
                    apiKeyInput.type = 'password';
                    this.innerHTML = '<i class="fas fa-eye"></i>';
                }
            });
        }
        
        // Change API key button in main UI
        if (changeApiKeyBtn) {
            changeApiKeyBtn.addEventListener('click', function() {
                if (apiKeySection) {
                    apiKeySection.style.display = 'block';
                    this.style.display = 'none';
                }
            });
        }
    }
    
    // Update settings modal API key
    if (settingsApiKeyInput) {
        if (savedApiKey) {
            settingsApiKeyInput.value = savedApiKey;
            
            if (apiKeyStatus) {
                apiKeyStatus.textContent = 'API Key loaded from storage';
                apiKeyStatus.className = 'status-success';
            }
        }
        
        // Toggle API key visibility in settings modal
        if (toggleApiKeyVisibilityBtn) {
            toggleApiKeyVisibilityBtn.addEventListener('click', function() {
                if (settingsApiKeyInput.type === 'password') {
                    settingsApiKeyInput.type = 'text';
                    this.innerHTML = '<i class="fas fa-eye-slash"></i>';
                } else {
                    settingsApiKeyInput.type = 'password';
                    this.innerHTML = '<i class="fas fa-eye"></i>';
                }
            });
        }
        
        // Save API key button in settings modal
        if (saveApiKeyBtn) {
            saveApiKeyBtn.addEventListener('click', function() {
                const apiKey = settingsApiKeyInput.value.trim();
                if (apiKey) {
                    localStorage.setItem('youtubeApiKey', apiKey);
                    
                    if (apiKeyStatus) {
                        apiKeyStatus.textContent = 'API Key saved successfully';
                        apiKeyStatus.className = 'status-success';
                    }
                    
                    // Also update main UI
                    if (apiKeyInput) {
                        apiKeyInput.value = apiKey;
                    }
                    
                    if (apiKeyMessage) {
                        apiKeyMessage.textContent = 'API key saved';
                        apiKeyMessage.style.color = 'var(--success-color)';
                    }
                    
                    if (apiKeySection) {
                        apiKeySection.style.display = 'none';
                    }
                    
                    if (changeApiKeyBtn) {
                        changeApiKeyBtn.style.display = 'inline-block';
                    }
                } else {
                    if (apiKeyStatus) {
                        apiKeyStatus.textContent = 'Please enter a valid API Key';
                        apiKeyStatus.className = 'status-error';
                    }
                }
            });
        }
    }
}

// Initialize modal buttons
function initModalButtons() {
    // Settings Modal
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettingsModal = document.getElementById('close-settings-modal');
    
    if (settingsBtn && settingsModal) {
        settingsBtn.addEventListener('click', function() {
            settingsModal.style.display = 'block';
        });
        
        if (closeSettingsModal) {
            closeSettingsModal.addEventListener('click', function() {
                settingsModal.style.display = 'none';
            });
        }
    }
    
    // History Modal
    const historyBtn = document.getElementById('history-btn');
    const historyModal = document.getElementById('history-modal');
    const closeHistoryModal = document.getElementById('close-history-modal');
    
    if (historyBtn) {
        historyBtn.addEventListener('click', function() {
            // If we have a modal, use it
            if (historyModal) {
                updateHistoryList();
                historyModal.style.display = 'block';
            } else {
                // Otherwise toggle the history section
                const historySection = document.querySelector('.history-section');
                if (historySection) {
                    if (historySection.style.display === 'none' || historySection.style.display === '') {
                        historySection.style.display = 'block';
                        updateHistoryList();
                        historySection.scrollIntoView({ behavior: 'smooth' });
                    } else {
                        historySection.style.display = 'none';
                    }
                }
            }
        });
        
        if (closeHistoryModal) {
            closeHistoryModal.addEventListener('click', function() {
                historyModal.style.display = 'none';
            });
        }
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (settingsModal && event.target === settingsModal) {
            settingsModal.style.display = 'none';
        }
        if (historyModal && event.target === historyModal) {
            historyModal.style.display = 'none';
        }
    });
}

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
    if (!historyList) {
        console.error('History list element not found');
        return;
    }
    
    // Clear previous items
    historyList.innerHTML = '';
    
    // Get history from localStorage with error handling
    let playlistHistory = [];
    try {
        const historyData = localStorage.getItem('playlistHistory');
        console.log('Raw history data from localStorage:', historyData);
        
        if (historyData) {
            playlistHistory = JSON.parse(historyData);
            console.log('Parsed history data:', playlistHistory);
        } else {
            console.log('No history data found in localStorage');
        }
    } catch (error) {
        console.error('Error parsing history data from localStorage:', error);
    }
    
    // If no history, show message
    if (!playlistHistory || playlistHistory.length === 0) {
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

// Export options
function initExportOptions() {
    const exportDropdownBtn = document.getElementById('export-dropdown');
    const dropdownContent = document.getElementById('export-dropdown-content');
    const exportTxtBtn = document.getElementById('export-txt');
    const exportMdBtn = document.getElementById('export-md');
    const exportCsvBtn = document.getElementById('export-csv');
    const exportJsonBtn = document.getElementById('export-json');
    const exportHtmlBtn = document.getElementById('export-html');
    
    // Make dropdown work on click instead of hover
    if (exportDropdownBtn && dropdownContent) {
        exportDropdownBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent click from immediately closing dropdown
            dropdownContent.classList.toggle('show-dropdown');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!exportDropdownBtn.contains(e.target)) {
                dropdownContent.classList.remove('show-dropdown');
            }
        });
    }
    
    // Export buttons event listeners
    if (exportTxtBtn) {
        exportTxtBtn.addEventListener('click', function() {
            exportPlaylist('txt');
            if (dropdownContent) dropdownContent.classList.remove('show-dropdown');
        });
    }
    
    if (exportMdBtn) {
        exportMdBtn.addEventListener('click', function() {
            exportPlaylist('md');
            if (dropdownContent) dropdownContent.classList.remove('show-dropdown');
        });
    }
    
    if (exportCsvBtn) {
        exportCsvBtn.addEventListener('click', function() {
            exportPlaylist('csv');
            if (dropdownContent) dropdownContent.classList.remove('show-dropdown');
        });
    }
    
    if (exportJsonBtn) {
        exportJsonBtn.addEventListener('click', function() {
            exportPlaylist('json');
            if (dropdownContent) dropdownContent.classList.remove('show-dropdown');
        });
    }
    
    if (exportHtmlBtn) {
        exportHtmlBtn.addEventListener('click', function() {
            exportPlaylist('html');
            if (dropdownContent) dropdownContent.classList.remove('show-dropdown');
        });
    }
}

// Initialize copy button functionality
function initCopyButton() {
    const copyBtn = document.getElementById('copy-btn');
    if (!copyBtn) return;
    
    copyBtn.addEventListener('click', function() {
        const formattedOutput = document.getElementById('formatted-output');
        if (!formattedOutput || !formattedOutput.value) {
            showAlert('No playlist data to copy.', 'error');
            return;
        }
        
        // Copy to clipboard
        formattedOutput.select();
        document.execCommand('copy');
        
        // Deselect text
        formattedOutput.setSelectionRange(0, 0);
        formattedOutput.blur();
        
        // Show success message
        showAlert('Playlist copied to clipboard!', 'success');
    });
}

// Export playlist to file
function exportPlaylist(format) {
    const formattedOutput = document.getElementById('formatted-output');
    if (!formattedOutput || !formattedOutput.value) {
        showAlert('No playlist data to export. Please format a playlist first.', 'error');
        return;
    }
    
    const rawContent = formattedOutput.value;
    const playlistTitle = document.getElementById('playlist-title')?.textContent || 'playlist';
    const sanitizedTitle = playlistTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `${sanitizedTitle}.${format}`;
    
    // Get the playlist data in the appropriate format
    let content = rawContent;
    let mimeType = 'text/plain';
    
    // Format the content based on the selected format
    switch (format) {
        case 'md':
            // Markdown format
            content = `# ${playlistTitle}\n\n${rawContent}`;
            mimeType = 'text/markdown';
            break;
            
        case 'csv':
            // CSV format
            content = convertToCSV(rawContent);
            mimeType = 'text/csv';
            break;
            
        case 'json':
            // JSON format
            content = convertToJSON(rawContent, playlistTitle);
            mimeType = 'application/json';
            break;
            
        case 'html':
            // HTML format
            content = convertToHTML(rawContent, playlistTitle);
            mimeType = 'text/html';
            break;
            
        case 'txt':
        default:
            // Plain text format (default)
            mimeType = 'text/plain';
            break;
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Show success message
    showAlert(`Playlist exported as ${filename}`, 'success');
}

// Convert plain text to CSV format
function convertToCSV(text) {
    // First line will be the header
    let csv = 'Number,Title,Duration,URL\n';
    
    // Parse each line
    const lines = text.trim().split('\n');
    lines.forEach(line => {
        // Try to extract data from the line
        const numberMatch = line.match(/^(\d+)\. /);
        const number = numberMatch ? numberMatch[1] : '';
        
        // Remove number prefix if it exists
        let processedLine = line;
        if (numberMatch) {
            processedLine = line.substring(numberMatch[0].length);
        }
        
        // Extract duration if it exists [HH:MM:SS]
        const durationMatch = processedLine.match(/\[(\d+:\d+(?::\d+)?)\]/);
        const duration = durationMatch ? durationMatch[1] : '';
        
        // Extract URL if it exists
        const urlMatch = processedLine.match(/(https?:\/\/[^\s)]+)/);
        const url = urlMatch ? urlMatch[1] : '';
        
        // Extract title (everything else)
        let title = processedLine;
        if (durationMatch) {
            title = title.replace(durationMatch[0], '');
        }
        if (urlMatch) {
            title = title.replace(/\([^)]*\)/, '');
        }
        title = title.trim();
        
        // Escape quotes in the title
        title = title.replace(/"/g, '""');
        
        // Add the CSV row
        csv += `"${number}","${title}","${duration}","${url}"\n`;
    });
    
    return csv;
}

// Convert plain text to JSON format
function convertToJSON(text, playlistTitle) {
    const videos = [];
    
    // Parse each line
    const lines = text.trim().split('\n');
    lines.forEach(line => {
        // Try to extract data from the line
        const numberMatch = line.match(/^(\d+)\. /);
        const number = numberMatch ? parseInt(numberMatch[1]) : null;
        
        // Remove number prefix if it exists
        let processedLine = line;
        if (numberMatch) {
            processedLine = line.substring(numberMatch[0].length);
        }
        
        // Extract duration if it exists [HH:MM:SS]
        const durationMatch = processedLine.match(/\[(\d+:\d+(?::\d+)?)\]/);
        const duration = durationMatch ? durationMatch[1] : null;
        
        // Extract URL if it exists
        const urlMatch = processedLine.match(/(https?:\/\/[^\s)]+)/);
        const url = urlMatch ? urlMatch[1] : null;
        
        // Extract title (everything else)
        let title = processedLine;
        if (durationMatch) {
            title = title.replace(durationMatch[0], '');
        }
        if (urlMatch) {
            title = title.replace(/\([^)]*\)/, '');
        }
        title = title.trim();
        
        // Add the video object
        videos.push({
            number: number,
            title: title,
            duration: duration,
            url: url
        });
    });
    
    // Create the playlist object
    const playlist = {
        title: playlistTitle,
        count: videos.length,
        videos: videos
    };
    
    return JSON.stringify(playlist, null, 2);
}

// Convert plain text to HTML format
function convertToHTML(text, playlistTitle) {
    let html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${playlistTitle}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
        }
        h1 {
            color: #2c3e50;
            border-bottom: 2px solid #eee;
            padding-bottom: 10px;
        }
        ul {
            list-style-type: none;
            padding: 0;
        }
        li {
            padding: 10px 0;
            border-bottom: 1px solid #eee;
        }
        .duration {
            color: #7f8c8d;
            font-size: 0.9em;
        }
        a {
            color: #3498db;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <h1>${playlistTitle}</h1>
    <ul>`;
    
    // Parse each line
    const lines = text.trim().split('\n');
    lines.forEach(line => {
        // Try to extract data from the line
        const numberMatch = line.match(/^(\d+)\. /);
        const number = numberMatch ? numberMatch[1] : '';
        
        // Remove number prefix if it exists
        let processedLine = line;
        if (numberMatch) {
            processedLine = line.substring(numberMatch[0].length);
        }
        
        // Extract duration if it exists [HH:MM:SS]
        const durationMatch = processedLine.match(/\[(\d+:\d+(?::\d+)?)\]/);
        const duration = durationMatch ? durationMatch[1] : '';
        
        // Extract URL if it exists
        const urlMatch = processedLine.match(/(https?:\/\/[^\s)]+)/);
        const url = urlMatch ? urlMatch[1] : '';
        
        // Extract title (everything else)
        let title = processedLine;
        if (durationMatch) {
            title = title.replace(durationMatch[0], '');
        }
        if (urlMatch) {
            title = title.replace(/\([^)]*\)/, '');
        }
        title = title.trim();
        
        // Create the HTML list item
        html += '        <li>';
        if (number) {
            html += `<strong>${number}.</strong> `;
        }
        if (url) {
            html += `<a href="${url}" target="_blank">${title}</a>`;
        } else {
            html += title;
        }
        if (duration) {
            html += ` <span class="duration">[${duration}]</span>`;
        }
        html += '</li>\n';
    });
    
    html += `    </ul>
    <p><em>Generated by TubeTracker on ${new Date().toLocaleDateString()}</em></p>
</body>
</html>`;
    
    return html;
}

// Share functionality
function initShareFeature() {
    const shareBtn = document.getElementById('share-btn');
    const shareModal = document.getElementById('share-modal');
    const closeShareModal = document.getElementById('close-share-modal');
    
    if (shareBtn && shareModal) {
        shareBtn.addEventListener('click', function() {
            const playlistUrl = document.getElementById('playlist-url')?.value;
            if (playlistUrl) {
                // Set share link
                const shareLinkInput = document.getElementById('share-link');
                if (shareLinkInput) shareLinkInput.value = playlistUrl;
                
                // Generate embed code
                const embedCodeTextarea = document.getElementById('embed-code');
                const playlistId = extractPlaylistId(playlistUrl);
                if (embedCodeTextarea && playlistId) {
                    const embedCode = `<iframe width="560" height="315" src="https://www.youtube.com/embed/videoseries?list=${playlistId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
                    embedCodeTextarea.value = embedCode;
                }
                
                shareModal.style.display = 'block';
            } else {
                alert('Please enter a playlist URL first.');
            }
        });
        
        if (closeShareModal) {
            closeShareModal.addEventListener('click', function() {
                shareModal.style.display = 'none';
            });
        }
    }
    
    // Copy link button
    const copyLinkBtn = document.getElementById('copy-link-btn');
    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', function() {
            const linkInput = document.getElementById('share-link');
            if (linkInput) {
                linkInput.select();
                document.execCommand('copy');
                
                // Show copied message
                const originalText = this.textContent;
                this.textContent = 'Copied!';
                setTimeout(() => {
                    this.innerHTML = '<i class="fas fa-copy"></i> Copy';
                }, 2000);
            }
        });
    }
    
    // Copy embed code button
    const copyEmbedBtn = document.getElementById('copy-embed-btn');
    if (copyEmbedBtn) {
        copyEmbedBtn.addEventListener('click', function() {
            const embedTextarea = document.getElementById('embed-code');
            if (embedTextarea) {
                embedTextarea.select();
                document.execCommand('copy');
                
                // Show copied message
                const originalText = this.textContent;
                this.textContent = 'Copied!';
                setTimeout(() => {
                    this.innerHTML = '<i class="fas fa-copy"></i> Copy';
                }, 2000);
            }
        });
    }
}

// Extract playlist ID from URL
function extractPlaylistId(url) {
    if (!url) return null;
    
    const regex = /(?:youtube\.com\/playlist\?list=|youtube\.com\/watch\?v=.+&list=|youtu\.be\/.+&list=)([^&\s]+)/;
    const match = url.match(regex);
    
    return match ? match[1] : null;
}

// Initialize watch speed control in the settings
function initWatchSpeedControl() {
    const watchSpeedInput = document.getElementById('watch-speed-input');
    if (watchSpeedInput) {
        watchSpeedInput.addEventListener('change', function() {
            // Update the watch speed display in the stats if it exists
            const watchSpeedDisplay = document.getElementById('watch-speed-display');
            if (watchSpeedDisplay) {
                watchSpeedDisplay.value = this.value;
            }
            
            // Recalculate stats with the new watch speed
            updateStatsWithWatchSpeed(parseFloat(this.value));
        });
    }
}

// Initialize AI button event listener
function initAIButton() {
    const aiButton = document.getElementById('ai-assistant-btn');
    const aiModal = document.getElementById('ai-modal');
    
    if (aiButton && aiModal) {
        // Remove any existing event listeners
        aiButton.removeEventListener('click', openAIModal);
        
        // Add new event listener
        aiButton.addEventListener('click', openAIModal);
    }
}

// Function to open AI modal
function openAIModal() {
    const aiModal = document.getElementById('ai-modal');
    
    // Check if we have a formatted playlist
    if (!window.lastFormattedOutput) {
        showAlert('Please format a playlist first before using the AI Assistant.', 'error');
        return;
    }
    
    if (aiModal) {
        aiModal.style.display = 'block';
        
        // Reset the view to options
        const aiOptions = document.querySelector('.ai-options');
        const aiResultContainer = document.querySelector('.ai-result-container');
        
        if (aiOptions) aiOptions.style.display = 'block';
        if (aiResultContainer) aiResultContainer.style.display = 'none';
    }
}

// Initialize watch speed display in the stats
function initWatchSpeedDisplay() {
    const watchSpeedDisplay = document.getElementById('watch-speed-display');
    if (watchSpeedDisplay) {
        watchSpeedDisplay.addEventListener('change', function() {
            const newSpeed = parseFloat(this.value);
            
            // Update the watch speed input in settings
            const watchSpeedInput = document.getElementById('watch-speed-input');
            if (watchSpeedInput) {
                watchSpeedInput.value = newSpeed;
            }
            
            // Recalculate stats with the new watch speed
            updateStatsWithWatchSpeed(newSpeed);
        });
    }
}

// Update stats based on watch speed
function updateStatsWithWatchSpeed(watchSpeed) {
    if (!window.currentVideosData || !window.originalStats) {
        console.warn('No video data available for recalculation');
        return;
    }
    
    // Format durations for display
    const formatTimeFromMinutes = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = Math.floor(minutes % 60);
        const secs = Math.round((minutes % 1) * 60);
        
        if (hours > 0) {
            return `${hours}h ${mins}m`;
        } else {
            return `${mins}m ${secs}s`;
        }
    };
    
    // Calculate total duration in minutes from the videos
    const totalVideos = window.currentVideosData.length;
    const totalDurationMinutes = window.currentVideosData.reduce((total, video) => {
        return total + (video.durationMinutes || 0);
    }, 0);
    const avgDurationMinutes = totalDurationMinutes / totalVideos;
    
    // Calculate adjusted durations based on watch speed
    const adjustedTotalDuration = formatTimeFromMinutes(totalDurationMinutes / watchSpeed);
    const adjustedAvgDuration = formatTimeFromMinutes(avgDurationMinutes / watchSpeed);
    
    // Update the stats display
    const totalDurationElement = document.getElementById('total-duration-value');
    const avgDurationElement = document.getElementById('avg-duration-value');
    
    if (totalDurationElement) {
        totalDurationElement.textContent = adjustedTotalDuration;
    }
    
    if (avgDurationElement) {
        avgDurationElement.textContent = adjustedAvgDuration;
    }
    
    // Show a notification about the change
    showAlert(`Watch speed updated to ${watchSpeed}x. Durations recalculated.`, 'success');
}

// Store the current videos data globally for recalculation
window.currentVideosData = null;
window.originalStats = null;

// Create and display playlist summary with statistics
function displayPlaylistSummary(videos, stats) {
    const summaryContainer = document.getElementById('playlist-summary');
    
    if (!summaryContainer) {
        console.error('Summary container not found');
        return;
    }
    
    // Store the videos data globally for recalculation when watch speed changes
    window.currentVideosData = videos;
    window.originalStats = {...stats};
    
    // Make sure the watch speed input in settings matches the current stats
    const watchSpeedInput = document.getElementById('watch-speed-input');
    if (watchSpeedInput && stats.watchSpeed) {
        watchSpeedInput.value = stats.watchSpeed;
    }
    
    // Clear previous content
    summaryContainer.innerHTML = '';
    
    // Create summary header with a nice icon
    const summaryHeader = document.createElement('div');
    summaryHeader.className = 'summary-header';
    summaryHeader.innerHTML = `
        <h3><i class="fas fa-chart-bar"></i> Playlist Summary</h3>
    `;
    
    // Create stats container
    const statsContainer = document.createElement('div');
    statsContainer.className = 'playlist-stats';
    
    // Add stats items with fallback values
    statsContainer.innerHTML = `
        <div class="stat-item">
            <div class="stat-icon"><i class="fas fa-video"></i></div>
            <div class="stat-value">${stats.totalVideos || 0}</div>
            <div class="stat-label">Total Videos</div>
        </div>
        <div class="stat-item">
            <div class="stat-icon"><i class="fas fa-clock"></i></div>
            <div class="stat-value" id="total-duration-value">${stats.totalDuration || '0:00'}</div>
            <div class="stat-label">Total Duration</div>
        </div>
        <div class="stat-item">
            <div class="stat-icon"><i class="fas fa-hourglass-half"></i></div>
            <div class="stat-value" id="avg-duration-value">${stats.avgDuration || '0:00'}</div>
            <div class="stat-label">Avg. Duration</div>
        </div>
        <div class="stat-item watch-speed-control">
            <div class="stat-icon"><i class="fas fa-tachometer-alt"></i></div>
            <div class="stat-value">
                <select id="watch-speed-display" class="watch-speed-select">
                    <option value="0.5">0.5x</option>
                    <option value="0.75">0.75x</option>
                    <option value="1" ${stats.watchSpeed == 1 ? 'selected' : ''}>1x</option>
                    <option value="1.25" ${stats.watchSpeed == 1.25 ? 'selected' : ''}>1.25x</option>
                    <option value="1.5" ${stats.watchSpeed == 1.5 ? 'selected' : ''}>1.5x</option>
                    <option value="1.75" ${stats.watchSpeed == 1.75 ? 'selected' : ''}>1.75x</option>
                    <option value="2" ${stats.watchSpeed == 2 ? 'selected' : ''}>2x</option>
                </select>
            </div>
            <div class="stat-label">Watch Speed</div>
        </div>
    `;
    
    // Create result header with export buttons
    const resultHeader = document.createElement('div');
    resultHeader.className = 'result-header';
    
    // Get the current playlist title from various sources
    // Prioritize the title from stats (which comes from the YouTube API)
    const currentTitle = stats.title || window.currentPlaylistTitle || document.getElementById('playlist-title')?.textContent || 'Playlist';
    
    resultHeader.innerHTML = `
        <h2 id="playlist-title">${currentTitle}</h2>
        <div class="export-buttons">
            <button class="export-btn" id="copy-btn"><i class="fas fa-copy"></i> Copy</button>
            <div class="dropdown">
                <button class="export-btn dropdown-btn" id="export-dropdown">
                    <i class="fas fa-file-export"></i> Export <i class="fas fa-caret-down"></i>
                </button>
                <div class="dropdown-content" id="export-dropdown-content">
                    <button id="export-txt"><i class="fas fa-file-alt"></i> Text File (.txt)</button>
                    <button id="export-md"><i class="fab fa-markdown"></i> Markdown (.md)</button>
                    <button id="export-csv"><i class="fas fa-file-csv"></i> CSV File (.csv)</button>
                    <button id="export-json"><i class="fas fa-file-code"></i> JSON File (.json)</button>
                    <button id="export-html"><i class="fas fa-file-code"></i> HTML File (.html)</button>
                </div>
            </div>
            <button class="export-btn" id="share-btn"><i class="fas fa-share-alt"></i> Share</button>
            <button class="export-btn" id="ai-assistant-btn"><i class="fas fa-robot"></i> AI</button>
        </div>
    `;
    
    // Create output container with a nice wrapper
    const outputContainer = document.createElement('div');
    outputContainer.className = 'output-container';
    
    // Create output textarea
    const outputTextarea = document.createElement('textarea');
    outputTextarea.id = 'formatted-output';
    outputTextarea.readOnly = true;
    outputTextarea.placeholder = 'Formatted playlist will appear here...';
    
    // Get the current formatted output value if it exists
    const existingOutput = document.getElementById('formatted-output');
    let outputValue = '';
    
    if (existingOutput && existingOutput.value) {
        outputValue = existingOutput.value;
    } else if (window.lastFormattedOutput) {
        outputValue = window.lastFormattedOutput;
    }
    
    outputTextarea.value = outputValue;
    outputContainer.appendChild(outputTextarea);
    
    // Append all elements in the proper order
    summaryContainer.appendChild(summaryHeader);
    summaryContainer.appendChild(statsContainer);
    summaryContainer.appendChild(resultHeader);
    summaryContainer.appendChild(outputContainer);
    
    // Show the summary container
    summaryContainer.style.display = 'block';
    
    // Show the AI button now that a playlist is loaded
    const aiButton = document.getElementById('ai-assistant-btn');
    if (aiButton) {
        aiButton.style.display = 'inline-block';
    }
    
    // Reinitialize the export options and copy button
    initExportOptions();
    initCopyButton();
    initShareFeature();
    initWatchSpeedDisplay();
    
    // Initialize AI button event listener
    initAIButton();
}
