#
# @author: fredhopp
# @title: FlipFlop Nodes
# @nickname: FlipFlop
# @version: 0.1.0
# @project: "https://github.com/fredhopp/comfyui-flipflopnodes"
# @description: Custom FlipFlop nodes for ComfyUI
#

from .node_mappings import NODE_CLASS_MAPPINGS

# Register web extension directory
import os
from pathlib import Path
WEB_DIRECTORY = str(Path(__file__).parent / "web")

# print('-------------------FlipFlopNodes-------------------')
