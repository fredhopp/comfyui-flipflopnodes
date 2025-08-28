// Group Positioner Extension for ComfyUI
// This extension allows positioning a group under the cursor when a shortcut key is pressed

// Wait for ComfyUI to be available
let app = null;

// Function to get the ComfyUI app instance
function getApp() {
    if (app) return app;
    
    // Try different ways to access the ComfyUI app
    if (window.app) {
        app = window.app;
        return app;
    }
    
    // Look for ComfyUI in the global scope
    if (window.ComfyApp) {
        app = window.ComfyApp;
        return app;
    }
    
    return null;
}

// Configuration
let config = {
    group_name: "__movable__",
    shortcut_key: "F8",
    enabled: true,
    debug_mode: false
};

// Load configuration from the backend
async function loadConfig() {
    try {
        const response = await fetch('/flipflop/config/group_positioner.json');
        if (response.ok) {
            config = await response.json();
            if (config.debug_mode) {
                console.log('[FF Group Positioner] DEBUG: Configuration loaded:', config);
            }
        }
    } catch (error) {
        console.warn('[FF Group Positioner] Could not load group positioner config:', error);
        // Use default config if server endpoint is not available
        config = {
            group_name: "__movable__",
            shortcut_key: "F8",
            enabled: true,
            debug_mode: false
        };
        if (config.debug_mode) {
            console.log('[FF Group Positioner] DEBUG: Using default config:', config);
        }
    }
}

// Find a group by name
function findGroupByName(groupName) {
    const app = getApp();
    if (!app || !app.graph || !app.graph._groups) {
        if (config.debug_mode) {
            console.log('[FF Group Positioner] DEBUG: App or graph not available');
        }
        return null;
    }
    
    const groups = app.graph._groups;
    if (config.debug_mode) {
        console.log('[FF Group Positioner] DEBUG: Available groups:', groups.map(g => g.title));
    }
    
    for (const group of groups) {
        if (group.title === groupName) {
            if (config.debug_mode) {
                console.log('[FF Group Positioner] DEBUG: Found group:', group);
            }
            return group;
        }
    }
    
    if (config.debug_mode) {
        console.log('[FF Group Positioner] DEBUG: Group not found:', groupName);
    }
    return null;
}

// Position group under cursor
function positionGroupUnderCursor(groupName) {
    if (config.debug_mode) {
        console.log('[FF Group Positioner] DEBUG: Attempting to position group:', groupName);
    }
    
    const app = getApp();
    if (!app) {
        console.warn('[FF Group Positioner] ComfyUI app not available');
        return;
    }
    
    const group = findGroupByName(groupName);
    if (!group) {
        console.warn(`[FF Group Positioner] Group "${groupName}" not found`);
        return;
    }
    
    // Get current mouse position from canvas
    const canvas = app.canvas;
    if (!canvas || !canvas.mouse) {
        console.warn('[FF Group Positioner] Mouse position not available');
        if (config.debug_mode) {
            console.log('[FF Group Positioner] DEBUG: Canvas:', canvas);
            console.log('[FF Group Positioner] DEBUG: Canvas mouse:', canvas?.mouse);
        }
        return;
    }
    
    const mousePos = canvas.mouse;
    if (config.debug_mode) {
        console.log('[FF Group Positioner] DEBUG: Mouse position:', mousePos);
    }
    
    // Calculate group dimensions
    const groupWidth = group.size[0];
    const groupHeight = group.size[1];
    
    if (config.debug_mode) {
        console.log('[FF Group Positioner] DEBUG: Group dimensions:', { width: groupWidth, height: groupHeight });
        console.log('[FF Group Positioner] DEBUG: Current group position:', group.pos);
    }
    
    // Position group center under cursor
    const newX = mousePos[0] - groupWidth / 2;
    const newY = mousePos[1] - groupHeight / 2;
    
    if (config.debug_mode) {
        console.log('[FF Group Positioner] DEBUG: New position calculated:', { x: newX, y: newY });
    }
    
    // Update group position
    group.pos = [newX, newY];
    
    // Trigger graph change to update the UI
    app.graph.change();
    
    console.log(`[FF Group Positioner] Positioned group "${groupName}" at (${newX.toFixed(2)}, ${newY.toFixed(2)})`);
}

