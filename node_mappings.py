# node_mappings.py
# Maps node display names to their classes for registration in ComfyUI

from .nodes.nodes_text import FlipFlop_Text
from .nodes.nodes_IO import FlipFlop_Load_Image_with_Metadata

NODE_CLASS_MAPPINGS = {
    "FF Text": FlipFlop_Text,
    "FF Load Image with Metadata": FlipFlop_Load_Image_with_Metadata,
}
