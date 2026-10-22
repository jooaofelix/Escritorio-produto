import manifest from '@/data/scroll-manifest.json';

export type FrameSetKey = 'desktop' | 'mobile';

export interface FrameSet {
  readonly key: FrameSetKey;
  /** URL de cada arquivo, na ordem (índice de arquivo = frame do vídeo, nos dois conjuntos). */
  readonly urls: readonly string[];
  readonly width: number;
  readonly height: number;
}

/** Mesmo breakpoint dos `<link rel=preload>` do index.html: decide qual conjunto de frames usar. */
export const DESKTOP_FRAMES_QUERY = '(min-width: 768px)';

/** Último frame do vídeo (0-based). */
export const LAST_VIDEO_FRAME = manifest.count - 1;

/** Proporção do quadro (9:16): o painel do layout largo usa a mesma, sem corte. */
export const FRAME_ASPECT = manifest.desktop.width / manifest.desktop.height;

const pad = (n: number) => String(n).padStart(manifest.pad, '0');

export function getFrameSet(key: FrameSetKey): FrameSet {
  const set = manifest[key];
  return {
    key,
    width: set.width,
    height: set.height,
    urls: Array.from({ length: manifest.count }, (_, i) => `${set.path}${pad(i + 1)}.${manifest.ext}`),
  };
}

export type StillFormat = 'avif' | 'webp';

export const STILL_WIDTH = Math.max(...manifest.stills.widths);
export const STILL_HEIGHT = Math.round(STILL_WIDTH / FRAME_ASPECT);

export function stillSrc(frame: number, width: number, format: StillFormat): string {
  return `${manifest.stills.path}${pad(frame)}-${width}.${format}`;
}

export function stillSrcSet(frame: number, format: StillFormat): string {
  return manifest.stills.widths.map((w) => `${stillSrc(frame, w, format)} ${w}w`).join(', ');
}
