# FlipFlopTimeNode

Outputs the current time as a string, with customizable formatting.

## Format String
- Use `%date:yyyy-MM-dd%` for date.
- Use `%time:HH:mm:ss%` for time.
- Supported tokens: `yy`, `yyyy`, `MM`, `dd`, `HH`, `mm`, `ss`.

## Example
```python
from nodes.flipflop_time_node import FlipFlopTimeNode
node = FlipFlopTimeNode("%date:yyyy-MM-dd% %time:HH:mm:ss%")
print(node.run())
```

## Output
```
2025-08-11 14:23:45
```
