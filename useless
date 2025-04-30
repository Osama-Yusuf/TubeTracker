// TubeTracker - UI.js
// Handles all UI interactions and localStorage functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize core UI functionality
    initThemeToggle();
    initApiKey();
    initModalButtons();
    initHistoryFeature();
    initExportOptions();
    
    // Initialize chart visualizer if available
    if (typeof PlaylistVisualizer !== 'undefined') {
        try {
            const visualizer = new PlaylistVisualizer();
            window.visualizer = visualizer; // Make it globally accessible
        } catch (error) {
            console.error('Error initializing visualizer:', error);
        }
    }
    
    // Elements - Main UI
    const playlistUrlInput = document.getElementById('playlist-url');
    const apiKeyInput = document.getElementById('api-key');
    const apiKeySection = document.getElementById('api-key-section');
    const apiKeyMessage = document.getElementById('api-key-message');
    const changeApiKeyBtn = document.getElementById('change-api-key');
    const toggleApiKeyBtn = document.getElementById('toggle-api-key');
    const formatBtn = document.getElementById('format-btn');
    const copyBtn = document.getElementById('copy-btn');
    const downloadTxtBtn = document.getElementById('download-txt-btn');
    const downloadMdBtn = document.getElementById('download-md-btn');
    const resultText = document.getElementById('result-text');
    const loadingSection = document.querySelector('.loading-section');
    const resultSection = document.querySelector('.result-section');
    const errorSection = document.querySelector('.error-section');
    const errorMessage = document.getElementById('error-message');
    
