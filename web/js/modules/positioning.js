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
    
    // Find nodes in group silently
    
    const nodes = [];
    
    // Method 1: Check if nodes have group_id property (most common)
    const method1Nodes = app.graph._nodes.filter(node => 
        node.group_id === groupId
    );
    nodes.push(...method1Nodes);
    
    // Method 2: Check if nodes have group property (alternative)
    const method2Nodes = app.graph._nodes.filter(node => 
        node.group === groupId
    );
    nodes.push(...method2Nodes);
    
    // Method 2.5: Check if nodes have group property as string (some versions)
    const method2bNodes = app.graph._nodes.filter(node => 
        node.group === groupName
    );
    nodes.push(...method2bNodes);
    
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
            
            // Node overlaps with group bounds
            
            return overlaps;
        });
        
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
    
    // Remove duplicates and return unique nodes
    const uniqueNodes = [];
    const seenIds = new Set();
    
    for (const node of nodes) {
        if (!seenIds.has(node.id)) {
            seenIds.add(node.id);
            uniqueNodes.push(node);
        }
    }
    
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
    
    // Convert mouse position to graph coordinates
    
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
        } catch (error) {
            graphPos = [...mousePos];
        }
    }
    // Method 2: Use DragAndScale's convertOffsetToCanvas method
    else if (canvas.ds && canvas.ds.convertOffsetToCanvas && typeof canvas.ds.convertOffsetToCanvas === 'function') {
        try {
            graphPos = canvas.ds.convertOffsetToCanvas(mousePos[0], mousePos[1]);
        } catch (error) {
            graphPos = [...mousePos];
        }
    }
    // Method 3: Use manual conversion as fallback
    else {
        // Get canvas transform properties (scale and offset)
        const scale = canvas.scale || 1;
        const offset = canvas.offset || [0, 0];
        
        // Convert screen coordinates to graph coordinates
        // Formula: (screen_pos - offset) / scale
        const convertedPos = [
            (mousePos[0] - offset[0]) / scale,
            (mousePos[1] - offset[1]) / scale
        ];
        
        graphPos = convertedPos;
    }
    
    // Position group at calculated coordinates
    
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
    
    // Calculate new position (center the group on the mouse)
    const newGroupPos = [
        graphPos[0] - groupDimensions.width / 2,
        graphPos[1] - groupDimensions.height / 2
    ];
    
    // Find nodes in the group BEFORE moving
    const nodesInGroup = findNodesInGroup(groupName, groupId);
    
    // Store the old group position BEFORE moving it
    const oldGroupPos = [...group.pos];
    
    // Move the group
    group.pos = newGroupPos;
    
    // Calculate the offset from old to new position
    const offsetX = newGroupPos[0] - oldGroupPos[0];
    const offsetY = newGroupPos[1] - oldGroupPos[1];
    
    // Move all nodes in the group by the same offset
    for (const node of nodesInGroup) {
        if (node.pos) {
            node.pos[0] += offsetX;
            node.pos[1] += offsetY;
        }
    }
    
    // Update the canvas
    canvas.setDirty();
    
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
