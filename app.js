// YouTube Playlist Formatter
// This script extracts video information from a YouTube playlist and formats it as requested
// It provides both Node.js and browser methods and displays the total playlist duration

// For Node.js environment, import required modules
if (typeof window === 'undefined') {
    const https = require('https');
}

// Function to fetch playlist data using YouTube API
async function fetchPlaylistData(playlistId, apiKey) {
    if (!apiKey) {
        console.error("API key is required");
        return [];
    }

    const maxResults = 50; // Number of videos to retrieve (max 50 per request)
    const apiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=${maxResults}&playlistId=${playlistId}&key=${apiKey}`;

    try {
        // For Node.js environment
        let response;
        if (typeof fetch === 'undefined') {
            const https = require('https');
            response = await new Promise((resolve, reject) => {
                https.get(apiUrl, (res) => {
                    let data = '';
                    res.on('data', (chunk) => {
                        data += chunk;
                    });
                    res.on('end', () => {
                        resolve({ json: () => JSON.parse(data) });
                    });
                }).on('error', (err) => {
                    reject(err);
                });
            });
        } else {
            // For browser environment
            response = await fetch(apiUrl);
        }

        const data = await response.json();
        if (data.error) {
            console.error("API Error:", data.error.message);
            return [];
        }
        return data.items || [];
    } catch (error) {
        console.error("Error fetching playlist data:", error);
        return [];
    }
}

// Function to get video duration using YouTube API
async function getVideoDuration(videoId, apiKey) {
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoId}&key=${apiKey}`;

    try {
        // For Node.js environment
        let response;
        if (typeof fetch === 'undefined') {
            const https = require('https');
            response = await new Promise((resolve, reject) => {
                https.get(apiUrl, (res) => {
                    let data = '';
                    res.on('data', (chunk) => {
                        data += chunk;
                    });
                    res.on('end', () => {
                        resolve({ json: () => JSON.parse(data) });
                    });
                }).on('error', (err) => {
                    reject(err);
                });
            });
        } else {
            // For browser environment
            response = await fetch(apiUrl);
        }

        const data = await response.json();

        if (data.error) {
            console.error("API Error:", data.error.message);
            return { durationString: "video", minutes: 0 };
        }

        if (!data.items || data.items.length === 0) {
            console.error("No video data found");
            return { durationString: "video", minutes: 0 };
        }

        const duration = data.items[0].contentDetails.duration; // Format: PT2M30S (ISO 8601)

        // Convert ISO 8601 duration to minutes
        const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        const hours = parseInt(match[1] || 0);
        const minutes = parseInt(match[2] || 0);
        const seconds = parseInt(match[3] || 0);

        // Calculate total minutes for duration summation (including seconds)
        const totalMinutes = (hours * 60) + minutes + (seconds / 60);

        let durationString;
        if (hours > 0) {
            durationString = `${hours}hr ${minutes}min ${seconds}sec video`;
        } else if (minutes > 0) {
            durationString = `${minutes}min ${seconds}sec video`;
        } else {
            durationString = `${seconds}sec video`;
        }

        return {
            durationString: durationString,
            minutes: totalMinutes
        };
    } catch (error) {
        console.error("Error fetching video duration:", error);
        return { durationString: "video", minutes: 0 };
    }
}

