/**
 * Capítulos da sequência cinematográfica do hero.
 *
 * `start`/`end` são frames do vídeo-fonte (0..240, 24 fps) e prendem as entradas/saídas
 * dos textos aos momentos da animação. A copy é literal do briefing.
 */
export interface Chapter {
  readonly id: string;
  readonly title: string;
  readonly body: string;
  /** Primeiro frame do vídeo em que o capítulo está em cena (inclusivo). */
  readonly start: number;
  /** Último frame do vídeo em que o capítulo está em cena (inclusivo). */
  readonly end: number;
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

/** Descrição do filme para leitores de tela (docs/design-system.md §6). */
export const sequenceLabel =
  'Caderno de espiral com capa personalizada se abre e dá lugar a uma agenda e a objetos de mesa pretos.';

export const chapters: readonly Chapter[] = [
  {
    id: 'revelacao',
    title: 'Sua marca merece sair do comum.',
    body: 'Criamos produtos personalizados que transformam ideias em algo único.',
    start: 0,
    end: 58,
    focalX: 0.55,
    still: 52,
    stillAlt: 'Caderno de espiral fechado com capa branca e ondas em tons de azul.',
  },
  {
    id: 'identidade',
    title: 'Cada detalhe carrega a sua identidade.',
    body: 'Agendas, cadernos e materiais feitos para representar sua empresa.',
    start: 60,
    end: 125,
    focalX: 0.55,
    still: 100,
    stillAlt: 'Agenda de espiral aberta com páginas de horários e a marca AEA, com uma folha sendo virada.',
  },
  {
    id: 'forma',
    title: 'Criatividade que ganha forma.',
    body: 'Design, funcionalidade e personalidade em cada criação.',
    start: 127,
    end: 178,
    focalX: 0.58,
    still: 160,
    stillAlt: 'Porta-canetas canelado com duas canetas, suporte de celular e bandeja pretos ao lado de um caderno aberto.',
  },
  {
    id: 'convite',
    title: 'Sua ideia. Nossa criatividade.',
    body: 'Produtos personalizados para valorizar a sua marca.',
    // Entra só quando a câmera abre a composição (antes disso a agenda ocupa o topo do quadro);
    // o intervalo 179–205 fica sem texto, como respiro entre os capítulos 3 e 4.
    start: 206,
    end: 240,
    focalX: 0.5,
    still: 240,
    stillAlt: 'Agenda aberta com a marca AEA ao lado de porta-canetas, suporte de celular, organizador e bandeja pretos.',
    cta: 'Quero personalizar meus produtos',
  },
];
