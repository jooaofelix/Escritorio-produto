import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C} from './config';
import {Vitrine} from './scenes/Vitrine';
import {Catalogo} from './scenes/Catalogo';
import {Estudio} from './scenes/Estudio';
import {Institucional} from './scenes/Institucional';
import {Cinema} from './scenes/Cinema';

/** Cada proposta no instante em que fica igual à página do PDF, para sobrepor ao PDF rasterizado (96 dpi). */
const ESTADOS: [React.FC<{t: number}>, number][] = [[Vitrine, 3.0], [Catalogo, 1.43], [Estudio, 3.2], [Institucional, 1.8], [Cinema, 3.4]];

export const Fidelidade: React.FC<{i: number}> = ({i}) => {
  const [Page, t] = ESTADOS[i];
  return (
    <AbsoluteFill style={{background: C.paper}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1200, height: 675, transformOrigin: '0 0', transform: 'scale(1.33333)'}}>
        <Page t={t} />
      </div>
    </AbsoluteFill>
  );
};
