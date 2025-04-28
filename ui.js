// UI handling for YouTube Playlist Formatter
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const playlistUrlInput = document.getElementById('playlist-url');
    const apiKeyInput = document.getElementById('api-key');
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
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.querySelector('.theme-icon i');
    
    // Format option elements
    const includeDuration = document.getElementById('include-duration');
    const includeLinks = document.getElementById('include-links');
    const includeNumbers = document.getElementById('include-numbers');
    const linkFormatShort = document.getElementById('link-format-short');
    const linkFormatFull = document.getElementById('link-format-full');
    
    // Stats elements
    const totalVideosElement = document.getElementById('total-videos');
    const totalDurationElement = document.getElementById('total-duration');
    const avgDurationElement = document.getElementById('avg-duration');

    // Toggle API key visibility
    toggleApiKeyBtn.addEventListener('click', function() {
        const type = apiKeyInput.getAttribute('type') === 'password' ? 'text' : 'password';
        apiKeyInput.setAttribute('type', type);
        toggleApiKeyBtn.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
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
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        themeToggle.checked = true;
        themeIcon.className = 'fas fa-sun';
    }

    // Format playlist button click
    formatBtn.addEventListener('click', async function() {
        const playlistUrl = playlistUrlInput.value.trim();
        const apiKey = apiKeyInput.value.trim();

        // Validate inputs
        if (!playlistUrl) {
            showError('Please enter a YouTube playlist URL');
            return;
        }

        if (!apiKey) {
            showError('Please enter your YouTube API key');
            return;
        }

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
    
    // Helper function to format playlist with options
    async function formatPlaylistWithOptions(playlistUrl, apiKey, options) {
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
