import React from 'react';
import {Img, staticFile} from 'remotion';
import {C, FRAME, VIEW} from '../config';
import {Arrow, T} from './Text';

/**
 * Maquete de navegador do PDF, em coordenadas da página (pt).
 * Camadas: sombra → moldura → fundo da página → decoração (fora do recorte) → conteúdo rolável → cabeçalho fixo.
 */
export const Browser: React.FC<{
  pageBg: string;
  bgOpacity?: number;
  /** clip-path aplicado ao fundo e ao conteúdo (coordenadas locais da janela) */
  clip?: string;
  scroll?: number;
  /** 0–1: visibilidade da barra de rolagem */
  thumb?: number;
  deco?: React.ReactNode;
  header?: React.ReactNode;
  children?: React.ReactNode;
  chrome?: boolean;
}> = ({pageBg, bgOpacity = 1, clip, scroll = 0, thumb = 0, deco, header, children, chrome = true}) => {
  const view: React.CSSProperties = {position: 'absolute', left: VIEW.x, top: VIEW.y, width: VIEW.w, height: VIEW.h, overflow: 'hidden', clipPath: clip, borderRadius: '0 0 3px 3px'};
  const inner: React.CSSProperties = {position: 'absolute', left: -VIEW.x, top: -VIEW.y, width: 1200, height: 1400};
  return (
    <>
      {chrome && (
        <>
          <div style={{position: 'absolute', left: 65, top: 191, width: FRAME.w, height: 424, borderRadius: 14, background: C.shadow}} />
          <div style={{position: 'absolute', left: FRAME.x, top: FRAME.y, width: FRAME.w, height: FRAME.chrome + 2, borderRadius: '12px 12px 0 0', background: C.white}} />
          {[['#F2AFA4', 72], ['#F0D58E', 87], ['#ADD3AE', 102]].map(([c, x]) => (
            <div key={x} style={{position: 'absolute', left: (x as number) - 3.8, top: 190 - 3.8, width: 7.6, height: 7.6, borderRadius: 4, background: c as string}} />
          ))}
          <div style={{position: 'absolute', left: 328, top: 182, width: 227, height: 16, borderRadius: 8, background: '#F2F2EF'}} />
          <T x={403.3} y={183.6} h={8} w={91.7} color={C.url}>coloridamente.com.br</T>
        </>
      )}
      <div style={view}>
        <div style={{...inner, background: pageBg, opacity: bgOpacity}} />
      </div>
      {deco}
      <div style={view}>
        <div style={{...inner, transform: `translateY(${-scroll}px)`}}>{children}</div>
        <div style={inner}>{header}</div>
        <div
          style={{
            position: 'absolute', right: 3, width: 3.2, height: 70, borderRadius: 2, background: pageBg === C.white || pageBg === C.paper ? 'rgba(38,41,36,.28)' : 'rgba(255,255,255,.35)',
            top: 62 + Math.min(1, Math.max(0, scroll / 140)) * 150, opacity: thumb,
          }}
        />
      </div>
    </>
  );
};

