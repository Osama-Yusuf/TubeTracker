// TubeTracker - video-downloader.js
// Handles video download functionality

// Initialize video download button
function initVideoDownloadButton() {
    const videoDownloadBtn = document.getElementById('video-download-btn');
    if (!videoDownloadBtn) return;

    videoDownloadBtn.addEventListener('click', function () {
        showVideoDownloadModal();
    });
}

// Show video download modal
function showVideoDownloadModal() {
    // Check if we have a playlist loaded
    if (!window.lastFormattedOutput) {
        showAlert('Please format a playlist first before downloading videos.', 'error');
        return;
    }

    // Create modal if it doesn't exist
    let downloadModal = document.getElementById('video-download-modal');

    if (!downloadModal) {
        downloadModal = document.createElement('div');
        downloadModal.id = 'video-download-modal';
        downloadModal.className = 'modal';

        downloadModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Download Videos</h2>
                    <span id="close-video-download-modal" class="close">&times;</span>
                </div>
                <div class="modal-body">
                    <p class="download-disclaimer">
                        Note: This will download videos from YouTube using the server's yt-dlp installation.
                        The download process may take some time depending on your internet connection speed and the number of videos in the playlist.
                    </p>
                    
                    <div class="download-options">
                        <h3>Download Options</h3>
                        
                        <div class="option-group">
                            <label>Format:</label>
                            <div class="radio-group">
                                <label>
                                    <input type="radio" name="download-format" value="mp4" checked> MP4 (Video)
                                </label>
                                <label>
                                    <input type="radio" name="download-format" value="mp3"> MP3 (Audio only)
                                </label>
                            </div>
                        </div>
                        
                        <div class="option-group" id="quality-option-group">
                            <label>Quality:</label>
                            <div class="radio-group">
                                <label>
                                    <input type="radio" name="download-quality" value="best" checked> Best
                                </label>
                                <label>
                                    <input type="radio" name="download-quality" value="medium"> Medium (720p)
                                </label>
                                <label>
                                    <input type="radio" name="download-quality" value="low"> Low (480p)
                                </label>
                            </div>
                        </div>
                        
                        <div class="option-group">
                            <label>
                                <input type="checkbox" id="include-number-checkbox" checked>
                                Include playlist position in filename
                            </label>
                        </div>
                    </div>
                    
                    <div class="download-actions">
                        <button id="start-download-btn" class="primary-btn">Start Download</button>
                    </div>
                    
                    <div class="download-progress" style="display: none;">
                        <h3>Download Progress</h3>
                        <div class="progress-container">
                            <div id="download-status">Initializing download...</div>
                            <pre id="download-log" class="download-log"></pre>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(downloadModal);

        // Add event listeners
        const closeBtn = document.getElementById('close-video-download-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', function () {
                downloadModal.style.display = 'none';
            });
        }

        // Format radio buttons
        const formatRadios = document.querySelectorAll('input[name="download-format"]');
        const qualityGroup = document.getElementById('quality-option-group');

        formatRadios.forEach(radio => {
            radio.addEventListener('change', function () {
                if (this.value === 'mp3') {
                    qualityGroup.style.display = 'none';
                } else {
                    qualityGroup.style.display = 'block';
                }
            });
        });

        // Start download button
        const startDownloadBtn = document.getElementById('start-download-btn');
        if (startDownloadBtn) {
            startDownloadBtn.addEventListener('click', startVideoDownload);
        }

        // Close modal when clicking outside
        window.addEventListener('click', function (event) {
            if (event.target === downloadModal) {
                downloadModal.style.display = 'none';
            }
        });
    }

    // Show the modal
    downloadModal.style.display = 'block';
}

