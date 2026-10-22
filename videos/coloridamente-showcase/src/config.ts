import {Easing} from 'remotion';

export const VIDEO = {width: 1920, height: 1080, fps: 30, seconds: 28};
export const TOTAL_FRAMES = VIDEO.fps * VIDEO.seconds;

/** Início de cada cena em segundos (storyboard). */
export const SCENES = {
  abertura: 0,
  vitrine: 2,
  catalogo: 6.5,
  estudio: 11,
  institucional: 15.5,
  cinema: 20,
  encerramento: 24.5,
} as const;
export const SCENE_LEN = 4.5;

/** Cores extraídas do PDF e do logo. */
export const C = {
  paper: '#FAF9F5',
  ink: '#262924',
  soft: '#575B53',
  mute: '#7C8075',
  url: '#888C86',
  line: '#E4E4DD',
  shadow: '#E4E4DD',
  white: '#FFFFFF',
  coral: '#E98071',
  coralBtn: '#E89481',
  olive: '#A7B571',
  sun: '#F9C848',
  sunSoft: '#F4CF6E',
  mint: '#A8DEC9',
  blush: '#F6AAA7',
  studioBg: '#CDE8DA',
  studioSun: '#F5D676',
  studioCoral: '#F2B6AA',
  instBg: '#30443B',
  cineBg: '#202622',
  cineBox: '#252D29',
};

/** Cor de destaque de cada conceito (barras do slide 2 do PDF). */
export const CONCEITOS = [
  {n: '01', nome: 'Vitrine editorial', frase: 'Elegância em cada detalhe.', cor: C.coral},
  {n: '02', nome: 'Catálogo visual', frase: 'Produtos em primeiro lugar.', cor: C.olive},
  {n: '03', nome: 'Estúdio criativo', frase: 'Personalidade que se destaca.', cor: C.mint},
  {n: '04', nome: 'Institucional premium', frase: 'Confiança para fazer negócios.', cor: C.sun},
  {n: '05', nome: 'Scroll cinematográfico', frase: 'Uma experiência memorável.', cor: C.blush},
];

/** Barra de cor da marca (ordem fixa do design system). */
export const BARRA = [C.coral, C.olive, C.sun, C.mint, C.blush];

export const FONT = 'Lato, sans-serif';

export const EASE = {
  out: Easing.bezier(0.22, 1, 0.36, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  in: Easing.bezier(0.55, 0, 1, 0.45),
  back: Easing.bezier(0.34, 1.45, 0.64, 1),
  cine: Easing.bezier(0.77, 0, 0.18, 1),
};

/** Moldura do navegador nas coordenadas da página do PDF (pt). */
export const FRAME = {x: 55, y: 174, w: 758, h: 426, chrome: 32};
export const VIEW = {x: 55, y: 206, w: 758, h: 394};

/** Pose de câmera em repouso: maquete à esquerda, coluna de texto à direita. */
export const REST = {s: 1.615, px: 439, py: 394.5, qx: 710, qy: 540};
/** Interface em tela cheia (cena 06). */
export const FULL = {s: 2.5, px: 434, py: 403, qx: 960, qy: 540};
/** Painel da coluna de texto (mesma cor do fundo): entra pela direita e divide a tela. */
export const PANEL_X = 1350;

export const IMG = {
  caderno: 'img/caderno-espiral-capa.webp',
  kit: 'img/kit-mesa-impressao-3d.webp',
  agenda: 'img/agenda-2027.webp',
  pautado: 'img/caderno-aberto-pautado.webp',
  liso: 'img/caderno-aberto-liso.webp',
};
