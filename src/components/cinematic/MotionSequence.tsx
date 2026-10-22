import { useCallback, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { chapters, sequenceLabel } from '@/data/chapters';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { ChapterCopy, ChapterCta } from './ChapterCopy';
import { createSequenceTimeline, scrollForTime } from './createSequenceTimeline';
import { FramePlayer, type PlayerLayout } from './framePlayer';
import { DESKTOP_FRAMES_QUERY, FRAME_ASPECT, getFrameSet, type FrameSetKey } from './frames';
import { ProgressIndicator } from './ProgressIndicator';
import { CTA_ACTIVE_TIME, CTA_REVEAL_TIME, MAX_DPR, SCROLL_FACTOR } from './sequence';
import { STACKED_LAYOUT_QUERY, useMediaQuery } from './useMediaQuery';

const WIDE_LAYOUT: PlayerLayout = { maxDpr: MAX_DPR.wide };
const STACKED_LAYOUT: PlayerLayout = { maxDpr: MAX_DPR.stacked };

/**
 * Painel 9:16 do layout largo: altura = viewport − header − respiro (em cima e embaixo), sem cortar o
 * quadro; se a coluna for estreita demais, a largura manda e a altura acompanha (aspect-ratio).
 */
const PANEL_STYLE: CSSProperties = {
  aspectRatio: String(FRAME_ASPECT),
  width: `min(100%, calc((100svh - var(--spacing-header) - 2 * var(--panel-gap)) * ${FRAME_ASPECT}))`,
};

interface MotionSequenceProps {
  /** O primeiro frame (ou o canvas) falhou: o pai troca para a versão estática. */
  readonly onFail: () => void;
}

/**
 * Sequência frame-by-frame em canvas (vídeo vertical 9:16), fixada (pin) e controlada pela rolagem.
 *
 * - Largo (desktop/paisagem): coluna de texto à esquerda e o canvas como painel 9:16 à direita, inteiro.
 * - Tela cheia (mobile/retrato): canvas em `cover` no viewport; texto no alto, sobre um véu studio
 *   que acompanha cada capítulo; o CTA do capítulo final fica na base.
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
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);
  const fillRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const playerRef = useRef<FramePlayer | null>(null);
  const sequenceRef = useRef<ReturnType<typeof createSequenceTimeline> | null>(null);
  /** Progresso no momento em que a timeline foi desfeita (troca de layout): retomado na próxima. */
  const resumeProgressRef = useRef(0);
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
          cta,
        },
        {
          scrollLength: () => window.innerHeight * factor,
          onFrame: (frame) => player.setFrame(frame),
        },
      );
    }, stage);

    // Troca de layout no meio da sequência: mantém o mesmo ponto da história.
    const previous = resumeProgressRef.current;
    resumeProgressRef.current = 0;
    const trigger = sequenceRef.current?.trigger;
    if (trigger && previous > 0 && previous < 1) {
      // Criado durante o refresh do resize, o trigger ainda não mediu start/end: mede antes de rolar.
      if (!(trigger.end > trigger.start)) trigger.refresh();
      window.scrollTo({ top: trigger.start + (trigger.end - trigger.start) * previous, behavior: 'instant' });
    }

    return () => {
      // Lido antes do revert: ao desfazer o pin o ScrollTrigger volta o progresso a 0.
      resumeProgressRef.current = sequenceRef.current?.trigger.progress ?? 0;
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

  return (
    // Wrapper próprio: o pin-spacer do GSAP fica dentro dele, e o React só remove este nó.
    <div className="relative">
      <div ref={stageRef} className="relative isolate h-svh overflow-hidden bg-studio [--panel-gap:clamp(1rem,4svh,2.5rem)]">
        <div
          className={
            stacked
              ? 'absolute inset-0'
              : 'container-page grid h-full grid-cols-12 items-center gap-x-6 pt-[calc(var(--spacing-header)_+_var(--panel-gap))] pb-(--panel-gap) lg:gap-x-8'
          }
        >
          {/* Mídia: pôster (primeiro frame, LCP) até o primeiro desenho; depois o canvas. Sempre o 1º filho. */}
          <div
            role="img"
            aria-label={sequenceLabel}
            style={stacked ? undefined : PANEL_STYLE}
            className={
              stacked
                ? 'absolute inset-0'
                : 'relative col-span-6 col-start-7 row-start-1 justify-self-end overflow-hidden rounded-xs'
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
            <p
              ref={hintRef}
              aria-hidden="true"
              className={`pointer-events-none absolute left-1/2 -translate-x-1/2 rounded-xs bg-studio/85 px-3 py-1 text-small whitespace-nowrap text-ink ${
                stacked ? 'bottom-[max(1.25rem,env(safe-area-inset-bottom))]' : 'bottom-5'
              }`}
            >
              Role para ver <span className="ml-1">↓</span>
            </p>
          </div>

          {stacked ? (
            <div className="container-page pointer-events-none absolute inset-0 flex flex-col pt-[calc(var(--spacing-header)_+_0.75rem)] pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              <ProgressIndicator fillRef={setFill} className="relative z-10" />
              <div className="mt-4 grid min-h-0 flex-1">
                {chapters.map((chapter, i) => (
                  <div
                    key={chapter.id}
                    ref={setText(i)}
                    className={`col-start-1 row-start-1 flex flex-col ${i ? 'opacity-0' : ''}`}
                  >
                    <div className="relative">
                      {/* Véu funcional (contraste AA do ink sobre o frame): do topo até o fim do texto, depois some. */}
                      <div aria-hidden="true" className="absolute -inset-x-gutter -top-[50svh] bottom-0 bg-studio/70" />
                      <div
                        aria-hidden="true"
                        className="absolute -inset-x-gutter top-full h-16 bg-linear-to-b from-studio/70 to-transparent"
                      />
                      <div className="relative">
                        <ChapterCopy chapter={chapter} index={i} withCta={false} />
                      </div>
                    </div>
                    {chapter.cta ? (
                      <div className="mt-auto pt-6">
                        <ChapterCta label={chapter.cta} ctaRef={ctaRef} onFocus={revealCta} />
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Coluna de texto (cols 1–6), centrada na vertical; progresso logo abaixo.
            <div className="pointer-events-none col-span-6 col-start-1 row-start-1">
              <div className="grid">
                {chapters.map((chapter, i) => (
                  <div key={chapter.id} ref={setText(i)} className={`col-start-1 row-start-1 self-end ${i ? 'opacity-0' : ''}`}>
                    <ChapterCopy chapter={chapter} index={i} ctaRef={ctaRef} onCtaFocus={revealCta} />
                  </div>
                ))}
              </div>
              <ProgressIndicator fillRef={setFill} className="mt-10" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
