// State management
let isDarkMode = localStorage.getItem('darkMode') === 'true';
let dashboardTabs = [];
let isPatchNotesPanelOpen = false;
let lastSeenPatchNoteId = parseInt(localStorage.getItem('lastSeenPatchNoteId')) || 0;
let savedPrompts = [];
const PROMPT_STORAGE_KEY = 'llmRouterPrompts';

const bubbleGradients = {
    'green': 'linear-gradient(135deg, #10b981 0%, #059669 100%)', // Emerald 500 -> 600
    'blue': 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',  // Blue 500 -> 700
    'orange': 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)', // Orange 500 -> 700
    'purple': 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)', // Purple 500 -> 700
    'indigo': 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)', // Indigo 500 -> 700
    'gray': 'linear-gradient(135deg, #6b7280 0%, #374151 100%)',   // Gray 500 -> 600
    'teal': 'linear-gradient(135deg, #0d9488 0%, #115e59 100%)',   // Teal 600 -> 800
    'pink': 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',   // Pink 500 -> 700
    // Add more if needed
};

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

function generateSimpleUUID() {
    // Public Domain/MIT License - https://stackoverflow.com/a/2117523
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
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

// --- Function to create the starfield background ---
function createStarfield() {
    const starContainer = document.getElementById('starfield-layer');
    if (!starContainer) {
        console.warn("Starfield layer not found.");
        return;
    }

    // Clear existing stars (if any, e.g., on re-runs)
    starContainer.innerHTML = '';

    // Get viewport dimensions
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

    // Decide number of stars based on screen size (roughly 1 star per 100px^2)
    const density = 0.0001; // Stars per pixel
    const numStars = Math.floor(vw * vh * density);

    console.log(`Creating approximately ${numStars} stars for ${vw}x${vh} viewport.`);

    for (let i = 0; i < numStars; i++) {
        const star = document.createElement('div');
        star.classList.add('absolute', 'rounded-full', 'bg-white'); // Basic white dot

        // Random position
        const left = Math.random() * 100; // Percentage
        const top = Math.random() * 100;  // Percentage
        star.style.left = `${left}%`;
        star.style.top = `${top}%`;

        // Random size (0.5px to 2px)
        const size = Math.random() * 1.5 + 0.5;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;

        // Random opacity (0.2 to 0.8) for subtle variation
        const opacity = Math.random() * 0.6 + 0.2;
        star.style.opacity = opacity;

        // Optional: Very subtle twinkle animation (individual stars)
        // Uncomment the next lines if you want individual star twinkling
        /*
        const duration = Math.random() * 5 + 3; // 3s to 8s
        const delay = Math.random() * 5; // 0s to 5s delay
        star.style.animation = `twinkle ${duration}s ease-in-out ${delay}s infinite alternate`;
        */

        starContainer.appendChild(star);
    }
}

// --- Function to handle cursor glow parallax ---
function setupCursorGlowParallax() {
    console.log("--- Initializing Cursor Glow Parallax ---");
    const glowElement = document.getElementById('cursor-glow');
    if (!glowElement) {
        console.error("ERROR: Cursor glow element (#cursor-glow) not found in the DOM!");
        return;
    }
    console.log("SUCCESS: Found cursor glow element.");

    let ticking = false;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    const lerpFactor = 0.08; // Slightly slower for a more subtle effect

    function onMouseMove(e) {
        // Get the dimensions of the viewport
        const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
        const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

        // Calculate the cursor position as a percentage (0 to 1) within the viewport
        const cursorPercentX = e.clientX / vw;
        const cursorPercentY = e.clientY / vh;

        // Calculate the target position for the glow:
        // It should move 10% of the cursor's distance across the viewport.
        // If the cursor is at 100% (right edge), the glow's center should be at 10% of the viewport width from the left edge.
        targetX = cursorPercentX * vw * 0.9;
        targetY = cursorPercentY * vh * 0.9;

        // console.log("Cursor %:", cursorPercentX.toFixed(2), cursorPercentY.toFixed(2), "Target:", targetX.toFixed(2), targetY.toFixed(2)); // Debug

        if (!ticking) {
            window.requestAnimationFrame(updateGlowPosition);
            ticking = true;
        }
    }

    function updateGlowPosition() {
        // Simple linear interpolation for smooth movement
        currentX += (targetX - currentX) * lerpFactor;
        currentY += (targetY - currentY) * lerpFactor;

        // Apply the calculated position using translate
        // The element is already centered with -translate-x-1/2 -translate-y-1/2
        glowElement.style.transform = `translate(${currentX}px, ${currentY}px)`;
        // console.log("Glow position updated:", currentX.toFixed(2), currentY.toFixed(2)); // Debug

        // Continue updating if not close enough to target
        const dx = Math.abs(targetX - currentX);
        const dy = Math.abs(targetY - currentY);
        if (dx > 0.1 || dy > 0.1) { // Tighter threshold for smoother stop
            window.requestAnimationFrame(updateGlowPosition);
        } else {
            ticking = false;
        }
    }

    // Attach the mouse move listener
    document.addEventListener('mousemove', onMouseMove);

    // Optional: Hide glow when mouse leaves window
    document.addEventListener('mouseleave', () => {
        glowElement.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
        glowElement.style.opacity = ''; // Reset to CSS opacity
    });

    console.log("--- Cursor Glow Parallax setup complete ---");
}
// --- End Cursor Glow Function ---

// Load prompts from localStorage
function loadSavedPrompts() {
    try {
        const data = localStorage.getItem(PROMPT_STORAGE_KEY);
        if (data) {
            savedPrompts = JSON.parse(data);
            // Basic validation
            if (!Array.isArray(savedPrompts)) {
                console.warn('Saved prompts data is not an array, resetting.');
                savedPrompts = [];
            }
        } else {
            savedPrompts = []; // Initialize as empty array if no data
        }
    } catch (error) {
        console.error('Failed to load saved prompts:', error);
        savedPrompts = []; // Reset on error
    }
    console.log('Loaded prompts:', savedPrompts); // Debug
}

// --- Revised renderPromptLibrary function with null checks ---
function renderPromptLibrary() {
    console.log("--- renderPromptLibraryFixed called ---");
    
    const container = document.getElementById('prompt-list-content');
    if (!container) {
        console.error("Container not found");
        return;
    }

    // Handle the missing no-prompts-message element by recreating it if needed
    let noPromptsMessage = document.getElementById('no-prompts-message');
    if (!noPromptsMessage) {
        console.log("no-prompts-message element missing, recreating it");
        
        const modalContent = container.parentElement;
        if (modalContent) {
            noPromptsMessage = document.createElement('div');
            noPromptsMessage.id = 'no-prompts-message';
            noPromptsMessage.className = 'text-center text-gray-500 dark:text-gray-400 p-4 hidden';
            noPromptsMessage.textContent = 'No prompts saved yet.';
            modalContent.insertBefore(noPromptsMessage, container);
        }
    }

    if (savedPrompts.length === 0) {
        container.innerHTML = '';
        if (noPromptsMessage) {
            noPromptsMessage.classList.remove('hidden');
        }
        return;
    }

    console.log(`Rendering ${savedPrompts.length} prompts`);
    if (noPromptsMessage) {
        noPromptsMessage.classList.add('hidden');
    }

    const sortedPrompts = [...savedPrompts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    container.innerHTML = sortedPrompts.map(prompt => {
        const previewContent = prompt.content.length > 100 ? prompt.content.substring(0, 100) + '...' : prompt.content;
        const formattedDate = new Date(prompt.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

        return `
            <div class="prompt-item p-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150 rounded-lg" data-prompt-id="${prompt.id}">
                <div class="flex justify-between items-start">
                    <div class="flex-1 min-w-0">
                        <div class="flex items-baseline">
                            <h4 class="font-semibold text-gray-800 dark:text-gray-200 truncate">${prompt.title}</h4>
                            ${prompt.tag ? `<span class="ml-2 text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">${prompt.tag}</span>` : ''}
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">${previewContent}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-500 mt-2">${formattedDate}</p>
                    </div>
                    <div class="flex items-center space-x-1">
                        <button class="edit-prompt-btn p-1 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 rounded transition duration-150" data-prompt-id="${prompt.id}" aria-label="Edit prompt">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                        </button>
                        <button class="delete-prompt-btn p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded transition duration-150" data-prompt-id="${prompt.id}" aria-label="Delete prompt">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="mt-2 flex justify-end">
                    <button class="copy-prompt-btn px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition duration-200 flex items-center" data-prompt-content="${encodeURIComponent(prompt.content)}">
                        <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                        </svg>
                        Copy
                    </button>
                </div>
            </div>
        `;
    }).join('');

    // Re-attach event listeners
    container.querySelectorAll('.delete-prompt-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const promptId = e.currentTarget.dataset.promptId;
            deletePrompt(promptId);
        });
    });

    // NEW: Edit button event listeners
    container.querySelectorAll('.edit-prompt-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const promptId = e.currentTarget.dataset.promptId;
            editPrompt(promptId);
        });
    });

    container.querySelectorAll('.copy-prompt-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const encodedContent = e.currentTarget.dataset.promptContent;
            const content = decodeURIComponent(encodedContent);
            copyTextToClipboard(content, e.currentTarget);
        });
    });

    console.log("--- renderPromptLibraryFixed completed successfully ---");
}

