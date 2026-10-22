import { expect, test } from '@playwright/test';
import {
  DEFAULT_MESSAGE,
  PAGES,
  PRODUCTS,
  WHATSAPP_NUMBER,
  expectNoHorizontalScroll,
  productMessage,
  scrollThrough,
  trackProblems,
} from './support';

for (const pageDef of PAGES) {
  test.describe(`página ${pageDef.name}`, () => {
    test('carrega sem erros, sem respostas com falha e com imagens carregadas', async ({ page }) => {
      const problems = trackProblems(page);
      await page.goto(pageDef.path);
      await scrollThrough(page);
      // traz cada imagem para a tela (lazy loading) e espera todas decodificarem
      for (const img of await page.locator('img').all()) await img.scrollIntoViewIfNeeded();
      await expect
        .poll(() =>
          page.evaluate(() =>
            [...document.images].filter((img) => !img.complete || img.naturalWidth === 0).map((img) => img.currentSrc || img.src),
          ),
        )
        .toEqual([]);
      expect(problems).toEqual([]);
    });

    test('um único h1 com o título da proposta e seções com h2', async ({ page }) => {
      await page.goto(pageDef.path);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('h1')).toHaveText(pageDef.h1);
      for (const id of ['produtos', 'como-funciona', 'orcamento']) {
        await expect(page.locator(`section#${id} h2`)).toHaveCount(1);
      }
    });

    test('todos os links de WhatsApp levam ao número e à mensagem certos', async ({ page }) => {
      await page.goto(pageDef.path);
      const links = page.locator('a[href^="https://wa.me/"]');
      const count = await links.count();
      expect(count).toBeGreaterThanOrEqual(PRODUCTS.length + 3);
      const expected = new Set([DEFAULT_MESSAGE, ...PRODUCTS.map(productMessage)]);
      for (let i = 0; i < count; i++) {
        const link = links.nth(i);
        const url = new URL((await link.getAttribute('href'))!);
        expect(url.pathname).toBe(`/${WHATSAPP_NUMBER}`);
        expect(expected.has(url.searchParams.get('text') ?? '')).toBe(true);
        await expect(link).toHaveAttribute('target', '_blank');
        expect(await link.getAttribute('rel')).toContain('noopener');
        await expect(link).toContainText('abre o WhatsApp');
      }
    });

    test('imagens com alt e dimensões', async ({ page }) => {
      await page.goto(pageDef.path);
      const images = await page.locator('img').evaluateAll((imgs) =>
        imgs.map((img) => ({ alt: img.getAttribute('alt'), w: img.getAttribute('width'), h: img.getAttribute('height') })),
      );
      expect(images.length).toBeGreaterThan(0);
      for (const image of images) {
        expect(image.alt?.trim()).toBeTruthy();
        expect(Number(image.w)).toBeGreaterThan(0);
        expect(Number(image.h)).toBeGreaterThan(0);
      }
    });

    test('rodapé leva para a outra página do site', async ({ page }) => {
      await page.goto(pageDef.path);
      const other = PAGES.find((p) => p.path !== pageDef.path)!;
      await page.locator('footer').getByRole('link', { name: /Conheça/ }).click();
      await expect(page).toHaveURL(new RegExp(`${other.path.replace(/\//g, '\\/')}$`));
      await expect(page.locator('h1')).toHaveText(other.h1);
    });

    test('skip link leva ao conteúdo e o foco é visível', async ({ page, isMobile }) => {
      test.skip(isMobile, 'navegação por Tab é testada no desktop');
      await page.goto(pageDef.path);
      await page.keyboard.press('Tab');
      const skip = page.getByRole('link', { name: 'Pular para o conteúdo' });
      await expect(skip).toBeFocused();
      const outline = await skip.evaluate((el) => getComputedStyle(el).outlineStyle);
      expect(outline).not.toBe('none');
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(/#conteudo$/);
    });

    for (const width of [320, 390, 768, 1024, 1440]) {
      test(`sem rolagem horizontal em ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(pageDef.path);
        await scrollThrough(page);
        await expectNoHorizontalScroll(page);
      });
    }
  });
}

test('metadados de SEO por página', async ({ page }) => {
  for (const pageDef of PAGES) {
    await page.goto(pageDef.path);
    await expect(page).toHaveTitle(/Coloridamente/);
    expect(await page.locator('meta[name="description"]').getAttribute('content')).toBeTruthy();
    const og = await page.locator('meta[property="og:image"]').getAttribute('content');
    const res = await page.request.get(new URL(og!, page.url()).toString());
    expect(res.status()).toBe(200);
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
  }
});
