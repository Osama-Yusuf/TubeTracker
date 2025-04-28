// TubeTracker - Formatter.js
// Handles all playlist formatting and data processing functionality

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
    if (!playlistId || !apiKey) {
        throw new Error('Playlist ID and API Key are required');
    }
    
    try {
        // Initialize variables for pagination
        let videos = [];
        let nextPageToken = '';
        let playlistTitle = '';
        
        // Fetch first batch of playlist items
        do {
            const apiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${playlistId}&key=${apiKey}${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`;
            
            const response = await fetch(apiUrl);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`YouTube API Error: ${errorData.error.message}`);
            }
            
            const data = await response.json();
            
            // First, try to get the actual playlist title
            if (!playlistTitle && data.items.length > 0) {
                // We need to make a separate API call to get the playlist details
                try {
                    const playlistDetailsUrl = `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${apiKey}`;
                    const playlistResponse = await fetch(playlistDetailsUrl);
                    
                    if (playlistResponse.ok) {
                        const playlistData = await playlistResponse.json();
                        if (playlistData.items && playlistData.items.length > 0) {
                            playlistTitle = playlistData.items[0].snippet.title;
                            console.log('Found playlist title:', playlistTitle);
                        }
                    }
                } catch (error) {
                    console.warn('Error fetching playlist details:', error);
                }
                
                // If we still don't have a title, use the channel name + 'Playlist'
                if (!playlistTitle) {
                    const channelTitle = data.items[0].snippet.channelTitle || 'YouTube';
                    playlistTitle = `${channelTitle}'s Playlist`;
                }
            }
            
            // Extract video IDs for duration fetching
            const videoIds = data.items.map(item => item.snippet.resourceId.videoId).join(',');
            
            // Fetch video durations
            const videosDetailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoIds}&key=${apiKey}`;
            const videosResponse = await fetch(videosDetailsUrl);
            
            if (!videosResponse.ok) {
                const errorData = await videosResponse.json();
                throw new Error(`YouTube API Error: ${errorData.error.message}`);
            }
            
            const videosData = await videosResponse.json();
            
            // Create a map of video durations
            const durationMap = {};
            videosData.items.forEach(item => {
                durationMap[item.id] = {
                    duration: item.contentDetails.duration,
                    viewCount: item.statistics.viewCount
                };
            });
            
            // Combine playlist items with durations
            const playlistVideos = data.items.map((item, index) => {
                const videoId = item.snippet.resourceId.videoId;
                const videoDetails = durationMap[videoId] || {};
                
                return {
                    id: videoId,
                    title: item.snippet.title,
                    description: item.snippet.description,
                    thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
                    position: item.snippet.position,
                    publishedAt: item.snippet.publishedAt,
                    channelTitle: item.snippet.videoOwnerChannelTitle || item.snippet.channelTitle,
                    channelId: item.snippet.videoOwnerChannelId || item.snippet.channelId,
                    duration: videoDetails.duration || 'PT0S',
                    durationFormatted: formatDuration(videoDetails.duration),
                    durationMinutes: durationToMinutes(videoDetails.duration),
                    viewCount: videoDetails.viewCount || 0,
                    url: `https://www.youtube.com/watch?v=${videoId}`
                };
            });
            
            videos = videos.concat(playlistVideos);
            nextPageToken = data.nextPageToken;
            
        } while (nextPageToken);
        
        // Sort videos by position
        videos.sort((a, b) => a.position - b.position);
        
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
        
        // History is now handled in the UI.js file
        
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

// Event listener for format button
document.addEventListener('DOMContentLoaded', function() {
    const formatBtn = document.getElementById('format-btn');
    const playlistUrlInput = document.getElementById('playlist-url');
    const apiKeyInput = document.getElementById('api-key');
    const formattedOutput = document.getElementById('formatted-output');
    const resultSection = document.getElementById('result-section');
    const loadingIndicator = document.getElementById('loading-indicator');
    const playlistTitle = document.getElementById('playlist-title');
    const copyBtn = document.getElementById('copy-btn');
    
    // Format button click handler
    if (formatBtn) {
        formatBtn.addEventListener('click', async function() {
            // Check if required elements exist
            if (!playlistUrlInput) {
                alert('Error: Playlist URL input not found');
                return;
            }
            
            const playlistUrl = playlistUrlInput.value.trim();
            const apiKeyValue = apiKeyInput ? apiKeyInput.value.trim() : '';
            const apiKey = apiKeyValue || localStorage.getItem('youtubeApiKey');
            
            if (!playlistUrl) {
                alert('Please enter a YouTube playlist URL');
                return;
            }
            
            if (!apiKey) {
                alert('Please enter your YouTube API Key in the settings');
                const settingsBtn = document.getElementById('settings-btn');
                if (settingsBtn) settingsBtn.click();
                return;
            }
            
            try {
                // Show loading indicator if it exists
                if (loadingIndicator) {
                    loadingIndicator.style.display = 'flex';
                }
                
                // Hide result section if it exists
                if (resultSection) {
                    resultSection.style.display = 'none';
                }
                
                // Get formatting options with fallbacks
                const options = {
                    includeNumbers: document.getElementById('include-numbers')?.checked ?? true,
                    includeDuration: document.getElementById('include-duration')?.checked ?? true,
                    includeLinks: document.getElementById('include-links')?.checked ?? true,
                    shortLinks: document.getElementById('link-format-short')?.checked ?? true,
                    includeChannels: document.getElementById('include-channels')?.checked ?? false
                };
                
                // Format playlist
                const result = await formatPlaylistWithOptions(playlistUrl, apiKey, options);
                
                // Update UI with results if elements exist
                if (formattedOutput) {
                    formattedOutput.value = result.formattedOutput;
                }
                
                if (playlistTitle) {
                    playlistTitle.textContent = result.title;
                }
                
                // Display playlist summary if function exists
                if (typeof displayPlaylistSummary === 'function') {
                    displayPlaylistSummary(result.videos, result.stats);
                }
                
                // Show result section if it exists
                if (resultSection) {
                    resultSection.style.display = 'block';
                }
                
                // Show playlist summary if it exists
                const playlistSummary = document.getElementById('playlist-summary');
                if (playlistSummary) {
                    playlistSummary.style.display = 'block';
                }
                
            } catch (error) {
                alert(`Error: ${error.message}`);
                console.error(error);
            } finally {
                // Hide loading indicator if it exists
                if (loadingIndicator) {
                    loadingIndicator.style.display = 'none';
                }
            }
        });
    }
    
    // Copy button click handler
    if (copyBtn && formattedOutput) {
        copyBtn.addEventListener('click', function() {
            formattedOutput.select();
            document.execCommand('copy');
            
            // Show copied message
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => {
                this.innerHTML = originalText;
            }, 2000);
        });
    }
});