// Edit prompt function
function editPrompt(promptId) {
    const prompt = savedPrompts.find(p => p.id === promptId);
    if (!prompt) {
        console.error('Prompt not found for editing:', promptId);
        return;
    }

    showEditPromptModal(prompt);
}

// Edit prompt modal
function showEditPromptModal(prompt) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70]'; // Higher than delete modal
    
    modal.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100">Edit Prompt</h3>
                <button id="close-edit-modal" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            
            <form id="edit-prompt-form" class="space-y-4">
                <div>
                    <label for="edit-prompt-title" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                    <input type="text" id="edit-prompt-title" value="${prompt.title}" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" required>
                </div>
                
                <div>
                    <label for="edit-prompt-content" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content</label>
                    <textarea id="edit-prompt-content" rows="8" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-vertical" required>${prompt.content}</textarea>
                </div>
                
                <div>
                    <label for="edit-prompt-tag" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tag (Optional)</label>
                    <input type="text" id="edit-prompt-tag" value="${prompt.tag || ''}" list="model-tags" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" placeholder="e.g., Claude, GPT-4, Writing">
                </div>
                
                <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <button type="button" id="cancel-edit" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition duration-200">
                        Cancel
                    </button>
                    <button type="submit" id="save-edit" class="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition duration-200">
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    `;

    // Get form elements
    const form = modal.querySelector('#edit-prompt-form');
    const titleInput = modal.querySelector('#edit-prompt-title');
    const contentInput = modal.querySelector('#edit-prompt-content');
    const tagInput = modal.querySelector('#edit-prompt-tag');
    const saveButton = modal.querySelector('#save-edit');
    const cancelButton = modal.querySelector('#cancel-edit');
    const closeButton = modal.querySelector('#close-edit-modal');

    // Close modal function
    const closeModal = () => {
        if (document.body.contains(modal)) {
            document.body.removeChild(modal);
        }
    };

    // Event listeners
    closeButton.addEventListener('click', closeModal);
    cancelButton.addEventListener('click', closeModal);

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Close on Escape key
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);

    // Handle form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const newTitle = titleInput.value.trim();
        const newContent = contentInput.value.trim();
        const newTag = tagInput.value.trim();

        if (!newTitle || !newContent) {
            alert('Title and content are required.');
            return;
        }

        // Show saving state
        saveButton.disabled = true;
        saveButton.innerHTML = 'Saving...';

        // Update the prompt
        const promptIndex = savedPrompts.findIndex(p => p.id === prompt.id);
        if (promptIndex !== -1) {
            savedPrompts[promptIndex] = {
                ...savedPrompts[promptIndex],
                title: newTitle,
                content: newContent,
                tag: newTag,
                updatedAt: new Date().toISOString()
            };

            savePrompts();
            
            // Close modal and refresh the list
            closeModal();
            
            setTimeout(() => {
                renderPromptLibrary();
            }, 100);

            console.log('Prompt updated:', savedPrompts[promptIndex]);
        }
    });

    // Add to DOM and focus title input
    document.body.appendChild(modal);
    titleInput.focus();
    titleInput.select(); // Select all text for easy editing
}

// Save prompts to localStorage
function savePrompts() {
    try {
        localStorage.setItem(PROMPT_STORAGE_KEY, JSON.stringify(savedPrompts));
        console.log('Prompts saved to localStorage'); // Debug
    } catch (error) {
        console.error('Failed to save prompts:', error);
        // TODO: Optionally, show an error message to the user
        alert('Failed to save prompt. Storage might be full.');
    }
}

// --- Revised confirmSavePrompt function: Update UI before hiding form ---
function confirmSavePrompt() {
    const titleInput = document.getElementById('prompt-title-input');
    const contentInput = document.getElementById('prompt-content-input');
    const tagInput = document.getElementById('prompt-tag-input');

    const title = titleInput.value;
    const content = contentInput.value;
    const tag = tagInput.value;

    const saveButton = document.getElementById('confirm-save-prompt');
    const originalButtonHTML = saveButton.innerHTML;

    saveButton.disabled = true;
    saveButton.innerHTML = `
        <svg class="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Saving...
    `;

    const result = addPrompt(title, content, tag);

    if (result.success) {
        // Clear form inputs
        titleInput.value = '';
        contentInput.value = '';
        tagInput.value = '';

        // Show success state
        saveButton.innerHTML = `
            <svg class="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Saved!
        `;

        // Use the fixed render function that handles missing no-prompts-message
        setTimeout(() => {
            renderPromptLibrary();
        }, 100);

        // Schedule UI cleanup
        setTimeout(() => {
            document.getElementById('save-prompt-section').classList.add('hidden');
            saveButton.disabled = false;
            saveButton.innerHTML = originalButtonHTML;
            
            const listContainer = document.getElementById('prompt-list-container');
            if (listContainer) {
                listContainer.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }, 200);

    } else {
        alert(result.message || 'Failed to save prompt.');
        saveButton.disabled = false;
        saveButton.innerHTML = originalButtonHTML;
    }
}
// --- End Revised confirmSavePrompt ---

// Add a new prompt
function addPrompt(title, content, tag = '') {
    if (!title.trim() || !content.trim()) {
        return { success: false, message: 'Title and content are required.' };
    }

    try {
        const newPrompt = {
            id: generateSimpleUUID(),
            title: title.trim(),
            content: content.trim(),
            tag: tag.trim(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        savedPrompts.unshift(newPrompt);
        savePrompts(); // Save to localStorage
        console.log('Prompt added and saved:', newPrompt);

        // Return success. UI update is handled by the caller (e.g., confirmSavePrompt).
        return { success: true, message: 'Prompt saved successfully!', prompt: newPrompt };

    } catch (error) {
        console.error("Error inside addPrompt logic:", error);
        return { success: false, message: 'An error occurred while saving the prompt.' };
    }
}

// Delete a prompt by ID
function deletePrompt(promptId) {
    const prompt = savedPrompts.find(p => p.id === promptId);
    if (!prompt) return;

    showCustomConfirmDialog({
        title: 'Delete Prompt',
        message: `Are you sure you want to delete "${prompt.title}"?`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        confirmClass: 'bg-red-500 hover:bg-red-600 text-white',
        onConfirm: () => {
            savedPrompts = savedPrompts.filter(p => p.id !== promptId);
            savePrompts();
            renderPromptLibrary(); // Use your working render function
            console.log('Prompt deleted:', promptId);
        }
    });
}

// Custom confirmation dialog function
function showCustomConfirmDialog({ title, message, confirmText = 'Confirm', cancelText = 'Cancel', confirmClass = 'bg-blue-500 hover:bg-blue-600 text-white', onConfirm, onCancel }) {
    // Create modal backdrop
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]'; // Higher z-index than prompt library
    
    // Create modal content
    modal.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div class="flex items-center mb-4">
                <div class="bg-red-100 dark:bg-red-900/20 rounded-full p-2 mr-3">
                    <svg class="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">${title}</h3>
            </div>
            <p class="text-gray-700 dark:text-gray-300 mb-6">${message}</p>
            <div class="flex space-x-3 justify-end">
                <button id="cancel-btn" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition duration-200 font-medium">
                    ${cancelText}
                </button>
                <button id="confirm-btn" class="px-4 py-2 ${confirmClass} rounded-lg transition duration-200 font-medium">
                    ${confirmText}
                </button>
            </div>
        </div>
    `;

    // Add event listeners
    const cancelBtn = modal.querySelector('#cancel-btn');
    const confirmBtn = modal.querySelector('#confirm-btn');

    cancelBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
        if (onCancel) onCancel();
    });

    confirmBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
        if (onConfirm) onConfirm();
    });

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
            if (onCancel) onCancel();
        }
    });

    // Close on Escape key
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            document.body.removeChild(modal);
            document.removeEventListener('keydown', handleEscape);
            if (onCancel) onCancel();
        }
    };
    document.addEventListener('keydown', handleEscape);

    // Add to DOM
    document.body.appendChild(modal);

    // Focus the confirm button for better UX
    confirmBtn.focus();
}


