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
// --- Updated createModelCard with an extra glassmorphic bubble --- //
// createModelCard.js — polished, glass-bubble buttons
function createModelCard(model, index) {
    /* ---------- 1. Color & gradient mapping ---------- */
    const gradientMap = {
      green:  'from-green-400/40  via-emerald-500/40  to-green-600/55',
      blue:   'from-blue-400/40   via-cyan-500/40    to-blue-600/55',
      orange: 'from-orange-400/40 via-amber-500/40   to-orange-600/55',
      purple: 'from-purple-400/40 via-fuchsia-500/40 to-purple-600/55',
      indigo: 'from-indigo-400/40 via-violet-500/40 to-indigo-600/55',
      gray:   'from-gray-400/40   via-zinc-500/40    to-gray-600/75',
      teal:   'from-teal-400/40   via-sky-500/40     to-teal-600/55',
      pink:   'from-pink-400/40   via-rose-500/40    to-pink-600/55'
    };
    const gradientClasses = gradientMap[model.color] || gradientMap.gray;
  
    /* ---------- 2. Random scattering (unchanged) ---------- */
    const maxXOffset = 45, maxYOffset = 45;
    const seededRandom = a => {
      let t = a + 1;
      for (let i = 0; i < 5; i++) {
        t = Math.sin(t) * 1000;
        t -= Math.floor(t);
      }
      return t;
    };
    const randX  = seededRandom(index * 1.3)  * 2 - 1;
    const randY  = seededRandom(index * 0.7 + 80) * 1.5 - 1;
    const translateX = randX * maxXOffset;
    const translateY = randY * maxYOffset;
    const transformStyle = `transform: translate(${translateX}px, ${translateY}px);`;
  
    /* ---------- 3. Bubble gradient (for the glass orb) ---------- */
    const bubbleGradient = {
      green:'rgba(34,197,94,.12),rgba(16,185,129,.22),transparent',
      blue:'rgba(59,130,246,.12),rgba(6,182,212,.22),transparent',
      orange:'rgba(251,146,60,.12),rgba(245,158,11,.22),transparent',
      purple:'rgba(168,85,247,.12),rgba(217,70,239,.22),transparent',
      indigo:'rgba(99,102,241,.12),rgba(139,92,246,.22),transparent',
      gray:'rgba(156,163,175,.12),rgba(113,113,122,.22),transparent',
      teal:'rgba(20,184,166,.12),rgba(14,165,233,.22),transparent',
      pink:'rgba(236,72,153,.12),rgba(225,29,72,.22),transparent'
    };
    const g = bubbleGradient[model.color] || bubbleGradient.gray;
  
    /* ---------- 4. Mark-up ---------- */
    return `
      <div class="flex flex-col items-center" style="${transformStyle}">
        <!-- Card wrapper -->
        <div class="model-card group relative cursor-pointer
                    transition-all duration-300 ease-out hover:-translate-y-1"
             data-model-id="${model.id}"
             onmouseenter="showTooltip(event,'${model.id}')"
             onmouseleave="hideTooltip()">
  
          <!-- Extra glass bubble (orb) -->
          <span class="absolute inset-0 -z-10 w-44 h-44 m-auto rounded-full
                       backdrop-blur-[20px] border border-white/10
                       bg-[radial-gradient(circle_at_50%_40%,${g})]
                       animate-[drift_12s_ease-in-out_infinite_alternate]">
          </span>
  
          <!-- Glow ring -->
          <div class="absolute inset-3 bg-gradient-to-r ${{
            green:'from-green-400/20 to-emerald-500/20',
            blue:'from-blue-400/30 to-cyan-500/30',
            orange:'from-orange-400/30 to-amber-500/30',
            purple:'from-purple-400/30 to-fuchsia-500/30',
            indigo:'from-indigo-400/30 to-violet-500/30',
            gray:'from-gray-400/30 to-zinc-500/30',
            teal:'from-teal-400/30 to-sky-500/30',
            pink:'from-pink-400/30 to-rose-500/30'
          }[model.color] || 'from-gray-400/20 to-gray-500/20'}
                       rounded-full blur-2xl opacity-60 group-hover:opacity-80
                       transition-opacity duration-500">
          </div>
  
          <!-- Main button -->
          <div class="relative w-32 h-32 flex flex-col items-center justify-center
                      bg-gradient-to-br ${gradientClasses} text-white
                      rounded-full shadow-[0_8px_24px_rgba(0,0,0,.25),inset_0_1px_0_rgba(255,255,255,.15)]
                      border border-white/20
                      group-hover:shadow-[0_12px_32px_rgba(0,0,0,.35),inset_0_1px_0_rgba(255,255,255,.25)]
                      group-hover:scale-[1.05]
                      transition-all duration-300 ease-out">
            <div class="bg-white/10 rounded-full p-2 mb-1 backdrop-blur-[1px]">
              <svg class="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="${model.icon}"/>
              </svg>
            </div>
            <span class="font-sans text-sm font-semibold tracking-tight
                         drop-shadow-[0_1px_2px_rgba(0,0,0,.4)]">
              ${model.name}
            </span>
          </div>
        </div>
  
        <!-- Learn-more link -->
        <button onclick="openModel('${model.info_url}')"
                class="mt-4 px-3 py-1 text-xs
                       bg-brand-red-500/20 hover:bg-brand-red-500/30
                       dark:bg-brand-red-900/20 dark:hover:bg-brand-red-800/30
                       text-brand-red-700 dark:text-brand-red-300
                       rounded-lg flex items-center space-x-1
                       border border-brand-red-500/30 dark:border-brand-red-700/30
                       transition-all duration-200 ease-out
                       hover:scale-105 active:scale-95">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
          </svg>
          <span>Learn More</span>
        </button>
      </div>
    `;
  }

