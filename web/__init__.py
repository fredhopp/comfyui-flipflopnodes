# Web extension registration for ComfyUI
# This file tells ComfyUI to serve the web directory as static files

import os
import sys
from pathlib import Path

# Get the current directory
current_dir = Path(__file__).parent

# Register the web directory with ComfyUI
WEB_DIRECTORY = str(current_dir)

# This will be used by ComfyUI to serve static files
