#!/usr/bin/env python3
"""Genera los iconos PNG de Onda (onda verde sobre fondo oscuro)."""
import math
import os
from PIL import Image, ImageDraw

OUT = os.path.join(os.path.dirname(__file__), "..", "public", "icons")
BG = (10, 10, 13, 255)
GREEN = (29, 201, 91, 255)


def make(size: int, path: str, maskable: bool = False) -> None:
    s = 4  # supersampling
    w = size * s
    img = Image.new("RGBA", (w, w), BG)
    d = ImageDraw.Draw(img)

    if not maskable:
        radius = int(w * 0.22)
        mask = Image.new("L", (w, w), 0)
        ImageDraw.Draw(mask).rounded_rectangle([0, 0, w - 1, w - 1], radius=radius, fill=255)
        img.putalpha(mask)
        d = ImageDraw.Draw(img)

    # Onda sinusoidal centrada (dentro de la zona segura de máscara)
    inset = 0.24 if maskable else 0.19
    x0, x1 = w * inset, w * (1 - inset)
    mid = w / 2
    amp = w * (0.14 if maskable else 0.17)
    lw = int(w * 0.072)

    pts = []
    steps = 360
    for i in range(steps + 1):
        t = i / steps
        x = x0 + (x1 - x0) * t
        y = mid + amp * math.sin(t * math.pi * 2.4 - math.pi / 2)
        pts.append((x, y))

    # Trazo con "sellos" circulares: queda perfectamente suave.
    r = lw / 2
    for x, y in pts:
        d.ellipse([x - r, y - r, x + r, y + r], fill=GREEN)

    # Punto "play" arriba a la derecha, libre de la onda
    pr = w * 0.07
    cx, cy = w * 0.83, w * 0.19
    d.ellipse([cx - pr, cy - pr, cx + pr, cy + pr], fill=(255, 255, 255, 255))

    img.resize((size, size), Image.LANCZOS).save(path)


def main() -> None:
    os.makedirs(OUT, exist_ok=True)
    make(192, os.path.join(OUT, "icon-192.png"))
    make(512, os.path.join(OUT, "icon-512.png"))
    make(512, os.path.join(OUT, "icon-maskable-512.png"), maskable=True)
    make(180, os.path.join(OUT, "apple-touch-icon.png"), maskable=True)
    print("Iconos generados en", os.path.abspath(OUT))


if __name__ == "__main__":
    main()
