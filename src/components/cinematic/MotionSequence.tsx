import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { chapters, sequenceLabel } from '@/data/chapters';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { ChapterCopy } from './ChapterCopy';
import { createSequenceTimeline, scrollForTime } from './createSequenceTimeline';
import { FramePlayer, type PlayerLayout } from './framePlayer';
import { DESKTOP_FRAMES_QUERY, getFrameSet, type FrameSetKey } from './frames';
import { ProgressIndicator } from './ProgressIndicator';
import {
  CTA_ACTIVE_TIME,
  CTA_REVEAL_TIME,
  MAX_DPR,
  SCROLL_FACTOR,
  stackedFocalAt,
  wideFocalAt,
} from './sequence';
import { STACKED_LAYOUT_QUERY, useMediaQuery } from './useMediaQuery';

const WIDE_LAYOUT: PlayerLayout = { maxDpr: MAX_DPR.wide, focalAt: wideFocalAt };
const STACKED_LAYOUT: PlayerLayout = { maxDpr: MAX_DPR.stacked, focalAt: stackedFocalAt };

const lastIndex = chapters.length - 1;

interface MotionSequenceProps {
  /** O primeiro frame (ou o canvas) falhou: o pai troca para a versão estática. */
  readonly onFail: () => void;
}

/**
 * Sequência frame-by-frame em canvas, fixada (pin) e controlada pela rolagem.
 *
 * Estrutura estável entre layouts: o canvas e o pôster ficam sempre na mesma posição da árvore,
 * para o FramePlayer (efeito 1) sobreviver a uma troca de layout; só a timeline (efeito 2) é refeita.
 */
