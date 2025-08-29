// Logging and Notifications Module
// Handles console logging and ComfyUI notifications

import { getApp } from './app.js';

// Function to log to ComfyUI console and show notifications
export async function logToComfyUI(action, data = {}) {
    // Silent mode - no console logging
    // Only show ComfyUI notifications for important events
    
    const app = getApp();
    
    // Only show notifications for errors or important events
    if (action === 'group_validation' && data.error) {
        if (app && app.ui && app.ui.notifications) {
            app.ui.notifications.show(`[FF Group Positioner] ${data.error}`, 3000);
        }
    }
}

// Simple console logging with consistent formatting
export function log(message, level = 'INFO') {
    // TEMPORARY DEBUG MODE - show all logs
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const formattedMessage = `[${timestamp}] [FF Group Positioner] ${message}`;
    
    if (level === 'ERROR') {
        console.error(`%c${formattedMessage}`, 'color: #f44336; font-weight: bold;');
    } else if (level === 'WARN') {
        console.warn(`%c${formattedMessage}`, 'color: #ff9800; font-weight: bold;');
    } else if (level === 'INFO') {
        console.info(`%c${formattedMessage}`, 'color: #2196f3; font-weight: bold;');
    } else {
        console.log(`%c${formattedMessage}`, 'color: #4caf50; font-weight: bold;');
    }
}
