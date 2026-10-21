import { expect, test, type Page } from '@playwright/test';
import { DEFAULT_MESSAGE, openWithSequence, parseWhatsAppHref, productMessage, WHATSAPP_NUMBER } from './support';

const NAV = [
  { label: 'O que criamos', id: 'o-que-criamos' },
  { label: 'Como funciona', id: 'como-funciona' },
  { label: 'Produtos', id: 'produtos' },
  { label: 'Orçamento', id: 'orcamento' },
] as const;

test('todos os links do WhatsApp: número, mensagem, nova aba, noopener e aviso', async ({ page }) => {
  await page.goto('/');
  const links = await page.locator('a[href*="wa.me"], a[href*="whatsapp"]').evaluateAll((anchors) =>
    anchors.map((a) => ({
      href: a.getAttribute('href') ?? '',
      target: a.getAttribute('target'),
      rel: a.getAttribute('rel') ?? '',
      text: (a.textContent ?? '').replace(/\s+/g, ' ').trim(),
      // Links de card (categoria ou produto) pedem orçamento do item do card.
      item: a.closest('article, #produtos li')?.querySelector('h3')?.textContent?.trim() ?? null,
    })),
  );
  const cards = await page.locator('#o-que-criamos article, #produtos li').count();
  // header, menu mobile, CTA do hero, "Procura outro produto", conversão e rodapé + 1 por card.
  expect(links).toHaveLength(6 + cards);
  for (const link of links) {
    const { origin, path, text } = parseWhatsAppHref(link.href);
    expect(link.href, link.text).toMatch(new RegExp(`^https://wa\\.me/${WHATSAPP_NUMBER}\\?text=`));
    expect({ origin, path }).toEqual({ origin: 'https://wa.me', path: `/${WHATSAPP_NUMBER}` });
    expect(text, link.text).toBe(link.item ? productMessage(link.item) : DEFAULT_MESSAGE);
    expect(link.target, link.text).toBe('_blank');
    expect(link.rel.split(/\s+/), link.text).toEqual(expect.arrayContaining(['noopener', 'noreferrer']));
    expect(link.text, link.href).toContain('(abre o WhatsApp)');
  }
});

/** Distância do topo da seção à base do header fixo (0 = alinhada logo abaixo). */
async function sectionOffset(page: Page, id: string) {
  return page.evaluate((sectionId) => {
    const header = document.querySelector('header')!.getBoundingClientRect().bottom;
    const top = document.getElementById(sectionId)!.getBoundingClientRect().top;
    const atBottom = Math.ceil(window.scrollY + window.innerHeight) >= document.documentElement.scrollHeight - 1;
    return { delta: Math.round(top - header), atBottom };
  }, id);
}

test('âncoras do menu levam às seções, sem ficar sob o header', async ({ page, isMobile }) => {
  await openWithSequence(page);
  for (const { label, id } of NAV) {
    let nav;
    if (isMobile) {
      await page.getByRole('button', { name: 'Menu' }).click();
      nav = page.getByRole('dialog', { name: 'Menu' });
    } else {
      nav = page.getByRole('navigation', { name: 'Principal' });
    }
    await nav.getByRole('link', { name: label, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`#${id}$`));
    if (isMobile) await expect(page.getByRole('dialog', { name: 'Menu' })).toBeHidden();
    // Rolagem suave: espera assentar alinhada ao header (ou no fim da página, para a última seção).
    await expect
      .poll(async () => {
        const { delta, atBottom } = await sectionOffset(page, id);
        return Math.abs(delta) <= 2 || (atBottom && delta >= 0);
      }, { message: `seção #${id}` })
      .toBe(true);
    await expect(page.locator(`#${id} h2`)).toBeInViewport();
  }
});

test('menu mobile: abre, prende o foco, trava a rolagem, Esc fecha e o foco volta', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'menu só existe abaixo de 1024px');
  await page.goto('/');
  const button = page.getByRole('button', { name: 'Menu' });
  const dialog = page.getByRole('dialog', { name: 'Menu' });
  await expect(button).toHaveAttribute('aria-expanded', 'false');
  await expect(dialog).toBeHidden();
  const buttonBox = (await button.boundingBox())!;
  expect(Math.min(buttonBox.width, buttonBox.height)).toBeGreaterThanOrEqual(44);

  await button.click();
  await expect(dialog).toBeVisible();
  await expect(button).toHaveAttribute('aria-expanded', 'true');
  await expect(dialog.getByRole('link', { name: 'O que criamos' })).toBeFocused();
  await expect(page.locator('html')).toHaveCSS('overflow', 'hidden');

  // Tab e Shift+Tab circulam dentro do painel.
  const focusInside = () => page.evaluate(() => document.getElementById('menu-mobile')!.contains(document.activeElement));
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press('Tab');
    expect(await focusInside()).toBe(true);
  }
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press('Shift+Tab');
    expect(await focusInside()).toBe(true);
  }
  // Alvos de toque ≥ 44px.
  for (const target of await dialog.locator('a, button').all()) {
    expect((await target.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  }

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(button).toBeFocused();
  await expect(button).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('html')).not.toHaveCSS('overflow', 'hidden');

  // O botão "Fechar" também devolve o foco.
  await button.click();
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Fechar' }).click();
  await expect(dialog).toBeHidden();
  await expect(button).toBeFocused();
});

test('teclado: skip link, foco visível em todo elemento interativo e ordem das seções', async ({ page, isMobile }) => {
  test.skip(isMobile, 'navegação por Tab: projeto desktop');
  await openWithSequence(page);

  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Pular para o conteúdo' });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport({ ratio: 1 });
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();

  // Página nova: percorre tudo com Tab desde o início do documento.
  await openWithSequence(page);

  const order = ['header', 'inicio', 'o-que-criamos', 'como-funciona', 'produtos', 'orcamento', 'footer'];
  const visited: string[] = [];
  for (let i = 0; i < 80; i++) {
    await page.keyboard.press('Tab');
    const focus = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || el === document.body) return null;
      const style = getComputedStyle(el);
      const region = el.closest('header') ? 'header' : el.closest('footer') ? 'footer' : (el.closest('section')?.id ?? '?');
      return {
        label: `${el.tagName} "${(el.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 50)}"`,
        region,
        outline: style.outlineStyle,
        width: Number.parseFloat(style.outlineWidth),
      };
    });
    if (!focus) break;
    if (focus.label.includes('Pular para o conteúdo')) continue;
    expect(focus.outline, focus.label).not.toBe('none');
    expect(focus.width, focus.label).toBeGreaterThanOrEqual(2);
    if (visited.at(-1) !== focus.region) visited.push(focus.region);
  }
  // Cada região aparece uma vez, na ordem visual (como-funciona não tem interativos).
  expect(visited).toEqual(order.filter((region) => region !== 'como-funciona'));
});
