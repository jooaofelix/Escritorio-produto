/**
 * Capítulos da sequência cinematográfica do hero.
 *
 * `start`/`end` são frames do vídeo-fonte (0..240, 24 fps) e prendem as entradas/saídas
 * dos textos aos momentos da animação. A copy é literal do briefing.
 */
export type ChapterTone = 'coral' | 'olive' | 'mint' | 'sun';

export interface Chapter {
  readonly id: string;
  readonly title: string;
  readonly body: string;
  /** Primeiro frame do vídeo em que o capítulo está em cena (inclusivo). */
  readonly start: number;
  /** Último frame do vídeo em que o capítulo está em cena (inclusivo). */
  readonly end: number;
  /** Cor do segmento no indicador de progresso. */
  readonly tone: ChapterTone;
  /**
   * Ponto focal horizontal (0–1) do canvas no layout empilhado (retrato), onde o `cover`
   * mostra só uma faixa do quadro 16:9. É o ponto do frame que fica no centro do canvas;
   * entre capítulos o valor é interpolado.
   */
  readonly focalX: number;
  /** Frame usado como imagem estática (prefers-reduced-motion e fallback). */
  readonly still: number;
  readonly stillAlt: string;
  /** Texto do CTA (só no último capítulo). */
  readonly cta?: string;
}

export const chapters: readonly Chapter[] = [
  {
    id: 'revelacao',
    title: 'Sua marca merece sair do comum.',
    body: 'Criamos produtos personalizados que transformam ideias em algo único.',
    start: 0,
    end: 58,
    tone: 'coral',
    focalX: 0.55,
    still: 52,
    stillAlt: 'Agenda personalizada com capa branca e arte em tons de azul, sobre uma mesa clara.',
  },
  {
    id: 'identidade',
    title: 'Cada detalhe carrega a sua identidade.',
    body: 'Agendas, cadernos e materiais feitos para representar sua empresa.',
    start: 60,
    end: 125,
    tone: 'olive',
    focalX: 0.55,
    still: 100,
    stillAlt: 'Agenda aberta com páginas personalizadas e a logo da empresa cliente no miolo.',
  },
  {
    id: 'forma',
    title: 'Criatividade que ganha forma.',
    body: 'Design, funcionalidade e personalidade em cada criação.',
    start: 127,
    end: 178,
    tone: 'mint',
    focalX: 0.58,
    still: 160,
    stillAlt: 'Porta-canetas, suporte de celular e organizador de mesa em impressão 3D ao lado da agenda.',
  },
  {
    id: 'convite',
    title: 'Sua ideia. Nossa criatividade.',
    body: 'Produtos personalizados para valorizar a sua marca.',
    start: 180,
    end: 240,
    tone: 'sun',
    focalX: 0.5,
    still: 240,
    stillAlt: 'Kit completo: agenda personalizada e acessórios de mesa em impressão 3D.',
    cta: 'Quero personalizar meus produtos',
  },
];
