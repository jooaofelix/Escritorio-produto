import { readFileSync } from 'node:fs';
import { expect, type Page } from '@playwright/test';
import { chapters } from '../src/data/chapters';

export { chapters };

/** Número esperado nos links (o mesmo do `.env`); sobrescreva com E2E_WHATSAPP_NUMBER. */
export const WHATSAPP_NUMBER = process.env.E2E_WHATSAPP_NUMBER ?? '5512991338866';
export const DEFAULT_MESSAGE = 'Olá! Conheci a Coloridamente pelo site e gostaria de solicitar um orçamento.';
export const productMessage = (name: string) =>
  `Olá! Conheci a Coloridamente pelo site e gostaria de solicitar um orçamento de: ${name}.`;

interface ScrollManifest {
  count: number;
  desktop: { path: string; width: number; height: number };
  mobile: { path: string; width: number; height: number };
  transitions: { from: string; to: string; start: number; end: number }[];
  stills: { path: string; frames: number[] };
}
export const scrollManifest = JSON.parse(
  readFileSync(new URL('../src/data/scroll-manifest.json', import.meta.url), 'utf8'),
) as ScrollManifest;

/** Espelha src/components/cinematic/sequence.ts: vídeo (0..163) + 16 frames parados no fim. */
const END_HOLD = 16;
export const LAST_VIDEO_FRAME = scrollManifest.count - 1;
export const TIMELINE_LENGTH = LAST_VIDEO_FRAME + END_HOLD;

/** Conjunto de frames que a página escolhe (mesmo breakpoint do preload do index.html); os dois têm `count` arquivos. */
export function frameSetFor(viewportWidth: number) {
  const set = viewportWidth >= 768 ? scrollManifest.desktop : scrollManifest.mobile;
  return { ...set, count: scrollManifest.count };
}

