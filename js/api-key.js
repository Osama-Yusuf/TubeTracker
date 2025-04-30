// TubeTracker - api-key.js
// Handles API key management

// API Key management
function initApiKey() {
    // Get all API key related elements from main UI
    const apiKeyInput = document.getElementById('api-key');
    const apiKeyMessage = document.getElementById('api-key-message');
    const apiKeySection = document.getElementById('api-key-section');
    const changeApiKeyBtn = document.getElementById('change-api-key');
    const toggleApiKeyBtn = document.getElementById('toggle-api-key');
    
    // Get settings modal elements
    const settingsApiKeyInput = document.querySelector('#settings-modal #api-key');
    const toggleApiKeyVisibilityBtn = document.getElementById('toggle-api-key-visibility');
    const saveApiKeyBtn = document.getElementById('save-api-key');
    const apiKeyStatus = document.getElementById('api-key-status');
    
    // Initialize API key in both places
    const savedApiKey = localStorage.getItem('youtubeApiKey');
    
    // Update main UI API key
    if (apiKeyInput) {
        if (savedApiKey) {
            apiKeyInput.value = savedApiKey;
            
            // Update the API key message
            if (apiKeyMessage) {
                apiKeyMessage.textContent = 'API key saved';
                apiKeyMessage.style.color = 'var(--success-color)';
            }
            
            // Hide the API key section and show the change button
            if (apiKeySection) {
                apiKeySection.style.display = 'none';
            }
            
            if (changeApiKeyBtn) {
                changeApiKeyBtn.style.display = 'inline-block';
            }
        } else {
            // No API key saved
            if (apiKeyMessage) {
                apiKeyMessage.textContent = 'No API key saved';
                apiKeyMessage.style.color = 'var(--error-color)';
            }
            
            // Show the API key section
            if (apiKeySection) {
                apiKeySection.style.display = 'block';
            }
            
            if (changeApiKeyBtn) {
                changeApiKeyBtn.style.display = 'none';
            }
        }
        
        // Handle API key input changes in main UI
        apiKeyInput.addEventListener('input', function() {
            const apiKey = this.value.trim();
            if (apiKey) {
                // Save to localStorage on input change
                localStorage.setItem('youtubeApiKey', apiKey);
                
                // Update the message
                if (apiKeyMessage) {
                    apiKeyMessage.textContent = 'API key saved';
                    apiKeyMessage.style.color = 'var(--success-color)';
                }
                
                // Also update settings modal input if it exists
                if (settingsApiKeyInput) {
                    settingsApiKeyInput.value = apiKey;
                }
            }
        });
        
        // Toggle API key visibility in main UI
        if (toggleApiKeyBtn) {
            toggleApiKeyBtn.addEventListener('click', function() {
                if (apiKeyInput.type === 'password') {
                    apiKeyInput.type = 'text';
                    this.innerHTML = '<i class="fas fa-eye-slash"></i>';
                } else {
                    apiKeyInput.type = 'password';
                    this.innerHTML = '<i class="fas fa-eye"></i>';
                }
            });
        }
        
        // Change API key button in main UI
        if (changeApiKeyBtn) {
            changeApiKeyBtn.addEventListener('click', function() {
                if (apiKeySection) {
                    apiKeySection.style.display = 'block';
                    this.style.display = 'none';
                }
            });
        }
    }
    
    // Update settings modal API key
    if (settingsApiKeyInput) {
        if (savedApiKey) {
            settingsApiKeyInput.value = savedApiKey;
            
            if (apiKeyStatus) {
                apiKeyStatus.textContent = 'API Key loaded from storage';
                apiKeyStatus.className = 'status-success';
            }
        }
        
        // Toggle API key visibility in settings modal
        if (toggleApiKeyVisibilityBtn) {
            toggleApiKeyVisibilityBtn.addEventListener('click', function() {
                if (settingsApiKeyInput.type === 'password') {
                    settingsApiKeyInput.type = 'text';
                    this.innerHTML = '<i class="fas fa-eye-slash"></i>';
                } else {
                    settingsApiKeyInput.type = 'password';
                    this.innerHTML = '<i class="fas fa-eye"></i>';
                }
            });
        }
        
        // Save API key button in settings modal
        if (saveApiKeyBtn) {
            saveApiKeyBtn.addEventListener('click', function() {
                const apiKey = settingsApiKeyInput.value.trim();
                if (apiKey) {
                    localStorage.setItem('youtubeApiKey', apiKey);
                    
                    if (apiKeyStatus) {
                        apiKeyStatus.textContent = 'API Key saved successfully';
                        apiKeyStatus.className = 'status-success';
                    }
                    
                    // Also update main UI
                    if (apiKeyInput) {
                        apiKeyInput.value = apiKey;
                    }
                    
                    if (apiKeyMessage) {
                        apiKeyMessage.textContent = 'API key saved';
                        apiKeyMessage.style.color = 'var(--success-color)';
                    }
                    
                    if (apiKeySection) {
                        apiKeySection.style.display = 'none';
                    }
                    
                    if (changeApiKeyBtn) {
                        changeApiKeyBtn.style.display = 'inline-block';
                    }
                } else {
                    if (apiKeyStatus) {
                        apiKeyStatus.textContent = 'Please enter a valid API Key';
                        apiKeyStatus.className = 'status-error';
                    }
                }
            });
        }
    }
}

// Export function for use in other modules
window.initApiKey = initApiKey;