export function MotionSequence({ onFail }: MotionSequenceProps) {
  const stacked = useMediaQuery(STACKED_LAYOUT_QUERY);
  // Conjunto de frames fixado na montagem (mesmo breakpoint do preload do index.html): evita baixar os dois.
  const [frameSetKey] = useState<FrameSetKey>(() =>
    window.matchMedia(DESKTOP_FRAMES_QUERY).matches ? 'desktop' : 'mobile',
  );
  const frameSet = useMemo(() => getFrameSet(frameSetKey), [frameSetKey]);

  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const posterRef = useRef<HTMLImageElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);
  const veilSideRef = useRef<HTMLDivElement>(null);
  const veilTopRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);
  const fillRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const playerRef = useRef<FramePlayer | null>(null);
  const sequenceRef = useRef<ReturnType<typeof createSequenceTimeline> | null>(null);
  const progressRef = useRef(0);
  const onFailRef = useRef(onFail);
  useLayoutEffect(() => {
    onFailRef.current = onFail;
  }, [onFail]);

  const setText = (i: number) => (element: HTMLDivElement | null) => {
    textRefs.current[i] = element;
  };
  const setFill = useCallback((i: number, element: HTMLSpanElement | null) => {
    fillRefs.current[i] = element;
  }, []);

  // Efeito 1 — player (carregador + canvas). Só depende do conjunto de frames.
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let player: FramePlayer;
    try {
      player = new FramePlayer({ canvas, poster: posterRef.current }, frameSet);
    } catch {
      onFailRef.current();
      return;
    }
    playerRef.current = player;
    player.start().catch(() => onFailRef.current());

    // Resize e mudança de orientação: recalcula o backing store e redesenha o frame atual.
    const observer = new ResizeObserver(() => player.resize());
    observer.observe(canvas);
    const onWindowResize = () => player.resize(); // cobre mudança de DPR (zoom) sem mudança de tamanho CSS
    window.addEventListener('resize', onWindowResize);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', onWindowResize);
      player.dispose();
      playerRef.current = null;
    };
  }, [frameSet]);

  // Efeito 2 — layout + timeline com pin. Refeito quando o layout (largo/empilhado) muda.
  useLayoutEffect(() => {
    const player = playerRef.current;
    const stage = stageRef.current;
    if (!player || !stage) return;
    player.setLayout(stacked ? STACKED_LAYOUT : WIDE_LAYOUT);
    const factor = stacked ? SCROLL_FACTOR.stacked : SCROLL_FACTOR.wide;
    const cta = ctaRef.current;

    const ctx = gsap.context(() => {
      sequenceRef.current = createSequenceTimeline(
        {
          stage,
          texts: textRefs.current.slice(0, chapters.length),
          fills: fillRefs.current.slice(0, chapters.length),
          hint: hintRef.current,
          veilSide: veilSideRef.current,
          veilTop: veilTopRef.current,
          cta,
        },
        {
          scrollLength: () => window.innerHeight * factor,
          onFrame: (frame) => player.setFrame(frame),
          onProgress: (progress) => {
            progressRef.current = progress;
          },
        },
      );
    }, stage);

    // Troca de layout no meio da sequência: mantém o mesmo ponto da história.
    const previous = progressRef.current;
    const trigger = sequenceRef.current?.trigger;
    if (trigger && previous > 0 && previous < 1) {
      window.scrollTo({ top: trigger.start + (trigger.end - trigger.start) * previous, behavior: 'instant' });
    }

    return () => {
      ctx.revert();
      sequenceRef.current = null;
      if (cta) cta.style.pointerEvents = '';
      // O pin some/volta: demais ScrollTriggers da página precisam remedir.
      requestAnimationFrame(() => ScrollTrigger.refresh());
    };
  }, [stacked, frameSet]);

  // CTA focado pelo teclado enquanto invisível: rola até o capítulo final.
  const revealCta = useCallback(() => {
    const sequence = sequenceRef.current;
    if (!sequence || sequence.timeline.time() >= CTA_ACTIVE_TIME) return;
    window.scrollTo({ top: scrollForTime(sequence.trigger, CTA_REVEAL_TIME), behavior: 'instant' });
    ScrollTrigger.update();
    sequence.trigger.getTween()?.progress(1);
  }, []);

  const finalChapter = chapters[lastIndex]!;

  return (
    // Wrapper próprio: o pin-spacer do GSAP fica dentro dele, e o React só remove este nó.
    <div className="relative">
      <div ref={stageRef} className="relative isolate flex h-svh flex-col overflow-hidden bg-studio">
        {/* Faixa do header fixo (layout empilhado). */}
        <div aria-hidden="true" className={stacked ? 'h-header shrink-0' : 'hidden'} />

        {/* Mídia: pôster (primeiro frame, LCP) até o primeiro desenho; depois o canvas. */}
        <div
          role="img"
          aria-label={sequenceLabel}
          className={
            stacked
              ? 'relative h-[min(58svh,calc(100svh_-_var(--spacing-header)_-_17rem))] shrink-0'
              : 'absolute inset-0'
          }
        >
          <img
            ref={posterRef}
            src={frameSet.urls[0]}
            alt=""
            aria-hidden="true"
            width={frameSet.width}
            height={frameSet.height}
            fetchPriority="high"
            onError={() => onFailRef.current()}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full opacity-0" />
          <div
            aria-hidden="true"
            className={
              stacked ? 'pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-linear-to-b from-transparent to-studio' : 'hidden'
            }
          />
          <p
            ref={hintRef}
            aria-hidden="true"
            className={`pointer-events-none absolute left-1/2 -translate-x-1/2 rounded-xs bg-studio/85 px-3 py-1 text-small whitespace-nowrap text-ink ${
              stacked ? 'bottom-3' : 'bottom-7'
            }`}
          >
            Role para ver <span className="ml-1">↓</span>
          </p>
        </div>

        {stacked ? (
          <div className="container-page relative flex min-h-0 flex-1 flex-col pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <ProgressIndicator fillRef={setFill} />
            <div className="pointer-events-none mt-5 grid">
              {chapters.map((chapter, i) => (
                <div key={chapter.id} ref={setText(i)} className={`col-start-1 row-start-1 ${i ? 'opacity-0' : ''}`}>
                  <ChapterCopy
                    chapter={chapter}
                    index={i}
                    ctaRef={chapter.cta ? ctaRef : undefined}
                    onCtaFocus={chapter.cta ? revealCta : undefined}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="pointer-events-none absolute inset-0">
            {/* Véus funcionais (contraste AA do texto ink sobre o frame). */}
            <div
              ref={veilSideRef}
              aria-hidden="true"
              className="absolute inset-0 bg-linear-to-r from-studio/90 from-0% via-studio/65 via-38% to-transparent to-62%"
            />
            <div
              ref={veilTopRef}
              aria-hidden="true"
              className="absolute inset-0 bg-linear-to-b from-studio/90 from-0% to-transparent to-45% opacity-0"
            />

            {/* Capítulos 1–3: colunas 1–5, centrados na vertical; progresso logo abaixo. */}
            <div className="container-page absolute inset-x-0 top-0 bottom-0 grid grid-cols-12 items-center gap-x-6 pt-header lg:gap-x-8">
              <div className="col-span-5">
                <div className="grid">
                  {chapters.slice(0, lastIndex).map((chapter, i) => (
                    <div key={chapter.id} ref={setText(i)} className={`col-start-1 row-start-1 self-end ${i ? 'opacity-0' : ''}`}>
                      <ChapterCopy chapter={chapter} index={i} />
                    </div>
                  ))}
                </div>
                <ProgressIndicator fillRef={setFill} className="mt-10" />
              </div>
            </div>

            {/* Capítulo final: centralizado no alto, abaixo do header. */}
            <div className="container-page absolute inset-x-0 top-0 pt-[calc(var(--spacing-header)+8vh)]">
              <div ref={setText(lastIndex)} className="mx-auto max-w-[48rem] text-center opacity-0">
                <ChapterCopy chapter={finalChapter} index={lastIndex} align="center" ctaRef={ctaRef} onCtaFocus={revealCta} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
