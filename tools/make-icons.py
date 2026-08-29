"""Finales Icon-Set für Kalenderblatt – Konzept F2: Abreißblatt + große Zahl + oranges Band."""
from PIL import Image, ImageDraw, ImageFont

TEAL = (26, 92, 83)
CREAM = (244, 240, 231)
AMBER = (230, 140, 46)
FONT = "tools/assets/BricolageGrotesque.ttf"
SS = 4
OUT = "icons/"


def perf(d, x0, x1, y, r, fill, n=7):
    for i in range(n):
        cx = x0 + (x1 - x0) * (i + 0.5) / n
        d.ellipse([cx - r, y - r, cx + r, y + r], fill=fill)


def render(size, bleed=True, safe=1.0, show_num=True):
    S = size * SS
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    if bleed:
        d.rounded_rectangle([0, 0, S, S], radius=int(S * 0.235), fill=TEAL)
    else:
        d.rectangle([0, 0, S, S], fill=TEAL)

    k = safe
    w, h = S * 0.62 * k, S * 0.68 * k
    cx, cy = S / 2, S / 2 + S * 0.012 * k
    l, t, r, b = cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2
    rad = w * 0.085

    d.rounded_rectangle([l, t, r, b], radius=int(rad), fill=CREAM)
    band = h * 0.28
    d.rounded_rectangle([l, t, r, t + band], radius=int(rad), fill=AMBER, corners=(True, True, False, False))
    perf(d, l + w * 0.12, r - w * 0.12, t, w * 0.048, TEAL, 7)

    if show_num:
        body_top = t + band
        f = ImageFont.truetype(FONT, int(h * 0.52))
        d.text((cx, body_top + (b - body_top) / 2 + h * 0.02), "30", font=f, fill=TEAL, anchor="mm")
    else:
        dr = w * 0.16
        by = t + band + (b - (t + band)) * 0.45
        d.ellipse([cx - dr, by - dr, cx + dr, by + dr], fill=TEAL)

    return img.resize((size, size), Image.LANCZOS)


render(192).save(OUT + "icon-192.png")
render(512).save(OUT + "icon-512.png")
render(512, bleed=False, safe=0.72).save(OUT + "icon-512-maskable.png")
render(180, bleed=False).save(OUT + "apple-touch-icon.png")
render(32, show_num=False).save(OUT + "favicon-32.png")
print("icons written to", OUT)
