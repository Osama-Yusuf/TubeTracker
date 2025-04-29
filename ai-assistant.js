// TubeTracker - AI Assistant
// Integrates with Gemini 1.5 Flash for playlist analysis and recommendations

document.addEventListener('DOMContentLoaded', function() {
    initAIAssistant();
    
    // Hide AI button initially until a playlist is loaded
    const aiButton = document.getElementById('ai-assistant-btn');
    if (aiButton) {
        aiButton.style.display = 'none';
    }
});

// Initialize AI Assistant functionality
function initAIAssistant() {
    // Get UI elements
    const aiAssistantBtn = document.getElementById('ai-assistant-btn');
    const aiModal = document.getElementById('ai-modal');
    const closeAiModal = document.getElementById('close-ai-modal');
    
    // AI action buttons
    const analyzeBtn = document.getElementById('ai-analyze-btn');
    const recommendBtn = document.getElementById('ai-recommend-btn');
    const summarizeBtn = document.getElementById('ai-summarize-btn');
    const chatBtn = document.getElementById('ai-chat-btn');
    const submitPromptBtn = document.getElementById('ai-submit-prompt');
    
    // AI result elements
    const aiOptions = document.querySelector('.ai-options');
    const aiResultContainer = document.querySelector('.ai-result-container');
    const aiResultTitle = document.getElementById('ai-result-title');
    const aiResult = document.getElementById('ai-result');
    const aiLoading = document.getElementById('ai-loading');
    const aiBackBtn = document.getElementById('ai-back-btn');
    
    // Note: The AI button click event is now handled in fixed-ui.js
    // This is because the button is created dynamically after a playlist is loaded
    
    // Close AI modal
    if (closeAiModal) {
        closeAiModal.addEventListener('click', function() {
            aiModal.style.display = 'none';
        });
    }
    
    // Back button to return to options
    if (aiBackBtn) {
        aiBackBtn.addEventListener('click', showAIOptions);
    }
    
    // AI action button handlers
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', function() {
            processAIRequest('analyze', 'Playlist Analysis');
        });
    }
    
    if (recommendBtn) {
        recommendBtn.addEventListener('click', function() {
            processAIRequest('recommend', 'Similar Content Recommendations');
        });
    }
    
    if (summarizeBtn) {
        summarizeBtn.addEventListener('click', function() {
            processAIRequest('summarize', 'Playlist Summary');
        });
    }
    
    if (chatBtn) {
        chatBtn.addEventListener('click', function() {
            showChatInterface('Chat with AI about your Playlist');
        });
    }
    
    if (submitPromptBtn) {
        submitPromptBtn.addEventListener('click', function() {
            const promptText = document.getElementById('ai-prompt').value.trim();
            if (!promptText) {
                showAlert('Please enter a prompt.', 'error');
                return;
            }
            processAIRequest('custom', 'Custom AI Response', promptText);
        });
    }
    
    // Function to show AI options view
    function showAIOptions() {
        if (aiOptions) aiOptions.style.display = 'block';
        if (aiResultContainer) aiResultContainer.style.display = 'none';
        if (aiResult) aiResult.innerHTML = '';
        
        // Hide chat interface if it exists
        const chatInterface = document.querySelector('.ai-chat-interface');
        if (chatInterface) chatInterface.style.display = 'none';
    }
    
    // Function to show AI results view
    function showAIResults(title) {
        if (aiOptions) aiOptions.style.display = 'none';
        if (aiResultContainer) aiResultContainer.style.display = 'block';
        if (aiResultTitle) aiResultTitle.textContent = title || 'AI Results';
        
        // Hide chat interface if it exists
        const chatInterface = document.querySelector('.ai-chat-interface');
        if (chatInterface) chatInterface.style.display = 'none';
    }
    
    // Function to show chat interface
    function showChatInterface(title) {
        // Hide other views
        if (aiOptions) aiOptions.style.display = 'none';
        if (aiResultContainer) aiResultContainer.style.display = 'none';
        
        // Create chat interface if it doesn't exist
        let chatInterface = document.querySelector('.ai-chat-interface');
        
        if (!chatInterface) {
            chatInterface = document.createElement('div');
            chatInterface.className = 'ai-chat-interface';
            
            // Create chat header
            const chatHeader = document.createElement('div');
            chatHeader.className = 'ai-chat-header';
            chatHeader.innerHTML = `
                <h3 id="ai-chat-title">${title}</h3>
                <button id="ai-chat-back-btn" class="text-btn"><i class="fas fa-arrow-left"></i> Back</button>
            `;
            
            // Create chat messages container
            const chatMessages = document.createElement('div');
            chatMessages.className = 'ai-chat-messages';
            chatMessages.id = 'ai-chat-messages';
            
            // Create initial system message
            const systemMessage = document.createElement('div');
            systemMessage.className = 'ai-chat-message system';
            systemMessage.innerHTML = `
                <div class="ai-chat-message-content">
                    <p>Hello! I'm your AI assistant. I've analyzed your playlist and I'm ready to chat about it. What would you like to know?</p>
                </div>
            `;
            chatMessages.appendChild(systemMessage);
            
            // Create chat input area
            const chatInputArea = document.createElement('div');
            chatInputArea.className = 'ai-chat-input-area';
            chatInputArea.innerHTML = `
                <textarea id="ai-chat-input" placeholder="Ask me anything about this playlist..."></textarea>
                <button id="ai-chat-send-btn" class="primary-btn"><i class="fas fa-paper-plane"></i></button>
            `;
            
            // Assemble chat interface
            chatInterface.appendChild(chatHeader);
            chatInterface.appendChild(chatMessages);
            chatInterface.appendChild(chatInputArea);
            
            // Add to modal body
            const modalBody = document.querySelector('.modal-body');
            if (modalBody) {
                modalBody.appendChild(chatInterface);
            }
            
            // Add event listeners for chat functionality
            const backBtn = document.getElementById('ai-chat-back-btn');
            const sendBtn = document.getElementById('ai-chat-send-btn');
            const chatInput = document.getElementById('ai-chat-input');
            
            if (backBtn) {
                backBtn.addEventListener('click', showAIOptions);
            }
            
            if (sendBtn && chatInput) {
                sendBtn.addEventListener('click', function() {
                    sendChatMessage(chatInput.value);
                });
                
                chatInput.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendChatMessage(chatInput.value);
                    }
                });
            }
        } else {
            // Update title if interface already exists
            const chatTitle = document.getElementById('ai-chat-title');
            if (chatTitle) chatTitle.textContent = title;
        }
        
        // Show chat interface
        chatInterface.style.display = 'flex';
    }
    
    // Function to send a chat message
    async function sendChatMessage(message) {
        if (!message.trim()) return;
        
        const chatMessages = document.getElementById('ai-chat-messages');
        const chatInput = document.getElementById('ai-chat-input');
        
        if (!chatMessages || !chatInput) return;
        
        // Clear input
        chatInput.value = '';
        
        // Add user message to chat
        const userMessage = document.createElement('div');
        userMessage.className = 'ai-chat-message user';
        userMessage.innerHTML = `
            <div class="ai-chat-message-content">
                <p>${message}</p>
            </div>
        `;
        chatMessages.appendChild(userMessage);
        
        // Add loading message
        const loadingMessage = document.createElement('div');
        loadingMessage.className = 'ai-chat-message ai loading';
        loadingMessage.innerHTML = `
            <div class="ai-chat-message-content">
                <div class="ai-chat-loading-dots">
                    <span></span><span></span><span></span>
                </div>
            </div>
        `;
        chatMessages.appendChild(loadingMessage);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        try {
            // Get the API key
            const apiKey = localStorage.getItem('youtubeApiKey');
            if (!apiKey) {
                throw new Error('API key not found. Please set your API key in settings.');
            }
            
            // Get the playlist data
            const playlistData = getPlaylistDataForAI();
            if (!playlistData) {
                throw new Error('No playlist data available.');
            }
            
            // Generate prompt for chat
            const prompt = `You are analyzing a YouTube playlist titled "${playlistData.title}" with ${playlistData.videos.length} videos.
            Here is the list of videos in the playlist:

            ${playlistData.formattedOutput}

            Total duration: ${playlistData.stats.totalDuration}
            Average video length: ${playlistData.stats.avgDuration}

            User question: ${message}

            Please respond to the user's question about this playlist in a helpful, accurate, and concise manner.`;
            
            // Call Gemini API
            const response = await callGeminiAPI(prompt, apiKey);
            
            // Remove loading message
            chatMessages.removeChild(loadingMessage);
            
            // Add AI response to chat
            const aiMessage = document.createElement('div');
            aiMessage.className = 'ai-chat-message ai';
            aiMessage.innerHTML = `
                <div class="ai-chat-message-content">
                    <p>${formatAIResponse(response)}</p>
                </div>
            `;
            chatMessages.appendChild(aiMessage);
            
            // Scroll to bottom
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
        } catch (error) {
            console.error('Chat error:', error);
            
            // Remove loading message
            chatMessages.removeChild(loadingMessage);
            
            // Add error message
            const errorMessage = document.createElement('div');
            errorMessage.className = 'ai-chat-message system error';
            errorMessage.innerHTML = `
                <div class="ai-chat-message-content">
                    <p><i class="fas fa-exclamation-circle"></i> ${error.message || 'An error occurred while processing your request.'}</p>
                </div>
            `;
            chatMessages.appendChild(errorMessage);
            
            // Scroll to bottom
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }
    
    // Process AI request based on type
    async function processAIRequest(type, title, customPrompt = '') {
        // Show loading and results view
        showAIResults(title);
        if (aiLoading) aiLoading.style.display = 'flex';
        if (aiResult) aiResult.innerHTML = '';
        
        try {
            // Get the API key (same as YouTube API key)
            const apiKey = localStorage.getItem('youtubeApiKey');
            if (!apiKey) {
                throw new Error('API key not found. Please set your API key in settings.');
            }
            
            // Get the playlist data
            const playlistData = getPlaylistDataForAI();
            if (!playlistData) {
                throw new Error('No playlist data available.');
            }
            
            // Generate prompt based on request type
            const prompt = generatePrompt(type, playlistData, customPrompt);
            
            // Call Gemini API
            const response = await callGeminiAPI(prompt, apiKey);
            
            // Display the result
            if (aiResult) {
                aiResult.innerHTML = formatAIResponse(response);
            }
        } catch (error) {
            console.error('AI Assistant error:', error);
            if (aiResult) {
                aiResult.innerHTML = `<div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>${error.message || 'An error occurred while processing your request.'}</p>
                </div>`;
            }
        } finally {
            // Hide loading
            if (aiLoading) aiLoading.style.display = 'none';
        }
    }
    
    // Extract playlist data for AI processing
    function getPlaylistDataForAI() {
        // Use the global variables set during formatting
        if (!window.currentVideosData || !window.lastFormattedOutput) {
            return null;
        }
        
        // Get playlist title
        const playlistTitle = document.getElementById('playlist-title')?.textContent || 'YouTube Playlist';
        
        // Return structured data for AI
        return {
            title: playlistTitle,
            formattedOutput: window.lastFormattedOutput,
            videos: window.currentVideosData,
            stats: window.originalStats
        };
    }
    
    // Generate prompt based on request type
    function generatePrompt(type, playlistData, customPrompt) {
        const basePrompt = `You are analyzing a YouTube playlist titled "${playlistData.title}" with ${playlistData.videos.length} videos.
Here is the list of videos in the playlist:

${playlistData.formattedOutput}

Total duration: ${playlistData.stats.totalDuration}
Average video length: ${playlistData.stats.avgDuration}`;
        
        switch (type) {
            case 'analyze':
                return `${basePrompt}

Please analyze this playlist and provide insights about:
1. The main topics or themes covered
2. The progression of content (if it follows a logical order)
3. The distribution of video lengths
4. Any patterns in the video titles or content
5. The overall quality and comprehensiveness of the playlist for learning this subject

Format your response with clear headings and bullet points where appropriate.`;
                
            case 'recommend':
                return `${basePrompt}

Based on this playlist, please recommend:
1. 5-7 similar YouTube channels that cover related content
2. 3-5 other playlists that would complement this one
3. Books, courses, or resources that would enhance understanding of these topics
4. What topics might be missing from this playlist that would be valuable to explore

Format your recommendations in clear sections with brief explanations of why each recommendation is relevant.`;
                
            case 'summarize':
                return `${basePrompt}

Please create a comprehensive summary of this playlist that includes:
1. A brief overview of what the playlist covers (2-3 sentences)
2. The key topics addressed in the playlist
3. The main takeaways or skills that would be gained from watching the entire playlist
4. Who would benefit most from this content
5. A concise description of the progression of topics

Format your summary with clear headings and keep it concise but informative.`;
                
            case 'custom':
                return `${basePrompt}

User question: ${customPrompt}

Please respond to the user's question about this playlist in a helpful, accurate, and concise manner.`;
                
            default:
                return basePrompt;
        }
    }
    
    // Call Gemini API
    async function callGeminiAPI(prompt, apiKey) {
        // Gemini API endpoint
        const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
        
        // Request data
        const requestData = {
            contents: [
                {
                    parts: [
                        {
                            text: prompt
                        }
                    ]
                }
            ],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2048
            }
        };
        
        // Make API request
        const response = await fetch(`${endpoint}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Error calling Gemini API');
        }
        
        const data = await response.json();
        
        // Extract the text from the response
        if (data.candidates && data.candidates[0]?.content?.parts) {
            return data.candidates[0].content.parts[0].text;
        } else {
            throw new Error('Invalid response from Gemini API');
        }
    }
    
    // Format AI response with markdown
    function formatAIResponse(text) {
        // Simple markdown formatting
        return text
            .replace(/^# (.*$)/gm, '<h2>$1</h2>')
            .replace(/^## (.*$)/gm, '<h3>$1</h3>')
            .replace(/^### (.*$)/gm, '<h4>$1</h4>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/- (.*?)$/gm, '<li>$1</li>')
            .replace(/\n\n/g, '<br><br>')
            .replace(/<\/li>\n<li>/g, '</li><li>');
    }
}

// Close modals when clicking outside
window.addEventListener('click', function(event) {
    const aiModal = document.getElementById('ai-modal');
    if (event.target === aiModal) {
        aiModal.style.display = 'none';
    }
});
