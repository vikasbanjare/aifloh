# Sharpen film frames with Real-ESRGAN's animation-video model (realesr-animevideov3, BSD-3-Clause, free).
# The network is small (SRVGGNetCompact), so it is defined here instead of installing basicsr/realesrgan.
# Each frame is upscaled x4 from a reduced input, then resized to the output width: the model redraws clean
# edges, hair and faces that Veo's compression softened. CPU only.
# Usage: python esrgan-frames.py WEIGHTS IN_DIR OUT_DIR [in_width=960] [out_width=1920] [start] [end]
import sys, os, glob, time
import numpy as np
import torch, torch.nn as nn, torch.nn.functional as F
from PIL import Image

class SRVGGNetCompact(nn.Module):
    def __init__(self, num_in_ch=3, num_out_ch=3, num_feat=64, num_conv=16, upscale=4):
        super().__init__()
        self.upscale = upscale
        body = [nn.Conv2d(num_in_ch, num_feat, 3, 1, 1), nn.PReLU(num_parameters=num_feat)]
        for _ in range(num_conv):
            body += [nn.Conv2d(num_feat, num_feat, 3, 1, 1), nn.PReLU(num_parameters=num_feat)]
        body += [nn.Conv2d(num_feat, num_out_ch * upscale * upscale, 3, 1, 1)]
        self.body = nn.ModuleList(body)
        self.upsampler = nn.PixelShuffle(upscale)

    def forward(self, x):
        out = x
        for layer in self.body:
            out = layer(out)
        out = self.upsampler(out)
        return out + F.interpolate(x, scale_factor=self.upscale, mode='nearest')

weights, src, dst = sys.argv[1:4]
in_w = int(sys.argv[4]) if len(sys.argv) > 4 else 960
out_w = int(sys.argv[5]) if len(sys.argv) > 5 else 1920
files = sorted(glob.glob(os.path.join(src, '*.png')) + glob.glob(os.path.join(src, '*.jpg')))
lo = int(sys.argv[6]) if len(sys.argv) > 6 else 0
hi = int(sys.argv[7]) if len(sys.argv) > 7 else len(files)
os.makedirs(dst, exist_ok=True)
torch.set_num_threads(os.cpu_count() or 4)
net = SRVGGNetCompact()
sd = torch.load(weights, map_location='cpu')
net.load_state_dict(sd.get('params', sd))
net.eval()
t0 = time.time()
for i, f in enumerate(files[lo:hi], lo):
    out_path = os.path.join(dst, os.path.splitext(os.path.basename(f))[0] + '.png')
    if os.path.exists(out_path):
        continue
    im = Image.open(f).convert('RGB')
    in_h = round(im.height * in_w / im.width)
    x = torch.from_numpy(np.asarray(im.resize((in_w, in_h), Image.LANCZOS))).permute(2, 0, 1).float().div(255).unsqueeze(0)
    with torch.inference_mode():
        y = net(x).clamp(0, 1)
    y = (y[0].permute(1, 2, 0).numpy() * 255).round().astype(np.uint8)
    out_h = round(im.height * out_w / im.width)
    Image.fromarray(y).resize((out_w, out_h), Image.LANCZOS).save(out_path, compress_level=1)
    if i % 10 == 0:
        print(f'{i + 1}/{len(files)} {time.time() - t0:.0f}s', flush=True)
print('done', time.time() - t0)
