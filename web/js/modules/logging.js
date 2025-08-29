// Logging and Notifications Module
// Handles console logging and ComfyUI notifications

import { getApp } from './app.js';

// Function to log to ComfyUI console and show notifications
export async function logToComfyUI(action, data = {}) {
    const app = getApp();
    
    // Create log message
    let message = '';
    switch (action) {
        case 'shortcut_pressed':
            message = `Shortcut pressed: ${data.shortcut} for group: ${data.group_name}`;
            break;
        case 'group_validation':
            if (data.error) {
                message = `Group validation error: ${data.error}`;
            } else {
                const available = data.available_groups.join(', ');
                const matching = data.matching_groups.join(', ');
                message = `Group validation: '${data.group_name}' - Available: [${available}] - Matching: [${matching}]`;
            }
            break;
        case 'positioning':
            message = `Positioning group: '${data.group_name}' at mouse [${data.mouse_pos}] from group [${data.group_pos}]`;
            break;
        case 'config_loaded':
            message = `Configuration loaded: ${data.group_name} -> ${data.shortcut_key}`;
            break;
        default:
            message = data.message || 'Unknown action';
    }
    
    // Log to browser console (always visible)
    console.log(`%c[FF Group Positioner] ${message}`, 'color: #4CAF50; font-weight: bold;');
    
    // Show notification in ComfyUI (if app is available)
    if (app && app.ui && app.ui.notifications) {
        app.ui.notifications.show(`[FF Group Positioner] ${message}`, 3000);
    }
    
    // Note: Removed server endpoint call since we're using direct graph access now
    // No more file-based logging needed
}

// Simple console logging with consistent formatting
export function log(message, level = 'INFO') {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const formattedMessage = `[${timestamp}] [FF Group Positioner] ${message}`;
    
    switch (level) {
        case 'ERROR':
            console.error(`%c${formattedMessage}`, 'color: #f44336; font-weight: bold;');
            break;
        case 'WARNING':
            console.warn(`%c${formattedMessage}`, 'color: #ff9800; font-weight: bold;');
            break;
        case 'DEBUG':
            console.log(`%c${formattedMessage}`, 'color: #2196f3; font-weight: bold;');
            break;
        default:
            console.log(`%c${formattedMessage}`, 'color: #4CAF50; font-weight: bold;');
    }
}
