# Group Positioner Node

A custom node that allows you to position a ComfyUI group under your cursor using a keyboard shortcut.

## Features

- **Keyboard Shortcut**: Press a configurable key (default: F8) to position a group under your cursor
- **Visual Button**: A floating button in the top-right corner for manual positioning
- **Configurable**: Set the group name and shortcut key through the node interface
- **Real-time Updates**: Configuration changes are applied immediately

## Usage

### 1. Add the Group Positioner Node

1. Add the "FF Group Positioner" node to your workflow
2. Configure the following parameters:
   - **Group Name**: The name of the group you want to position (must match exactly)
   - **Shortcut Key**: The keyboard shortcut (e.g., "F8", "Ctrl+G", "Alt+P")
   - **Enabled**: Toggle the feature on/off

### 2. Create a Group

1. Select the nodes you want to group
2. Right-click and choose "Group" or press Ctrl+G
3. Give your group the same name as specified in the Group Positioner node

### 3. Use the Feature

- **Keyboard Shortcut**: Press your configured shortcut key while your cursor is over the canvas
- **Button Click**: Click the floating green button in the top-right corner
- The group will be positioned so its center is under your cursor

## Configuration Examples

### Basic Setup
- Group Name: `MyGroup`
- Shortcut Key: `F8`
- Enabled: `True`

### Advanced Setup
- Group Name: `ImageProcessing`
- Shortcut Key: `Ctrl+Shift+P`
- Enabled: `True`

## Technical Details

- The extension automatically loads when ComfyUI starts
- Configuration is saved to `web/config/group_positioner.json`
- The feature works with any group name that exists in the current workflow
- Mouse position is tracked in real-time from the canvas

## Troubleshooting

### Group Not Found
- Ensure the group name matches exactly (case-sensitive)
- Make sure the group exists in your current workflow
- Check the browser console for error messages

### Shortcut Not Working
- Verify the shortcut key is correctly configured
- Check that the feature is enabled
- Ensure no other extensions are using the same shortcut

### Button Not Visible
- Refresh the page if the button doesn't appear
- Check that the extension loaded properly in the browser console
- Ensure the web directory is properly served by ComfyUI
