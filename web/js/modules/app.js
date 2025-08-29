// ComfyUI App Access Module
// Provides utilities for accessing and working with the ComfyUI application

let app = null;

// Function to get the ComfyUI app instance
export function getApp() {
    if (app) return app;
    
    // Try different ways to access the ComfyUI app
    if (window.app) {
        app = window.app;
        return app;
    }
    
    // Look for ComfyUI in the global scope
    if (window.ComfyApp) {
        app = window.ComfyApp;
        return app;
    }
    
    return null;
}

// Function to wait for ComfyUI to be ready
export function waitForComfyUI(callback) {
    const app = getApp();
    if (app && app.graph) {
        callback();
    } else {
        setTimeout(() => waitForComfyUI(callback), 1000);
    }
}

// Function to setup graph monitoring (like rgthree-comfy)
export function setupGraphMonitoring(onGraphChange) {
    const app = getApp();
    if (!app || !app.graph) return;
    
    // Monitor graph changes
    const originalChange = app.graph.change;
    app.graph.change = function() {
        originalChange.call(this);
        setTimeout(() => onGraphChange('graph_changed'), 100);
    };
    
    // Monitor node additions
    const originalAddNode = app.graph.addNode;
    app.graph.addNode = function(node) {
        const result = originalAddNode.call(this, node);
        setTimeout(() => onGraphChange('node_added'), 100);
        return result;
    };
}
