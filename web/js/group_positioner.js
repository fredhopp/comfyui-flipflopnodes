// Group Positioner Extension for ComfyUI
// Main entry point - uses ES6 modules and rgthree-comfy patterns

import { waitForComfyUI, setupGraphMonitoring } from './modules/app.js';
import { loadConfig, getConfig } from './modules/config.js';
import { positionGroupUnderCursor, validateGroupName } from './modules/positioning.js';
import { logToComfyUI, log } from './modules/logging.js';
import { setupKeyboardListener } from './modules/keyboard.js';

// Service-based configuration monitoring (like rgthree-comfy)
class ConfigService {
    constructor() {
        this.runScheduledForMs = null;
        this.onConfigChange = null;
        this.lastConfig = null;
        this.isRunning = false;
    }

    setOnConfigChange(callback) {
        this.onConfigChange = callback;
    }

    scheduleRun(delayMs = 5000) { // Increased default delay from 1000 to 5000ms
        if (this.runScheduledForMs) {
            return; // Already scheduled
        }
        this.runScheduledForMs = Date.now() + delayMs;
        setTimeout(() => this.run(), delayMs);
    }

    clearScheduledRun() {
        this.runScheduledForMs = null;
    }

    async run() {
        if (!this.runScheduledForMs || this.isRunning) {
            return;
        }
        
        this.isRunning = true;
        try {
            const configChanged = await loadConfig();
            if (configChanged && this.onConfigChange) {
                this.onConfigChange();
            }
        } catch (error) {
            console.warn('[FF Group Positioner] Config service error:', error);
        } finally {
            this.isRunning = false;
            this.clearScheduledRun();
            this.scheduleRun(5000); // Schedule next run with 5 second interval
        }
    }
}

// Initialize the extension
async function init() {
    log('Initializing...', 'INFO');
    await loadConfig();
    setupKeyboardListener();
    setupGraphMonitoring(async (eventType) => {
        log(`Graph event: ${eventType}`, 'DEBUG');
        configService.scheduleRun(1000); // Quick reload on graph changes
    });
    
    const configService = new ConfigService();
    configService.setOnConfigChange(async () => {
        const config = getConfig();
        log(`Configuration updated: ${config.group_name} -> ${config.shortcut_key}`, 'INFO');
        const validation = validateGroupName(config.group_name);
        await logToComfyUI('group_validation', {
            group_name: config.group_name,
            available_groups: validation.available_groups,
            matching_groups: validation.matching_groups,
            error: validation.error
        });
    });
    
    // Start with a longer interval to reduce excessive loading
    configService.scheduleRun(5000); // 5 seconds instead of 1 second
    
    // Global functions for manual testing
    window.testFlipFlopGroupPositioner = async function() {
        log('Manual test function called', 'INFO');
        const config = getConfig();
        await positionGroupUnderCursor(config.group_name);
    };
    
    window.reloadFlipFlopConfig = async function() {
        log('Manual config reload called', 'INFO');
        await loadConfig();
        const config = getConfig();
        log(`Current config after manual reload: ${JSON.stringify(config)}`, 'INFO');
    };
    
    log('Extension loaded successfully', 'INFO');
    const config = getConfig();
            log(`Configuration: ${config.group_name} -> ${config.shortcut_key} (${config.enabled ? 'enabled' : 'disabled'})`, 'INFO');
    log('Manual test function available: testFlipFlopGroupPositioner()', 'INFO');
    log('Manual config reload available: reloadFlipFlopConfig()', 'INFO');
}

log('Starting...', 'INFO');
waitForComfyUI(init);