/** Coleta erros de console, exceções e respostas/requisições com falha durante o teste. */
export function trackProblems(page: Page) {
  const problems: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') problems.push(`console.error: ${message.text()}`);
  });
  page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`));
  page.on('response', (response) => {
    if (response.status() >= 400) problems.push(`HTTP ${response.status()}: ${response.url()}`);
  });
  page.on('requestfailed', (request) => {
    const failure = request.failure()?.errorText ?? '';
    // Abortos são esperados: o carregador cancela frames pendentes ao desmontar/trocar de layout.
    if (!failure.includes('ERR_ABORTED')) problems.push(`requestfailed ${failure}: ${request.url()}`);
  });
  return problems;
}

/** Abre a home e espera o primeiro frame no canvas (sequência pronta). */
export async function openWithSequence(page: Page) {
  await page.goto('/');
  await expect(page.locator('#inicio canvas')).toHaveCSS('opacity', '1');
}

/** Início e comprimento (px) da rolagem do pin. */
export async function pinGeometry(page: Page) {
  return page.evaluate(() => {
    const spacer = document.querySelector<HTMLElement>('#inicio .pin-spacer');
    const stage = spacer?.firstElementChild as HTMLElement | null;
    if (!spacer || !stage) throw new Error('pin da sequência não encontrado');
    return {
      start: spacer.getBoundingClientRect().top + window.scrollY,
      length: spacer.offsetHeight - stage.offsetHeight,
    };
  });
}

/** Rola (sem animação) até o ponto do pin que corresponde ao tempo `time` da timeline (em frames). */
export async function scrollToTime(page: Page, time: number) {
  const { start, length } = await pinGeometry(page);
  const top = Math.round(start + (length * time) / TIMELINE_LENGTH);
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), top);
}

/** Opacidade efetiva (produto dos ancestrais até o hero) do título de cada capítulo, na ordem. */
export function chapterOpacities(page: Page) {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll<HTMLElement>('#inicio h1, #inicio h2')).map((heading) => {
      let opacity = 1;
      for (let el: HTMLElement | null = heading; el && el.id !== 'inicio'; el = el.parentElement) {
        opacity *= Number.parseFloat(getComputedStyle(el).opacity);
      }
      return Math.round(opacity * 100) / 100;
    }),
  );
}

/** Assinatura do canvas: miniatura 27×48 (9:16) em RGBA, para comparar frames. */
export function canvasSignature(page: Page) {
  return page.evaluate(() => {
    const source = document.querySelector<HTMLCanvasElement>('#inicio canvas');
    if (!source) throw new Error('canvas ausente');
    const thumb = document.createElement('canvas');
    thumb.width = 27;
    thumb.height = 48;
    const ctx = thumb.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('2d indisponível');
    ctx.drawImage(source, 0, 0, thumb.width, thumb.height);
    return Array.from(ctx.getImageData(0, 0, thumb.width, thumb.height).data);
  });
}

/** Diferença média absoluta por canal (0–255) entre duas assinaturas. */
export function signatureDistance(a: readonly number[], b: readonly number[]) {
  let sum = 0;
  let n = 0;
  for (let i = 0; i < a.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      sum += Math.abs((a[i + c] ?? 0) - (b[i + c] ?? 0));
      n++;
    }
  }
  return sum / n;
}

/** Rola a página inteira em passos, para disparar lazy-load e observers. */
export async function scrollThroughPage(page: Page, step = 0.8) {
  await page.evaluate(async (fraction) => {
    const delta = Math.max(200, Math.round(window.innerHeight * fraction));
    for (let y = 0; y < document.documentElement.scrollHeight; y += delta) {
      window.scrollTo({ top: y, behavior: 'instant' });
      await new Promise((resolve) => setTimeout(resolve, 60));
    }
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' });
  }, step);
}

/** Decodifica o `text` de um link do WhatsApp. */
export function parseWhatsAppHref(href: string) {
  const url = new URL(href);
  return { origin: url.origin, path: url.pathname, text: url.searchParams.get('text') };
}

/**
 * Contraste WCAG do texto do capítulo visível contra o fundo real (frame + véu): esconde o texto,
 * captura a tela e mede, sob cada linha (caixas do Range), o pixel de fundo menos contrastante
 * contra a cor do próprio texto. Retorna o pior valor por tipo (título e apoio).
 */
export async function chapterTextContrast(page: Page) {
  const lines = await page.evaluate(() => {
    const out: { kind: 'title' | 'body'; color: string; x: number; y: number; w: number; h: number }[] = [];
    for (const el of document.querySelectorAll<HTMLElement>('#inicio h1, #inicio h2, #inicio h1 ~ p, #inicio h2 ~ p')) {
      let opacity = 1;
      for (let node: HTMLElement | null = el; node && node.id !== 'inicio'; node = node.parentElement) {
        opacity *= Number.parseFloat(getComputedStyle(node).opacity);
      }
      if (opacity < 0.99) continue;
      const range = document.createRange();
      range.selectNodeContents(el);
      const color = getComputedStyle(el).color;
      for (const r of range.getClientRects()) {
        out.push({ kind: el.tagName === 'P' ? 'body' : 'title', color, x: r.left, y: r.top, w: r.width, h: r.height });
      }
      el.style.visibility = 'hidden';
    }
    return out;
  });
  const shot = (await page.screenshot({ scale: 'css' })).toString('base64');
  return page.evaluate(
    async ({ lines, shot }) => {
      document.querySelectorAll<HTMLElement>('#inicio h1, #inicio h2, #inicio p').forEach((el) => (el.style.visibility = ''));
      const bitmap = await createImageBitmap(await (await fetch(`data:image/png;base64,${shot}`)).blob());
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
      ctx.drawImage(bitmap, 0, 0);
      const channel = (c: number) => ((c /= 255) <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
      const luminance = (r: number, g: number, b: number) => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
      const worst = { title: Infinity, body: Infinity };
      for (const line of lines) {
        const [r, g, b] = line.color.match(/\d+/g)!.map(Number) as [number, number, number];
        const textL = luminance(r, g, b);
        const x = Math.max(0, Math.floor(line.x));
        const y = Math.max(0, Math.floor(line.y));
        const w = Math.min(bitmap.width - x, Math.ceil(line.w));
        const h = Math.min(bitmap.height - y, Math.ceil(line.h));
        if (w <= 0 || h <= 0) continue;
        const data = ctx.getImageData(x, y, w, h).data;
        for (let i = 0; i < data.length; i += 4) {
          const bgL = luminance(data[i]!, data[i + 1]!, data[i + 2]!);
          const ratio = (Math.max(bgL, textL) + 0.05) / (Math.min(bgL, textL) + 0.05);
          if (ratio < worst[line.kind]) worst[line.kind] = ratio;
        }
      }
      return { lines: lines.length, title: Math.round(worst.title * 100) / 100, body: Math.round(worst.body * 100) / 100 };
    },
    { lines, shot },
  );
}
