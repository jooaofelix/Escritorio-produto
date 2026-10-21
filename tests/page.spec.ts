import { expect, test } from '@playwright/test';
import { chapters, scrollThroughPage, scrollToTime, TIMELINE_LENGTH, trackProblems } from './support';

test.describe('página', () => {
  test('carrega e rola inteira sem erros de console nem respostas 4xx/5xx', async ({ page }) => {
    const problems = trackProblems(page);
    await page.goto('/', { waitUntil: 'load' });
    await expect(page.locator('#inicio canvas')).toHaveCSS('opacity', '1');
    await scrollThroughPage(page);
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForLoadState('networkidle');
    expect(problems).toEqual([]);
  });

  test('arquivos referenciados no <head> e no manifest existem', async ({ page, request }) => {
    await page.goto('/');
    const urls = await page.evaluate(() => {
      const list = [
        ...Array.from(document.querySelectorAll<HTMLLinkElement>('link[href]')).map((l) => l.href),
        ...Array.from(document.querySelectorAll<HTMLMetaElement>('meta[property="og:image"], meta[name="twitter:image"]')).map(
          (m) => new URL(m.content, location.href).href,
        ),
      ];
      return Array.from(new Set(list)).filter((u) => u.startsWith(location.origin));
    });
    const manifest = (await (await request.get('/site.webmanifest')).json()) as { icons?: { src: string }[] };
    for (const icon of manifest.icons ?? []) urls.push(new URL(icon.src, page.url()).href);
    urls.push(new URL('/robots.txt', page.url()).href);
    for (const url of urls) {
      const response = await request.get(url);
      expect(response.status(), url).toBe(200);
    }
  });

  test('meta tags de SEO e compartilhamento', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Coloridamente/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
    const meta = (selector: string) => page.locator(selector).getAttribute('content');
    expect((await meta('meta[name="description"]'))?.length ?? 0).toBeGreaterThan(70);
    expect(await meta('meta[name="viewport"]')).toContain('width=device-width');
    expect(await meta('meta[property="og:title"]')).toBeTruthy();
    expect(await meta('meta[property="og:description"]')).toBeTruthy();
    expect(await meta('meta[property="og:image"]')).toMatch(/og-image\.jpg$/);
    expect(await meta('meta[name="twitter:card"]')).toBe('summary_large_image');
    const jsonLd = await page.locator('script[type="application/ld+json"]').textContent();
    expect(() => JSON.parse(jsonLd ?? '')).not.toThrow();
  });

  test('um único h1 (capítulo 1) e headings sem pular nível', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveText(chapters[0]!.title);
    const levels = await page.locator('h1, h2, h3, h4, h5, h6').evaluateAll((els) => els.map((el) => Number(el.tagName[1])));
    expect(levels[0]).toBe(1);
    for (let i = 1; i < levels.length; i++) {
      expect(levels[i]!, `heading ${i} pula nível`).toBeLessThanOrEqual(levels[i - 1]! + 1);
    }
    // Cada seção de conteúdo é rotulada pelo seu h2.
    for (const id of ['o-que-criamos', 'como-funciona', 'produtos', 'orcamento']) {
      const section = page.locator(`section#${id}`);
      const labelledBy = await section.getAttribute('aria-labelledby');
      await expect(page.locator(`h2#${labelledBy}`)).toHaveCount(1);
    }
  });

  test('imagens com alt, dimensões e carregadas', async ({ page }) => {
    await page.goto('/');
    await scrollThroughPage(page);
    await page.waitForLoadState('networkidle');
    const images = await page.locator('img').evaluateAll((imgs) =>
      (imgs as HTMLImageElement[]).map((img) => ({
        src: img.currentSrc || img.src,
        alt: img.getAttribute('alt'),
        hidden: img.closest('[aria-hidden="true"]') !== null,
        width: Number(img.getAttribute('width')),
        height: Number(img.getAttribute('height')),
        loading: img.getAttribute('loading'),
        // Hero (LCP), header e o logo do menu mobile (mesmo arquivo do header) podem ser eager.
        eagerOk: img.closest('#inicio, header, [role="dialog"]') !== null,
        complete: img.complete,
        natural: img.naturalWidth,
      })),
    );
    expect(images.length).toBeGreaterThan(8);
    for (const img of images) {
      expect(img.alt, `alt ausente: ${img.src}`).not.toBeNull();
      if (!img.hidden) expect(img.alt!.trim().length, `alt vazio em imagem não decorativa: ${img.src}`).toBeGreaterThan(0);
      expect(img.width, `width: ${img.src}`).toBeGreaterThan(0);
      expect(img.height, `height: ${img.src}`).toBeGreaterThan(0);
      if (!img.eagerOk) expect(img.loading, `abaixo da dobra sem lazy: ${img.src}`).toBe('lazy');
      expect(img.complete && img.natural > 0, `imagem não carregou: ${img.src}`).toBe(true);
    }
  });

  const viewports = [
    { width: 320, height: 640 },
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1024, height: 768 },
    { width: 1440, height: 900 },
  ];
  for (const viewport of viewports) {
    test(`sem rolagem horizontal em ${viewport.width}px`, async ({ page }, testInfo) => {
      test.skip(testInfo.project.name === 'mobile' && viewport.width >= 768, 'larguras de tablet/desktop: projeto desktop');
      await page.setViewportSize(viewport);
      await page.goto('/');
      await expect(page.locator('#inicio canvas')).toHaveCSS('opacity', '1');
      const overflow = () =>
        page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(await overflow()).toBeLessThanOrEqual(0);

      // Fim do pin: o capítulo final e o CTA cabem na largura (e na altura) da tela.
      await scrollToTime(page, TIMELINE_LENGTH);
      const cta = page.getByRole('link', { name: /Quero personalizar meus produtos/ });
      await expect(cta).toBeInViewport({ ratio: 1 });
      const box = await cta.boundingBox();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width);

      await scrollThroughPage(page);
      expect(await overflow()).toBeLessThanOrEqual(0);
    });
  }
});
