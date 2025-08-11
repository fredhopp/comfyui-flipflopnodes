import datetime
import re

class FlipFlopTimeNode:
    def __init__(self, format_string="%yyyy-MM-dd HH:mm:ss%"):
        self.format_string = format_string

    def _parse_format(self, fmt):
        # Replace custom tokens with strftime equivalents in any %...% block
        token_map = {
            'yy': '%y',
            'yyyy': '%Y',
            'MM': '%m',
            'dd': '%d',
            'HH': '%H',
            'mm': '%M',
            'ss': '%S',
        }
        def token_replacer(match):
            block = match.group(1)
            # Replace all supported tokens in the block
            for k, v in token_map.items():
                block = block.replace(k, v)
            return block
        # Replace all %...% blocks
        fmt = re.sub(r'%([^%]+)%', token_replacer, fmt)
        return fmt

    def run(self):
        now = datetime.datetime.now()
        fmt = self._parse_format(self.format_string)
        return now.strftime(fmt)

# Example usage:
if __name__ == "__main__":
    node = FlipFlopTimeNode("%yyyy-MM-dd HH:mm:ss%")
    print(node.run())
