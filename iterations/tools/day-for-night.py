# Day-for-night grade of the film's last frame: the city at 4 AM, his window the only light.
# Usage: python3 iterations/tools/day-for-night.py public/media/film/hero-wide-end.webp public/media/day/night-4am
# Writes <out>.webp (1920 wide) and <out>-960.webp. Window and monitor boxes are in 1920x1080 frame pixels.
import sys
import numpy as np
from PIL import Image, ImageFilter

src, out = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGB').resize((1920, 1080), Image.LANCZOS)
a = np.asarray(im).astype(np.float32) / 255
H, W, _ = a.shape
lum = a @ np.array([0.3, 0.59, 0.11], np.float32)

def box_mask(x0, y0, x1, y1, blur):
    m = Image.new('L', (W, H), 0)
    m.paste(255, (x0, y0, x1, y1))
    m = m.filter(ImageFilter.GaussianBlur(blur))
    return (np.asarray(m).astype(np.float32) / 255)[..., None]

# 1. Night base: mostly luminance, crushed, pushed to blue; the sky darker toward the top.
base = (0.75 * lum[..., None] + 0.25 * a) ** 1.35
night = base * np.array([0.30, 0.40, 0.72], np.float32) * 0.62
ramp = np.linspace(0.55, 1.0, H, dtype=np.float32)[:, None, None]
night *= ramp

# 2. Stars, only where the original was open sky.
rng = np.random.default_rng(4)
sky = (a[..., 2] > a[..., 0] + 0.12) & (lum > 0.55)
stars = np.zeros((H, W), np.float32)
ys, xs = rng.integers(0, int(H * 0.45), 900), rng.integers(0, W, 900)
keep = sky[ys, xs]
stars[ys[keep], xs[keep]] = rng.uniform(0.35, 1.0, keep.sum())
stars = np.asarray(Image.fromarray((stars * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.7))).astype(np.float32) / 255 * 2.2
night += stars[..., None] * np.array([0.85, 0.9, 1.0], np.float32)

# 3. His window stays lit: warm lamp light, monitor keeps its cool glow.
win = box_mask(866, 548, 1056, 742, 3)
lit = np.clip(a * np.array([1.08, 0.86, 0.62], np.float32) * 0.92, 0, 1)
night = night * (1 - win) + lit * win
mon = box_mask(960, 656, 1014, 716, 2)
night = night * (1 - mon) + np.clip(a * 1.05, 0, 1) * mon

# 4. Glow: light spilling onto the wall and sill, and a faint halo.
halo = box_mask(866, 548, 1056, 742, 60)
spill = box_mask(850, 735, 1075, 790, 14)
night += halo * np.array([0.55, 0.36, 0.16], np.float32) * 0.55
night += spill * np.array([0.6, 0.42, 0.2], np.float32) * 0.35

o = Image.fromarray((np.clip(night, 0, 1) * 255).astype(np.uint8))
o.save(out + '.webp', quality=80, method=6)
o.resize((960, 540), Image.LANCZOS).save(out + '-960.webp', quality=78, method=6)
print('wrote', out + '.webp', out + '-960.webp')
