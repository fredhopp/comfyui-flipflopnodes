#
# @author: fredhopp
# @title: FlipFlop Nodes
# @nickname: FlipFlop
# @version: 0.1.0
# @project: "https://github.com/fredhopp/comfyui-flipflopnodes"
# @description: Custom FlipFlop nodes for ComfyUI
#

from .flipflop_time_node import FlipFlopTimeNode

NODE_CLASS_MAPPINGS = {
	"FF Date to String": FlipFlopTimeNode,
}

NODE_DISPLAY_NAME_MAPPINGS = {
	"FF Date to String": "FF Date to String",
}

__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS"]
