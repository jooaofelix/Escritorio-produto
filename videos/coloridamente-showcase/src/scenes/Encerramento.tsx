import React from 'react';
import {C, CONCEITOS, EASE, FONT, REST} from '../config';
import {mix, p} from '../lib/anim';
import {Logo} from './Abertura';
import {Vitrine} from './Vitrine';
import {Catalogo} from './Catalogo';
import {Estudio} from './Estudio';
import {Institucional} from './Institucional';
import {Cinema} from './Cinema';

const PAGINAS = [Vitrine, Catalogo, Estudio, Institucional, Cinema];
const FINAL_T = 4.2; // estado final de cada proposta
const FW = 768, FH = 441; // moldura + sombra, em pt

type R = {x: number; y: number; w: number; rot?: number};
const MOSAICO: R[] = [
  {x: 80, y: 196, w: 560}, {x: 680, y: 196, w: 560}, {x: 1280, y: 196, w: 560},
  {x: 380, y: 562, w: 560}, {x: 980, y: 562, w: 560},
];
const LINHA: R[] = [0, 1, 2, 3, 4].map((i) => ({x: 114 + i * 344, y: 172, w: 316}));
const ORIGEM: R[] = [
  {x: -760, y: 120, w: 560, rot: -7}, {x: 680, y: -520, w: 560, rot: 5}, {x: 2120, y: 160, w: 560, rot: 7},
  {x: 260, y: 1220, w: 560, rot: -5},
  {x: REST.qx + REST.s * (55 - REST.px), y: REST.qy + REST.s * (174 - REST.py), w: FW * REST.s, rot: 0}, // a cena 06 continua daqui
];

const Tela: React.FC<{i: number; r: R}> = ({i, r}) => {
  const Page = PAGINAS[i];
  const k = r.w / FW;
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: 1200, height: 675, transformOrigin: '0 0',
      transform: `translate(${r.x - 55 * k}px, ${r.y - 174 * k}px) scale(${k}) rotate(${r.rot ?? 0}deg)`}}>
      <Page t={FINAL_T} />
    </div>
  );
};

export const Encerramento: React.FC<{t: number}> = ({t}) => {
  const drift = p(t, 0.55, 1.6, EASE.inOut) * (1 - p(t, 1.45, 2.1, EASE.inOut));
  const lerp = (a: R, b: R, k: number): R => ({x: mix(a.x, b.x, k), y: mix(a.y, b.y, k), w: mix(a.w, b.w, k), rot: mix(a.rot ?? 0, b.rot ?? 0, k)});
  return (
    <div style={{position: 'absolute', inset: 0, background: C.paper, fontFamily: FONT}}>
      <div style={{position: 'absolute', inset: 0, transformOrigin: '960px 520px', transform: `scale(${1 + 0.035 * drift}) translate(${-8 * drift}px, ${-4 * drift}px)`}}>
        {[0, 1, 2, 3, 4].map((i) => {
          const a = p(t, i === 4 ? 0 : 0.04 + i * 0.06, (i === 4 ? 0.7 : 0.74 + i * 0.06), EASE.cine);
          const b = p(t, 1.45 + i * 0.04, 2.1 + i * 0.04, EASE.cine);
          const r = lerp(lerp(ORIGEM[i], MOSAICO[i], a), LINHA[i], b);
          return <Tela key={i} i={i} r={r} />;
        })}
      </div>
      {CONCEITOS.map((c, i) => {
        const e = p(t, 2.05 + i * 0.05, 2.45 + i * 0.05);
        const l = LINHA[i];
        return (
          <div key={i} style={{position: 'absolute', left: l.x, top: l.y + FH * (l.w / FW) + 18, opacity: e, transform: `translateY(${(1 - e) * 8}px)`, display: 'flex', alignItems: 'center', gap: 10}}>
            <div style={{width: 18, height: 5, borderRadius: 3, background: c.cor}} />
            <div style={{fontWeight: 700, fontSize: 17, letterSpacing: '0.04em', color: C.ink}}>{`${c.n}  ${c.nome}`}</div>
          </div>
        );
      })}
      {['QUAL DIREÇÃO COMBINA MAIS', 'COM A COLORIDAMENTE?'].map((s, i) => {
        const e = p(t, 1.9 + i * 0.1, 2.55 + i * 0.1);
        return (
          <div key={i} style={{position: 'absolute', left: 0, right: 0, top: 462 + i * 74, height: 80, overflow: 'hidden', textAlign: 'center'}}>
            <div style={{fontWeight: 900, fontSize: 64, lineHeight: '80px', letterSpacing: '0.01em', color: C.ink, transform: `translateY(${(1 - e) * 80}px)`}}>{s}</div>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 0, right: 0, top: 648, textAlign: 'center', fontWeight: 400, fontSize: 32, color: C.soft, opacity: p(t, 2.25, 2.65), transform: `translateY(${(1 - p(t, 2.25, 2.65)) * 10}px)`}}>
        5 propostas. Muitas possibilidades.
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 752, display: 'flex', justifyContent: 'center'}}>
        <Logo t={t} t0={2.1} spread={0.32} dur={0.25} width={340} />
      </div>
    </div>
  );
};
