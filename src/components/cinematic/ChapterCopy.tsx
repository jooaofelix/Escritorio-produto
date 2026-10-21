import type { Ref } from 'react';
import { whatsappUrl } from '@/config/site';
import type { Chapter } from '@/data/chapters';

interface ChapterCopyProps {
  readonly chapter: Chapter;
  /** Posição do capítulo: o primeiro é o único `<h1>` da página. */
  readonly index: number;
  readonly align?: 'start' | 'center';
  readonly ctaRef?: Ref<HTMLAnchorElement>;
  readonly onCtaFocus?: () => void;
}

/** Título + apoio (+ CTA no capítulo final). No hero todo texto é ink (docs/design-system.md §6). */
export function ChapterCopy({ chapter, index, align = 'start', ctaRef, onCtaFocus }: ChapterCopyProps) {
  const Heading = index === 0 ? 'h1' : 'h2';
  const centered = align === 'center';
  return (
    <>
      <Heading className="text-display-xl text-ink">{chapter.title}</Heading>
      <p className={`mt-4 text-lead text-ink ${centered ? 'mx-auto max-w-[52ch]' : 'max-w-[34ch]'}`}>{chapter.body}</p>
      {chapter.cta ? (
        <a
          ref={ctaRef}
          href={whatsappUrl()}
          target="_blank"
          rel="noopener noreferrer"
          onFocus={onCtaFocus}
          className="group mt-8 inline-flex min-h-12 items-center gap-2.5 rounded-sm bg-sun px-6 text-base font-semibold text-ink transition-colors duration-160 ease-out-soft hover:bg-sun-deep active:translate-y-px active:bg-sun-deep"
        >
          {chapter.cta}
          <span aria-hidden="true" className="inline-block transition-transform duration-240 ease-out-soft group-hover:translate-x-1">
            →
          </span>
          <span className="sr-only"> (abre o WhatsApp)</span>
        </a>
      ) : null}
    </>
  );
}
