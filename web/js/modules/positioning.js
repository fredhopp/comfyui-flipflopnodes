// Group Positioning Module
// Adapts rgthree-comfy's positioning logic for cursor-based positioning

import { getApp } from './app.js';

// Get all nodes within a group (adapted from rgthree-comfy)
export function getGroupNodes(group) {
    const app = getApp();
    if (!app || !app.graph || !app.graph._nodes) return [];
    
    return app.graph._nodes.filter(node => node.group_id === group.id);
}

// Position group under cursor (adapted from rgthree-comfy's centerOnNode logic)
export function positionGroupUnderCursor(groupName) {
    const app = getApp();
    if (!app) {
        console.warn('[FF Group Positioner] ComfyUI app not available');
        return false;
    }
    
    const group = findGroupByName(groupName);
    if (!group) {
        console.warn(`[FF Group Positioner] Group '${groupName}' not found`);
        return false;
    }
    
    // Get current mouse position from canvas
    const canvas = app.canvas;
    if (!canvas || !canvas.mouse) {
        console.warn('[FF Group Positioner] Mouse position not available');
        return false;
    }
    
    const mousePos = canvas.mouse;
    console.log('[FF Group Positioner] Mouse position:', mousePos);
    
    // Calculate group dimensions (like rgthree-comfy does)
    const groupWidth = group.size[0];
    const groupHeight = group.size[1];
    
    // Get canvas offset and zoom for proper positioning
    const canvasOffset = canvas.offset || [0, 0];
    const canvasScale = canvas.scale || 1;
    
    console.log('[FF Group Positioner] Canvas offset:', canvasOffset);
    console.log('[FF Group Positioner] Canvas scale:', canvasScale);
    
    // Calculate adjusted mouse position (accounting for canvas transform)
    const adjustedMouseX = (mousePos[0] - canvasOffset[0]) / canvasScale;
    const adjustedMouseY = (mousePos[1] - canvasOffset[1]) / canvasScale;
    
    console.log('[FF Group Positioner] Adjusted mouse position:', [adjustedMouseX, adjustedMouseY]);
    
    // Calculate the new position (center group under cursor)
    const currentGroupX = group.pos[0];
    const currentGroupY = group.pos[1];
    const newGroupX = adjustedMouseX - groupWidth / 2;
    const newGroupY = adjustedMouseY - groupHeight / 2;
    
    const offsetX = newGroupX - currentGroupX;
    const offsetY = newGroupY - currentGroupY;
    
    console.log('[FF Group Positioner] Group offset calculated:', { offsetX, offsetY });
    
    // Update group position
    group.pos = [newGroupX, newGroupY];
    
    // Move all nodes within the group by the same offset (like rgthree-comfy)
    const groupNodes = getGroupNodes(group);
    let movedNodes = 0;
    
    for (const node of groupNodes) {
        const oldPos = node.pos;
        node.pos = [oldPos[0] + offsetX, oldPos[1] + offsetY];
        movedNodes++;
        console.log(`[FF Group Positioner] Moved node ${node.title || node.id} from [${oldPos[0]}, ${oldPos[1]}] to [${node.pos[0]}, ${node.pos[1]}]`);
    }
    
    console.log(`[FF Group Positioner] Moved ${movedNodes} nodes with the group`);
    
    // Trigger graph change to update the UI (like rgthree-comfy)
    app.graph.change();
    
    console.log(`[FF Group Positioner] Successfully positioned group '${groupName}' and its contents at (${newGroupX.toFixed(2)}, ${newGroupY.toFixed(2)})`);
    
    return true;
}

// Find a group by name (adapted from rgthree-comfy's group handling)
export function findGroupByName(groupName) {
    const app = getApp();
    if (!app || !app.graph || !app.graph._groups) {
        console.log('[FF Group Positioner] App or graph not available');
        return null;
    }
    
    const groups = app.graph._groups;
    const matchingGroups = groups.filter(g => g.title === groupName);
    
    if (matchingGroups.length === 0) {
        console.log(`[FF Group Positioner] Group '${groupName}' not found`);
        return null;
    } else if (matchingGroups.length > 1) {
        console.warn(`[FF Group Positioner] Multiple groups with name '${groupName}' found, using first one`);
    }
    
    const group = matchingGroups[0];
    console.log(`[FF Group Positioner] Found group:`, group);
    return group;
}

// Validate group name and check for duplicates (like rgthree-comfy's validation)
export function validateGroupName(groupName) {
    const app = getApp();
    if (!app || !app.graph || !app.graph._groups) {
        return {
            valid: false,
            available_groups: [],
            matching_groups: [],
            error: 'Cannot validate group - app or graph not available'
        };
    }
    
    const groups = app.graph._groups;
    const matchingGroups = groups.filter(g => g.title === groupName);
    
    return {
        valid: matchingGroups.length > 0,
        available_groups: groups.map(g => g.title),
        matching_groups: matchingGroups.map(g => g.title),
        error: matchingGroups.length === 0 ? `No group found with name '${groupName}'` : null
    };
}
