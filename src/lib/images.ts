/**
 * Photos are stored in src/assets/images (the CMS uploads there) but content refers to them as
 * `/images/<file>` (the CMS `public_folder`). These helpers map such a path to the file and let
 * Astro resize it and convert it to WebP at build time. Anything else (an external URL, a file in
 * public/) is passed through untouched.
 */
import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';

/** = `public_folder` in public/admin/config.yml */
const PUBLIC_PREFIX = '/images/';
const files = import.meta.glob<{ default: ImageMetadata }>('/src/assets/images/**/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG}', {
  eager: true,
});

/** Image file behind a content path, or undefined when the path isn't an /images/… photo. */
function findImage(src: string): ImageMetadata | undefined {
  if (!src.startsWith(PUBLIC_PREFIX)) return undefined;
  const file = files[`/src/assets/images/${decodeURI(src.slice(PUBLIC_PREFIX.length))}`];
  if (!file) throw new Error(`Image "${src}" not found — expected src/assets/images/${src.slice(PUBLIC_PREFIX.length)}`);
  return file.default;
}

/** Candidate widths for srcset (Astro skips the ones larger than the original). */
const WIDTHS = [480, 768, 1024, 1536, 2048];

export interface ImgAttrs {
  src: string;
  srcset?: string;
  sizes?: string;
  width?: number;
  height?: number;
}

/** src/srcset/sizes/width/height for an <img>; `sizes` = how wide the image is shown. */
export async function responsive(src: string, sizes = '100vw'): Promise<ImgAttrs> {
  const meta = findImage(src);
  if (!meta) return { src };
  const img = await getImage({ src: meta, widths: WIDTHS.filter((w) => w < meta.width).concat(meta.width), format: 'webp' });
  return { src: img.src, srcset: img.srcSet.attribute, sizes, width: meta.width, height: meta.height };
}

/** One large WebP — the lightbox target. */
export async function fullSize(src: string): Promise<string> {
  const meta = findImage(src);
  return meta ? (await getImage({ src: meta, width: Math.min(meta.width, 2048), format: 'webp' })).src : src;
}

/** 1200 px JPEG for social sharing (og:image) and Google — JPEG works everywhere. */
export async function shareImage(src: string): Promise<string> {
  const meta = findImage(src);
  return meta ? (await getImage({ src: meta, width: Math.min(meta.width, 1200), format: 'jpg' })).src : src;
}
