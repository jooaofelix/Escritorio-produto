import React from 'react';
import {C, EASE, IMG, REST} from '../config';
import {Key, mix, mixRect, p, Rect} from '../lib/anim';
import {Browser, Cursor, Pic, SiteHeader} from '../components/Browser';
import {T} from '../components/Text';
import {VITRINE_HERO, VITRINE_SCROLL, VITRINE_STRIP} from './Vitrine';

const CHIPS = [
  {s: 'Todos', x: 79, w: 54, tx: 92, tw: 30.8},
  {s: 'Agendas', x: 155, w: 65, tx: 168, tw: 43.2},
  {s: 'Impressão 3D', x: 257, w: 88, tx: 270, tw: 70.3},
  {s: 'Brindes', x: 404, w: 60, tx: 417, tw: 38.7},
];
const COLS = [77, 319, 561];
const ROW2 = 595;
const CARDS = [
  {src: IMG.caderno, nome: 'Agendas personalizadas', nw: 144.3, y: 413},
  {src: IMG.kit, nome: 'Acessórios 3D', nw: 86.3, y: 413},
  {src: IMG.agenda, nome: 'Papelaria corporativa', nw: 129.7, y: 413},
  // segunda linha (revelada pela rolagem): produtos do catálogo real da Coloridamente
  {src: IMG.pautado, nome: 'Caderno pautado personalizado', y: ROW2},
  {src: IMG.liso, nome: 'Caderno liso personalizado', y: ROW2},
  {src: IMG.agenda, nome: 'Agenda 2027', y: ROW2},
].map((c, i) => ({...c, x: COLS[i % 3]}));

/** De onde vem cada foto na transição a partir da vitrine (já rolada). */
const FROM: Rect[] = [
  {...VITRINE_HERO, y: VITRINE_HERO.y - VITRINE_SCROLL},
  ...VITRINE_STRIP.map((s) => ({x: s.x, y: s.y - VITRINE_SCROLL, w: s.w, h: s.h})),
];

/** Interação simulada com as categorias: cliques em Agendas, Impressão 3D e Todos. */
const CLICKS = [
  {t: 1.4, chip: 1},
  {t: 1.88, chip: 2},
  {t: 2.32, chip: 0},
];
const chipCenter = (i: number) => ({x: CHIPS[i].x + CHIPS[i].w / 2 + 3, y: 381});
// produtos realçados por cada filtro (índices dos cards da 1ª linha)
const FILTRO: Record<number, number[]> = {0: [0, 1, 2], 1: [0], 2: [1]};

