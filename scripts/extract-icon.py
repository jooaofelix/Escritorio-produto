"""Isola o cacto da logo oficial (SVG gerado pelo pdftocairo) para usar como ícone.

Mantém só os paths cujo bounding box cabe inteiro na região do cacto, sem
redesenhar nada: as formas e cores são exatamente as da logo.
Uso: python3 scripts/extract-icon.py <logo.svg> <saida.svg>
"""
import re
import sys

BOX = (100, 438, 272, 680)  # x0, y0, x1, y1 no espaço 1080x1080 do PDF

src, out = sys.argv[1], sys.argv[2]
svg = open(src, encoding="utf-8").read()
kept = []
for tag in re.findall(r"<path\b[^>]*/>", svg):
    d = re.search(r'\sd="([^"]+)"', tag).group(1)
    nums = [float(n) for n in re.findall(r"-?\d+(?:\.\d+)?", d)]
    xs, ys = nums[0::2], nums[1::2]
    if min(xs) >= BOX[0] and min(ys) >= BOX[1] and max(xs) <= BOX[2] and max(ys) <= BOX[3]:
        kept.append(tag)

x0, y0, x1, y1 = BOX
size = max(x1 - x0, y1 - y0)
cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
vb = f"{cx - size / 2:.0f} {cy - size / 2:.0f} {size:.0f} {size:.0f}"
with open(out, "w", encoding="utf-8") as f:
    f.write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}">' + "".join(kept) + "</svg>")
print(f"icon: {len(kept)} paths")
