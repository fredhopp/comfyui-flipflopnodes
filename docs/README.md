# comfyui-flipflopnodes Documentation

This project contains custom "flipflop" nodes for ComfyUI.

## Getting Started

- Clone or download this repository.
- Place the nodes in your ComfyUI custom nodes directory.
- Import and use nodes in your ComfyUI workflows.

## Available Nodes
- **flipflop_time_node**: Outputs the current time as a string, with customizable formatting.

## Usage Example
```python
from nodes.flipflop_time_node import FlipFlopTimeNode
node = FlipFlopTimeNode("%date:yyyy-MM-dd% %time:HH:mm:ss%")
print(node.run())
```

## Contributing
Feel free to submit issues or pull requests for new nodes or improvements.