// Theme toggle functionality
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.querySelector('.theme-icon i');
    
    if (!themeToggle || !themeIcon) return;
    
    // Load saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        themeToggle.checked = true;
        themeIcon.className = 'fas fa-sun';
    } else {
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
    const apiKeyInput = document.getElementById('api-key');
    const saveApiKeyBtn = document.getElementById('save-api-key');
    const apiKeyStatus = document.getElementById('api-key-status');
    const toggleApiKeyBtn = document.getElementById('toggle-api-key-visibility');
    
    if (!apiKeyInput) return;
    
    // Load API key from localStorage
    const savedApiKey = localStorage.getItem('youtubeApiKey');
    if (savedApiKey) {
        apiKeyInput.value = savedApiKey;
        if (apiKeyStatus) {
            apiKeyStatus.textContent = 'API Key loaded from storage';
            apiKeyStatus.className = 'status-success';
        }
        
        // Update any API key message in the main UI
        const apiKeyMessage = document.getElementById('api-key-message');
        const apiKeySection = document.getElementById('api-key-section');
        const changeApiKeyBtn = document.getElementById('change-api-key');
        
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
    }
    
    // Save API key to localStorage
    if (saveApiKeyBtn) {
        saveApiKeyBtn.addEventListener('click', function() {
            const apiKey = apiKeyInput.value.trim();
            if (apiKey) {
                localStorage.setItem('youtubeApiKey', apiKey);
                
                if (apiKeyStatus) {
                    apiKeyStatus.textContent = 'API Key saved successfully';
                    apiKeyStatus.className = 'status-success';
                    setTimeout(() => {
                        apiKeyStatus.textContent = '';
                    }, 3000);
                }
                
                // Update any API key message in the main UI
                const apiKeyMessage = document.getElementById('api-key-message');
                const apiKeySection = document.getElementById('api-key-section');
                const changeApiKeyBtn = document.getElementById('change-api-key');
                
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
    
    // Toggle API key visibility
    if (toggleApiKeyBtn) {
        toggleApiKeyBtn.addEventListener('click', function() {
            if (apiKeyInput.type === 'password') {
                apiKeyInput.type = 'text';
                toggleApiKeyBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
            } else {
                apiKeyInput.type = 'password';
                toggleApiKeyBtn.innerHTML = '<i class="fas fa-eye"></i>';
            }
        });
    }
    
    // Handle change API key button
    const changeApiKeyBtn = document.getElementById('change-api-key');
    if (changeApiKeyBtn) {
        changeApiKeyBtn.addEventListener('click', function() {
            const apiKeySection = document.getElementById('api-key-section');
            if (apiKeySection) {
                apiKeySection.style.display = 'block';
                this.style.display = 'none';
            }
        });
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
    
    // Share Modal
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
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (settingsModal && event.target === settingsModal) {
            settingsModal.style.display = 'none';
        }
        if (historyModal && event.target === historyModal) {
            historyModal.style.display = 'none';
        }
        if (shareModal && event.target === shareModal) {
            shareModal.style.display = 'none';
        }
    });
}
    
    // Elements - Format options
    const includeDuration = document.getElementById('include-duration');
    const includeLinks = document.getElementById('include-links');
    const includeNumbers = document.getElementById('include-numbers');
    const linkFormatShort = document.getElementById('link-format-short');
    const linkFormatFull = document.getElementById('link-format-full');
    
    // Elements - Stats
    const totalVideosElement = document.getElementById('total-videos');
    const totalDurationElement = document.getElementById('total-duration');
    const avgDurationElement = document.getElementById('avg-duration');
    
    // Elements - History
    const historyBtn = document.getElementById('history-btn');
    const historySection = document.querySelector('.history-section');
    const historyList = document.getElementById('history-list');
    const clearHistoryBtn = document.getElementById('clear-history');
    
    // Elements - Settings
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeModal = document.querySelector('.close-modal');
    const settingsApiKeyInput = document.getElementById('settings-api-key');
    const settingsToggleApiKeyBtn = document.getElementById('settings-toggle-api-key');
    const saveApiKeyBtn = document.getElementById('save-api-key');
    const saveSettingsBtn = document.getElementById('save-settings');
    const settingsIncludeDuration = document.getElementById('settings-include-duration');
    const settingsIncludeLinks = document.getElementById('settings-include-links');
    const settingsIncludeNumbers = document.getElementById('settings-include-numbers');
    const settingsLinkFormatShort = document.getElementById('settings-link-format-short');
    const settingsLinkFormatFull = document.getElementById('settings-link-format-full');
    
    // App state
    let playlistHistory = [];
    
    // Initialize app
    initializeApp();

    // Initialize app with saved settings
    function initializeApp() {
        // Load API key
        const savedApiKey = localStorage.getItem('youtubeApiKey');
        if (savedApiKey) {
            apiKeyInput.value = savedApiKey;
            settingsApiKeyInput.value = savedApiKey;
            apiKeyMessage.textContent = 'API key saved';
            apiKeyMessage.style.color = 'var(--success-color)';
        } else {
            apiKeySection.style.display = 'block';
            apiKeyMessage.textContent = 'No API key saved';
        }
        
        // Load theme preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.setAttribute('data-theme', 'dark');
            themeToggle.checked = true;
            themeIcon.className = 'fas fa-sun';
        }
        
        // Load format options
        loadFormatOptions();
        
        // Load playlist history
        loadPlaylistHistory();
    }
    
    // Load saved format options
    function loadFormatOptions() {
        const savedOptions = JSON.parse(localStorage.getItem('formatOptions')) || {};
        
        // Apply saved options or use defaults
        includeDuration.checked = savedOptions.includeDuration !== undefined ? savedOptions.includeDuration : true;
        includeLinks.checked = savedOptions.includeLinks !== undefined ? savedOptions.includeLinks : true;
        includeNumbers.checked = savedOptions.includeNumbers !== undefined ? savedOptions.includeNumbers : true;
        
        if (savedOptions.useLongLinks) {
            linkFormatFull.checked = true;
        } else {
            linkFormatShort.checked = true;
        }
        
        // Also set the settings modal options
        settingsIncludeDuration.checked = includeDuration.checked;
        settingsIncludeLinks.checked = includeLinks.checked;
        settingsIncludeNumbers.checked = includeNumbers.checked;
        settingsLinkFormatShort.checked = linkFormatShort.checked;
        settingsLinkFormatFull.checked = linkFormatFull.checked;
    }
    
    // Save format options
    function saveFormatOptions() {
        const options = {
            includeDuration: includeDuration.checked,
            includeLinks: includeLinks.checked,
            includeNumbers: includeNumbers.checked,
            useLongLinks: linkFormatFull.checked
        };
        
        localStorage.setItem('formatOptions', JSON.stringify(options));
    }
    
    // Toggle API key visibility
    toggleApiKeyBtn.addEventListener('click', function() {
        togglePasswordVisibility(apiKeyInput, toggleApiKeyBtn);
    });
    
    settingsToggleApiKeyBtn.addEventListener('click', function() {
        togglePasswordVisibility(settingsApiKeyInput, settingsToggleApiKeyBtn);
    });
    
    function togglePasswordVisibility(input, button) {
        const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
        input.setAttribute('type', type);
        button.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
    }
    
    // Change API key button
    changeApiKeyBtn.addEventListener('click', function() {
        apiKeySection.style.display = 'block';
        this.style.display = 'none';
    });
    
    // Theme toggle functionality
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

    // Format playlist button click
    formatBtn.addEventListener('click', async function() {
        const playlistUrl = playlistUrlInput.value.trim();
        let apiKey = apiKeyInput.value.trim();

        // Validate inputs
        if (!playlistUrl) {
            showError('Please enter a YouTube playlist URL');
            return;
        }

        // Check for API key in localStorage if not provided in the input
        if (!apiKey) {
            apiKey = localStorage.getItem('youtubeApiKey');
            if (!apiKey) {
                showError('Please enter your YouTube API key');
                apiKeySection.style.display = 'block';
                return;
            }
        } else {
            // Save API key to localStorage if provided
            localStorage.setItem('youtubeApiKey', apiKey);
            apiKeyMessage.textContent = 'API key saved';
            apiKeyMessage.style.color = 'var(--success-color)';
            // Hide the API key input section after saving
            apiKeySection.style.display = 'none';
            changeApiKeyBtn.style.display = 'inline-block';
        }

        // Save format options
        saveFormatOptions();

        // Show loading spinner
        hideError();
        resultSection.style.display = 'none';
        loadingSection.style.display = 'block';

        try {
            // Get formatting options
            const options = {
                includeDuration: includeDuration.checked,
                includeLinks: includeLinks.checked,
                includeNumbers: includeNumbers.checked,
                useLongLinks: linkFormatFull.checked
            };
            
            // Call the formatPlaylist function from app.js with options
            const result = await formatPlaylistWithOptions(playlistUrl, apiKey, options);
            
            if (result.error) {
                showError(result.error);
                loadingSection.style.display = 'none';
                return;
            }

            // Update stats
            updatePlaylistStats(result.stats);
            
            // Display result
            resultText.textContent = result.formattedOutput;
            loadingSection.style.display = 'none';
            resultSection.style.display = 'block';
            
            // Store the raw data for exports
            window.playlistData = result;
            
            // Add to history
            addToHistory({
                playlistUrl,
                playlistTitle: result.playlistTitle,
                stats: result.stats,
                timestamp: new Date().toISOString(),
                result: result
            });
            
            // Scroll to result
            resultSection.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            showError('An error occurred: ' + error.message);
            loadingSection.style.display = 'none';
        }
    });
    
    // Update playlist statistics
    function updatePlaylistStats(stats) {
        if (!stats) return;
        
        totalVideosElement.textContent = stats.videoCount;
        
        // Format total duration
        let totalDurationText = '';
        if (stats.hours > 0) {
            totalDurationText = `${stats.hours}h ${stats.minutes}m`;
        } else {
            totalDurationText = `${stats.minutes}m ${stats.seconds}s`;
        }
        totalDurationElement.textContent = totalDurationText;
        
        // Calculate and display average duration
        if (stats.videoCount > 0) {
            const avgSeconds = Math.round(stats.totalSeconds / stats.videoCount);
            const avgMinutes = Math.floor(avgSeconds / 60);
            const avgRemainingSeconds = avgSeconds % 60;
            avgDurationElement.textContent = `${avgMinutes}:${avgRemainingSeconds.toString().padStart(2, '0')}`;
        }
    }

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
    
    // Download as TXT
    downloadTxtBtn.addEventListener('click', function() {
        if (!window.playlistData) return;
        
        const text = resultText.textContent;
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'youtube_playlist.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
    
    // Download as Markdown
    downloadMdBtn.addEventListener('click', function() {
        if (!window.playlistData) return;
        
        // Convert to Markdown format
        const playlistTitle = window.playlistData.playlistTitle || 'YouTube Playlist';
        let markdown = `# ${playlistTitle}\n\n`;
        
        // Add stats
        const stats = window.playlistData.stats;
        if (stats) {
            markdown += `**Total Duration:** `;
            if (stats.hours > 0) {
                markdown += `${stats.hours} hour${stats.hours !== 1 ? 's' : ''}, `;
            }
            markdown += `${stats.minutes} minute${stats.minutes !== 1 ? 's' : ''}, ${stats.seconds} second${stats.seconds !== 1 ? 's' : ''}\n`;
            markdown += `**Videos:** ${stats.videoCount}\n\n`;
        }
        
        // Add video list
        const videos = window.playlistData.videos;
        if (videos && videos.length > 0) {
            videos.forEach((video, index) => {
                markdown += `${index + 1}. [${video.title}](${video.url})`;  
                if (video.duration) {
                    markdown += ` - ${video.duration}`;
                }
                markdown += '\n';
            });
        } else {
            // Fallback to text content if structured data isn't available
            markdown += resultText.textContent;
        }
        
        const blob = new Blob([markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'youtube_playlist.md';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // History functions
    function loadPlaylistHistory() {
        const savedHistory = localStorage.getItem('playlistHistory');
        if (savedHistory) {
            playlistHistory = JSON.parse(savedHistory);
            renderHistoryList();
        }
    }
    
    function addToHistory(historyItem) {
        // Check if this playlist is already in history
        const existingIndex = playlistHistory.findIndex(item => item.playlistUrl === historyItem.playlistUrl);
        
        if (existingIndex !== -1) {
            // Update existing entry
            playlistHistory[existingIndex] = historyItem;
        } else {
            // Add new entry (limit to 10 items)
            playlistHistory.unshift(historyItem);
            if (playlistHistory.length > 10) {
                playlistHistory.pop();
            }
        }
        
        // Save to localStorage
        localStorage.setItem('playlistHistory', JSON.stringify(playlistHistory));
        
        // Update the UI
        renderHistoryList();
    }
    
    function renderHistoryList() {
        // Clear current list
        historyList.innerHTML = '';
        
        if (playlistHistory.length === 0) {
            historyList.innerHTML = '<p class="empty-message">No playlist history yet</p>';
            return;
        }
        
        // Add each history item
        playlistHistory.forEach((item, index) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            const date = new Date(item.timestamp);
            const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            historyItem.innerHTML = `
                <div class="history-info">
                    <div class="history-title">${item.playlistTitle || 'YouTube Playlist'}</div>
                    <div class="history-meta">
                        <span><i class="fas fa-calendar"></i> ${formattedDate}</span>
                        <span><i class="fas fa-film"></i> ${item.stats.videoCount} videos</span>
                    </div>
                </div>
                <div class="history-actions">
                    <button class="history-btn load-history" data-index="${index}" title="Load this playlist">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="history-btn refresh-history" data-index="${index}" title="Refresh this playlist">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                    <button class="history-btn delete-history" data-index="${index}" title="Remove from history">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            historyList.appendChild(historyItem);
        });
        
        // Add event listeners to history buttons
        document.querySelectorAll('.load-history').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                loadHistoryItem(index);
            });
        });
        
        document.querySelectorAll('.refresh-history').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                refreshHistoryItem(index);
            });
        });
        
        document.querySelectorAll('.delete-history').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                deleteHistoryItem(index);
            });
        });
    }
    
    function loadHistoryItem(index) {
        const item = playlistHistory[index];
        if (!item) return;
        
        // Set the URL
        playlistUrlInput.value = item.playlistUrl;
        
        // Load the saved result
        if (item.result) {
            // Update stats
            updatePlaylistStats(item.result.stats);
            
            // Display result
            resultText.textContent = item.result.formattedOutput;
            resultSection.style.display = 'block';
            
            // Store the raw data for exports
            window.playlistData = item.result;
            
            // Hide history section
            historySection.style.display = 'none';
            
            // Scroll to result
            resultSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    function refreshHistoryItem(index) {
        const item = playlistHistory[index];
        if (!item) return;
        
        // Set the URL and trigger format
        playlistUrlInput.value = item.playlistUrl;
        formatBtn.click();
        
        // Hide history section
        historySection.style.display = 'none';
    }
    
    function deleteHistoryItem(index) {
        playlistHistory.splice(index, 1);
        localStorage.setItem('playlistHistory', JSON.stringify(playlistHistory));
        renderHistoryList();
    }
    
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
    
    // Settings modal functionality
    settingsBtn.addEventListener('click', function() {
        settingsModal.style.display = 'block';
        
        // Load current API key
        const savedApiKey = localStorage.getItem('youtubeApiKey');
        if (savedApiKey) {
            settingsApiKeyInput.value = savedApiKey;
        }
        
    
    // Clear history button
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to clear your playlist history?')) {
                localStorage.removeItem('playlistHistory');
                updateHistoryList();
        try {
            // First get the raw data
            const playlistId = extractPlaylistId(playlistUrl);
            
            if (!playlistId) {
                return { error: "Error: Invalid playlist URL" };
            }
            
            const videos = await fetchPlaylistData(playlistId, apiKey);
            
            if (!videos || videos.length === 0) {
                return { error: "Error: No videos found or API error occurred" };
            }
            
            // Process the data with our formatting options
            let formattedOutput = "";
            let totalDurationMinutes = 0;
            const processedVideos = [];
            
            // Process each video
            for (let i = 0; i < videos.length; i++) {
                const video = videos[i];
                const title = video.snippet.title;
                const videoId = video.contentDetails.videoId;
                
                // Format URL based on option
                const videoUrl = options.useLongLinks 
                    ? `https://www.youtube.com/watch?v=${videoId}` 
                    : `https://youtu.be/${videoId}`;
                
                // Get video duration
                const durationData = await getVideoDuration(videoId, apiKey);
                const durationString = durationData.durationString;
                totalDurationMinutes += durationData.minutes;
                
                // Store processed video data
                processedVideos.push({
                    title,
                    url: videoUrl,
                    duration: durationString,
                    durationMinutes: durationData.minutes
                });
                
                // Format line based on options
                let line = "";
                
                if (options.includeNumbers) {
                    line += `- ${i + 1}. `;
                } else {
                    line += "- ";
                }
                
                line += title;
                
                if (options.includeDuration) {
                    line += ` (${durationString})`;
                }
                
                if (options.includeLinks) {
                    line += ` ${videoUrl}`;
                }
                
                formattedOutput += line + "\n";
            }
            
            // Calculate total duration
            const hours = Math.floor(totalDurationMinutes / 60);
            const minutes = Math.floor(totalDurationMinutes % 60);
            const seconds = Math.round((totalDurationMinutes * 60) % 60);
            let totalDurationText = "";
            
            if (hours > 0) {
                totalDurationText = `Total playlist duration: ${hours} hour${hours !== 1 ? 's' : ''}, ${minutes} minute${minutes !== 1 ? 's' : ''}, and ${seconds} second${seconds !== 1 ? 's' : ''} (${videos.length} videos)\n\n`;
            } else if (minutes > 0) {
                totalDurationText = `Total playlist duration: ${minutes} minute${minutes !== 1 ? 's' : ''} and ${seconds} second${seconds !== 1 ? 's' : ''} (${videos.length} videos)\n\n`;
            } else {
                totalDurationText = `Total playlist duration: ${seconds} second${seconds !== 1 ? 's' : ''} (${videos.length} videos)\n\n`;
            }
            
            // Prepare stats for UI
            const stats = {
                hours,
                minutes,
                seconds,
                videoCount: videos.length,
                totalSeconds: Math.round(totalDurationMinutes * 60)
            };
            
            // Try to get playlist title
            let playlistTitle = "YouTube Playlist";
            if (videos.length > 0 && videos[0].snippet && videos[0].snippet.playlistTitle) {
                playlistTitle = videos[0].snippet.playlistTitle;
            }
            
            return {
                formattedOutput: totalDurationText + formattedOutput,
                stats,
                videos: processedVideos,
                playlistTitle
            };
            
        } catch (error) {
            console.error("Error formatting playlist:", error);
            return { error: "Error: " + error.message };
        }
    }
});
