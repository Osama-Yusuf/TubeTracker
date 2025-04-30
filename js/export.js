// TubeTracker - export.js
// Handles export functionality

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

// Download playlist as ZIP file with all formats
async function downloadZip() {
    const formattedOutput = document.getElementById('formatted-output');
    if (!formattedOutput || !formattedOutput.value) {
        showAlert('No playlist data to download. Please format a playlist first.', 'error');
        return;
    }
    
    const rawContent = formattedOutput.value;
    const playlistTitle = document.getElementById('playlist-title')?.textContent || 'playlist';
    const sanitizedTitle = playlistTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    
    try {
        // Show loading message
        showAlert('Creating ZIP file...', 'info');
        
        // Create a new JSZip instance
        const zip = new JSZip();
        
        // Add all formats to the zip
        // Plain text
        zip.file(`${sanitizedTitle}.txt`, rawContent);
        
        // Markdown
        zip.file(`${sanitizedTitle}.md`, `# ${playlistTitle}\n\n${rawContent}`);
        
        // CSV
        zip.file(`${sanitizedTitle}.csv`, convertToCSV(rawContent));
        
        // JSON
        zip.file(`${sanitizedTitle}.json`, convertToJSON(rawContent, playlistTitle));
        
        // HTML
        zip.file(`${sanitizedTitle}.html`, convertToHTML(rawContent, playlistTitle));
        
        // Generate the zip file
        const zipBlob = await zip.generateAsync({type: 'blob'});
        
        // Create download link
        const url = URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${sanitizedTitle}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Show success message
        showAlert(`Playlist downloaded as ${sanitizedTitle}.zip`, 'success');
    } catch (error) {
        console.error('Error creating ZIP file:', error);
        showAlert('Error creating ZIP file. Please try again.', 'error');
    }
}

// Initialize download ZIP button
function initDownloadZipButton() {
    const downloadZipBtn = document.getElementById('download-zip-btn');
    if (!downloadZipBtn) return;
    
    downloadZipBtn.addEventListener('click', downloadZip);
}

// Export functions for use in other modules
window.initExportOptions = initExportOptions;
window.initCopyButton = initCopyButton;
window.initDownloadZipButton = initDownloadZipButton;
window.exportPlaylist = exportPlaylist;
window.convertToCSV = convertToCSV;
window.convertToJSON = convertToJSON;
window.convertToHTML = convertToHTML;
window.downloadZip = downloadZip;
