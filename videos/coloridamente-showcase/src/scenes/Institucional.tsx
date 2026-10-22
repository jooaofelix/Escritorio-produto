import React from 'react';
import {C, EASE, IMG, REST} from '../config';
import {Key, mix, p} from '../lib/anim';
import {Browser, Cursor, Pic, Pill, SiteHeader} from '../components/Browser';
import {T} from '../components/Text';

const TITLE = [
  {y: 339.9, w: 307, s: 'Uma marca forte'},
  {y: 382.9, w: 252.2, s: 'também se vê'},
  {y: 425.9, w: 239.5, s: 'nos detalhes.'},
];
const CATS = [
  {s: 'PAPELARIA', x: 476, w: 54.6},
  {s: '/', x: 540.4, w: 4.2},
  {s: 'CORPORATIVO', x: 554.3, w: 73.5},
  {s: '/', x: 637.6, w: 4.2},
  {s: 'IMPRESSÃO 3D', x: 651.5, w: 74.2},
];
const CTA = {x: 86, y: 549, w: 166, h: 35};
const HOVER = 1.85; // cursor chega ao botão
const CLICK = 2.15;

/** Giro discreto de perspectiva na entrada (aplicado à câmera). */
export const institucionalTilt = (t: number) => {
  const k = p(t, 0, 0.45, EASE.out) * (1 - p(t, 0.45, 1.55, EASE.inOut));
  return {ry: -13 * k, rx: 5 * k};
};

/** Conceito 04 — página 6 do PDF. */
export const Institucional: React.FC<{t: number; chrome?: boolean}> = ({t, chrome = true}) => {
  const wipe = p(t, 0, 0.55, EASE.cine);
  const scroll = mix(-38, 0, p(t, 0.5, 1.45, EASE.inOut)); // rolagem curta até a posição final
  const chip = p(t, 0.55, 0.95);
  const para = p(t, 1.0, 1.45);
  const img = p(t, 0.75, 1.65);
  const line = p(t, 1.05, 1.6, EASE.inOut);
  const cta = p(t, 1.15, 1.6, EASE.back);
  const hover = p(t, HOVER - 0.05, HOVER + 0.2) * (1 - p(t, 2.9, 3.2));
  const press = t >= CLICK && t < CLICK + 0.35 ? Math.sin(((t - CLICK) / 0.35) * Math.PI) : 0;
  const cur = {x: mix(330, CTA.x + 104, p(t, 1.35, HOVER, EASE.inOut)), y: mix(470, CTA.y + 21, p(t, 1.35, HOVER, EASE.inOut))};
  return (
    <Browser chrome={chrome} pageBg={C.instBg} clip={`inset(${(1 - wipe) * 100}% 0 0 0)`} scroll={scroll} thumb={p(t, 0.5, 0.7) * (1 - p(t, 1.7, 2.0))}
      header={<SiteHeader dark band={C.instBg} />}>
      <div style={{position: 'absolute', left: 86, top: 289, width: 264, height: 26, clipPath: `inset(0 ${(1 - chip) * 100}% 0 0 round 13px)`}}>
        <div style={{position: 'absolute', inset: 0, borderRadius: 13, background: 'rgba(255,255,255,.1)'}} />
        <T x={14} y={8.2} h={9} w={235.3} weight={700} color={C.white}>PRODUTOS PERSONALIZADOS PARA EMPRESAS</T>
      </div>
      {TITLE.map((l, i) => {
        const k = p(t, 0.65 + i * 0.1, 1.35 + i * 0.1);
        return (
          <div key={i} style={{position: 'absolute', left: 86, top: l.y - 4, width: 340, height: 48, overflow: 'hidden'}}>
            <T x={0} y={4 + (1 - k) * 50} h={39} w={l.w} weight={900} color={C.white}>{l.s}</T>
          </div>
        );
      })}
      <div style={{opacity: para, transform: `translateY(${(1 - para) * 8}px)`}}>
        <T x={86} y={482.9} h={12} w={368.6} color="#E1E9E1">Soluções de papelaria e impressão 3D desenvolvidas para dar</T>
        <T x={86} y={500.9} h={12} w={202.4} color="#E1E9E1">vida à identidade da sua empresa.</T>
      </div>
      <div style={{position: 'absolute', left: CTA.x - 8, top: CTA.y - 8, width: CTA.w + 16, height: CTA.h + 16, borderRadius: 26, border: '1.2px solid rgba(249,200,72,.55)', opacity: hover * (1 - press * 0.5), transform: `scale(${0.92 + 0.08 * hover})`}} />
      <Pill {...CTA} bg={hover > 0.5 ? C.sun : C.sunSoft} label="Solicitar proposta" lx={107} ly={558.8} lh={11} lw={99.8} color={C.ink} arrow="upright" ax={218 + 2 * hover}
        style={{opacity: Math.min(1, cta * 1.5), transform: `scale(${(0.7 + 0.3 * cta) * (1 + 0.05 * hover - 0.04 * press)})`, transformOrigin: 'left center'}} />
      <Pic src={IMG.agenda} x={471} y={301} w={301} h={246} r={6} scale={mix(1.08, 1, img)} style={{opacity: img}} />
      <div style={{position: 'absolute', left: 471, top: 560, width: 301, height: 0.8, background: 'rgba(255,255,255,.25)', transformOrigin: 'left', transform: `scaleX(${line})`}} />
      {CATS.map((c, i) => {
        const k = p(t, 1.2 + i * 0.05, 1.55 + i * 0.05);
        return <T key={i} x={c.x} y={569.7} h={9} w={c.w} weight={700} color={C.white} style={{opacity: k}}>{c.s}</T>;
      })}
      <Cursor x={cur.x} y={cur.y} opacity={p(t, 1.3, 1.5) * (1 - p(t, 2.55, 2.8))} click={t >= CLICK && t < CLICK + 0.4 ? (t - CLICK) / 0.4 : 0} />
    </Browser>
  );
};

export const institucionalCamera: Key[] = [
  {t: 0, ...REST},
  {t: 1.2, ...REST},
  {t: 1.85, s: 2.45, px: 169, py: 566, qx: 320, qy: 925, e: EASE.inOut},
  {t: 2.35, s: 2.5, px: 169, py: 566, qx: 320, qy: 930, e: EASE.inOut},
  {t: 3.0, ...REST, e: EASE.inOut},
];
