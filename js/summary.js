// TubeTracker - summary.js
// Handles playlist summary display

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
            <button class="export-btn" id="video-download-btn"><i class="fas fa-video"></i> Download</button>
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
    
    // Initialize video download button
    initVideoDownloadButton();
}

// Export function for use in other modules
window.displayPlaylistSummary = displayPlaylistSummary;
