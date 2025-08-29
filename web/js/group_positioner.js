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
        this.msThreshold = 400;
        this.msLastCheck = 0;
        this.runScheduledForMs = null;
        this.runScheduleTimeout = null;
        this.runScheduleAnimation = null;
        this.onConfigChange = null;
    }
    
    setOnConfigChange(callback) {
        this.onConfigChange = callback;
    }
    
    scheduleRun(ms = 500) {
        if (this.runScheduledForMs && ms < this.runScheduledForMs) {
            this.clearScheduledRun();
        }
        if (!this.runScheduledForMs) {
            this.runScheduledForMs = ms;
            this.runScheduleTimeout = setTimeout(() => {
                this.runScheduleAnimation = requestAnimationFrame(() => this.run());
            }, ms);
        }
    }
    
    clearScheduledRun() {
        this.runScheduleTimeout && clearTimeout(this.runScheduleTimeout);
        this.runScheduleAnimation && cancelAnimationFrame(this.runScheduleAnimation);
        this.runScheduleTimeout = null;
        this.runScheduleAnimation = null;
        this.runScheduledForMs = null;
    }
    
    async run() {
        if (!this.runScheduledForMs) {
            return;
        }
        
        const configChanged = await loadConfig();
        if (configChanged && this.onConfigChange) {
            this.onConfigChange();
        }
        
        this.clearScheduledRun();
        this.scheduleRun();
    }
}

// Initialize the extension
async function init() {
    log('Initializing...', 'INFO');
    
    // Load initial configuration
    await loadConfig();
    
    // Setup keyboard listener
    setupKeyboardListener();
    
    // Setup graph monitoring (like rgthree-comfy)
    setupGraphMonitoring(async (eventType) => {
        log(`Graph event: ${eventType}`, 'DEBUG');
        configService.scheduleRun(100); // Quick reload on graph changes
    });
    
    // Setup configuration service (like rgthree-comfy's service pattern)
    const configService = new ConfigService();
    configService.setOnConfigChange(async () => {
        const config = getConfig();
        log(`Configuration updated: ${config.group_name} -> ${config.shortcut_key}`, 'INFO');
        
        // Validate group name whenever config changes
        const validation = validateGroupName(config.group_name);
        await logToComfyUI('group_validation', {
            group_name: config.group_name,
            available_groups: validation.available_groups,
            matching_groups: validation.matching_groups,
            error: validation.error
        });
    });
    
    // Start periodic config checking (like rgthree-comfy's scheduling)
    configService.scheduleRun(1000);
    
    // Add global functions for manual testing
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
    log(`Configuration: ${config.group_name} -> ${config.shortcut_key} (${config.enabled ? 'enabled' : 'disabled'}) ${config.debug_mode ? '[DEBUG ON]' : ''}`, 'INFO');
    log('Manual test function available: testFlipFlopGroupPositioner()', 'INFO');
    log('Manual config reload available: reloadFlipFlopConfig()', 'INFO');
}

// Start the extension
log('Starting...', 'INFO');
waitForComfyUI(init);

