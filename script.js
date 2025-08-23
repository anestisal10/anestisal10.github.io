// State management
let isDarkMode = localStorage.getItem('darkMode') === 'true';
let dashboardTabs = [];
let isPatchNotesPanelOpen = false;
let lastSeenPatchNoteId = parseInt(localStorage.getItem('lastSeenPatchNoteId')) || 0;

// Initialize dark mode
function initializeDarkMode() {
    if (isDarkMode) {
        document.documentElement.classList.add('dark');
    }
}

// Toggle dark mode
function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    localStorage.setItem('darkMode', isDarkMode.toString());
    document.documentElement.classList.toggle('dark', isDarkMode);
}

// Check for new patch notes and update UI
function checkForNewPatchNotes() {
    const latestNoteId = patchNotes.length > 0 ? Math.max(...patchNotes.map(note => note.id)) : 0;
    const badge = document.getElementById('notification-badge');
    const bellIcon = document.getElementById('bell-icon');

    if (latestNoteId > lastSeenPatchNoteId) {
        badge.classList.remove('hidden');
        // Add animation class to the bell icon
        bellIcon.classList.add('bell-animate');
        // Remove animation class after it completes
        setTimeout(() => {
            bellIcon.classList.remove('bell-animate');
        }, 500); // Match the duration of the animation
    } else {
        badge.classList.add('hidden');
    }
}

// Toggle patch notes panel
function togglePatchNotesPanel() {
    const panel = document.getElementById('patch-notes-panel');
    const toggleButton = document.getElementById('patch-notes-toggle');
    
    isPatchNotesPanelOpen = !isPatchNotesPanelOpen;
    if (isPatchNotesPanelOpen) {
        // Position panel relative to the toggle button
        const buttonRect = toggleButton.getBoundingClientRect();
        panel.style.position = 'fixed';
        panel.style.left = `${buttonRect.right - panel.offsetWidth + 20}px`;
        panel.style.top = `${buttonRect.bottom + window.scrollY}px`;
        
        // Check if panel goes off screen and adjust if needed
        const panelRect = panel.getBoundingClientRect();
        if (panelRect.right > window.innerWidth) {
            panel.style.left = `${buttonRect.left - panelRect.width + 20}px`;
        }
        if (panelRect.bottom > window.innerHeight) {
            panel.style.top = `${buttonRect.top - panelRect.height + window.scrollY}px`;
        }
        
        panel.classList.remove('hidden');
        
        // Mark all notes as seen
        if (patchNotes.length > 0) {
            const latestNoteId = Math.max(...patchNotes.map(note => note.id));
            if (latestNoteId > lastSeenPatchNoteId) {
                lastSeenPatchNoteId = latestNoteId;
                localStorage.setItem('lastSeenPatchNoteId', lastSeenPatchNoteId.toString());
                checkForNewPatchNotes(); // Update badge
            }
        }
        renderPatchNotes();
    } else {
        panel.classList.add('hidden');
    }
}

// Close patch notes panel
function closePatchNotesPanel() {
    isPatchNotesPanelOpen = false;
    document.getElementById('patch-notes-panel').classList.add('hidden');
}

