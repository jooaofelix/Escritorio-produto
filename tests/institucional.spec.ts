import { expect, test } from '@playwright/test';
import { OCCASIONS, PRODUCTS, WHATSAPP_NUMBER } from './support';

test.describe('proposta 04 — institucional premium', () => {
  test('hero com etiqueta, título, texto, CTA e categorias', async ({ page }) => {
    await page.goto('/');
    const hero = page.locator('section').first();
    await expect(hero.getByText('Linha Office', { exact: true })).toBeVisible();
    await expect(hero.locator('h1')).toBeVisible();
    await expect(hero.getByText(/A Linha Office reúne agenda, cadernos e acessórios/)).toBeVisible();
    const cta = hero.getByRole('link', { name: /Quero a Linha Office/ });
    await expect(cta).toBeVisible();
    expect(await cta.getAttribute('href')).toContain(`wa.me/${WHATSAPP_NUMBER}`);
    for (const tag of ['Agenda', 'Cadernos', 'Acessórios para escritório']) await expect(hero.getByText(tag, { exact: true })).toBeVisible();
    const bg = await hero.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).toBe('rgb(250, 249, 245)'); // paper #FAF9F5
    await expect(hero.getByRole('link', { name: /Ver a linha/ })).toHaveAttribute('href', '#produtos');
    await expect(page.locator('header img[alt="Coloridamente"]')).toBeVisible();
  });

  test('ocasiões, produtos (um caderno só, com opção sem pauta) e etapas', async ({ page }) => {
    await page.goto('/');
    expect(await page.locator('#ocasioes h3').allTextContents()).toEqual(OCCASIONS);
    const names = await page.locator('#produtos li h3').allTextContents();
    expect(names).toEqual(PRODUCTS);
    await expect(page.locator('#produtos')).toContainText('Também disponível com folhas sem pauta.');
    await expect(page.locator('#produtos').getByRole('link', { name: /Quero orçamento deste/ })).toHaveCount(PRODUCTS.length);
    // oferta da linha completa, com mensagem própria
    const full = page.locator('#produtos').getByRole('link', { name: /Quero a Linha Office completa/ });
    await expect(full).toBeVisible();
    expect(decodeURIComponent((await full.getAttribute('href'))!)).toContain('orçamento de: Linha Office completa.');
    await expect(page.locator('#como-funciona li')).toHaveCount(4);
  });

  test('âncoras do menu levam às seções', async ({ page, isMobile }) => {
    test.skip(isMobile, 'no mobile o menu mostra só a pílula de orçamento');
    await page.goto('/');
    await page.locator('header').getByRole('link', { name: 'Linha Office' }).click();
    await expect(page).toHaveURL(/#produtos$/);
    await expect(page.locator('#produtos h2')).toBeInViewport();
    await page.locator('header').getByRole('link', { name: 'Dúvidas' }).click();
    await expect(page.locator('#duvidas h2')).toBeInViewport();
  });
});
