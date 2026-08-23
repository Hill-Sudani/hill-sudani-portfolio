# -*- coding: utf-8 -*-
"""Embeds the portrait as base64 so the lab is one self-contained file.

A file:// page cannot call getImageData on a file:// image without tainting the
canvas, and the particle sampling depends on reading pixels. A data: URI is
same-origin, so it does not taint — which is why the image is inlined rather
than referenced.
"""
import base64
import io
import os

TEMPLATE = "loading-lab.template.html"
OUT = "loading-lab.html"
IMG = os.path.join("..", "..", "public", "hill-sudani-particle-profile-v1.webp")

with open(IMG, "rb") as fh:
    b64 = base64.b64encode(fh.read()).decode("ascii")

src = io.open(TEMPLATE, encoding="utf-8", newline="").read()
assert src.count("__IMAGE_B64__") == 1, "placeholder missing"
src = src.replace("__IMAGE_B64__", b64)

io.open(OUT, "w", encoding="utf-8", newline="\n").write(src)
print("wrote %s — %.0f KB (portrait %.0f KB inlined)" % (
    OUT, len(src) / 1024, len(b64) / 1024))
