// Group Positioning Module
// Handles group positioning with proper coordinate conversion

import { getApp } from './app.js';
import { getConfig } from './config.js';

// Validate group name and return available groups
export function validateGroupName(groupName) {
    const app = getApp();
    if (!app || !app.graph || !app.graph._groups) {
        return {
            error: 'Cannot access ComfyUI graph',
            available_groups: [],
            matching_groups: []
        };
    }
    
    const available_groups = app.graph._groups.map(g => g.title);
    const matching_groups = available_groups.filter(name => 
        name.toLowerCase().includes(groupName.toLowerCase())
    );
    
    const error = available_groups.length === 0 ? 'No groups found in graph' :
                  matching_groups.length === 0 ? `Group '${groupName}' not found` : null;
    
    return { error, available_groups, matching_groups };
}

// Find all nodes within a group using multiple detection methods
export function findNodesInGroup(groupName, groupId) {
    const app = getApp();
    if (!app || !app.graph || !app.graph._nodes) {
        console.error('[FF Group Positioner] Cannot access ComfyUI graph');
        return [];
    }
    
    console.log(`[FF Group Positioner] Looking for nodes in group '${groupName}' (id: ${groupId})`);
    console.log(`[FF Group Positioner] Total nodes in graph: ${app.graph._nodes.length}`);
    
    const nodes = [];
    
    // Method 1: Check if nodes have group_id property
    const method1Nodes = app.graph._nodes.filter(node => 
        node.group_id === groupId
    );
    console.log(`[FF Group Positioner] Method 1 (group_id): Found ${method1Nodes.length} nodes`);
    nodes.push(...method1Nodes);
    
    // Method 2: Check if nodes have group property
    const method2Nodes = app.graph._nodes.filter(node => 
        node.group === groupId
    );
    console.log(`[FF Group Positioner] Method 2 (group): Found ${method2Nodes.length} nodes`);
    nodes.push(...method2Nodes);
    
    // Method 3: Check if nodes overlap with group bounds (fallback)
    const group = app.graph._groups.find(g => g.id === groupId);
    if (group && group.pos && group.size) {
        const overlappingNodes = app.graph._nodes.filter(node => {
            if (!node.pos) return false;
            
            const nodeBounds = {
                x: node.pos[0],
                y: node.pos[1],
                width: node.size ? node.size[0] : 200,
                height: node.size ? node.size[1] : 100
            };
            
            const groupBounds = {
                x: group.pos[0],
                y: group.pos[1],
                width: group.size[0],
                height: group.size[1]
            };
            
            // Check if node overlaps with group bounds
            const overlaps = !(nodeBounds.x > groupBounds.x + groupBounds.width ||
                             nodeBounds.x + nodeBounds.width < groupBounds.x ||
                             nodeBounds.y > groupBounds.y + groupBounds.height ||
                             nodeBounds.y + nodeBounds.height < groupBounds.y);
            
            if (overlaps) {
                console.log(`[FF Group Positioner] Node ${node.title || node.type} (${node.comfyClass || 'unknown'}) overlaps with group bounds`);
                console.log(`  Node: [${nodeBounds.x}, ${nodeBounds.y}] to [${nodeBounds.x + nodeBounds.width}, ${nodeBounds.y + nodeBounds.height}]`);
                console.log(`  Group: [${groupBounds.x}, ${groupBounds.y}] to [${groupBounds.x + groupBounds.width}, ${groupBounds.y + groupBounds.height}]`);
            }
            
            return overlaps;
        });
        
        console.log(`[FF Group Positioner] Method 3 (bounds): Found ${overlappingNodes.length} nodes`);
        nodes.push(...overlappingNodes);
    }
    
    // Method 4: Check for any group-related properties
    const method4Nodes = app.graph._nodes.filter(node => {
        const hasGroupProperty = node.group_id !== undefined || 
                                node.group !== undefined || 
                                node.groupName !== undefined ||
                                node.group_name !== undefined;
        return hasGroupProperty;
    });
    console.log(`[FF Group Positioner] Method 4 (any group property): Found ${method4Nodes.length} nodes`);
    
    // Remove duplicates and return unique nodes
    const uniqueNodes = [];
    const seenIds = new Set();
    
    for (const node of nodes) {
        if (!seenIds.has(node.id)) {
            seenIds.add(node.id);
            uniqueNodes.push(node);
        }
    }
    
    console.log(`[FF Group Positioner] Found ${uniqueNodes.length} unique nodes in group`);
    return uniqueNodes;
}

