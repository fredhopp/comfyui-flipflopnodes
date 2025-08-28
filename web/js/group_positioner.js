// Group Positioner Extension for ComfyUI
// This extension allows positioning a group under the cursor when a shortcut key is pressed

import { app } from "../../scripts/app.js";

// Configuration
let config = {
    group_name: "MyGroup",
    shortcut_key: "F8",
    enabled: true
};

// Load configuration from the backend
async function loadConfig() {
    try {
        const response = await fetch('/flipflop/config/group_positioner.json');
        if (response.ok) {
            config = await response.json();
        }
    } catch (error) {
        console.warn('Could not load group positioner config:', error);
    }
}

// Find a group by name
function findGroupByName(groupName) {
    if (!app.graph || !app.graph._groups) return null;
    
    const groups = app.graph._groups;
    for (const group of groups) {
        if (group.title === groupName) {
            return group;
        }
    }
    return null;
}

// Position group under cursor
function positionGroupUnderCursor(groupName) {
    const group = findGroupByName(groupName);
    if (!group) {
        console.warn(`Group "${groupName}" not found`);
        return;
    }
    
    // Get current mouse position from canvas
    const canvas = app.canvas;
    if (!canvas || !canvas.mouse) {
        console.warn('Mouse position not available');
        return;
    }
    
    const mousePos = canvas.mouse;
    
    // Calculate group dimensions
    const groupWidth = group.size[0];
    const groupHeight = group.size[1];
    
    // Position group center under cursor
    const newX = mousePos[0] - groupWidth / 2;
    const newY = mousePos[1] - groupHeight / 2;
    
    // Update group position
    group.pos = [newX, newY];
    
    // Trigger graph change to update the UI
    app.graph.change();
    
    console.log(`Positioned group "${groupName}" at (${newX.toFixed(2)}, ${newY.toFixed(2)})`);
}

// Handle keyboard shortcuts
function handleKeyDown(event) {
    if (!config.enabled) return;
    
    // Check if the pressed key matches our shortcut
    let keyPressed = event.key;
    
    // Handle modifier keys
    if (event.ctrlKey) keyPressed = 'Ctrl+' + keyPressed;
    if (event.altKey) keyPressed = 'Alt+' + keyPressed;
    if (event.shiftKey) keyPressed = 'Shift+' + keyPressed;
    if (event.metaKey) keyPressed = 'Meta+' + keyPressed;
    
    if (keyPressed === config.shortcut_key) {
        event.preventDefault();
        positionGroupUnderCursor(config.group_name);
    }
}

// Create UI button
function createUIButton() {
    // Remove existing button if it exists
    const existingButton = document.getElementById('flipflop-group-positioner-btn');
    if (existingButton) {
        existingButton.remove();
    }
    
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
    `;
    
    button.addEventListener('mouseenter', () => {
        button.style.background = '#45a049';
    });
    
    button.addEventListener('mouseleave', () => {
        button.style.background = '#4CAF50';
    });
    
    button.addEventListener('click', () => {
        positionGroupUnderCursor(config.group_name);
    });
    
    document.body.appendChild(button);
}

// Initialize the extension
async function init() {
    await loadConfig();
    
    // Add keyboard event listener
    document.addEventListener('keydown', handleKeyDown);
    
    // Create UI button
    createUIButton();
    
    // Reload config when graph changes (in case user updates the node)
    const originalChange = app.graph.change;
    app.graph.change = function() {
        originalChange.call(this);
        loadConfig().then(() => {
            createUIButton();
        });
    };
    
    console.log('Group Positioner extension loaded');
    console.log(`Configuration: ${config.group_name} -> ${config.shortcut_key} (${config.enabled ? 'enabled' : 'disabled'})`);
}

// Wait for ComfyUI to be ready
if (app && app.graph) {
    init();
} else {
    // Wait for app to be available
    const checkApp = setInterval(() => {
        if (app && app.graph) {
            clearInterval(checkApp);
            init();
        }
    }, 100);
}
