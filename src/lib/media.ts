import fs from 'node:fs';
import path from 'node:path';
import type { ImageSlot } from '../content/site';

/** Returns the image only if its file exists in /public, so a missing upload never renders a broken image. */
export function existing(image?: ImageSlot): ImageSlot | undefined {
  if (!image) return undefined;
  return fs.existsSync(path.join(process.cwd(), 'public', image.src)) ? image : undefined;
}

export const isPortrait = (image: ImageSlot) => ['3/4', '4/5'].includes(image.ratio ?? '');
