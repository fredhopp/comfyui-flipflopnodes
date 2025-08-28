# Mostly based on comfyui-crystools:
# https://github.dev/crystian/comfyui-crystools

import os
import torch
import json
from pathlib import Path
import numpy as np
from PIL import Image
from PIL import ImageOps
from PIL.ExifTags import TAGS, GPSTAGS, IFD
from PIL.PngImagePlugin import PngImageFile
from PIL.JpegImagePlugin import JpegImageFile
from ..categories import structure


class FlipFlop_Load_Image_with_Metadata:
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "filepath": ("STRING", {
                    "default": "",
                    "multiline": False,
                    "placeholder": "Enter image file path"
                }),
            }
        }
    RETURN_TYPES = ("IMAGE", "MASK", "JSON", "METADATA_RAW")
    RETURN_NAMES = ("image", "mask", "prompt", "Metadata RAW")
    OUTPUT_NODE = True
    FUNCTION = "execute"
    CATEGORY = structure.get('FlipFlop/IO', 'Utility')

    def execute(self, filepath):
        if not os.path.isfile(filepath):
            raise FileNotFoundError(f"File not found: {filepath}")

        img, prompt, metadata = buildMetadata(filepath)

        img = ImageOps.exif_transpose(img)
        image = img.convert("RGB")
        image = np.array(image).astype(np.float32) / 255.0
        image = torch.from_numpy(image)[None,]
        if 'A' in img.getbands():
            mask = np.array(img.getchannel('A')).astype(np.float32) / 255.0
            mask = 1. - torch.from_numpy(mask)
        else:
            # Create a zeros mask with the same height and width as the image
            mask = torch.zeros((img.height, img.width), dtype=torch.float32, device="cpu")

        return image, mask.unsqueeze(0), prompt, metadata
def buildMetadata(image_path):
    metadata = {}
    prompt = {}

    with Image.open(image_path) as img:
        metadata["fileinfo"] = {
            "filename": Path(image_path).as_posix(),
            "resolution": f"{img.width}x{img.height}",
            "date": str(os.path.getmtime(image_path)),
            "size": str(os.path.getsize(image_path)),
        }

        if isinstance(img, PngImageFile):
            metadataFromImg = img.info

            for k, v in metadataFromImg.items():
                if k == "workflow":
                    try:
                        metadata["workflow"] = json.loads(metadataFromImg["workflow"])
                    except Exception as e:
                        pass
                elif k == "prompt":
                    try:
                        metadata["prompt"] = json.loads(metadataFromImg["prompt"])
                        prompt = metadata["prompt"]
                    except Exception as e:
                        pass
                else:
                    try:
                        metadata[str(k)] = json.loads(v)
                    except Exception as e:
                        try:
                            metadata[str(k)] = str(v)
                        except Exception as e:
                            pass

        if isinstance(img, JpegImageFile):
            exif = img.getexif()

            for k, v in exif.items():
                tag = TAGS.get(k, k)
                if v is not None:
                    metadata[str(tag)] = str(v)

            for ifd_id in IFD:
                try:
                    if ifd_id == IFD.GPSInfo:
                        resolve = GPSTAGS
                    else:
                        resolve = TAGS

                    ifd = exif.get_ifd(ifd_id)
                    ifd_name = str(ifd_id.name)
                    metadata[ifd_name] = {}

                    for k, v in ifd.items():
                        tag = resolve.get(k, k)
                        metadata[ifd_name][str(tag)] = str(v)

                except KeyError:
                    pass

        img_copy = img.copy()

    return img_copy, prompt, metadata