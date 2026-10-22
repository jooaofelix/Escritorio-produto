import type { Ref } from 'react';
import { whatsappUrl } from '@/config/site';
import type { Chapter } from '@/data/chapters';

/** Logo oficial (868×352), sem recolorir. */
const LOGO = { src: '/brand/logo-coloridamente.svg', width: 868, height: 352 } as const;

interface ChapterCopyProps {
  readonly chapter: Chapter;
  /** Posição do capítulo: o primeiro é o único `<h1>` da página. */
  readonly index: number;
  /** false: o CTA é renderizado à parte (layout de tela cheia, CTA na base). */
  readonly withCta?: boolean;
  readonly ctaRef?: Ref<HTMLAnchorElement>;
  readonly onCtaFocus?: () => void;
}

/** Logo (capítulo final) + título + apoio (+ CTA). No hero todo texto é ink (docs/design-system.md §6). */
export function ChapterCopy({ chapter, index, withCta = true, ctaRef, onCtaFocus }: ChapterCopyProps) {
  const Heading = index === 0 ? 'h1' : 'h2';
  return (
    <>
      {chapter.logo ? (
        <img
          src={LOGO.src}
          alt="Coloridamente"
          width={LOGO.width}
          height={LOGO.height}
          decoding="async"
          className="mb-6 block h-12 w-auto md:mb-8 md:h-16 lg:h-20"
        />
      ) : null}
      <Heading className="text-display-xl text-ink">{chapter.title}</Heading>
      {chapter.body ? <p className="mt-4 max-w-[34ch] text-lead text-ink">{chapter.body}</p> : null}
      {withCta && chapter.cta ? <ChapterCta label={chapter.cta} ctaRef={ctaRef} onFocus={onCtaFocus} className="mt-8" /> : null}
    </>
  );
}

interface ChapterCtaProps {
  readonly label: string;
  readonly ctaRef?: Ref<HTMLAnchorElement>;
  readonly onFocus?: () => void;
  readonly className?: string;
}

/** CTA primário do capítulo final: abre o WhatsApp com a mensagem padrão. */
export function ChapterCta({ label, ctaRef, onFocus, className = '' }: ChapterCtaProps) {
  return (
    <a
      ref={ctaRef}
      href={whatsappUrl()}
      target="_blank"
      rel="noopener noreferrer"
      onFocus={onFocus}
      className={`group inline-flex min-h-12 items-center gap-2.5 rounded-sm bg-sun px-6 text-base font-semibold text-ink transition-colors duration-160 ease-out-soft hover:bg-sun-deep active:translate-y-px active:bg-sun-deep ${className}`}
    >
      {label}
      <span aria-hidden="true" className="inline-block transition-transform duration-240 ease-out-soft group-hover:translate-x-1">
        →
      </span>
      <span className="sr-only"> (abre o WhatsApp)</span>
    </a>
  );
}
