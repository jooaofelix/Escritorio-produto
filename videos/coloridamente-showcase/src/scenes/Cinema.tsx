import React from 'react';
import {C, EASE, FULL, IMG, REST} from '../config';
import {Key, mix, p} from '../lib/anim';
import {Browser, Pic, SiteHeader} from '../components/Browser';
import {Arrow, T} from '../components/Text';

/** Etapas da rolagem: a cada uma o contador avança, a foto troca e uma camada de texto entra. */
const STEPS = [0.85, 1.35, 1.85, 2.35];
const FOTOS = [IMG.caderno, IMG.pautado, IMG.agenda, IMG.kit];
const TITLE = [
  {y: 367.8, w: 243.7, s: 'Quando a sua'},
  {y: 409.8, w: 225.7, s: 'marca ganha'},
  {y: 451.8, w: 116.1, s: 'forma.'},
];

/** Conceito 05 — página 7 do PDF (sequência de quadros simulada com fotos, máscaras e paralaxe). */
export const Cinema: React.FC<{t: number; chrome?: boolean}> = ({t, chrome = true}) => {
  const step = STEPS.filter((s) => t >= s).length - 1;
  const enter = p(t, 0.3, 0.95, EASE.out);
  const box = p(t, 0.45, 1.05, EASE.out);
  // profundidade: camadas andam em velocidades diferentes enquanto a página "rola"
  const sp = p(t, 0.85, 2.5, EASE.inOut) * (1 - p(t, 2.5, 2.95, EASE.inOut));
  const role = p(t, 0.6, 0.95) * (1 - p(t, 1.35, 1.6)) + p(t, 2.75, 3.1);
  return (
    <Browser chrome={chrome} pageBg={C.cineBg} bgOpacity={p(t, 0, 0.45)} header={<SiteHeader dark divider={false} band={C.cineBg} />}>
      <div style={{position: 'absolute', inset: 0, opacity: p(t, 0, 0.45)}}>
        {/* contador 01 / 04 que avança com a rolagem */}
        <div style={{position: 'absolute', left: 87, top: 290, width: 70, height: 22, overflow: 'hidden', transform: `translateY(${-40 * sp}px)`, opacity: enter}}>
          {FOTOS.map((_, i) => {
            const a = i === 0 ? 1 : p(t, STEPS[i], STEPS[i] + 0.3, EASE.out);
            const b = i < 3 ? p(t, STEPS[i + 1], STEPS[i + 1] + 0.3, EASE.out) : 0;
            return (
              <T key={i} x={0} y={4.9 + (1 - a) * 16 - b * 16} h={12} w={57.1} weight={700} color="#ABDAD0" style={{opacity: a * (1 - b)}}>
                {`0${i + 1} / 04`}
              </T>
            );
          })}
        </div>
        {/* cartão da foto */}
        <div style={{position: 'absolute', left: 313, top: 284, width: 390, height: 270, opacity: enter, transform: `translateY(${(1 - enter) * 30 - 14 * sp}px) scale(${0.94 + 0.06 * enter})`}}>
          <div style={{position: 'absolute', inset: 0, borderRadius: 18, background: '#E9E8E2'}} />
          {FOTOS.map((src, i) => {
            const w = i === 0 ? 1 : p(t, STEPS[i], STEPS[i] + 0.42, EASE.cine);
            const z = i === 0 ? mix(1.0, 1.06, p(t, 0.3, 1.6)) : mix(1.2, 1, p(t, STEPS[i], STEPS[i] + 1.1));
            return <Pic key={i} src={src} x={17} y={10} w={354} h={252} r={4} scale={z} dy={10 * sp} style={{clipPath: `inset(${(1 - w) * 100}% 0 0 0)`}} />;
          })}
        </div>
        {/* caixa de texto sobreposta, em outra profundidade */}
        <div style={{position: 'absolute', left: 83, top: 342, width: 320, height: 195, background: C.cineBox, opacity: box, transform: `translate(${(1 - box) * -40}px, ${-30 * sp}px)`}}>
          {TITLE.map((l, i) => {
            const k = p(t, STEPS[i] - 0.05, STEPS[i] + 0.55, EASE.out);
            return (
              <div key={i} style={{position: 'absolute', left: 2, top: l.y - 342 - 4, width: 300, height: 46, overflow: 'hidden'}}>
                <T x={0} y={4 + (1 - k) * 46} h={37} w={l.w} weight={900} color={C.white}>{l.s}</T>
              </div>
            );
          })}
          <div style={{opacity: p(t, STEPS[3], STEPS[3] + 0.45)}}>
            <T x={2} y={163.9} h={12} w={299} color="#D2DDD4">Uma experiência para descobrir cada detalhe</T>
            <T x={2} y={180.9} h={12} w={151.6} color="#D2DDD4">enquanto você navega.</T>
          </div>
        </div>
        <div style={{opacity: Math.min(1, role)}}>
          <T x={85} y={570.8} h={10} w={133} weight={700} color={C.white}>ROLE PARA EXPLORAR</T>
          <Arrow dir="down" x={225.5} y={571.5 + 2 * Math.sin(t * 7)} size={8.5} color={C.white} />
        </div>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{position: 'absolute', left: 595 + i * 37, top: 570.3, width: 30, height: 2.6, borderRadius: 1.3, background: '#5E625D', overflow: 'hidden', opacity: enter}}>
            <div style={{width: '100%', height: '100%', background: C.coralBtn, transformOrigin: 'left', transform: `scaleX(${i === 0 ? 1 : p(t, STEPS[i], STEPS[i] + 0.35)})`}} />
          </div>
        ))}
      </div>
    </Browser>
  );
};

export const cinemaCamera: Key[] = [
  {t: 0, ...REST},
  {t: 0.7, ...FULL, e: EASE.cine},
  {t: 0.85, ...FULL},
  {t: 2.45, s: 3.25, px: 470, py: 425, qx: 960, qy: 540, e: EASE.inOut},
  {t: 2.9, ...REST, e: EASE.cine},
];
