/**
 * Automatic Work Loader
 * Scans src/lib/assets/work and resolves items based on folder contents.
 */

// Only the optimised variants are imported (made by process_images_optimized.py). The large
// originals stay on disk, out of git and out of the build.
const variantFiles = import.meta.glob('/src/lib/assets/work/**/*_{sm,md,blur}.webp', { eager: true, query: '?url', import: 'default' });
const videoFiles = import.meta.glob('/src/lib/assets/work/**/*.{mp4,MP4}', { eager: true, query: '?url', import: 'default' });
const metaFiles = import.meta.glob('/src/lib/assets/work/**/meta.json', { eager: true });

export type WorkItem = {
  id: string;
  folder: string;
  files: Record<string, string>; // image url -> photo name (file name without extension), used by the editor
  home?: string[]; // image urls shown on the home page, in order
  allImages: string[]; // every image in order, including hidden ones (for the editor)
  hidden: string[]; // image urls hidden from the site
  visible: boolean; // false hides the whole project from the site
  type: 'image' | 'video' | 'set';
  title: string;
  url: string;
  videoUrl?: string;
  href?: string;
  images: string[];
  description?: string;
  order: number;
  meta?: Record<string, any>;
};

// `key` is "folder/photo name", the photo's entry in colours.json
export const imageAssetsMap: Record<string, { smSrc: string, mdSrc: string, blurSrc: string, key: string }> = {};
const worksData: Record<string, WorkItem> = {};
const folderFiles: Record<string, Record<string, string>> = {};

const VARIANT = /^(.*)_(sm|md|blur)\.webp$/i;

/** "DSC00991.jpg" and "DSC00991" both refer to the photo "DSC00991" in meta.json. */
const photoName = (fileName: string) => fileName.replace(/\.(jpe?g|png|webp)$/i, '');

function ensureWork(folderPath: string, folderName: string) {
  if (!worksData[folderPath]) {
    worksData[folderPath] = {
      id: folderName,
      folder: folderName,
      files: {},
      title: folderName.replace(/-/g, ' '),
      type: 'image',
      url: '',
      images: [],
      allImages: [],
      hidden: [],
      visible: true,
      order: 999, // Default to end of list
      meta: {}
    };
    folderFiles[folderPath] = {};
  }
}

// Group the variants per photo: { "DSC00991": { sm, md, blur } }
const variants: Record<string, Record<string, { sm?: string; md?: string; blur?: string }>> = {};
for (const path of Object.keys(variantFiles).sort()) {
  const parts = path.split('/');
  const fileName = parts.pop()!;
  const folderName = parts.pop()!;
  if (folderName === 'work') continue;
  const folderPath = parts.join('/') + '/' + folderName;
  const [, name, size] = fileName.match(VARIANT)!;
  ensureWork(folderPath, folderName);
  variants[folderPath] ??= {};
  variants[folderPath][name] ??= {};
  variants[folderPath][name][size.toLowerCase() as 'sm' | 'md' | 'blur'] = variantFiles[path] as string;
}

// Every photo is represented by its 1600px variant; imageAssetsMap links it to the others
for (const folderPath in variants) {
  for (const name in variants[folderPath]) {
    const v = variants[folderPath][name];
    const url = v.md ?? v.sm;
    if (!url) continue;
    imageAssetsMap[url] = { smSrc: v.sm ?? url, mdSrc: v.md ?? url, blurSrc: v.blur ?? '', key: `${worksData[folderPath].folder}/${name}` };
    folderFiles[folderPath][name] = url;
    worksData[folderPath].images.push(url);
    worksData[folderPath].files[url] = name;
  }
}

for (const path in videoFiles) {
  const parts = path.split('/');
  parts.pop();
  const folderName = parts.pop()!;
  if (folderName === 'work') continue;
  const folderPath = parts.join('/') + '/' + folderName;
  ensureWork(folderPath, folderName);
  worksData[folderPath].videoUrl = videoFiles[path] as string;
  worksData[folderPath].type = 'video';
}

export function loadWorks(): WorkItem[] {
  // Clone to avoid mutation issues if called multiple times, though meta is static.
  const works = JSON.parse(JSON.stringify(worksData)); 

  // 2. Resolve 'Set' type automatically & process Metadata
  for (const folderPath in works) {
    const item = works[folderPath];
    const files = folderFiles[folderPath];
    const lookup = (fileName: string) => files[photoName(fileName)];
    
    // Set default cover to first image if not video
    if (item.type !== 'video' && item.images.length > 0) {
      item.url = item.images[0];
    }

    // Default href
    item.href = `#/work/${item.id}`;

    // Apply meta.json overrides
    const metaPath = `${folderPath}/meta.json`;
    if (metaFiles[metaPath]) {
      const module = metaFiles[metaPath] as any;
      const meta = module.default || module;
      item.meta = meta;
      
      if (meta.title) item.title = meta.title;
      if (meta.description) item.description = meta.description;
      if (typeof meta.order === 'number') item.order = meta.order;
      
      // 3. Custom Image Ordering
      if (meta.image_order && Array.isArray(meta.image_order)) {
        const orderedImages: string[] = [];
        meta.image_order.forEach((fileName: string) => {
          const url = lookup(fileName);
          if (url && !orderedImages.includes(url)) orderedImages.push(url);
        });
        // Add any remaining images that weren't in the list
        item.images.forEach((imgUrl: string) => {
          if (!orderedImages.includes(imgUrl)) {
            orderedImages.push(imgUrl);
          }
        });
        item.images = orderedImages;
        // Without an explicit cover, the first image in the chosen order is the cover
        if (!meta.cover && item.type !== 'video' && orderedImages.length) item.url = orderedImages[0];
      }

      // Images picked for the home page, in the chosen order
      if (Array.isArray(meta.home)) {
        item.home = meta.home.map(lookup).filter(Boolean);
      }

      // Explicit cover override
      if (meta.cover && lookup(meta.cover)) {
        item.url = lookup(meta.cover);
      }
      
      if (meta.slug) {
        item.id = meta.slug;
        item.href = `#/work/${meta.slug}`;
      }

      if (meta.type) item.type = meta.type;
    }

    item.visible = item.meta?.visible !== false;

    // Hidden images stay in the folder (and in the editor) but disappear from the site
    const hiddenFiles: string[] = Array.isArray(item.meta?.hidden) ? item.meta.hidden.map(photoName) : [];
    item.allImages = [...item.images];
    item.hidden = item.allImages.filter((url: string) => hiddenFiles.includes(item.files[url]));
    item.images = item.allImages.filter((url: string) => !item.hidden.includes(url));
    if (item.home) item.home = item.home.filter((url: string) => !item.hidden.includes(url));
    if (item.type !== 'video' && !item.images.includes(item.url)) item.url = item.images[0] ?? '';

    // Auto-detect set if multiple images exist
    if (item.images.length > 1) {
      item.type = 'set';
    }
  }

  // Final sort: by order first, then by ID
  return (Object.values(works) as WorkItem[]).sort((a: any, b: any) => {
    if (a.order !== b.order) {
      return a.order - b.order;
    }
    return a.id.localeCompare(b.id);
  });
}