// Render patch notes
function renderPatchNotes() {
    const contentContainer = document.getElementById('patch-notes-content');
    if (patchNotes.length === 0) {
        contentContainer.innerHTML = '<div class="text-center text-gray-500 dark:text-gray-400 p-4">No recent updates.</div>';
        return;
    }

    // Sort notes by date (newest first)
    const sortedNotes = [...patchNotes].sort((a, b) => new Date(b.date) - new Date(a.date));

    contentContainer.innerHTML = sortedNotes.map(note => {
        const model = models.find(m => m.id === note.modelId);
        const modelName = model ? model.name : 'Unknown Model';
        const modelColor = model ? model.color : 'gray';
        const formattedDate = new Date(note.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

        return `
            <a href="${note.link}" target="_blank" rel="noopener noreferrer" class="block p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200">
                <div class="flex items-start">
                    ${model ? `<div class="bg-gradient-to-br from-${modelColor}-400 to-${modelColor}-600 rounded-lg w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                        <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="${model.icon}"/>
                        </svg>
                    </div>` : ''}
                    <div class="flex-1 min-w-0">
                        <div class="flex justify-between items-start">
                            <h4 class="font-medium text-gray-800 dark:text-gray-200 truncate">${note.title}</h4>
                            <span class="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">${formattedDate}</span>
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">${note.description}</p>
                        <p class="text-xs text-${modelColor}-600 dark:text-${modelColor}-400 mt-1">${modelName}</p>
                    </div>
                </div>
            </a>
        `;
    }).join('');
}

// Create model card (Updated to use info_url for Learn More)
function createModelCard(model) {
    return `
        <div class="model-card-container flex flex-col">
            <div class="model-card group relative flex flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 hover:from-${model.color}-50 hover:to-white dark:hover:from-${model.color}-900/30 dark:hover:to-gray-800 rounded-2xl border border-gray-200 dark:border-gray-600 hover:border-${model.color}-300 dark:hover:border-${model.color}-600 transition-all duration-300 ease-in-out transform hover:-translate-y-2 hover:shadow-xl cursor-pointer"
                 data-model-id="${model.id}"
                 onmouseenter="showTooltip(event, '${model.id}')"
                 onmouseleave="hideTooltip()">
                <div class="bg-gradient-to-br from-${model.color}-400 to-${model.color}-600 rounded-2xl w-16 h-16 mb-4 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <svg class="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="${model.icon}"/>
                    </svg>
                </div>
                <!-- Use font-bold for model name consistency -->
                <span class="font-bold text-gray-700 dark:text-gray-200 group-hover:text-${model.color}-700 dark:group-hover:text-${model.color}-300 transition-colors duration-300 text-lg">${model.name}</span>
                <span class="text-xs text-gray-500 dark:text-gray-400 mt-1">${model.company}</span>
            </div>
            <button onclick="openModel('${model.info_url}')" class="mt-3 px-3 py-1 text-xs bg-brand-red-100 hover:bg-brand-red-200 dark:bg-brand-red-900/30 dark:hover:bg-brand-red-800/40 text-brand-red-700 dark:text-brand-red-300 rounded-lg transition duration-200 self-center flex items-center">
                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
                Learn More
            </button>
        </div>
    `;
}

// Show tooltip (Reverted to original content)
function showTooltip(event, modelId) {
    const model = models.find(m => m.id === modelId);
    if (!model) return;
    const tooltip = document.getElementById('tooltip');
    const tooltipContent = document.getElementById('tooltip-content');
    tooltipContent.innerHTML = `
        <div class="flex items-center space-x-3 mb-3">
            <div class="bg-gradient-to-br from-${model.color}-400 to-${model.color}-600 rounded-lg w-10 h-10 flex items-center justify-center">
                <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="${model.icon}"/>
                </svg>
            </div>
            <div>
                <div class="font-semibold text-gray-800 dark:text-gray-200">${model.name}</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">${model.company}</div>
            </div>
        </div>
        <div class="mb-3">
            <div class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Strengths:</div>
            <div class="space-y-1">
                ${model.strengths.map(strength => `<div class="text-xs bg-${model.color}-100 dark:bg-${model.color}-900/30 text-${model.color}-700 dark:text-${model.color}-300 px-2 py-1 rounded-full">${strength}</div>`).join('')}
            </div>
        </div>
        <div>
            <div class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Best for:</div>
            <div class="text-xs text-gray-600 dark:text-gray-400">
                ${model.useCases.join(' • ')}
            </div>
        </div>
    `;
    tooltip.classList.remove('hidden');
    positionTooltip(event, tooltip);
}

// Position tooltip
function positionTooltip(event, tooltip) {
    const rect = event.target.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    let left = rect.right + 10;
    let top = rect.top;
    // Adjust if tooltip goes off screen
    if (left + tooltipRect.width > window.innerWidth) {
        left = rect.left - tooltipRect.width - 10;
    }
    if (top + tooltipRect.height > window.innerHeight) {
        top = window.innerHeight - tooltipRect.height - 10;
    }
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
}

// Hide tooltip
function hideTooltip() {
    document.getElementById('tooltip').classList.add('hidden');
}

// Render models grid
function renderModelsGrid() {
    const grid = document.getElementById('models-grid');
    grid.innerHTML = models.map(model => createModelCard(model)).join('');
    // Add click handlers for model cards (opening the model)
    grid.addEventListener('click', handleModelClick);
}

// Handle model click (Updated to prevent default and stop propagation)
function handleModelClick(event) {
    // Find the closest model card element to ensure we're acting on the right target
    // We need to check if the click was on the 'Learn More' button first
    const learnMoreButton = event.target.closest('button[onclick*="openModel"]');
    if (learnMoreButton) {
         // If the click was on the 'Learn More' button, let its onclick handler do the work
         // and prevent further propagation to avoid triggering the card click
         event.preventDefault();
         event.stopPropagation();
         return;
    }
    // Otherwise, check if it was a click on the model card itself
    const modelCard = event.target.closest('.model-card');
    // If the click wasn't on a model card, do nothing
    if (!modelCard) return;
    // Get the model ID from the data attribute
    const modelId = modelCard.dataset.modelId;
    // Find the corresponding model object
    const model = models.find(m => m.id === modelId);
    // If no model was found, do nothing
    if (!model) return;
    // Prevent any default action (like navigation if the element behaves like a link)
    event.preventDefault();
    // Stop the event from bubbling up to parent elements
    event.stopPropagation();
    // In normal mode, open the model in a new tab
    openModel(model.url);
}

// Open model utility function (Updated for robustness)
function openModel(url) {
    try {
        // Attempt to open the URL in a new tab/window with security features
        // 'noopener' and 'noreferrer' are crucial for security and preventing the new page from accessing this one
        const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
        // Check if the browser blocked the popup (newWindow will be null)
        if (!newWindow) {
            console.warn('Popup was blocked by the browser.');
            // Optional: Show a user-friendly message about the popup blocker
            // alert('Please allow popups for this site to open the model.');
        } else {
            // If the new window opened successfully, optionally bring it to focus
            // newWindow.focus(); // Uncomment if you want to focus the new tab
        }
    } catch (error) {
        // Log any unexpected errors during window.open
        console.error('An error occurred while trying to open the model:', error);
        // Note: We deliberately do NOT use window.location.href = url; here
        // as that would cause the CURRENT page (LLM Router) to navigate,
        // which is the bug we are trying to fix.
    }
    // Most importantly, after attempting to open the window,
    // we do nothing else that could cause navigation of the *current* page.
    // The function ends here, and the main LLM Router page should remain.
}

// Toggle dashboard
function toggleDashboard() {
    const modelSelection = document.getElementById('model-selection');
    const dashboard = document.getElementById('unified-dashboard');
    const toggleText = document.getElementById('dashboard-text');
    if (dashboard.classList.contains('hidden')) {
        modelSelection.classList.add('hidden');
        dashboard.classList.remove('hidden');
        toggleText.textContent = 'Back to Models';
        if (dashboardTabs.length === 0) {
            addDashboardTab('chatgpt');
        }
    } else {
        modelSelection.classList.remove('hidden');
        dashboard.classList.add('hidden');
        toggleText.textContent = 'Dashboard';
    }
}

// Add dashboard tab
function addDashboardTab(modelId) {
    const model = models.find(m => m.id === modelId);
    if (!model || dashboardTabs.find(tab => tab.id === modelId)) return;
    const tab = {
        id: modelId,
        name: model.name,
        url: model.url,
        color: model.color
    };
    dashboardTabs.push(tab);
    renderDashboardTabs();
    switchDashboardTab(modelId);
}

// Remove dashboard tab
function removeDashboardTab(modelId) {
    const index = dashboardTabs.findIndex(tab => tab.id === modelId);
    if (index === -1) return;
    dashboardTabs.splice(index, 1);
    renderDashboardTabs();
    if (dashboardTabs.length > 0) {
        switchDashboardTab(dashboardTabs[0].id);
    } else {
        document.getElementById('dashboard-content').innerHTML = `
            <div class="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <div class="text-center">
                    <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    <p>No models open. Click + to add a model.</p>
                </div>
            </div>
        `;
    }
}

// Render dashboard tabs
function renderDashboardTabs() {
    const tabsContainer = document.getElementById('dashboard-tabs');
    tabsContainer.innerHTML = dashboardTabs.map(tab => `
        <div class="flex items-center bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
            <button onclick="switchDashboardTab('${tab.id}')" class="flex items-center space-x-2 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-200 ${tab.active ? 'bg-gray-50 dark:bg-gray-700' : ''}">
                <div class="w-4 h-4 bg-gradient-to-br from-${tab.color}-400 to-${tab.color}-600 rounded"></div>
                <span class="text-sm font-medium text-gray-700 dark:text-gray-200">${tab.name}</span>
            </button>
            <button onclick="removeDashboardTab('${tab.id}')" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 transition duration-200">
                <svg class="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>
    `).join('');
}

// Switch dashboard tab
function switchDashboardTab(modelId) {
    dashboardTabs.forEach(tab => tab.active = tab.id === modelId);
    renderDashboardTabs();
    const tab = dashboardTabs.find(t => t.id === modelId);
    if (!tab) return;
    document.getElementById('dashboard-content').innerHTML = `
        <iframe src="${tab.url}" class="w-full h-full border-0" sandbox="allow-same-origin allow-scripts allow-popups allow-forms"></iframe>
    `;
}

// Show add model modal
function showAddModelModal() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-2xl w-full mx-4">
            <h3 class="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Add Model to Dashboard</h3>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                ${models.filter(model => !dashboardTabs.find(tab => tab.id === model.id)).map(model => `
                    <button onclick="addDashboardTab('${model.id}'); closeModal()" class="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-600 rounded-xl hover:border-${model.color}-300 dark:hover:border-${model.color}-600 transition duration-200">
                        <div class="bg-gradient-to-br from-${model.color}-400 to-${model.color}-600 rounded-lg w-10 h-10 flex items-center justify-center mb-2">
                            <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                                <path d="${model.icon}"/>
                            </svg>
                        </div>
                        <span class="text-sm font-medium text-gray-700 dark:text-gray-200">${model.name}</span>
                    </button>
                `).join('')}
            </div>
            <button onclick="closeModal()" class="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl transition duration-200">
                Cancel
            </button>
        </div>
    `;
    document.body.appendChild(modal);
    window.currentModal = modal;
}

