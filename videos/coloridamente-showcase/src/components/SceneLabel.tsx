import React from 'react';
import {BARRA, C, CONCEITOS, EASE, FONT} from '../config';
import {p} from '../lib/anim';

/** Linhas da frase de apoio de cada conceito (quebra definida para a coluna da direita). */
const FRASES = [
  ['Elegância em', 'cada detalhe.'],
  ['Produtos em', 'primeiro lugar.'],
  ['Personalidade', 'que se destaca.'],
  ['Confiança para', 'fazer negócios.'],
  ['Uma experiência', 'memorável.'],
];

const X = 1392;

/** Coluna de texto da direita: número/nome do conceito, frase de apoio e barra de cor (progresso 1–5). */
export const SceneLabel: React.FC<{i: number; t: number; tin: number; tout: number}> = ({i, t, tin, tout}) => {
  const c = CONCEITOS[i];
  const out = 1 - p(t, tout, tout + 0.28, EASE.in);
  if (t < tin || out <= 0) return null;
  const dash = p(t, tin, tin + 0.45);
  const kick = p(t, tin, tin + 0.45);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: out, transform: `translateY(${(1 - out) * -14}px)`, fontFamily: FONT}}>
      <div style={{position: 'absolute', left: X, top: 438, width: 34, height: 6, borderRadius: 3, background: c.cor, transformOrigin: 'left', transform: `scaleX(${dash})`}} />
      <div style={{position: 'absolute', left: X + 50, top: 424, height: 34, overflow: 'hidden'}}>
        <div style={{fontWeight: 700, fontSize: 21, lineHeight: '34px', letterSpacing: '0.16em', color: C.soft, whiteSpace: 'nowrap', transform: `translateY(${(1 - kick) * 34}px)`}}>
          {`${c.n} / ${c.nome.toUpperCase()}`}
        </div>
      </div>
      {FRASES[i].map((l, k) => {
        const e = p(t, tin + 0.08 + k * 0.08, tin + 0.58 + k * 0.08);
        return (
          <div key={k} style={{position: 'absolute', left: X - 2, top: 476 + k * 62, height: 70, overflow: 'hidden'}}>
            <div style={{fontWeight: 900, fontSize: 56, lineHeight: '70px', color: C.ink, whiteSpace: 'nowrap', transform: `translateY(${(1 - e) * 70}px)`}}>{l}</div>
          </div>
        );
      })}
      {BARRA.map((cor, k) => {
        const on = CONCEITOS[i].cor === cor;
        const e = p(t, tin + 0.35 + k * 0.05, tin + 0.75 + k * 0.05);
        return (
          <div key={k} style={{position: 'absolute', left: X + k * 46, top: 640, width: 38, height: 7, borderRadius: 1, background: cor,
            opacity: (on ? 1 : 0.28) * e, transformOrigin: 'left', transform: `scaleX(${e})`}} />
        );
      })}
    </div>
  );
};

/** Rodapé das cenas, como no PDF. */
export const Rodape: React.FC<{i: number; vis: number}> = ({i, vis}) =>
  vis <= 0 ? null : (
    <div style={{position: 'absolute', inset: 0, opacity: vis, fontFamily: FONT, fontWeight: 700, fontSize: 15, letterSpacing: '0.14em', color: C.soft}}>
      <div style={{position: 'absolute', left: 90, top: 1004}}>COLORIDAMENTE  /  EXPLORAÇÃO DIGITAL</div>
      <div style={{position: 'absolute', right: 90, top: 1004}}>{`CONCEITO ${CONCEITOS[i].n}  /  05`}</div>
    </div>
  );
