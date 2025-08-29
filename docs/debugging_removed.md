# Debugging Code Removed - Documentation

This document tracks all debugging code that was removed during the cleanup phase. This information is preserved in case we want to reimplement debugging with a clean logger in the future.

## Overview

During development, extensive debugging was added to troubleshoot:
- Group positioning accuracy
- Node detection within groups
- Coordinate conversion methods
- Configuration loading
- Keyboard event handling
- Mouse position tracking

## Files Modified

### 1. `web/js/modules/positioning.js`

#### Removed Debug Logging:
- **Node Detection Debugging:**
  ```javascript
  // Debug: Log all nodes and their group properties
  app.graph._nodes.forEach((node, index) => {
      console.log(`[FF Group Positioner] Node ${index}: ${node.title || node.type} - group_id: ${node.group_id}, group: ${node.group}, groupName: ${node.groupName}, group_name: ${node.group_name}`);
  });
  ```

- **Method Detection Logging:**
  ```javascript
  console.log(`[FF Group Positioner] Method 1 (group_id): Found ${method1Nodes.length} nodes`);
  console.log(`[FF Group Positioner] Method 2 (group): Found ${method2Nodes.length} nodes`);
  console.log(`[FF Group Positioner] Method 2b (group as string): Found ${method2bNodes.length} nodes`);
  console.log(`[FF Group Positioner] Method 3 (bounds): Found ${overlappingNodes.length} nodes`);
  console.log(`[FF Group Positioner] Method 4 (any group property): Found ${method4Nodes.length} nodes`);
  console.log(`[FF Group Positioner] Found ${uniqueNodes.length} unique nodes in group`);
  ```

- **Coordinate Conversion Debugging:**
  ```javascript
  console.log(`[FF Group Positioner] Raw mouse position: [${mousePos[0]}, ${mousePos[1]}]`);
  console.log(`[FF Group Positioner] Using canvas.convertEventToCanvasOffset method: [${graphPos[0]}, ${graphPos[1]}]`);
  console.log(`[FF Group Positioner] Using canvas.ds.convertOffsetToCanvas method: [${graphPos[0]}, ${graphPos[1]}]`);
  console.log(`[FF Group Positioner] Canvas transform properties: scale=${scale}, offset=${JSON.stringify(offset)}`);
  console.log(`[FF Group Positioner] Using manual coordinate conversion: [${convertedPos[0]}, ${convertedPos[1]}]`);
  console.log(`[FF Group Positioner] Final graph coordinates: [${graphPos[0]}, ${graphPos[1]}]`);
  ```

- **Group Positioning Debugging:**
  ```javascript
  console.log(`[FF Group Positioner] Group dimensions: ${JSON.stringify(groupDimensions)}`);
  console.log(`[FF Group Positioner] Position calculation: ${JSON.stringify({mousePos: graphPos, groupSize: groupDimensions, newGroupPos: newGroupPos})}`);
  console.log(`[FF Group Positioner] Finding nodes BEFORE moving group...`);
  console.log(`[FF Group Positioner] Moving ${nodesInGroup.length} nodes by offset [${offsetX}, ${offsetY}]`);
  console.log(`[FF Group Positioner] Moved node ${node.title || node.id} to [${node.pos[0]}, ${node.pos[1]}]`);
  console.log(`[FF Group Positioner] Group '${groupName}' positioned at [${newGroupPos[0]}, ${newGroupPos[1]}]`);
  ```

- **Bounds Overlap Debugging:**
  ```javascript
  console.log(`[FF Group Positioner] Node ${node.title || node.type} (${node.comfyClass || 'unknown'}) overlaps with group bounds`);
  console.log(`  Node: [${nodeBounds.x}, ${nodeBounds.y}] to [${nodeBounds.x + nodeBounds.width}, ${nodeBounds.y + nodeBounds.height}]`);
  console.log(`  Group: [${groupBounds.x}, ${groupBounds.y}] to [${groupBounds.x + groupBounds.width}, ${groupBounds.y + groupBounds.height}]`);
  ```