// Close modal
function closeModal() {
    if (window.currentModal) {
        document.body.removeChild(window.currentModal);
        window.currentModal = null;
    }
}

// Open model utility functions
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Failed to parse JWT", e);
        return null;
    }
}

function handleCredentialResponse(response) {
    hideError();
    const responsePayload = parseJwt(response.credential);
    if (responsePayload) {
        const userData = {
            name: responsePayload.name,
            picture: responsePayload.picture,
            email: responsePayload.email
        };
        storeUserData(userData);
        showRouterScreen(userData);
        checkForNewPatchNotes(); // Check after login
    } else {
        showError("Failed to process login credentials.");
    }
}

function handleDemoLogin() {
    const demoUser = {
        name: "Demo User",
        picture: "",
        email: "demo@example.com"
    };
    storeUserData(demoUser);
    showRouterScreen(demoUser);
    checkForNewPatchNotes(); // Check after login
}

function storeUserData(userData) {
    try {
        const dataToStore = {
            ...userData,
            loginTime: new Date().toISOString()
        };
        localStorage.setItem('user', JSON.stringify(dataToStore));
    } catch (error) {
        console.error('Failed to store user ', error);
    }
}

function showRouterScreen(userData) {
    const userNameEl = document.getElementById('user-name');
    const userImageEl = document.getElementById('user-image'); // This element is now hidden/removed
    if (userNameEl) userNameEl.textContent = userData.name || 'User';
    // if (userImageEl && userData.picture) {
    //     userImageEl.src = userData.picture;
    // }
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('router-screen').classList.remove('hidden');
    renderModelsGrid();
    checkForNewPatchNotes(); // Initial check on screen show
}

