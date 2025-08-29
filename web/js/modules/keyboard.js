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
    globalMousePosition = [event.clientX, event.clientY];
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
            console.log(`[FF Group Positioner] Widget '${widget.name}' changed from '${lastWidgetValues[key]}' to '${currentValue}'`);
            lastWidgetValues[key] = currentValue;
            changed = true;
        }
    }
    
    return changed;
}

export async function handleKeyDown(event) {
    // Update global mouse position
    updateGlobalMousePosition(event);
    
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
    
    let keyPressed = event.key;
    let keyCode = event.code;
    
    // Build the full key combination
    if (event.ctrlKey) keyPressed = 'Ctrl+' + keyPressed;
    if (event.altKey) keyPressed = 'Alt+' + keyPressed;
    if (event.shiftKey) keyPressed = 'Shift+' + keyPressed;
    if (event.metaKey) keyPressed = 'Meta+' + keyPressed;
    
    log(`Key pressed: ${keyPressed}, Key code: ${keyCode}, Expected: ${config.shortcut_key}`, 'DEBUG');
    
    // Check if the pressed key matches our shortcut
    if (keyPressed === config.shortcut_key || keyCode === config.shortcut_key) {
        log('Shortcut matched! Triggering positioning...', 'INFO');
        event.preventDefault();
        
        // Log the global mouse position
        log(`Global mouse position: [${globalMousePosition[0]}, ${globalMousePosition[1]}]`, 'DEBUG');
        
        await logToComfyUI('shortcut_pressed', {
            shortcut: config.shortcut_key,
            group_name: config.group_name,
            mouse_position: globalMousePosition
        });
        
        // Find the group and position it
        const app = getApp();
        if (app && app.graph && app.graph._groups) {
            const group = app.graph._groups.find(g => g.title === config.group_name);
            if (group) {
                await positionGroupAt(config.group_name, group.id, globalMousePosition);
            } else {
                log(`Group '${config.group_name}' not found`, 'WARN');
            }
        }
        return;
    }
    
    // Handle function keys via keyCode (F1, F2, etc.)
    if (keyCode.startsWith('F') && keyCode.length > 1) {
        const functionKey = keyCode.substring(1); // Remove 'F' prefix
        if (functionKey === config.shortcut_key) {
            log('Function key matched via keyCode! Triggering positioning...', 'INFO');
            event.preventDefault();
            
            // Log the global mouse position
            log(`Global mouse position: [${globalMousePosition[0]}, ${globalMousePosition[1]}]`, 'DEBUG');
            
            await logToComfyUI('shortcut_pressed', {
                shortcut: config.shortcut_key,
                group_name: config.group_name,
                mouse_position: globalMousePosition
            });
            
            // Find the group and position it
            const app = getApp();
            if (app && app.graph && app.graph._groups) {
                const group = app.graph._groups.find(g => g.title === config.group_name);
                if (group) {
                    await positionGroupAt(config.group_name, group.id, globalMousePosition);
                } else {
                    log(`Group '${config.group_name}' not found`, 'WARN');
                }
            }
            return;
        }
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
