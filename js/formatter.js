// TubeTracker - formatter.js
// Handles playlist formatting functionality

// Extract playlist ID from a YouTube playlist URL
function extractPlaylistId(url) {
    if (!url) return null;
    
    // Match various YouTube playlist URL formats
    const regex = /(?:youtube\.com\/playlist\?list=|youtube\.com\/watch\?v=.+&list=|youtu\.be\/.+&list=)([^&\s]+)/;
    const match = url.match(regex);
    
    return match ? match[1] : null;
}

// Format duration from ISO 8601 format to readable format (HH:MM:SS)
function formatDuration(isoDuration) {
    if (!isoDuration) return '0:00';
    
    // Parse ISO 8601 duration
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return '0:00';
    
    const hours = parseInt(match[1] || 0);
    const minutes = parseInt(match[2] || 0);
    const seconds = parseInt(match[3] || 0);
    
    // Format as HH:MM:SS or MM:SS
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

// Convert ISO duration to minutes for calculations
function durationToMinutes(isoDuration) {
    if (!isoDuration) return 0;
    
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    
    const hours = parseInt(match[1] || 0);
    const minutes = parseInt(match[2] || 0);
    const seconds = parseInt(match[3] || 0);
    
    return hours * 60 + minutes + seconds / 60;
}

// Fetch video details for a playlist
async function fetchPlaylistData(playlistId, apiKey) {
    if (!playlistId) {
        throw new Error('Playlist ID is required');
    }
    
    try {
        // First, get the playlist details using the server proxy
        const playlistResponse = await fetch(
            `/api/youtube-proxy?endpoint=playlists&playlistId=${playlistId}&apiKey=${apiKey || 'server'}`
        );
        
        if (!playlistResponse.ok) {
            const errorData = await playlistResponse.json();
            throw new Error(errorData.error || 'Failed to fetch playlist details');
        }
        
        const playlistData = await playlistResponse.json();
        
        // Check if we're using the server's API key and notify the user
        if (playlistData.usingServerKey) {
            console.log('Using server API key');
            // You could display a message to the user here if desired
        }
        
        if (!playlistData.items || playlistData.items.length === 0) {
            throw new Error('Playlist not found or is empty');
        }
        
        const playlistTitle = playlistData.items[0].snippet.title;
        
        // Get all videos in the playlist (paginated)
        let videos = [];
        let nextPageToken = null;
        
        do {
            // Get playlist items using the server proxy
            let playlistItemsUrl = `/api/youtube-proxy?endpoint=playlistItems&playlistId=${playlistId}&maxResults=50&apiKey=${apiKey || 'server'}`;
            if (nextPageToken) {
                playlistItemsUrl += `&pageToken=${nextPageToken}`;
            }
            
            const playlistItemsResponse = await fetch(playlistItemsUrl);
            
            if (!playlistItemsResponse.ok) {
                const errorData = await playlistItemsResponse.json();
                throw new Error(errorData.error || 'Failed to fetch playlist items');
            }
            
            const playlistItemsData = await playlistItemsResponse.json();
            
            // Extract video IDs for content details request
            const videoIds = playlistItemsData.items
                .filter(item => item.snippet.resourceId.kind === 'youtube#video')
                .map(item => item.snippet.resourceId.videoId);
            
            if (videoIds.length > 0) {
                // Get video details (including duration) using the server proxy
                const videoDetailsResponse = await fetch(
                    `/api/youtube-proxy?endpoint=videos&playlistId=${playlistId}&videoIds=${videoIds.join(',')}&apiKey=${apiKey || 'server'}`
                );
                
                if (!videoDetailsResponse.ok) {
                    const errorData = await videoDetailsResponse.json();
                    throw new Error(errorData.error || 'Failed to fetch video details');
                }
                
                const videoDetailsData = await videoDetailsResponse.json();
                
                // Map video details to our format
                const videoItems = videoDetailsData.items.map(item => {
                    const durationFormatted = formatDuration(item.contentDetails.duration);
                    const durationMinutes = durationToMinutes(item.contentDetails.duration);
                    
                    return {
                        id: item.id,
                        title: item.snippet.title,
                        channelTitle: item.snippet.channelTitle,
                        duration: item.contentDetails.duration,
                        durationFormatted: durationFormatted,
                        durationMinutes: durationMinutes,
                        url: `https://www.youtube.com/watch?v=${item.id}`
                    };
                });
                
                videos = videos.concat(videoItems);
            }
            
            nextPageToken = playlistItemsData.nextPageToken;
            
        } while (nextPageToken);
        
        return {
            title: playlistTitle,
            videos: videos
        };
        
    } catch (error) {
        console.error('Error fetching playlist data:', error);
        throw error;
    }
}

// Format playlist with user-selected options
async function formatPlaylistWithOptions(playlistUrl, apiKey, options = {}) {
    try {
        // Extract playlist ID
        const playlistId = extractPlaylistId(playlistUrl);
        if (!playlistId) {
            throw new Error('Invalid YouTube playlist URL');
        }
        
        // Set default options
        const defaultOptions = {
            includeNumbers: true,
            includeDuration: true,
            includeLinks: true,
            shortLinks: true,
            includeChannels: false
        };
        
        // Merge default options with user options
        const formatOptions = { ...defaultOptions, ...options };
        
        // Fetch playlist data
        const playlistData = await fetchPlaylistData(playlistId, apiKey);
        const videos = playlistData.videos;
        
        if (!videos || videos.length === 0) {
            throw new Error('No videos found in this playlist');
        }
        
        // Format each video
        let formattedOutput = '';
        videos.forEach((video, index) => {
            let line = '';
            
            // Add number
            if (formatOptions.includeNumbers) {
                line += `${index + 1}. `;
            }
            
            // Add title
            line += video.title;
            
            // Add duration
            if (formatOptions.includeDuration) {
                line += ` [${video.durationFormatted}]`;
            }
            
            // Add channel
            if (formatOptions.includeChannels) {
                line += ` - ${video.channelTitle}`;
            }
            
            // Add link
            if (formatOptions.includeLinks) {
                const videoUrl = formatOptions.shortLinks 
                    ? `https://youtu.be/${video.id}`
                    : video.url;
                line += ` (${videoUrl})`;
            }
            
            formattedOutput += line + '\n';
        });
        
        // Calculate statistics
        const totalVideos = videos.length;
        const totalDurationMinutes = videos.reduce((total, video) => total + video.durationMinutes, 0);
        const avgDurationMinutes = totalDurationMinutes / totalVideos;
        
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
        
        // Get watch speed from options
        const watchSpeed = formatOptions.watchSpeed || 1;
        
        // Calculate stats
        const stats = {
            totalVideos: totalVideos,
            totalDuration: formatTimeFromMinutes(totalDurationMinutes),
            avgDuration: formatTimeFromMinutes(avgDurationMinutes),
            watchSpeed: watchSpeed,
            watchTimeAtSpeed: formatTimeFromMinutes(totalDurationMinutes / watchSpeed)
        };
        
        // Return formatted output and stats
        return {
            title: playlistData.title,
            formattedOutput: formattedOutput,
            videos: videos,
            stats: stats
        };
        
    } catch (error) {
        console.error('Error formatting playlist:', error);
        throw error;
    }
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

// Export functions for use in other modules
window.initFormatButton = initFormatButton;
window.initWatchSpeedControl = initWatchSpeedControl;
window.initWatchSpeedDisplay = initWatchSpeedDisplay;
window.updateStatsWithWatchSpeed = updateStatsWithWatchSpeed;
window.formatPlaylistWithOptions = formatPlaylistWithOptions;
window.extractPlaylistId = extractPlaylistId;
window.formatDuration = formatDuration;
window.durationToMinutes = durationToMinutes;
window.fetchPlaylistData = fetchPlaylistData;
