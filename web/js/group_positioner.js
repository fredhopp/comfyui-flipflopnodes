// Group Positioner Extension for ComfyUI
// This extension allows positioning a group under the cursor when a shortcut key is pressed

console.log('[FF Group Positioner] Script starting...');

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
    group_name: "MOVABLE",
    shortcut_key: "F8",
    enabled: true,
    debug_mode: true
};

// Load configuration from the backend
async function loadConfig() {
    try {
        const response = await fetch('/flipflop/config/group_positioner.json');
        if (response.ok) {
            const newConfig = await response.json();
            const oldConfig = JSON.stringify(config);
            config = { ...config, ...newConfig };
            const newConfigStr = JSON.stringify(config);
            
            if (oldConfig !== newConfigStr) {
                console.log('[FF Group Positioner] Configuration changed!');
                console.log('[FF Group Positioner] Old config:', JSON.parse(oldConfig));
                console.log('[FF Group Positioner] New config:', config);
                
                // Validate group name whenever config changes
                validateGroupName(config.group_name);
            }
        } else {
            console.warn('[FF Group Positioner] Server returned status:', response.status);
        }
    } catch (error) {
        console.warn('[FF Group Positioner] Could not load group positioner config:', error);
    }
}

// Validate group name and check for duplicates
function validateGroupName(groupName) {
    console.log(`[FF Group Positioner] Validating group name: '${groupName}'`);
    
    const app = getApp();
    if (!app || !app.graph || !app.graph._groups) {
        console.log('[FF Group Positioner] Cannot validate group - app or graph not available');
        return false;
    }
    
    const groups = app.graph._groups;
    const matchingGroups = groups.filter(g => g.title === groupName);
    
    console.log('[FF Group Positioner] Available groups:', groups.map(g => g.title));
    console.log(`[FF Group Positioner] Groups matching '${groupName}':`, matchingGroups.map(g => g.title));
    
    if (matchingGroups.length === 0) {
        console.warn(`[FF Group Positioner] WARNING: No group found with name '${groupName}'`);
        return false;
    } else if (matchingGroups.length > 1) {
        console.warn(`[FF Group Positioner] WARNING: Multiple groups found with name '${groupName}' (${matchingGroups.length} groups)`);
        console.warn('[FF Group Positioner] Using the first group found');
        return true;
    } else {
        console.log(`[FF Group Positioner] ✓ Group '${groupName}' found and validated`);
        return true;
    }
}

// Find a group by name
function findGroupByName(groupName) {
    const app = getApp();
    if (!app || !app.graph || !app.graph._groups) {
        console.log('[FF Group Positioner] App or graph not available');
        return null;
    }
    
    const groups = app.graph._groups;
    const matchingGroups = groups.filter(g => g.title === groupName);
    
    if (matchingGroups.length === 0) {
        console.log(`[FF Group Positioner] Group '${groupName}' not found`);
        return null;
    } else if (matchingGroups.length > 1) {
        console.warn(`[FF Group Positioner] Multiple groups with name '${groupName}' found, using first one`);
    }
    
    const group = matchingGroups[0];
    console.log(`[FF Group Positioner] Found group:`, group);
    return group;
}

