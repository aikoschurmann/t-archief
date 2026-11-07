import os
from PIL import Image
import colorsys
import glob
import json
import time

# Configuration
INPUT_DIR = 'src/lib/assets/work'
SIZES = {
    'sm': 800,
    'md': 1600
}
BLUR_SIZE = 20
QUALITY = 80

def format_size(bytes):
    for unit in ['B', 'KB', 'MB', 'GB']:
        if bytes < 1024:
            return f"{bytes:.2f} {unit}"
        bytes /= 1024

def optimize_images():
    start_time = time.time()
    print(f"🚀 Starting image optimization in {INPUT_DIR}...")
    
    # Supported extensions
    extensions = ['*.jpg', '*.jpeg', '*.png', '*.JPG', '*.JPEG', '*.PNG']
    image_paths = []
    for ext in extensions:
        image_paths.extend(glob.glob(os.path.join(INPUT_DIR, '**', ext), recursive=True))
    # On case-insensitive filesystems both patterns can match the same file
    image_paths = sorted(set(image_paths))

    stats = {
        'count': 0,
        'original_size': 0,
        'optimized_size': 0,
        'skipped': 0,
        'errors': 0
    }

    for path in image_paths:
        # Skip already optimized images
        if any(f"_{suffix}." in path for suffix in ['sm', 'md', 'blur']):
            continue

        # Skip images that already have all their variants
        base = os.path.splitext(path)[0]
        if all(os.path.exists(f"{base}_{suffix}.webp") for suffix in ['sm', 'md', 'blur']):
            stats['skipped'] += 1
            continue

        orig_size = os.path.getsize(path)
        stats['original_size'] += orig_size
        
        print(f"📦 Processing: {os.path.basename(path)} ({format_size(orig_size)})")
        file_optimized_size = 0
        
        try:
            with Image.open(path) as img:
                base_path = os.path.splitext(path)[0]
                
                # 1. Generate Responsive Sizes (WebP)
                for suffix, width in SIZES.items():
                    out_path = f"{base_path}_{suffix}.webp"
                    
                    # Calculate height maintaining aspect ratio
                    w_percent = (width / float(img.size[0]))
                    h_size = int((float(img.size[1]) * float(w_percent)))
                    
                    resized = img.resize((width, h_size), Image.Resampling.LANCZOS)
                    
                    save_kwargs = {'quality': QUALITY}
                    if 'icc_profile' in img.info:
                        save_kwargs['icc_profile'] = img.info['icc_profile']
                        
                    resized.save(out_path, 'WEBP', **save_kwargs)
                    
                    s = os.path.getsize(out_path)
                    file_optimized_size += s
                    print(f"   ✅ {suffix.upper()}: {format_size(s)}")

                # 2. Generate Blur Placeholder (Tiny WebP)
                blur_path = f"{base_path}_blur.webp"
                w_percent = (BLUR_SIZE / float(img.size[0]))
                h_size = int((float(img.size[1]) * float(w_percent)))
                
                blur_img = img.resize((BLUR_SIZE, h_size), Image.Resampling.LANCZOS)
                
                blur_kwargs = {'quality': 10}
                if 'icc_profile' in img.info:
                    blur_kwargs['icc_profile'] = img.info['icc_profile']
                    
                blur_img.save(blur_path, 'WEBP', **blur_kwargs)
                
                s = os.path.getsize(blur_path)
                file_optimized_size += s
                print(f"   ✅ BLUR: {format_size(s)}")

                stats['optimized_size'] += file_optimized_size
                stats['count'] += 1
                
                savings = orig_size - file_optimized_size
                pct = (savings / orig_size) * 100
                print(f"   📉 Saved {format_size(savings)} ({pct:.1f}%)")

        except Exception as e:
            print(f"   ❌ Error processing {path}: {e}")
            stats['errors'] += 1

    duration = time.time() - start_time
    
    print("\n" + "="*40)
    print("✨ OPTIMIZATION SUMMARY")
    print("="*40)
    print(f"📸 Images processed:  {stats['count']}")
    print(f"📁 Total original:    {format_size(stats['original_size'])}")
    print(f"💎 Total optimized:   {format_size(stats['optimized_size'])}")
    
    if stats['original_size'] > 0:
        total_savings = stats['original_size'] - stats['optimized_size']
        total_pct = (total_savings / stats['original_size']) * 100
        print(f"📉 Total saved:       {format_size(total_savings)} ({total_pct:.1f}%)")
    
    print(f"⏱️  Time taken:        {duration:.1f} seconds")
    if stats['errors'] > 0:
        print(f"⚠️  Errors:             {stats['errors']}")
    print("="*40)

