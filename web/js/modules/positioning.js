// Group Positioning Module
// Adapts rgthree-comfy's positioning logic for cursor-based positioning

import { getApp } from './app.js';

// Get all nodes within a group (investigate ComfyUI's group-node association)
export function getGroupNodes(group) {
    const app = getApp();
    if (!app || !app.graph || !app.graph._nodes) return [];
    
    console.log(`[FF Group Positioner] Looking for nodes in group '${group.title}' (id: ${group.id})`);
    console.log(`[FF Group Positioner] Total nodes in graph: ${app.graph._nodes.length}`);
    
    // Debug: Log all nodes and their group associations (only in debug mode)
    const config = getConfig();
    if (config && config.debug_mode) {
        app.graph._nodes.forEach((node, index) => {
            console.log(`[FF Group Positioner] Node ${index}: ${node.title || node.id} - group_id: ${node.group_id}, group: ${node.group}`);
        });
    }
    
    // Try different ways to find nodes in the group
    let groupNodes = [];
    
    // Method 1: Check group_id property
    const nodesByGroupId = app.graph._nodes.filter(node => node.group_id === group.id);
    console.log(`[FF Group Positioner] Method 1 (group_id): Found ${nodesByGroupId.length} nodes`);
    
    // Method 2: Check group property
    const nodesByGroup = app.graph._nodes.filter(node => node.group === group.id);
    console.log(`[FF Group Positioner] Method 2 (group): Found ${nodesByGroup.length} nodes`);
    
    // Method 3: Check if node is within group bounds (IMPROVED - this is working!)
    const nodesInBounds = app.graph._nodes.filter(node => {
        if (!node.pos || !group.pos || !group.size) return false;
        
        const nodeX = node.pos[0];
        const nodeY = node.pos[1];
        const groupX = group.pos[0];
        const groupY = group.pos[1];
        const groupWidth = group.size[0];
        const groupHeight = group.size[1];
        
        // Check if node is within group bounds (with tolerance)
        const tolerance = 30; // pixels - increased for better detection
        
        // Calculate node bounds (assuming typical node size)
        const nodeWidth = 200; // typical node width
        const nodeHeight = 100; // typical node height
        
        // Check if node overlaps with group bounds
        const nodeLeft = nodeX;
        const nodeRight = nodeX + nodeWidth;
        const nodeTop = nodeY;
        const nodeBottom = nodeY + nodeHeight;
        
        const groupLeft = groupX - tolerance;
        const groupRight = groupX + groupWidth + tolerance;
        const groupTop = groupY - tolerance;
        const groupBottom = groupY + groupHeight + tolerance;
        
        // Check for overlap
        const overlaps = !(nodeRight < groupLeft || 
                          nodeLeft > groupRight || 
                          nodeBottom < groupTop || 
                          nodeTop > groupBottom);
        
        if (overlaps) {
            console.log(`[FF Group Positioner] Node ${node.title || node.id} overlaps with group bounds`);
            console.log(`  Node: [${nodeLeft}, ${nodeTop}] to [${nodeRight}, ${nodeBottom}]`);
            console.log(`  Group: [${groupLeft}, ${groupTop}] to [${groupRight}, ${groupBottom}]`);
        }
        
        return overlaps;
    });
    console.log(`[FF Group Positioner] Method 3 (bounds): Found ${nodesInBounds.length} nodes`);
    
    // Method 4: Check for any group-related properties
    const nodesByAnyGroup = app.graph._nodes.filter(node => {
        // Check all possible group-related properties
        return node.group_id === group.id || 
               node.group === group.id ||
               node.groupId === group.id ||
               node.group_id === group.title ||
               node.group === group.title;
    });
    console.log(`[FF Group Positioner] Method 4 (any group property): Found ${nodesByAnyGroup.length} nodes`);
    
    // Use the method that found the most nodes, or combine them
    const allMethods = [
        { name: 'group_id', nodes: nodesByGroupId },
        { name: 'group', nodes: nodesByGroup },
        { name: 'bounds', nodes: nodesInBounds },
        { name: 'any_group', nodes: nodesByAnyGroup }
    ];
    
    // Find the method with the most nodes
    const bestMethod = allMethods.reduce((best, current) => 
        current.nodes.length > best.nodes.length ? current : best
    );
    
    if (bestMethod.nodes.length > 0) {
        groupNodes = bestMethod.nodes;
        console.log(`[FF Group Positioner] Using Method '${bestMethod.name}' - found ${groupNodes.length} nodes`);
        
        // Log group bounds for debugging
        console.log(`[FF Group Positioner] Group bounds: [${group.pos[0]}, ${group.pos[1]}] size [${group.size[0]}, ${group.size[1]}]`);
    } else {
        console.log(`[FF Group Positioner] No nodes found using any method`);
    }
    
    // Log the nodes we found
    if (groupNodes.length > 0) {
        groupNodes.forEach((node, index) => {
            console.log(`[FF Group Positioner] - Node ${index}: ${node.title || node.id} at [${node.pos[0]}, ${node.pos[1]}]`);
        });
    }
    
    return groupNodes;
}

