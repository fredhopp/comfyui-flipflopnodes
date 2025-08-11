# node_mappings.py
# Maps node display names to their classes for registration in ComfyUI

from .flipflop_time_node import FlipFlopTimeNode

NODE_CLASS_MAPPINGS = {
    "FF Date to String": FlipFlopTimeNode,
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "FF Date to String": "FF Date to String",
}
