// TubeTracker - modals.js
// Handles modal functionality

// Initialize modal buttons
function initModalButtons() {
    // Settings Modal
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettingsModal = document.getElementById('close-settings-modal');
    
    if (settingsBtn && settingsModal) {
        settingsBtn.addEventListener('click', function() {
            settingsModal.style.display = 'block';
        });
        
        if (closeSettingsModal) {
            closeSettingsModal.addEventListener('click', function() {
                settingsModal.style.display = 'none';
            });
        }
    }
    
    // History Modal
    const historyBtn = document.getElementById('history-btn');
    const historyModal = document.getElementById('history-modal');
    const closeHistoryModal = document.getElementById('close-history-modal');
    
    if (historyBtn) {
        historyBtn.addEventListener('click', function() {
            // If we have a modal, use it
            if (historyModal) {
                updateHistoryList();
                historyModal.style.display = 'block';
            } else {
                // Otherwise toggle the history section
                const historySection = document.querySelector('.history-section');
                if (historySection) {
                    if (historySection.style.display === 'none' || historySection.style.display === '') {
                        historySection.style.display = 'block';
                        updateHistoryList();
                        historySection.scrollIntoView({ behavior: 'smooth' });
                    } else {
                        historySection.style.display = 'none';
                    }
                }
            }
        });
        
        if (closeHistoryModal) {
            closeHistoryModal.addEventListener('click', function() {
                historyModal.style.display = 'none';
            });
        }
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (settingsModal && event.target === settingsModal) {
            settingsModal.style.display = 'none';
        }
        if (historyModal && event.target === historyModal) {
            historyModal.style.display = 'none';
        }
    });
}

// Export function for use in other modules
window.initModalButtons = initModalButtons;
