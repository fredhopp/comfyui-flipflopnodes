// Configuration Management Module
// Gets configuration directly from the graph instead of files

import { getApp } from './app.js';

// Default configuration
const DEFAULT_CONFIG = {
    group_name: "👜👜👜",
    shortcut_key: "F8",
    enabled: true,
    debug_mode: false  // Always false in production
};

// Current configuration
let config = { ...DEFAULT_CONFIG };

// Get configuration directly from the graph (like rgthree-comfy does)
export function getConfigFromGraph() {
    const app = getApp();
    if (!app || !app.graph || !app.graph._nodes) {
        console.warn('[FF Group Positioner] Cannot access graph');
        return null;
    }
    
    // DEBUG: Log all node classes to see what's available
    console.log('[FF Group Positioner] All nodes in graph:', app.graph._nodes.map(n => n.comfyClass));
    
    // Find our Group Positioner node
    const positionerNodes = app.graph._nodes.filter(node => 
        node.comfyClass === 'FlipFlop_Group_Positioner'
    );
    
    console.log('[FF Group Positioner] Found positioner nodes:', positionerNodes.length);
    
    if (positionerNodes.length === 0) {
        console.warn('[FF Group Positioner] No FlipFlop_Group_Positioner nodes found in graph');
        return null;
    }
    
    // Use the first node found (or could iterate through all)
    const node = positionerNodes[0];
    
    console.log('[FF Group Positioner] Found node:', node);
    
    // Extract widget values directly from the node
    const widgets = node.widgets || [];
    console.log('[FF Group Positioner] Widgets found:', widgets.map(w => ({ name: w.name, value: w.value })));
    
    const newConfig = { ...DEFAULT_CONFIG };
    
    for (const widget of widgets) {
        switch (widget.name) {
            case 'group_name':
                newConfig.group_name = widget.value || DEFAULT_CONFIG.group_name;
                break;
            case 'shortcut_key':
                newConfig.shortcut_key = widget.value || DEFAULT_CONFIG.shortcut_key;
                break;
            case 'enabled':
                newConfig.enabled = widget.value !== undefined ? widget.value : DEFAULT_CONFIG.enabled;
                break;
            case 'debug_mode':
                // Debug mode is always false in production - widget no longer exists
                newConfig.debug_mode = false;
                break;
        }
    }
    
    return newConfig;
}

// Load configuration from the graph (replaces file-based loading)
export async function loadConfig() {
    try {
        const newConfig = getConfigFromGraph();
        
        if (!newConfig) {
            console.warn('[FF Group Positioner] No config found in graph');
            return false;
        }
        
        const oldConfig = JSON.stringify(config);
        config = { ...config, ...newConfig };
        const newConfigStr = JSON.stringify(config);
        
        const changed = oldConfig !== newConfigStr;
        if (changed) {
            console.log('[FF Group Positioner] Config changed:', { old: JSON.parse(oldConfig), new: config });
        }
        
        return changed; // Return true if config changed
    } catch (error) {
        console.warn('[FF Group Positioner] Could not load config from graph:', error);
        return false;
    }
}

// Get current configuration
export function getConfig() {
    return { ...config };
}

// Set configuration (for testing)
export function setConfig(newConfig) {
    config = { ...config, ...newConfig };
}

// Reset to default configuration
export function resetConfig() {
    config = { ...DEFAULT_CONFIG };
}
