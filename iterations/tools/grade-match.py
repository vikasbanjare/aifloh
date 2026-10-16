# Learn one colour grade from (film frame, clean keyframe) pairs and write it as a .cube LUT for ffmpeg.
# The film drifted flatter and greyer than the keyframes Flow started from. The first and last film frames line up
# with those keyframes, so we fit a colour transform pixel to pixel (affine in RGB: a 2nd-order fit turned colours
# it never saw, like the green timeline clips, black), dropping
# pixels that disagree in content (the garbled posters, small drifts) with two robust refits. One fixed transform
# for every frame means nothing flickers.
# Usage: python3 iterations/tools/grade-match.py out.cube frameA.jpg refA.webp [frameB.jpg refB.webp ...]
import sys
import numpy as np
from PIL import Image, ImageFilter

out, pairs = sys.argv[1], sys.argv[2:]
X, Y = [], []
for f, r in zip(pairs[0::2], pairs[1::2]):
    # slight blur so small misalignments do not dominate the fit
    a = Image.open(f).convert('RGB').resize((480, 270), Image.LANCZOS).filter(ImageFilter.GaussianBlur(1.5))
    b = Image.open(r).convert('RGB').resize((480, 270), Image.LANCZOS).filter(ImageFilter.GaussianBlur(1.5))
    X.append(np.asarray(a).reshape(-1, 3) / 255); Y.append(np.asarray(b).reshape(-1, 3) / 255)
X, Y = np.concatenate(X), np.concatenate(Y)

def feats(c):
    r, g, b = c[:, 0], c[:, 1], c[:, 2]
    return np.stack([np.ones_like(r), r, g, b], 1)

keep = np.ones(len(X), bool)
for _ in range(3):
    W, *_ = np.linalg.lstsq(feats(X[keep]), Y[keep], rcond=None)
    err = np.abs(feats(X) @ W - Y).sum(1)
    keep = err < np.percentile(err, 70)
print('kept %.0f%% of pixels, mean error %.3f' % (keep.mean() * 100, err[keep].mean()))

N = 33
g = np.linspace(0, 1, N)
B, G, R = np.meshgrid(g, g, g, indexing='ij')  # .cube order: red changes fastest
grid = np.stack([R.ravel(), G.ravel(), B.ravel()], 1)
lut = np.clip(feats(grid) @ W, 0, 1)
with open(out, 'w') as fh:
    fh.write('TITLE "film to keyframes"\nLUT_3D_SIZE %d\n' % N)
    fh.writelines('%.6f %.6f %.6f\n' % tuple(v) for v in lut)
print('wrote', out)
