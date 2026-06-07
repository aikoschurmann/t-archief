/**
 * Automatic Work Loader
 * Scans src/lib/assets/work and resolves items based on folder contents.
 */

const mediaFiles = import.meta.glob('/src/lib/assets/work/**/*.{jpg,jpeg,png,webp,mp4}', { eager: true, query: '?url', import: 'default' });
const metaFiles = import.meta.glob('/src/lib/assets/work/**/meta.json', { eager: true });

export type WorkItem = {
  id: string;
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

export const imageAssetsMap: Record<string, { smSrc: string, mdSrc: string, blurSrc: string }> = {};
const worksData: Record<string, WorkItem> = {};
const folderFiles: Record<string, Record<string, string>> = {};

// Pre-process files at module load time
for (const path in mediaFiles) {
  const url = mediaFiles[path] as string;
  const parts = path.split('/');
  const fileName = parts.pop()!;
  const folderName = parts.pop()!;
  const folderPath = parts.join('/') + '/' + folderName;

  if (folderName === 'work') continue;

  if (!worksData[folderPath]) {
    worksData[folderPath] = {
      id: folderName,
      title: folderName.replace(/-/g, ' '),
      type: 'image',
      url: '',
      images: [],
      order: 999, // Default to end of list
      meta: {}
    };
    folderFiles[folderPath] = {};
  }

  folderFiles[folderPath][fileName] = url;

  if (fileName.endsWith('.mp4')) {
    worksData[folderPath].videoUrl = url;
    worksData[folderPath].type = 'video';
  } else {
    // Ignore optimized variations (_sm, _md, _blur)
    if (!fileName.match(/_(sm|md|blur)\.(webp|jpg|jpeg|png)$/i)) {
      worksData[folderPath].images.push(url);
    }
  }
}

// Build the imageAssetsMap mapping original hashed URL to variant hashed URLs
for (const folderPath in folderFiles) {
  const files = folderFiles[folderPath];
  for (const fileName in files) {
    if (!fileName.match(/_(sm|md|blur)\.(webp|jpg|jpeg|png)$/i) && !fileName.endsWith('.mp4')) {
      const originalUrl = files[fileName];
      const base = fileName.substring(0, fileName.lastIndexOf('.'));
      imageAssetsMap[originalUrl] = {
        smSrc: files[`${base}_sm.webp`] || originalUrl,
        mdSrc: files[`${base}_md.webp`] || originalUrl,
        blurSrc: files[`${base}_blur.webp`] || ''
      };
    }
  }
}

export function loadWorks(): WorkItem[] {
  // Clone to avoid mutation issues if called multiple times, though meta is static.
  const works = JSON.parse(JSON.stringify(worksData)); 

  // 2. Resolve 'Set' type automatically & process Metadata
  for (const folderPath in works) {
    const item = works[folderPath];
    const files = folderFiles[folderPath];
    
    // Set default cover to first image if not video
    if (item.type !== 'video' && item.images.length > 0) {
      item.url = item.images[0];
    } else if (item.type === 'video') {
      // For videos, try to find a cover image (first non-video file)
      const firstImage = Object.keys(files).find(f => !f.endsWith('.mp4') && !f.match(/_(sm|md|blur)\.(webp|jpg|jpeg|png)$/i));
      if (firstImage) {
        item.url = files[firstImage];
      }
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
          if (files[fileName]) {
            orderedImages.push(files[fileName]);
          }
        });
        // Add any remaining images that weren't in the list
        item.images.forEach((imgUrl: string) => {
          if (!orderedImages.includes(imgUrl)) {
            orderedImages.push(imgUrl);
          }
        });
        item.images = orderedImages;
      }

      // Explicit cover override
      if (meta.cover && files[meta.cover]) {
        item.url = files[meta.cover];
      }
      
      if (meta.slug) {
        item.id = meta.slug;
        item.href = `#/work/${meta.slug}`;
      }

      if (meta.type) item.type = meta.type;
    }

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