// Position group under cursor (using proper coordinate conversion)
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
    console.log('[FF Group Positioner] Mouse position type:', typeof mousePos);
    console.log('[FF Group Positioner] Mouse position length:', mousePos.length);
    console.log('[FF Group Positioner] Mouse position values:', [mousePos[0], mousePos[1]]);
    
    // PROPER COORDINATE CONVERSION: Use ComfyUI's built-in methods
    let graphPos;
    
    // DEBUG: Log all available canvas properties
    console.log('[FF Group Positioner] Canvas debug info:', {
        canvas: canvas,
        canvasType: typeof canvas,
        canvasKeys: Object.keys(canvas),
        mouse: canvas.mouse,
        mouseType: typeof canvas.mouse,
        scale: canvas.scale,
        offset: canvas.offset,
        ds: canvas.ds,
        dsKeys: canvas.ds ? Object.keys(canvas.ds) : null,
        transform: canvas.transform,
        last_mouse_position: canvas.last_mouse_position,
        canvasElement: canvas.canvas,
        canvasElementRect: canvas.canvas ? canvas.canvas.getBoundingClientRect() : null
    });
    
    // Method 1: Use ComfyUI's convertEventToCanvasOffset method (PROPER WAY)
    if (canvas.convertEventToCanvasOffset && typeof canvas.convertEventToCanvasOffset === 'function') {
        // Create a mock event object with clientX and clientY
        const mockEvent = {
            clientX: mousePos[0],
            clientY: mousePos[1]
        };
        
        try {
            graphPos = canvas.convertEventToCanvasOffset(mockEvent);
            console.log('[FF Group Positioner] Using canvas.convertEventToCanvasOffset method:', graphPos);
        } catch (error) {
            console.error('[FF Group Positioner] Error using convertEventToCanvasOffset:', error);
            graphPos = [...mousePos];
        }
    }
    // Method 2: Use DragAndScale's convertOffsetToCanvas method
    else if (canvas.ds && canvas.ds.convertOffsetToCanvas && typeof canvas.ds.convertOffsetToCanvas === 'function') {
        try {
            graphPos = canvas.ds.convertOffsetToCanvas(mousePos[0], mousePos[1]);
            console.log('[FF Group Positioner] Using canvas.ds.convertOffsetToCanvas method:', graphPos);
        } catch (error) {
            console.error('[FF Group Positioner] Error using ds.convertOffsetToCanvas:', error);
            graphPos = [...mousePos];
        }
    }
    // Method 3: Use manual conversion as fallback
    else {
        // Get canvas transform properties (scale and offset)
        const scale = canvas.scale || 1;
        const offset = canvas.offset || [0, 0];
        
        console.log('[FF Group Positioner] Canvas transform properties:', { 
            scale: scale, 
            offset: offset,
            offsetX: offset[0],
            offsetY: offset[1]
        });
        
        // Convert screen coordinates to graph coordinates
        // Formula: (screen_pos - offset) / scale
        const convertedPos = [
            (mousePos[0] - offset[0]) / scale,
            (mousePos[1] - offset[1]) / scale
        ];
        
        console.log('[FF Group Positioner] Using manual coordinate conversion:', convertedPos);
        console.log('[FF Group Positioner] Conversion details:', {
            mousePos: mousePos,
            offset: offset,
            scale: scale,
            calculated: convertedPos
        });
        
        graphPos = convertedPos;
    }
    
    console.log('[FF Group Positioner] Final graph coordinates:', graphPos);
    
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
        offset: [offsetX, offsetY],
        mousePos: mousePos,
        graphPos: graphPos
    });
    
    // CRITICAL FIX: Find nodes BEFORE moving the group
    console.log('[FF Group Positioner] Finding nodes BEFORE moving group...');
    const groupNodes = getGroupNodes(group);
    console.log(`[FF Group Positioner] Found ${groupNodes.length} nodes to move with group`);
    
    // Check for drawing order properties (debugging)
    console.log('[FF Group Positioner] Checking for drawing order properties...');
    console.log('[FF Group Positioner] Group properties:', Object.keys(group));
    if (groupNodes.length > 0) {
        console.log('[FF Group Positioner] First node properties:', Object.keys(groupNodes[0]));
    }
    
    // DRAWING ORDER FIX: Move group FIRST to ensure it stays behind nodes
    console.log('[FF Group Positioner] Moving group FIRST to maintain proper layering...');
    group.pos = [newGroupX, newGroupY];
    console.log(`[FF Group Positioner] Moved group to [${newGroupX}, ${newGroupY}]`);
    
    // Then move all nodes within the group by the same offset
    let movedNodes = 0;
    for (const node of groupNodes) {
        if (node.pos) {
            const oldPos = [...node.pos]; // Create a copy
            node.pos = [oldPos[0] + offsetX, oldPos[1] + offsetY];
            movedNodes++;
            console.log(`[FF Group Positioner] Moved node ${node.title || node.id} from [${oldPos[0]}, ${oldPos[1]}] to [${node.pos[0]}, ${node.pos[1]}]`);
        }
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

// Helper function to get config (imported from config.js)
function getConfig() {
    try {
        // Try to import dynamically to avoid circular dependencies
        const { getConfig } = require('./config.js');
        return getConfig();
    } catch (e) {
        // Fallback if import fails
        return null;
    }
}