// Function to extract playlist ID from URL
function extractPlaylistId(url) {
    const regex = /[?&]list=([^&]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

// Main function to format playlist
async function formatPlaylist(playlistUrl, apiKey) {
    const playlistId = extractPlaylistId(playlistUrl);

    if (!playlistId) {
        console.error("Invalid playlist URL");
        return "Error: Invalid playlist URL";
    }

    if (!apiKey) {
        console.error("API key is required");
        return "Error: YouTube API key is required";
    }

    const videos = await fetchPlaylistData(playlistId, apiKey);

    if (!videos || videos.length === 0) {
        console.error("No videos found or API error occurred");
        return "Error: No videos found or API error occurred";
    }

    let formattedOutput = "";
    let totalDurationMinutes = 0;

    // Process each video
    for (let i = 0; i < videos.length; i++) {
        const video = videos[i];
        const title = video.snippet.title;
        const videoId = video.contentDetails.videoId;
        const videoUrl = `https://youtu.be/${videoId}`;

        // Get video duration
        const durationData = await getVideoDuration(videoId, apiKey);
        const durationString = durationData.durationString;
        totalDurationMinutes += durationData.minutes;

        formattedOutput += `- ${i + 1}. ${title} (${durationString}) ${videoUrl}\n`;
    }

    // Add total duration at the beginning
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

    return totalDurationText + formattedOutput;
}

// If in Node.js environment, run the example
if (typeof window === 'undefined') {
    const playlistUrl = 'https://youtube.com/playlist?list=PLpQQipWcxwt_zElnggTMS3Y_MzF9EjOGr';
    const apiKey = 'YOUR_API_KEY'; // Replace with your actual API key

    // Run the formatter
    formatPlaylist(playlistUrl, apiKey)
        .then(result => console.log(result))
        .catch(error => console.error("Error formatting playlist:", error));
}

// Alternative approach without API: Browser console script
function browserConsoleScript() {
    // This function can be run in your browser console when viewing the playlist
    // It will extract information from the current page DOM

    const playlistItems = document.querySelectorAll('ytd-playlist-video-renderer');
    let output = '';
    let totalSeconds = 0;

    if (playlistItems.length === 0) {
        console.error("No playlist items found. Make sure you're on a YouTube playlist page and items are loaded.");
        return "Error: No playlist items found";
    }

    playlistItems.forEach((item, index) => {
        const title = item.querySelector('#video-title').textContent.trim();
        const durationElement = item.querySelector('#text.ytd-thumbnail-overlay-time-status-renderer');
        let duration = "video";
        let durationSeconds = 0;

        if (durationElement) {
            duration = durationElement.textContent.trim();

            // Calculate total seconds from duration (format: MM:SS or HH:MM:SS)
            const timeParts = duration.split(':').map(Number);
            if (timeParts.length === 2) {
                // MM:SS format
                durationSeconds = (timeParts[0] * 60) + timeParts[1];
                duration = `${timeParts[0]}min ${timeParts[1]}sec video`;
            } else if (timeParts.length === 3) {
                // HH:MM:SS format
                durationSeconds = (timeParts[0] * 3600) + (timeParts[1] * 60) + timeParts[2];
                duration = `${timeParts[0]}hr ${timeParts[1]}min ${timeParts[2]}sec video`;
            }

            totalSeconds += durationSeconds;
        }

        const videoUrl = item.querySelector('#video-title').href;

        output += `- ${index + 1}. ${title} (${duration}) ${videoUrl}\n`;
    });

    // Calculate total duration
    const totalHours = Math.floor(totalSeconds / 3600);
    const totalMinutes = Math.floor((totalSeconds % 3600) / 60);
    const totalRemainingSeconds = totalSeconds % 60;

    let totalDuration = "";
    if (totalHours > 0) {
        totalDuration = `Total playlist duration: ${totalHours} hour${totalHours !== 1 ? 's' : ''}, ${totalMinutes} minute${totalMinutes !== 1 ? 's' : ''}, and ${totalRemainingSeconds} second${totalRemainingSeconds !== 1 ? 's' : ''} (${playlistItems.length} videos)\n\n`;
    } else if (totalMinutes > 0) {
        totalDuration = `Total playlist duration: ${totalMinutes} minute${totalMinutes !== 1 ? 's' : ''} and ${totalRemainingSeconds} second${totalRemainingSeconds !== 1 ? 's' : ''} (${playlistItems.length} videos)\n\n`;
    } else {
        totalDuration = `Total playlist duration: ${totalRemainingSeconds} second${totalRemainingSeconds !== 1 ? 's' : ''} (${playlistItems.length} videos)\n\n`;
    }

    const finalOutput = totalDuration + output;
    console.log(finalOutput);

    // Create a download link for the output
    const blob = new Blob([finalOutput], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'playlist_info.txt';
    a.textContent = 'Download Playlist Info';
    a.style.display = 'block';
    a.style.margin = '20px';
    a.style.padding = '10px';
    a.style.backgroundColor = '#065fd4';
    a.style.color = 'white';
    a.style.textAlign = 'center';
    a.style.borderRadius = '4px';
    a.style.textDecoration = 'none';

    // Add the download link to the page
    const header = document.querySelector('ytd-playlist-header-renderer');
    if (header) {
        header.parentNode.insertBefore(a, header.nextSibling);
        console.log("Download link added to the page");
    }

    return finalOutput;
}

// Add a helper function to run the browser console script from our web app
function runBrowserConsoleScript() {
    // Check if we're on a YouTube playlist page
    if (window.location.href.includes('youtube.com/playlist')) {
        return browserConsoleScript();
    } else {
        return "Error: This function can only be run on a YouTube playlist page";
    }
}