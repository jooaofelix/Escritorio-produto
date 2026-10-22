import { chapters } from '@/data/chapters';
import { LAST_VIDEO_FRAME } from './frames';

/**
 * Linha do tempo da sequência em "unidades de frame do vídeo": 0..LAST_VIDEO_FRAME é o vídeo
 * (12 fps), seguido de um pequeno trecho parado no último frame para o capítulo final (e o CTA)
 * ficar legível até o fim do pin.
 */
export const END_HOLD = 16;
export const TIMELINE_LENGTH = LAST_VIDEO_FRAME + END_HOLD;

/** Deslocamento vertical (px) das entradas/saídas dos textos. */
export const TEXT_SHIFT = 24;
/** Duração (em frames) de cada fade de texto. */
export const TEXT_FADE = 6;
/** Quanto (em frames) cada fade avança além do intervalo do capítulo. */
export const TEXT_OVERLAP = 2;
/** Duração (em frames) do fade do aviso "Role para ver". */
export const HINT_FADE = 5;

/** Comprimento da rolagem do pin, em múltiplos da altura da viewport (pin total ≈ 400vh / 360vh). */
export const SCROLL_FACTOR = { wide: 3, stacked: 2.6 } as const;
/** Limite de devicePixelRatio do canvas. */
export const MAX_DPR = { wide: 2, stacked: 1.5 } as const;
/** Suavização do scrub (s). */
export const SCRUB = 0.5;

const finalChapter = chapters[chapters.length - 1]!;

/** A partir deste ponto o CTA do capítulo final está visível o bastante para receber clique. */
export const CTA_ACTIVE_TIME = finalChapter.start - TEXT_OVERLAP + TEXT_FADE / 2;
/** Ponto da timeline para onde a página rola quando o CTA recebe foco ainda invisível. */
export const CTA_REVEAL_TIME = Math.min(LAST_VIDEO_FRAME, finalChapter.start + 10);
