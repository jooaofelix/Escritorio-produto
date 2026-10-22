import React from 'react';
import {C, EASE, IMG, REST} from '../config';
import {Key, mix, p} from '../lib/anim';
import {Browser, Pic, Pill, SiteHeader} from '../components/Browser';
import {T} from '../components/Text';

/** Rolagem final da vitrine (pt) — a transição para o catálogo parte desta posição. */
export const VITRINE_SCROLL = 90;
/** Faixa de produtos logo abaixo da dobra, revelada pela rolagem. */
export const VITRINE_STRIP = [
  {src: IMG.kit, x: 85},
  {src: IMG.agenda, x: 327},
  {src: IMG.pautado, x: 569},
].map((s) => ({...s, y: 612, w: 214, h: 150}));
export const VITRINE_HERO = {x: 436, y: 277, w: 351, h: 294};

const TITLE = [
  {y: 343.9, w: 245.5, s: 'Produtos que'},
  {y: 385.9, w: 231.2, s: 'representam'},
  {y: 427.9, w: 192.7, s: 'sua marca.'},
];

/** Conceito 01 — página 3 do PDF. t = segundos desde o início da cena. */
export const Vitrine: React.FC<{t: number; chrome?: boolean}> = ({t, chrome = true}) => {
  const out = 1 - p(t, 4.5, 4.75, EASE.in); // saída dos textos quando o catálogo assume
  const handedOver = t >= 4.5; // imagens passam para a transição do catálogo
  const scroll = mix(0, VITRINE_SCROLL, p(t, 2.1, 2.95, EASE.inOut));
  const chip = p(t, 0.75, 1.2);
  const img = p(t, 1.0, 2.0);
  const para = p(t, 1.35, 1.9);
  const btn = p(t, 1.5, 2.0, EASE.back);
  const dot = p(t, 1.75, 2.2, EASE.back);
  return (
    <Browser chrome={chrome} pageBg={C.white} scroll={scroll} thumb={p(t, 2.0, 2.2) * (1 - p(t, 3.2, 3.5))} header={<SiteHeader band={C.white} t={t - 0.3} />}>
      <div style={{opacity: out}}>
        <div style={{position: 'absolute', left: 82, top: 289, width: 182, height: 24, clipPath: `inset(0 ${(1 - chip) * 100}% 0 0 round 12px)`}}>
          <div style={{position: 'absolute', inset: 0, borderRadius: 12, background: '#FBEDEA'}} />
          <T x={12} y={7.2} h={9} w={179.9} weight={700} color={C.coralBtn}>PERSONALIZAÇÃO COM PROPÓSITO</T>
        </div>
        {TITLE.map((l, i) => {
          const k = p(t, 0.85 + i * 0.1, 1.55 + i * 0.1, EASE.out);
          return (
            <div key={i} style={{position: 'absolute', left: 82, top: l.y - 4, width: 320, height: 48, overflow: 'hidden'}}>
              <T x={0} y={4 + (1 - k) * 50} h={39} w={l.w} weight={900} color={C.ink}>{l.s}</T>
            </div>
          );
        })}
        <div style={{opacity: para, transform: `translateY(${(1 - para) * 10}px)`}}>
          <T x={83} y={477.9} h={12} w={349.5} color={C.soft}>Papelaria, presentes corporativos e ideias produzidas para</T>
          <T x={83} y={494.9} h={12} w={145.4} color={C.soft}>destacar sua identidade.</T>
        </div>
        <Pill x={82} y={545} w={149} h={35} bg="#252D29" label="Explorar produtos" lx={100} ly={555.8} lh={11} lw={98} color={C.white} arrow="right" ax={205}
          style={{opacity: Math.min(1, btn * 1.4), transform: `scale(${0.7 + 0.3 * btn})`, transformOrigin: 'left center'}} />
      </div>
      {!handedOver && (
        <>
          <Pic src={IMG.caderno} {...VITRINE_HERO} scale={mix(1.22, 1, img)}
            style={{opacity: Math.min(1, img * 1.6), clipPath: `inset(${(1 - img) * 18}% ${(1 - img) * 12}% ${(1 - img) * 18}% ${(1 - img) * 12}%)`}} />
          {VITRINE_STRIP.map((s, i) => <Pic key={i} {...s} r={6} />)}
        </>
      )}
      <div style={{position: 'absolute', left: 739, top: 256, width: 48, height: 48, borderRadius: 24, background: C.mint, opacity: out, transform: `scale(${dot})`}} />
    </Browser>
  );
};

export const vitrineCamera: Key[] = [
  {t: -0.4, s: 2.55, px: 240, py: 330, qx: 960, qy: 540},
  {t: 1.2, s: 2.35, px: 330, py: 390, qx: 960, qy: 540, e: EASE.inOut},
  {t: 2.0, s: 2.15, px: 470, py: 420, qx: 960, qy: 540, e: EASE.inOut},
  {t: 2.65, ...REST, e: EASE.cine},
];
