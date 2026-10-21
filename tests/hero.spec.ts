import { expect, test } from '@playwright/test';
import {
  canvasSignature,
  chapterOpacities,
  chapters,
  DEFAULT_MESSAGE,
  frameSetFor,
  openWithSequence,
  parseWhatsAppHref,
  scrollToTime,
  signatureDistance,
  TIMELINE_LENGTH,
  trackProblems,
  WHATSAPP_NUMBER,
} from './support';

const FRAME_URL = /\/frames\/v\d+\/[dm]\/\d+\.webp$/;
const ctaName = /Quero personalizar meus produtos/;

test.describe('hero: sequência cinematográfica', () => {
  test('o canvas avança com a rolagem e volta ao mesmo frame ao subir', async ({ page }) => {
    const loaded = new Set<string>();
    page.on('response', (response) => {
      if (FRAME_URL.test(response.url()) && response.ok()) loaded.add(response.url());
    });
    await openWithSequence(page);
    // Todos os frames do conjunto carregados: o frame desenhado passa a ser exatamente o pedido.
    const { count } = frameSetFor(page.viewportSize()!.width);
    await expect.poll(() => loaded.size, { timeout: 30_000 }).toBe(count);

    const atTop = await canvasSignature(page);
    // Canvas de fato pintado (não é uma cor chapada).
    const mean = atTop.reduce((sum, v) => sum + v, 0) / atTop.length;
    expect(atTop.some((v) => Math.abs(v - mean) > 40)).toBe(true);

    const settle = async (time: number) => {
      await scrollToTime(page, time);
      await page.waitForTimeout(600); // scrub de 0,5 s
      let previous = await canvasSignature(page);
      // Espera o scrub (0,5 s) assentar: duas leituras seguidas iguais.
      await expect
        .poll(async () => {
          const current = await canvasSignature(page);
          const delta = signatureDistance(previous, current);
          previous = current;
          return delta;
        }, { intervals: [250] })
        .toBe(0);
      return previous;
    };

    const mid = await settle(100);
    expect(signatureDistance(atTop, mid)).toBeGreaterThan(8);
    const later = await settle(200);
    expect(signatureDistance(mid, later)).toBeGreaterThan(8);

    // Voltando: os mesmos pixels nos dois sentidos.
    expect(signatureDistance(await settle(100), mid)).toBeLessThan(1);
    expect(signatureDistance(await settle(0), atTop)).toBeLessThan(1);
  });

  test('o texto de cada capítulo aparece no seu trecho e some fora dele', async ({ page }) => {
    await openWithSequence(page);
    for (const [index, chapter] of chapters.entries()) {
      await scrollToTime(page, (chapter.start + chapter.end) / 2);
      await expect
        .poll(() => chapterOpacities(page), { message: `capítulo ${index + 1}: ${chapter.title}` })
        .toEqual(chapters.map((_, i) => (i === index ? 1 : 0)));
      const heading = page.locator('#inicio').getByRole('heading', { name: chapter.title });
      await expect(heading).toBeInViewport({ ratio: 1 });
    }
    // Respiro entre os capítulos 3 e 4 (frames 179–205): nenhum texto.
    const gap = (chapters[2]!.end + chapters[3]!.start) / 2;
    await scrollToTime(page, gap);
    await expect.poll(() => chapterOpacities(page)).toEqual([0, 0, 0, 0]);
  });

  test('CTA final: inativo antes do capítulo 4, clicável no fim do pin e abre o WhatsApp', async ({ page, context }) => {
    await context.route(/^https:\/\/(api\.)?wa\.me\//, (route) =>
      route.fulfill({ status: 200, contentType: 'text/html', body: '<title>WhatsApp (stub)</title>' }),
    );
    await openWithSequence(page);
    const cta = page.locator('#inicio').getByRole('link', { name: ctaName });
    await expect(cta).toHaveCSS('pointer-events', 'none');

    await scrollToTime(page, TIMELINE_LENGTH);
    await expect(cta).toHaveCSS('pointer-events', 'auto');
    await expect.poll(() => chapterOpacities(page)).toEqual([0, 0, 0, 1]);
    await expect(cta).toBeInViewport({ ratio: 1 });
    await expect(cta).toHaveAttribute('target', '_blank');
    await expect(cta).toHaveAttribute('rel', /noopener/);
    const href = (await cta.getAttribute('href'))!;
    expect(parseWhatsAppHref(href)).toEqual({ origin: 'https://wa.me', path: `/${WHATSAPP_NUMBER}`, text: DEFAULT_MESSAGE });

    // O próprio CTA recebe o clique (nada por cima dele).
    const popupPromise = page.waitForEvent('popup');
    await cta.click();
    const popup = await popupPromise;
    expect(popup.url()).toBe(href);
  });

  test('CTA final focado pelo teclado ainda invisível: a página rola até o capítulo 4', async ({ page }) => {
    await openWithSequence(page);
    const cta = page.locator('#inicio').getByRole('link', { name: ctaName });
    await cta.focus();
    await expect.poll(() => chapterOpacities(page).then((o) => o[3])).toBeGreaterThan(0.95);
    await expect(cta).toBeInViewport({ ratio: 1 });
  });

  test('falha do primeiro frame cai na versão estática', async ({ page }) => {
    await page.route(/\/frames\/v\d+\/[dm]\/0001\.webp$/, (route) => route.abort('failed'));
    await page.goto('/');
    const hero = page.locator('#inicio');
    await expect(hero.locator('canvas')).toHaveCount(0);
    for (const chapter of chapters) {
      await expect(hero.getByRole('heading', { name: chapter.title })).toBeAttached();
    }
    await expect(hero.getByRole('img', { name: chapters[0]!.stillAlt })).toBeVisible();
  });
});

test.describe('hero: versão estática', () => {
  test.use({ reducedMotion: 'reduce' });

  test('prefers-reduced-motion renderiza os 4 capítulos estáticos, sem pin nem canvas', async ({ page }) => {
    const problems = trackProblems(page);
    await page.goto('/');
    const hero = page.locator('#inicio');
    await expect(hero.locator('canvas')).toHaveCount(0);
    await expect(page.locator('.pin-spacer')).toHaveCount(0);
    await expect(page.locator('h1')).toHaveCount(1);
    for (const chapter of chapters) {
      const heading = hero.getByRole('heading', { name: chapter.title });
      await heading.scrollIntoViewIfNeeded();
      await expect(heading).toBeVisible();
      await expect(hero.getByText(chapter.body)).toBeVisible();
      const still = hero.getByRole('img', { name: chapter.stillAlt });
      await expect(still).toBeVisible();
      await expect.poll(() => still.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
    }
    const cta = hero.getByRole('link', { name: ctaName });
    await expect(cta).toBeVisible();
    expect(parseWhatsAppHref((await cta.getAttribute('href'))!).text).toBe(DEFAULT_MESSAGE);
    expect(problems).toEqual([]);
  });
});
