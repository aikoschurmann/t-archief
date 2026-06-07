import os
from PIL import Image
import glob
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
    extensions = ['*.jpg', '*.jpeg', '*.png']
    image_paths = []
    for ext in extensions:
        image_paths.extend(glob.glob(os.path.join(INPUT_DIR, '**', ext), recursive=True))

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
                    resized.save(out_path, 'WEBP', quality=QUALITY)
                    
                    s = os.path.getsize(out_path)
                    file_optimized_size += s
                    print(f"   ✅ {suffix.upper()}: {format_size(s)}")

                # 2. Generate Blur Placeholder (Tiny WebP)
                blur_path = f"{base_path}_blur.webp"
                w_percent = (BLUR_SIZE / float(img.size[0]))
                h_size = int((float(img.size[1]) * float(w_percent)))
                
                blur_img = img.resize((BLUR_SIZE, h_size), Image.Resampling.LANCZOS)
                blur_img.save(blur_path, 'WEBP', quality=10)
                
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

if __name__ == "__main__":
    optimize_images()