def dominant_colour(img):
    """Dominant colour, as media.ts used to measure it in the browser: pixels are grouped into
    hue families and the strongest family wins; colourless photos get a grey."""
    pixels = list(img.resize((24, 24), Image.BOX).getdata())
    bins = [[0.0, 0.0, 0.0, 0.0] for _ in range(24)]
    grey = [0, 0, 0]
    for r, g, b in pixels:
        grey[0] += r; grey[1] += g; grey[2] += b
        mx, mn = max(r, g, b), min(r, g, b)
        s = (mx - mn) / mx if mx else 0
        l = (mx + mn) / 510
        if s < 0.18 or l < 0.06 or l > 0.92:
            continue
        h = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)[0] * 360
        bin = bins[int(h / 15) % 24]
        bin[0] += r * s; bin[1] += g * s; bin[2] += b * s; bin[3] += s

    # Weigh each bin together with its neighbours so a hue split across two bins still wins
    best, best_w = -1, 0
    for i in range(24):
        w = bins[i][3] + 0.5 * (bins[(i + 1) % 24][3] + bins[(i - 1) % 24][3])
        if w > best_w:
            best, best_w = i, w
    # The bar is low on purpose: a red costume on a dark stage is a small part of the picture
    if best < 0 or best_w < len(pixels) * 0.012:
        v = round(min(150, max(90, sum(grey) / (3 * len(pixels)))))
        return f"rgb({v}, {v}, {v})"
    r, g, b, w = bins[best]
    return f"rgb({round(r / w)}, {round(g / w)}, {round(b / w)})"


def colour_buckets(img, keep=24):
    """The photo's colours pooled into buckets, heaviest first, as [r, g, b, weight]. Colourful
    pixels weigh much more than neutral ones; media.ts picks distinct palettes from these."""
    sums = {}
    for r, g, b in img.resize((48, 48), Image.BOX).getdata():
        mx, mn = max(r, g, b), min(r, g, b)
        sat = (mx - mn) / mx if mx else 0
        light = (mx + mn) / 510
        # Very dark and very light pixels carry little colour information
        w = (0.2 + 4 * sat * sat) * (0.3 if light < 0.08 or light > 0.95 else 1)
        key = ((r >> 5) << 6) | ((g >> 5) << 3) | (b >> 5)
        s = sums.setdefault(key, [0.0, 0.0, 0.0, 0.0])
        s[0] += r * w; s[1] += g * w; s[2] += b * w; s[3] += w
    buckets = sorted(sums.values(), key=lambda s: -s[3])[:keep]
    return [[round(s[0] / s[3]), round(s[1] / s[3]), round(s[2] / s[3]), round(s[3], 2)] for s in buckets]


def write_colours():
    """Measure every photo once, so every browser shows the same dot colours (Safari adds noise
    to canvas pixel reads, which made colours measured in the browser differ per browser)."""
    colours = {}
    for path in sorted(glob.glob(os.path.join(INPUT_DIR, '*', '*_sm.webp'))):
        folder = os.path.basename(os.path.dirname(path))
        name = os.path.basename(path)[:-len('_sm.webp')]
        with Image.open(path) as img:
            rgb = img.convert('RGB')
            colours[f"{folder}/{name}"] = {
                'ratio': round(img.width / img.height, 4),
                'dominant': dominant_colour(rgb),
                'buckets': colour_buckets(rgb)
            }
    out = os.path.join(INPUT_DIR, 'colours.json')
    with open(out, 'w') as f:
        json.dump(colours, f, separators=(',', ':'))
    print(f"🎨 Colours measured for {len(colours)} photos → {out}")


if __name__ == "__main__":
    optimize_images()
    write_colours()
