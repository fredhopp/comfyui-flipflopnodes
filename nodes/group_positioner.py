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
            }
        }
    
    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("status",)
    FUNCTION = "configure_positioner"
    CATEGORY = structure.get('FlipFlop/UI', 'Utility')
    OUTPUT_NODE = True

    def configure_positioner(self, group_name, shortcut_key, enabled):
        # Save configuration to a JSON file that the frontend can read
        config = {
            "group_name": group_name,
            "shortcut_key": shortcut_key,
            "enabled": enabled
        }
        
        # Get the directory where this node is located
        current_dir = Path(__file__).parent.parent
        config_file = current_dir / "web" / "config" / "group_positioner.json"
        
        # Ensure the config directory exists
        config_file.parent.mkdir(parents=True, exist_ok=True)
        
        # Save the configuration
        with open(config_file, 'w') as f:
            json.dump(config, f, indent=2)
        
        status = f"Group positioner configured: {group_name} -> {shortcut_key} ({'enabled' if enabled else 'disabled'})"
        return (status,)
