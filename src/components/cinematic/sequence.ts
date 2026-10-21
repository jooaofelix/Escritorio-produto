import { chapters } from '@/data/chapters';
import { LAST_VIDEO_FRAME } from './frames';

/**
 * Linha do tempo da sequência em "unidades de frame do vídeo": 0..LAST_VIDEO_FRAME é o vídeo,
 * seguido de um pequeno trecho parado no último frame para o capítulo 4 (e o CTA) ficar legível
 * até o fim do pin.
 */
export const END_HOLD = 24;
export const TIMELINE_LENGTH = LAST_VIDEO_FRAME + END_HOLD;

/** Deslocamento vertical (px) das entradas/saídas dos textos. */
export const TEXT_SHIFT = 24;
/** Duração (em frames) de cada fade de texto. */
export const TEXT_FADE = 10;
/** Quanto (em frames) cada fade avança além do intervalo do capítulo: gera a sobreposição curta. */
export const TEXT_OVERLAP = 3;

/** Comprimento da rolagem do pin, em múltiplos da altura da viewport (pin total ≈ 400vh / 340vh). */
export const SCROLL_FACTOR = { wide: 3, stacked: 2.4 } as const;
/** Limite de devicePixelRatio do canvas. */
export const MAX_DPR = { wide: 2, stacked: 1.5 } as const;
/** Suavização do scrub (s). */
export const SCRUB = 0.5;

const finalChapter = chapters[chapters.length - 1]!;

/** A partir deste ponto o CTA do capítulo final está visível o bastante para receber clique. */
export const CTA_ACTIVE_TIME = finalChapter.start - TEXT_OVERLAP + TEXT_FADE / 2;
/** Ponto da timeline para onde a página rola quando o CTA recebe foco ainda invisível. */
export const CTA_REVEAL_TIME = Math.min(LAST_VIDEO_FRAME, finalChapter.start + 20);

const focalKeys = chapters.map((chapter) => ({ at: (chapter.start + chapter.end) / 2, x: chapter.focalX }));

/** Ponto focal X (layout empilhado) para um frame do vídeo: interpola entre os centros dos capítulos. */
export function stackedFocalAt(frame: number): number {
  const first = focalKeys[0]!;
  const last = focalKeys[focalKeys.length - 1]!;
  if (frame <= first.at) return first.x;
  if (frame >= last.at) return last.x;
  for (let i = 1; i < focalKeys.length; i++) {
    const a = focalKeys[i - 1]!;
    const b = focalKeys[i]!;
    if (frame <= b.at) {
      const t = (frame - a.at) / (b.at - a.at);
      const eased = t * t * (3 - 2 * t);
      return a.x + (b.x - a.x) * eased;
    }
  }
  return last.x;
}

export const wideFocalAt = (): number => 0.5;