// Handle keyboard shortcuts
function handleKeyDown(event) {
    if (!config.enabled) {
        if (config.debug_mode) {
            console.log('[FF Group Positioner] DEBUG: Feature disabled, ignoring key press');
        }
        return;
    }
    
    // Check if the pressed key matches our shortcut
    let keyPressed = event.key;
    let keyCode = event.code;
    
    // Handle modifier keys
    if (event.ctrlKey) keyPressed = 'Ctrl+' + keyPressed;
    if (event.altKey) keyPressed = 'Alt+' + keyPressed;
    if (event.shiftKey) keyPressed = 'Shift+' + keyPressed;
    if (event.metaKey) keyPressed = 'Meta+' + keyPressed;
    
    if (config.debug_mode) {
        console.log('[FF Group Positioner] DEBUG: Key pressed:', keyPressed, 'Key code:', keyCode, 'Expected:', config.shortcut_key);
    }
    
    // Check for exact match first
    if (keyPressed === config.shortcut_key) {
        if (config.debug_mode) {
            console.log('[FF Group Positioner] DEBUG: Shortcut matched! Triggering positioning...');
        }
        event.preventDefault();
        positionGroupUnderCursor(config.group_name);
        return;
    }
    
    // Fallback: Check if it's a function key and handle different formats
    if (config.shortcut_key.startsWith('F') && keyCode) {
        // Handle different F8 formats: "F8", "F8", "F8"
        const functionKeyNumber = config.shortcut_key.substring(1); // Extract "8" from "F8"
        const expectedKeyCode = `F${functionKeyNumber}`;
        
        if (keyCode === expectedKeyCode) {
            if (config.debug_mode) {
                console.log('[FF Group Positioner] DEBUG: Function key matched via keyCode! Triggering positioning...');
            }
            event.preventDefault();
            positionGroupUnderCursor(config.group_name);
            return;
        }
    }
}

