# node_mappings.py
# Maps node display names to their classes for registration in ComfyUI

from .nodes.nodes_text import FlipFlop_Text

NODE_CLASS_MAPPINGS = {
    "FF Text": FlipFlop_Text,
}