// Helper function to copy text and provide visual feedback
function copyTextToClipboard(text, buttonElement) {
    navigator.clipboard.writeText(text).then(() => {
        // Provide visual feedback
        const originalHTML = buttonElement.innerHTML;
        buttonElement.innerHTML = `
            <svg class="w-3 h-3 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Copied!
        `;
        setTimeout(() => {
            buttonElement.innerHTML = originalHTML;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        alert('Failed to copy text to clipboard.');
    });
}


// Populate the datalist for tags with model names
function populateModelTagsDatalist() {
    const datalist = document.getElementById('model-tags');
    if (!datalist) return;

    // Get unique model names from the models array
    const uniqueModelNames = [...new Set(models.map(model => model.name))];

    datalist.innerHTML = uniqueModelNames.map(name => `<option value="${name}">`).join('');
}

// --- Prompt Library Modal Functions ---

let isPromptLibraryOpen = false;

function togglePromptLibrary() {
    const modal = document.getElementById('prompt-library-modal');
    isPromptLibraryOpen = !isPromptLibraryOpen;
    if (isPromptLibraryOpen) {
        modal.classList.remove('hidden');
        renderPromptLibrary(); // Render prompts when opening
        populateModelTagsDatalist(); // Populate tags dropdown
    } else {
        modal.classList.add('hidden');
        // Hide the save form if it was open
        document.getElementById('save-prompt-section').classList.add('hidden');
        // Clear inputs
        document.getElementById('prompt-title-input').value = '';
        document.getElementById('prompt-content-input').value = '';
        document.getElementById('prompt-tag-input').value = '';
    }
}

function closePromptLibrary() {
    isPromptLibraryOpen = false;
    document.getElementById('prompt-library-modal').classList.add('hidden');
     // Hide the save form if it was open
     document.getElementById('save-prompt-section').classList.add('hidden');
     // Clear inputs
     document.getElementById('prompt-title-input').value = '';
     document.getElementById('prompt-content-input').value = '';
     document.getElementById('prompt-tag-input').value = '';
}

// Show the "Save Prompt" form section within the modal
function showSavePromptForm() {
    document.getElementById('save-prompt-section').classList.remove('hidden');
    // Scroll the modal content to the save form
    const modalContent = document.getElementById('prompt-library-modal').querySelector('.flex-col'); // Adjust selector if needed
    if (modalContent) {
        modalContent.scrollTop = modalContent.scrollHeight;
    }
    // TODO: Optionally, pre-fill content here if you have a way to get it (e.g., from a specific dashboard tab/input)
    // For now, it's left for the user to paste/type.
}

// Cancel saving a new prompt
function cancelSavePrompt() {
    document.getElementById('save-prompt-section').classList.add('hidden');
    // Clear inputs
    document.getElementById('prompt-title-input').value = '';
    document.getElementById('prompt-content-input').value = '';
    document.getElementById('prompt-tag-input').value = '';
}




// --- End Prompt Library Modal Functions ---

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
// --- Simplified createModelCard function for standard grid ---
function createModelCard(model, index) {
    // Determine bubble size (you can keep the cycling logic or use a fixed size)
    const sizeSequence = [
        'size-medium', 'size-small', 'size-large',
        'size-small', 'size-large', 'size-medium',
        'size-large', 'size-small',
        // Add more if you have more models, or it will cycle
    ];

    // Determine bubble size based on the predefined sequence
    // If more models than sequence items, cycle through the sequence
    let sizeClass;
    if (index < sizeSequence.length) {
        sizeClass = sizeSequence[index];
    } else {
        // Fallback: cycle through the last few sizes or a default pattern
        // Example: Cycle the last 3 items of the sequence
        const cycleLength = Math.min(3, sizeSequence.length);
        const startIndex = sizeSequence.length - cycleLength;
        const cycleIndex = (index - sizeSequence.length) % cycleLength;
        sizeClass = sizeSequence[startIndex + cycleIndex];
        // Or, simpler fallback: just cycle the original sizes
        // const fallbackSizes = ['size-large', 'size-medium', 'size-small'];
        // sizeClass = fallbackSizes[index % fallbackSizes.length];
    }

    // Get the appropriate gradient
    const gradient = bubbleGradients[model.color] || bubbleGradients['gray'];

    return `
        <div class="model-bubble-wrapper" data-model-id="${model.id}">
            <!-- Bubbly Model Card -->
            <div class="model-bubble ${sizeClass}"
                 style="--bubble-gradient: ${gradient};" 
                 data-model-id="${model.id}"
                 onmouseenter="showTooltip(event, '${model.id}')"
                 onmouseleave="hideTooltip()">
                
                <!-- Content (Icon and Text) -->
                <div class="bubble-content">
                    <!-- Icon -->
                    <div class="mb-2 flex justify-center"> 
                        <svg class="w-8 h-8 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]" viewBox="0 0 24 24" fill="currentColor">
                            <path d="${model.icon}"/>
                        </svg>
                    </div>
                    <!-- Model Name -->
                    <div class="model-name">${model.name}</div>
                    <!-- Model Description/Company -->
                    <div class="model-description">${model.company}</div>
                </div>
            </div>

            <!-- External Learn More Button (Optional, below bubble) -->
            <button onclick="openModel('${model.info_url}')" class="mt-3 px-3 py-1 text-xs bg-white/10 hover:bg-white/20 text-white rounded-lg transition duration-200 flex items-center border border-white/10 backdrop-blur-sm z-10">
                <svg class="w-3 h-3 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
                <span class="truncate">Learn More</span>
            </button>
        </div>
    `;
}
// --- End Simplified createModelCard ---

// --- New Function: Draw Network Lines ---
// --- Revised Function: Draw Network Lines (v4 - With Debugging) ---
// --- Revised drawNetworkLines function for standard grid ---
function drawNetworkLines() {
    const svgContainer = document.getElementById('network-lines');
    const svg = svgContainer?.querySelector('svg');
    
    if (!svgContainer || !svg) {
        console.warn("Network lines SVG container or SVG not found.");
        return;
    }

    // Clear any existing lines
    svg.innerHTML = '';

    // --- Crucial: Set SVG viewBox and size to match its container ---
    const containerRect = svgContainer.getBoundingClientRect();
    svg.setAttribute('width', containerRect.width);
    svg.setAttribute('height', containerRect.height);
    svg.setAttribute('viewBox', `0 0 ${containerRect.width} ${containerRect.height}`);
    svg.style.position = 'absolute';
    svg.style.top = '0';
    svg.style.left = '0';

    // Get all model bubbles
    const modelBubbles = document.querySelectorAll('.model-bubble');
    
    if (modelBubbles.length < 2) {
        console.log("Not enough bubbles to draw lines.");
        return;
    }

    // --- Store positions by measuring rendered elements ---
    const nodes = [];

    modelBubbles.forEach(bubble => {
        const rect = bubble.getBoundingClientRect();
        // Calculate center relative to the SVG container's top-left
        const centerX = rect.left + rect.width / 2 - containerRect.left;
        const centerY = rect.top + rect.height / 2 - containerRect.top;
        nodes.push({ element: bubble, cx: centerX, cy: centerY, id: bubble.dataset.modelId });
    });

    // --- Connect nodes based on grid adjacency ---
    // We need to figure out the grid structure.
    // A simple way: connect nodes that are close horizontally or vertically.
    
    // 1. Sort nodes by Y then X to guess row/column order (helps if CSS grid is regular)
    nodes.sort((a, b) => {
        if (Math.abs(a.cy - b.cy) < 30) { // If Y coords are close (within 30px), sort by X
            return a.cx - b.cx;
        }
        return a.cy - b.cy; // Otherwise, sort by Y
    });

    // 2. Determine approximate grid dimensions
    const uniqueYs = [...new Set(nodes.map(n => Math.round(n.cy)))].sort((a, b) => a - b);
    const uniqueXs = [...new Set(nodes.map(n => Math.round(n.cx)))].sort((a, b) => a - b);
    const numRows = uniqueYs.length;
    const numCols = uniqueXs.length;
    
    console.log(`Estimated Grid: ${numRows} rows, ${numCols} cols`);

    // 3. Connect adjacent nodes (simplistic grid connection)
    // Find horizontal and vertical neighbors based on sorted order and proximity
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const nodeA = nodes[i];
            const nodeB = nodes[j];
            
            const dx = Math.abs(nodeA.cx - nodeB.cx);
            const dy = Math.abs(nodeA.cy - nodeB.cy);

            // Connect if:
            // 1. They are on the same row (Y close) and adjacent columns (X gap is reasonable)
            // 2. They are in the same column (X close) and adjacent rows (Y gap is reasonable)
            
            // Estimate average horizontal/vertical spacing
            const avgHSpacing = numCols > 1 ? (Math.max(...uniqueXs) - Math.min(...uniqueXs)) / (numCols - 1) : 100;
            const avgVSpacing = numRows > 1 ? (Math.max(...uniqueYs) - Math.min(...uniqueYs)) / (numRows - 1) : 100;
            
            const hThreshold = avgHSpacing * 1.2; // Allow for some variation
            const vThreshold = avgVSpacing * 1.2;

            if ((Math.abs(dy) < 20 && dx < hThreshold && dx > 10) || // Horizontal neighbor
                (Math.abs(dx) < 20 && dy < vThreshold && dy > 10)) {  // Vertical neighbor
                 
                console.log(`Connecting node ${i} (${nodeA.id}) to node ${j} (${nodeB.id})`);
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', nodeA.cx);
                line.setAttribute('y1', nodeA.cy);
                line.setAttribute('x2', nodeB.cx);
                line.setAttribute('y2', nodeB.cy);
                
                // --- Style lines ---
                line.setAttribute('stroke', '#ffffff');
                line.setAttribute('stroke-width', '1');
                line.setAttribute('stroke-opacity', '0.3'); // Subtle
                // line.setAttribute('stroke-dasharray', '2,4'); // Optional: dashed
                
                svg.appendChild(line);
            }
        }
    }

    console.log("Network lines drawn for", nodes.length, "nodes in grid layout");
}
// --- End Revised drawNetworkLines ---

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
    if (!grid) return; // Safety check

    // Populate grid HTML
    grid.innerHTML = models.map((model, index) => createModelCard(model, index)).join('');

    // --- Apply Scattering and Interactions after elements are in the DOM ---
    requestAnimationFrame(() => {
        setupBubbleInteractions(); // Setup mousemove and click effects
        //drawNetworkLines(); // Draw lines after bubbles are positioned
    });
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
        console.log("Google ID Token for backend testing:", response.credential);
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


