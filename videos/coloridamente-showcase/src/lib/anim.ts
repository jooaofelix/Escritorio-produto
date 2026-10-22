import {interpolate} from 'remotion';
import {EASE} from '../config';

type Ease = (n: number) => number;

/** Progresso 0→1 entre t0 e t1 (segundos), com easing. */
export const p = (t: number, t0: number, t1: number, e: Ease = EASE.out) =>
  interpolate(t, [t0, t1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});

export const mix = (a: number, b: number, k: number) => a + (b - a) * k;

/** Entrada e saída: 0 antes de a, 1 entre a+d e b, volta a 0 até b+d. */
export const inOut = (t: number, a: number, b: number, d = 0.35) =>
  p(t, a, a + d) * (1 - p(t, b, b + d, EASE.in));

export type Pose = {s: number; px: number; py: number; qx: number; qy: number};
export type Key = Pose & {t: number; e?: Ease};

/** Interpola poses de câmera por keyframes (ponto da página p aparece no ponto da tela q). */
export function poseAt(keys: Key[], t: number): Pose {
  if (t <= keys[0].t) return keys[0];
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1], b = keys[i];
    if (t <= b.t) {
      const k = p(t, a.t, b.t, b.e ?? EASE.inOut);
      return {s: mix(a.s, b.s, k), px: mix(a.px, b.px, k), py: mix(a.py, b.py, k), qx: mix(a.qx, b.qx, k), qy: mix(a.qy, b.qy, k)};
    }
  }
  return keys[keys.length - 1];
}

export const poseCss = (c: Pose) => `translate(${c.qx - c.s * c.px}px, ${c.qy - c.s * c.py}px) scale(${c.s})`;

/** Retângulo interpolado. */
export type Rect = {x: number; y: number; w: number; h: number};
export const mixRect = (a: Rect, b: Rect, k: number): Rect => ({x: mix(a.x, b.x, k), y: mix(a.y, b.y, k), w: mix(a.w, b.w, k), h: mix(a.h, b.h, k)});