function handleSignOut() {
    try {
        localStorage.removeItem('user');
    } catch (error) {
        console.error('Failed to clear user ', error);
    }
    document.getElementById('router-screen').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
}

function showError(message = "Login failed. Please try again.") {
    const errorEl = document.getElementById('login-error');
    const errorText = errorEl.querySelector('span');
    if (errorText) errorText.textContent = message;
    errorEl.classList.remove('hidden');
}

function hideError() {
    document.getElementById('login-error').classList.add('hidden');
}

// Initialize the app
function initializeApp() {
    initializeDarkMode();
    try {
        const userData = localStorage.getItem('user');
        if (userData) {
            const user = JSON.parse(userData);
            showRouterScreen(user);
        }
    } catch (error) {
        console.error('Failed to load user ', error);
        localStorage.removeItem('user');
    }
    // Event listeners
    document.getElementById('signout-btn').addEventListener('click', handleSignOut);
    document.getElementById('demo-login').addEventListener('click', handleDemoLogin);
    document.getElementById('theme-toggle').addEventListener('click', toggleDarkMode);
    document.getElementById('dashboard-toggle').addEventListener('click', toggleDashboard);
    document.getElementById('add-model-tab').addEventListener('click', showAddModelModal);
    // New buttons
    document.getElementById('live-comparison-btn').addEventListener('click', () => openModel('https://lmarena.ai/'));
    document.getElementById('benchmarks-btn').addEventListener('click', () => openModel('https://livebench.ai/#/'));
    // Patch Notes
    document.getElementById('patch-notes-toggle').addEventListener('click', togglePatchNotesPanel);
    document.getElementById('close-patch-notes').addEventListener('click', closePatchNotesPanel);
    // Click outside to close patch notes
    document.addEventListener('click', (e) => {
        const panel = document.getElementById('patch-notes-panel');
        const toggleButton = document.getElementById('patch-notes-toggle');
        if (isPatchNotesPanelOpen && !panel.contains(e.target) && !toggleButton.contains(e.target)) {
            closePatchNotesPanel();
        }
    });
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.altKey && !isNaN(e.key) && e.key >= '1' && e.key <= '8') {
            e.preventDefault();
            const model = models[parseInt(e.key) - 1];
            if (model) openModel(model.url);
        }
        // Close patch notes with Escape key
        if (e.key === 'Escape' && isPatchNotesPanelOpen) {
            closePatchNotesPanel();
        }
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Global functions for callbacks
window.handleCredentialResponse = handleCredentialResponse;
window.showTooltip = showTooltip;
window.hideTooltip = hideTooltip;
window.openModel = openModel;
window.addDashboardTab = addDashboardTab;
window.removeDashboardTab = removeDashboardTab;
window.switchDashboardTab = switchDashboardTab;
window.closeModal = closeModal;