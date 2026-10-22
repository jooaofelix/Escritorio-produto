import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, EASE, SCENES} from './config';
import {Key, mix, p, poseAt, poseCss} from './lib/anim';
import {Abertura} from './scenes/Abertura';
import {Vitrine, vitrineCamera} from './scenes/Vitrine';
import {Catalogo, catalogoCamera} from './scenes/Catalogo';
import {Estudio, estudioCamera} from './scenes/Estudio';
import {Institucional, institucionalCamera, institucionalTilt} from './scenes/Institucional';
import {Cinema, cinemaCamera} from './scenes/Cinema';
import {Encerramento} from './scenes/Encerramento';
import {Rodape, SceneLabel} from './components/SceneLabel';

type Cena = {start: number; Page: React.FC<{t: number; chrome?: boolean}>; cam: Key[]; tin: number; tout: number; under?: number};
/** Cenas 02–06: a mesma moldura de navegador atravessa todas; `under` = quanto tempo a cena anterior continua por baixo. */
const CENAS: Cena[] = [
  {start: SCENES.vitrine, Page: Vitrine, cam: vitrineCamera, tin: 2.55, tout: 4.22},
  {start: SCENES.catalogo, Page: Catalogo, cam: catalogoCamera, tin: 2.65, tout: 4.22, under: 0.8},
  {start: SCENES.estudio, Page: Estudio, cam: estudioCamera, tin: 2.4, tout: 4.22, under: 1.0},
  {start: SCENES.institucional, Page: Institucional, cam: institucionalCamera, tin: 2.7, tout: 4.22, under: 0.6},
  {start: SCENES.cinema, Page: Cinema, cam: cinemaCamera, tin: 2.8, tout: 4.2, under: 0.5},
];

export const Showcase: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;

  const idx = Math.max(0, CENAS.filter((c) => t >= c.start).length - 1);
  const cena = CENAS[idx];
  const lt = t - cena.start;
  const cam = poseAt(cena.cam, lt);
  const tilt = idx === 3 ? institucionalTilt(lt) : {ry: 0, rx: 0};
  const prev = idx > 0 && cena.under && lt < cena.under ? CENAS[idx - 1] : null;

  const showStage = t >= 1.6 && t < SCENES.encerramento;
  const reveal = p(t, 1.68, 2.3, EASE.cine);
  const labelVis = p(lt, cena.tin, cena.tin + 0.3) * (1 - p(lt, cena.tout, cena.tout + 0.28, EASE.in));

  return (
    <AbsoluteFill style={{background: C.paper}}>
      {t < 2.35 && <Abertura t={t} />}
      {showStage && (
        <AbsoluteFill style={{background: C.paper, clipPath: t < 2.3 ? `circle(${mix(0, 1150, reveal)}px at 960px 540px)` : undefined, perspective: 2200}}>
          <div style={{position: 'absolute', inset: 0, transformOrigin: '710px 540px', transform: `rotateY(${tilt.ry}deg) rotateX(${tilt.rx}deg)`}}>
            <div style={{position: 'absolute', left: 0, top: 0, width: 1200, height: 675, transformOrigin: '0 0', transform: poseCss(cam)}}>
              {prev && <prev.Page t={4.5 + lt} />}
              {/* a moldura é a mesma nas cinco propostas: durante a transição só a cena de baixo a desenha */}
              <cena.Page t={lt} chrome={!prev} />
            </div>
          </div>
          <SceneLabel i={idx} t={lt} tin={cena.tin} tout={cena.tout} />
          <Rodape i={idx} vis={labelVis} />
        </AbsoluteFill>
      )}
      {t >= SCENES.encerramento && <Encerramento t={t - SCENES.encerramento} />}
      <Audio src={staticFile('audio/trilha.mp3')} />
    </AbsoluteFill>
  );
};