// Start the video download process
function startVideoDownload() {
    const format = document.querySelector('input[name="download-format"]:checked').value;
    const quality = document.querySelector('input[name="download-quality"]:checked')?.value || 'best';
    const includeNumber = document.getElementById('include-number-checkbox').checked;

    const playlistUrl = document.getElementById('playlist-url').value.trim();
    if (!playlistUrl) {
        showAlert('Playlist URL not found.', 'error');
        return;
    }

    // Get playlist ID
    const playlistId = extractPlaylistId(playlistUrl);
    if (!playlistId) {
        showAlert('Invalid YouTube playlist URL.', 'error');
        return;
    }

    // Show progress section
    const downloadActions = document.querySelector('.download-actions');
    const downloadProgress = document.querySelector('.download-progress');
    const downloadLog = document.getElementById('download-log');
    const downloadStatus = document.getElementById('download-status');

    if (downloadActions) downloadActions.style.display = 'none';
    if (downloadProgress) downloadProgress.style.display = 'block';
    if (downloadLog) downloadLog.textContent = 'Starting download...';
    if (downloadStatus) downloadStatus.textContent = 'Connecting to server...';

    // Disable close button during download
    const closeBtn = document.getElementById('close-video-download-modal');
    if (closeBtn) closeBtn.style.display = 'none';

    // Build the API URL
    const apiUrl = `/api/download-videos?playlistId=${encodeURIComponent(playlistId)}&format=${encodeURIComponent(format)}&quality=${encodeURIComponent(quality)}&includeNumber=${includeNumber}`;

    // Create an event source for server-sent events
    const xhr = new XMLHttpRequest();
    xhr.open('GET', apiUrl);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 3) { // LOADING
            // Append new data as it comes in
            if (downloadLog) {
                const newText = xhr.responseText.substring(downloadLog.textContent.length);

                // Check if the response contains the ZIP file URL
                if (newText.includes('ZIP_FILE_READY:')) {
                    const zipUrlLine = newText.split('\n').find(line => line.startsWith('ZIP_FILE_READY:'));
                    if (zipUrlLine) {
                        const zipUrl = zipUrlLine.replace('ZIP_FILE_READY:', '');
                        downloadLog.textContent += newText;
                        downloadLog.scrollTop = downloadLog.scrollHeight;

                        // Show download ready UI with manual download option
                        showDownloadReadyUI(zipUrl);
                        return;
                    }
                }

                downloadLog.textContent += newText;
                downloadLog.scrollTop = downloadLog.scrollHeight; // Auto-scroll to bottom
            }
        } else if (xhr.readyState === 4) { // DONE
            if (xhr.status === 200) {
                // Check if we already triggered a download
                if (!xhr.responseText.includes('ZIP_FILE_READY:')) {
                    if (downloadStatus) downloadStatus.textContent = 'Download completed!';
                    // Re-enable close button
                    if (closeBtn) closeBtn.style.display = 'block';
                    showAlert('Videos processed successfully!', 'success');
                }
            } else {
                if (downloadStatus) downloadStatus.textContent = 'Download failed!';
                // Re-enable close button
                if (closeBtn) closeBtn.style.display = 'block';
                showAlert('Error downloading videos. Check the log for details.', 'error');
            }
        }
    };
    xhr.send();
}

// Show download ready UI with manual download option
function showDownloadReadyUI(url) {
    // Get elements
    const downloadStatus = document.getElementById('download-status');
    const downloadProgress = document.querySelector('.download-progress');
    const closeBtn = document.getElementById('close-video-download-modal');

    // Create download options container
    const downloadOptions = document.createElement('div');
    downloadOptions.className = 'download-options-container';
    downloadOptions.innerHTML = `
        <div class="download-ready-message">
            <h3>Download Ready!</h3>
            <p>Your videos have been processed and are ready to download.</p>
            <p class="popup-warning"><i class="fas fa-exclamation-triangle"></i> If the download doesn't start automatically, your browser may have blocked the popup. Click the button below to download manually.</p>
            <div class="download-buttons">
                <button id="manual-download-btn" class="primary-btn"><i class="fas fa-download"></i> Download Videos</button>
                <button id="auto-download-btn" class="text-btn">Try Automatic Download</button>
            </div>
        </div>
    `;

    // Update status
    if (downloadStatus) {
        downloadStatus.textContent = 'Download ready!';
    }

    // Add download options to the progress container
    if (downloadProgress) {
        downloadProgress.appendChild(downloadOptions);
    }

    // Re-enable close button
    if (closeBtn) {
        closeBtn.style.display = 'block';
    }

    // Add event listeners to buttons
    const manualDownloadBtn = document.getElementById('manual-download-btn');
    if (manualDownloadBtn) {
        manualDownloadBtn.addEventListener('click', function () {
            triggerFileDownload(url);
        });
    }

    const autoDownloadBtn = document.getElementById('auto-download-btn');
    if (autoDownloadBtn) {
        autoDownloadBtn.addEventListener('click', function () {
            triggerFileDownload(url, true);
        });
    }

    // Try automatic download with a slight delay
    setTimeout(() => {
        triggerFileDownload(url, true);
    }, 1000);
}

// Trigger the file download
function triggerFileDownload(url, isAuto = false) {
    // Get the full URL including the domain
    const fullUrl = window.location.origin + url;

    // Open the download URL in a new tab
    window.open(fullUrl, '_blank');

    // Show appropriate message based on whether this was automatic or manual
    if (isAuto) {
        showAlert('Attempting automatic download. If blocked, use the manual download button.', 'info');
    } else {
        showAlert('Download started! Check your new browser tab for the download.', 'success');
    }
}

// Export functions for use in other modules
window.initVideoDownloadButton = initVideoDownloadButton;
window.showVideoDownloadModal = showVideoDownloadModal;