### 2. `web/js/modules/config.js`

#### Removed Debug Logging:
- **Configuration Loading:**
  ```javascript
  console.log(`[FF Group Positioner] Loading config from graph...`);
  console.log(`[FF Group Positioner] Config from graph: ${JSON.stringify(configFromGraph)}`);
  console.log(`[FF Group Positioner] Current config after merge: ${JSON.stringify(currentConfig)}`);
  console.log(`[FF Group Positioner] No config changes detected`);
  ```

### 3. `web/js/modules/keyboard.js`

#### Removed Debug Logging:
- **Keyboard Event Debugging:**
  ```javascript
  console.log(`[FF Group Positioner] Key pressed: ${event.key}, Key code: ${event.code}, Expected: ${expectedKey}`);
  console.log(`[FF Group Positioner] Shortcut matched! Triggering positioning...`);
  console.log(`[FF Group Positioner] Using mouse position: [${mousePos[0]}, ${mousePos[1]}]`);
  console.log(`[FF Group Positioner] Mouse position updated: [${event.clientX}, ${event.clientY}]`);
  ```

### 4. `web/js/modules/logging.js`

#### Removed Debug Logging:
- **Graph Event Debugging:**
  ```javascript
  console.log(`[FF Group Positioner] Graph event: ${eventType}`);
  ```

### 5. `nodes/group_positioner.py`

#### Removed Debug Logging:
- **Python Node Debugging:**
  ```python
  print(f"[FF Group Positioner] Group name: {group_name}")
  print(f"[FF Group Positioner] Shortcut key: {shortcut_key}")
  print(f"[FF Group Positioner] Debug mode: {debug_mode}")
  ```

## Debugging Categories

### 1. Node Detection Debugging
**Purpose:** Track how nodes are being detected within groups
**Key Information:**
- All node group properties (`group_id`, `group`, `groupName`, `group_name`)
- Which detection methods find nodes
- Node count per method
- Bounds overlap calculations

### 2. Coordinate Conversion Debugging
**Purpose:** Verify coordinate conversion accuracy
**Key Information:**
- Raw mouse positions
- Canvas transform properties (scale, offset)
- Conversion method used
- Final graph coordinates

### 3. Group Positioning Debugging
**Purpose:** Track group movement calculations
**Key Information:**
- Group dimensions
- Position calculations
- Node movement offsets
- Final positioning results

### 4. Configuration Debugging
**Purpose:** Monitor configuration loading and changes
**Key Information:**
- Configuration source (graph vs cache)
- Configuration values
- Change detection

### 5. Event Debugging
**Purpose:** Track user interactions
**Key Information:**
- Keyboard events and shortcuts
- Mouse position updates
- Graph change events

## Future Reimplementation Notes

### Clean Logger Requirements:
1. **Configurable Log Levels:** ERROR, WARN, INFO, DEBUG
2. **Module-Specific Logging:** Enable/disable per module
3. **Performance Considerations:** Avoid excessive logging in production
4. **Structured Output:** Consistent format for parsing
5. **Conditional Logging:** Only log when debug mode is enabled

### Recommended Logger Structure:
```javascript
// Example future logger implementation
const logger = {
    error: (module, message, data) => { /* always log */ },
    warn: (module, message, data) => { /* always log */ },
    info: (module, message, data) => { /* log if info level enabled */ },
    debug: (module, message, data) => { /* log if debug level enabled */ }
};
```

### Key Debug Points to Preserve:
1. **Node Detection Methods:** Track which methods find nodes
2. **Coordinate Conversion:** Verify accuracy of positioning
3. **Configuration Changes:** Monitor real-time updates
4. **Error Conditions:** Always log errors and warnings

## Version Information

- **Removed From:** v1.0-functional (commit 26cd5b7)
- **Date:** December 2024
- **Reason:** Production cleanup for better performance and cleaner code
- **Preserved:** All debugging logic and information for future reference
