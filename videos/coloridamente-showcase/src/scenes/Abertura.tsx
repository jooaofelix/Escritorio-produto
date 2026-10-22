import React from 'react';
import {C, EASE, FONT} from '../config';
import {mix, p} from '../lib/anim';
import {LOGO_PATHS, LOGO_VIEWBOX} from '../logoPaths';

/** Logo oficial montado peça por peça (da esquerda para a direita). */
export const Logo: React.FC<{t: number; t0: number; spread?: number; dur?: number; width: number; style?: React.CSSProperties}> = ({t, t0, spread = 0.45, dur = 0.32, width, style}) => {
  const [, , vw, vh] = LOGO_VIEWBOX.split(' ').map(Number);
  return (
    <svg viewBox={LOGO_VIEWBOX} style={{width, height: (width * vh) / vw, overflow: 'visible', ...style}}>
      {LOGO_PATHS.map((s, i) => {
        const a = t0 + s.o * spread;
        const k = p(t, a, a + dur, EASE.back);
        return <path key={i} d={s.d} fill={s.fill} style={{transformBox: 'fill-box', transformOrigin: 'center', transform: `scale(${k})`, opacity: Math.min(1, k * 2)}} />;
      })}
    </svg>
  );
};

/** Formas da paleta do logo: entram de direções diferentes e depois se expandem para revelar a 1ª proposta. */
const FORMAS = [
  {cor: C.coral, w: 156, h: 156, r: 78, x: 540, y: 380, fx: -260, fy: 470, rot: 0, ordem: 2},
  {cor: C.sun, w: 240, h: 76, r: 38, x: 1395, y: 330, fx: 1395, fy: -160, rot: -14, ordem: 1},
  {cor: C.mint, w: 112, h: 112, r: 56, x: 1430, y: 730, fx: 2160, fy: 760, rot: 0, ordem: 4},
  {cor: C.olive, w: 110, h: 110, r: 28, x: 530, y: 740, fx: 470, fy: 1300, rot: 18, ordem: 3},
  {cor: C.blush, w: 60, h: 60, r: 30, x: 1190, y: 220, fx: 1720, fy: -120, rot: 0, ordem: 0},
];

export const Abertura: React.FC<{t: number}> = ({t}) => {
  const sai = p(t, 1.6, 1.8, EASE.in);
  return (
    <div style={{position: 'absolute', inset: 0, background: C.paper}}>
      {FORMAS.map((f, i) => {
        const k = p(t, i * 0.05, 0.75 + i * 0.05, EASE.out);
        const grow = p(t, 1.62 + f.ordem * 0.04, 2.05 + f.ordem * 0.04, EASE.inOut);
        const x = mix(f.fx, f.x, k) + Math.sin(t * 2.2 + i) * 4;
        const y = mix(f.fy, f.y, k) + Math.cos(t * 1.8 + i) * 4;
        return (
          <div key={i} style={{position: 'absolute', left: x - f.w / 2, top: y - f.h / 2, width: f.w, height: f.h, borderRadius: f.r, background: f.cor,
            transform: `rotate(${f.rot * k}deg) scale(${1 + grow * (2600 / Math.min(f.w, f.h))})`}} />
        );
      })}
      <div style={{position: 'absolute', left: 0, right: 0, top: 318, display: 'flex', justifyContent: 'center', opacity: 1 - sai, transform: `scale(${1 - 0.06 * sai})`}}>
        <Logo t={t} t0={0.22} spread={0.36} dur={0.3} width={700} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 652, height: 40, overflow: 'hidden', textAlign: 'center', opacity: 1 - sai}}>
        <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 28, lineHeight: '40px', letterSpacing: '0.3em', paddingLeft: '0.3em', color: C.soft, transform: `translateY(${(1 - p(t, 0.55, 0.9)) * 40}px)`}}>
          5 POSSIBILIDADES. UMA IDENTIDADE.
        </div>
      </div>
    </div>
  );
};
