import { expect, test, type Page } from '@playwright/test';

const PATH = '/cinematografico/';

/** Texto do contador visível ("01 / 04"…). */
async function visibleCounter(page: Page) {
  return page.locator('[data-count]').evaluateAll((els) => {
    const shown = els.find((el) => {
      const s = getComputedStyle(el);
      return s.visibility !== 'hidden' && Number(s.opacity) > 0.5;
    });
    return shown?.textContent ?? null;
  });
}

/** Quantas linhas do título estão dentro da sua máscara (visíveis). */
async function visibleTitleLines(page: Page) {
  return page.locator('[data-line]').evaluateAll((lines) =>
    lines.filter((line) => {
      const mask = line.parentElement!.getBoundingClientRect();
      const box = line.getBoundingClientRect();
      return box.top >= mask.top - 2 && box.bottom <= mask.bottom + 2;
    }).length,
  );
}

async function scrollStory(page: Page, fraction: number) {
  const vh = page.viewportSize()!.height;
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(vh * 3 * fraction));
  await page.waitForTimeout(1300); // scrub suavizado
}

test.describe('história fixada na tela (proposta 05)', () => {
  test('a rolagem avança contador, fotos, título e progresso — e volta ao subir', async ({ page }) => {
    await page.goto(PATH);
    await page.waitForLoadState('networkidle');
    expect(await visibleCounter(page)).toBe('01 / 04');
    expect(await visibleTitleLines(page)).toBe(1);
    const headerHeight = await page.locator('header').evaluate((el) => el.getBoundingClientRect().height);
    const stageTop = () => page.locator('[data-stage]').evaluate((el) => el.getBoundingClientRect().top);
    expect(Math.abs((await stageTop()) - headerHeight)).toBeLessThan(2);

    await scrollStory(page, 0.5);
    expect(await visibleCounter(page)).toMatch(/0[23] \/ 04/);
    // o palco continua fixo no mesmo lugar enquanto a história avança
    expect(Math.abs((await stageTop()) - headerHeight)).toBeLessThan(2);

    await scrollStory(page, 1);
    expect(await visibleCounter(page)).toBe('04 / 04');
    expect(await visibleTitleLines(page)).toBe(3);
    await expect(page.locator('[data-support]')).toBeVisible();
    const lastPhoto = await page.locator('[data-photo="3"]').evaluate((el) => getComputedStyle(el).clipPath);
    expect(lastPhoto).toMatch(/inset\(0(px|%)?\)|inset\(0% 0% 0% 0%\)|none/);
    const dashes = await page.locator('[data-dash]').evaluateAll((els) =>
      els.map((el) => new DOMMatrix(getComputedStyle(el).transform).a),
    );
    expect(dashes.every((scale) => scale > 0.95)).toBe(true);

    await scrollStory(page, 0);
    expect(await visibleCounter(page)).toBe('01 / 04');
    expect(await visibleTitleLines(page)).toBe(1);
  });

  test('sem movimento: sem pin, título completo e as 4 fotos visíveis', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto(PATH);
    await expect(page.locator('h1')).toHaveText('Quando a sua marca ganha forma.');
    expect(await visibleTitleLines(page)).toBe(3);
    await expect(page.locator('[data-support]')).toBeVisible();
    await expect(page.locator('#inicio img')).toHaveCount(4);
    for (const img of await page.locator('#inicio img').all()) await expect(img).toBeVisible();
    expect(await page.locator('.pin-spacer').count()).toBe(0);
    await context.close();
  });
});
