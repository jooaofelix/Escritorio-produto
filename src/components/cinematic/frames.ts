import manifest from '@/data/frames-manifest.json';

export type FrameSetKey = 'desktop' | 'mobile';

export interface FrameSet {
  readonly key: FrameSetKey;
  /** URL de cada arquivo, na ordem (índice de arquivo, não de frame do vídeo). */
  readonly urls: readonly string[];
  /** Quantos frames do vídeo cada arquivo avança (mobile = 2). */
  readonly step: number;
  readonly width: number;
  readonly height: number;
}

/** Mesmo breakpoint dos `<link rel=preload>` do index.html: decide qual conjunto de frames usar. */
export const DESKTOP_FRAMES_QUERY = '(min-width: 768px)';

/** Último frame do vídeo-fonte (0-based). */
export const LAST_VIDEO_FRAME = manifest.sourceFrameCount - 1;

const pad = (n: number) => String(n).padStart(manifest.pad, '0');

export function getFrameSet(key: FrameSetKey): FrameSet {
  const set = manifest[key];
  return {
    key,
    step: set.step,
    width: set.width,
    height: set.height,
    urls: Array.from({ length: set.count }, (_, i) => `${set.path}${pad(i + 1)}.${manifest.ext}`),
  };
}

export type StillFormat = 'avif' | 'webp';

export const STILL_WIDTH = Math.max(...manifest.stills.widths);
export const STILL_HEIGHT = Math.round((STILL_WIDTH * manifest.desktop.height) / manifest.desktop.width);

export function stillSrc(frame: number, width: number, format: StillFormat): string {
  return `${manifest.stills.path}${pad(frame)}-${width}.${format}`;
}

export function stillSrcSet(frame: number, format: StillFormat): string {
  return manifest.stills.widths.map((w) => `${stillSrc(frame, w, format)} ${w}w`).join(', ');
}
