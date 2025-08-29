// Keyboard Shortcut Handling Module
// Handles keyboard events and shortcut detection with real-time widget monitoring

import { getApp } from './app.js';
import { getConfig, loadConfig } from './config.js';
import { positionGroupAt, validateGroupName } from './positioning.js';
import { logToComfyUI, log } from './logging.js';

let lastWidgetValues = {};
let globalMousePosition = [0, 0]; // Track global mouse position

// Track mouse position globally
function updateGlobalMousePosition(event) {
    // For mouse events, use clientX/clientY
    if (event.clientX !== undefined && event.clientY !== undefined) {
        globalMousePosition = [event.clientX, event.clientY];
        // Track mouse position silently
    }
    // For keyboard events, we'll use the last known mouse position
    // which should be updated by mouse events
}

function checkWidgetChanges() {
    const app = getApp();
    if (!app || !app.graph || !app.graph._nodes) return false;
    
    const positionerNodes = app.graph._nodes.filter(node => 
        node.comfyClass === 'FlipFlop_Group_Positioner'
    );
    
    if (positionerNodes.length === 0) return false;
    
    const node = positionerNodes[0];
    const widgets = node.widgets || [];
    let changed = false;
    
    for (const widget of widgets) {
        const key = `${widget.name}`;
        const currentValue = widget.value;
        
        if (lastWidgetValues[key] !== currentValue) {
            lastWidgetValues[key] = currentValue;
            changed = true;
        }
    }
    
    return changed;
}

export async function handleKeyDown(event) {
    // Don't update mouse position for keyboard events
    // Mouse position should already be tracked by mouse events
    
    // Reload config and check for widget changes
    await loadConfig();
    const configChanged = checkWidgetChanges();
    
    if (configChanged) {
        log('Configuration changed, reloading...', 'INFO');
        const config = getConfig();
        const validation = validateGroupName(config.group_name);
        await logToComfyUI('group_validation', {
            group_name: config.group_name,
            available_groups: validation.available_groups,
            matching_groups: validation.matching_groups,
            error: validation.error
        });
    }
    
    const config = getConfig();
    if (!config.enabled) return;
    
    // Temporary debug: log the current shortcut key
    log(`Current shortcut key: "${config.shortcut_key}", Pressed: "${event.key}" (${event.code})`, 'INFO');
    
    let keyPressed = event.key;
    let keyCode = event.code;
    
    // Build the full key combination
    if (event.ctrlKey) keyPressed = 'Ctrl+' + keyPressed;
    if (event.altKey) keyPressed = 'Alt+' + keyPressed;
    if (event.shiftKey) keyPressed = 'Shift+' + keyPressed;
    if (event.metaKey) keyPressed = 'Meta+' + keyPressed;
    
    // Check if the pressed key matches our shortcut
    const shortcutMatches = 
        keyPressed === config.shortcut_key || 
        keyCode === config.shortcut_key ||
        (keyCode.startsWith('F') && keyCode.substring(1) === config.shortcut_key) ||
        (config.shortcut_key.startsWith('F') && keyCode === config.shortcut_key);
    
    if (shortcutMatches) {
        event.preventDefault();
        
        // Get current mouse position
        let currentMousePos = globalMousePosition;
        if (currentMousePos[0] === undefined || currentMousePos[1] === undefined) {
            // Fallback: try to get mouse position from canvas
            const app = getApp();
            if (app && app.canvas) {
                const canvas = app.canvas;
                if (canvas.mouse && canvas.mouse[0] !== undefined && canvas.mouse[1] !== undefined) {
                    currentMousePos = canvas.mouse;
                } else {
                    // Last resort: use center of viewport
                    currentMousePos = [window.innerWidth / 2, window.innerHeight / 2];
                }
            } else {
                // Last resort: use center of viewport
                currentMousePos = [window.innerWidth / 2, window.innerHeight / 2];
            }
        }
        
        await logToComfyUI('shortcut_pressed', {
            shortcut: config.shortcut_key,
            group_name: config.group_name,
            mouse_position: currentMousePos
        });
        
        // Find the group and position it
        const app = getApp();
        if (app && app.graph && app.graph._groups) {
            const group = app.graph._groups.find(g => g.title === config.group_name);
            if (group) {
                await positionGroupAt(config.group_name, group.id, currentMousePos);
            } else {
                log(`Group '${config.group_name}' not found`, 'WARN');
            }
        }
        return;
    }
}

export function setupKeyboardListener() {
    // Add global mouse position tracking
    document.addEventListener('mousemove', updateGlobalMousePosition);
    document.addEventListener('mousedown', updateGlobalMousePosition);
    document.addEventListener('mouseup', updateGlobalMousePosition);
    
    // Add keyboard listener
    document.addEventListener('keydown', handleKeyDown);
    
    log('Keyboard listener setup complete', 'INFO');
}