// Setup mouse move parallax and click ripple effects
function setupBubbleInteractions() {
    const container = document.getElementById('models-grid');
    if (!container) return;

    // Mouse Move Parallax
    container.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        const bubbles = container.querySelectorAll('.model-bubble');
        bubbles.forEach(bubble => {
            const rect = bubble.getBoundingClientRect();
            const bubbleCenterX = rect.left + rect.width / 2;
            const bubbleCenterY = rect.top + rect.height / 2;

            const deltaX = mouseX - bubbleCenterX;
            const deltaY = mouseY - bubbleCenterY;

            // Determine intensity based on size
            let intensity = 0.02;
            if (bubble.classList.contains('size-large')) intensity = 0.03;
            if (bubble.classList.contains('size-small')) intensity = 0.015;

            const moveX = deltaX * intensity;
            const moveY = deltaY * intensity;

            // Get current transform (if any) and apply additional translate
            // This is a simplified approach, might conflict with scattering transform on wrapper
            // Better to apply to the wrapper or use a more complex transform string parser
            // For now, let's just apply it directly, assuming scattering is done on wrapper
            bubble.style.transform = `translate(${moveX}px, ${moveY}px) scale(${bubble.classList.contains('size-large') ? 1 : bubble.classList.contains('size-small') ? 1 : 1})`; // Keep scale consistent or adjust
            // Note: This simple replacement might override the absolute positioning.
            // A better way is to calculate the combined transform.
            // Let's refine this:
            const currentTransform = bubble.style.transform || 'translate(0px, 0px)'; // Default if none
            // Extract translate if it exists, or just append
            // This is complex; let's simplify by applying parallax to the wrapper instead.
            // However, the wrapper already has scattering. Let's apply parallax relative to its scattered position.
            
            // Simpler: Just apply a small translate on top of existing absolute positioning
            // The bubble is absolutely positioned, so translate moves it relative to that position.
            // We need to get the wrapper's position to calculate correctly.
            const wrapper = bubble.parentElement;
            if (wrapper) {
                 const wrapperRect = wrapper.getBoundingClientRect();
                 const wrapperCenterX = wrapperRect.left + wrapperRect.width / 2;
                 const wrapperCenterY = wrapperRect.top + wrapperRect.height / 2;
                 const deltaWrapperX = mouseX - wrapperCenterX;
                 const deltaWrapperY = mouseY - wrapperCenterY;
                 const moveWrapperX = deltaWrapperX * intensity * 0.5; // Weaker effect on wrapper
                 const moveWrapperY = deltaWrapperY * intensity * 0.5;
                 // Apply to wrapper's transform (which holds the scattering)
                 const scatterTransform = wrapper.style.transform || '';
                 // This is getting complex to manage two transforms.
                 // Let's stick to applying it to the bubble itself, assuming it's the primary visual element.
                 // The risk is it might conflict with absolute positioning if not careful.
                 // Let's assume absolute positioning is set by left/top (it's not here, it's centered by flex in wrapper)
                 // So, translate should work relatively fine.
                 bubble.style.transform = `translate(${moveX}px, ${moveY}px)`; 
                 // Re-apply scale if needed from hover
                 if (bubble.matches(':hover')) {
                     bubble.style.transform += ' scale(1.08)';
                 } else {
                     // Check base scale class if needed, but float animation handles base transform
                     // Let's rely on the CSS animation for base float and just add mouse move offset
                     // The CSS `animation` property will conflict with `style.transform`.
                     // We need to use a different approach or disable the CSS animation on mousemove.
                 }
            }
            
        });
    });

    // Reset parallax on mouse leave
    container.addEventListener('mouseleave', () => {
        const bubbles = container.querySelectorAll('.model-bubble');
        bubbles.forEach(bubble => {
            // Reset inline transform style to allow CSS animation to take over
            bubble.style.transform = '';
        });
    });

    // Click Ripple Effect
    container.addEventListener('click', (e) => {
        // Check if a bubble was clicked
        const bubble = e.target.closest('.model-bubble');
        if (bubble) {
            // 1. Handle the click action (open model)
            const modelId = bubble.dataset.modelId;
            const model = models.find(m => m.id === modelId);
            if (model) {
                 e.preventDefault();
                 e.stopPropagation();
                 openModel(model.url); // Or info_url if that's preferred
            }

            // 2. Create and animate the ripple
            const ripple = document.createElement('div');
            ripple.classList.add('ripple');
            // Style the ripple
            Object.assign(ripple.style, {
                position: 'absolute',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.3)',
                transform: 'scale(0)',
                animation: 'ripple 0.6s linear forwards', // Use forwards to keep final state
                left: '50%',
                top: '50%',
                width: '0',
                height: '0',
                marginLeft: '0',
                marginTop: '0',
                pointerEvents: 'none',
                zIndex: '3' // Above content
            });
            
            bubble.appendChild(ripple);

            // Remove ripple element after animation
            ripple.addEventListener('animationend', () => {
                ripple.remove();
            });
        }
    });
    
    // Ensure the ripple animation is defined in the document
    if (!document.querySelector('#ripple-animation-style')) {
        const style = document.createElement('style');
        style.id = 'ripple-animation-style';
        style.textContent = `
            @keyframes ripple {
                to {
                    transform: translate(-50%, -50%) scale(4); /* Scale relative to center */
                    opacity: 0;
                }
            }
            .ripple {
                /* Ensure the animation is applied correctly */
                 transform-origin: center; /* Explicit origin */
            }
        `;
        document.head.appendChild(style);
    }
}

