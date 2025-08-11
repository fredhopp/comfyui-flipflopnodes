import datetime
import re

class FlipFlopTimeNode:
    def __init__(self, format_string="%date:yyMMdd% %time:HHmmss%"):
        self.format_string = format_string

    def _parse_format(self, fmt):
        # Replace custom tokens with strftime equivalents
        # Example: %date:yyMMdd% -> %y%m%d
        # Supported tokens: yy, yyyy, MM, dd, HH, mm, ss
        token_map = {
            'yy': '%y',
            'yyyy': '%Y',
            'MM': '%m',
            'dd': '%d',
            'HH': '%H',
            'mm': '%M',
            'ss': '%S',
        }
        def replacer(match):
            token = match.group(1)
            return token_map.get(token, match.group(0))
        # Replace %date:...% and %time:...% blocks
        fmt = re.sub(r'%date:([yMd]+)%', lambda m: ''.join(token_map.get(t, t) for t in re.findall(r'y{2,4}|M{2}|d{2}', m.group(1))), fmt)
        fmt = re.sub(r'%time:([Hms]+)%', lambda m: ''.join(token_map.get(t, t) for t in re.findall(r'H{2}|m{2}|s{2}', m.group(1))), fmt)
        return fmt

    def run(self):
        now = datetime.datetime.now()
        fmt = self._parse_format(self.format_string)
        return now.strftime(fmt)

# Example usage:
if __name__ == "__main__":
    node = FlipFlopTimeNode("%date:yyyy-MM-dd% %time:HH:mm:ss%")
    print(node.run())
