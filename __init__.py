# FlipFlop Custom Nodes for ComfyUI
# This file registers the custom nodes with ComfyUI

from .nodes.group_positioner import FlipFlop_Group_Positioner
from .nodes.nodes_IO import FlipFlop_Load_Image_with_Metadata
from .nodes.nodes_text import FlipFlop_Text

# Import the server setup function
from .server import setup as server_setup

# Node class mappings
NODE_CLASS_MAPPINGS = {
    "FF Group Positioner": FlipFlop_Group_Positioner,
    "FF Load Image with Metadata": FlipFlop_Load_Image_with_Metadata,
    "FF Text": FlipFlop_Text,
}

# Node display names
NODE_DISPLAY_NAME_MAPPINGS = {
    "FF Group Positioner": "FF Group Positioner",
    "FF Load Image with Metadata": "FF Load Image with Metadata",
    "FF Text": "FF Text",
}

# Web directory for frontend files
WEB_DIRECTORY = "./web"

# Server setup function
def setup(app):
    """Setup server endpoints for the extension"""
    server_setup(app)
