import React, {useEffect, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';
import {FONT} from '../config';

/* ---------- fontes: Lato, a mesma família usada no PDF ---------- */
let fontsPromise: Promise<void> | null = null;
let fontsReady = false;
const loadFonts = () => {
  if (!fontsPromise) {
    fontsPromise = Promise.all(
      ([[400, 'lato-latin-400-normal.woff2'], [700, 'lato-latin-700-normal.woff2'], [900, 'lato-latin-900-normal.woff2']] as const).map(
        async ([w, f]) => {
          const face = new FontFace('Lato', `url(${staticFile(`fonts/${f}`)}) format('woff2')`, {weight: String(w)});
          document.fonts.add(await face.load());
        },
      ),
    ).then(() => {
      fontsReady = true;
    });
  }
  return fontsPromise;
};

/** Só desenha o vídeo depois que a Lato carregou (o tracking é medido com ela). */
export const FontGate: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [ready, setReady] = useState(fontsReady);
  const [handle] = useState(() => (fontsReady ? null : delayRender('Carregando Lato')));
  useEffect(() => {
    if (ready) return;
    loadFonts().then(() => {
      setReady(true);
      if (handle !== null) continueRender(handle);
    });
  }, [ready, handle]);
  return ready ? <>{children}</> : null;
};

/* ---------- tracking calculado para bater com a largura de cada linha no PDF ---------- */
const cache = new Map<string, number>();
let ctx: CanvasRenderingContext2D | null = null;
function tracking(text: string, size: number, weight: number, width: number): number {
  const key = `${weight}|${size}|${width}|${text}`;
  const hit = cache.get(key);
  if (hit !== undefined) return hit;
  ctx ??= document.createElement('canvas').getContext('2d');
  ctx!.font = `${weight} ${size}px Lato`;
  const natural = ctx!.measureText(text).width;
  const ls = Math.max(-0.04 * size, Math.min(0.4 * size, (width - natural) / Math.max(1, text.length)));
  cache.set(key, ls);
  return ls;
}

type TProps = {
  x: number;
  y: number;
  /** altura da caixa do texto no PDF (pt) = corpo da fonte */
  h: number;
  /** largura da linha no PDF: ajusta o espaçamento entre letras para ficar idêntico */
  w?: number;
  weight?: 400 | 700 | 900;
  color: string;
  track?: number;
  children: string;
  style?: React.CSSProperties;
};

const DX = 0;
const DY = -0.08;

/** Uma linha de texto posicionada com as métricas do PDF (coordenadas em pt). */
export const T: React.FC<TProps> = ({x, y, h, w, weight = 400, color, track, children, style}) => {
  const size = h;
  const ls = track !== undefined ? track * size : w ? tracking(children, size, weight, w) : 0;
  return (
    <div
      style={{
        // DX/DY: correção medida contra o PDF rasterizado (origem do glifo vs. caixa do pdftotext)
        position: 'absolute', left: x + DX * size, top: y + DY * size, fontFamily: FONT, fontWeight: weight, fontSize: size,
        lineHeight: 1, letterSpacing: ls, color, whiteSpace: 'nowrap', ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Setas desenhadas (a Lato não tem esses glifos). */
export const Arrow: React.FC<{dir: 'right' | 'upright' | 'down'; x: number; y: number; size: number; color: string; style?: React.CSSProperties}> = ({dir, x, y, size, color, style}) => {
  const d = dir === 'right' ? 'M2 8h11M9 4l4 4-4 4' : dir === 'upright' ? 'M4 12L12 4M6 4h6v6' : 'M8 2v11M4 9l4 4 4-4';
  return (
    <svg viewBox="0 0 16 16" style={{position: 'absolute', left: x, top: y, width: size, height: size, overflow: 'visible', ...style}}>
      <path d={d} fill="none" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};
