import { chapters } from '@/data/chapters';
import { ChapterCopy } from './ChapterCopy';
import { STILL_HEIGHT, STILL_WIDTH, stillSrc, stillSrcSet } from './frames';

const SIZES = '(min-width: 768px) 58vw, 100vw';

/**
 * Versão sem pin nem scrub: prefers-reduced-motion e fallback quando o primeiro frame falha.
 * Os 4 capítulos em sequência, cada um com o seu still (AVIF/WebP), texto e, no último, o CTA.
 */
export function StaticSequence() {
  return (
    <div className="bg-studio pt-header">
      {chapters.map((chapter, i) => (
        <div
          key={chapter.id}
          className="container-page grid items-center gap-8 py-12 md:grid-cols-12 md:gap-x-8 md:py-16"
        >
          <div className="md:col-span-5">
            <ChapterCopy chapter={chapter} index={i} />
          </div>
          <picture className="block md:col-span-7">
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
              className="block h-auto w-full rounded-xs bg-studio"
            />
          </picture>
        </div>
      ))}
    </div>
  );
}