// Create UI buttons
function createUIButtons() {
    // Remove existing buttons if they exist
    const existingButton = document.getElementById('flipflop-group-positioner-btn');
    if (existingButton) {
        existingButton.remove();
    }
    
    const existingTestButton = document.getElementById('flipflop-group-positioner-test-btn');
    if (existingTestButton) {
        existingTestButton.remove();
    }
    
    const existingRefreshButton = document.getElementById('flipflop-group-positioner-refresh-btn');
    if (existingRefreshButton) {
        existingRefreshButton.remove();
    }
    
    // Create main positioning button
    const button = document.createElement('button');
    button.id = 'flipflop-group-positioner-btn';
    button.textContent = `Position ${config.group_name}`;
    button.title = `Press ${config.shortcut_key} or click to position group "${config.group_name}" under cursor`;
    button.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        z-index: 1000;
        padding: 8px 12px;
        background: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        font-family: Arial, sans-serif;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        transition: background-color 0.2s;
        margin-bottom: 5px;
    `;
    
    button.addEventListener('mouseenter', () => {
        button.style.background = '#45a049';
    });
    
    button.addEventListener('mouseleave', () => {
        button.style.background = '#4CAF50';
    });
    
    button.addEventListener('click', () => {
        if (config.debug_mode) {
            console.log('[FF Group Positioner] DEBUG: Test button clicked');
        }
        positionGroupUnderCursor(config.group_name);
    });
    
    // Create test button (for debugging)
    const testButton = document.createElement('button');
    testButton.id = 'flipflop-group-positioner-test-btn';
    testButton.textContent = `Test ${config.group_name}`;
    testButton.title = `Test positioning without shortcut (debug mode: ${config.debug_mode ? 'ON' : 'OFF'})`;
    testButton.style.cssText = `
        position: fixed;
        top: 50px;
        right: 10px;
        z-index: 1000;
        padding: 8px 12px;
        background: ${config.debug_mode ? '#FF9800' : '#9E9E9E'};
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        font-family: Arial, sans-serif;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        transition: background-color 0.2s;
    `;
    
    testButton.addEventListener('mouseenter', () => {
        testButton.style.background = config.debug_mode ? '#F57C00' : '#757575';
    });
    
    testButton.addEventListener('mouseleave', () => {
        testButton.style.background = config.debug_mode ? '#FF9800' : '#9E9E9E';
    });
    
    testButton.addEventListener('click', () => {
        console.log('[FF Group Positioner] Test button clicked - attempting to position group');
        positionGroupUnderCursor(config.group_name);
    });
    
    // Create refresh button (for debugging)
    const refreshButton = document.createElement('button');
    refreshButton.id = 'flipflop-group-positioner-refresh-btn';
    refreshButton.textContent = '🔄 Refresh';
    refreshButton.title = 'Refresh configuration and validate group';
    refreshButton.style.cssText = `
        position: fixed;
        top: 90px;
        right: 10px;
        z-index: 1000;
        padding: 8px 12px;
        background: #2196F3;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        font-family: Arial, sans-serif;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        transition: background-color 0.2s;
    `;
    
    refreshButton.addEventListener('mouseenter', () => {
        refreshButton.style.background = '#1976D2';
    });
    
    refreshButton.addEventListener('mouseleave', () => {
        refreshButton.style.background = '#2196F3';
    });
    
    refreshButton.addEventListener('click', async () => {
        console.log('[FF Group Positioner] Refresh button clicked');
        await loadConfig();
        createUIButtons();
        validateGroupExists(config.group_name);
        console.log('[FF Group Positioner] Configuration refreshed');
    });
    
    document.body.appendChild(button);
    document.body.appendChild(testButton);
    document.body.appendChild(refreshButton);
    
    if (config.debug_mode) {
        console.log('[FF Group Positioner] DEBUG: UI buttons created');
    }
}

// Initialize the extension
async function init() {
    await loadConfig();
    
    // Add keyboard event listener
    document.addEventListener('keydown', handleKeyDown);
    
    // Create UI buttons
    createUIButtons();
    
    // Validate group exists
    validateGroupExists(config.group_name);
    
    // Set up periodic config checking (every 2 seconds)
    setInterval(async () => {
        const oldConfig = JSON.stringify(config);
        await loadConfig();
        const newConfig = JSON.stringify(config);
        
        if (oldConfig !== newConfig) {
            if (config.debug_mode) {
                console.log('[FF Group Positioner] DEBUG: Configuration changed!');
                console.log('[FF Group Positioner] DEBUG: New config:', config);
            }
            createUIButtons();
            validateGroupExists(config.group_name);
        }
    }, 2000);
    
    // Reload config when graph changes (in case user updates the node)
    const app = getApp();
    if (app && app.graph) {
        const originalChange = app.graph.change;
        app.graph.change = function() {
            originalChange.call(this);
            loadConfig().then(() => {
                createUIButtons();
                validateGroupExists(config.group_name);
            });
        };
    }
    
    console.log('[FF Group Positioner] Extension loaded');
    console.log(`[FF Group Positioner] Configuration: ${config.group_name} -> ${config.shortcut_key} (${config.enabled ? 'enabled' : 'disabled'}) ${config.debug_mode ? '[DEBUG ON]' : ''}`);
}

// Wait for ComfyUI to be ready
function waitForComfyUI() {
    const app = getApp();
    if (app && app.graph) {
        init();
    } else {
        // Wait for app to be available
        setTimeout(waitForComfyUI, 100);
    }
}

// Add a global key listener for debugging (only in debug mode)
function addDebugKeyListener() {
    // Always add the listener, but only log when debug mode is on
    document.addEventListener('keydown', (event) => {
        if (config.debug_mode) {
            console.log('[FF Group Positioner] DEBUG: All key events - Key:', event.key, 'Code:', event.code, 'KeyCode:', event.keyCode);
        }
    });
}

// Function to validate group exists
function validateGroupExists(groupName) {
    const app = getApp();
    if (!app || !app.graph || !app.graph._groups) {
        if (config.debug_mode) {
            console.log('[FF Group Positioner] DEBUG: Cannot validate group - app or graph not available');
        }
        return false;
    }
    
    const groups = app.graph._groups;
    const groupNames = groups.map(g => g.title);
    
    if (config.debug_mode) {
        console.log('[FF Group Positioner] DEBUG: Available groups:', groupNames);
        console.log('[FF Group Positioner] DEBUG: Looking for group:', groupName);
    }
    
    const found = groupNames.includes(groupName);
    if (config.debug_mode) {
        if (found) {
            console.log('[FF Group Positioner] DEBUG: ✓ Group found:', groupName);
        } else {
            console.log('[FF Group Positioner] DEBUG: ✗ Group NOT found:', groupName);
        }
    }
    
    return found;
}

// Start waiting for ComfyUI
waitForComfyUI();

// Add debug key listener
addDebugKeyListener();

// Log initial load
console.log('[FF Group Positioner] Extension script loaded');
