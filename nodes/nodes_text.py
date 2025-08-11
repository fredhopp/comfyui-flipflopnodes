import datetime
import re

class FlipFlop_Text:
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "format_string": ("STRING", {
                    "default": "%yyyy-MM-dd HH:mm:ss%",
                    "multiline": False,
                    "placeholder": "Enter format, e.g. %yyyy-MM-dd HH:mm:ss%"
                })
            }
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("time_string",)
    FUNCTION = "generate_time_string"
    CATEGORY = "Utility"

    def _parse_format(self, fmt):
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
            for k, v in token_map.items():
                block = block.replace(k, v)
            return block
        fmt = re.sub(r'%([^%]+)%', token_replacer, fmt)
        return fmt

    def generate_time_string(self, format_string):
        now = datetime.datetime.now()
        fmt = self._parse_format(format_string)
        return (now.strftime(fmt),)