// --- New Function: Draw Network Lines ---
// --- Revised Function: Draw Network Lines (v4 - With Debugging) ---
function drawNetworkLines() {
    console.log("--- drawNetworkLines started ---");
    const svgContainer = document.getElementById('network-lines');
    const svg = svgContainer.querySelector('svg');

    // --- Debugging: Check if container exists and has size ---
    if (!svgContainer) {
        console.error("Error: #network-lines container not found!");
        return;
    }
    const containerRect = svgContainer.getBoundingClientRect();
    console.log("Container Rect:", containerRect);
    if (containerRect.width === 0 || containerRect.height === 0) {
        console.warn("Warning: #network-lines container has zero width or height. Retrying in 100ms...");
        // Retry once after a short delay if container is not sized yet
        setTimeout(drawNetworkLines, 100);
        return;
    }
    // --- End Debugging ---

    // Clear any existing lines
    svg.innerHTML = '';

    // --- Crucial: Set SVG viewBox and size to match its container ---
    svg.setAttribute('width', containerRect.width);
    svg.setAttribute('height', containerRect.height);
    svg.setAttribute('viewBox', `0 0 ${containerRect.width} ${containerRect.height}`);
    svg.style.position = 'absolute';
    svg.style.top = '0';
    svg.style.left = '0';

    // Get all model card *buttons* (the round bubbles)
    const modelButtons = document.querySelectorAll('.model-card > .relative');

    // --- Debugging: Check if model buttons are found ---
    console.log("Found model buttons:", modelButtons.length);
    if (modelButtons.length < 2) {
        console.warn("Not enough model buttons found to draw lines (need at least 2).");
        return;
    }
    // --- End Debugging ---

    // --- Store positions and elements ---
    const nodes = [];

    modelButtons.forEach((button, index) => { // Added index for logging
        const rect = button.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2 - containerRect.left;
        const centerY = rect.top + rect.height / 2 - containerRect.top;
        nodes.push({ element: button, cx: centerX, cy: centerY });
        // --- Debugging: Log individual node positions ---
        console.log(`Node ${index} center: (${centerX.toFixed(2)}, ${centerY.toFixed(2)})`);
        // --- End Debugging ---
    });

    // --- Connect nodes based on proximity (simple horizontal/vertical check) ---
    const threshold = Math.min(containerRect.width, containerRect.height) * 0.3; // 30% of smaller dimension
    console.log("Connection threshold:", threshold.toFixed(2));

    let linesDrawn = 0;
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const nodeA = nodes[i];
            const nodeB = nodes[j];

            // Calculate distance
            const dx = Math.abs(nodeA.cx - nodeB.cx);
            const dy = Math.abs(nodeA.cy - nodeB.cy);

            // Connect if they are close enough horizontally OR vertically
            if (dx < threshold || dy < threshold) { // Simplified connection logic
                console.log(`Connecting node ${i} to node ${j}`); // Debug log
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', nodeA.cx);
                line.setAttribute('y1', nodeA.cy);
                line.setAttribute('x2', nodeB.cx);
                line.setAttribute('y2', nodeB.cy);

                // --- Make lines clearly visible for testing ---
                line.setAttribute('stroke', '#ffffff'); // RED for high visibility
                line.setAttribute('stroke-width', '1');
                line.setAttribute('stroke-opacity', '0.4');
                line.setAttribute('stroke-dasharray', '2,4'); // Dash pattern

                svg.appendChild(line);
                linesDrawn++;
            }
        }
    }

    console.log(`--- drawNetworkLines finished. Lines drawn: ${linesDrawn} ---`);
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
    grid.innerHTML = models.map((model,index) => createModelCard(model, index)).join('');
    // Add click handlers for model cards (opening the model)
    grid.addEventListener('click', handleModelClick);
    console.log("Scheduling drawNetworkLines...");
    requestAnimationFrame(drawNetworkLines);
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
