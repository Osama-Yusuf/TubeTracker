// Enhanced HTTP server to serve the YouTube Playlist Formatter web app with video download capabilities
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const { exec, spawn } = require('child_process');
const zlib = require('zlib');
const { pipeline } = require('stream');
const { createWriteStream, createReadStream } = require('fs');
const { promisify } = require('util');
const child_process = require('child_process');

const PORT = 3000;

// Check if yt-dlp is installed
exec('which yt-dlp', (error, stdout, stderr) => {
    if (error) {
        console.error('yt-dlp is not installed. Please install it to enable video downloads.');
        console.error('Installation instructions: https://github.com/ytdl-org/yt-dlp#installation');
    } else {
        console.log(`yt-dlp detected at: ${stdout.trim()}`);
    }
});

// Create temp directory for downloads if it doesn't exist
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
    console.log('Created temp directory for downloads');
}

// Function to create a ZIP file using system zip command
async function createZipFile(sourceDir, zipFilePath) {
    return new Promise((resolve, reject) => {
        // Use the system's zip command
        const zipCommand = `cd "${sourceDir}" && zip -r "${zipFilePath}" .`;
        
        child_process.exec(zipCommand, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error creating ZIP file: ${error.message}`);
                reject(error);
                return;
            }
            if (stderr) {
                console.error(`ZIP stderr: ${stderr}`);
            }
            console.log(`ZIP file created at: ${zipFilePath}`);
            resolve(zipFilePath);
        });
    });
}

// Function to sanitize a string for use in a filename
function sanitizeFilename(name) {
    return name.replace(/[^a-z0-9]/gi, '-').toLowerCase();
}

// Function to get playlist title from the first video's output
function extractPlaylistTitle(output) {
    // Look for playlist title in the output
    const titleMatch = output.match(/\[download\] Downloading playlist: (.+?)\n/);
    if (titleMatch && titleMatch[1]) {
        return titleMatch[1].trim();
    }
    return null;
}

// Function to download videos from a playlist
function downloadPlaylistVideos(playlistId, format, quality, includeNumber, res) {
    // Create a unique folder for this download
    const downloadId = Date.now().toString();
    const downloadDir = path.join(tempDir, downloadId);
    
    // We'll set the final ZIP filename after we get the playlist title
    let playlistTitle = '';
    let zipFileName = `playlist-${playlistId}-${format}.zip`;
    const zipFilePath = path.join(tempDir, zipFileName);

    if (!fs.existsSync(downloadDir)) {
        fs.mkdirSync(downloadDir);
    }

    // Set output template based on user preferences
    const outputTemplate = includeNumber ?
        '%(playlist_index)s.%(title)s.%(ext)s' :
        '%(title)s.%(ext)s';

    // Build yt-dlp command arguments
    let args = [
        '--no-warnings',
        '--ignore-errors',
        '--no-call-home',
        '--restrict-filenames',
        '--output', path.join(downloadDir, outputTemplate)
    ];

    // Add format options
    if (format === 'mp3') {
        args.push('--extract-audio', '--audio-format', 'mp3', '--audio-quality', '0');
    } else {
        // MP4 with quality options
        if (quality === 'best') {
            args.push('-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/mp4');
        } else if (quality === 'medium') {
            args.push('-f', 'bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720][ext=mp4]/mp4');
        } else if (quality === 'low') {
            args.push('-f', 'bestvideo[height<=480][ext=mp4]+bestaudio[ext=m4a]/best[height<=480][ext=mp4]/mp4');
        }
    }

    // Add playlist URL
    args.push(`https://www.youtube.com/playlist?list=${playlistId}`);

    console.log(`Starting download of playlist ${playlistId} to ${downloadDir}`);

    // Set response headers for streaming text updates
    res.writeHead(200, {
        'Content-Type': 'text/plain',
        'Transfer-Encoding': 'chunked'
    });

    // Start the download process
    const ytdl = spawn('yt-dlp', args);
    let outputBuffer = '';

    // Track download progress
    let videoCount = 0;
    let currentVideo = '';
    let lastProgressUpdate = Date.now();
    
    // Send simplified progress updates to the client
    ytdl.stdout.on('data', (data) => {
        const dataStr = data.toString();
        outputBuffer += dataStr; // Store output to extract playlist title
        
        // Try to extract playlist title if we don't have it yet
        if (!playlistTitle) {
            const extractedTitle = extractPlaylistTitle(outputBuffer);
            if (extractedTitle) {
                playlistTitle = extractedTitle;
                const sanitizedTitle = sanitizeFilename(playlistTitle);
                zipFileName = `${sanitizedTitle}-playlist-${format}.zip`;
                res.write(`🎬 Downloading playlist: ${playlistTitle}\n`);
            }
        }
        
        // Extract video title from download message
        const videoMatch = dataStr.match(/\[download\] Destination: (.+?)\n/);
        if (videoMatch && videoMatch[1]) {
            videoCount++;
            const videoFileName = path.basename(videoMatch[1]);
            currentVideo = videoFileName;
            res.write(`⏬ Downloading video ${videoCount}: ${videoFileName}\n`);
        }
        
        // Send periodic progress updates (but not too frequently)
        const now = Date.now();
        if (now - lastProgressUpdate > 3000 && dataStr.includes('ETA')) {
            const progressMatch = dataStr.match(/\s+(\d+\.\d+)%\s+/);
            if (progressMatch && progressMatch[1]) {
                res.write(`📊 Progress: ${progressMatch[1]}% complete for current video\n`);
                lastProgressUpdate = now;
            }
        }
    });

    ytdl.stderr.on('data', (data) => {
        // Only send simplified error messages, not the full error details
        res.write(`❌ Error encountered during download. Continuing with other videos...\n`);
    });

    ytdl.on('close', async (code) => {
        if (code === 0 || videoCount > 0) { // Consider partial success if at least one video was downloaded
            res.write(`\n✅ Download completed! ${videoCount} videos processed.\n`);
            res.write(`🗜️ Creating ZIP file...\n`);
            
            try {
                // Update the ZIP file path with the potentially new filename
                const finalZipPath = path.join(tempDir, zipFileName);
                
                // Create ZIP file
                await createZipFile(downloadDir, finalZipPath);
                
                // Send success message with download URL
                res.write(`\n🎉 All done! Your download is ready.\n`);
                
                // Send the special marker with download URL to the client
                const downloadUrl = `/download/${downloadId}/${zipFileName}`;
                res.write(`ZIP_FILE_READY:${downloadUrl}\n`);
                res.end();
            } catch (error) {
                // Simplified error message
                res.write(`\n❌ Sorry, we couldn't create your ZIP file. Please try again.\n`);
                res.end();
            }
        } else {
            // Simplified error message for failed download
            res.write(`\n❌ Sorry, we couldn't download any videos from this playlist. Please check the playlist URL and try again.\n`);
            res.end();
        }
    });
}

// MIME types for different file extensions
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

// Create the server
const server = http.createServer((req, res) => {
    console.log(`Request for ${req.url}`);

    // Check if it's a video download request
    if (req.url.startsWith('/api/download-videos')) {
        try {
            // Parse the URL and query parameters
            const urlObj = new URL(req.url, `http://${req.headers.host}`);
            const playlistId = urlObj.searchParams.get('playlistId');
            const format = urlObj.searchParams.get('format') || 'mp4';
            const quality = urlObj.searchParams.get('quality') || 'best';
            const includeNumber = urlObj.searchParams.get('includeNumber') === 'true';

            if (!playlistId) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Missing playlistId parameter' }));
                return;
            }

            // Start the download process
            downloadPlaylistVideos(playlistId, format, quality, includeNumber, res);
            return;
        } catch (error) {
            console.error('Error processing download request:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal server error' }));
            return;
        }
    }
    
    // Handle ZIP file download requests
    if (req.url.startsWith('/download/')) {
        try {
            // Extract the file path from the URL
            const urlPath = req.url.substring('/download/'.length);
            const [downloadId, fileName] = urlPath.split('/');
            
            if (!downloadId || !fileName) {
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('Invalid download URL');
                return;
            }
            
            // Construct the full path to the ZIP file
            const zipFilePath = path.join(tempDir, fileName);
            
            // Check if the file exists
            if (!fs.existsSync(zipFilePath)) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('File not found');
                return;
            }
            
            // Get file stats
            const stat = fs.statSync(zipFilePath);
            
            // Set appropriate headers for file download
            res.writeHead(200, {
                'Content-Type': 'application/zip',
                'Content-Length': stat.size,
                'Content-Disposition': `attachment; filename="${fileName}"`
            });
            
            // Stream the file to the client
            const fileStream = fs.createReadStream(zipFilePath);
            fileStream.pipe(res);
            
            // Clean up the file after it's been sent
            fileStream.on('end', () => {
                console.log(`File ${zipFilePath} sent to client`);
                
                // Optional: Clean up the temp directory after some time
                setTimeout(() => {
                    try {
                        // Remove the download directory and zip file
                        const downloadDir = path.join(tempDir, downloadId);
                        if (fs.existsSync(downloadDir)) {
                            fs.rmSync(downloadDir, { recursive: true, force: true });
                            console.log(`Removed download directory: ${downloadDir}`);
                        }
                        if (fs.existsSync(zipFilePath)) {
                            fs.unlinkSync(zipFilePath);
                            console.log(`Removed ZIP file: ${zipFilePath}`);
                        }
                    } catch (error) {
                        console.error(`Error cleaning up: ${error.message}`);
                    }
                }, 5 * 60 * 1000); // Clean up after 5 minutes
            });
            
            return;
        } catch (error) {
            console.error('Error serving download:', error);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal server error');
            return;
        }
    }

    // Handle regular file requests
    let filePath = '.' + req.url;
    if (filePath === './') {
        filePath = './index.html';
    }

    // Get the file extension
    const extname = path.extname(filePath);
    let contentType = MIME_TYPES[extname] || 'application/octet-stream';

    // Read the file
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // Page not found
                fs.readFile('./index.html', (err, content) => {
                    if (err) {
                        // If even the index.html is not found
                        res.writeHead(500);
                        res.end('Error: Could not serve the requested file');
                    } else {
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.end(content, 'utf-8');
                    }
                });
            } else {
                // Server error
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
            }
        } else {
            // Success
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log(`Open your browser and navigate to http://localhost:${PORT}/`);
});
