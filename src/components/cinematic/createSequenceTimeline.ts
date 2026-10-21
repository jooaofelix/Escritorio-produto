import { chapters } from '@/data/chapters';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { LAST_VIDEO_FRAME } from './frames';
import {
  CTA_ACTIVE_TIME,
  END_HOLD,
  SCRUB,
  TEXT_FADE,
  TEXT_OVERLAP,
  TEXT_SHIFT,
  TIMELINE_LENGTH,
  VEIL_BOOST_FADE,
  VEIL_BOOST_OUT,
} from './sequence';

export interface SequenceTargets {
  /** Elemento fixado (pin) durante a sequência. */
  readonly stage: HTMLElement;
  /** Bloco de texto de cada capítulo, na ordem de `chapters`. */
  readonly texts: readonly (HTMLElement | null)[];
  /** Preenchimento de cada segmento do indicador. */
  readonly fills: readonly (HTMLElement | null)[];
  readonly hint: HTMLElement | null;
  /** Véu lateral atrás dos capítulos 1–3 (só no layout largo). */
  readonly veilSide: HTMLElement | null;
  /** Véu superior atrás do capítulo final (só no layout largo). */
  readonly veilTop: HTMLElement | null;
  /**
   * Reforço temporário do véu superior: na entrada do capítulo final a câmera ainda está fechada
   * e os objetos pretos ficam atrás do texto; some quando o quadro abre (contraste AA medido).
   */
  readonly veilBoost: HTMLElement | null;
  readonly cta: HTMLElement | null;
}

export interface SequenceOptions {
  /** Distância de rolagem do pin, em px (reavaliada a cada refresh do ScrollTrigger). */
  readonly scrollLength: () => number;
  readonly onFrame: (frame: number) => void;
}

export interface SequenceTimeline {
  readonly timeline: gsap.core.Timeline;
  readonly trigger: ScrollTrigger;
}

/**
 * Monta a timeline (em unidades de frame do vídeo) e a liga a um ScrollTrigger com pin + scrub.
 * Deve ser chamada dentro de um gsap.context para que `revert()` desfaça pin, tweens e estilos inline.
 */
export function createSequenceTimeline(targets: SequenceTargets, options: SequenceOptions): SequenceTimeline {
  const last = chapters.length - 1;
  const proxy = { frame: 0 };
  const timeline = gsap.timeline({ paused: true, defaults: { ease: 'none' } });

  timeline.to(proxy, { frame: LAST_VIDEO_FRAME, duration: LAST_VIDEO_FRAME, onUpdate: () => options.onFrame(proxy.frame) }, 0);
  // Trecho parado no último frame (capítulo final + CTA seguem visíveis até soltar o pin).
  timeline.to({}, { duration: END_HOLD }, LAST_VIDEO_FRAME);

  chapters.forEach((chapter, i) => {
    const text = targets.texts[i];
    if (text) {
      if (i > 0) {
        timeline.fromTo(
          text,
          { opacity: 0, y: TEXT_SHIFT },
          { opacity: 1, y: 0, duration: TEXT_FADE, ease: 'power2.out' },
          chapter.start - TEXT_OVERLAP,
        );
      }
      if (i < last) {
        timeline.fromTo(
          text,
          { opacity: 1, y: 0 },
          { opacity: 0, y: -TEXT_SHIFT, duration: TEXT_FADE, ease: 'power2.in', immediateRender: false },
          chapter.end + TEXT_OVERLAP - TEXT_FADE,
        );
      }
    }
    const fill = targets.fills[i];
    if (fill) {
      timeline.fromTo(fill, { scaleX: 0 }, { scaleX: 1, duration: Math.max(1, chapter.end - chapter.start) }, chapter.start);
    }
  });

  if (targets.hint) {
    timeline.fromTo(targets.hint, { opacity: 1 }, { opacity: 0, duration: 8, immediateRender: false }, 0);
  }

  const veilFade = 12;
  const beforeFinal = chapters[last - 1];
  const finalChapter = chapters[last]!;
  if (targets.veilSide && beforeFinal) {
    timeline.fromTo(
      targets.veilSide,
      { opacity: 1 },
      { opacity: 0, duration: veilFade, immediateRender: false },
      beforeFinal.end + TEXT_OVERLAP - veilFade,
    );
  }
  // Véus do capítulo final completos antes de o texto ficar opaco (o fade do texto é ease-out).
  const veilInFade = TEXT_FADE;
  const veilIn = finalChapter.start - TEXT_OVERLAP - veilInFade / 2;
  if (targets.veilTop) {
    timeline.fromTo(targets.veilTop, { opacity: 0 }, { opacity: 1, duration: veilInFade }, veilIn);
  }
  if (targets.veilBoost) {
    timeline.fromTo(targets.veilBoost, { opacity: 0 }, { opacity: 1, duration: veilInFade }, veilIn);
    timeline.fromTo(
      targets.veilBoost,
      { opacity: 1 },
      { opacity: 0, duration: VEIL_BOOST_FADE, immediateRender: false },
      VEIL_BOOST_OUT - VEIL_BOOST_FADE,
    );
  }

  // O CTA só aceita ponteiro quando está de fato visível (evita clique em link invisível).
  let ctaActive: boolean | null = null;
  const syncCta = () => {
    const active = timeline.time() >= CTA_ACTIVE_TIME;
    if (active === ctaActive || !targets.cta) return;
    ctaActive = active;
    targets.cta.style.pointerEvents = active ? 'auto' : 'none';
  };
  timeline.eventCallback('onUpdate', syncCta);
  syncCta();

  const trigger = ScrollTrigger.create({
    animation: timeline,
    trigger: targets.stage,
    pin: targets.stage,
    start: 'top top',
    end: () => `+=${Math.round(options.scrollLength())}`,
    scrub: SCRUB,
    refreshPriority: 10,
  });

  return { timeline, trigger };
}

/** Posição de rolagem (px) que leva a timeline ao tempo `time`. */
export function scrollForTime(trigger: ScrollTrigger, time: number): number {
  return trigger.start + (trigger.end - trigger.start) * (time / TIMELINE_LENGTH);
}
