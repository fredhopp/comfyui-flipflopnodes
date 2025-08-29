// Keyboard Shortcut Handling Module
// Handles keyboard events and shortcut detection with real-time widget monitoring

import { getConfig, loadConfig } from './config.js';
import { positionGroupUnderCursor, validateGroupName } from './positioning.js';
import { logToComfyUI, log } from './logging.js';

// Monitor widget changes in real-time (like rgthree-comfy)
let lastWidgetValues = {};

// Check if widget values have changed
function checkWidgetChanges() {
    const app = getApp();
    if (!app || !app.graph || !app.graph._nodes) return false;
    
    const positionerNodes = app.graph._nodes.filter(node => 
        node.comfyClass === 'FlipFlop_Group_Positioner'
    );
    
    if (positionerNodes.length === 0) return false;
    
    const node = positionerNodes[0];
    const widgets = node.widgets || [];
    const currentValues = {};
    
    for (const widget of widgets) {
        currentValues[widget.name] = widget.value;
    }
    
    const hasChanged = JSON.stringify(currentValues) !== JSON.stringify(lastWidgetValues);
    lastWidgetValues = { ...currentValues };
    
    return hasChanged;
}

// Handle keyboard shortcuts
export async function handleKeyDown(event) {
    try {
        // Check if widget values have changed (real-time monitoring)
        const widgetsChanged = checkWidgetChanges();
        
        // Always reload config to ensure we have latest settings
        const configChanged = await loadConfig();
        
        if (configChanged || widgetsChanged) {
            const config = getConfig();
            await logToComfyUI('config_loaded', {
                group_name: config.group_name,
                shortcut_key: config.shortcut_key
            });
        }
        
        const config = getConfig();
        
        if (!config.enabled) {
            log('Feature disabled, ignoring key press', 'DEBUG');
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
        
        log(`Key pressed: ${keyPressed}, Key code: ${keyCode}, Expected: ${config.shortcut_key}`, 'DEBUG');
        
        // Check for exact match first
        if (keyPressed === config.shortcut_key) {
            log('Shortcut matched! Triggering positioning...', 'INFO');
            event.preventDefault();
            
            // Log shortcut press to ComfyUI console
            await logToComfyUI('shortcut_pressed', {
                shortcut: config.shortcut_key,
                group_name: config.group_name
            });
            
            await positionGroupUnderCursor(config.group_name);
            return;
        }
        
        // Fallback: Check if it's a function key and handle different formats
        if (config.shortcut_key.startsWith('F') && keyCode) {
            const functionKeyNumber = config.shortcut_key.substring(1);
            const expectedKeyCode = `F${functionKeyNumber}`;
            
            if (keyCode === expectedKeyCode) {
                log('Function key matched via keyCode! Triggering positioning...', 'INFO');
                event.preventDefault();
                
                // Log shortcut press to ComfyUI console
                await logToComfyUI('shortcut_pressed', {
                    shortcut: config.shortcut_key,
                    group_name: config.group_name
                });
                
                await positionGroupUnderCursor(config.group_name);
                return;
            }
        }
    } catch (error) {
        log(`Error in keyboard handler: ${error.message}`, 'ERROR');
    }
}

// Setup keyboard event listener
export function setupKeyboardListener() {
    document.addEventListener('keydown', handleKeyDown);
    log('Keyboard event listener added', 'INFO');
}
