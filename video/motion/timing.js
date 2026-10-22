/*
 * Utilitários de tempo das cenas (abertura/encerramento).
 * Tudo é função pura de t (segundos): nada de animação CSS, timers ou rAF.
 */
(function () {
  'use strict';

  // cubic-bezier(x1, y1, x2, y2) — mesmo solver das engines (Newton + bissecção).
  function bezier(x1, y1, x2, y2) {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const sx = (s) => ((ax * s + bx) * s + cx) * s;
    const sy = (s) => ((ay * s + by) * s + cy) * s;
    const dx = (s) => (3 * ax * s + 2 * bx) * s + cx;
    function solveX(x) {
      let s = x;
      for (let i = 0; i < 8; i++) {
        const e = sx(s) - x;
        if (Math.abs(e) < 1e-7) return s;
        const d = dx(s);
        if (Math.abs(d) < 1e-6) break;
        s -= e / d;
      }
      let lo = 0, hi = 1;
      s = x;
      while (lo < hi) {
        const v = sx(s);
        if (Math.abs(v - x) < 1e-7) return s;
        if (x > v) lo = s; else hi = s;
        s = (lo + hi) / 2;
        if (hi - lo < 1e-9) break;
      }
      return s;
    }
    return (x) => (x <= 0 ? 0 : x >= 1 ? 1 : sy(solveX(x)));
  }

  const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  // progresso 0..1 de t dentro de [a, b], com easing
  const prog = (t, a, b, ease) => {
    const p = clamp01((t - a) / (b - a));
    return ease ? ease(p) : p;
  };
  const mix = (a, b, p) => a + (b - a) * p;

  window.Motion = {
    FPS: 30,
    bezier,
    clamp01,
    prog,
    mix,
    ease: {
      // entrada refinada (desacelera longo, sem overshoot)
      out: bezier(0.22, 1, 0.36, 1),
      // véus e fades neutros
      soft: bezier(0.33, 0, 0.2, 1),
      // saída: arranca macio, termina macio
      exit: bezier(0.45, 0, 0.3, 1),
      // push-in de câmera
      inOut: bezier(0.42, 0, 0.58, 1),
    },
    // Espera fontes e decodificação de todas as <img> antes do 1º quadro.
    async ready(extra) {
      await document.fonts.ready;
      const imgs = Array.from(document.images);
      await Promise.all(imgs.map((im) => (im.complete && im.naturalWidth ? im.decode() : new Promise((res, rej) => {
        im.addEventListener('load', () => im.decode().then(res, rej), { once: true });
        im.addEventListener('error', () => rej(new Error('falha ao carregar ' + im.src)), { once: true });
      }))));
      if (extra) await extra();
      for (const f of document.fonts) {
        if (f.status !== 'loaded') throw new Error('fonte não carregada: ' + f.family);
      }
      return true;
    },
  };
})();
