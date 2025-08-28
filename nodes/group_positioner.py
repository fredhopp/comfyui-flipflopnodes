import json
import os
from pathlib import Path
from ..categories import structure

class FlipFlop_Group_Positioner:
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "group_name": ("STRING", {
                    "default": "MyGroup",
                    "multiline": False,
                    "placeholder": "Enter the group name to position"
                }),
                "shortcut_key": ("STRING", {
                    "default": "F8",
                    "multiline": False,
                    "placeholder": "Keyboard shortcut (e.g., F8, Ctrl+G)"
                }),
                "enabled": ("BOOLEAN", {"default": True}),
                "debug_mode": ("BOOLEAN", {"default": False}),
            }
        }
    
    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("status",)
    FUNCTION = "configure_positioner"
    CATEGORY = structure.get('FlipFlop/UI', 'Utility')
    OUTPUT_NODE = True
    
    @classmethod
    def IS_CHANGED(cls, *args, **kwargs):
        return float("NaN")

    def configure_positioner(self, group_name, shortcut_key, enabled, debug_mode):
        # Save configuration to a JSON file that the frontend can read
        config = {
            "group_name": group_name,
            "shortcut_key": shortcut_key,
            "enabled": enabled,
            "debug_mode": debug_mode
        }
        
        # Get the directory where this node is located
        current_dir = Path(__file__).parent.parent
        config_file = current_dir / "web" / "config" / "group_positioner.json"
        
        # Ensure the config directory exists
        config_file.parent.mkdir(parents=True, exist_ok=True)
        
        # Save the configuration
        with open(config_file, 'w') as f:
            json.dump(config, f, indent=2)
        
        # Debug logging
        if debug_mode:
            print(f"[FF Group Positioner] DEBUG: Configuration saved to {config_file}")
            print(f"[FF Group Positioner] DEBUG: Group name: {group_name}")
            print(f"[FF Group Positioner] DEBUG: Shortcut key: {shortcut_key}")
            print(f"[FF Group Positioner] DEBUG: Enabled: {enabled}")
            print(f"[FF Group Positioner] DEBUG: Debug mode: {debug_mode}")
        
        status = f"Group positioner configured: {group_name} -> {shortcut_key} ({'enabled' if enabled else 'disabled'}) {'[DEBUG ON]' if debug_mode else ''}"
        return (status,)