/** Conceito 02 — página 4 do PDF. */
export const Catalogo: React.FC<{t: number; chrome?: boolean}> = ({t, chrome = true}) => {
  const scroll = mix(0, 120, p(t, 2.5, 3.2, EASE.inOut));
  const active = t < CLICKS[0].t ? 0 : t < CLICKS[1].t ? 1 : t < CLICKS[2].t ? 2 : 0;
  // cursor
  const path = [
    {t: 0.95, x: 470, y: 470},
    {t: 1.35, ...chipCenter(1)},
    {t: 1.82, ...chipCenter(2)},
    {t: 2.26, ...chipCenter(0)},
  ];
  let cx = path[0].x, cy = path[0].y;
  for (let i = 1; i < path.length; i++) {
    const k = p(t, path[i - 1].t + (i === 1 ? 0 : 0.08), path[i].t, EASE.inOut);
    if (t >= path[i - 1].t) {
      cx = mix(path[i - 1].x, path[i].x, k);
      cy = mix(path[i - 1].y, path[i].y, k);
    }
  }
  const click = CLICKS.reduce((acc, c) => (t >= c.t && t < c.t + 0.4 ? (t - c.t) / 0.4 : acc), 0);
  const cursorOn = p(t, 0.9, 1.1) * (1 - p(t, 2.45, 2.7));
  const dimFor = (i: number) => {
    if (i > 2) return 1;
    const lit = FILTRO[active].includes(i);
    const since = Math.min(...CLICKS.filter((c) => t >= c.t).map((c) => t - c.t), 9);
    const k = Math.min(1, since / 0.2);
    const prevActive = CLICKS.filter((c) => t >= c.t).length >= 2 ? CLICKS[CLICKS.filter((c) => t >= c.t).length - 2].chip : 0;
    const was = FILTRO[prevActive].includes(i) ? 1 : 0.3;
    return mix(was, lit ? 1 : 0.3, k);
  };
  return (
    <Browser chrome={chrome} pageBg={C.paper} bgOpacity={p(t, 0, 0.45)} scroll={scroll} thumb={p(t, 2.4, 2.6) * (1 - p(t, 3.4, 3.7))} header={<SiteHeader band={C.paper} />}>
      {[0, 1].map((i) => {
        const k = p(t, 0.28 + i * 0.1, 0.95 + i * 0.1);
        return (
          <div key={i} style={{position: 'absolute', left: 78, top: [282.5, 319.5][i] - 4, width: 380, height: 42, overflow: 'hidden'}}>
            <T x={0} y={4 + (1 - k) * 44} h={33} w={[349.1, 305.5][i]} weight={900} color={C.ink}>{['Encontre algo especial', 'para a sua empresa.'][i]}</T>
          </div>
        );
      })}
      {CHIPS.map((c, i) => {
        const k = p(t, 0.5 + i * 0.07, 0.9 + i * 0.07, EASE.back);
        const on = i === active ? 1 : 0;
        const kk = Math.min(1, Math.max(0, (t - Math.max(...CLICKS.filter((x) => t >= x.t).map((x) => x.t), 0)) / 0.15));
        const lit = i === active ? (active === 0 && t < CLICKS[0].t ? 1 : kk) : 0;
        return (
          <div key={i} style={{position: 'absolute', left: c.x, top: 367, width: c.w, height: 25, opacity: Math.min(1, k * 1.5), transform: `scale(${0.6 + 0.4 * k})`}}>
            <div style={{position: 'absolute', inset: 0, borderRadius: 12.5, background: C.white, boxShadow: 'inset 0 0 0 0.8px #DDDCD6'}} />
            <div style={{position: 'absolute', inset: 0, borderRadius: 12.5, background: C.ink, opacity: lit}} />
            <T x={c.tx - c.x} y={7.8} h={10} w={c.tw} weight={700} color={on && lit > 0.5 ? C.white : C.ink}>{c.s}</T>
          </div>
        );
      })}
      {CARDS.map((c, i) => {
        const k = i < 3 ? p(t, 0.3 + i * 0.08, 0.85 + i * 0.08) : 1;
        const dim = dimFor(i);
        const target: Rect = {x: c.x + 8, y: c.y + 6, w: 214, h: 104};
        const m = i < 4 ? p(t, 0.05 + i * 0.07, 0.8 + i * 0.07, EASE.cine) : 1;
        const r = i < 4 && m < 1 ? mixRect(FROM[i], target, m) : target;
        return (
          <React.Fragment key={i}>
            <div style={{position: 'absolute', left: c.x, top: c.y, width: 230, height: 169, opacity: k * dim, transform: `scale(${0.94 + 0.06 * k})`}}>
              <div style={{position: 'absolute', inset: 0, borderRadius: 8, background: C.white}} />
              <T x={12} y={120.9} h={12} w={c.nw} weight={700} color={C.ink}>{c.nome}</T>
              <T x={12} y={143.8} h={10} w={64.9} color={C.soft}>Sob consulta</T>
            </div>
            <Pic src={c.src} {...r} r={mix(6, 4, m)} style={{opacity: Math.max(0.3, dim)}} />
          </React.Fragment>
        );
      })}
      <Cursor x={cx} y={cy} opacity={cursorOn} click={click} />
    </Browser>
  );
};

export const catalogoCamera: Key[] = [
  {t: 0, ...REST},
  {t: 0.25, ...REST},
  {t: 1.05, s: 2.3, px: 300, py: 410, qx: 960, qy: 560, e: EASE.inOut},
  {t: 2.25, s: 2.25, px: 330, py: 430, qx: 960, qy: 560, e: EASE.inOut},
  {t: 2.75, ...REST, e: EASE.cine},
];
