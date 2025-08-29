# Server extension for ComfyUI
# Adds API endpoints for the group positioner

import os
import json
from pathlib import Path
from aiohttp import web

# Get the directory where this extension is located
EXTENSION_FOLDER = Path(__file__).parent

def setup(app):
    # Add route to serve the configuration file
    @app.router.get('/flipflop/config/group_positioner.json')
    async def get_group_positioner_config(request):
        config_file = EXTENSION_FOLDER / "web" / "config" / "group_positioner.json"
        
        if config_file.exists():
            with open(config_file, 'r') as f:
                config = json.load(f)
            return web.json_response(config)
        else:
            # Return default config if file doesn't exist
            default_config = {
                "group_name": "MyGroup",
                "shortcut_key": "F8",
                "enabled": True
            }
            return web.json_response(default_config)
    
    # Add route to update the configuration
    @app.router.post('/flipflop/config/group_positioner.json')
    async def update_group_positioner_config(request):
        try:
            data = await request.json()
            config_file = EXTENSION_FOLDER / "web" / "config" / "group_positioner.json"
            
            # Ensure the config directory exists
            config_file.parent.mkdir(parents=True, exist_ok=True)
            
            # Save the configuration
            with open(config_file, 'w') as f:
                json.dump(data, f, indent=2)
            
            return web.json_response({"status": "success"})
        except Exception as e:
            return web.json_response({"status": "error", "message": str(e)}, status=500)
    
    # Add route to trigger node execution for logging
    @app.router.post('/flipflop/trigger_log')
    async def trigger_logging(request):
        try:
            data = await request.json()
            action = data.get('action', '')
            
            # Print to ComfyUI console based on action
            if action == 'shortcut_pressed':
                print(f"[FF Group Positioner] Shortcut pressed: {data.get('shortcut', 'unknown')}")
            elif action == 'group_validation':
                print(f"[FF Group Positioner] Group validation: {data.get('group_name', 'unknown')}")
                print(f"[FF Group Positioner] Available groups: {data.get('available_groups', [])}")
                print(f"[FF Group Positioner] Matching groups: {data.get('matching_groups', [])}")
            elif action == 'positioning':
                print(f"[FF Group Positioner] Positioning group: {data.get('group_name', 'unknown')}")
                print(f"[FF Group Positioner] Mouse position: {data.get('mouse_pos', [])}")
                print(f"[FF Group Positioner] Group position: {data.get('group_pos', [])}")
            else:
                print(f"[FF Group Positioner] {data.get('message', 'Unknown action')}")
            
            return web.json_response({"status": "success"})
        except Exception as e:
            print(f"[FF Group Positioner] ERROR: Failed to trigger logging: {e}")
            return web.json_response({"status": "error", "message": str(e)}, status=500)
    