/** Cabeçalho comum às cinco propostas (mesma posição em todas as páginas do PDF). */
export const SiteHeader: React.FC<{dark?: boolean; band?: string | null; divider?: boolean; t?: number}> = ({dark, band, divider = true, t}) => {
  const ink = dark ? C.paper : C.ink;
  // animação de entrada do menu (t em segundos desde o início da montagem); sem t = estático
  const k = (a: number) => (t === undefined ? 1 : Math.max(0, Math.min(1, (t - a) / 0.45)));
  const e = (v: number) => 1 - Math.pow(1 - v, 3);
  return (
    <>
      {band && <div style={{position: 'absolute', left: VIEW.x, top: VIEW.y, width: VIEW.w, height: 55, background: band}} />}
      <T x={79} y={220.2} h={16} w={118.7} weight={900} color={ink} style={{opacity: e(k(0)), transform: `translateX(${(1 - e(k(0))) * -26}px)`}}>
        coloridamente.
      </T>
      <T x={599} y={223.8} h={10} w={45.7} color={ink} style={{opacity: e(k(0.1)), transform: `translateY(${(1 - e(k(0.1))) * -10}px)`}}>Produtos</T>
      <T x={666} y={223.8} h={10} w={28.8} color={ink} style={{opacity: e(k(0.17)), transform: `translateY(${(1 - e(k(0.17))) * -10}px)`}}>Sobre</T>
      <div style={{position: 'absolute', left: 724, top: 215, width: 74, height: 29, opacity: e(k(0.25)), transform: `scale(${0.6 + 0.4 * e(k(0.25))})`}}>
        <div style={{position: 'absolute', inset: 0, borderRadius: 15, background: C.coralBtn}} />
        <T x={11.7} y={9.8} h={10} w={57} weight={700} color={C.ink}>Orçamento</T>
      </div>
      {divider && (
        <div style={{position: 'absolute', left: 78, top: 260, width: 714, height: 0.8, background: dark ? 'rgba(255,255,255,.14)' : '#E9E8E3', transformOrigin: 'left', transform: `scaleX(${e(k(0.2))})`}} />
      )}
    </>
  );
};

/** Imagem com recorte central (as fotos do PDF são recortes centrais dos originais). */
export const Pic: React.FC<{src: string; x: number; y: number; w: number; h: number; r?: number; scale?: number; dy?: number; style?: React.CSSProperties; imgStyle?: React.CSSProperties}> = ({src, x, y, w, h, r = 0, scale = 1, dy = 0, style, imgStyle}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: r, overflow: 'hidden', ...style}}>
    <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `translateY(${dy}px) scale(${scale})`, ...imgStyle}} />
  </div>
);

/** Botão em pílula do PDF. */
export const Pill: React.FC<{x: number; y: number; w: number; h: number; bg: string; label: string; lx: number; ly: number; lh: number; lw?: number; color: string; arrow?: 'right' | 'upright'; ax?: number; style?: React.CSSProperties; border?: string}> = ({
  x, y, w, h, bg, label, lx, ly, lh, lw, color, arrow, ax, style, border,
}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, ...style}}>
    <div style={{position: 'absolute', inset: 0, borderRadius: h / 2, background: bg, boxShadow: border ? `inset 0 0 0 0.8px ${border}` : undefined}} />
    <T x={lx - x} y={ly - y} h={lh} w={lw} weight={700} color={color}>{label}</T>
    {arrow && <Arrow dir={arrow} x={(ax ?? 0) - x} y={ly - y + lh * 0.12} size={lh * 0.78} color={color} />}
  </div>
);

/** Cursor de navegação simulada. */
export const Cursor: React.FC<{x: number; y: number; opacity: number; click?: number; size?: number}> = ({x, y, opacity, click = 0, size = 15}) => (
  <div style={{position: 'absolute', left: x, top: y, opacity, pointerEvents: 'none'}}>
    {click > 0 && click < 1 && (
      <div style={{position: 'absolute', left: -14, top: -14, width: 28, height: 28, borderRadius: 14, border: '1.6px solid rgba(255,255,255,.95)', boxShadow: '0 0 0 1px rgba(38,41,36,.35)', transform: `scale(${0.3 + click * 1.1})`, opacity: 1 - click}} />
    )}
    <svg viewBox="0 0 14 20" style={{position: 'absolute', left: -1, top: -1, width: size * 0.7, height: size, overflow: 'visible', transform: `scale(${1 - 0.12 * Math.sin(Math.PI * Math.min(1, click * 2.5))})`, transformOrigin: '0 0', filter: 'drop-shadow(0 1.5px 2px rgba(0,0,0,.28))'}}>
      <path d="M1 1v15.5l4.2-3.9 2.9 6.4 2.6-1.2-2.8-6.2h5.8z" fill="#fff" stroke={C.ink} strokeWidth={1.1} strokeLinejoin="round" />
    </svg>
  </div>
);
