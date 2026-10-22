import { expect, test } from '@playwright/test';
import { PRODUCTS, WHATSAPP_NUMBER } from './support';

test.describe('proposta 04 — institucional premium', () => {
  test('hero com etiqueta, título, texto, CTA e categorias', async ({ page }) => {
    await page.goto('/');
    const hero = page.locator('section').first();
    await expect(hero.getByText('Produtos personalizados para empresas')).toBeVisible();
    await expect(hero.locator('h1')).toBeVisible();
    await expect(hero.getByText('Soluções de papelaria e acessórios para escritório')).toBeVisible();
    const cta = hero.getByRole('link', { name: /Solicitar proposta/ });
    await expect(cta).toBeVisible();
    expect(await cta.getAttribute('href')).toContain(`wa.me/${WHATSAPP_NUMBER}`);
    for (const tag of ['Papelaria', 'Corporativo', 'Acessórios para escritório']) await expect(hero.getByText(tag, { exact: true })).toBeVisible();
    const bg = await hero.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).toBe('rgb(48, 68, 59)'); // #30443B
  });

  test('galeria com os 5 produtos e as 4 etapas', async ({ page }) => {
    await page.goto('/');
    const names = await page.locator('#produtos h3').allTextContents();
    expect(names).toEqual(PRODUCTS);
    await expect(page.locator('#como-funciona li')).toHaveCount(4);
  });

  test('âncoras do menu levam às seções', async ({ page, isMobile }) => {
    test.skip(isMobile, 'no mobile o menu mostra só a pílula de orçamento');
    await page.goto('/');
    await page.locator('header').getByRole('link', { name: 'Produtos' }).click();
    await expect(page).toHaveURL(/#produtos$/);
    await expect(page.locator('#produtos h2')).toBeInViewport();
    await page.locator('header').getByRole('link', { name: 'Sobre' }).click();
    await expect(page.locator('#sobre h2')).toBeInViewport();
  });
});