// Position group under cursor
function positionGroupUnderCursor(groupName) {
    console.log(`[FF Group Positioner] Attempting to position group: '${groupName}'`);
    
    const app = getApp();
    if (!app) {
        console.warn('[FF Group Positioner] ComfyUI app not available');
        return;
    }
    
    const group = findGroupByName(groupName);
    if (!group) {
        console.warn(`[FF Group Positioner] Group '${groupName}' not found`);
        return;
    }
    
    // Get current mouse position from canvas
    const canvas = app.canvas;
    if (!canvas || !canvas.mouse) {
        console.warn('[FF Group Positioner] Mouse position not available');
        console.log('[FF Group Positioner] Canvas:', canvas);
        console.log('[FF Group Positioner] Canvas mouse:', canvas?.mouse);
        return;
    }
    
    const mousePos = canvas.mouse;
    console.log('[FF Group Positioner] Mouse position:', mousePos);
    
    // Calculate group dimensions
    const groupWidth = group.size[0];
    const groupHeight = group.size[1];
    
    console.log('[FF Group Positioner] Group dimensions:', { width: groupWidth, height: groupHeight });
    console.log('[FF Group Positioner] Current group position:', group.pos);
    
    // Get canvas offset and zoom for proper positioning
    const canvasOffset = canvas.offset || [0, 0];
    const canvasScale = canvas.scale || 1;
    
    console.log('[FF Group Positioner] Canvas offset:', canvasOffset);
    console.log('[FF Group Positioner] Canvas scale:', canvasScale);
    
    // Calculate adjusted mouse position (accounting for canvas transform)
    const adjustedMouseX = (mousePos[0] - canvasOffset[0]) / canvasScale;
    const adjustedMouseY = (mousePos[1] - canvasOffset[1]) / canvasScale;
    
    console.log('[FF Group Positioner] Adjusted mouse position:', [adjustedMouseX, adjustedMouseY]);
    
    // Calculate the offset to move the group
    const currentGroupX = group.pos[0];
    const currentGroupY = group.pos[1];
    const newGroupX = adjustedMouseX - groupWidth / 2;
    const newGroupY = adjustedMouseY - groupHeight / 2;
    
    const offsetX = newGroupX - currentGroupX;
    const offsetY = newGroupY - currentGroupY;
    
    console.log('[FF Group Positioner] Group offset calculated:', { offsetX, offsetY });
    
    // Update group position
    group.pos = [newGroupX, newGroupY];
    
    // Move all nodes within the group by the same offset
    if (app.graph._nodes) {
        let movedNodes = 0;
        for (const node of app.graph._nodes) {
            if (node.group_id === group.id) {
                const oldPos = node.pos;
                node.pos = [oldPos[0] + offsetX, oldPos[1] + offsetY];
                movedNodes++;
                console.log(`[FF Group Positioner] Moved node ${node.title || node.id} from [${oldPos[0]}, ${oldPos[1]}] to [${node.pos[0]}, ${node.pos[1]}]`);
            }
        }
        console.log(`[FF Group Positioner] Moved ${movedNodes} nodes with the group`);
    }
    
    // Trigger graph change to update the UI
    app.graph.change();
    
    console.log(`[FF Group Positioner] Successfully positioned group '${groupName}' and its contents at (${newGroupX.toFixed(2)}, ${newGroupY.toFixed(2)})`);
}

// Handle keyboard shortcuts
function handleKeyDown(event) {
    // Always reload config before checking shortcut to ensure we have latest settings
    loadConfig().then(() => {
        if (!config.enabled) {
            console.log('[FF Group Positioner] Feature disabled, ignoring key press');
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
        
        console.log('[FF Group Positioner] Key pressed:', keyPressed, 'Key code:', keyCode, 'Expected:', config.shortcut_key);
        
        // Check for exact match first
        if (keyPressed === config.shortcut_key) {
            console.log('[FF Group Positioner] Shortcut matched! Triggering positioning...');
            event.preventDefault();
            positionGroupUnderCursor(config.group_name);
            return;
        }
        
        // Fallback: Check if it's a function key and handle different formats
        if (config.shortcut_key.startsWith('F') && keyCode) {
            const functionKeyNumber = config.shortcut_key.substring(1);
            const expectedKeyCode = `F${functionKeyNumber}`;
            
            if (keyCode === expectedKeyCode) {
                console.log('[FF Group Positioner] Function key matched via keyCode! Triggering positioning...');
                event.preventDefault();
                positionGroupUnderCursor(config.group_name);
                return;
            }
        }
    });
}

// Initialize the extension
async function init() {
    console.log('[FF Group Positioner] Initializing...');
    await loadConfig();
    
    // Add keyboard event listener
    document.addEventListener('keydown', handleKeyDown);
    
    // Validate group exists
    validateGroupName(config.group_name);
    
    // Set up periodic config checking (every 1 second for faster response)
    setInterval(async () => {
        await loadConfig();
    }, 1000);
    
    console.log('[FF Group Positioner] Extension loaded');
    console.log(`[FF Group Positioner] Configuration: ${config.group_name} -> ${config.shortcut_key} (${config.enabled ? 'enabled' : 'disabled'}) ${config.debug_mode ? '[DEBUG ON]' : ''}`);
    
    // Add global function for manual testing
    window.testFlipFlopGroupPositioner = function() {
        console.log('[FF Group Positioner] Manual test function called');
        positionGroupUnderCursor(config.group_name);
    };
    
    console.log('[FF Group Positioner] Manual test function available: testFlipFlopGroupPositioner()');
}

// Wait for ComfyUI to be ready
function waitForComfyUI() {
    const app = getApp();
    if (app && app.graph) {
        console.log('[FF Group Positioner] ComfyUI detected, initializing...');
        init();
    } else {
        console.log('[FF Group Positioner] Waiting for ComfyUI...');
        setTimeout(waitForComfyUI, 1000);
    }
}

// Start waiting for ComfyUI
console.log('[FF Group Positioner] Starting...');
waitForComfyUI();

