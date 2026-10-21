import { readFileSync } from 'node:fs';
import { expect, type Page } from '@playwright/test';
import { chapters } from '../src/data/chapters';

export { chapters };

/** Número esperado nos links (o mesmo do `.env`); sobrescreva com E2E_WHATSAPP_NUMBER. */
export const WHATSAPP_NUMBER = process.env.E2E_WHATSAPP_NUMBER ?? '5512991338866';
export const DEFAULT_MESSAGE = 'Olá! Conheci a Coloridamente pelo site e gostaria de solicitar um orçamento.';
export const productMessage = (name: string) =>
  `Olá! Conheci a Coloridamente pelo site e gostaria de solicitar um orçamento de: ${name}.`;

interface FramesManifest {
  sourceFrameCount: number;
  desktop: { path: string; count: number };
  mobile: { path: string; count: number };
}
export const framesManifest = JSON.parse(
  readFileSync(new URL('../src/data/frames-manifest.json', import.meta.url), 'utf8'),
) as FramesManifest;

/** Espelha src/components/cinematic/sequence.ts: vídeo (0..240) + 24 frames parados no fim. */
const END_HOLD = 24;
export const LAST_VIDEO_FRAME = framesManifest.sourceFrameCount - 1;
export const TIMELINE_LENGTH = LAST_VIDEO_FRAME + END_HOLD;

/** Conjunto de frames que a página escolhe (mesmo breakpoint do preload do index.html). */
export function frameSetFor(viewportWidth: number) {
  return viewportWidth >= 768 ? framesManifest.desktop : framesManifest.mobile;
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

/** Assinatura do canvas: miniatura 48×27 em RGBA, para comparar frames. */
export function canvasSignature(page: Page) {
  return page.evaluate(() => {
    const source = document.querySelector<HTMLCanvasElement>('#inicio canvas');
    if (!source) throw new Error('canvas ausente');
    const thumb = document.createElement('canvas');
    thumb.width = 48;
    thumb.height = 27;
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
