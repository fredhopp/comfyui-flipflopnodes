# FlipFlop Custom Nodes for ComfyUI
# This file registers the custom nodes with ComfyUI

from .nodes.group_positioner import FlipFlop_Group_Positioner
from .nodes.nodes_IO import FlipFlop_Text_Input, FlipFlop_Text_Output
from .nodes.nodes_text import FlipFlop_Text_Processor

# Import the server setup function
from .server import setup as server_setup

# Node class mappings
NODE_CLASS_MAPPINGS = {
    "FlipFlop_Group_Positioner": FlipFlop_Group_Positioner,
    "FlipFlop_Text_Input": FlipFlop_Text_Input,
    "FlipFlop_Text_Output": FlipFlop_Text_Output,
    "FlipFlop_Text_Processor": FlipFlop_Text_Processor,
}

# Node display names
NODE_DISPLAY_NAME_MAPPINGS = {
    "FlipFlop_Group_Positioner": "Group Positioner",
    "FlipFlop_Text_Input": "Text Input",
    "FlipFlop_Text_Output": "Text Output",
    "FlipFlop_Text_Processor": "Text Processor",
}

# Web directory for frontend files
WEB_DIRECTORY = "./web"

# Server setup function
def setup(app):
    """Setup server endpoints for the extension"""
    server_setup(app)
