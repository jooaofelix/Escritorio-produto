import type { CSSProperties } from 'react';
import { chapters } from '@/data/chapters';
import { ChapterCopy } from './ChapterCopy';
import { FRAME_ASPECT, STILL_HEIGHT, STILL_WIDTH, stillSrc, stillSrcSet } from './frames';

/** Largura de exibição dos stills 9:16: limitada pela altura da tela (o quadro inteiro cabe sem rolar). */
const SIZES = '(min-width: 768px) min(36vw, 44svh), min(92vw, 39svh)';
const STILL_STYLE = { '--still-aspect': FRAME_ASPECT } as CSSProperties;

/**
 * Versão sem pin nem scrub: prefers-reduced-motion e fallback quando o primeiro frame falha.
 * Os 4 capítulos em sequência, cada um com o seu still 9:16 (AVIF/WebP), texto e, no último, logo e CTA.
 */
export function StaticSequence() {
  return (
    <div className="bg-studio pt-header" style={STILL_STYLE}>
      {chapters.map((chapter, i) => (
        <div
          key={chapter.id}
          className="container-page grid items-center gap-8 py-12 md:grid-cols-12 md:gap-x-8 md:py-16"
        >
          <div className="md:col-span-6">
            <ChapterCopy chapter={chapter} index={i} />
          </div>
          <picture className="block md:col-span-5 md:col-start-8 md:justify-self-end">
            <source type="image/avif" srcSet={stillSrcSet(chapter.still, 'avif')} sizes={SIZES} />
            <source type="image/webp" srcSet={stillSrcSet(chapter.still, 'webp')} sizes={SIZES} />
            <img
              src={stillSrc(chapter.still, STILL_WIDTH, 'webp')}
              width={STILL_WIDTH}
              height={STILL_HEIGHT}
              alt={chapter.stillAlt}
              loading={i === 0 ? 'eager' : 'lazy'}
              fetchPriority={i === 0 ? 'high' : 'auto'}
              decoding="async"
              className="block h-auto w-[min(100%,calc(70svh_*_var(--still-aspect)))] rounded-xs bg-studio md:w-[min(100%,calc(78svh_*_var(--still-aspect)))]"
            />
          </picture>
        </div>
      ))}
    </div>
  );
}
