/**
 * Capítulos da sequência cinematográfica do hero (vídeo vertical 9:16, 164 frames a 12 fps).
 *
 * `start`/`end` são frames do vídeo (0..163, ver src/data/scroll-manifest.json) e prendem as
 * entradas/saídas dos textos aos momentos da animação: cada texto entra depois de uma transição
 * entre cenas (52–61 e 103–112) e sai antes da seguinte. A copy é literal do briefing.
 */
export interface Chapter {
  readonly id: string;
  readonly title: string;
  /** Texto de apoio (o capítulo final não tem: logo + título + CTA). */
  readonly body?: string;
  /** Primeiro frame do vídeo em que o capítulo está em cena (inclusivo). */
  readonly start: number;
  /** Último frame do vídeo em que o capítulo está em cena (inclusivo). */
  readonly end: number;
  /** Frame usado como imagem estática (prefers-reduced-motion e fallback); ver `stills.frames`. */
  readonly still: number;
  readonly stillAlt: string;
  /** Mostra a logo oficial acima do título (capítulo final). */
  readonly logo?: boolean;
  /** Texto do CTA (só no último capítulo). */
  readonly cta?: string;
}

/** Descrição do filme para leitores de tela (rótulo do `role="img"` do canvas). */
export const sequenceLabel =
  'Um caderno de espiral com capa personalizada se aproxima e se abre; depois, um bloco de mesa com argolas tem as folhas erguidas; por fim, acessórios de mesa pretos (porta-canetas, suporte de celular, organizador para óculos e caneta e porta-clipes) aparecem do close ao conjunto.';

export const chapters: readonly Chapter[] = [
  {
    id: 'papelaria',
    title: 'Cada detalhe carrega a sua identidade.',
    body: 'Agendas, cadernos e materiais feitos para representar sua empresa.',
    // Sai por completo no frame 51, antes da transição para o bloco (52–61).
    start: 0,
    end: 49,
    still: 43,
    stillAlt: 'Caderno de espiral com capa branca e ondas em tons de azul se abrindo sobre as folhas pautadas.',
  },
  {
    id: 'bloco-de-mesa',
    title: 'Sua marca presente no dia a dia.',
    body: 'Blocos de mesa personalizados com a identidade da sua empresa.',
    // Entra com o bloco já inteiro em cena (fim da transição no 61) e sai antes da próxima (103).
    start: 64,
    end: 100,
    still: 92,
    stillAlt: 'Bloco de mesa com argolas aberto, com a capa de ondas azuis erguida e as folhas pautadas subindo.',
  },
  {
    id: 'acessorios',
    title: 'Organização também é design.',
    body: 'Porta-canetas, suporte de celular, organizador para óculos e caneta e porta-clipes.',
    start: 115,
    end: 144,
    still: 122,
    stillAlt:
      'Porta-canetas, suporte de celular com um telefone, organizador com óculos e caneta e porta-clipes, todos pretos e canelados, em close.',
  },
  {
    id: 'encerramento',
    title: 'Sua ideia ganha forma aqui.',
    // Entra quando a câmera já abriu o conjunto; fica até o fim do pin (frame 163 parado).
    start: 150,
    end: 163,
    still: 163,
    stillAlt:
      'Coleção de acessórios de mesa pretos lado a lado: porta-canetas, suporte de celular com um telefone, organizador com óculos e caneta e porta-clipes.',
    logo: true,
    cta: 'Quero personalizar meus produtos',
  },
];
