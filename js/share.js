// TubeTracker - share.js
// Handles share functionality

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
    
    // Social media share buttons
    const twitterShareBtn = document.getElementById('twitter-share');
    const facebookShareBtn = document.getElementById('facebook-share');
    const whatsappShareBtn = document.getElementById('whatsapp-share');
    const telegramShareBtn = document.getElementById('telegram-share');
    
    if (twitterShareBtn) {
        twitterShareBtn.addEventListener('click', function() {
            const playlistUrl = document.getElementById('share-link')?.value;
            const playlistTitle = document.getElementById('playlist-title')?.textContent || 'YouTube Playlist';
            if (playlistUrl) {
                const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this YouTube playlist: ${playlistTitle}`)}&url=${encodeURIComponent(playlistUrl)}`;
                window.open(twitterUrl, '_blank');
            }
        });
    }
    
    if (facebookShareBtn) {
        facebookShareBtn.addEventListener('click', function() {
            const playlistUrl = document.getElementById('share-link')?.value;
            if (playlistUrl) {
                const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(playlistUrl)}`;
                window.open(facebookUrl, '_blank');
            }
        });
    }
    
    if (whatsappShareBtn) {
        whatsappShareBtn.addEventListener('click', function() {
            const playlistUrl = document.getElementById('share-link')?.value;
            const playlistTitle = document.getElementById('playlist-title')?.textContent || 'YouTube Playlist';
            if (playlistUrl) {
                const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`Check out this YouTube playlist: ${playlistTitle} ${playlistUrl}`)}`;
                window.open(whatsappUrl, '_blank');
            }
        });
    }
    
    if (telegramShareBtn) {
        telegramShareBtn.addEventListener('click', function() {
            const playlistUrl = document.getElementById('share-link')?.value;
            const playlistTitle = document.getElementById('playlist-title')?.textContent || 'YouTube Playlist';
            if (playlistUrl) {
                const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(playlistUrl)}&text=${encodeURIComponent(`Check out this YouTube playlist: ${playlistTitle}`)}`;
                window.open(telegramUrl, '_blank');
            }
        });
    }
}

// Export function for use in other modules
window.initShareFeature = initShareFeature;
