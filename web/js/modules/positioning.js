// Group Positioning Module
// Adapts rgthree-comfy's positioning logic for cursor-based positioning

import { getApp } from './app.js';

// Get all nodes within a group (adapted from rgthree-comfy)
export function getGroupNodes(group) {
    const app = getApp();
    if (!app || !app.graph || !app.graph._nodes) return [];
    
    // Filter nodes that belong to this group
    const groupNodes = app.graph._nodes.filter(node => {
        // Check if node has a group_id that matches our group
        return node.group_id === group.id;
    });
    
    console.log(`[FF Group Positioner] Found ${groupNodes.length} nodes in group '${group.title}' (id: ${group.id})`);
    groupNodes.forEach(node => {
        console.log(`[FF Group Positioner] - Node: ${node.title || node.id} (group_id: ${node.group_id})`);
    });
    
    return groupNodes;
}

// Position group under cursor (fixed coordinate calculation)
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
    console.log('[FF Group Positioner] Raw mouse position:', mousePos);
    
    // Convert screen coordinates to graph coordinates
    // Use the correct canvas methods available in ComfyUI
    let graphPos;
    if (canvas.screenToCanvas) {
        // If screenToCanvas method exists, use it
        graphPos = canvas.screenToCanvas(mousePos[0], mousePos[1]);
    } else if (canvas.ds && canvas.ds.screenToCanvas) {
        // Try the display system's screenToCanvas method
        graphPos = canvas.ds.screenToCanvas(mousePos[0], mousePos[1]);
    } else {
        // Fallback: manual coordinate conversion using canvas transform
        const offset = canvas.offset || [0, 0];
        const scale = canvas.scale || 1;
        graphPos = [
            (mousePos[0] - offset[0]) / scale,
            (mousePos[1] - offset[1]) / scale
        ];
        console.log('[FF Group Positioner] Using fallback coordinate conversion');
    }
    
    console.log('[FF Group Positioner] Converted to graph coordinates:', graphPos);
    
    // Calculate group dimensions
    const groupWidth = group.size[0];
    const groupHeight = group.size[1];
    
    console.log('[FF Group Positioner] Group dimensions:', { width: groupWidth, height: groupHeight });
    
    // Calculate the new position (center group under cursor)
    const currentGroupX = group.pos[0];
    const currentGroupY = group.pos[1];
    const newGroupX = graphPos[0] - groupWidth / 2;
    const newGroupY = graphPos[1] - groupHeight / 2;
    
    const offsetX = newGroupX - currentGroupX;
    const offsetY = newGroupY - currentGroupY;
    
    console.log('[FF Group Positioner] Position calculation:', {
        current: [currentGroupX, currentGroupY],
        new: [newGroupX, newGroupY],
        offset: [offsetX, offsetY]
    });
    
    // Update group position
    group.pos = [newGroupX, newGroupY];
    
    // Move all nodes within the group by the same offset
    const groupNodes = getGroupNodes(group);
    let movedNodes = 0;
    
    for (const node of groupNodes) {
        const oldPos = node.pos;
        node.pos = [oldPos[0] + offsetX, oldPos[1] + offsetY];
        movedNodes++;
        console.log(`[FF Group Positioner] Moved node ${node.title || node.id} from [${oldPos[0]}, ${oldPos[1]}] to [${node.pos[0]}, ${node.pos[1]}]`);
    }
    
    console.log(`[FF Group Positioner] Moved ${movedNodes} nodes with the group`);
    
    // Trigger graph change to update the UI
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
        console.log('[FF Group Positioner] Available groups:', groups.map(g => g.title));
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
