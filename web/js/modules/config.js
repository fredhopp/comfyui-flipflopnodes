// Configuration Management Module
// Handles loading and caching of configuration with improved cache-busting

// Default configuration
const DEFAULT_CONFIG = {
    group_name: "MOVABLE",
    shortcut_key: "F8",
    enabled: true,
    debug_mode: true
};

// Current configuration
let config = { ...DEFAULT_CONFIG };

// Load configuration from the backend with aggressive cache-busting
export async function loadConfig() {
    try {
        console.log('[FF Group Positioner] Loading config from server...');
        
        // Add aggressive cache-busting parameters
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(7);
        const response = await fetch(`/flipflop/config/group_positioner.json?t=${timestamp}&r=${randomId}`, {
            method: 'GET',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
        
        console.log('[FF Group Positioner] Server response status:', response.status);
        
        if (response.ok) {
            const newConfig = await response.json();
            console.log('[FF Group Positioner] Server returned config:', newConfig);
            
            // Validate the config structure
            if (!newConfig || typeof newConfig !== 'object') {
                console.warn('[FF Group Positioner] Invalid config structure:', newConfig);
                return false;
            }
            
            const oldConfig = JSON.stringify(config);
            config = { ...config, ...newConfig };
            const newConfigStr = JSON.stringify(config);
            
            console.log('[FF Group Positioner] Current config after merge:', config);
            
            if (oldConfig !== newConfigStr) {
                console.log('[FF Group Positioner] Configuration changed!');
                console.log('[FF Group Positioner] Old config:', JSON.parse(oldConfig));
                console.log('[FF Group Positioner] New config:', config);
                return true; // Config changed
            } else {
                console.log('[FF Group Positioner] No config changes detected');
                return false; // No changes
            }
        } else {
            console.warn('[FF Group Positioner] Server returned status:', response.status);
            // Try to get response text for debugging
            try {
                const errorText = await response.text();
                console.warn('[FF Group Positioner] Error response:', errorText);
            } catch (e) {
                console.warn('[FF Group Positioner] Could not read error response');
            }
            return false;
        }
    } catch (error) {
        console.warn('[FF Group Positioner] Could not load group positioner config:', error);
        console.warn('[FF Group Positioner] Error details:', error.message);
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