// Position a group and its contents at the specified coordinates
export async function positionGroupAt(groupName, groupId, mousePos) {
    const app = getApp();
    if (!app || !app.canvas) {
        console.error('[FF Group Positioner] Cannot access ComfyUI app or canvas');
        return false;
    }
    
    const canvas = app.canvas;
    
    console.log(`[FF Group Positioner] Raw mouse position: [${mousePos[0]}, ${mousePos[1]}]`);
    
    // PROPER COORDINATE CONVERSION: Use ComfyUI's built-in methods
    let graphPos;
    
    // Method 1: Use ComfyUI's convertEventToCanvasOffset method (PROPER WAY)
    if (canvas.convertEventToCanvasOffset && typeof canvas.convertEventToCanvasOffset === 'function') {
        // Create a mock event object with clientX and clientY
        const mockEvent = {
            clientX: mousePos[0],
            clientY: mousePos[1]
        };
        
        try {
            graphPos = canvas.convertEventToCanvasOffset(mockEvent);
            console.log(`[FF Group Positioner] Using canvas.convertEventToCanvasOffset method: [${graphPos[0]}, ${graphPos[1]}]`);
        } catch (error) {
            console.error(`[FF Group Positioner] Error using convertEventToCanvasOffset: ${error}`);
            graphPos = [...mousePos];
        }
    }
    // Method 2: Use DragAndScale's convertOffsetToCanvas method
    else if (canvas.ds && canvas.ds.convertOffsetToCanvas && typeof canvas.ds.convertOffsetToCanvas === 'function') {
        try {
            graphPos = canvas.ds.convertOffsetToCanvas(mousePos[0], mousePos[1]);
            console.log(`[FF Group Positioner] Using canvas.ds.convertOffsetToCanvas method: [${graphPos[0]}, ${graphPos[1]}]`);
        } catch (error) {
            console.error(`[FF Group Positioner] Error using ds.convertOffsetToCanvas: ${error}`);
            graphPos = [...mousePos];
        }
    }
    // Method 3: Use manual conversion as fallback
    else {
        // Get canvas transform properties (scale and offset)
        const scale = canvas.scale || 1;
        const offset = canvas.offset || [0, 0];
        
        console.log(`[FF Group Positioner] Canvas transform properties: scale=${scale}, offset=${JSON.stringify(offset)}`);
        
        // Convert screen coordinates to graph coordinates
        // Formula: (screen_pos - offset) / scale
        const convertedPos = [
            (mousePos[0] - offset[0]) / scale,
            (mousePos[1] - offset[1]) / scale
        ];
        
        console.log(`[FF Group Positioner] Using manual coordinate conversion: [${convertedPos[0]}, ${convertedPos[1]}]`);
        graphPos = convertedPos;
    }
    
    console.log(`[FF Group Positioner] Final graph coordinates: [${graphPos[0]}, ${graphPos[1]}]`);
    
    // Find the group
    const group = app.graph._groups.find(g => g.id === groupId);
    if (!group) {
        console.error(`[FF Group Positioner] Group with ID ${groupId} not found`);
        return false;
    }
    
    // Calculate group dimensions and position
    const groupSize = group.size || [200, 100];
    const groupDimensions = {
        width: groupSize[0],
        height: groupSize[1]
    };
    
    console.log(`[FF Group Positioner] Group dimensions: ${JSON.stringify(groupDimensions)}`);
    
    // Calculate new position (center the group on the mouse)
    const newGroupPos = [
        graphPos[0] - groupDimensions.width / 2,
        graphPos[1] - groupDimensions.height / 2
    ];
    
    console.log(`[FF Group Positioner] Position calculation: ${JSON.stringify({
        mousePos: graphPos,
        groupSize: groupDimensions,
        newGroupPos: newGroupPos
    })}`);
    
    // Find nodes in the group BEFORE moving
    console.log(`[FF Group Positioner] Finding nodes BEFORE moving group...`);
    const nodesInGroup = findNodesInGroup(groupName, groupId);
    
    // Move the group
    group.pos = newGroupPos;
    
    // Move all nodes in the group by the same offset
    const oldGroupPos = group.pos;
    const offsetX = newGroupPos[0] - oldGroupPos[0];
    const offsetY = newGroupPos[1] - oldGroupPos[1];
    
    console.log(`[FF Group Positioner] Moving ${nodesInGroup.length} nodes by offset [${offsetX}, ${offsetY}]`);
    
    for (const node of nodesInGroup) {
        if (node.pos) {
            node.pos[0] += offsetX;
            node.pos[1] += offsetY;
            console.log(`[FF Group Positioner] Moved node ${node.title || node.id} to [${node.pos[0]}, ${node.pos[1]}]`);
        }
    }
    
    // Update the canvas
    canvas.setDirty();
    
    console.log(`[FF Group Positioner] Group '${groupName}' positioned at [${newGroupPos[0]}, ${newGroupPos[1]}]`);
    return true;
}

// Legacy function for backward compatibility
export function positionGroupUnderCursor(groupName) {
    const app = getApp();
    if (!app || !app.canvas) {
        console.error('[FF Group Positioner] Cannot access ComfyUI app or canvas');
        return false;
    }
    
    const group = app.graph._groups.find(g => g.title === groupName);
    if (!group) {
        console.error(`[FF Group Positioner] Group '${groupName}' not found`);
        return false;
    }
    
    // Use the current mouse position from the canvas
    const mousePos = app.canvas.mouse || [0, 0];
    return positionGroupAt(groupName, group.id, mousePos);
}