// --- End New Functions ---

// Initialize the app
function initializeApp() {
    initializeDarkMode();
    loadSavedPrompts(); // --- NEW: Load prompts on startup ---
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
    
    // --- Initialize Parallax Background ---
    createStarfield(); // Generate stars
    setupCursorGlowParallax(); // Setup cursor tracking
    // --- End Parallax Background Init ---
    
    // Event listeners
    document.getElementById('signout-btn').addEventListener('click', handleSignOut);
    document.getElementById('demo-login').addEventListener('click', handleDemoLogin);
    document.getElementById('theme-toggle').addEventListener('click', toggleDarkMode);
    document.getElementById('dashboard-toggle').addEventListener('click', toggleDashboard);
    document.getElementById('add-model-tab').addEventListener('click', showAddModelModal);
    // --- NEW: Add Prompt Library Event Listeners ---
    document.getElementById('prompt-library-toggle').addEventListener('click', togglePromptLibrary);
    document.getElementById('close-prompt-library').addEventListener('click', closePromptLibrary);
    document.getElementById('show-save-prompt-form').addEventListener('click', showSavePromptForm);
    document.getElementById('cancel-save-prompt').addEventListener('click', cancelSavePrompt);
    document.getElementById('confirm-save-prompt').addEventListener('click', confirmSavePrompt);
    // Click outside to close prompt library
    document.getElementById('prompt-library-modal').addEventListener('click', (e) => {
        if (e.target.id === 'prompt-library-modal') { // Check if click was directly on the backdrop
             closePromptLibrary();
        }
    });
    // Close prompt library with Escape key
    document.addEventListener('keydown', (e) => {
        // ... (existing Escape key logic for patch notes) ...
        if (e.key === 'Escape') { // Simplified check
             if (isPatchNotesPanelOpen) {
                 closePatchNotesPanel();
             }
             if (isPromptLibraryOpen) { // --- NEW: Close on Escape ---
                 closePromptLibrary();
             }
        }
    });
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

