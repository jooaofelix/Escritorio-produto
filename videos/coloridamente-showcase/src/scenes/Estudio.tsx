import React from 'react';
import {C, EASE, IMG, REST, VIEW} from '../config';
import {Key, mix, p} from '../lib/anim';
import {Browser, Pic, Pill, SiteHeader} from '../components/Browser';
import {Arrow, T} from '../components/Text';

const TITLE = [
  {y: 314.7, w: 242.6, s: 'Ideias com', dx: -70, dy: 0, rot: -7},
  {y: 369.7, w: 233.4, s: 'cor, forma', dx: 70, dy: 0, rot: 6},
  {y: 424.7, w: 272.4, s: 'e propósito.', dx: 0, dy: 46, rot: -4},
];
const CORAL = {cx: 95, cy: 532, r: 83};
const SUN = {cx: 699, cy: 268, r: 105};

/** Conceito 03 — página 5 do PDF. */
export const Estudio: React.FC<{t: number; chrome?: boolean}> = ({t, chrome = true}) => {
  // entrada: as formas pastéis surgem e a página verde se abre a partir do círculo coral
  const coral = p(t, 0, 0.5, EASE.back);
  const sun = p(t, 0.1, 0.65, EASE.back);
  const reveal = p(t, 0.15, 0.9, EASE.cine);
  const exit = 1 - p(t, 4.5, 4.95, EASE.in); // formas recolhem quando entra o institucional
  // paralaxe durante o passeio de câmera
  const drift = p(t, 0.9, 1.9, EASE.inOut) - p(t, 1.9, 2.6, EASE.inOut); // vai e volta: termina na posição do PDF
  const card = p(t, 0.85, 1.6, EASE.back);
  const img = p(t, 0.95, 2.7, EASE.out);
  const chip = p(t, 1.45, 2.0, EASE.back);
  const cta = p(t, 1.25, 1.75, EASE.back);
  const sub = p(t, 1.15, 1.6);
  const r = mix(0, 900, reveal);
  const deco = (
    <>
      {/* as formas transbordam a moldura, como no PDF */}
      <div style={{position: 'absolute', left: CORAL.cx - CORAL.r, top: CORAL.cy - CORAL.r, width: CORAL.r * 2, height: CORAL.r * 2, borderRadius: '50%', background: C.studioCoral,
        transform: `translate(${mix(0, 8, drift)}px, ${mix(0, -6, drift)}px) scale(${coral * exit})`}} />
      <div style={{position: 'absolute', left: SUN.cx - SUN.r, top: SUN.cy - SUN.r, width: SUN.r * 2, height: SUN.r * 2, borderRadius: '50%', background: C.studioSun,
        transform: `translate(${mix(0, -10, drift)}px, ${(1 - sun) * -180 + mix(0, 8, drift)}px) scale(${exit})`, opacity: Math.min(1, sun * 2)}} />
    </>
  );
  return (
    <Browser chrome={chrome} pageBg={C.studioBg} clip={`circle(${r}px at ${CORAL.cx - VIEW.x}px ${CORAL.cy - VIEW.y}px)`} deco={deco} header={<SiteHeader divider={false} />}>
      {TITLE.map((l, i) => {
        const k = p(t, 0.5 + i * 0.13, 1.25 + i * 0.13, EASE.back);
        return (
          <T key={i} x={87} y={l.y} h={49} w={l.w} weight={900} color={C.ink}
            style={{opacity: Math.min(1, k * 1.6), transform: `translate(${(1 - k) * l.dx}px, ${(1 - k) * l.dy}px) rotate(${(1 - k) * l.rot}deg)`, transformOrigin: 'left center'}}>
            {l.s}
          </T>
        );
      })}
      <T x={87} y={490} h={13} w={183} color={C.soft} style={{opacity: sub, transform: `translateY(${(1 - sub) * 8}px)`}}>A gente cria. Você faz parte.</T>
      <Pill x={87} y={532} w={177} h={41} bg={C.coralBtn} label="Vamos criar juntos" lx={107} ly={544.9} lh={12} lw={110} color={C.ink} arrow="right" ax={226}
        style={{opacity: Math.min(1, cta * 1.5), transform: `scale(${0.7 + 0.3 * cta})`, transformOrigin: 'left center'}} />
      <div style={{position: 'absolute', left: 408, top: 288, width: 374, height: 282, opacity: Math.min(1, card * 1.5),
        transform: `translate(${mix(0, -6, drift)}px, ${(1 - card) * 60 + mix(0, -10, drift)}px) scale(${0.9 + 0.1 * card})`}}>
        <div style={{position: 'absolute', inset: 0, borderRadius: 18, background: '#FBFAF6'}} />
        <Pic src={IMG.kit} x={24} y={22} w={314} h={251} r={8} scale={mix(1.14, 1, img)} dy={mix(0, -12, drift)} />
      </div>
      <div style={{position: 'absolute', left: 535, top: 517, width: 194, height: 35, opacity: Math.min(1, chip * 1.5),
        transform: `translate(${(1 - chip) * 90 + mix(0, -14, drift)}px, ${mix(0, -16, drift)}px)`}}>
        <div style={{position: 'absolute', inset: 0, borderRadius: 18, background: C.sunSoft}} />
        <T x={18} y={11.8} h={11} w={98} weight={700} color={C.ink}>feito do seu jeito</T>
        <Arrow dir="upright" x={123} y={13} size={9} color={C.ink} />
      </div>
    </Browser>
  );
};

export const estudioCamera: Key[] = [
  {t: 0, ...REST},
  {t: 0.15, ...REST},
  {t: 0.95, s: 2.35, px: 355, py: 410, qx: 700, qy: 540, e: EASE.inOut},
  {t: 1.95, s: 2.2, px: 385, py: 420, qx: 700, qy: 540, e: EASE.inOut},
  {t: 2.6, ...REST, e: EASE.inOut},
];
